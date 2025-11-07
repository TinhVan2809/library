import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Image from './Image'; // Sử dụng component Image để xử lý ảnh
import './cssuser/SeriesPage.css'; // File CSS mới cho trang này

function SeriesPage() {
    const [seriesList, setSeriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeriesData = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getSeriesWithBooks');
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    setSeriesList(result.data || []);
                } else {
                    throw new Error(result.message || 'Không thể tải dữ liệu bộ sách.');
                }
            } catch (err) {
                setError(err.message);
                console.error("Lỗi khi tải dữ liệu bộ sách:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeriesData();
    }, []);

    if (loading) {
        return (
            <>
                <div class="loader-series">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                </div>

            </>
        );
    }

    if (error) {
        return <p className="series-status error">Lỗi khi fetch bộ sách: {error}</p>;
    }

    if (seriesList.length === 0) {
        return <p className="series-status">Hiện chưa có bộ sách nào.</p>;
    }

    return (
        <>
        <div className="search-container">
            <input type="text" 
                    placeholder='Tìm kiếm bộ sách...'/>
        </div>
        <div className="series-page-container">
            {seriesList.map(series => (
                <section key={series.SeriesID} className="series-section">
                    <h2>{series.SeriesName}</h2>
                    <div className="series-books-grid">
                        {series.books.map(book => (
                            <div 
                                key={book.BooksID} 
                                className="series-book-card" 
                                onClick={() => navigate(`/book/${book.BooksID}`)}
                                title={book.Title}
                            >
                                <div className="series-book-image-wrapper">
                                    <Image 
                                        src={book.ImageUrl} 
                                        alt={book.Title} 
                                        className="series-book-image"
                                        loading="lazy"
                                    />
                                </div>
                                <p className="series-book-title">{book.Title}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    </>
    );
}

export default SeriesPage;