<?php

require_once __DIR__ . '/../connectDB.php';
class MyListBooks extends Data {
   public function getCoonection() {
    return $this->conn;
   }

    /**
     * Thêm sách vào danh sách của sinh viên, kiểm tra trùng lặp.
     * @param int $studentID
     * @param int $booksID
     * @return int -1 nếu đã tồn tại, 1 nếu thành công, 0 nếu lỗi.
     */
    public function addToList(int $studentID, int $booksID): int {
        if ($studentID <= 0 || $booksID <= 0) return 0;

        try {
            // Kiểm tra xem sách đã có trong danh sách của sinh viên chưa
            $checkSql = "SELECT COUNT(*) FROM my_list_books WHERE StudentID = ? AND BooksID = ?";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute([$studentID, $booksID]);
            if ($checkStmt->fetchColumn() > 0) {
                return -1; // Đã tồn tại
            }

            // Thêm sách vào danh sách
            $sql = "INSERT INTO my_list_books (StudentID, BooksID) VALUES (?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentID, $booksID]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error adding to my_list_books: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Lấy danh sách sách trong tủ của một sinh viên.
     * @param int $studentID
     * @return array
     */
    public function getListByStudent(int $studentID): array {
        if ($studentID <= 0) return [];

        try {
            $sql = "SELECT ml.ListID, b.BooksID, b.Title, b.ImageUrl, b.StockQuantity, b.BookImportDate
                    FROM my_list_books ml
                    JOIN books b ON ml.BooksID = b.BooksID
                    WHERE ml.StudentID = ?
                    ORDER BY ml.Add_date DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentID]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error getting my_list_books by student: " . $e->getMessage());
            return [];
        }
    }



    public function deleteListById($ListID)
    {
        try {
            $sql = "DELETE FROM my_list_books WHERE ListID = ?";
            $delete = $this->conn->prepare($sql);
            $delete->execute([$ListID]);
            return $delete->rowCount();
        } catch (PDOException $e) {
            error_log("Error Delete list " . $e->getMessage());
            return 0; // Trả về 0 khi có lỗi
        }
    }
}
?>