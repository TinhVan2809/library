import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function MyBrrows() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [requestedBooks, setRequestedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Hàm trợ giúp để tạo URL tuyệt đối cho hình ảnh
    const getFullImageUrl = (path) => {
        const SERVER_BASE = 'http://localhost/Library/';
        if (!path) return '/placeholder.png'; // Đã nhất quán, không cần thay đổi
        if (/^https?:\/\//i.test(path)) return path;
        return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
    };

    useEffect(() => {
        // Chỉ fetch khi có thông tin người dùng
        if (user && user.StudentID) {
            const fetchAllData = async () => {
                setLoading(true);
                setError('');
                try {
                    const [borrowedRes, requestedRes] = await Promise.all([
                        fetch(`http://localhost/Library/Connection/actions/actionForBookLoans.php?action=getBookLoansByStudent&StudentID=${user.StudentID}`),
                        fetch(`http://localhost/Library/Connection/actions/actionForBookLoanRQ.php?action=getBookLoanRQByStudent&StudentID=${user.StudentID}`)
                    ]);

                    if (!borrowedRes.ok || !requestedRes.ok) {
                        throw new Error(`Lỗi HTTP: Không thể tải dữ liệu.`);
                    }

                    const borrowedResult = await borrowedRes.json();
                    const requestedResult = await requestedRes.json();

                    // Xử lý sách đã mượn
                    if (borrowedResult.success && Array.isArray(borrowedResult.data)) {
                        const normalizedBorrowed = borrowedResult.data.map(item => ({
                            ...item,
                            ImageUrl: getFullImageUrl(item.ImageUrl)
                        }));
                        setBorrowedBooks(normalizedBorrowed);
                    } else {
                        setError(prev => prev + (borrowedResult.message || ' Lỗi tải sách đã mượn.'));
                    }

                    // Xử lý sách đang yêu cầu
                    if (requestedResult.success && Array.isArray(requestedResult.data)) {
                        const normalizedRequested = requestedResult.data.map(item => ({
                            ...item,
                            ImageUrl: getFullImageUrl(item.ImageUrl)
                        }));
                        setRequestedBooks(normalizedRequested);
                    } else {
                        setError(prev => prev + (requestedResult.message || ' Lỗi tải sách yêu cầu.'));
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchAllData();
        } else {
            setLoading(false); // Nếu không có user, dừng loading
        }
    }, [user]); // Chạy lại khi user thay đổi

    const handleCancelRequest = async (requestID) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu mượn sách này?')) {
            return;
        }

        const postData = new FormData();
        postData.append('RequestID', requestID);
        postData.append('StudentID', user.StudentID);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForBookLoanRQ.php?action=cancelBookLoanRequest', {
                method: 'POST',
                body: postData,
            });

            const result = await response.json();
            alert(result.message);

            if (result.success) {
                // Xóa yêu cầu đã hủy khỏi danh sách trên UI
                setRequestedBooks(prevRequests => prevRequests.filter(req => req.RequestID !== requestID));
            }
        } catch (err) {
            console.error('Lỗi khi hủy yêu cầu:', err);
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
    };
    if (loading) return <p className="borrow-status">Đang tải danh sách mượn...</p>;
    if (error) return <p className="borrow-status error">Lỗi: {error}</p>;
    if (!user) return <p className="borrow-status">Vui lòng đăng nhập để xem danh sách mượn.</p>;

    return (
      
        <>
          <div className="my-borrows-container">
            <h1>Sách tôi đã mượn</h1>
            {borrowedBooks.length > 0 ? (
                <div className="borrow-list">
                    {borrowedBooks.map(loan => (
                        <div key={loan.BookLoanID} className="borrow-item">
                            <img src={loan.ImageUrl} alt={loan.Title} className="borrow-item-image" />
                            <div className="borrow-item-info">
                                <h3>{loan.Title}</h3>
                                <p><strong>Ngày mượn:</strong> {loan.LoanDate}</p>
                                <p><strong>Hạn trả:</strong> {loan.DueDate}</p>
                                <p><strong>Trạng thái:</strong> <span className={`status-${loan.Status.toLowerCase()}`}>{loan.Status}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="borrow-status">Bạn chưa mượn cuốn sách nào. <Link to="/">Hãy bắt đầu mượn sách!</Link></p>
            )}
        </div>

        <div className="my-brrows-request">
            <h1>Sách đang yêu cầu mượn</h1>
            {requestedBooks.length > 0 ? (
                <div className="borrow-list">
                    {requestedBooks.map(request => (
                        <div key={request.RequestID} className="borrow-item">
                            <img src={request.ImageUrl} alt={request.Title} className="borrow-item-image" />
                            <div className="borrow-item-info">
                                <h3>{request.Title}</h3>
                                <p><strong>Ngày yêu cầu:</strong> {request.Request_date}</p>
                                <p><strong>Trạng thái:</strong> <span className={`status-${request.Status?.toLowerCase()}`}>{request.Status}</span></p>
                                {/* Chỉ hiển thị nút Hủy khi trạng thái là 'pending' */}
                                {request.Status === 'pending' && (
                                    <button className="btn-cancel-request" onClick={() => handleCancelRequest(request.RequestID)}>
                                        Hủy yêu cầu
                                    </button>
                                )}
                                <button className='btn-contact-request'>Liên hệ nhận sách</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="borrow-status">Bạn không có yêu cầu mượn sách nào.</p>
            )}
        </div>

        <div className="anyquestion-with-mybrrow">
            <button onClick={() => navigate('/contactus')}><i className="ri-phone-line"></i> Liên hệ</button>
            <button><i className="ri-question-mark"></i> Trợ giúp</button>
            <button><i className="ri-chat-1-line"></i> Chat</button>
            <button><i className="ri-arrow-go-back-line"></i> Gia hạn mượn</button>
        </div>
        </>
        
    );
}
export default MyBrrows