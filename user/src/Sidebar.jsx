

import { useState, useEffect, useRef } from 'react';
import Image from './Image';

function HandleSidebar() {
    const STORAGE_HIDDEN = 'hiddenAds_v1';
    const STORAGE_COLLAPSED = 'sidebarCollapsed_v1';

    const defaultAds = [
        {
            id: 1,
            image: 'https://cdn.create.microsoft.com/catalog-assets/en-us/ceb71121-6f7a-4685-a213-83ef7413342d/thumbnails/516/stop-bullying-awareness-poster-red-modern-bold-0-1-635b5f4200ae.webp',
            title: 'Ưu đãi đặc biệt',
            desc: 'Giảm 20% cho lần mượn đầu tiên.',
            link: 'https://example.com/deal'
        },
        {
            id: 2,
            image: 'https://static.unica.vn/media/imagesck/1604907622_thiet-ke-poster-online-7.jpg?v=1604907622',
            title: 'Sự kiện đọc sách',
            desc: 'Tham gia buổi giới thiệu sách miễn phí.',
            link: 'https://example.com/event'
        },
        {
            id: 3,
            image: 'https://d1csarkz8obe9u.cloudfront.net/themedlandingpages/tlp_hero_poster-maker-7bde0bc953786a062bbd5b6dacedf5b8.jpg',
            title: 'Tài trợ',
            desc: 'Tài trợ bởi Nhà sách ABC.',
            link: 'https://example.com/sponsor'
        }
    ];

    const [hiddenAds, setHiddenAds] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_HIDDEN);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_COLLAPSED) === '1';
        } catch {
            return false;
        }
    });

    const [ads, setAds] = useState(defaultAds);
    const [loading, setLoading] = useState(false);

    // Carousel state
    const [index, setIndex] = useState(0);
    const [isHover, setIsHover] = useState(false);
    const rotateRef = useRef(null);



    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_HIDDEN, JSON.stringify(hiddenAds));
        } catch (e) {
            console.warn('Cannot persist hiddenAds', e);
        }
    }, [hiddenAds]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_COLLAPSED, collapsed ? '1' : '0');
        } catch (e) {
            console.warn('Cannot persist collapsed', e);
        }
    }, [collapsed]);

    const hideAd = (id) => {
        setHiddenAds(prev => Array.from(new Set([...prev, id])));
    };

    const restoreAll = () => {
        setHiddenAds([]);
    };

    // Determine visible ads (from fetched ads or default)
    const visibleAds = (ads || defaultAds).filter(a => !hiddenAds.includes(a.id));

    // Fetch ads from an API (try multiple candidate URLs)
    useEffect(() => {
        const ADS_API_CANDIDATES = ['/api/ads', 'http://localhost:3000/api/ads', 'http://localhost:4000/api/ads'];
        let mounted = true;
        const controller = new AbortController();

        const tryFetch = async () => {
            setLoading(true);
            for (const url of ADS_API_CANDIDATES) {
                try {
                    const res = await fetch(url, { signal: controller.signal });
                    if (!res.ok) continue;
                    const data = await res.json();
                    // Expecting array of ads
                    if (Array.isArray(data) && mounted) {
                        setAds(data.map((d, i) => ({ id: d.id ?? i+1, image: d.image ?? d.img ?? d.src ?? d.url, title: d.title ?? d.name ?? '', desc: d.desc ?? d.description ?? '', link: d.link ?? d.url ?? '#' } )));
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    if (e.name === 'AbortError') return;
                    // try next
                }
            }
            // none succeeded -> keep defaults
            if (mounted) setLoading(false);
        };

        tryFetch();

        return () => { mounted = false; controller.abort(); };
    }, []);

    // Adjust index when visibleAds length changes (e.g., when hiding an ad)
    useEffect(() => {
        if (visibleAds.length === 0) {
            setIndex(0);
            return;
        }
        setIndex(prev => prev % visibleAds.length);
    }, [visibleAds.length]);

    // Carousel auto-rotate
    useEffect(() => {
        // Only rotate when more than 1 ad, not hovered, and not collapsed
        if (collapsed || isHover || visibleAds.length <= 1) return;
        rotateRef.current = setInterval(() => {
            setIndex(i => (i + 1) % visibleAds.length);
        }, 4000);

        return () => clearInterval(rotateRef.current);
    }, [collapsed, isHover, visibleAds.length]);

    return (
        <aside className={`ad-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="ad-sidebar-header">
                <div className="ad-controls">
                    <button className="btn-small" onClick={() => setCollapsed(s => !s)} aria-label="Thu/Thả sidebar">
                        {collapsed ? <i className="ri-arrow-right-s-line"></i> : <i className="ri-arrow-left-s-line"></i>}
                    </button>
                    <button className="btn-small" onClick={restoreAll} title="Hiện lại tất cả quảng cáo"><i className="ri-reset-left-line"></i></button>
                </div>
            </div>

            {!collapsed && (
                <div className="ad-list">
                    {loading ? (
                        <div className="ad-empty">Đang tải quảng cáo...</div>
                    ) : visibleAds.length === 0 ? (
                        <div className="ad-empty">Bạn đã ẩn hết quảng cáo.</div>
                    ) : (
                        <div className="ad-carousel" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                            {/* Single visible card */}
                            {visibleAds.length > 0 && (() => {
                                const ad = visibleAds[index % visibleAds.length];
                                return (
                                    <div className="ad-card" key={ad.id}>
                                        <button className="ad-close" onClick={() => hideAd(ad.id)} aria-label="Đóng quảng cáo">×</button>
                                                <a
                                                    href={ad.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="ad-link"
                                                    onClick={() => {
                                                        // Send lightweight analytics then proceed to open
                                                        try {
                                                            const payload = JSON.stringify({ adId: ad.id, time: Date.now(), page: window.location.pathname });
                                                            // prefer sendBeacon for non-blocking tracking
                                                            if (navigator.sendBeacon) {
                                                                navigator.sendBeacon('/api/ads/click', new Blob([payload], { type: 'application/json' }));
                                                            } else {
                                                                // fallback: fire-and-forget fetch with keepalive if supported
                                                                fetch('/api/ads/click', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(()=>{});
                                                            }
                                                        } catch {
                                                            // swallow errors to avoid breaking navigation
                                                        }
                                                    }}
                                                >
                                                    <div className="ad-image">
                                                        <Image src={ad.image} alt={ad.title} loading="lazy" />
                                                    </div>
                                            <div className="ad-body">
                                                <h4 className="ad-title">{ad.title}</h4>
                                                <p className="ad-desc">{ad.desc}</p>
                                                <span className="ad-cta">Tìm hiểu</span>
                                            </div>
                                        </a>
                                    </div>
                                );
                            })()}

                            {/* Controls */}
                            {visibleAds.length > 1 && (
                                <div className="ad-controls-bottom">
                                    <button className="ad-nav" onClick={() => setIndex(i => (i - 1 + visibleAds.length) % visibleAds.length)} aria-label="Trước">‹</button>
                                    <div className="ad-indicators">
                                        {visibleAds.map((_, i) => (
                                            <button key={i} className={`dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} aria-label={`Slide ${i+1}`}></button>
                                        ))}
                                    </div>
                                    <button className="ad-nav" onClick={() => setIndex(i => (i + 1) % visibleAds.length)} aria-label="Sau">›</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}

export default HandleSidebar;