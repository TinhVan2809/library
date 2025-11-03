import { useState, useEffect } from 'react';
import BookList from './Home';
import Footer from './Footer';
import LoginForm from './Login';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import MyBrrows from './Mybrrows';
import BookDetail from './Bookdetail';
import ProtectedRoute from './ProtectedRoute';
import SeriesPage from './SeriesPage'; // Import component mới
import { AuthProvider, useAuth } from './AuthContext'; 
import Nominnate from './Nominate';
import ContactUs from './ContactUs';
import './cssuser/theme.css';
import ThemeToggle from './ThemeToggle';
import CreateAccount from './CreateAccount';
import Profile from './Profile';
import HandleMyListBook from './MyListBook';
import HandleFilter from './HandleFilter';
import HandleNotification from './Notification';

import './cssuser/App.css'
import './cssuser/Home.css'
import './cssuser/footer.css'
import './cssuser/Login.css'
import './cssuser/Nominate.css'
import './cssuser/BookDetail.css'
import './cssuser/ContactUs.css'
import './cssuser/SeriesPage.css' 
import './cssuser/Filter.css'
import './cssuser/Profile.css'
import './cssuser/MyList.css'

import Image from './Image'; // Import component Image mới

import { BookcaseProvider, useBookcase } from './BookcaseContext';
function Navigation() {
  // Người dùng
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

  
  // Tủ sách
    const { items: bookcaseItems, loading: loadingBookcase, deleteFromList } = useBookcase();
    const [showBookCase, setShowBookCase] = useState(false);



      const SERVER_BASE = 'http://localhost/Library/';
      // Hàm trợ giúp để tạo URL tuyệt đối cho hình ảnh
    const getFullImageUrl = (path) => {
      if (!path) return null;
      if (/^https?:\/\//i.test(path)) return path;
      return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
  };


    // Fetch dữ liệu cho tủ sách khi người dùng hover
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const response = await fetch(`http://localhost/Library/Connection/actions/actionForNotifications.php?action=getUnread&StudentID=${user.StudentID}`);
                const result = await response.json();
                if (result.success) {
                    setNotifications(result.data);

                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Lấy thông báo mới mỗi phút

        return () => clearInterval(interval);
    }, [user]);

    const handleNotificationClick = async (notification) => {
        // Đánh dấu đã đọc
        const postData = new FormData();
        postData.append('NotificationID', notification.NotificationID);
        postData.append('StudentID', user.StudentID);

        try {
            await fetch('http://localhost/Library/Connection/actions/actionForNotifications.php?action=markAsRead', {
                method: 'POST',
                body: postData,
            });
            // Xóa thông báo khỏi danh sách trên UI
            setNotifications(prev => prev.filter(n => n.NotificationID !== notification.NotificationID));
            // Chuyển hướng
            if (notification.Link) {
                navigate(notification.Link);
            }
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleDeleteFromBookcase = (e, listId) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra các phần tử cha
        // Gọi hàm xóa từ context, nó sẽ xử lý cả API và cập nhật state
        deleteFromList(listId);
    };

    const [theme, setTheme] = useState(() => {
      try {
        return localStorage.getItem('app_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      } catch {
        return 'light';
      }
    });

    useEffect(() => {
      if (theme === 'dark') {
        document.documentElement.classList.add('theme-dark');
      } else {
        document.documentElement.classList.remove('theme-dark');
      }
      try { localStorage.setItem('app_theme', theme); } catch {}
    }, [theme]);

    function MultiLevelMenu() {
      const [openKeys, setOpenKeys] = useState(new Set());

      const toggleKey = (key) => {
        setOpenKeys(prev => {
          const s = new Set(prev);
          if (s.has(key)) s.delete(key); else s.add(key);
          return s;
        });
      };

     const handleSetTheme = (t) => {
       setTheme(t);
       // optionally close menu after choice
       setOpenKeys(prev => {
         const s = new Set(prev);
         s.delete('root');
         s.delete('theme');
         return s;
       });
     };

     
      
      return (
        <li className={`multi-menu`}>
          <button style={{fontSize: '15px'}} type="button" className="menu-toggle" onClick={() => toggleKey('root')}>
            Xem thêm <i id='list-categories' className="ri-arrow-down-s-line"></i>
          </button>
    
          <ul className={`menu-level-1 ${openKeys.has('root') ? 'open' : ''}`} aria-label="Xem thêm">

            <li className='li-main'><NavLink to="/categories">Thể loại</NavLink></li>  

            <li className='li-main'><NavLink to="/series">Trọn bộ sách</NavLink></li>

            <li  >
                  <button type="button" className="submenu-toggle" onClick={() => toggleKey('more')}>Ngôn ngữ</button>
                  <ul className={`menu-level-2 ${openKeys.has('more') ? 'open' : ''}`}>
                    <li><a href="#">Tiếng Anh</a></li>
                    <li><a href="#">Tiếng Việt</a></li>
                  </ul>
            </li>
    
            <li className='li-main'>
              <button type="button" className="submenu-toggle" onClick={() => toggleKey('season')}>Mùa</button>
              <ul className={`menu-level-2 ${openKeys.has('season') ? 'open' : ''}`}>
                <li><a href="#">2017</a></li>
                <li><a href="#">2018</a></li>
                <li><a href="#">2019</a></li>
                <li><a href="#">2020</a></li>
                <li><a href="#">2021</a></li>
                <li><a href="#">2022</a></li>
                <li><a href="#">2023</a></li>
                <li><a href="#">2024</a></li>
                <li><a href="#">2025</a></li>
                
              </ul>
            </li>

            <li className='li-main'>
                <button type='button' className="submenu-toggle" onClick={() => toggleKey('theme')}>Chủ đề</button>
                <ul className={`menu-level-2 ${openKeys.has('theme') ? 'open' : ''}`}>
                    <li>
                      <button
                        type="button"
                        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleSetTheme('light')}
                        aria-pressed={theme === 'light'}
                      >
                        Sáng
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleSetTheme('dark')}
                        aria-pressed={theme === 'dark'}
                      >
                        Tối
                      </button>
                    </li>
                  </ul>
            </li>
    
            <li className='li-main'><NavLink to="/contactus">Liên hệ</NavLink></li>
          </ul>
        </li>
      );
    }

    // Hàm xử lý đăng xuất: gọi logout từ context và chuyển hướng
    const handleLogout = () => {
      logout();
      navigate('/login');
    };


    return (
      <>
      
     <nav className="nav-container">
      <ul>
        <li className='logo' onClick={() => navigate('/')}> 
            LIBRARY
        </li>
        <li className='home'><NavLink to="/" className={({ isActive }) => isActive ? 'li-active' : ''}>Trang chủ</NavLink></li>
        <li><NavLink to="/my-borrows" className={({ isActive }) => isActive ? 'li-active' : ''}>Danh sách mượn của tôi</NavLink></li>
        
        {/* {Xem thêm} */}
        <MultiLevelMenu /> 


         <li className='phone'>
          <div className="contact">
            <p><i className="ri-customer-service-line"></i> 0818.177.533</p>
            <p><i className="ri-customer-service-line"></i> 0813.502.953</p>  
          </div>
        </li> 


           {user && (
            <li className="notifications-bell" onClick={() => setShowNotifications(!showNotifications)}>
                {/* <i className="ri-notification-3-line"></i> */}
                <img src="/free-notifications-bell-outline-icon-png-701751694974381h7wblk6fpx.png" />
                {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                {showNotifications && (
                    <div className="notifications-dropdown">
                        {notifications.length > 0 ? (
                            notifications.map(n => (

                                <div className="notication-drop">
                                  <div key={n.NotificationID} className="notification-item" onClick={() => handleNotificationClick(n)}>
                                      <div>
                                        {n.Message}
                                      </div>
                                  </div>
                                  <div>
                                      <p onClick={() => navigate(`notification`)}>Xem thêm</p>
                                  </div>
                                </div>
                                
                            ))
                        ) : <div className="notification-item">
                              <p>Không có thông báo mới</p>
                              <p onClick={() => navigate(`notification`)}>Xem thêm</p>
                          </div>}
                    </div>
                )}
            </li>
           )}

         <li className="my-bookcase" onMouseEnter={() => setShowBookCase(true)} onMouseLeave={() => setShowBookCase(false)}>
           <img src="/pngtree-bookshelf-line-icon-vector-png-image_6706769.png" title='Tủ sách của tôi' onClick={() => navigate(`/mylistbook`)}/>
        
          {showBookCase && (
             <div className="bookcase-dropdown">
                {user ? (
                    loadingBookcase ? <p>Đang tải...</p> :
                    bookcaseItems.length > 0 ? (
                        <div className="bookcase-list">
                            {bookcaseItems.map(item => (
                                <div 
                                    key={item.ListID} 
                                    className="bookcase-item" 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Ngăn điều hướng đến /mylistbook
                                        navigate(`/book/${item.BooksID}`);
                                    }} 
                                >
                                    <Image src={item.ImageUrl} alt={item.Title} />
                                    <div className="bookcase-item-info">
                                        <p title={item.Title}>{item.Title}</p>
                                        {/* Nút xóa sách */}
                                        <button className="btn-delete-bookcase" onClick={(e) => handleDeleteFromBookcase(e, item.ListID)}>Xóa</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Tủ sách của bạn trống.</p>
                    )
                ) : (
                    <h4>Bạn cần đăng nhập</h4>
                )}
             </div>
          )}
         </li>
        {user ? (
          <li className="user-menu" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
            <img src={getFullImageUrl(user.Avata_image) || '/user-icon-icon_1076610-59410-Photoroom.png'} alt={user.FullName} className='image-avata'/>
            <span>{user.FullName}</span>
            {showDropdown && (
              <div className="user-dropdown">
                <button className='user-menu-profile' onClick={() => navigate('/profile')}>Profile</button>
                <button onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </li>
        ) : (
          <li><NavLink className={"navlink-login"} to="/login"><button className="animated-button">
  <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
  </svg>

  <span className="text">Đăng nhập</span>

  <span className="circle"></span>

  <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
  </svg>

</button></NavLink></li>   
        )}

        <div className='list-icon'>
          <input type="checkbox" id="checkbox" />
          <label htmlFor="checkbox" className="toggle">
              <div className="bars" id="bar1"></div>
              <div className="bars" id="bar2"></div>
              <div className="bars" id="bar3"></div>
          </label>

          <div className="showList">
            <ul>
              <li>Trang chủ</li>
              <li>Dánh sách mượn của tôi</li>
              <li>Xem thêm</li>
              <li>Thông báo</li>
              <li>Giỏ sách</li>
              <li>Liên hệ</li>
            </ul>
          </div>

        </div>
      </ul>


      </nav>

     
  </>
    );
}

function App() {
    return (
    <AuthProvider> 
        <BookcaseProvider>
            <Navigation />
            <div className="container">
            <Routes>
                <Route path="/" element={<BookList />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/create" element={<CreateAccount />} />
                <Route path="/my-borrows" element={ <ProtectedRoute><MyBrrows /></ProtectedRoute>} />
                <Route path="/book/:bookId" element={<BookDetail />} />
                <Route path="/nominate" element={<Nominnate />} />
                <Route path="/series" element={<SeriesPage />} />
                <Route path="/contactus" element={<ContactUs/>} />
                <Route path="/profile" element={<Profile/>} />
                <Route path="/list_categories" element={<HandleFilter/>} />
                <Route path="/mylistbook" element={<HandleMyListBook/>} />
                <Route path="/notification" element={<HandleNotification/>} />
            </Routes>
            </div>

            <div className="footer-container" >
            <Footer />
            </div>
        </BookcaseProvider>

    </AuthProvider>
    )
}

export default App
