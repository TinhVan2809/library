import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

function AddBookForm({ onBookAdded }) {
  const [formData, setFormData] = useState({
    ISBN: '',
    Title: '',
    AuthorID: '',
    CategoryID: '',
    PublisherID: '',
    PublisherYears: '',
    Language: 'Tiếng Việt',
    Description: '',
    ImageUrl: '',
    StockQuantity: '',
    SeriesID: '', // Thêm SeriesID vào state ban đầu
    Status: 'available',
    ImageSp: [], 
  });

  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [bookSeries, setBookSeries] = useState([]); // State mới cho danh sách bộ sách
  const [message, setMessage] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false); // State để quản lý hiển thị form
  const formRef = useRef(null); // Ref để tham chiếu đến form
  const [imagePreview, setImagePreview] = useState({ cover: null, others: [] });
  const [loading, setLoading] = useState(true);

  // Hàm fetch dữ liệu chung
  const fetchData = async (url, setter) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setter(data.data);
      } else {
        console.error(`Không thể tải ${url}:`, data.message);
      }
    } catch (error) {
      console.error(`Lỗi khi tải ${url}:`, error);
    }
  };

  // Tải tất cả dữ liệu cần thiết cho form
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchData('http://localhost/Library/Connection/actions/actionForAuthors.php?action=GetAuthors', setAuthors),
        fetchData('http://localhost/Library/Connection/actions/actionForCategories.php?action=getCategory', setCategories),
        fetchData('http://localhost/Library/Connection/actions/actionForPublishers.php?action=GetPublishers', setPublishers),
        fetchData('http://localhost/Library/Connection/actions/actionForBooks.php?action=getAllSeries', setBookSeries), // Lấy danh sách bộ sách
      ]);
      setLoading(false);
    };
    loadAllData();
  }, []);

  // Hook để xử lý việc click bên ngoài form
  useEffect(() => {
    function handleClickOutside(event) {
      // Nếu form đang hiển thị và người dùng click ra ngoài khu vực của form (formRef)
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsFormVisible(false); // Đóng form
      }
    }
    // Thêm event listener khi form được mở
    if (isFormVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    // Dọn dẹp event listener khi component unmount hoặc form đóng
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFormVisible]); // Chỉ chạy lại khi isFormVisible thay đổi

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'ImageUrl') {
        setFormData(prev => ({ ...prev, ImageUrl: files[0] }));
        setImagePreview(prev => ({ ...prev, cover: files[0] ? URL.createObjectURL(files[0]) : null }));
      } else if (name === 'image_url_sp[]') {
        const arr = Array.from(files || []); // Chuyển FileList thành mảng
        setFormData(prev => ({ ...prev, ImageSp: arr }));
        setImagePreview(prev => ({ ...prev, others: arr.map(f => URL.createObjectURL(f)) }));
      }
      return;
    }
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const confirmation = await Swal.fire({
      title: 'Xác nhận thêm sách',
      html: `Bạn có chắc chắn muốn thêm cuốn sách <strong>"${formData.Title}"</strong> vào thư viện không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745', // Màu xanh lá cây
      cancelButtonColor: '#d33',
      confirmButtonText: 'Chắc chắn!',
      cancelButtonText: 'Hủy',
      heightAuto: false,
      backdrop: false
    });

    if (!confirmation.isConfirmed) {
      return; // Dừng lại nếu người dùng nhấn "Hủy"
    }

    const postData = new FormData();
    const normalKeys = ['ISBN','Title','AuthorID','CategoryID','PublisherID','PublisherYears','Language','Description','StockQuantity','Status', 'SeriesID'];
    normalKeys.forEach(k => postData.append(k, formData[k] ?? ''));

    if (formData.ImageUrl instanceof File) {
      postData.append('ImageUrl', formData.ImageUrl); // cover
    }

    if (Array.isArray(formData.ImageSp)) {
      // Gửi nhiều file với cùng một key 'image_url_sp[]'
      formData.ImageSp.forEach(file => postData.append('image_url_sp[]', file));
    }

    // DEBUG: log số ảnh phụ đã append và các keys trong FormData
    const suppCount = Array.isArray(formData.ImageSp) ? formData.ImageSp.length : 0;
    console.log('Appending supplementary images:', suppCount);
    for (const pair of postData.entries()) {
      console.log('FormData entry:', pair[0], pair[1]);
    }

    try {
      Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng chờ trong khi hệ thống thêm sách.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=AddBook', {
        method: 'POST',
        body: postData,
        // Không set Content-Type — để browser tự thiết lập multipart/form-data boundary
      });

      const result = await response.json();
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: result.message || 'Đã thêm sách thành công.',
          timer: 2000,
          showConfirmButton: false
        });
        if (onBookAdded) onBookAdded();
        // reset
        setFormData({
          ISBN: '', Title: '', AuthorID: '', CategoryID: '', PublisherID: '', PublisherYears: '',
          Language: 'Tiếng Việt', Description: '', ImageUrl: '', ImageSp: [], StockQuantity: '', Status: 'available', SeriesID: ''
        });
        setImagePreview({ cover: null, others: [] });
        setIsFormVisible(false); // Tự động đóng form sau khi thêm thành công
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Thất bại...',
          text: result.message || 'Đã có lỗi xảy ra.',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Lỗi kết nối', text: 'Không thể gửi dữ liệu đến server.' });
    }
  };


  return (
<>
    <section>
      {/* Nút để mở form */}
      <div className="add-book-icon" onClick={() => setIsFormVisible(true)}>
        <img src="../public/book_ribbon_90dp_1F1F1F_FILL0_wght400_GRAD0_opsz48.png" title='Thêm sách' />
        <span>Thêm Sách</span>
      </div>
    </section>

    {/* Chỉ hiển thị form khi isFormVisible là true */}
    {isFormVisible && (
      <div className="form-overlay">
        <section className='section-container' ref={formRef}>

          <form onSubmit={handleSubmit} className='form-add-book-container'>
            <button type="button" className="close-btn" onClick={() => setIsFormVisible(false)}>&times;</button>
            
            <input type="text" name="ISBN" placeholder="ISBN" value={formData.ISBN} onChange={handleChange} required />
            <input type="text" name="Title" placeholder="Tựa đề sách" value={formData.Title} onChange={handleChange} required />

            <select name="AuthorID" value={formData.AuthorID} onChange={handleChange} required>
              <option value="">-- Chọn tác giả --</option>
              {authors.map(author => (
                <option key={author.AuthorID} value={author.AuthorID}>{author.AuthorName}</option>
              ))}
            </select>

            <select name="CategoryID" value={formData.CategoryID} onChange={handleChange}>
              <option value="">-- Chọn thể loại --</option>
              {categories.map(category => (
                <option key={category.CategoryID} value={category.CategoryID}>{category.CategoryName}</option>
              ))}
            </select>

            <select name="PublisherID" value={formData.PublisherID} onChange={handleChange} required>
              <option value="">-- Chọn nhà xuất bản --</option>
              {publishers.map(publisher => (
                <option key={publisher.PublisherID} value={publisher.PublisherID}>{publisher.PublisherName}</option>
              ))}
            </select>

            <select name="SeriesID" value={formData.SeriesID} onChange={handleChange}>
              <option value="">-- Chọn bộ (nếu có) --</option>
              {bookSeries.map(series => (
                <option key={series.SeriesID} value={series.SeriesID}>{series.SeriesName}</option>
              ))}
            </select>

            <input type="date" name="PublisherYears" placeholder="Năm xuất bản" value={formData.PublisherYears} onChange={handleChange} />
            <input type="text" name="Language" placeholder="Ngôn ngữ" value={formData.Language} onChange={handleChange} />
            <input type="number" name="StockQuantity" placeholder="Số lượng" value={formData.StockQuantity} onChange={handleChange} required />

            <label htmlFor="image-upload">Chọn ảnh bìa:</label>
            <input id="image-upload" type="file" name="ImageUrl" accept="image/*" onChange={handleChange} />
            {imagePreview.cover && <img src={imagePreview.cover} alt="Xem trước bìa" className="image-preview" />}

            <label htmlFor="image-sp">Chọn ảnh phụ (có thể chọn nhiều):</label>
            <input id="image-sp" type="file" name="image_url_sp[]" accept="image/*" multiple onChange={handleChange} />
            <div className="supplementary-preview">
              {imagePreview.others.map((src, idx) => (
                <img key={idx} src={src} alt={`sp-${idx}`} className="image-preview-small" />
              ))}
            </div>

            <textarea name="Description" placeholder="Mô tả sách" value={formData.Description} onChange={handleChange} />

            <select name="Status" value={formData.Status} onChange={handleChange}>
              <option value="available">Có sẵn</option>
              <option value="unavailable">Không có sẵn</option>
            </select>

            <button type="submit" className="btn-submit-book">Thêm Sách</button>
           
          </form>
        </section>
      </div>
    )}
    </>
  );

}

function GetBooks({ refreshKey }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // State cho các dropdown trong form sửa
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [bookSeries, setBookSeries] = useState([]); // State mới cho danh sách bộ sách

  // State cho phân trang "Xem thêm"
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // --- moved helper lên scope của GetBooks để các hàm khác có thể dùng ---
  const SERVER_BASE = 'http://localhost/Library/'; // chỉnh nếu cần
  const getFullImageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    // Nếu đã là URL tuyệt đối, trả về ngay
    if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) {
      return path;
    }
    return `${SERVER_BASE.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  };
  // ----------------------------------------------------------------------

  useEffect(() => {
    const fetchBooks = async () => {
      // Nếu là trang 1 thì hiện loading chính, ngược lại là loading cho nút "xem thêm"
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const [booksRes, authorsRes, categoriesRes, publishersRes, bookSeriesRes] = await Promise.all([
          // Gọi API với trang hiện tại
          fetch(`http://localhost/Library/Connection/actions/actionForBooks.php?action=getBooks&page=${currentPage}`),
          fetch('http://localhost/Library/Connection/actions/actionForAuthors.php?action=GetAuthors'),
          fetch('http://localhost/Library/Connection/actions/actionForCategories.php?action=getCategory'),
          fetch('http://localhost/Library/Connection/actions/actionForPublishers.php?action=GetPublishers'),
          fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getAllSeries'),
        ]);
        
        if (!booksRes.ok) throw new Error(`Lỗi HTTP! Trạng thái: ${booksRes.status}`);
        const booksData = await booksRes.json();

        // sử dụng getFullImageUrl đã khai báo ở trên
        if (booksData.success && Array.isArray(booksData.data)) {
          const normalized = (Array.isArray(booksData.data) ? booksData.data : []).map(b => ({
            ...b,
            ImageUrl: getFullImageUrl(b.ImageUrl),
            supplementaryImages: Array.isArray(b.supplementaryImages)
              ? b.supplementaryImages.map(img => typeof img === 'string' ? getFullImageUrl(img) : img)
              : b.supplementaryImages
          })); 
          // Nếu là trang 1 thì thay thế, ngược lại thì nối vào mảng cũ
          setBooks(prevBooks => currentPage === 1 ? normalized : [...prevBooks, ...normalized]);
          setTotalPages(booksData.total_pages || 0);
        } else {
          if (currentPage === 1) {
            setBooks([]); // Reset nếu trang đầu tiên lỗi
            setTotalPages(0);
          }
          throw new Error(booksData.message || 'Không thể lấy danh sách sách');
        }

        // Hàm helper để xử lý dữ liệu dropdown
        const processDropdownData = async (res, setter) => {
          const data = await res.json();
          if (data.success) setter(data.data);
        };

        await Promise.all([
          processDropdownData(authorsRes, setAuthors),
          processDropdownData(categoriesRes, setCategories),
          processDropdownData(publishersRes, setPublishers),
          processDropdownData(bookSeriesRes, setBookSeries), // Xử lý dữ liệu bộ sách
        ]);
      } catch (error) {
        setError(error.message);
        console.error('Lỗi khi lấy danh sách sách:', error);
      } finally {
        if (currentPage === 1) {
          setLoading(false);
        }
        setIsLoadingMore(false);
      }
    };

    fetchBooks();
  }, [refreshKey, currentPage]); // Chạy lại khi refreshKey hoặc currentPage thay đổi

  if (loading) return (
    <>
     
      <section className="dots-container">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </section>

    </>
  );
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Lấy sách
  const handleGetBookById = async (bookId) => {
    try {
      setEditingBook(null);
      const response = await fetch(`http://localhost/Library/Connection/actions/actionForBooks.php?action=getBookById&BooksID=${bookId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      if (result.success) {
        const book = result.data || {};
        // getFullImageUrl khả dụng ở đây vì đã khai báo ở trên
        book.ImageUrl = getFullImageUrl(book.ImageUrl);
        if (Array.isArray(book.supplementaryImages) && book.supplementaryImages.length > 0) {
          book.supplementaryImages = book.supplementaryImages.map(img => typeof img === 'string' ? getFullImageUrl(img) : img);
        }
        setSelectedBook(book);
      } else {
        alert(`Lỗi: ${result.message}`);
        setSelectedBook(null);
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết sách:', err);
      alert(`Lỗi: ${err.message}`);
      setSelectedBook(null);
    }
  };

  //xóa sách
  const handleDeleteBookById = async (BooksID) => {
    if (!window.confirm('Xác nhận xóa sách này?')) return;

    try {
      const params = new URLSearchParams();
      params.append('action', 'DeleteBookById');
      params.append('BooksID', String(BooksID));

      const res = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);
      // thành công: làm mới danh sách
      alert(result.message || 'Đã xóa');
      // gọi hàm refresh nếu có
    } catch (err) {
      console.error('DeleteBook error:', err);
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  }

// update sách
  // Hiển thị form 
  const handleEditBookClick = (book) => {
    setEditingBook(book);
    setEditFormData({...book});
    setSelectedBook(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, files } = e.target;

    // Sửa lỗi logic: Phân biệt input file nào được thay đổi dựa vào 'name'
    if (type === 'file' && name === 'ImageUrl') {
      setEditFormData(prevState => ({
        ...prevState,
        ImageUrl: files[0] // Chỉ cập nhật ảnh bìa
      }));
    } else if (type === 'file' && name === 'newSupplementaryImages') {
      setEditFormData(prevState => ({
        ...prevState,
        newSupplementaryImages: Array.from(files) // Chỉ cập nhật ảnh phụ mới
      }));
    } else {
      setEditFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // Hàm xóa ảnh phụ hiện có trong form sửa
  const handleRemoveSupplementaryImage = (imageUrlToRemove) => {
    setEditFormData(prevState => ({
      ...prevState,
      // Lọc bỏ ảnh khỏi danh sách hiển thị
      supplementaryImages: prevState.supplementaryImages.filter(img => img !== imageUrlToRemove),
      // Thêm ảnh vào danh sách sẽ bị xóa trên server
      deletedSupplementaryImages: [...(prevState.deletedSupplementaryImages || []), imageUrlToRemove]
    }));
  };
  // Submit form
  const handleUpdateBookSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData) return;

    const postData = new FormData();

    // Chỉ thêm các trường đã thay đổi
    for (const key in editFormData) {
      // Bỏ qua các trường quản lý ảnh trên client
      if (key === 'newSupplementaryImages' || key === 'supplementaryImages' || key === 'deletedSupplementaryImages' || key === 'ImageUrl') {
        continue;
      }
      // Chỉ gửi những trường đã thay đổi
      if (editFormData[key] !== editingBook[key]) {
         postData.append(key, editFormData[key]);
      }
    }
    // Luôn gửi BooksID
    postData.append('BooksID', editingBook.BooksID);

    // Chỉ gửi ảnh bìa nếu nó là một file mới
    if (editFormData.ImageUrl instanceof File) {
      postData.append('ImageUrl', editFormData.ImageUrl);
    }

    // Gửi các file ảnh phụ mới
    if (Array.isArray(editFormData.newSupplementaryImages)) {
      editFormData.newSupplementaryImages.forEach(file => postData.append('image_url_sp[]', file));
    }
    // Gửi danh sách ảnh phụ cần xóa
    if (Array.isArray(editFormData.deletedSupplementaryImages)) {
      postData.append('deleted_images', JSON.stringify(editFormData.deletedSupplementaryImages));
    }

    try {
      const response = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=UpdateBook', {
        method: 'POST',
        body: postData,
      });

      const result = await response.json();
      alert(result.message);

      if (result.success) {
        // Dữ liệu trả về từ server có đường dẫn ảnh tương đối.
        // Chúng ta cần chuẩn hóa chúng thành URL tuyệt đối trước khi cập nhật state.
        const updatedBookData = result.data;
        if (updatedBookData) {
          updatedBookData.ImageUrl = getFullImageUrl(updatedBookData.ImageUrl);
          if (Array.isArray(updatedBookData.supplementaryImages)) {
            updatedBookData.supplementaryImages = updatedBookData.supplementaryImages.map(img => getFullImageUrl(img));
          }
        }

        // Cập nhật lại danh sách sách trên UI với dữ liệu đã được chuẩn hóa
        setBooks(currentBooks =>
          currentBooks.map(book =>
            book.BooksID === editingBook.BooksID ? { ...book, ...updatedBookData } : book
          )
        );
        setEditingBook(null); // Đóng form sửa
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật sách:', err);
      alert('Đã có lỗi xảy ra khi cập nhật.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setEditFormData(null);
  }

  return (
    <>
    <section className="section-container">
      <table className='table-container'>
        <thead >
          <tr>
            <th>Tựa đề</th>
            <th>Hình Ảnh</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.BooksID}>
              <td className='book-title'>{book.Title}</td>
              <td>
                {book.ImageUrl && typeof book.ImageUrl === 'string' ? (
                  <img src={book.ImageUrl} alt={book.Title} style={{ width: '50px', height: 'auto' }} />
                ) : (
                  'Không có ảnh'
                )}
              </td>
              <td>
                <div className="table-container-btn">
                  <button className='btn-edit' onClick={() => handleEditBookClick(book)}>Sửa</button>
                  <button className='btn-delete' onClick={() =>handleDeleteBookById(book.BooksID)}>Xóa</button>
                  <button className='btn-detail' onClick={() => handleGetBookById(book.BooksID)}>Chi tiết</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Nút Xem Thêm */}
      {currentPage < totalPages && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={handleLoadMore} disabled={isLoadingMore} className="btn-submit-book">
            {isLoadingMore ? 
                  <svg viewBox="25 25 50 50">
                    <circle r="20" cy="50" cx="50"></circle>
                  </svg> 
                  
                  : 'Xem thêm'}
          </button>
        </div>
      )}


      {selectedBook && (
        <div className='bookDetail' style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3> {selectedBook.Title}</h3>
          <div className='bookDetail-content' style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div>
              {selectedBook.ImageUrl && (
                <img src={selectedBook.ImageUrl} alt={selectedBook.Title} style={{ width: '150px', height: 'auto', border: '1px solid #ddd' }} />
              )}
            </div>

            <div className='mainContent' style={{ flex: 1 }}>
              <p><strong>ID:</strong> {selectedBook.BooksID}</p>
              <p><strong>ISBN:</strong> {selectedBook.ISBN}</p>
              <p><strong>Tác giả:</strong> {selectedBook.AuthorName}</p>
              <p><strong>Thể loại:</strong> {selectedBook.CategoryName}</p>
              <p><strong>Nhà xuất bản:</strong> {selectedBook.PublisherName}</p>
              <p><strong>Năm xuất bản:</strong> {selectedBook.PublisherYears}</p>
              <p><strong>Bộ sách:</strong> {selectedBook.SeriesName || 'Không thuộc bộ nào'}</p>
              <p><strong>Ngôn ngữ:</strong> {selectedBook.Language}</p>
              <p><strong>Số lượng trong kho:</strong> {selectedBook.StockQuantity}</p>
              <p><strong>Mô tả:</strong> {selectedBook.Description}</p>

              {/* Hiển thị danh sách ảnh phụ nếu có (chỉ 1 lần, nằm trong mainContent) */}
              <h4 style={{ marginTop: '1rem' }}>Ảnh phụ:</h4>
              {Array.isArray(selectedBook.supplementaryImages) && selectedBook.supplementaryImages.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {selectedBook.supplementaryImages.map((src, idx) => (
                    <img
                      key={idx} // src đã được chuẩn hóa khi fetch
                      src={src}
                      alt={`supp-${idx}`}
                      style={{ width: 80, height: 'auto', border: '1px solid #ddd' }}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666' }}>Không có ảnh phụ</p>
              )}
            </div>
          </div>

          <button onClick={() => setSelectedBook(null)} style={{ marginTop: '1rem' }}>Đóng</button>
        </div>
      )}
    </section>

    {editingBook && (
      <section className="container-editing-admin">
        <h3>Sửa thông tin sách: {editingBook.Title}</h3>
        <form onSubmit={handleUpdateBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          <input type="text" name="Title" placeholder="Tựa đề sách" value={editFormData.Title} onChange={handleEditFormChange} required />
          <input type="text" name="ISBN" placeholder="ISBN" value={editFormData.ISBN} onChange={handleEditFormChange} required />

          <select name="AuthorID" value={editFormData.AuthorID} onChange={handleEditFormChange} required>
            {authors.map(author => <option key={author.AuthorID} value={author.AuthorID}>{author.AuthorName}</option>)}
          </select>
          <select name="CategoryID" value={editFormData.CategoryID} onChange={handleEditFormChange} required>
            {categories.map(cat => <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>)}
          </select>
          <select name="PublisherID" value={editFormData.PublisherID} onChange={handleEditFormChange} required>
            {publishers.map(pub => <option key={pub.PublisherID} value={pub.PublisherID}>{pub.PublisherName}</option>)}
          </select>

          {/* Dropdown để chọn bộ sách */}
          <select name="SeriesID" value={editFormData.SeriesID || ''} onChange={handleEditFormChange}>
            <option value="">-- Không thuộc bộ sách nào --</option>
            {bookSeries.map(series => <option key={series.SeriesID} value={series.SeriesID}>{series.SeriesName}</option>)}
          </select>

          <input type="date" name="PublisherYears" value={editFormData.PublisherYears || ''} onChange={handleEditFormChange} />
          <input type="text" name="Language" placeholder="Ngôn ngữ" value={editFormData.Language} onChange={handleEditFormChange} />
          <input type="number" name="StockQuantity" placeholder="Số lượng" value={editFormData.StockQuantity} onChange={handleEditFormChange} required />
          
          <label htmlFor="image-update">Thay đổi ảnh bìa (để trống nếu không đổi):</label>
          <input id="image-update" type="file" name="ImageUrl" accept="image/*" onChange={handleEditFormChange} />

          {/* Phần chỉnh sửa ảnh phụ */}
          <div style={{ marginTop: '1rem' }}>
            <h4>Chỉnh sửa ảnh phụ:</h4>
            {Array.isArray(editFormData.supplementaryImages) && editFormData.supplementaryImages.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', border: '1px solid #eee', padding: '8px', borderRadius: '4px' }}>
                {editFormData.supplementaryImages.map((src, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={src} alt={`supp-${idx}`} style={{ width: 80, height: 'auto' }} />
                    <button type="button" onClick={() => handleRemoveSupplementaryImage(src)} style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', lineHeight: '20px', padding: 0 }}>X</button>
                  </div>
                ))}
              </div>
            )}
            <label htmlFor="image-sp-update" style={{ display: 'block', marginTop: '1rem' }}>Thêm ảnh phụ mới (có thể chọn nhiều):</label>
            <input id="image-sp-update" type="file" name="newSupplementaryImages" accept="image/*" multiple onChange={handleEditFormChange} />
            {/* Preview ảnh mới chọn */}
            {Array.isArray(editFormData.newSupplementaryImages) && editFormData.newSupplementaryImages.map((file, idx) => (
              <img key={idx} src={URL.createObjectURL(file)} alt="preview" style={{ width: 80, height: 'auto', marginTop: 8, marginRight: 8 }} />
            ))}
          </div>
          <textarea name="Description" placeholder="Mô tả" value={editFormData.Description} onChange={handleEditFormChange} />
          
          <select name="Status" value={editFormData.Status} onChange={handleEditFormChange}>
            <option value="available">Có sẵn</option>
            <option value="unavailable">Không có sẵn</option>
          </select>

          <div>
            <button type="submit" className="btn">Cập nhật</button>
            <button type="button" className="btn" onClick={handleCancelEdit} style={{ marginLeft: '1rem', backgroundColor: '#6c757d' }}>Hủy</button>
          </div>
        </form>
      </section>
    )}
    </>
  );
}

function BooksManager({ onCancel }) { // Nhận onCancel từ props
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <> 
      <AddBookForm onBookAdded={() => setRefreshKey(prevKey => prevKey + 1)} onCancel={onCancel} />
      <hr />
      <GetBooks refreshKey={refreshKey} />
    </>
  );
}

export default BooksManager;
