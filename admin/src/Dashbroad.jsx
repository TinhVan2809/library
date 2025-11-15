import { useState, useEffect, useRef } from "react";
import io from 'socket.io-client';

// Kết nối tới server socket.io
const socket = io('http://localhost:3001');

function HandleDashbroad() {
    const [conversations, setConversations] = useState({});
    const [studentList, setStudentList] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const chatBoxRef = useRef(null);
    const [stats, setStats] = useState({
        books: 0,
        series: 0,
        authors: 0,
        publishers: 0,
        loanRequests: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    // Helper function to fetch a single stat
    const fetchStat = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${url}`);
        }
        const result = await response.json();
        if (result.success) {
            // The count is the first value in the first object, e.g., { "COUNT(BooksID)": "123" }
            // Or it could be a direct value from the API. We'll handle both.
            if (typeof result.data === 'object' && result.data !== null && !Array.isArray(result.data)) {
                 return Object.values(result.data)[0] || 0;
            }
            return result.data || 0;
        }
        throw new Error(result.message || `Failed to fetch stat from ${url}`);
    };

    useEffect(() => {
        // 1. Admin tham gia phòng chat của admin
        socket.emit('adminJoin');


        // 2. Lắng nghe tin nhắn mới
        const handleNewMessage = (newMessage) => {
            setConversations(prev => {
                const studentID = newMessage.StudentID;
                const newConvos = { ...prev };
                if (!newConvos[studentID]) {
                    newConvos[studentID] = [];
                }
                // Tránh thêm tin nhắn trùng lặp (kiểm tra một lần)
                if (!newConvos[studentID].some(m => m.ChatID === newMessage.ChatID)) {
                    newConvos[studentID] = [...newConvos[studentID], newMessage];
                } else {
                    // Nếu tin nhắn đã tồn tại, không thêm nữa
                    console.log("Đã chặn tin nhắn trùng lặp:", newMessage);
                    return prev; // Không thay đổi state nếu tin nhắn trùng lặp
                }
                return newConvos;
            });

            // Cập nhật danh sách sinh viên (chỉ nếu tin nhắn được thêm vào conversations)
            setStudentList(prev => {
                const existingStudent = prev.find(s => s.StudentID === newMessage.StudentID);
                if (existingStudent) {
                    // Nếu sinh viên đã có trong danh sách, cập nhật tin nhắn cuối và đưa lên đầu
                    const updatedList = prev.filter(s => s.StudentID !== newMessage.StudentID);
                    existingStudent.lastMessage = newMessage.content;
                    existingStudent.lastMessageDate = newMessage.sent_date;
                    return [existingStudent, ...updatedList];
                } else {
                    // Nếu là sinh viên mới, thêm vào đầu danh sách
                    return [{ 
                        StudentID: newMessage.StudentID, 
                        FullName: newMessage.FullName || 'Unknown Student', 
                        lastMessage: newMessage.content,
                        lastMessageDate: newMessage.sent_date
                    }, ...prev];
                }
            });
        };

        socket.on('newMessage', handleNewMessage);

        // 3. Fetch dữ liệu ban đầu
        const fetchInitialData = async () => {

            try {
                const [statsRes, chatRes] = await Promise.all([
                    Promise.all([
                        fetchStat('http://localhost/Library/Connection/actions/actionForBooks.php?action=getCountBooks'),
                        fetchStat('http://localhost/Library/Connection/actions/actionForBooks.php?action=getCountSeries'),
                        fetchStat('http://localhost/Library/Connection/actions/actionForAuthors.php?action=getCountAuthors'),
                        fetchStat('http://localhost/Library/Connection/actions/actionForPublishers.php?action=getCountPublishers'),
                        fetchStat('http://localhost/Library/Connection/actions/actionForBookLoanRQ.php?action=getCountRequests'),
                    ]),
                    fetch('http://localhost:3001/api/chat/messages')
                ]);

                const [books, series, authors, publishers, loanRequests] = statsRes;
                setStats({ books, series, authors, publishers, loanRequests });

                const chatData = await chatRes.json();
                if (chatData.success && Array.isArray(chatData.data)) {
                    // Xử lý toàn bộ tin nhắn để hiển thị danh sách sinh viên đầu tiên
                    const allMessages = chatData.data;
                    
                    // Nhóm tin nhắn theo StudentID
                    const conversationsByStudent = {};
                    const studentMap = new Map();

                    allMessages.forEach(msg => {
                        const studentID = msg.StudentID;
                        if (!conversationsByStudent[studentID]) {
                            conversationsByStudent[studentID] = [];
                        }
                        conversationsByStudent[studentID].push(msg);

                        // Lưu thông tin sinh viên (cập nhật tin nhắn mới nhất)
                        if (!studentMap.has(studentID)) {
                            studentMap.set(studentID, { // Chỉ thêm nếu có StudentID
                                StudentID: studentID,
                                FullName: msg.FullName,
                                lastMessage: msg.content,
                                lastMessageDate: msg.sent_date,
                            });
                        } else {
                            const existing = studentMap.get(studentID);
                            // Cập nhật nếu tin nhắn này mới hơn
                            if (new Date(msg.sent_date) > new Date(existing.lastMessageDate)) {
                                existing.lastMessage = msg.content;
                                existing.lastMessageDate = msg.sent_date;
                            }
                        }
                    });

                    // Sắp xếp sinh viên theo tin nhắn mới nhất
                    const sortedStudents = [...studentMap.values()].sort((a, b) => 
                        new Date(b.lastMessageDate) - new Date(a.lastMessageDate)
                    );

                    setConversations(conversationsByStudent);
                    setStudentList(sortedStudents);
                    
                    // Tự động chọn sinh viên đầu tiên nếu có
                    if (sortedStudents.length > 0) {
                        setSelectedStudent(sortedStudents[0]);
                    }
                }
            } catch (error) {
                setError(error.message);
                console.error('Lỗi khi tải dữ liệu dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        // Dọn dẹp listener khi component unmount
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, []);

    // Cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [conversations, selectedStudent]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageContent.trim() || !selectedStudent) return;

        const messageData = {
            AdminID: 10, // TODO: Thay bằng ID admin đã đăng nhập từ context
            StudentID: selectedStudent.StudentID,
            content: messageContent.trim(),
        };

        // 1. Cập nhật giao diện "lạc quan" (Optimistic UI Update)
        const optimisticMessage = {
            ChatID: `temp-admin-${Date.now()}`,
            ...messageData,
            AdminName: "Admin", // TODO: Thay bằng tên admin đã đăng nhập
            sent_date: new Date().toISOString(),
            pending: true,
        };

        // Thêm tin nhắn tạm thời vào state để UI cập nhật
        setConversations(prev => ({
            ...prev,
            [selectedStudent.StudentID]: [
                ...(prev[selectedStudent.StudentID] || []),
                optimisticMessage
            ]
        }));

        // 2. Gửi tin nhắn thật qua socket tới server
        socket.emit('sendMessage', messageData);
        // 3. Xóa nội dung trong ô nhập liệu
        setMessageContent('');
    };

    if (loading) return <p>Đang tải dữ liệu dashboard...</p>;
    if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

    return (
      <>
      
        <section className="dashboard-container">
            <div className="stats-grid">

                <div className="stat-card">                      
                  <p>Tổng số sách</p>
                  <span>{stats.books}</span>
                </div>

                <div className="stat-card">               
                  <p>Tổng số bộ sách</p>
                  <span>{stats.series}</span>                  
                </div>

                <div className="stat-card">                                
                  <p>Tổng số tác giả</p>
                   <span>{stats.authors}</span>                 
                </div>

                <div className="stat-card">                   
                  <p>Tổng số NXB</p>
                  <span>{stats.publishers}</span>                  
                </div>

            </div>
        </section>

        <section className="dashboard-chat-container">
            <div className="student-list">
                <h3>Tin nhắn</h3><div>
                {studentList.map(student => (
                    <div 
                        key={student.StudentID} 
                        className={`student-item ${selectedStudent?.StudentID === student.StudentID ? 'active' : ''}`}
                        onClick={() => setSelectedStudent(student)}
                    >
                        <p className="student-name">{student.FullName}</p>
                        <p className="last-message">{student.lastMessage}</p>
                    </div>
                ))}
            </div></div>
            <div className="chat-area">
                {selectedStudent ? (
                    <>
                        <div className="chat-header">
                            <h4>Chat với {selectedStudent.FullName}</h4>
                        </div>
                        <div className="chat-messages" ref={chatBoxRef}>
                            {(conversations[selectedStudent.StudentID] || []).map((msg, index) => (
                                <div key={msg.ChatID || `temp-${index}`} className={`message ${msg.AdminID ? 'admin-message' : 'user-message'}`}>
                                    <strong>{msg.AdminID ? (msg.AdminName || 'Admin') : msg.FullName}: </strong>
                                    {msg.content}
                                    <span>{new Date(msg.sent_date).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input type="text" placeholder="Nhập tin nhắn..." value={messageContent} onChange={e => setMessageContent(e.target.value)} />
                            <button type="submit">Gửi</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                )}
            </div>
        </section>
    </>
    );
}

export default HandleDashbroad; 