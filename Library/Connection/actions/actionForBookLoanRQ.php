<?php
session_start();
header('Content-Type: application/json');

// Cho phép React App (chạy ở port khác) có thể gọi API này
header("Access-Control-Allow-Origin: *");
// Cho phép các phương thức (POST, GET, etc.)
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
// Cho phép các header cụ thể
header("Access-Control-Allow-Headers: Content-Type");
// Khai báo kiểu nội dung trả về là JSON
header("Content-Type: application/json; charset=UTF-8");

require_once '../class/classForBookLoanRQ.php';
// Helper to send JSON responses and set HTTP status code
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
$bookloanrq = new bookloanrq();
$action = $_REQUEST['action'] ?? null;
try {
    $action = $_REQUEST['action'] ?? null;

    if($action) {

        switch ($action) {

            case 'getAllBookLoanRQ': 
                $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]);
                $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 10, 'min_range' => 1]]);
                $offset = ($page - 1) * $limit;

                $totalItems = $bookloanrq->getCountRequests();
                $totalPages = ceil($totalItems / $limit);
                $data = $bookloanrq->getAllBookLoanRQ($limit, $offset);

                sendJson([
                    'success' => true,
                    'data' => $data,
                    'total_pages' => $totalPages,
                    'current_page' => $page
                ]);
                break;

            case 'addBookLoanRequest':
                // 1. Chỉ chấp nhận phương thức POST
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ. Vui lòng sử dụng POST.'], 405); // 405 Method Not Allowed
                }
            
                // 2. Lấy và xác thực đầu vào một cách an toàn hơn
                $StudentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);
                $BooksID = filter_input(INPUT_POST, 'BooksID', FILTER_VALIDATE_INT); // Sửa booksID thành BooksID
            
                // 3. Kiểm tra xem ID có hợp lệ không (là số nguyên dương)
                if (!$StudentID || $StudentID <= 0 || !$BooksID || $BooksID <= 0) {
                    sendJson(['success' => false, 'message' => 'Thiếu hoặc sai định dạng StudentID hoặc BooksID.'], 400); // 400 Bad Request
                }
            
                // 4. Gọi phương thức để thêm yêu cầu
                $result = $bookloanrq->addBookLoanRequest($StudentID, $BooksID);

                // 5. Xử lý kết quả và trả về JSON với mã HTTP phù hợp
                if ($result === 1) {
                    sendJson(['success' => true, 'message' => 'Yêu cầu mượn sách đã được gửi thành công!'], 201); // 201 Created
                } elseif ($result === -1) {
                    sendJson(['success' => false, 'message' => 'Bạn đã yêu cầu mượn cuốn sách này rồi.'], 409); // 409 Conflict
                } else {
                    // Development helper: try to collect PDO error info so we can debug why insertion returned 0.
                    $dbError = null;
                    try {
                        $conn = $bookloanrq->getConnection();
                        if ($conn instanceof PDO) {
                            $err = $conn->errorInfo();
                            if (is_array($err)) {
                                $dbError = implode(' | ', $err);
                            }
                        }
                    } catch (Throwable $e) {
                        $dbError = 'Failed to read PDO errorInfo: ' . $e->getMessage();
                    }

                    // Log for server-side inspection
                    error_log('addBookLoanRequest failed for StudentID=' . $StudentID . ' BooksID=' . $BooksID . ' DB_ERROR=' . $dbError);

                    // Return a small debug field to the client (remove in production)
                    $payload = ['success' => false, 'message' => 'Gửi yêu cầu thất bại. Vui lòng thử lại.'];
                    if ($dbError) $payload['db_error'] = $dbError;

                    sendJson($payload, 500); // 500 Internal Server Error
                }
                break;


            case 'getBookLoanRQByStudent':
                $studentID = filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);
                if (!$studentID) {
                    sendJson(['success' => false, 'message' => 'Thiếu hoặc ID sinh viên không hợp lệ.'], 400);
                }
                $data = $bookloanrq->getBookLoanRQByStudent($studentID);
                sendJson(['success' => true, 'data' => $data]);
                break;

            case 'updateRequestStatus':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                }

                $requestID = filter_input(INPUT_POST, 'RequestID', FILTER_VALIDATE_INT);
                $newStatus = filter_input(INPUT_POST, 'Status', FILTER_SANITIZE_STRING);

                if (!$requestID || !$newStatus) {
                    sendJson(['success' => false, 'message' => 'Thiếu RequestID hoặc Status.'], 400);
                }

                $result = $bookloanrq->updateRequestStatus($requestID, $newStatus);

                // Gửi kết quả về client
                sendJson($result, $result['success'] ? 200 : 500);
                break;

            case 'cancelBookLoanRequest':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                }

                $requestID = filter_input(INPUT_POST, 'RequestID', FILTER_VALIDATE_INT);
                $studentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);

                if (!$requestID || !$studentID) {
                    sendJson(['success' => false, 'message' => 'Thiếu thông tin RequestID hoặc StudentID.'], 400);
                }

                $result = $bookloanrq->cancelBookLoanRequest($requestID, $studentID);

                if ($result === 1) {
                    sendJson(['success' => true, 'message' => 'Đã hủy yêu cầu mượn sách thành công.']);
                } else {
                    sendJson(['success' => false, 'message' => 'Không thể hủy yêu cầu. Yêu cầu có thể đã được xử lý hoặc không tồn tại.'], 404);
                }
                break;


            case 'getCountRequests':
                if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                    sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
                }
                try {
                    $count = $bookloanrq->getCountRequests(); // Giả sử phương thức này tồn tại và trả về số
                    sendJson(['success' => true, 'data' => $count]);
                } catch (PDOException $e) {
                    error_log("getCountRequests error: " . $e->getMessage());
                    sendJson(['success' => false, 'message' => 'Lỗi server .'], 500);
                }
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ: ' . htmlspecialchars($action)]);
                break;
        }

    } else {
        echo json_encode(['success' => false, 'message' => 'Không có hành động nào được chỉ định.']);
    }

} catch (PDOException $e) {
    error_log("General Error in adminAct.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    // Trả về thông báo lỗi chung cho client
    echo json_encode(['success' => false, 'message' => 'Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.']);
}

?>