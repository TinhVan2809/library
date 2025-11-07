import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick'; // Import Slider

// Import CSS cho react-slick
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import Image from './Image'; // Import component Image mới

// Component Modal đơn giản
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <i className="ri-close-line"></i>
        </button>
        {children}
      </div>
    </div>
  );
}



// Component phân trang
function Pagination({ currentPage, totalPages, onPageChange, pageNeighbours = 1 }) {
  if (totalPages <= 1) {
    return null;
  }

  const range = (from, to, step = 1) => {
    let i = from;
    const range = [];
    while (i <= to) {
      range.push(i);
      i += step;
    }
    return range;
  };

  const fetchPageNumbers = () => {
    const totalNumbers = (pageNeighbours * 2) + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
      let pages = range(startPage, endPage);

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = (totalPages - endPage) > 1;
      const spillOffset = totalNumbers - (pages.length + 1);

      if (hasLeftSpill && !hasRightSpill) {
        const extraPages = range(startPage - spillOffset, startPage - 1);
        pages = ["...", ...extraPages, ...pages];
      } else if (!hasLeftSpill && hasRightSpill) {
        const extraPages = range(endPage + 1, endPage + spillOffset);
        pages = [...pages, ...extraPages, "..."];
      } else {
        pages = ["...", ...pages, "..."];
      }
      return [1, ...pages, totalPages];
    }
    return range(1, totalPages);
  }

  const pages = fetchPageNumbers();

  return (
    <div className="pagination-controls">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>
      {pages.map((page, index) => {
        if (page === "...") {
          return <span key={index} className="pagination-dots">...</span>;
        }
        return (
          <button key={index} onClick={() => onPageChange(page)} className={currentPage === page ? 'active' : ''} disabled={currentPage === page}>
            {page}
          </button>
        );
      })}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>&raquo;</button>
    </div>
  );
}

function BookList() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [booksAll, setBooksAll] = useState([]);
  const [authors, setAuthors] = useState([]); // eslint-disable-line
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);// eslint-disable-line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [mainImage, setMainImage] = useState(null); // State cho ảnh chính trong modal
  const [favorties, setFavorties] = useState([]);
  const [bookloanSilde, setBookloanSlide ] = useState([]);

  const [mostbookloan, setmostbookloan] = useState([]); // State cho bảng xếp hạng sách
  const [seriesWithBooks, setSeriesWithBooks] = useState([]); // State mới cho sách bộ

  const [lowStockBooks, setLowStockBooks] = useState([]);
