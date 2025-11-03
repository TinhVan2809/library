<?php
require_once __DIR__ . '/../connectDB.php';

class admin extends Data {
 
    public function getConnection() {
       return $this->conn;
    }

    // ADD ADMIN
    public function addAdmin($AdminName, $AdminGmail, $AdminPassword, $AdminAge, $AdminGender) {
        // Kiểm tra biến trước khi khởi tạo.
        if(empty($AdminName) || empty($AdminGmail) || empty($AdminPassword) || empty($AdminAge) || empty($AdminGender)) {
            return 0;
        }

        try {
            // Sửa lại câu lệnh SQL cho đúng
            $sql = "INSERT INTO admin (AdminName, AdminGmail, AdminPassword, AdminAge, AdminGender) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            // Truyền đúng và đủ các tham số
            $stmt->execute([$AdminName, $AdminGmail, $AdminPassword, $AdminAge, $AdminGender]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error add admin: " . $e->getMessage()); // Ghi lỗi ra log thay vì echo
            return 0;
        } 
    }

    // GET ADMIN
    public function getAdmins() {
        try{
            // Không lấy mật khẩu khi hiển thị danh sách
            $sql = "SELECT AdminID, AdminName, AdminGmail, AdminAge, AdminGender 
                    FROM admin 
                    ORDER BY CreatedAt DESC"; 
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("Error Get Admin" . $e->getMessage());
            return 0;
        } 
    }

    //GET ADMIN BY ID
    public function getAdminById($AdminID){
        // Validate ID
        if (empty($AdminID) || !is_numeric($AdminID) || (int)$AdminID <= 0) {
            return null;
        }

        try{
            // Only select necessary fields (avoid returning password)
            $sql = "SELECT AdminID, AdminName, AdminGmail, AdminAge, AdminGender, CreatedAt 
                    FROM admin 
                    WHERE AdminID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindValue(1, (int)$AdminID, PDO::PARAM_INT);
            $stmt->execute();
            // Fetch single row as object
            $admin = $stmt->fetch(PDO::FETCH_OBJ);
            return $admin ?: null;
        } catch(PDOException $e){
            error_log("Error Get Admin By Id: " . $e->getMessage());
            return null;
        }
    }

    // DELETE ADMIN
    public function deleteAdmin(int $AdminID): int { 
        // Đảm bảo ID là một số dương hợp lệ.
        if ($AdminID <= 0) {
            return 0;
        }

        try {
            $sql = "DELETE FROM admin WHERE AdminID = ?";
            $stmt = $this->conn->prepare($sql);
            // Sử dụng cú pháp mảng hiện đại. Type hint đã đảm bảo $AdminID là int.
            $stmt->execute([$AdminID]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Delete Admin: " . $e->getMessage());
            return 0;
        }
    }

    // UPDATE ADMIN
    public function updateAdmin($id, $data) {
        try {
            $update_fields = [];
            $params = [];

            // Xây dựng câu lệnh SET một cách linh động dựa trên dữ liệu được cung cấp
            if (isset($data['AdminName'])) {
                $update_fields[] = 'AdminName = ?';
                $params[] = $data['AdminName'];
            }
            if (isset($data['AdminGmail'])) {
                $update_fields[] = 'AdminGmail = ?';
                $params[] = $data['AdminGmail'];
            }
            if (isset($data['AdminAge'])) {
                $update_fields[] = 'AdminAge = ?';
                $params[] = $data['AdminAge'];
            }
            if (isset($data['AdminGender'])) {
                $update_fields[] = 'AdminGender = ?';
                $params[] = $data['AdminGender'];
            }
            // Xử lý đặc biệt cho mật khẩu: chỉ cập nhật nếu có mật khẩu mới được cung cấp (không rỗng)
            if (!empty($data['AdminPassword'])) {
                $update_fields[] = 'AdminPassword = ?';
                $params[] = password_hash($data['AdminPassword'], PASSWORD_DEFAULT);
            }

            if (empty($update_fields)) {
                return 0; // Không có gì để cập nhật
            } 

            $sql = "UPDATE admin SET " . implode(', ', $update_fields) . " WHERE AdminID = ?";
            $params[] = $id; 

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            // Ghi log lỗi để debug, đặc biệt cho các lỗi ràng buộc duy nhất (như gmail trùng lặp)
            error_log("Error Update Admin: " . $e->getMessage());
            return 0; 
        }  
    }
}
?>
