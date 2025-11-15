const express = require('express');
const router = express.Router();
const { addChatMessage } = require('../chat_controll/send.js');
const { getChatMessages } = require('../chat_controll/get.js');
const { deleteChatMessageById } = require('../chat_controll/delete.js');
const pool = require('../connection.js'); // Import pool để truy vấn DB

/**
 * @route   POST /api/chat/send
 * @desc    Gửi một tin nhắn chat mới
 * @access  Public (bạn có thể thêm xác thực người dùng ở đây sau)
 */
router.post('/send', async (req, res) => {
    try {
        // Lấy dữ liệu từ body của request
        const { studentID, adminID, content } = req.body;

        // Kiểm tra dữ liệu đầu vào cơ bản
        if (!studentID || !content) {
            return res.status(400).json({ success: false, message: 'StudentID và content là bắt buộc.' });
        }

        // Gọi hàm để thêm tin nhắn vào database
        const result = await addChatMessage({ studentID, adminID, content });

        if (result.success) {
            // Lấy lại tin nhắn vừa tạo để có đầy đủ thông tin
            const [rows] = await pool.query('SELECT c.*, s.FullName, a.AdminName FROM chat c LEFT JOIN student s ON c.StudentID = s.StudentID LEFT JOIN admin a ON c.AdminID = a.AdminID WHERE c.ChatID = ?', [result.insertId]);
            const newMessage = rows[0];
            // Phát tin nhắn mới đến tất cả client qua socket.io
            if (newMessage) {
                req.io.emit('newMessage', newMessage);
            } else {
                console.error('Không thể lấy tin nhắn mới từ database.');
                return res.status(500).json({ success: false, message: 'Không thể lấy tin nhắn mới từ database.' });
            }
        }
        res.status(201).json(result);
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi gửi tin nhắn.', error: error.message });
    }
});

/**
 * @route   GET /api/chat/messages
 * @desc    Lấy các tin nhắn (có thể lọc theo studentID)
 * @access  Public
 */
router.get('/messages', async (req, res) => {
    try {
        // Lấy studentID từ query parameters của URL (ví dụ: ?studentID=123)
        const { studentID } = req.query;
        
        let query = `
            SELECT 
                c.*, 
                s.FullName, 
                a.AdminName 
            FROM chat c
            LEFT JOIN student s ON c.StudentID = s.StudentID
            LEFT JOIN admin a ON c.AdminID = a.AdminID
        `;
        const queryParams = [];
        if (studentID) {
            query += ` WHERE c.StudentID = ?`; // Chỉ lấy tin nhắn của cuộc trò chuyện này
            queryParams.push(studentID);
        }
        const [rows] = await pool.query(query + ` ORDER BY c.sent_date ASC`, queryParams);
        const result = { success: true, data: rows };
        res.status(200).json(result); // 200 OK: Phản hồi thành công cho GET
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ lấy tin nhắn.' });
    }
});

// Shared handler so we can register two routes (with and without param)
async function handleDeleteMessage(req, res) {
    try {
        // Hỗ trợ ChatID truyền qua body hoặc params (ví dụ: /delete/95)
        const ChatID = req.body?.ChatID ?? req.params?.ChatID;

        // Kiểm tra dữ liệu đầu vào cơ bản
        const id = Number(ChatID);
        if (!ChatID || Number.isNaN(id) || id <= 0) {
            return res.status(400).json({ success: false, message: 'ChatID không hợp lệ.' });
        }

        // Lấy tin nhắn trước khi xóa để phát sự kiện thu hồi (client có thể dùng ChatID để loại bỏ)
        const [existingRows] = await pool.query(
            'SELECT c.*, s.FullName, a.AdminName FROM chat c LEFT JOIN student s ON c.StudentID = s.StudentID LEFT JOIN admin a ON c.AdminID = a.AdminID WHERE c.ChatID = ?',
            [id]
        );

        if (!existingRows || existingRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn.' });
        }

        const messageBeforeDelete = existingRows[0];

        // Thực hiện xóa (thu hồi)
        const result = await deleteChatMessageById({ ChatID: id });

        // Kiểm tra kết quả xóa
        if (result && result.success && result.data && result.data.affectedRows > 0) {
            // Phát sự kiện thông báo tin nhắn đã bị thu hồi
            req.io.emit('messageDeleted', { ChatID: id, deletedMessage: messageBeforeDelete });
            return res.status(200).json({ success: true, message: 'Thu hồi tin nhắn thành công.', ChatID: id });
        }

        // Nếu affectedRows === 0 -> không xóa được
        return res.status(500).json({ success: false, message: 'Không thể thu hồi tin nhắn.' });
    } catch (error) {
        console.error('Lỗi khi xóa tin nhắn:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi Xóa tin nhắn.', error: error.message });
    }
}

// Register two routes to avoid optional-param parsing issues
router.delete('/delete', handleDeleteMessage);
router.delete('/delete/:ChatID', handleDeleteMessage);

module.exports = router;