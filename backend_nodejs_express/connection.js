// Sử dụng thư viện 'mysql2' với hỗ trợ Promises
const mysql = require('mysql2/promise');

// Tạo một "pool" kết nối thay vì một kết nối đơn lẻ.
// Pool sẽ quản lý nhiều kết nối để tăng hiệu suất và độ tin cậy.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'library',
    waitForConnections: true,
    connectionLimit: 10, // Số lượng kết nối tối đa trong pool
    queueLimit: 0
});

// Kiểm tra kết nối bằng cách thử lấy một kết nối từ pool
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Successfully connected to the database pool.");
        connection.release(); // Trả kết nối về lại pool
    } catch (err) {
        console.error('Failed to connect to the database pool:', err);
    }
})();

// Xuất (export) pool để các file khác trong dự án có thể sử dụng lại
module.exports = pool;
