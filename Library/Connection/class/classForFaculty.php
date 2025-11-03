<?php 

require_once __DIR__ . '/../connectDB.php';

class faculty extends Data {
 
    public function getConnection() {
        return $this->conn;
    }

    // Lấy tất cả các khoa hiện có trên server
    // Cần Tối ưu thêm
    public function getAllFaculty() {


        try{
            $sql = "SELECT FacultyID, FacultyCode, FacultyName, Email FROM faculty";  // Lấy FacultyID Để sửa xóa
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("ERROR GET ALL FACULTY " . $e->getMessage());
            return false;
        }
    }

    public function getFacultyById($FacultyID) {

        if ($FacultyID <= 0) return null;
        try {
            $sql = "SELECT * FROM faculty WHERE FacultyID = ?"; //Thực tế nên tránh lấy hết các trường
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$FacultyID]);
            $row = $stmt->fetch(PDO::FETCH_OBJ);
            return $row ?: null;
        } catch (PDOException $E) {
            error_log("Error Get Faculty By Id " . $E->getMessage());
            return null;
        }
    }

    // thêm khoa
    public function addFaculty(string $FacultyCode, string $FacultyName, ?string $Phone, ?string $Email, ?string $Address, ?int $EstablishedYear): bool {
        // 1. Xác thực các trường bắt buộc một cách chặt chẽ hơn
        if (trim($FacultyCode) === '' || trim($FacultyName) === '') {
            return false;
        }

        try {
            $sql = "INSERT INTO faculty (FacultyCode, FacultyName, Phone, Email, Address, EstablishedYear) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);

            // 2. Thực thi câu lệnh và trả về kết quả boolean
            return $stmt->execute([
                trim($FacultyCode), 
                trim($FacultyName), 
                $Phone, 
                $Email, 
                $Address, 
                $EstablishedYear
            ]);

        } catch (PDOException $e) {
            // 3. Ghi log lỗi để gỡ lỗi, đặc biệt hữu ích cho lỗi ràng buộc duy nhất (ví dụ: FacultyCode bị trùng)
            error_log("Error Add Faculty: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cập nhật thông tin một khoa.
     *
     * @param int $FacultyID ID của khoa.
     * @param array $data Dữ liệu cần cập nhật.
     * @return bool True nếu cập nhật thành công, False nếu thất bại.
     */
    public function updateFaculty(int $FacultyID, array $data): bool
    {
        if ($FacultyID <= 0 || empty($data)) {
            return false;
        }

        $allowedFields = ['FacultyCode', 'FacultyName', 'Phone', 'Email', 'Address', 'EstablishedYear'];
        $setParts = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "`$field` = ?";
                $params[] = trim($data[$field]);
            }
        }

        if (empty($setParts)) {
            return false; // Không có trường hợp lệ nào để cập nhật
        }

        $params[] = $FacultyID;

        try {
            $sql = "UPDATE faculty SET " . implode(', ', $setParts) . " WHERE FacultyID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating faculty: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Xóa một khoa khỏi cơ sở dữ liệu.
     *
     * @param int $FacultyID ID của khoa cần xóa.
     * @return bool True nếu xóa thành công, False nếu thất bại.
     */
    public function deleteFaculty(int $FacultyID): bool
    {
        if ($FacultyID <= 0) return false;
        try {
            $stmt = $this->conn->prepare("DELETE FROM faculty WHERE FacultyID = ?");
            return $stmt->execute([$FacultyID]) && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting faculty: " . $e->getMessage());
            return false;
        }
    }
    
}
?>