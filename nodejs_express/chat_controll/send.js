// 1. Sửa lại đường dẫn để trỏ đúng đến file connection.js
const pool = require('../connection.js');

async function addChatMessage({ StudentID, AdminID, studentID, adminID, content }) {
    // Normalize parameters - handle both camelCase and PascalCase
    const finalStudentID = StudentID || studentID;
    const finalAdminID = AdminID || adminID;
    
    //    sent_date sẽ tự động được gán giá trị current_timestamp() theo định nghĩa bảng.
    const sql = 'INSERT INTO chat (StudentID, AdminID, content) VALUES (?, ?, ?)';
    const values = [finalStudentID, finalAdminID || null, content];

    try {
        //    Thư viện mysql2 sẽ xử lý việc escape các giá trị này để chống SQL injection.
        const [result] = await pool.query(sql, values);

        //    Chúng ta có thể trả về ID của tin nhắn vừa được chèn.
        console.log(`✓ Message inserted with ID: ${result.insertId} (StudentID: ${finalStudentID}, Content: ${content})`);
        return { success: true, insertId: result.insertId, message: 'Tin nhắn đã được gửi thành công.' };
    } catch (err) {
        console.error('✗ Error inserting chat message:', err.message);
        // Ném lỗi ra ngoài để nơi gọi hàm có thể xử lý.
        throw err;
    }
}

// --- Ví dụ cách gọi hàm ---
// addChatMessage({ studentID: 1, adminID: 1, content: "Xin chào, tôi cần hỗ trợ." })
//     .then(result => {
//         if (result.success) {
//             console.log('Message sent successfully!');
//         }
//     })
//     .catch(err => {
//         console.error('Failed to send message.');
//     });

// Xuất hàm để các module khác có thể gọi
module.exports = { addChatMessage };