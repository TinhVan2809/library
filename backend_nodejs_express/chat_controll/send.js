// 1. Sửa lại đường dẫn để trỏ đúng đến file connection.js
const pool = require('../connection.js');

// 2. Đổi tên hàm để phản ánh đúng chức năng (thêm tin nhắn chat)
//    Hàm nên nhận các tham số cần thiết như studentID, adminID, và content.
async function addChatMessage({ studentID, adminID, content }) {
    // 3. Viết lại câu lệnh SQL cho đúng cú pháp INSERT
    //    Sử dụng '?' làm placeholder cho các giá trị bạn muốn chèn vào.
    //    Giả sử tên bảng của bạn là 'chat'.
    //    sent_date sẽ tự động được gán giá trị current_timestamp() theo định nghĩa bảng.
    const sql = 'INSERT INTO chat (StudentID, AdminID, content) VALUES (?, ?, ?)';
    const values = [studentID, adminID, content];

    try {
        // 4. Truyền câu lệnh SQL và mảng các giá trị vào pool.query
        //    Thư viện mysql2 sẽ xử lý việc escape các giá trị này để chống SQL injection.
        const [result] = await pool.query(sql, values);

        // 5. Lệnh INSERT trả về đối tượng result, không phải rows.
        //    Chúng ta có thể trả về ID của tin nhắn vừa được chèn.
        console.log(`Message inserted with ID: ${result.insertId}`);
        return { success: true, insertId: result.insertId };
    } catch (err) {
        console.error('Error inserting chat message:', err);
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