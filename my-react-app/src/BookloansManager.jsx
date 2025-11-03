import React, { useState, useEffect } from 'react';

function BookLoanList({ onBookAdded, onCancel }) { // eslint-disable-line
  const [bookLoans, setBookLoans] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // eslint-disable-line
  const [formData, setFormData] = useState({ // eslint-disable-line
    StudentID: '',
    BooksID: '',
    LoanDate: '',
    DueDate: '',
    ReturnDate: '',
    Status: '',
  });

  // Hàm trợ giúp để tạo URL tuyệt đối cho hình ảnh
  const getFullImageUrl = (path) => {
    const SERVER_BASE = 'http://localhost/Library/';
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
  };

  const [editingBookloans, setEditingBookloans] = useState(null); // eslint-disable-line

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookLoansRes, studentsRes, booksRes] = await Promise.all([
        fetch('http://localhost/Library/Connection/actions/actionForBookLoans.php?action=GetBookLoans'),
        fetch('http://localhost/Library/Connection/actions/actionForStudent.php?action=GetStudent'),
        // nếu có endpoint lấy sách, sửa đường dẫn cho đúng
        fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getBooks')
      ]);

      const bookLoansData = await bookLoansRes.json();
      const studentsData = await studentsRes.json();
      const booksData = await booksRes.json();

      if (bookLoansData.success) setBookLoans(Array.isArray(bookLoansData.data) ? bookLoansData.data : []);
      else setError(bookLoansData.message);

      if (studentsData.success) setStudents(Array.isArray(studentsData.data) ? studentsData.data : []);
      else setError(prev => prev || studentsData.message);

      if (booksData.success) setBooks(Array.isArray(booksData.data) ? booksData.data : []);
      else setError(prev => prev || booksData.message);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => { // eslint-disable-line
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Các hàm dưới là stub — thay bằng logic thực tế khi cần
  const handleSubmit = async (e) => { // eslint-disable-line
    e && e.preventDefault && e.preventDefault();
    // gửi form, sau đó gọi onBookAdded() nếu thành công
    alert('handleSubmit chưa được triển khai');
  };

  const resetForm = () => { // eslint-disable-line
    setFormData({
      StudentID: '',
      BooksID: '',
      LoanDate: '',
      DueDate: '',
      ReturnDate: '',
      Status: '',
    });
    setEditingBookloans(null);
  };

  const handleEditClick = (loan) => {
    setEditingBookloans(loan);
    setFormData({ ...loan });
  };
 // Hàm xử lý khi nhấn nút "Xóa"
  const handleDeleteBookLoan = async (bookloanId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu mượn này?')) {
      return;
    }

    const postData = new FormData();
    postData.append('BookLoanID', bookloanId);

    try {
      const response = await fetch('http://localhost/Library/Connection/actions/actionForBookLoans.php?action=DeleteBookLoan', {
        method: 'POST',
        body: postData,
      });
      const result = await response.json();
      alert(result.message);
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const handleGetStudentById = (bookLoanId) => {
    // Hiển thị chi tiết — tạm alert
    const found = bookLoans.find(b => b.BookLoanID === bookLoanId);
    alert(JSON.stringify(found || {}, null, 2));
  };

  if (loading) return <p>Đang tải danh sách phiếu mượn...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (
    <>
      <BookLoanForm
        students={students}
        books={books}
        onAdded={async () => {
          await fetchData();
          if (onBookAdded) onBookAdded();
        }}
      />
      <hr />
      <section className="section-container">
        
        <table className='table-container'>
          <thead>
            <tr>
             <th><input type="radio" /></th>
              <th>Họ Tên</th>
              <th>Hình ảnh</th>
              <th>Ngày mượn</th>
              <th>Trạng thái</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookLoans.map((loan) => (
              <tr key={loan.BookLoanID}>
                <td><input type="radio" /></td>
                <td>{loan.FullName}</td>
                <td>
                {loan.ImageUrl && typeof loan.ImageUrl === 'string' ? (
                  <img src={getFullImageUrl(loan.ImageUrl)} alt={loan.Title} style={{ width: '50px', height: 'auto' }} />
                ) : (
                  'Không có ảnh'
                )}
              </td>
                <td>{loan.LoanDate }</td>
                <td>{loan.Status}</td>
                <td>
                  <div className="table-container-btn">
                      <button className='btn-edit' onClick={() => handleEditClick(loan)}>Sửa</button>
                    <button className='btn-delete' onClick={() => handleDeleteBookLoan(loan.BookLoanID)}>Xóa</button>
                    <button className='btn-detail' onClick={() => handleGetStudentById(loan.BookLoanID)}>Chi tiết</button>
                    <button className='btn-print'>In phiếu</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

// Thêm form để tạo phiếu mượn mới
function BookLoanForm({ students = [], books = [], onAdded }) {
  const today = new Date();
  const yyyyMMdd = (d) => d.toISOString().split('T')[0];
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');
  const [loanDate, setLoanDate] = useState(yyyyMMdd(today));
  const [dueDate, setDueDate] = useState(yyyyMMdd(new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)));
  const [returnDate, setReturnDate] = useState('');
  const [status, setStatus] = useState('borrowed');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!studentId || !bookId) {
      setMessage('Vui lòng chọn sinh viên và sách.');
      return;
    }
    setSubmitting(true);

    try {
      const postData = new FormData();
      postData.append('StudentID', studentId);
      postData.append('BooksID', bookId);
      postData.append('LoanDate', loanDate);
      postData.append('DueDate', dueDate);
      if (returnDate) postData.append('ReturnDate', returnDate);
      postData.append('Status', status);

      const resp = await fetch('http://localhost/Library/Connection/actions/actionForBookLoans.php?action=AddBookLoan', {
        method: 'POST',
        body: postData,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }

      const result = await resp.json();
      setMessage(result.message || (result.success ? 'Thành công' : 'Không thành công'));
      if (result.success) {
        // reset form
        setStudentId('');
        setBookId('');
        setLoanDate(yyyyMMdd(today));
        setDueDate(yyyyMMdd(new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)));
        setReturnDate('');
        setStatus('borrowed');

        if (onAdded) onAdded();
      }
    } catch (err) {
      console.error('Lỗi khi thêm phiếu mượn:', err);
      setMessage('Đã có lỗi khi gửi yêu cầu. Kiểm tra console.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className='section-add-bookloan'>
      <form className='form-container' onSubmit={handleSubmit}>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
          <option value="">-- Chọn sinh viên --</option>
          {students.map(s => <option key={s.StudentID} value={s.StudentID}> {s.StudentCode} - {s.FullName || s.StudentName}</option>)}
        </select>

        <select value={bookId} onChange={(e) => setBookId(e.target.value)} required>
          <option value="">-- Chọn sách --</option>
          {books.map(b => <option key={b.BooksID} value={b.BooksID}>{b.Title || b.BookTitle}</option>)}
        </select>

        <label>
          Ngày mượn
          <input type="date" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} required />
        </label>

        <label>
          Ngày trả dự kiến
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </label>

        <label>
          Ngày trả (nếu có)
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        </label>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="borrowed">Đang mượn</option>
          <option value="returned">Đã trả</option>
          <option value="overdue">Quá hạn</option>
        </select>

        <button type="submit" className="btn" disabled={submitting} >
          {submitting ? 'Đang gửi...' : 'Thêm phiếu mượn'}
        </button>

       
      </form>
    </section>
  );
}

function BookLoanRequestList() {
    const [bookloanRequest, setBookLoanRequest] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBookLoanRequest, setSelectedBookLoanRequest] = useState(null);  // eslint-disable-line

     const [formData, setFormData] = useState({ // eslint-disable-line
    RequestID: '',
    BooksID: '',
    StudentID: '',
    Request_date: '',
    Status: '',
    ImageUrl: '',
  });
    
    const handleUpdateRequestStatus = async (requestID, newStatus) => {
      const confirmAction = window.confirm(`Bạn có chắc muốn "${newStatus === 'approved' ? 'Duyệt' : 'Từ chối'}" yêu cầu này?`);
      if (!confirmAction) {
        return;
      }

      const postData = new FormData();
      postData.append('RequestID', requestID);
      postData.append('Status', newStatus);

      try {
        const response = await fetch('http://localhost/Library/Connection/actions/actionForBookLoanRQ.php?action=updateRequestStatus', {
          method: 'POST',
          body: postData,
        });

        const result = await response.json();
        alert(result.message);

        if (result.success) {
          // Cập nhật lại danh sách để hiển thị trạng thái mới
          setBookLoanRequest(prevRequests => 
            prevRequests.map(req => 
              req.RequestID === requestID ? { ...req, Status: newStatus } : req
            )
          );
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái yêu cầu:', err);
        alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    };


    // Hàm trợ giúp để tạo URL tuyệt đối cho hình ảnh
    const getFullImageUrl = (path) => {
      const SERVER_BASE = 'http://localhost/Library/';
      if (!path) return null; // Hoặc trả về ảnh mặc định
      if (/^https?:\/\//i.test(path)) return path; // Đã là URL tuyệt đối
      return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
    };
  
    const fetchBookLoanRQ = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/Library/Connection/actions/actionForBookLoanRQ.php?action=getAllBookLoanRQ');
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
          const normalizedData = (Array.isArray(data.data) ? data.data : []).map(item => ({
            ...item, ImageUrl: getFullImageUrl(item.ImageUrl)
          }));
          setBookLoanRequest(normalizedData);
        } else {
          throw new Error(data.message || 'Không thể lấy danh sách yêu cầu mượn');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
        fetchBookLoanRQ();
      }, []); 
    
      if (loading) return <p>Đang tải danh sách admin...</p>;
      if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (
    <>
    <section className='section-container'>
      <table className='table-container'>
        <thead>
          <tr >
            <th> <input type="radio" /></th>
            <th>Tên sinh viên</th>
            <th>Hình ảnh</th>
            <th>Ngày yêu cầu</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
           
           {bookloanRequest.map((request) => (
            
            <tr key={request.RequestID}>
              <td><input type="radio" /></td>
              <td>{request.FullName}</td>
              <td>
                {request.ImageUrl ? (
                  <img src={getFullImageUrl(request.ImageUrl)} alt={request.Title} />
                ) : (
                  'Không có ảnh'
                )}
              </td>
              <td>{request.Request_date}</td>
              <td>{request.Status}</td>
              <td>
                {request.Status === 'pending' && (
                  <div className='table-container-btn'>
                    <button className='btn-duyet' onClick={() => handleUpdateRequestStatus(request.RequestID, 'approved')} >Duyệt</button>
                    <button className='btn-tuchoi' onClick={() => handleUpdateRequestStatus(request.RequestID, 'rejected')} >Từ chối</button>
                    <button className='btn-detail'>Chi tiết</button>
                  </div>
                )}
              </td>
            </tr>

           ))}
          
        </tbody>
      </table>
    </section>

    </>
  )
}

function BookLoansManager({ onCancel })  {
  const [refreshKey, setRefreshKey] = useState(0); // eslint-disable-line
  return (
    <>
      <BookLoanRequestList />
      <BookLoanList onBookAdded={() => setRefreshKey(prev => prev + 1)} onCancel={onCancel} />
    </>
  );
}

export default BookLoansManager;