const express = require('express');
const router = express.Router();
const { addChatMessage } = require('../chat_controll/send.js');
const { getChatMessages } = require('../chat_controll/get.js');

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
        res.status(201).json(result); // 201 Created: Phản hồi thành công khi tạo mới tài nguyên
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi gửi tin nhắn.' });
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
        
        const result = await getChatMessages({ studentID });
        res.status(200).json(result); // 200 OK: Phản hồi thành công cho GET
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ lấy tin nhắn.' });
    }
});

module.exports = router;