//   const [editingBook, setEditingBook] = useState(null);

  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  // State mới cho live search
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // State để lọc theo thể loại
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const booksPerPage = 36; // Số lượng sách mỗi trang
  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    }, 500); // Đợi 500ms sau khi người dùng ngừng gõ

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // useEffect mới cho live search
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setLiveSearchResults([]);
      setShowResults(false);
      return;
    }

    const fetchLiveSearch = async () => {
      setIsSearching(true);
      try {
        // Gọi API với limit nhỏ để lấy gợi ý
        const response = await fetch(`http://localhost/Library/Connection/actions/actionForBooks.php?action=getBooks&page=1&limit=7&search=${encodeURIComponent(debouncedSearchTerm)}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setLiveSearchResults(result.data);
        } else {
          setLiveSearchResults([]);
        }
      } catch (error) {
        console.error("Lỗi live search:", error);
        setLiveSearchResults([]);
      } finally {
        setIsSearching(false);
        setShowResults(true); // Hiển thị kết quả sau khi fetch xong
      }
    };

    fetchLiveSearch();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    let mounted = true;

    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        
        // "live search".
        let booksApiUrl = `http://localhost/Library/Connection/actions/actionForBooks.php?action=getBooks&page=${currentPage}&limit=${booksPerPage}`;
        if (selectedCategoryId) {
          booksApiUrl += `&categoryId=${selectedCategoryId}`;
        }

        const [booksRes, authorsRes, categoriesRes, publishersRes, mostbookloanRes, seriesRes, lowStockBooksRes, booksallRes, favortiesRes, bookloanSildeRes] = await Promise.all([ // Cập nhật API để hỗ trợ phân trang
          fetch(booksApiUrl),
          fetch('http://localhost/Library/Connection/actions/actionForAuthors.php?action=GetAuthors'),
          fetch('http://localhost/Library/Connection/actions/actionForCategories.php?action=getCategory'),
          fetch('http://localhost/Library/Connection/actions/actionForPublishers.php?action=GetPublishers'),
          fetch('http://localhost/Library/Connection/actions/actionForBookLoans.php?action=getMostBookLoanForSlideShow'), 
          fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getSeriesWithBooks'), // Fetch dữ liệu bộ sách (series)
          fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getLowStockBooks'),  // lấy số lượng sách còn ít 
          fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getAllBooks'),
          fetch('http://localhost/Library/Connection/actions/actionForFavorites.php?action=getTopFavoritedBooks'),
          fetch('http://localhost/Library/Connection/actions/actionForBookloans.php?action=getBookLoanNearly')
        ]);

        // kiểm tra tất cả response trước khi parse
        if (!booksRes.ok) throw new Error(`Lỗi khi tải sách: ${booksRes.status}`);
        if (!authorsRes.ok) throw new Error(`Lỗi khi tải authors: ${authorsRes.status}`);
        if (!categoriesRes.ok) throw new Error(`Lỗi khi tải categories: ${categoriesRes.status}`);
        if (!publishersRes.ok) throw new Error(`Lỗi khi tải publishers: ${publishersRes.status}`);
        if (!mostbookloanRes.ok) throw new Error(`Lỗi khi lấy danh sách bảng xếp hạng: ${mostbookloanRes.status}`);
        if(!lowStockBooksRes.ok) throw new Error(`Lỗi khi lấy dánh sách sách còn ít: ${lowStockBooksRes.status}`);
        if(!seriesRes.ok) throw new Error(`Lỗi khi tải bộ sách: ${seriesRes.status}`);
        if(!booksallRes.ok) throw new Error(`Lỗi khi tải tất cả sách: ${booksallRes.status}`);
        if(!favortiesRes.ok) throw new Error(`Lỗi khi lấy danh sách yêu thích nhất: ${favortiesRes.status}`);
        if(!bookloanSildeRes.ok) throw new Error(`Lỗi khi lấy danh sách yêu thích nhất: ${bookloanSildeRes.status}`);

        const booksData = await booksRes.json();
        const authorsData = await authorsRes.json();
        const categoriesData = await categoriesRes.json();
        const publishersData = await publishersRes.json();
        const mostbookloanData = await mostbookloanRes.json();
        const lowstockbooksData = await lowStockBooksRes.json();
        const seriesData = await seriesRes.json();
        const booksallData = await booksallRes.json();
        const favorites = await favortiesRes.json();
        const bookloansildeData = await bookloanSildeRes.json();

        if (mounted) {
          if (booksData && booksData.success && Array.isArray(booksData.data)) {
            setBooks(booksData.data); // Không cần chuẩn hóa URL ở đây nữa
            setTotalPages(booksData.total_pages || 0); // Lấy tổng số trang từ API
          } else {
            setBooks([]); // fallback
            setTotalPages(0); // Reset totalPages khi không có dữ liệu
            if (booksData && booksData.message) console.warn('books:', booksData.message);
          }

          if (authorsData && authorsData.success && Array.isArray(authorsData.data)) {
            setAuthors(authorsData.data);
          } else {
            setAuthors([]);
            // Không cần reset totalPages ở đây vì nó liên quan đến books
            if (authorsData && authorsData.message) console.warn('authors:', authorsData.message);
          }

          if (categoriesData && categoriesData.success && Array.isArray(categoriesData.data)) {
            setCategories(categoriesData.data);
          } else {
            setCategories([]);
            // Không cần reset totalPages ở đây
            if (categoriesData && categoriesData.message) console.warn('categories:', categoriesData.message);
          }

          if (publishersData && publishersData.success && Array.isArray(publishersData.data)) {
            setPublishers(publishersData.data);
          } else {
            setPublishers([]);
            // Không cần reset totalPages ở đây
            if (publishersData && publishersData.message) console.warn('publishers:', publishersData.message);
          }

          if (mostbookloanData && mostbookloanData.success && Array.isArray(mostbookloanData.data)) {
            setmostbookloan(mostbookloanData.data);
          } else {
            setmostbookloan([]);
            if (mostbookloanData && mostbookloanData.message) console.warn('mostbookloan:', mostbookloanData.message);
          }

          if (lowstockbooksData && lowstockbooksData.success && Array.isArray(lowstockbooksData.data)) {
            setLowStockBooks(lowstockbooksData.data);
          } else {
            setLowStockBooks([]);
            if (lowstockbooksData && lowstockbooksData.message) console.warn('lowstockbooks:', lowstockbooksData.message);
          }

          if (seriesData && seriesData.success && Array.isArray(seriesData.data)) {
            setSeriesWithBooks(seriesData.data);
          } else {
            setSeriesWithBooks([]);
            if (seriesData && seriesData.message) console.warn('series:', seriesData.message);
          }

          if(booksallData && booksallData.success && Array.isArray(booksallData.data)) {
            setBooksAll(booksallData.data);
          } else {
            setBooksAll([]);
            if(booksallData && booksallData.message)  console.warn('booksall:', booksallData.message);
          }

          if(favorites && favorites.success && Array.isArray(favorites.data)) {
            setFavorties(favorites.data);
          } else {
            setFavorties([]);
            if(favorites && favorites.message)  console.warn('favorties:', favorites.message);
          }

          if(bookloansildeData && bookloansildeData.success && Array.isArray(bookloansildeData.data)) {
            setBookloanSlide(bookloansildeData.data);
          } else {
            setBookloanSlide([]);
            if(bookloansildeData && bookloansildeData.message)  console.warn('bookloan:', bookloansildeData.message);
          }

        }
      } catch (err) {
        if (mounted) {
          console.error('Lỗi khi lấy danh sách sách:', err);
          setError(err.message || 'Lỗi khi lấy dữ liệu');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBooks();

    return () => {
      mounted = false;
    };
  }, [currentPage, selectedCategoryId]); // Bỏ `debouncedSearchTerm` và `showResults` khỏi dependency array

  if (loading) return (
      <>

    <div className="loading-container">
      <img src="/tom_images-removebg-preview.png" alt="" />

      <div className="block-container">
        <div className="block"></div>
        <div className="block"></div>
        <div className="block"></div>
        <div className="block"></div>
      </div>
    </div>

      </>
    
  );

  const HandleRefresh = () => {
    window.location.reload();
  }

  if (error) return (

    <>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <img src="/meme-jerry-14-removebg-preview.png" style={{width: '200px'}}/>
           <div className="">
              <p>Error: {error}, please turn on your SQL OR MySQL</p>
              <p>Help: <a href="javaScript:void(0)" style={{textDecoration: 'none', color: '#000', fontWeight: '550'}}>Click here</a></p>
              <button onClick={HandleRefresh} style={{padding: '8px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#0E4EC4', color: '#FFF', marginTop: '1rem', cursor: 'pointer'}}>Refresh</button>
           </div>
      </div>
    </>

  );

  
  // Mở modal và set ảnh mặc định
  const openBookDetail = (book) => {
    // Chuẩn hóa URL ảnh phụ khi mở modal
    const normalizedBook = {
      ...book,
      supplementaryImages: Array.isArray(book.supplementaryImages) ? book.supplementaryImages : []
    };
    setSelectedBook(normalizedBook);
    setMainImage(normalizedBook.ImageUrl);
  };

  // Hàm xử lý khi người dùng chọn một thể loại
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); // Quay về trang 1 khi áp dụng bộ lọc mới
  };

  // Cài đặt cho slideshow
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6, // Hiển thị 6 sách cùng lúc
    slidesToScroll: 6,
    autoplay: true,
    autoplaySpeed: 3500, // Tự động chuyển slide sau 3.5 giây
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 6, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 3, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } }
    ]
  };

  // Cài đặt slide show cho sách sắp hết 
  const sliderSettingsForLowStock = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } }
    ]
  }

  // Cài đặt cho slideshow sách bộ
  const seriesSliderSettings = {
    ...sliderSettings, // Kế thừa cài đặt chung
    slidesToShow: 6,
    slidesToScroll: 3, 
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 6, slidesToScroll: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } }
    ]
  };

  // cài đặt cho slideshow sách được mượn gần đây
  const SliderBookLoanDesc = {
    ...sliderSettings,
    dots: false,
    slidesToShow: 8,
    slidesToScroll: 1,
     responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 10, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 6, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 3, slidesToScroll: 1 } }
    ]
  };



  return (
    <>

    {/* Thêm ô tìm kiếm và danh sách kết quả live search */}
     <div className="search-bar-container">
        <form onSubmit={(e) => e.preventDefault()}>
          <i className="ri-search-line search-icon"></i>
          <input 
            type="text" 
            placeholder="Nhập tựa đề, tác giả..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            onFocus={() => setShowResults(true)} // Hiển thị khi focus
            onBlur={() => setTimeout(() => setShowResults(false), 200)} // Ẩn sau 200ms để kịp xử lý click
            className="search-input" 
          />
        </form>
        {showResults && searchTerm && (
          <div className="live-search-results">
            {isSearching ? (
              <div className="live-search-item">Đang tìm...</div>
            ) : liveSearchResults.length > 0 ? (
              liveSearchResults.map(book => (
                <div 
                  key={book.BooksID} 
                  className="live-search-item" 
                  onClick={() => navigate(`/book/${book.BooksID}`)}
                >
                  <Image src={book.ImageUrl} alt={book.Title} className="live-search-image" />
                  <span className="live-search-title">{book.Title}</span>
                </div>
              ))
            ) : (
              <div className="live-search-item">Không tìm thấy kết quả.</div>
            )}
          </div>
        )}
    </div> 

    {/* slide show cho sách sắp còn ít */}
    <div className="low-books-container">
      <div className="low-books-content">
        <Slider {...sliderSettingsForLowStock}>
          {lowStockBooks.map((low) => (
            <div key={low.BooksID} className="low-books-card-wrapper" tabIndex="-1">
              <div className="low-books-card">
                <Image src={low.ImageUrl} alt={low.Title} loading="lazy" />
                  <div className="low-card-info">
                    <p className='low-card-info-title'>{low.Title}</p>
                    <p><i className="ri-timer-2-line"></i> {low.PublisherYears ? new Date(low.PublisherYears).getFullYear() : '????'}</p>
                    <p><strong>Tác giả: </strong> {low.AuthorName}</p>                
                    <p><strong>Thể loại: </strong>{low.CategoryName}</p>
                    <button onClick={() => navigate(`/book/${low.BooksID}`)} focusable={false}>
                      Xem sách
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>

    
    {/* //Sile show cho danh sách sách được mượn gần đây (50 cuốn) */}
    <div className="bookloan-desc-container">
      <div className="desc-content">
          <Slider {...SliderBookLoanDesc}>
              {bookloanSilde.map((bl) => (
                <div key={bl.BooksID} className="bookloan-slider-wrapper" tabIndex="-1">
                  <div className="bookloan-slider-card" onClick={() => navigate(`/book/${bl.BooksID}`)}>
                      <Image src={bl.ImageUrl}></Image>
                      <p>{bl.Title}</p>
                  </div>
                </div>
              ))}
          </Slider>
      </div>
    </div>

    
    <header className="header-container">
      <b className='head' onClick={() => navigate(`/list_categories`)}>MỚI CẬP NHẬT <i className="ri-arrow-right-s-line"></i></b>
       <div className="link-wrapper">
      <div className="link">
        {/* Nút "Tất cả" để xóa bộ lọc */}
        <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryFilter(null); }} className={!selectedCategoryId ? 'active' : ''}>Tất cả</a>
        {/* Render danh sách các thể loại */}
        {categories.map((category) => (
          <a href="#" key={category.CategoryID} onClick={(e) => { e.preventDefault(); handleCategoryFilter(category.CategoryID); }} className={selectedCategoryId === category.CategoryID ? 'active' : ''}>{category.CategoryName}</a>
        ))}
      </div>
      </div>
    </header>


    {/* Danh sách sách */}
      <div className="books-container">
          {books.map((book) => (
          <div key={book.BooksID} className="card">
            <div className="img-wrap" onClick={() => openBookDetail(book)}>
              {book.ImageUrl ? (
                <Image 
                  src={book.ImageUrl} 
                  alt={book.Title} 
                  title={book.Title}
                  loading="lazy" />
              ) : ( 
                <div className="no-image">Không có ảnh</div>
              )}
            </div>

            <div className="card-body">
              <h4 className="card-title">{book.Title}</h4>
            </div>
          </div>
        ))}
        </div>

      <Modal isOpen={!!selectedBook} onClose={() => { setSelectedBook(null); setMainImage(null); }}>
        {selectedBook && (
          <div className='bookDetail-modal'>
            <div className='bookDetail-grid'>
              <div className='bookDetail-images'>
                <div className='main-image-container'>
                  <Image src={mainImage} alt={selectedBook.Title} className="main-image" />
                </div>
                {/* Hiển thị ảnh phụ */}
                {selectedBook.supplementaryImages.length > 0 && (
                  <div className="supplementary-images">
                    {/* Luôn hiển thị ảnh bìa gốc */}
                    <Image src={selectedBook.ImageUrl} alt="Ảnh bìa" onClick={() => setMainImage(selectedBook.ImageUrl)} className={mainImage === selectedBook.ImageUrl ? 'active' : ''} />
                    {selectedBook.supplementaryImages.map((src, idx) => {
                      return (
                        <Image 
                          key={idx} 
                          src={src} 
                          alt={`supp-${idx}`} 
                          onClick={() => setMainImage(src)} 
                          className={mainImage === src ? 'active' : ''}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
              <div className='bookDetail-info'>
                <h3>{selectedBook.Title}</h3>
                <p><strong>Tác giả:</strong> {selectedBook.AuthorName || 'Đang cập nhật'}</p>
                <p><strong>Thể loại:</strong> {selectedBook.CategoryName || 'Đang cập nhật'}</p>
                <p><strong>Nhà xuất bản:</strong> {selectedBook.PublisherName || 'Đang cập nhật'}</p>
                <p><strong>Năm xuất bản:</strong> {selectedBook.PublisherYears ? new Date(selectedBook.PublisherYears).getFullYear() : 'Đang cập nhật'}</p>
                <p>
                  <strong>Còn lại: </strong>
                  {/* Sử dụng <= 0 để an toàn hơn và thêm class để tạo kiểu */}
                  { selectedBook.StockQuantity <= 0 
                    ? <span className="stock-out"> Hết hàng</span> 
                    : selectedBook.StockQuantity}
                </p>
                <div className='description-box'>
                  <h4>Mô tả</h4>
                  <p>{selectedBook.Description || 'Đang cập nhật.'}</p>
                </div>
                <div className='modal-actions'>
                      <button className="btn-detail" onClick={() => navigate(`/book/${selectedBook.BooksID}`)}> Xem thêm
                        <span></span>
                      </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className='pagination-controls-container'>
        {/* Thêm component phân trang */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /> 
                
              <button className="cta" onClick={() => navigate(`list_categories`)}>
                <span className="hover-underline-animation"> Show All </span>
                <svg
                  id="arrow-horizontal"
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="10"
                  viewBox="0 0 46 16"
                >
                  <path
                    id="Path_10"
                    data-name="Path 10"
                    d="M8,0,6.545,1.455l5.506,5.506H-30V9.039H12.052L6.545,14.545,8,16l8-8Z"
                    transform="translate(30)"
                  ></path>
                </svg>
              </button>
      </div>
        


      {/* Slideshow sách đề cử */}
      <div className="books-chart">
          <span className='head head-chart'>ĐỀ CỬ <i className="ri-arrow-right-s-line"></i></span>
          <div className="books-chart-container">
            <Slider {...sliderSettings}>
              {mostbookloan.map((most) => (
                <div key={most.BooksID} className="chart-card-wrapper">
                  <div className="chart-card" onClick={() => navigate(`/book/${most.BooksID}`)}>
                    <Image src={most.ImageUrl} alt={most.Title} loading="lazy" />
                    <p>{most.Title}</p>
                  </div>
                </div>
              ))}
            </Slider>
         
              <div className="btn-23-container">
                  <button className="btn-23" onClick={() => navigate(`/nominate`)}>
                    <span className="btn-text23">Xem thêm</span>
                    <span aria-hidden="" className="marquee">Đề Cử</span>
                </button>
              </div>

          </div>
      </div>


      {/* Slide chạy liên tục */}
      {booksAll.length > 0 && (
        <div className="marquee-section">
          <div className="marquee-wrapper">
            {/* Nhân đôi danh sách để tạo hiệu ứng lặp liền mạch */}
            {[...booksAll, ...booksAll].map((all, index) => (
              <div className="marquee-item" key={`${all.BooksID}-${index}`} onClick={() => navigate(`/book/${all.BooksID}`)}>
                <Image src={all.ImageUrl} alt={all.Title} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* slide show cho Sách bộ */}
      {seriesWithBooks.length > 0 && (
        <div className="books-chart">
          <span className='head head-series'>TRỌN BỘ <i className="ri-arrow-right-s-line"></i>
            <p className="series-names-list">{seriesWithBooks.map(s => s.SeriesName).join(' - ')}</p>
          </span>
          <div className="books-chart-container series-slideshow">
            <Slider {...seriesSliderSettings}>
              {seriesWithBooks.map((series) => (
                <div key={series.SeriesID} className="chart-card-wrapper">
                  <div className="chart-card series-card" onClick={() => navigate(`/series`)}>
                    <Image src={series.Image_background} alt={series.SeriesName} loading="lazy" />
                    <p>{series.SeriesName}</p>
                  </div>
                </div>
              ))}
            </Slider>
              <div className="btn-23-container">
                    <button className="btn-23" onClick={() => navigate(`/series`)}>
                      <span className="btn-text23">Xem thêm</span>
                      <span aria-hidden="" className="marquee">Trọn Bộ</span>
                  </button>
              </div>
          </div>
        </div>
      )}

        {/* Slide chạy liên tục */}
      {favorties.length > 0 && (
        <div className="marquee-favor">
          <div className=" wrapper-favor">
            {/* Nhân đôi danh sách để tạo hiệu ứng lặp liền mạch */}
            {[...favorties, ...favorties].map((all, index) => (
              <div className="marquee-item" key={`${all.BooksID}-${index}`} onClick={() => navigate(`/book/${all.BooksID}`)}>
                <span className='count-favor'>{all.favorite_count} <i className="ri-heart-3-line"></i></span>
                <Image src={all.ImageUrl} alt={all.Title} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
    
  );
}


export default BookList;