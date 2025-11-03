import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Navigate, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

function HandleMyListBook() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const[listbook, setListBook] = useState([]);
    const[error, setError] = useState(null);
    const[loading, setLoading] = useState(true);

  useEffect(() => {
        // Chỉ fetch khi có thông tin người dùng (user)
        if (!user || !user.StudentID) {
            setLoading(false);
            setError("Bạn cần đăng nhập để xem thông tin cá nhân.");
            return;
        }

        const fetchListBook = async () => {
            setLoading(true);
            setError(null);
            try {
                // 4. Thêm StudentID vào URL và sửa lại tên action
                const response = await fetch(`http://localhost/Library/Connection/actions/actionForMyList.php?action=getListByStudent&StudentID=${user.StudentID}`);
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }
                const result = await response.json();
                if (result.success && result.data) {
                    setListBook(result.data); // 5. Set profile là một object
                } else {
                    throw new Error(result.message || 'Không thể tải dữ liệu sinh viên');
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu sinh viên: ", err);
                setError(err.message); // 6. Sửa lại cách set lỗi
            } finally {
                setLoading(false);
            }
        };

        fetchListBook();
    }, [user]); 

       const getFullImageUrl = (path) => {
        const SERVER_BASE = 'http://localhost/Library/';
        if (!path) return '/default-avatar.png'; // Ảnh mặc định
        if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path;
        return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
    };


    const HandleDeleteFromList = async (ListID) =>  {
        
        try {
            const params = new URLSearchParams();
            params.append('action', 'deleteFromList');
            params.append('ListID', String(ListID));

            const res = await fetch('http://localhost/Library/Connection/actions/actionForMyList.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            const result = await res.json();
            if (result.success) {
               Swal.fire({
                text: 'Đã xóa khỏi danh sách',
                icon: 'success',
                position: 'top-end',
                heightAuto: false,
                backdrop: false,
                showConfirmButton: false,
                timer: 1000,
               })
                
                // Cập nhật state để xóa sách khỏi UI mà không cần reload
                setListBook(prevList => prevList.filter(book => book.ListID !== ListID));
            } else {
                throw new Error(result.message || `HTTP ${res.status}`);
            }
        } catch (err) {
            console.error('DeleteBook error:', err);
            alert(`Lỗi khi xóa: ${err.message}`);
        }
    };

    return (

            <>              

            <section className="section-listbook-container">
                <div className="section-listbook">
                    <h1>Lorem ipsum dolor 12 amet consectetur.</h1>
                </div>
                <div className="section-listbook">
                    <div className="section-list-content">
                        <div className="content-number">
                            <span>1</span></div>   
                        <div className="content-info">
                            <p className="info-title">Lorem, ipsum dolor.</p>
                            <p className="info-more">Lorem ipsum dolor sit amet consectetur .</p>     
                        </div> 
                    </div>
                    <div className="section-list-content">
                        <div className="content-number">
                            <span>2</span>
                        </div>
                         <div className="content-info">
                            <p className="info-title">Lorem, ipsum dolor.</p>
                            <p className="info-more">Lorem ipsum dolor sit amet consectetur .</p>     
                        </div> 
                    </div>
                    <div className="section-list-content">
                        <div className="content-number">
                            <span>3</span>
                        </div>
                         <div className="content-info">
                            <p className="info-title">Lorem, ipsum dolor.</p>
                            <p className="info-more">Lorem ipsum dolor sit amet consectetur .</p>     
                        </div> 
                    </div>
                    
                </div>
            </section>

            <section className="section-bookcase">
                <div className="bookcase-container">
                    <div className="bookcase-card">
                        {listbook.map((b) => (
                            <div className="bookcase-card-info" key={b.BooksID}> 
                                <div className="card-info">
                                    <img src={getFullImageUrl(b.ImageUrl)} onClick={() => navigate(`/book/${b.BooksID}`)}/>
                                    <div className="card-title">
                                        <p>{b.Title}</p>
                                        <span>SL: {b.StockQuantity}</span>
                                        <span>{b.BookImportDate ? new Date (b.BookImportDate).getFullYear() : '????'}</span>
                                    </div>
                                </div>
                                <i class="ri-close-large-line" onClick={() => HandleDeleteFromList(b.ListID)}></i>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

                
                
            </>

    );
}

export default HandleMyListBook;