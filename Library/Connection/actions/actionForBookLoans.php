<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start(); 
header('Content-Type: application/json');
require_once '../class/classForBookLoans.php';


// Helper to send JSON responses and set HTTP status code
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
$bookloans = new bookloans();
$action = $_REQUEST['action'] ?? null;

try {
    // Lấy hành động từ request (GET hoặc POST)
    $action = $_REQUEST['action'] ?? null;

    if ($action) {
 

        switch ($action) {

            case 'GetBookLoans':
                $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]);
                $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 10, 'min_range' => 1]]);
                $offset = ($page - 1) * $limit;

                $totalItems = $bookloans->getTotalBookLoansCount();
                $totalPages = ceil($totalItems / $limit);
                $data = $bookloans->getAllBookLoans($limit, $offset);

                sendJson([
                    'success' => true,
                    'data' => $data,
                    'total_pages' => $totalPages,
                    'current_page' => $page
                ]);
                break;



            case 'AddBookLoan':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ. Vui lòng sử dụng POST.'], 405);
                }

                try {
                    // Lấy và validate input
                    $studentId   = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);
                    $bookId      = filter_input(INPUT_POST, 'BooksID',   FILTER_VALIDATE_INT);
                    $loanDateRaw = trim($_POST['LoanDate']   ?? '');
                    $dueDateRaw  = trim($_POST['DueDate']    ?? '');
                    $returnDateRaw = trim($_POST['ReturnDate'] ?? '');
                    $status      = trim($_POST['Status']     ?? 'borrowed');

                    if (!$studentId || $studentId <= 0 || !$bookId || $bookId <= 0) {
                        sendJson(['success' => false, 'message' => 'StudentID hoặc BooksID không hợp lệ.'], 400);
                    }

                    // Validate dates; nếu không cung cấp, thiết lập mặc định
                    $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
                    $loanDate = $loanDateRaw !== '' ? DateTimeImmutable::createFromFormat('Y-m-d', $loanDateRaw) : $now;
                    if ($loanDate === false) {
                        // thử parse linh hoạt
                        $ts = strtotime($loanDateRaw);
                        $loanDate = $ts ? (new DateTimeImmutable())->setTimestamp($ts) : $now;
                    }

                    if ($dueDateRaw !== '') {
                        $dueDate = DateTimeImmutable::createFromFormat('Y-m-d', $dueDateRaw);
                        if ($dueDate === false) {
                            $ts = strtotime($dueDateRaw);
                            $dueDate = $ts ? (new DateTimeImmutable())->setTimestamp($ts) : null;
                        }
                    } else {
                        // mặc định 14 ngày nếu không có
                        $dueDate = $loanDate->add(new DateInterval('P14D'));
                    }

                    $returnDate = null;
                    if ($returnDateRaw !== '') {
                        $rd = DateTimeImmutable::createFromFormat('Y-m-d', $returnDateRaw);
                        if ($rd === false) {
                            $ts = strtotime($returnDateRaw);
                            $rd = $ts ? (new DateTimeImmutable())->setTimestamp($ts) : null;
                        }
                        $returnDate = $rd ?: null;
                    }

                   
                    // Gọi model để thêm phiếu mượn
                    $result = $bookloans->addBookLoan(
                        $studentId,
                        $bookId,
                        $loanDate->format('Y-m-d'),
                        $dueDate ? $dueDate->format('Y-m-d') : null,
                        $returnDate ? $returnDate->format('Y-m-d') : null,
                        $status
                    );

                    if ($result && $result > 0) {
                        sendJson(['success' => true, 'message' => 'Thêm phiếu mượn thành công.'], 201);
                    } else {
                        sendJson(['success' => false, 'message' => 'Không thể tạo phiếu mượn. Vui lòng kiểm tra dữ liệu hoặc thử lại.'], 400);
                    }
                } catch (Throwable $e) {
                    error_log("Error AddBookLoan: " . $e->getMessage());
                    sendJson(['success' => false, 'message' => 'Lỗi máy chủ. Vui lòng thử lại sau.'], 500);
                }
                break;

                // DELETE BOOKLOAN
            case 'DeleteBookLoan':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    // Lấy ID từ request POST
                    $BookLoanID = $_POST['BookLoanID'] ?? 0;

                    if ($BookLoanID > 0) {
                        $result = $bookloans->deleteBookLoanById($BookLoanID);
                        if ($result > 0) {
                            echo json_encode(['success' => true, 'message' => 'bookloan deleted.']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'False delete bookloan.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Error ID bookloan.']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Request false.']);
                }
                exit;

            case 'getBookLoansByStudent':
                // Kiểm tra xem StudentID có được gửi lên không
                if (!isset($_GET['StudentID']) || empty($_GET['StudentID'])) {
                    echo json_encode(['success' => false, 'message' => 'Thiếu ID của sinh viên.']);
                    exit;
                }

                // Lấy StudentID và chuyển thành số nguyên
                $studentID = (int)$_GET['StudentID'];

                // Gọi phương thức từ class của bạn
                $bookLoans = $bookloans->getBookLoansByStudent($studentID);

                // Kiểm tra kết quả và trả về JSON
                if ($bookLoans !== 0 && is_array($bookLoans)) {
                    echo json_encode(['success' => true, 'data' => $bookLoans]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Không thể lấy danh sách sách mượn.']);
                }
                break;

            // Lấy 15 sách có số phiếu mượn nhiều nhất để làm sách đề cử
            case 'getMostBookLoan':
                // Lấy tham số limit từ client, nếu không có thì mặc định là 6
                $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 15]]);

                $mostBookLoan = $bookloans->getMostBookLoan($limit = 15);

                // Hàm getMostBookLoan trả về mảng hoặc false
                if ($mostBookLoan !== false) {
                    echo json_encode(['success' => true, 'data' => $mostBookLoan]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Không thể lấy danh sách sách được mượn nhiều nhất.']);
                }
                break;

            // Lấy tất cả 30 sách có số phiếu mượn nhiều nhất để làm sách đề cử
            case 'getFullMostBookLoan':
                // Lấy tham số limit từ client, nếu không có thì mặc định là 10
                $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 30]]);

                $mostBookLoan = $bookloans->getFullMostBookLoan($limit = 30);

                // Hàm getMostBookLoan trả về mảng hoặc false
                if ($mostBookLoan !== false) {
                    echo json_encode(['success' => true, 'data' => $mostBookLoan]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Không thể lấy danh sách sách được mượn nhiều nhất.']);
                }
                break;

            case 'getMostBookLoanForSlideShow':
                $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 10]]);

                $mostBookLoan = $bookloans->getFullMostBookLoan($limit = 10);

                // Hàm getMostBookLoan trả về mảng hoặc false
                if ($mostBookLoan !== false) {
                    echo json_encode(['success' => true, 'data' => $mostBookLoan]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Không thể lấy danh sách sách được mượn nhiều nhất.']);
                }
                break;

            case 'getCountBookLoanByStudentId': 
                    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                        sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                    }

                    $studentId = $_SESSION['user_id'] ?? filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);

                    if (!$studentId) {
                        sendJson(['success' => false, 'message' => 'Thiếu StudentID'], 400);
                    }

                    try{
                        $data = $bookloans->getCountBookLoanByStudentID($studentId);
                    
                        if ($data === null) {
                            $data = (object)['FullName' => null, 'total_bookloan' => 0];
                        }
                        sendJson(['success' => true, 'data' => $data], 200);
                    } catch(PDOException $e) {
                        error_log('Error ' . $e-> getMessage());
                        sendJson(['success' => false, 'message' => 'Lỗi máy chủ khi truy vấn.'], 500);
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