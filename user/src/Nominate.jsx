import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from './Image'; // Sử dụng lại component Image

function Nominate() {
    const [topBooks, setTopBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost/Library/Connection/actions/actionForBookLoans.php?action=getFullMostBookLoan');
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setTopBooks(data.data);
                } else {
                    throw new Error(data.message || 'Không thể tải danh sách đề cử.');
                }
            } catch (err) {
                console.error("Lỗi khi tải danh sách đề cử:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopBooks();
    }, []);

    if (loading) {
        return <div className="nominate-status">Đang tải danh sách đề cử...</div>;
    }

    if (error) {
        return <div className="nominate-status error">Lỗi: {error}</div>;
    }

    return (
        <>
       
        <div className="header-nominate-container">
            <div className="header-overlay"></div>
            <div className="header-content">
                <h1>Library Netword</h1>
                <p>Khám phá những cuốn sách được mượn nhiều nhất tại thư viện của chúng tôi.</p>
                <button>Tìm hiểu thêm</button>
            </div>
        </div>
    
        <div className="nominate-container">
            
            {topBooks.length > 0 ? (
                <div className="nominate-list">
                    {topBooks.map((book, index) => (
                        <div key={book.BooksID} className={`nominate-card ${index < 3 ? `rank-${index + 1}` : ''}`}>
                            <div className="nominate-card-inner">
                                {/* Mặt trước của thẻ */}
                                <div className="nominate-card-front">
                                    <span className="rank-badge">#{index + 1}</span>
                                    <Image src={book.ImageUrl} alt={book.Title} className="nominate-card-image" loading="lazy" />
                                </div>
                                {/* Mặt sau của thẻ */}
                                <div className="nominate-card-back">
                                    <div className="nominate-card-info">
                                        <h4>{book.Title}</h4>
                                        <p>Lượt mượn: {book.LoanCount}</p>
                                        <Link to={`/book/${book.BooksID}`} className="btn-view-detail">
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Chưa có dữ liệu để hiển thị.</p>
            )}
        </div>

         </>
    );

}

export default Nominate;