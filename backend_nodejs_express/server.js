const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

// Khởi tạo ứng dụng Express
const app = express();

// Chọn một cổng, ưu tiên cổng từ biến môi trường
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// Cho phép các yêu cầu từ domain khác (ví dụ: từ frontend React của bạn)
app.use(cors());
// Phân tích các request có body là JSON
app.use(express.json());
// Phân tích các request có body được mã hóa URL
app.use(express.urlencoded({ extended: true }));


// --- Routes ---
// Gắn router chat vào đường dẫn /api/chat
app.use('/api/chat', chatRoutes);

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng http://localhost:${PORT}`);
});