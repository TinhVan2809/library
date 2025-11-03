<?php 

require_once __DIR__ . '/../connectDB.php';

class major extends Data{

    public function getConnection() {
        return $this->conn;
    }

    public function getAllMajor()
    {
        try {
            $sql = "SELECT m.MajorID, m.MajorCode, m.MajorName, f.FacultyName
            FROM major m 
             JOIN faculty f ON f.FacultyID = m.FacultyID"
           ;
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Get All Major " . $e->getMessage());
            return false;
        }
    }



    public function getMajorById($MajorID)
    {
        try {
            $sql = "SELECT * FROM major WHERE MajorID = ?"; // thực tế tránh lấy hết làm giảm hiệu năng
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$MajorID]);
            return $stmt->fetch(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Get Major " . $e->getMessage());
            return false;
        }
    }

     public function addMajor(string $MajorCode, string $MajorName, int $FacultyID, ?string $TrainingLevel, ?int $CreditsRequired, ?string $Description): bool {
        // 1. Xác thực các trường bắt buộc, bao gồm cả ID
        if (trim($MajorCode) === '' || trim($MajorName) === '' || $FacultyID <= 0) {
            return false;
        }

        try {
            // 2. Sửa lỗi SQL: Thay 'FacultyName' bằng 'MajorName' và sửa lỗi chính tả 'TraniningLevel'
            $sql = "INSERT INTO major (MajorCode, MajorName, FacultyID, TrainingLevel, CreditsRequired, Description) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);

            // 3. Thực thi câu lệnh và trả về kết quả boolean
            return $stmt->execute([
                trim($MajorCode), 
                trim($MajorName), 
                $FacultyID, 
                $TrainingLevel, 
                $CreditsRequired, 
                $Description
            ]);

        } catch (PDOException $e) {
            // 4. Ghi log lỗi để gỡ lỗi, đặc biệt hữu ích cho lỗi ràng buộc duy nhất (ví dụ: MajorCode bị trùng)
            error_log("Error Add Major: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cập nhật thông tin một ngành học.
     *
     * @param int $MajorID ID của ngành học.
     * @param array $data Dữ liệu cần cập nhật.
     * @return bool True nếu cập nhật thành công, False nếu thất bại.
     */
    public function updateMajor(int $MajorID, array $data): bool
    {
        if ($MajorID <= 0 || empty($data)) {
            return false;
        }

        $allowedFields = ['MajorCode', 'MajorName', 'FacultyID', 'TrainingLevel', 'CreditsRequired', 'Description'];
        $setParts = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "`$field` = ?";
                $value = $data[$field];
                // Ép kiểu cho các trường số
                if (in_array($field, ['FacultyID', 'CreditsRequired'])) {
                    $value = (int) $value;
                }
                $params[] = $value;
            }
        }

        if (empty($setParts)) {
            return false; // Không có trường hợp lệ nào để cập nhật
        }

        $params[] = $MajorID;

        try {
            $sql = "UPDATE major SET " . implode(', ', $setParts) . " WHERE MajorID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating major: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Xóa một ngành học khỏi cơ sở dữ liệu.
     *
     * @param int $MajorID ID của ngành học cần xóa.
     * @return bool True nếu xóa thành công, False nếu thất bại.
     */
    public function deleteMajor(int $MajorID): bool
    {
        if ($MajorID <= 0) return false;
        try {
            $stmt = $this->conn->prepare("DELETE FROM major WHERE MajorID = ?");
            return $stmt->execute([$MajorID]) && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting major: " . $e->getMessage());
            return false;
        }
    }
}

?>