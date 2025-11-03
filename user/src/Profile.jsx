import { useState, useEffect, use } from "react";
import { useAuth } from "./AuthContext"; // 1. Import useAuth
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";


function Profile() {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth(); // Lấy thêm hàm updateUser từ context
    const [profile, setProfile] = useState(null); // 3. Khởi tạo state là null
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('profile');

    const [countLike, setCountlike] = useState(0); // Đếm số sách đã thích, khởi tạo là 0
    const [countBookLoans, setContBooksloans] = useState(0);
    const [countReview, setCountReview] = useState(0);


    // State cho việc cập nhật avatar
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);


    useEffect(() => {
        // Chỉ fetch khi có thông tin người dùng (user)
        if (!user || !user.StudentID) {
            setLoading(false);
            // setError("Bạn cần đăng nhập để xem thông tin cá nhân.");
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            
            // Gộp cả hai fetch vào một Promise.all để tối ưu
            try {
                const [profileRes, countRes, coutBookLoanRes, countReviewRes] = await Promise.all([ // Chỉ dùng cho hành động get
                    fetch(`http://localhost/Library/Connection/actions/actionForStudent.php?action=getStudentById&StudentID=${user.StudentID}`),
                    fetch(`http://localhost/Library/Connection/actions/actionForFavorites.php?action=getCountFavoritesByStudentId&StudentID=${user.StudentID}`),
                    fetch(`http://localhost/Library/Connection/actions/actionForBookLoans.php?action=getCountBookLoanByStudentId&StudentID=${user.StudentID}`),
                    fetch(`http://localhost/Library/Connection/actions/actionForReview.php?action=getCountReviewByStudent&StudentID=${user.StudentID}`)
                ]);

                if (!profileRes.ok) throw new Error(`Lỗi tải profile: ${profileRes.status}`);
                if (!countRes.ok) throw new Error(`Lỗi tải số lượt thích: ${countRes.status}`);
                if(!coutBookLoanRes.ok) throw new Error(`Lỗi tải số lượng sách đã mượn: ${coutBookLoanRes.status}`);
                if(!countReviewRes.ok) throw new Error(`Lỗi tải số lượng sách đã mượn: ${countReviewRes.status}`);

                const result = await profileRes.json();
                const countResult = await countRes.json();
                const countBookLoanResult = await coutBookLoanRes.json();
                const countReviewResult = await countReviewRes.json();

                if (result.success && result.data) {
                    setProfile(result.data);
                } else {
                    throw new Error(result.message || 'Không thể tải dữ liệu sinh viên');
                }

                if (countResult.success && countResult.data) {
                   
                    setCountlike(countResult.data.total_favorites || 0);
                } // Không cần throw error nếu không có lượt thích

                if (countBookLoanResult.success && countBookLoanResult.data) {
                    
                    setContBooksloans(countBookLoanResult.data.total_bookloan || 0);
                } 

                if (countReviewResult.success && countReviewResult.data) {
                    setCountReview(countReviewResult.data.total_review || 0);
                } 


            } catch (err) {
                console.error("Lỗi khi tải dữ liệu sinh viên: ", err);
                setError(err.message); // 6. Sửa lại cách set lỗi
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]); // 7. Thêm user vào dependency array

    const SERVER_BASE = 'http://localhost/Library/';

    // Hàm trợ giúp để tạo URL tuyệt đối cho hình ảnh
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
};


    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Vui lòng chọn ảnh.",
                showConfirmButton: false,
                timer: 1000,
                heightAuto: false,
                backdrop: false
            });
            return;
        }

        const formData = new FormData();
        formData.append('StudentID', user.StudentID);
        formData.append('avatar', avatarFile);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForStudent.php?action=updateAvatar', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                    Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Đã cập nhật ảnh đại diện.",
                    showConfirmButton: false,
                    timer: 1000,
                    heightAuto: false, 
                    backdrop: false 
                    });
                // Cập nhật state profile với đường dẫn ảnh mới từ server
                setProfile(prev => ({ ...prev, Avata_image: result.newImagePath }));
                setAvatarFile(null);
                setAvatarPreview(null);
                // *** ĐÂY LÀ BƯỚC QUAN TRỌNG: Cập nhật context ***
                updateUser({ Avata_image: result.newImagePath });
            } else {
                alert(`Lỗi: ${result.message}`);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật avatar:", error);
            alert("Đã có lỗi xảy ra phía client.");
        }
    };

    // Hàm xử lý đăng xuất: gọi logout từ context và chuyển hướng
    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    // Sử dụng một hàm duy nhất để thay đổi view
    const handleViewChange = (newView, event = null) => {
        // Ngăn sự kiện click lan ra các phần tử cha 
        if (event) event.stopPropagation();
        setView(newView);
    };

    if (loading) {
        return (
          
            <>                 
                <div className="loader"></div>
            </>
           
        );
    }

    if (error) {
        return <p className="profile-status error">Something went wrong: {error}</p>;
    }

    if (!profile) {
        return (
            <>
                
            </>
        );
    }

    if (view === 'likes') {
        return <HandleLike onBack={() => handleViewChange('profile')} />;
    } else if (view === 'browed') {
        return <HandleBrowed onBack={() => handleViewChange('profile')} />
    } else if (view === 'review') {
        return <HandleReviewed onBack={() => handleViewChange('profile')} />;
    }
  

    return (
        <>
            <div className="profile-container">
                
                <div className="profile-avatar-section">
                    <div className="avata">
                        <img src={getFullImageUrl(profile.Avata_image) || '/user-icon-icon_1076610-59410-Photoroom.png'} alt="Avatar" className="profile-avatar" />
                        <label htmlFor="avatar-upload" className="avatar-upload-label"><i className=" pen ri-pencil-line"></i></label>    
                    </div>
                    <p>{profile.FullName}</p>
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    {avatarFile && (
                        <button onClick={handleAvatarUpload} className="btn-update-avatar">Cập nhật ảnh</button>
                    )}
                </div>
                <div className="profile-info">
                    <p><i className="ri-mail-line"></i> {profile.Email}</p>
                    <p><i className="ri-graduation-cap-line"></i> {profile.StudentCode}</p>
                    <p><i className="ri-phone-line"></i> {profile.Phone}</p>
                    <div className="profile-info-btn">
                        <button>Cập nhật</button>
                    </div>
                </div>
                <div className="profile-item">
                    <div className="profile-item-brrowed profile-item-content" onClick={() => handleViewChange('browed')}>
                        <span>{countBookLoans || 0}</span>
                        <p>Đã mượn</p>
                    </div>
                    <div className="profile-item-returned profile-item-content" onClick={() => handleViewChange('review')}>
                        <span>{countReview || 0}</span>
                        <p>Đánh giá</p>
                    </div>
                    <div className="profile-item-like profile-item-content" onClick={(e) => handleViewChange('likes', e)}>
                        <span>{countLike || 0}</span>
                        <p>Yêu thích</p>
                    </div>
                </div>
                <div className="profile-list-menu">
                    <div className="profile-list-card">
                        <div className="card-right">
                            <i className="unsername-icon ri-user-line"></i>
                        </div>
                        <div className="card-info">
                            <p>Username</p>
                            <span>@{profile.Email}</span>
                        </div>
                        <div className="card-bottom">
                            <i className="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                    <hr />
                    <div className="profile-list-card">
                        <div className="card-right">
                            <i className="notifications-icon ri-notification-2-line"></i>
                        </div>
                        <div className="card-info">
                            <p>Notifications</p>
                            <span>Bookloans, Email</span>
                        </div>
                        <div className="card-bottom">
                            <i className="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                    <hr />
                    <div className="profile-list-card">
                        <div className="card-right">
                            <i className="setting-icon ri-settings-2-line"></i>
                        </div>
                        <div className="card-info">
                            <p>Setting</p>
                            <span>Privacy, Notifications</span>
                        </div>
                        <div className="card-bottom">
                            <i className="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                    <hr />
                    <div className="profile-list-card" onClick={handleLogout}>
                        <div className="card-right">
                            <i className="logout-icon ri-logout-circle-r-line"></i>
                        </div>
                        <div className="card-info">
                            <p>Log Out</p>
                            <span></span>
                        </div>
                        <div className="card-bottom">
                            <i className="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function HandleLike({ onBack }) {

    const navigate = useNavigate();
    const {user}= useAuth();
    const [like, setLike] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!user || !user.StudentID) {
            setLoading(false);
             setError("Bạn cần đăng nhập để xem thông tin cá nhân.");
            return;
        }
     const fetchLikeData = async () => {
        setLoading(true);
        setError(null);
        try{
            
            const response = await fetch(`http://localhost/Library/Connection/actions/actionForFavorites.php?action=getFavoritesByStudentId&StudentID=${user.StudentID}`);
            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }
            const result = await response.json();

            if(result.success) {
                setLike(result.data || []); 
            } else {
                throw new Error(result.message || 'Không thể tải dữ liệu.');
            }

        } catch (err) {
            setError(err.message);
            console.warn('Lỗi khi lấy danh sách sách đã yêu thích.', err);

        } finally {
            setLoading(false);
        }
     };
      fetchLikeData();

   }, [user]);

           const SERVER_BASE = 'http://localhost/Library/';

            const getFullImageUrl = (path) => {
                if (!path) return null;
                if (/^https?:\/\//i.test(path)) return path;
                return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
            };

   if(error) {
        return (
            <>
                <p>Lỗi</p>
            </>  
        );
   }
     if(loading) {
        return (
            <>
                <p>Đang tải</p>
            </>  
        );
   }


    return (

        <>


        <div className="like-container">
            <div className="like-content">
                <div className="like-content-head">
                    <button onClick={ onBack }><i className="ri-arrow-left-wide-line"></i> Back to Profile</button>
                    <p>Favorites</p>
                </div>

                <div className="like-item">
                    {like.map((like) => (
                        <div className="like-card" onClick={() => navigate(`/book/${like.BooksID}`)} key={like.favorite_id }>
                            <div className="like-info"> 
                                <div className="card-info">
                                    <img src={getFullImageUrl(like.ImageUrl) || ''} alt="" />

                                    <div className="info">
                                        <p className="like-title">{like.Title}</p>
                                        <span>{like.AuthorName}</span>
                                    </div>
                                </div>
                            </div>
                                <i className="ri-star-s-fill"></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
       
        </>
    );
}

function HandleBrowed({ onBack }) {
    const{user} = useAuth();
    const navigate = useNavigate();
    const [countBrowed, setCountBrowed] = useState(0);
    const [browed, setBrowed] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if(!user || !user.StudentID) {
            setLoading(false);
            return;
        }

        const fetchBrowedData = async () => {
            setLoading(true);
            setError(null);

            try{
                const [browedRes, countRes] = await Promise.all([
                    fetch(`http://localhost/Library/Connection/actions/actionForBookLoans.php?action=getBookLoansByStudent&StudentID=${user.StudentID}`),
                    fetch(`http://localhost/Library/Connection/actions/actionForBookLoans.php?action=getCountBookLoanByStudentId&StudentID=${user.StudentID}`)
                ]);

                if(!browedRes.ok) throw new Error(`Lỗi khi tải danh sách đã mượn: ${browedRes.status}`);
                if(!countRes.ok) throw new Error(`Lỗi khi đếm sô sách đã mượn: ${countRes.status}`);

                const result = await browedRes.json();
                const count = await countRes.json();

                if(result.success && result.data) {
                    setBrowed(result.data);
                } else {
                    throw new Error(result.message || 'Không thể tải dữ liệu đã mượn.');
                }

                if(count.success && count.data) {
                    setCountBrowed(count.data.total_bookloan || 0);
                } else {
                    throw new Error(count.message || 'Không thể tải dữ liệu đã mượn.');
                }

            } catch(err) {
                console.error('Lỗi khi tải dữ liệu đã mượn. ', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBrowedData();

    }, [user]);

    
    const SERVER_BASE = 'http://localhost/Library/';

const getFullImageUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
};

    // Hàm trợ giúp để định dạng ngày tháng thành dd/mm/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'; // Trả về 'N/A' nếu không có ngày
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Ngày không hợp lệ'; // Kiểm tra nếu ngày không hợp lệ

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng trong JavaScript bắt đầu từ 0
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };
    return (

        <>

        <section className="browed-container">
            <div className="browed-content">
                {browed.map((b) => (
                    <div className="browed-card" key={b.BooksID}>
                        <div className="card-top">
                            <img src={getFullImageUrl(b.ImageUrl)}  />
                        </div>
                        <div className="card-bottom">
                            <p>{b.Title}</p>
                            <p>Ngày mượn: {formatDate(b.LoanDate)}</p>
                            <p>Ngày trả: {formatDate(b.DueDate)}</p>
                            <p>Trạng thái: {b.Status}</p>
                        </div>
                        <div className="card-btn">
                            <button onClick={() => navigate(`/book/${b.BooksID}`)}>Chi tiết</button>
                            <button>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
        
        </>
    )
}

function HandleReviewed({ onBack }) {
    const {user} = useAuth();
   const navigate = useNavigate();
    const [review, setReview] = useState([]);
    const [countReview, setCountReview] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(!user || !user.StudentID) {
            setLoading(false); // Ngưng tải khi không thấy id người dùng
            return;
        }

        const fetchReviewData = async () => {
            setLoading(true);
            setError(null);

            try{
                const [reviewRes, countReviewRes] = await Promise.all([
                    fetch(`http://localhost/Library/Connection/actions/actionForReview.php?action=getReviewByStudentId&StudentID=${user.StudentID}`),
                    fetch(`http://localhost/Library/Connection/actions/actionForReview.php?action=getCountReviewByStudent&StudentID=${user.StudentID}`)
                ]);

                if(!reviewRes.ok) throw new Error(`Lỗi tải review: ${reviewRes.status}`);
                if(!countReviewRes.ok) throw new Error(`Lỗi tải review: ${countReviewRes.status}`);

                const result = await reviewRes.json();
                const resultCount = await countReviewRes.json();

                if(result.success && result.data) {
                    setReview(result.data);
                } else {
                    throw new Error(result.message || 'Không thể tải dữ liệu đánh giá.');

                }

                if(resultCount.success && resultCount.data) {
                    setCountReview(resultCount.data.total_review || 0);
                } else {
                    throw new Error(resultCount.message || 'Không thể tải dữ liệu đánh giá.');

                }

            } catch (err) {
                console.error('Lỗi khi tải dữ liệu đánh giá. ', err);
                setError(err.message);
            }  finally{
                setLoading(false);
            }
        };

        fetchReviewData();
    }, [user]);

    const SERVER_BASE = 'http://localhost/Library/';

const getFullImageUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
};

    return (
        <>

            <section className="review-by-student-container">
                <div className="review-item">
                    <h3 onClick={onBack}><i class="arrow-back-in-review ri-arrow-left-double-line"></i> Reviews</h3> 
                </div>
                <div className="review-item">
                    <div className="review-info">
                        <p>Total Review</p>
                        <span>{countReview}</span>
                    </div>
                    <div className="review-info">
                        <p>Averege Rating</p>
                        <span>5 <i class="ri-star-s-fill"></i></span> 
                    </div>
                </div>

                <hr />

                <div className="list-review-container">
                    <div className="list-item">
                            {review.map((r) => (
                                <div className="list-info" key={r.ReviewID}>
                                    <div className="info-img">
                                        <div className="img">
                                            <img src={getFullImageUrl(r.ImageUrl)} />
                                        </div>
                                       <div className="info-title">
                                         <p>{r.Title}</p>
                                        <span>{r.BookImportDate ? new Date(r.BookImportDate).getFullYear() : '???'}</span>
                                       </div>
                                    </div>
                                    <div className="info-comment">
                                        <p>{r.Rating} <i class="ri-star-s-fill"></i> {r.Created_at}</p>
                                        <span>{r.Comment}</span>
                                        <div className="info-comment-btn">
                                            <button onClick={() => navigate(`/book/${r.BooksID}`)}>Chi Tiết</button>
                                        </div>
                                    </div>
                                </div>

                            ))}

                    </div>
                </div>

            </section>


        
        </>
    );
}

export default Profile;