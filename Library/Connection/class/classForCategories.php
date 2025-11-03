<?php
require_once __DIR__ . '/../connectDB.php';
class Catagories extends Data
{

    public function getConnection()
    {
        return $this->conn;
    }

    // GET CATEGORIES
    public function getCategories(): array
    {
        try {
            // Chọn cột cụ thể, sắp xếp theo tên để frontend dễ xử lý
            $sql = "SELECT CategoryID, CategoryName, Description
                    FROM categories
                    ORDER BY CategoryID ASC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $rows ?: [];
        } catch (PDOException $e) {
            error_log("Error getCategories: " . $e->getMessage());
            return [];
        }
    }

    // ADD CATEGORIES 
    public function addCategories($categoryName, $Description) {
        if(empty($categoryName) || isset($Description)) {
            return 0;
        } 
        try {
            $sql = "INSERT INTO Categories (CategoryName, Description)
                    VALUES (?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$categoryName, $Description]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Add Categories" . $e->getMessage());
            return 0;
        } 

    }

    // DELETE CATEGORIES 
    public function deleteCategories($CategoryID) {
        try {
            $sql = "DELETE FROM Catogories WHERE categoryID = ? ";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(array($CategoryID));
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Delete Categories" . $e->getMessage());
            return 0;
        }
    }

       // UPDATE CATEGORIES
    public function updateCategories($id, $data) {
        try {
            $update_fields = [];
            $params = [];

            // Sử dụng tên cột nhất quán (PascalCase)
            if (isset($data['CategoryName'])) {
                $update_fields[] = 'CategoryName = ?';
                $params[] = $data['CategoryName'];
            }
            if (isset($data['Description'])) {
                $update_fields[] = 'Description = ?';
                $params[] = $data['Description'];
            }
           
            if (empty($update_fields)) {
                return 0; // Không có gì để cập nhật
            }

            $sql = "UPDATE categories SET " . implode(', ', $update_fields) . " WHERE CategoryID = ?";
            $params[] = $id;

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            // Ghi log lỗi để debug, đặc biệt cho các lỗi ràng buộc duy nhất (như gmail trùng lặp)
            error_log("Error Update Catogries: " . $e->getMessage());
            return 0;
        }
    }
}
