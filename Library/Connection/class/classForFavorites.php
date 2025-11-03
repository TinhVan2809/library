<?php
require_once __DIR__ . '/../connectDB.php';

class Favorites extends Data {

    public function getConnection() {
        return $this->conn;
    }

    /**
     * Thêm hoặc xóa một lượt yêu thích (toggle).
     *
     * @param int $studentId ID của sinh viên.
     * @param int $bookId ID của sách.
     * @return string|false Trả về 'added', 'removed', hoặc false nếu lỗi.
     */
    public function toggleFavorite(int $studentId, int $bookId) {
        if ($studentId <= 0 || $bookId <= 0) {
            return false;
        }

        try {
            // Bắt đầu một transaction để đảm bảo toàn vẹn dữ liệu
            $this->conn->beginTransaction();

            // 1. Kiểm tra xem lượt yêu thích đã tồn tại chưa
            $checkStmt = $this->conn->prepare("SELECT favorite_id FROM book_favorites WHERE student_id = ? AND book_id = ?");
            $checkStmt->execute([$studentId, $bookId]);

            if ($checkStmt->fetch()) {
                // 2a. Nếu đã tồn tại -> Xóa (Bỏ thích)
                $deleteStmt = $this->conn->prepare("DELETE FROM book_favorites WHERE student_id = ? AND book_id = ?");
                $deleteStmt->execute([$studentId, $bookId]);
                $this->conn->commit();
                return 'removed';
            } else {
                // 2b. Nếu chưa tồn tại -> Thêm (Thích)
                $insertStmt = $this->conn->prepare("INSERT INTO book_favorites (student_id, book_id) VALUES (?, ?)");
                $insertStmt->execute([$studentId, $bookId]);
                $this->conn->commit();
                return 'added';
            }
        } catch (PDOException $e) {
            // Nếu có lỗi, rollback transaction
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log("Error toggleFavorite: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Lấy tổng số lượt yêu thích của một cuốn sách.
     *
     * @param int $bookId ID của sách.
     * @return int Tổng số lượt yêu thích.
     */
    public function getFavoriteCountByBook(int $bookId): int {
        if ($bookId <= 0) return 0;
        try {
            $stmt = $this->conn->prepare("SELECT COUNT(*) FROM book_favorites WHERE book_id = ?");
            $stmt->execute([$bookId]);
            return (int) $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Error getFavoriteCountByBook: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Kiểm tra xem một người dùng đã yêu thích một cuốn sách hay chưa.
     *
     * @param int $studentId ID của sinh viên.
     * @param int $bookId ID của sách.
     * @return bool True nếu đã yêu thích, ngược lại là false.
     */
    public function isFavoritedByUser(int $studentId, int $bookId): bool {
        if ($studentId <= 0 || $bookId <= 0) return false;
        try {
            $stmt = $this->conn->prepare("SELECT COUNT(*) FROM book_favorites WHERE student_id = ? AND book_id = ?");
            $stmt->execute([$studentId, $bookId]);
            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Error isFavoritedByUser: " . $e->getMessage());
            return false;
        }
    }

     /**
     * Lấy danh sách 50 cuốn sách được yêu thích nhiều nhất.
     *
     * @return array Mảng các sách được yêu thích nhất hoặc mảng rỗng nếu có lỗi.
     */
    public function getTopFavoritedBooks() {
        try {
            // Câu lệnh SQL này đếm số lượt yêu thích cho mỗi sách,
            // join với bảng sách để lấy thông tin chi tiết,
            // sắp xếp theo số lượt yêu thích giảm dần và giới hạn ở 50 kết quả.
            $query = "
                SELECT
                    b.BooksID,
                    b.Title,
                    b.ImageUrl,
                    a.AuthorName,
                    COUNT(f.book_id) as favorite_count
                FROM
                    book_favorites f
                JOIN
                    books b ON f.book_id = b.BooksID
                LEFT JOIN
                    authors a ON b.AuthorID = a.AuthorID
                GROUP BY
                    b.BooksID
                ORDER BY
                    favorite_count DESC
                LIMIT 40";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $books = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $books;

        } catch (PDOException $e) {
            // Ghi lại lỗi để debug
            error_log("Error in getTopFavoritedBooks: " . $e->getMessage());
            // Trả về một mảng rỗng trong trường hợp có lỗi
            return [];
        } 
    }

    /**
     * Lấy danh sách chi tiết các sách mà một sinh viên đã yêu thích.
     *
     * @param int $studentId ID của sinh viên.
     * @return array Mảng các đối tượng sách đã thích.
     */
    public function getFavoritedBooksByStudent(int $studentId): array {
        if ($studentId <= 0) {
            return [];
        }

        try {
            $query = "
                SELECT
                    bf.favorite_id,
                    b.BooksID,
                    b.Title,
                    b.ImageUrl,
                    a.AuthorName
                FROM book_favorites bf
                JOIN books b ON bf.book_id = b.BooksID
                LEFT JOIN authors a ON b.AuthorID = a.AuthorID
                WHERE bf.student_id = ?
                ORDER BY bf.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$studentId]);
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error in getFavoritedBooksByStudent: " . $e->getMessage());
            return [];
        }
    }

    // Lấy tổng số sách đã thích của một sinh viên cụ thể
    public function getCountFavoritesByStudentID(int $studentId): ?object {
        if($studentId <= 0) {
            return null;
        }
        try{
            $sql = "SELECT
                        bf.favorite_id,
                        s.FullName,
                        COUNT(bf.book_id) AS total_favorites
                    FROM
                        student s
                    JOIN
                        book_favorites bf ON s.StudentID = bf.student_id
                    WHERE
                        s.StudentID = ?
                    GROUP BY
                        s.StudentID; -- Group theo ID của sinh viên
                    ";
            $get = $this->conn->prepare($sql);
            $get->execute([$studentId]);
            $result = $get->fetch(PDO::FETCH_OBJ);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log('error get count... ' . $e->getMessage());
            return null;
        }
    }
}
?>
