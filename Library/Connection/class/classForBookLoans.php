<?php 

require_once __DIR__ . '/../connectDB.php';

class bookloans extends Data {
    public function getConnection() {
        return $this->conn;
    }

    // Get all bookloans 
    public function getAllBookLoans() {
       try{
        $sql = "SELECT bl.BookLoanID, b.Title, s.FullName, bl.LoanDate, bl.Status, b.ImageUrl
            FROM (( bookloans bl
            JOIN student s ON s.studentID = bl.StudentID)
            JOIN books b ON b.BooksID = bl.BooksID)
            ORDER BY bl.loanDate DESC"; // sắp xếp ngày mượn mới nhất
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_OBJ);
       } catch (PDOException $e) {
        error_log("Error Get All BookLoans " . $e->getMessage());
        return 0;
       }
    }

    // get bookloan by id
    public function getBookLoanById($BookLoanID)
    {
        try {
            $sql = "SELECT bl.BookLoanID, b.Title as Tên_Sách, s.FullName as Tên_Sinh_Viên
            FROM (( bookloans bl
            JOIN student s ON s.studentID = bl.StudentID)
            JOIN books b ON b.BooksID = bl.BooksID)
            WHERE bl.BookLoanID = ? ORDER BY bl.loanDate DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($BookLoanID);
            return $stmt->fetch(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Get BookLoan By Id " . $e->getMessage());
            return [];
        }
    }

    /**
     * Tạo một phiếu mượn mới và giảm số lượng sách trong kho.
     *
     * @param int $StudentID ID của sinh viên.
     * @param int $BooksID ID của sách.
     * @param string $DueDate Ngày hẹn trả sách (định dạng 'YYYY-MM-DD').
     * @return int ID của phiếu mượn mới được tạo, hoặc 0 nếu thất bại.
     */
    public function addBookLoan(int $StudentID, int $BooksID, string $DueDate): int {
        // Xác thực đầu vào, bao gồm cả DueDate
        if ($StudentID <= 0 || $BooksID <= 0 || empty($DueDate)) {
            return 0;
        }

        // (Tùy chọn) Xác thực định dạng ngày tháng của DueDate
        $d = DateTime::createFromFormat('Y-m-d', $DueDate);
        if (!$d || $d->format('Y-m-d') !== $DueDate) {
            error_log("Định dạng DueDate không hợp lệ: " . $DueDate);
            return 0; // Định dạng ngày không hợp lệ
        }

        try {
            // Bắt đầu transaction vì chúng ta sẽ cập nhật kho và thêm phiếu mượn
            $this->conn->beginTransaction();

            // Kiểm tra sinh viên có tồn tại không
            $stmt = $this->conn->prepare("SELECT 1 FROM student WHERE StudentID = ? LIMIT 1");
            $stmt->execute([$StudentID]);
            if ($stmt->fetchColumn() === false) {
                $this->conn->rollBack();
                error_log("Thêm phiếu mượn thất bại: StudentID $StudentID không tồn tại.");
                return 0;
            }

            // Giảm số lượng sách trong kho (chỉ khi số lượng > 0)
            $stmt = $this->conn->prepare("UPDATE books SET StockQuantity = StockQuantity - 1 WHERE BooksID = ? AND StockQuantity > 0");
            $stmt->execute([$BooksID]);
            if ($stmt->rowCount() === 0) {
                // Sách không tồn tại hoặc đã hết hàng
                $this->conn->rollBack();
                error_log("Thêm phiếu mượn thất bại: BooksID $BooksID đã hết hàng hoặc không tồn tại.");
                return 0;
            }

            // Thêm phiếu mượn mới với DueDate
            // LoanDate và Status sẽ sử dụng giá trị mặc định từ DB
            $stmt = $this->conn->prepare("INSERT INTO bookloans (StudentID, BooksID, DueDate) VALUES (?, ?, ?)");
            $stmt->execute([$StudentID, $BooksID, $DueDate]);

            $insertId = (int)$this->conn->lastInsertId();
            $this->conn->commit();
            
            return $insertId > 0 ? $insertId : 0;
        } catch (PDOException $e) {
            error_log("Lỗi khi thêm phiếu mượn: " . $e->getMessage());
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            return 0;
        }
    }

    // xóa phiếu mượn
    public function deleteBookLoanById(int $BookLoanID): bool
    {
        if ($BookLoanID <= 0) {
            return false;
        }
        try {
            $sql = "DELETE FROM bookloans WHERE BookLoanID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$BookLoanID]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error Delete bookLoan " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cập nhật thông tin một phiếu mượn.
     *
     * @param int $bookLoanID ID của phiếu mượn.
     * @param array $data Dữ liệu cần cập nhật (ví dụ: ['StudentID' => 1, 'Status' => 'Returned']).
     * @return bool True nếu cập nhật thành công, False nếu thất bại.
     */
    public function updateBookLoan(int $bookLoanID, array $data): bool
    {
        if ($bookLoanID <= 0 || empty($data)) {
            return false;
        }

        // Các trường được phép cập nhật để bảo mật
        $allowedFields = ['StudentID', 'BooksID', 'LoanDate', 'DueDate', 'ReturnDate', 'Status'];
        
        $setParts = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "`$field` = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($setParts)) {
            return false; // Không có trường hợp lệ nào để cập nhật
        }

        $params[] = $bookLoanID;

        try {
            $sql = "UPDATE bookloans SET " . implode(', ', $setParts) . " WHERE BookLoanID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error updating book loan: " . $e->getMessage());
            return false;
        }
    }


    /* Lấy danh sách các phiếu mượn của một sinh viên cụ thể.
 *
 * @param int $studentID ID của sinh viên.
 * @return array|int Mảng các đối tượng phiếu mượn hoặc 0 nếu có lỗi.
 */
    public function getBookLoansByStudent(int $studentID)
    {
        // Kiểm tra ID đầu vào
        if ($studentID <= 0) {
            return []; // Trả về mảng rỗng nếu StudentID không hợp lệ
        }

        try {
            // Câu truy vấn SQL để lấy thông tin cần thiết
            // Chúng ta JOIN 3 bảng: bookloans, books, và student
            $sql = "SELECT
                    bl.BookLoanID,
                    b.BooksID,
                    bl.LoanDate,
                    bl.DueDate,
                    bl.Status,
                    b.Title,
                    b.ImageUrl,
                    s.FullName,
                    s.StudentID
                FROM
                    bookloans bl
                INNER JOIN
                    books b ON bl.BooksID = b.BooksID
                INNER JOIN
                    student s ON bl.StudentID = s.StudentID
                WHERE
                    bl.StudentID = ?
                ORDER BY
                    bl.LoanDate DESC";

            // Chuẩn bị và thực thi truy vấn
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentID]);

            // Trả về tất cả các dòng kết quả dưới dạng đối tượng
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            // Ghi lại lỗi nếu có sự cố
            error_log("Error getting book loans by student: " . $e->getMessage());
            return 0; // Trả về 0 để báo hiệu lỗi
        }
    }


    /**
     * Lấy danh sách các sách được mượn nhiều nhất.
     * @param int $limit Số lượng sách top đầu muốn lấy.
     * @return array|false Mảng các sách hoặc false nếu lỗi.
     */
    public function getMostBookLoan(int $limit = 6) {
        try{
            $sql = "SELECT b.BooksID, bl.BookLoanID, b.Title, b.ImageUrl, COUNT(bl.BookLoanID) as LoanCount
                FROM bookloans bl 
                INNER JOIN books b ON bl.BooksID = b.BooksID 
                GROUP BY b.Title 
                ORDER BY LoanCount DESC
                LIMIT :limit";
            $get = $this->conn->prepare($sql);
            $get->bindParam(':limit', $limit, PDO::PARAM_INT);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("Error get Full Most Book Loan " . $e->getMessage() );
            return false;
        }
    }

    /**
     * Lấy danh sách các sách được mượn nhiều nhất.
     * @param int $limit Số lượng sách top đầu muốn lấy.
     * @return array|false Mảng các sách hoặc false nếu lỗi.
     */
    public function getFullMostBookLoan(int $limit = 30) {
        try{
            $sql = "SELECT b.BooksID, bl.BookLoanID, b.Title, b.ImageUrl, COUNT(bl.BookLoanID) as LoanCount
                FROM bookloans bl 
                INNER JOIN books b ON bl.BooksID = b.BooksID 
                GROUP BY b.Title 
                ORDER BY LoanCount DESC
                LIMIT :limit";
            $get = $this->conn->prepare($sql);
            $get->bindParam(':limit', $limit, PDO::PARAM_INT);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("Error get Full Most Book Loan " . $e->getMessage() );
            return false;
        }
    }

    // Đêm tổng số sách đã mượn của một sinh viên cụ thể

    public function getCountBookLoanByStudentID(int $studentID): ?object {
        if($studentID <= 0) {
            return null;
        }

        try{
            $sql = "SELECT COUNT(bl.BookLoanID) AS total_bookloan
            FROM bookloans bl 
            JOIN student s ON s.StudentID = bl.StudentID 
            WHERE s.StudentID = ? 
            GROUP BY s.StudentID";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentID]);

            return $stmt->fetch(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("error get count " . $e->getMessage());
            return null;
        }
    }

}

?>