// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require("socket.io");
// const chatRoutes = require('./routes/chatRoutes');
// const { addChatMessage } = require('./chat_controll/send');
// const pool = require('./connection'); // Import pool để truy vấn DB

// // Khởi tạo ứng dụng Express
// const app = express();
// const server = http.createServer(app);

// // Chọn một cổng, ưu tiên cổng từ biến môi trường
// const PORT = process.env.PORT || 3001;

// // Cấu hình socket.io
// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:3000"], // Cho phép frontend React kết nối
//         methods: ["GET", "POST"],
//         credentials: true
//     },
//     transports: ["websocket", "polling"] // Hỗ trợ cả WebSocket và polling
// });

// // --- Middleware ---
// // Cho phép các yêu cầu từ domain khác (ví dụ: từ frontend React của bạn)
// app.use(cors({
//     origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:3000"],
//     credentials: true
// }));
// // Phân tích các request có body là JSON
// app.use(express.json());
// // Phân tích các request có body được mã hóa URL
// app.use(express.urlencoded({ extended: true }));
// // Đưa instance `io` vào request để các route có thể sử dụng
// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });

// // --- Routes ---
// // Gắn router chat vào đường dẫn /api/chat
// app.use('/api/chat', chatRoutes);

// // --- Socket.io Connection ---
// io.on('connection', (socket) => {
//     console.log(`User Connected: ${socket.id}`);

//     // 1. Lắng nghe sự kiện client yêu cầu tham gia phòng chat riêng
//     socket.on('joinRoom', (studentID) => {
//         if (studentID) {
//             // Tạo một tên phòng duy nhất cho mỗi sinh viên
//             const roomName = `chat_user_${studentID}`;
//             socket.join(roomName);
//             console.log(`User ${socket.id} with StudentID ${studentID} joined room: ${roomName}`);
//         }
//     });

//     // 2. Lắng nghe sự kiện admin tham gia
//     socket.on('adminJoin', () => {
//         const adminRoom = 'admins_room';
//         socket.join(adminRoom);
//         console.log(`Admin ${socket.id} joined room: ${adminRoom}`);
//     });

//     // Lắng nghe sự kiện gửi tin nhắn từ client
//     socket.on('sendMessage', async (data) => {
//         try {
//             // A. Lưu tin nhắn vào database
//             const result = await addChatMessage(data);
//             if (result.success) {
//                 // B. Lấy lại tin nhắn vừa tạo để có đầy đủ thông tin
//                 const [rows] = await pool.query('SELECT c.*, s.FullName, a.AdminName FROM chat c LEFT JOIN students s ON c.StudentID = s.StudentID LEFT JOIN admins a ON c.AdminID = a.AdminID WHERE c.ChatID = ?', [result.insertId]);
//                 const newMessage = rows[0];
                
//                 // C. Gửi tin nhắn chỉ tới phòng chat riêng của sinh viên đó
//                 if (newMessage && newMessage.StudentID) {
//                     const roomName = `chat_user_${newMessage.StudentID}`;
//                     io.to(roomName).emit('newMessage', newMessage);

//                     // D. Gửi tin nhắn đến phòng của admin để cập nhật real-time
//                     io.to('admins_room').emit('newMessage', newMessage);
//                 }
//                 // E. Gửi lại kết quả cho người gửi (có thể là admin hoặc student)
//                 // để xác nhận tin nhắn đã được xử lý
//                 // Gửi cho cả student và admin
//                 socket.emit('sendMessageResult', { success: true, message: 'Tin nhắn đã được gửi.', tempId: data.tempId });
//             } else {
//                 socket.emit('sendMessageResult', { success: false, message: 'Lỗi khi lưu tin nhắn.' });
//             }
//         } catch (error) {
//             console.error('Socket.io error on sendMessage:', error);
//             socket.emit('sendMessageResult', { success: false, message: 'Lỗi server: ' + error.message });
//         }
//     });

//     socket.on('disconnect', () => {
//         console.log('User Disconnected', socket.id);
//     });
// });

// // Khởi động server
// server.listen(PORT, () => {
//     console.log(`Server đang chạy trên cổng http://localhost:${PORT}`);
// });
