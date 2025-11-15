const pool = require('../connection.js');

/**
 * Lấy tin nhắn giữa một Student và một Admin (hoặc tất cả nếu không có ID)
 * @param {object} options - Tùy chọn lọc
 * @param {number} [options.studentID] - ID của sinh viên
 */
async function getChatMessages({ studentID }) {
    // Sắp xếp theo sent_date để tin nhắn hiển thị đúng thứ tự
    let sql = "SELECT c.ChatID, c.content, s.FullName FROM chat c LEFT JOIN student s ON s.StudentID = c.StudentID ORDER BY sent_date DESC;";
    const params = [];

    if (studentID) {
        sql = "SELECT * FROM chat WHERE StudentID = ? ORDER BY sent_date ASC";
        params.push(studentID);
    }

    try {
        const [rows] = await pool.query(sql, params);
        return { success: true, data: rows };
    } catch (err) {
        console.error('Error getting chat messages:', err);
        throw err;
    }
}

module.exports = { getChatMessages };
