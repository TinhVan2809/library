import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Image from './Image'; // Sử dụng component Image để xử lý ảnh

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

function HandleFilter() {

    const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [booksAll, setBooksAll] = useState([]);
  const [authors, setAuthors] = useState([]); // eslint-disable-line
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);// eslint-disable-line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null); 
  const [favorties, setFavorties] = useState([]);

  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  // State mới cho live search
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // State để lọc theo thể loại
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null); // State mới cho năm được chọn

  //State để lọc theo nhà xuất bản
  const [selectedPublisherId, setSelectedPublisherId] = useState(null);

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
        if (selectedYear) { // Thêm điều kiện lọc theo năm
          booksApiUrl += `&year=${selectedYear}`;
        }
        if(selectedPublisherId) {
          booksApiUrl += `&publisherId=${selectedPublisherId}`;
        }

        const [booksRes, categoriesRes, publishersRes, booksallRes, favortiesRes] = await Promise.all([ // Cập nhật API để hỗ trợ phân trang
          fetch(booksApiUrl),
          
          fetch('http://localhost/Library/Connection/actions/actionForCategories.php?action=getCategory'),
          fetch('http://localhost/Library/Connection/actions/actionForPublishers.php?action=GetPublishers'),   
          fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getAllBooks'),
          fetch('http://localhost/Library/Connection/actions/actionForFavorites.php?action=getTopFavoritedBooks')
        ]);

        // kiểm tra tất cả response trước khi parse
        if (!booksRes.ok) throw new Error(`Lỗi khi tải sách: ${booksRes.status}`);
      
        if (!categoriesRes.ok) throw new Error(`Lỗi khi tải categories: ${categoriesRes.status}`);
        if (!publishersRes.ok) throw new Error(`Lỗi khi tải publishers: ${publishersRes.status}`);
      
      
        if(!booksallRes.ok) throw new Error(`Lỗi khi tải tất cả sách: ${booksallRes.status}`);
        if(!favortiesRes.ok) throw new Error(`Lỗi khi lấy danh sách yêu thích nhất: ${favortiesRes.status}`);

        const booksData = await booksRes.json();
        
        const categoriesData = await categoriesRes.json();
        const publishersData = await publishersRes.json();
        
        
        const booksallData = await booksallRes.json();
        const favorites = await favortiesRes.json();

        if (mounted) {
          if (booksData && booksData.success && Array.isArray(booksData.data)) {
            setBooks(booksData.data); // Không cần chuẩn hóa URL ở đây nữa
            setTotalPages(booksData.total_pages || 0); // Lấy tổng số trang từ API
          } else {
            setBooks([]); // fallback
            setTotalPages(0); // Reset totalPages khi không có dữ liệu
            if (booksData && booksData.message) console.warn('books:', booksData.message);
          }

         

          if (categoriesData && categoriesData.success && Array.isArray(categoriesData.data)) {
            setCategories(categoriesData.data);
          } else {
            setCategories([]);
            if (categoriesData && categoriesData.message) console.warn('categories:', categoriesData.message);
          }

          if (publishersData && publishersData.success && Array.isArray(publishersData.data)) {
            setPublishers(publishersData.data);
          } else {
            setPublishers([]);
            if (publishersData && publishersData.message) console.warn('publishers:', publishersData.message);
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
            if(favorites && favorites.message)  console.warn('booksall:', favorites.message);
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
  }, [currentPage, selectedCategoryId, selectedYear, selectedPublisherId]); 

  if (loading) return <p><i class="ri-loader-2-fill"></i> Đang tải danh sách sách...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  
  // Hàm xử lý khi người dùng chọn một năm
  const handleYearFilter = (year) => {
    setSelectedYear(year);
    setCurrentPage(1); // Quay về trang 1 khi áp dụng bộ lọc mới
  };

  // Hàm xử lý khi người dùng chọn một thể loại
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); // Quay về trang 1 khi áp dụng bộ lọc mới
  };

  //  Hàm xử lý khi người dùng chọn một nhà xuất bản
  const handlePublisherFilter = (publisherId) => {
    setSelectedPublisherId(publisherId);
    setCurrentPage(1);
  }

    // Tạo một danh sách các năm xuất bản duy nhất từ mảng books
    const uniqueYears = [...new Set(
        booksAll // Sử dụng booksAll để danh sách năm luôn đầy đủ
            .map(book => book.PublisherYears ? new Date(book.PublisherYears).getFullYear() : null) // Lấy năm hoặc null
            .filter(year => year) // Lọc bỏ các giá trị null hoặc undefined
            .sort((a, b) => b - a) // Sắp xếp các năm theo thứ tự giảm dần (mới nhất trước)
            // Đảm bảo các năm là duy nhất và không bị trùng lặp
    )];

    return (
        <>

        {/* Chọn năm */}
        <div className="publisheryears-container">
            {/* Nút "Tất cả" cho năm */}
            <div
             className="publisheryears" onClick={() => handleYearFilter(null)}>
                <span  className={`${selectedYear === null ? 'year-active' : ''}`}>Tất cả</span>
            </div>
            {uniqueYears.map((year) => (
                <div key={year} className="publisheryears" onClick={() => handleYearFilter(year)}>
                    <span className={`${selectedYear === year ? 'year-active' : ''}`}>{year}</span>
                </div>
            ))}
        </div>
    
    {/* // Chọn thể loại */}
    <header className="header-container-categories">
       
        <div className="link-categories">
            {/* Nút "Tất cả" để xóa bộ lọc */}
            <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryFilter(null); }} className={!selectedCategoryId ? 'categories-active' : ''}>Tất cả</a>
            {/* Render danh sách các thể loại */}
            {categories.map((category) => (
            <a href="#" key={category.CategoryID} onClick={(e) => { e.preventDefault(); handleCategoryFilter(category.CategoryID); }} className={selectedCategoryId === category.CategoryID ? 'categories-active' : ''}>{category.CategoryName}</a>
            ))}
        </div>

    </header>

    {/* Chọn nhà xuất bản */}
    <div className="header-container-categories">
          
              <div className="link-categories" >
                <a href="#" onClick={(e) => { e.preventDefault(); handlePublisherFilter(null); }} className={!selectedPublisherId ? 'categories-active' : ''}>Tất cả</a>
                {publishers.map(publisher => (
                  <a 
                    href="#" 
                    key={publisher.PublisherID} 
                    onClick={(e) => {e.preventDefault(); handlePublisherFilter(publisher.PublisherID);}}
                    className={selectedPublisherId === publisher.PublisherID ? 'categories-active' : ''}
                  >{publisher.PublisherName}</a>
                ) )}
              </div>
         
    </div>


     {/* Danh sách sách */}
      <div className="books-container">
          {books.map((book) => (
          <div key={book.BooksID} className="card">
            <div className="img-wrap" onClick={() => navigate(`/book/${book.BooksID}`)}>
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

        {/* Thêm component phân trang */}
        <div className='pagination-controls-container'>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
         </div>
        
        </>
    );

}

 export default HandleFilter;