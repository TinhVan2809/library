import { useAuth } from "./AuthContext";
import { useState, useEffect, useRef } from "react";
import io from 'socket.io-client';


const socket = io('http://localhost:3001');

function HandleChatMessage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [admin, setAdmin] = useState([]); //eslint-disable-line
    const [selectedAdminId, setSelectedAdminId] = useState(''); //eslint-disable-line
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatBoxRef = useRef(null);

    // Hàm để đóng/mở chat box
    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
    }

    const SERVER_BASE = 'http://localhost/Library/';

    const getFullImageUrl = (path) => {
        if (!path) return null;
        if (/^https?:\/\//i.test(path)) return path;
        return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
    };

    // Fetch admin list và lịch sử chat khi chat box mở
    useEffect(() => {
        if (!isChatOpen) return;

        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Lấy danh sách admin
                const adminResponse = await fetch('http://localhost/Library/Connection/actions/action.php?action=getAdmins');
                const adminResult = await adminResponse.json();
                if (adminResult.success) {
                    setAdmin(adminResult.data);
                }

                // Lấy lịch sử tin nhắn (nếu đã đăng nhập)
                if (user?.StudentID) {
                    const messagesResponse = await fetch(`http://localhost:3001/api/chat/messages?studentID=${user.StudentID}`);
                    const messagesResult = await messagesResponse.json();
                    if (messagesResult.success) {
                        setMessages(messagesResult.data);
                    }
                }
            } catch (err) {
                setError('Không thể tải dữ liệu chat.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, [isChatOpen, user]);

    // Xử lý logic socket.io
    useEffect(() => {
        // Khi có thông tin người dùng, yêu cầu server cho vào phòng chat riêng
        if (user?.StudentID) {
            socket.emit('joinRoom', user.StudentID);
        }

        // Lắng nghe tin nhắn mới từ server
        socket.on('newMessage', (newMessage) => {
            setMessages(prevMessages => {
                // Kiểm tra xem tin nhắn đã tồn tại chưa (dựa trên ChatID hoặc nội dung + thời gian)
                const messageExists = prevMessages.some(msg => {
                    // Nếu ChatID khớp
                    if (msg.ChatID && newMessage.ChatID && msg.ChatID === newMessage.ChatID) {
                        return true;
                    }
                    // Nếu là tin nhắn tạm thời và nội dung + StudentID khớp
                    if (msg.ChatID?.toString().startsWith('temp-') && 
                        msg.StudentID === newMessage.StudentID &&
                        msg.content === newMessage.content) {
                        return true;
                    }
                    return false;
                });

                // Nếu tin nhắn đã tồn tại, thay thế tin nhắn tạm thời bằng tin nhắn thực
                if (messageExists) {
                    return prevMessages.map(msg => {
                        // Thay thế tin nhắn tạm thời bằng tin nhắn thực từ server
                        if (msg.ChatID?.toString().startsWith('temp-') && 
                            msg.StudentID === newMessage.StudentID &&
                            msg.content === newMessage.content) {
                            return { ...msg, ChatID: newMessage.ChatID, pending: false };
                        }
                        return msg;
                    });
                }

                // Nếu là tin nhắn mới, thêm vào
                return [...prevMessages, newMessage];
            });
        });

        // Dọn dẹp listener khi component unmount
        return () => {
            socket.off('newMessage');
        };
    }, [user]);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!content.trim() || !user) return;

        const messageData = {
            StudentID: user.StudentID,
            AdminID: selectedAdminId || null, // Gửi null nếu không chọn admin cụ thể
            content: content.trim(),
        };

        // 1. Cập nhật giao diện "lạc quan" (Optimistic UI Update)
        // Tạo một đối tượng tin nhắn tạm thời để hiển thị ngay lập tức.
        const optimisticMessage = {
            ChatID: `temp-${Date.now()}`, // Dùng ID tạm thời
            ...messageData,
            FullName: user.FullName, // Lấy tên từ context
            sent_date: new Date().toISOString(), // Dùng thời gian hiện tại
            pending: true, // Đánh dấu là đang chờ server xác nhận
        };
        // Thêm tin nhắn tạm thời này vào state để UI cập nhật
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);

        // 2. Gửi tin nhắn thật qua socket tới server
        socket.emit('sendMessage', messageData);

        // 3. Xóa nội dung trong ô nhập liệu
        setContent('');

        // 4. Lắng nghe phản hồi từ server (một lần duy nhất)
        const handleMessageResult = (result) => {
            if (!result.success) {
                // Nếu thất bại, hiển thị thông báo lỗi và loại bỏ tin nhắn "lạc quan".
                setError(result.message || 'Không thể gửi tin nhắn.');
                setMessages(prevMessages =>
                    prevMessages.filter(msg => msg.ChatID !== optimisticMessage.ChatID)
                );
            }
            // Dọn dẹp listener sau khi xử lý (quan trọng để tránh memory leaks)
            socket.off('sendMessageResult', handleMessageResult);
        };
        
        socket.once('sendMessageResult', handleMessageResult);
    };

    return (
        <>
            <div className="chat-icon" onClick={toggleChat}>
                <i className="ri-message-2-fill"></i>
            </div>
            {isChatOpen && (
                <div className="chat-box" id="chat-box">
                    <div className="chat-header">
                        <h4>Chat với Admin</h4>
                        <button onClick={toggleChat} className="close-chat-btn">&times;</button>
                    </div>
                    <div className="chat-messages" ref={chatBoxRef}>
                        {loading && 
                            <>
                                  
                    <div aria-label="Loading..." role="status" className="chat-loader">
                        <svg class="icon" viewBox="0 0 256 256">
                            <line x1="128" y1="32" x2="128" y2="64" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                            <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                            <line x1="224" y1="128" x2="192" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                            <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                            <line x1="128" y1="224" x2="128" y2="192" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                            <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                            <line x1="32" y1="128" x2="64" y2="128" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                            <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24"></line>
                        </svg>
                    <span className="loading-text">Loading...</span>
                    </div>
                                                </>
                        }
                        {error && <p className="error">{error}</p>}
                        {messages.map((msg, index) => (
                            <div key={msg.ChatID || `temp-${index}`} className={`message ${msg.AdminID ? 'admin-message' : 'user-message'}`}>
                               <div className="mess-main">
                                     <strong>{msg.AdminID ? (msg.AdminName || 'Admin') : msg.FullName}:</strong> {msg.content}
                               </div>
                                <span>{new Date(msg.sent_date).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                    <form className="chat-input-form" onSubmit={handleSendMessage}>
                        <input type="text" placeholder="Nhập tin nhắn..." value={content} onChange={(e) => setContent(e.target.value)} disabled={!user} />
                        <button type="submit" disabled={!content.trim() || !user}>Gửi</button>
                    </form>
                </div>
            )}
        </>
    );
}

export default HandleChatMessage;
       