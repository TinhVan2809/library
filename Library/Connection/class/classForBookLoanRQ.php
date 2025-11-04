<?php

require_once __DIR__ . '/../connectDB.php';
require_once __DIR__ . '/classForNotifications.php';


class bookloanrq extends Data
{

    public function getConnection()
    {
        return $this->conn;
    }

    /**
     * Thêm một yêu cầu mượn sách mới.
     *
     * @param int $studentID ID của sinh viên.
     * @param int $bookID ID của sách.
     * @return int Số dòng bị ảnh hưởng (1 nếu thành công, 0 nếu thất bại).
     */
    public function addBookLoanRequest(int $StudentID, int $BooksID)
    {
        if ($StudentID <= 0 || $BooksID <= 0) return 0;

        try {
            $this->conn->beginTransaction();

            $checkSql = "SELECT RequestID FROM bookloan_request
                         WHERE StudentID = ? AND BooksID = ? AND Status IN ('pending','approved')
                         LIMIT 1 FOR UPDATE";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute([$StudentID, $BooksID]);

            if ($checkStmt->fetchColumn()) {
                $this->conn->rollBack();
                return -1; // duplicate
            }

             $sql = "INSERT INTO bookloan_request (StudentID, BooksID, Request_date, DueDate, Status)
                    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'pending')";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$StudentID, $BooksID]);

            $affected = (int)$stmt->rowCount();
            $this->conn->commit();
            return $affected;
        } catch (Throwable $e) {
            if ($this->conn->inTransaction()) $this->conn->rollBack();
            error_log("Error adding book loan request: " . $e->getMessage());
            return 0;
        }
    }

    public function getAllBookLoanRQ(int $limit = 30, int $offset = 0)
    {
        try {

            $sql = "SELECT rq.RequestID, rq.Request_date, rq.DueDate, rq.Status , b.Title, s.FullName, s.StudentCode, b.ImageUrl
                    FROM (( bookloan_request rq 
                    INNER JOIN books b ON b.BooksID = rq.BooksID) 
                    INNER JOIN student s ON s.StudentID = rq.StudentID) 
                    ORDER BY rq.Request_date DESC
                    LIMIT :limit OFFSET :offset";
            $get = $this->conn->prepare($sql);
            $get->bindParam(':limit', $limit, PDO::PARAM_INT);
            $get->bindParam(':offset', $offset, PDO::PARAM_INT);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Gett All Book Loan RQ " . $e->getMessage());

            return [];
        }
    }

    public function deleteBookLoanRQ(int $RequestID) {
        if ($RequestID <= 0) return 0;
        try {
            $sql = "DELETE FROM bookloan_request WHERE RequestID = ?";
            $delete = $this->conn->prepare($sql);
            $delete->execute([$RequestID]);
            return $delete->rowCount();
        } catch (PDOException $e) {
            error_log("Error Delete BookLoan RQ " . $e->getMessage());
            return 0;
        }
    }

    public function getBookLoanRQById(int $RequestID)
    {
        if ($RequestID <= 0) return null;
        try {
            $sql = "SELECT rq.* , b.Title, b.ISBN, s.FullName, s.StudentCode 
                    FROM bookloan_request rq
                    LEFT JOIN books b ON b.BooksID = rq.BooksID
                    LEFT JOIN student s ON s.StudentID = rq.StudentID
                    WHERE rq.RequestID = ?
                    LIMIT 1";
            $get = $this->conn->prepare($sql);
            $get->execute([$RequestID]);
            return $get->fetch(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Get Book Loan RQ By Id " . $e->getMessage());
            return null;
        }
    }

    /**
     * Lấy danh sách yêu cầu mượn sách của một sinh viên.
     *
     * @param int $studentID ID của sinh viên.
     * @return array Mảng các đối tượng yêu cầu.
     */
    public function getBookLoanRQByStudent(int $studentID)
    {
        if ($studentID <= 0) {
            return [];
        }
        try {
            // Truy vấn này JOIN với bảng books để lấy cả Title và ImageUrl
               $sql = "SELECT 
                        br.RequestID, 
                        br.Request_date, 
                        br.Status, 
                        b.Title, 
                        b.ImageUrl
                    FROM bookloan_request br
                    JOIN books b ON br.BooksID = b.BooksID
                    WHERE br.StudentID = ?
                    ORDER BY br.Request_date DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentID]);
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error getting book loan requests by student: " . $e->getMessage());
            return [];
        }
    }


      /**
     * Cập nhật trạng thái của một yêu cầu mượn sách.
     * Nếu 'approved', sẽ tạo phiếu mượn và giảm số lượng sách.
     *
     * @param int $requestID ID của yêu cầu.
     * @param string $newStatus Trạng thái mới ('approved' hoặc 'rejected').
     * @return array Kết quả xử lý.
     */
    public function updateRequestStatus(int $requestID, string $newStatus): array
    {
        if (!in_array($newStatus, ['approved', 'rejected'])) {
            return ['success' => false, 'message' => 'Trạng thái không hợp lệ.'];
        }

        try {
            $this->conn->beginTransaction();

            // Lấy thông tin yêu cầu và khóa dòng để xử lý
            $sqlGetRequest = "SELECT br.StudentID, br.BooksID, br.Status, br.DueDate, b.Title
                              FROM bookloan_request br
                              JOIN books b ON br.BooksID = b.BooksID
                              WHERE br.RequestID = ? FOR UPDATE";
            $stmtGetRequest = $this->conn->prepare($sqlGetRequest);
            $stmtGetRequest->execute([$requestID]);
            $request = $stmtGetRequest->fetch(PDO::FETCH_ASSOC);

            if (!$request) {
                $this->conn->rollBack();
                return ['success' => false, 'message' => 'Không tìm thấy yêu cầu.'];
            }

            if ($request['Status'] !== 'pending') {
                $this->conn->rollBack();
                return ['success' => false, 'message' => 'Yêu cầu này đã được xử lý trước đó.'];
            }

            // Cập nhật trạng thái của yêu cầu
            $sqlUpdateRQ = "UPDATE bookloan_request SET Status = ? WHERE RequestID = ?";
            $stmtUpdateRQ = $this->conn->prepare($sqlUpdateRQ);
            $stmtUpdateRQ->execute([$newStatus, $requestID]);

            // Nếu duyệt, thực hiện thêm các bước
            if ($newStatus === 'approved') {
                // 1. Giảm số lượng sách trong kho
                $sqlUpdateBook = "UPDATE books SET StockQuantity = StockQuantity - 1 WHERE BooksID = ? AND StockQuantity > 0";
                $stmtUpdateBook = $this->conn->prepare($sqlUpdateBook);
                $stmtUpdateBook->execute([$request['BooksID']]);

                if ($stmtUpdateBook->rowCount() === 0) {
                    throw new PDOException('Sách đã hết hàng hoặc không tồn tại.');
                }

                // 2. Tạo phiếu mượn mới trong bảng bookloans, lấy DueDate từ request đã có
                // Lấy DueDate từ request đã có, không cần tính lại
                $loanDate = date('Y-m-d'); // Ngày duyệt yêu cầu là ngày mượn
                $dueDateFromRequest = $request['DueDate']; // Lấy DueDate từ bản ghi yêu cầu
                $sqlInsertLoan = "INSERT INTO bookloans (StudentID, BooksID, LoanDate, DueDate, Status) VALUES (?, ?, ?, ?, 'borrowed')";
                $stmtInsertLoan = $this->conn->prepare($sqlInsertLoan);
                $stmtInsertLoan->execute([$request['StudentID'], $request['BooksID'], $loanDate, $dueDateFromRequest]);
            }

            // Lấy tên sách để tạo thông báo
            $bookTitle = $request['Title'];

            // Tạo thông báo cho người dùng
            $notificationMessage = '';
            if ($newStatus === 'approved') {
                $notificationMessage = "Yêu cầu mượn sách '{$bookTitle}' của bạn đã được duyệt.";
            } else if ($newStatus === 'rejected') {
                $notificationMessage = "Yêu cầu mượn sách '{$bookTitle}' của bạn đã bị từ chối.";
            }

            if ($notificationMessage) {
                $notifications = new Notifications();
                $notifications->createNotification($request['StudentID'], $notificationMessage, '/my-borrows');
            }

            $this->conn->commit();
            return ['success' => true, 'message' => 'Cập nhật trạng thái yêu cầu thành công!'];

        } catch (PDOException $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            error_log("Error updating request status: " . $e->getMessage());
            return ['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()];
        }
    }

    /**
 * Hủy một yêu cầu mượn sách của người dùng.
 *
 * @param int $requestID ID của yêu cầu cần hủy.
 * @param int $studentID ID của sinh viên (để xác thực).
 * @return int Số dòng bị ảnh hưởng (1 nếu thành công, 0 nếu thất bại).
 */
public function cancelBookLoanRequest(int $requestID, int $studentID)
{
    // Chỉ cho phép hủy các yêu cầu đang ở trạng thái 'pending'
    $sql = "UPDATE bookloan_request
            SET Status = 'cancelled'
            WHERE RequestID = ? AND StudentID = ? AND Status = 'pending'";

    try {
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$requestID, $studentID]);
        return $stmt->rowCount(); // Trả về 1 nếu cập nhật thành công, 0 nếu không tìm thấy hoặc đã được xử lý
    } catch (PDOException $e) {
        error_log("Error cancelling book loan request: " . $e->getMessage());
        return 0;
    }
}


    public function getCountRequests() {
         try{
        $sql = "SELECT COUNT(RequestID) FROM bookloan_request";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
        } catch(PDOException $e) {
            error_log("Error get count request " . $e->getMessage());
            return 0;
        }
    }
}
