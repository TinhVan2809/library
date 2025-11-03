import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Slider from 'react-slick'; // Import Slider
import Swal from 'sweetalert2';
import { useAuth } from './AuthContext';
import ReviewItem from './ReviewItem';

// Import CSS cho react-slick
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function BookDetail() {
    const { bookId } = useParams();
    const { user } = useAuth(); // Lấy thông tin người dùng từ context
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState(null); // State mới để quản lý ảnh chính
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [error, setError] = useState(null);
    const [borrowMessage, setBorrowMessage] = useState(''); // State cho thông báo mượn sách
    const [addToListMessage, setAddToListMessage] = useState(''); // State cho thông báo thêm vào tủ

    const [seriesBookList, setSeriesBookList] = useState([]); // State cho sách cùng bộ

    // State cho phần đánh giá
    const [rating, setRating] = useState(0); // 0 = chưa đánh giá
    const [comment, setComment] = useState('');
    const [reviewMessage, setReviewMessage] = useState('');
    const [reviews, setReviews] = useState([]); // State mới để lưu danh sách review

    //State cho Danh sách sách theo tác giả
    const [authorBooks, setAuthorBooks] = useState([]);

    // State cho chức năng yêu thích
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);

    // Hàm trợ giúp để tạo URL tuyệt đối cho hình ảnh
    const getFullImageUrl = (path) => {
        const SERVER_BASE = 'http://localhost/Library/';
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path; // Đã là URL tuyệt đối
        return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
    };

       // Cài đặt chung cho các slideshow
    const relatedSliderSettings = {
        dots: true,
        infinite: false, // Đặt là false nếu số lượng sách ít hơn slidesToShow
        speed: 500,
        slidesToShow: 6, // Hiển thị 5 sách
        slidesToScroll: 5,
        autoplay: true,
        autoplaySpeed: 4000,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 3, slidesToScroll: 3 }
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 2, slidesToScroll: 2 }
            }
        ]
    };


    // Hàm fetch danh sách review
    const fetchReviews = async (currentBookId) => {
        try {
            const reviewResponse = await fetch(`http://localhost/Library/Connection/actions/actionForReview.php?action=getReviewsByBookId&BooksID=${currentBookId}`);
            const reviewResult = await reviewResponse.json();
            if (reviewResult.success && Array.isArray(reviewResult.data)) {
                setReviews(reviewResult.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách đánh giá:", err);
        }
    };

    useEffect(() => {
        // Đặt hàm fetch bên trong useEffect để nó chỉ được tạo lại khi bookId thay đổi.
        const fetchBookAndRelated = async () => {
            setLoading(true);
            setRelatedBooks([]); // Reset sách liên quan khi tải sách mới
            setReviews([]); // Reset danh sách review
            setMainImage(null); // Reset ảnh chính
            setError(null); // Reset lỗi
            try {
                const response = await fetch(`http://localhost/Library/Connection/actions/actionForBooks.php?action=getBookById&BooksID=${bookId}`); 
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP ${response.status}: Không thể tải dữ liệu sách.`);
                }
                const result = await response.json();

                // --- KIỂM TRA KỸ HƠN ---
                // Nếu API trả về success: false hoặc không có dữ liệu, coi như lỗi.
                if (!result || result.success === false || !result.data) {
                    throw new Error(result?.message || 'Không tìm thấy sách hoặc có lỗi từ server.');
                } else {
                    const mainBookData = result.data;
                    // Chuẩn hóa URL hình ảnh
                    mainBookData.ImageUrl = getFullImageUrl(mainBookData.ImageUrl);
                    if (Array.isArray(mainBookData.supplementaryImages)) {
                        mainBookData.supplementaryImages = mainBookData.supplementaryImages.map(src => getFullImageUrl(src));
                    }
                    setBook(mainBookData);
                    setMainImage(mainBookData.ImageUrl); // Thiết lập ảnh bìa làm ảnh chính mặc định

                    // Fetch danh sách review cho sách này
                    fetchReviews(bookId);

                    // --- Fetch sách liên quan NGAY SAU KHI có chi tiết sách chính ---
                    // API getBookById phải trả về CategoryID để đoạn code này hoạt động.
                    if (mainBookData.CategoryID) {
                        const relatedResponse = await fetch(`http://localhost/Library/Connection/actions/actionForBooks.php?action=getBooks&categoryId=${mainBookData.CategoryID}`);
                        const relatedResult = await relatedResponse.json();
                        if (relatedResult.success && Array.isArray(relatedResult.data)) {
                            // Lọc bỏ sách hiện tại và chỉ lấy 4 sách liên quan
                            const filteredBooks = relatedResult.data
                                .filter(relatedBook => relatedBook.BooksID !== bookId)
                                .slice(0, 5)
                                // Đảm bảo URL ảnh của sách liên quan cũng được chuẩn hóa
                                .map(b => ({ ...b, ImageUrl: getFullImageUrl(b.ImageUrl) })); 
                            setRelatedBooks(filteredBooks);
                        }
                    }

                    // --- Fetch sách cùng tác giả ---
                    if (mainBookData.AuthorID) {
                        const authorBooksResponse = await fetch(`http://localhost/Library/Connection/actions/actionForAuthors.php?action=getBooksByAuthor&AuthorID=${mainBookData.AuthorID}&currentBookID=${bookId}`);
                        const authorBooksResult = await authorBooksResponse.json();
                        if (authorBooksResult.success && Array.isArray(authorBooksResult.data)) {
                            // Chuẩn hóa URL ảnh cho sách cùng tác giả
                            const normalizedAuthorBooks = authorBooksResult.data.map(b => ({
                                ...b, ImageUrl: getFullImageUrl(b.ImageUrl)
                            }));
                            setAuthorBooks(normalizedAuthorBooks);
                        }
                    }

                    // --- Fetch sách cùng bộ ---
                    if (mainBookData.SeriesID) {
                        const seriesBooksResponse = await fetch(`http://localhost/Library/Connection/actions/actionForBooks.php?action=getBooksBySeriesId&SeriesID=${mainBookData.SeriesID}&currentBookID=${bookId}`);
                        const seriesBooksResult = await seriesBooksResponse.json();
                        if (seriesBooksResult.success && Array.isArray(seriesBooksResult.data)) {
                            // Chuẩn hóa URL ảnh cho sách cùng bộ
                            const normalizedSeriesBooks = seriesBooksResult.data.map(b => ({
                                ...b, ImageUrl: getFullImageUrl(b.ImageUrl)
                            }));
                            setSeriesBookList(normalizedSeriesBooks);
                        } else {
                            setSeriesBookList([]); // Đảm bảo reset nếu không có dữ liệu
                        }
                    }

                    // --- Fetch trạng thái yêu thích ---
                    // Chỉ fetch nếu người dùng đã đăng nhập để lấy is_favorited
                    const favoriteStatusUrl = `http://localhost/Library/Connection/actions/actionForFavorites.php?action=getFavoriteStatus&BooksID=${bookId}${user ? `&StudentID=${user.StudentID}` : ''}`;
                    const favoriteStatusResponse = await fetch(favoriteStatusUrl);
                    const favoriteStatusResult = await favoriteStatusResponse.json();
                    if (favoriteStatusResult.success) {
                        setIsFavorited(favoriteStatusResult.is_favorited);
                        setFavoriteCount(favoriteStatusResult.total_favorites);
                    }
                }
            } catch (err) {
                console.error('Lỗi khi lấy chi tiết sách:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookAndRelated();
    }, [bookId]); // Chạy lại effect khi bookId thay đổi

    const handleBorrowRequest = async () => {
        if (!user) {
            Swal.fire({
                position: "top-end",
                icon: "info",
                title: " Bạn cần đăng nhập",
                showConfirmButton: false,
                timer: 1000,
                heightAuto: false, 
                backdrop: false 
                });
            return;
        }

        if (book.StockQuantity <= 0) {
            setBorrowMessage('Sách đã hết hàng, không thể mượn.');
            return;
        }

        const result = await Swal.fire({
            title: 'Xác nhận mượn sách',
            text: `Bạn có chắc chắn muốn mượn cuốn sách "${book.Title}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            heightAuto: false, 
            backdrop: false 
        });

        if (result.isConfirmed) {
            setBorrowMessage('Đang gửi yêu cầu...');
        } else {
            return;
        }
        
        

        const postData = new FormData();
        postData.append('StudentID', user.StudentID);
        postData.append('BooksID', book.BooksID);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForBookLoanRQ.php?action=addBookLoanRequest', {
                method: 'POST',
                body: postData, 
            });
            const result = await response.json();
            setBorrowMessage(result.message);
        } catch (err) {
            console.error('Lỗi khi gửi yêu cầu mượn sách:', err);
            setBorrowMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleAddToList = async () => {
        if (!user) {
            Swal.fire({
                    position: "top-end",
                    icon: "info",
                    title: "Bạn cần đăng nhập",
                    showConfirmButton: false,
                    timer: 1000,
                    heightAuto: false, 
                    backdrop: false 
                });
            return;
        }

        setAddToListMessage('Đang thêm vào tủ...');

        const postData = new FormData();
        postData.append('StudentID', user.StudentID);
        postData.append('BooksID', book.BooksID);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForMyList.php?action=addToList', {
                method: 'POST',
                body: postData,
            });
            const result = await response.json();
            setAddToListMessage(result.message);
        } catch (err) {
            console.error('Lỗi khi thêm sách vào tủ:', err);
            setAddToListMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
                Swal.fire({
                    position: "top-end",
                    icon: "info",
                    title: "Bạn cần đăng nhập",
                    showConfirmButton: false,
                    timer: 1000,
                    heightAuto: false, 
                    backdrop: false 
                });
            return;
        }

        // Save the previous state for potential rollback
        const previousState = { isFavorited, favoriteCount };

        // Optimistically update the UI
        setIsFavorited(prevState => !prevState);
        setFavoriteCount(prevCount => previousState.isFavorited ? prevCount - 1 : prevCount + 1);

        const postData = new FormData();
        postData.append('StudentID', user.StudentID);
        postData.append('BooksID', book.BooksID);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForFavorites.php?action=toggleFavorite', {
                method: 'POST',
                body: postData,
            });

            const result = await response.json();

            if (!result.success) {
                // If the API call fails, revert the state and notify the user
                alert(result.message || 'Có lỗi xảy ra khi thực hiện thao tác.');
                setIsFavorited(previousState.isFavorited);
                setFavoriteCount(previousState.favoriteCount);
            } else {
                // Sync with the server's authoritative state to ensure consistency
                setIsFavorited(result.status === 'added');
                setFavoriteCount(result.new_favorite_count);
            }
        } catch (err) {
            console.error('Lỗi khi yêu thích sách:', err);
            // Revert state on network error and notify the user
            alert('Thao tác thất bại do lỗi mạng. Vui lòng thử lại.');
            setIsFavorited(previousState.isFavorited);
            setFavoriteCount(previousState.favoriteCount);
        }
    };

    if (loading) return <p className="book-detail-status">Đang tải chi tiết sách...</p>;
    if (error) return <p className="book-detail-status error">Lỗi: {error}</p>;
    if (!book) return <p className="book-detail-status">Không tìm thấy thông tin sách.</p>;

    const handleSubmitReview = async (event) => {
        event.preventDefault();
        setReviewMessage('');

        if (!user) {
            setReviewMessage('Bạn cần đăng nhập để gửi đánh giá.');
            return;
        }
        if (rating === 0) {
            setReviewMessage('Vui lòng chọn số sao đánh giá.');
            return;
        }

        const postData = new FormData();
        postData.append('StudentID', user.StudentID);
        postData.append('BooksID', book.BooksID);
        postData.append('Rating', rating);
        postData.append('Comment', comment);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForReview.php?action=addReview', {
                method: 'POST',
                body: postData,
            });

            const result = await response.json();
            setReviewMessage(result.message || 'Đã có lỗi xảy ra.');

            if (result.success) {
                // Reset form sau khi gửi thành công
                setRating(0);
                setComment('');
                // Tải lại danh sách review để hiển thị bình luận mới
                fetchReviews(book.BooksID);
            }
        } catch (err) {
            console.error('Lỗi khi gửi đánh giá:', err);
            setReviewMessage('Lỗi kết nối. Không thể gửi đánh giá.');
        }
    };

    return (
        <>
            <div className="book-detail-container">
                <div className="book-detail-images-column">
                    <div className="book-detail-image">
                        <img 
                            src={mainImage} 
                            alt={book.Title} 
                            title={book.Title} 
                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
                    </div>
                    {/* Khu vực hiển thị ảnh phụ */}
                    {Array.isArray(book.supplementaryImages) && book.supplementaryImages.length > 0 && (
                        <div className="supplementary-images-detail">
                            {/* Luôn hiển thị ảnh bìa gốc trong danh sách thumbnail */}
                            <img src={book.ImageUrl} alt="Ảnh bìa" onClick={() => setMainImage(book.ImageUrl)} className={mainImage === book.ImageUrl ? 'active' : ''} />
                            {book.supplementaryImages.map((src, idx) => (
                                <img 
                                    key={idx} src={src} alt={`Ảnh phụ ${idx + 1}`} 
                                    onClick={() => setMainImage(src)}
                                    className={mainImage === src ? 'active' : ''}
                                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="book-detail-info">
                    <h1>{book.Title}</h1>
                     {/* --- Phần hiển thị đánh giá trung bình --- */}
                    {book.review_count > 0 ? (
                        <div className="average-rating-display">
                            <div className="stars">
                                {[...Array(5)].map((_, index) => {
                                    const starValue = index + 1;
                                    if (starValue <= book.avg_rating) {
                                        return <i key={index} className="ri-star-fill"></i>; // Sao đầy
                                    } else if (starValue - 0.5 <= book.avg_rating) {
                                        return <i key={index} className="ri-star-half-fill"></i>; // Nửa sao
                                    } else {
                                        return <i key={index} className="ri-star-line"></i>; // Sao rỗng
                                    }
                                })}
                            </div>
                            <span className="rating-text">{parseFloat(book.avg_rating).toFixed(1)} trên 5</span>
                            <span className="review-count">({book.review_count} đánh giá)</span>
                        </div>
                    ) : null}
                    <p><strong>Tác giả:</strong> {book.AuthorName || 'Đang cập nhật'}</p>
                    <p><strong>Thể loại:</strong> {book.CategoryName || 'Đang cập nhật'}</p>
                    <p><strong>Nhà xuất bản:</strong> {book.PublisherName || 'Đang cập nhật'}</p>
                    <p><strong>Năm xuất bản:</strong> {book.PublisherYears ? new Date(book.PublisherYears).getFullYear() : 'Đang cập nhật'}</p>
                    <p><strong>Số lượng còn lại:</strong> <span className={book.StockQuantity <= 0 ? 'stock-out' : ''}>{book.StockQuantity > 0 ? book.StockQuantity : 'Hết hàng'}</span></p>
                    <div className="book-detail-description">
                        <h3>Mô tả</h3>
                        <p>{book.Description || 'Chưa có mô tả cho cuốn sách này.'}</p>
                    </div>
                    <div className="book-detail-actions">
                        <button className="btn-borrow" onClick={handleBorrowRequest} disabled={book.StockQuantity <= 0} title='Gửi một yêu cầu mượn sách'>Mượn sách</button>

                                <button type="button" className='btn-add-list' onClick={handleAddToList} title='Thêm vào tủ sách' strokeLinejoin="round" strokeLinecap="round">
                                    <span className="button__text">Thêm vào tủ</span>
                                    <span className="button__icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" height="24" fill="none" className="svg"><line y2="19" y1="5" x2="12" x1="12"></line><line y2="12" y1="12" x2="19" x1="5"></line></svg></span>
                                </button>

                        {/* <button className="btn-contact">Liên hệ</button> */}
                        <button className='btn-pdf'>Đọc PDF</button>

                       
                            <div className="button-dowload" data-tooltip="Size: 20Mb">
                            <div className="button-wrapper">
                            <div className="text">Download</div>
                                <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2em" height="2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
                                </span>
                            </div>
                            </div>

                            <div className="like-button">
                                {/* Thay đổi input để được kiểm soát bởi React */}
                                <input 
                                    className="on" id="heart" type="checkbox" 
                                    checked={isFavorited}
                                    onChange={handleToggleFavorite} // Sử dụng onChange thay vì onClick trên label
                                />
                                <label className="like" htmlFor="heart">
                                    <svg className="like-icon"
                                        fillRule="nonzero"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        >
                                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"></path>
                                    </svg>
                                    <span className="like-text">Likes</span>
                                </label>
                                {/* Cập nhật số lượt thích từ state */}
                                <span className="like-count one">{favoriteCount}</span>
                                <span className="like-count two">{isFavorited ? favoriteCount : favoriteCount + 1}</span>
                            </div>

                    </div>
                {/* Hiển thị thông báo */}
                {borrowMessage && <p className="borrow-request-message">{borrowMessage}</p>}
                {addToListMessage && <p className="borrow-request-message">{addToListMessage}</p>}
                </div>
            </div>

            {/* --- Phần sách liên quan --- */}
            {relatedBooks.length > 0 && (
                <div className="related-books-section" >
                    <button className="cta">
                        <span>Cùng thể loại</span>
                        <svg width="15px" height="10px" viewBox="0 0 13 10">
                            <path d="M1,5 L11,5"></path>
                            <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                    </button>
                      {/* Thay thế div bằng Slider */}
                    <Slider {...relatedSliderSettings} infinite={relatedBooks.length > relatedSliderSettings.slidesToShow}>
                        {relatedBooks.map((relatedBook) => (
                              // Thêm một div wrapper cho mỗi slide để có padding
                            <div key={relatedBook.BooksID} className="slide-item-wrapper">
                                <div className="card">
                                    <Link to={`/book/${relatedBook.BooksID}`} className="img-wrap">
                                        <img 
                                            src={relatedBook.ImageUrl} 
                                            alt={relatedBook.Title} 
                                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                        />
                                    </Link>
                                    <div className="card-body"><h4 className="card-title">{relatedBook.Title}</h4></div>
                                </div>
                            </div>
                        ))}
                     </Slider>
                </div>
            )}

            {/* sách cùng tác giả */}
            {authorBooks.length > 0 && (
                <div className="related-books-section" >
                    <button className="cta">
                        <span>Cùng tác giả</span>
                        <svg width="15px" height="10px" viewBox="0 0 13 10">
                            <path d="M1,5 L11,5"></path>
                            <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                    </button>
                     <Slider {...relatedSliderSettings} infinite={authorBooks.length > relatedSliderSettings.slidesToShow}>
                        {authorBooks.map((authorBook) => (
                            <div key={authorBook.BooksID} className="slide-item-wrapper">
                                <div className="card">
                                    <Link to={`/book/${authorBook.BooksID}`} className="img-wrap">
                                        <img 
                                            src={authorBook.ImageUrl} 
                                            alt={authorBook.Title} 
                                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                        />
                                    </Link>
                                    <div className="card-body"><h4 className="card-title">{authorBook.Title}</h4></div>
                                </div>
                            </div>
                        ))}
                     </Slider>
                </div>
            )}

            {/* {Sách cùng bộ} */}
            {seriesBookList.length > 0 && (
                <div className="related-books-section" >
                    <button className="cta">
                        <span>Trọn bộ {book.SeriesName}</span>
                        <svg width="15px" height="10px" viewBox="0 0 13 10">
                            <path d="M1,5 L11,5"></path>
                            <polyline points="8 1 12 5 8 9"></polyline>
                        </svg>
                    </button>
                     <Slider {...relatedSliderSettings} infinite={seriesBookList.length > relatedSliderSettings.slidesToShow}>
                        {seriesBookList.map((seriesBook) => (
                             <div key={seriesBook.BooksID} className="slide-item-wrapper">
                                <div className="card">
                                    <Link to={`/book/${seriesBook.BooksID}`} className="img-wrap">
                                        <img 
                                            src={seriesBook.ImageUrl} 
                                            alt={seriesBook.Title} 
                                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                        />
                                    </Link>
                                    <div className="card-body"><h4 className="card-title">{seriesBook.Title}</h4></div>
                                </div>
                            </div>
                        ))}
                     </Slider>
                </div>
            )}



            {/* {Phần đánh giá của đọc giả} */}
            <div className="review-container">
                <div className="review-textarea">
                    <div className="rating-start">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                                key={star} 
                                className={star <= rating ? 'active' : ''}
                                onClick={() => setRating(star)}
                            >
                                ☆
                            </span>
                        ))}
                    </div>
                    <form onSubmit={handleSubmitReview}>
                        <textarea name="comment" placeholder='Nhập nhận xét của bạn' value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                        <button type='submit'><i className="ri-send-plane-line"></i></button>
                    </form>
                    {reviewMessage && <p className="review-message">{reviewMessage}</p>}
                </div>
                <div className="review-list">
                    {reviews.length > 0 ? (
                           reviews.map(review => ( 
                            <ReviewItem
                                key={review.ReviewID}
                                review={review}
                                bookId={book.BooksID}
                                onReviewAdded={() => fetchReviews(book.BooksID)} 
                            />
                        )) 
                    ) : (
                        <p>Chưa có đánh giá nào cho cuốn sách này. Hãy là người đầu tiên!</p>
                    )}
                </div>
            </div>
        </>
    )
}

export default BookDetail;