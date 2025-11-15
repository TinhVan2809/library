const pool = require('../connection.js');
const { all } = require('../routes/chatRoutes.js');

/**
 * Thu hồi tin nhắn
 * @param {object} options - Tùy chọn lọc
 * @param {number} [options.ChatID] - ID của ChatId
 */
async function deleteChatMessageById({ ChatID }) {
    
    let sql = "DELETE FROM chat WHERE ChatID = ?;";
    const params = [ChatID];

    try {
        const [fetchAll] = await pool.query(sql, params);
        return { success: true, data: fetchAll };
    } catch (err) {
        console.error('Error deleting chat messages:', err);
        throw err;
    }
}

module.exports = { deleteChatMessageById };
