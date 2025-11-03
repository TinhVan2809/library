<?php 

require_once __DIR__ . '/../connectDB.php';

class review extends Data {

    public function getConnection() {
        return $this->conn;
    }

    /**
     * Thêm một đánh giá mới cho sách.
     * @param int $StudentID ID của sinh viên.
     * @param int $BooksID ID của sách.
     * @param int $Rating Điểm đánh giá (1-5).
     * @param string|null $Comment Nội dung bình luận.
     * @param int|null $ParentReviewID ID của bình luận cha (nếu là trả lời).
     * @return int Số dòng bị ảnh hưởng (1 nếu thành công, 0 nếu thất bại).
     */
    public function addReview(int $StudentID, int $BooksID, int $Rating, ?string $Comment, ?int $ParentReviewID = null): int  {
        // Xác thực dữ liệu đầu vào
        if($StudentID <= 0 || $BooksID <= 0 || $Rating < 1 || $Rating > 5) {
            return 0;
        }
        try{
            // Thêm ParentReviewID vào câu lệnh INSERT
            $stmt = $this->conn->prepare("INSERT INTO book_review (StudentID, BooksID, Rating, Comment, ParentReviewID, Created_at)
                VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$StudentID, $BooksID, $Rating, $Comment, $ParentReviewID]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Add Review " . $e->getMessage());
            return 0; // Trả về 0 khi có lỗi
        }
    } 

    /**
     * Cập nhật nội dung một bình luận.
     * @param int $reviewId ID của bình luận.
     * @param int $studentId ID của sinh viên thực hiện.
     * @param string $comment Nội dung mới.
     * @return bool
     */
    public function updateReview(int $reviewId, int $studentId, string $comment): bool {
        try {
            $sql = "UPDATE book_review SET Comment = :comment WHERE ReviewID = :reviewId AND StudentID = :studentId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':comment', $comment, PDO::PARAM_STR);
            $stmt->bindParam(':reviewId', $reviewId, PDO::PARAM_INT);
            $stmt->bindParam(':studentId', $studentId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Lỗi khi cập nhật review: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Xóa một bình luận.
     * @param int $reviewId ID của bình luận.
     * @param int $studentId ID của sinh viên thực hiện.
     * @return bool
     */
    public function deleteReview(int $reviewId, int $studentId): bool {
        try {
            // Câu lệnh DELETE sẽ chỉ thành công nếu cả ReviewID và StudentID đều khớp
            $sql = "DELETE FROM book_review WHERE ReviewID = :reviewId AND StudentID = :studentId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':reviewId', $reviewId, PDO::PARAM_INT);
            $stmt->bindParam(':studentId', $studentId, PDO::PARAM_INT);
            $stmt->execute();
            // `rowCount()` sẽ trả về 1 nếu xóa thành công, 0 nếu không tìm thấy bản ghi khớp (không phải chủ sở hữu)
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Lỗi khi xóa review: " . $e->getMessage());
            return false;
        }
    }

     /**
     * Lấy tất cả đánh giá của một cuốn sách.
     * @param int $bookId
     * @return array
     */
    public function getReviewsByBookId(int $bookId): array {
        try {
            // Join với bảng students để lấy tên và ảnh đại diện của người đánh giá
            $sql = "SELECT 
                        br.ReviewID, 
                        br.StudentID,
                        br.ParentReviewID,
                        br.Rating, 
                        br.Comment, 
                        br.Created_at, 
                        s.FullName,
                        s.Avata_image          
                    FROM book_review br
                    JOIN student s ON br.StudentID = s.StudentID
                    WHERE br.BooksID = :bookId
                    ORDER BY br.Created_at DESC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':bookId', $bookId, PDO::PARAM_INT);
            $stmt->execute();
            $reviews = $stmt->fetchAll(PDO::FETCH_OBJ);

            // Xây dựng cây bình luận
            $reviewMap = [];
            foreach ($reviews as $review) {
                $review->replies = [];
                $reviewMap[$review->ReviewID] = $review;
            }

            $tree = [];
            foreach ($reviewMap as $id => $review) {
                if ($review->ParentReviewID) {
                    if (isset($reviewMap[$review->ParentReviewID])) {
                        $reviewMap[$review->ParentReviewID]->replies[] = $review;
                    }
                } else {
                    $tree[] = $review;
                }
            }
            return $tree;
        } catch (PDOException $e) {
            error_log("Lỗi khi lấy review theo ID sách: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Đếm tổng số đánh giá của một sinh viên cụ thể.
     * @param int $studentId ID của sinh viên.
     * @return object|null Đối tượng chứa total_review hoặc null nếu có lỗi.
     */
    public function getCountReviewByStudentId(int $studentId): ?object {
        if ($studentId <= 0) {
            return null;
        }

        try{
            // Câu lệnh SQL chỉ để đếm, hiệu quả hơn nhiều.
            $sql = "SELECT ReviewID, COUNT(ReviewID) AS total_review 
                    FROM book_review 
                    WHERE StudentID = ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentId]);

            return $stmt->fetch(PDO::FETCH_OBJ); // Sử dụng fetch() vì chỉ có một hàng kết quả
        } catch(PDOException $e) {
            error_log("Error getting reviews by student ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Lấy tất cả các đánh giá của một sinh viên cụ thể.
     * @param int $studentId ID của sinh viên.
     * @return array Mảng các đối tượng đánh giá.
     */

    public function getReviewByStudentId($studentId) {
        if($studentId <= 0) {
            return [];
        }

        try{

            $sql = "SELECT 
                        r.ReviewID,
                        b.Title,
                        b.ImageUrl,
                        r.Rating,
                        r.Comment,
                        r.Created_at,
                        b.BooksID,
                        b.BookImportDate
                    FROM book_review r
                    JOIN books b ON r.BooksID = b.BooksID
                    WHERE r.StudentID = ?
                    ORDER BY r.Created_at DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentId]);

            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log('Errror getting reviews by student ID: ' . $e->getMessage());
            return [];
        }
    }
}

?>