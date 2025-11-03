<?php
 session_start(); 
header('Content-Type: application/json');
// Ensure session only started when needed
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Consolidated headers and CORS
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
require_once '../class/classForAuthors.php';

try {
    // Lấy hành động từ request (GET hoặc POST)
    $action = $_REQUEST['action'] ?? null;

    if ($action) {
        $authorObj = new authors();

        switch ($action) {

            case 'GetAuthors':
                $authors = $authorObj->getAuthors();
                echo json_encode(['success' => true, 'data' => $authors]);
                exit; // Thêm exit để không chạy xuống case dưới

            case 'getBooksByAuthor': // Đổi tên cho nhất quán
                // Lấy AuthorID và currentBookID từ request (cho cả GET/POST)
                $authorID = isset($_REQUEST['AuthorID']) ? (int) $_REQUEST['AuthorID'] : 0;
                $currentBookID = isset($_REQUEST['currentBookID']) ? (int) $_REQUEST['currentBookID'] : null;

                if ($authorID <= 0) {
                    error_log("actionForAuthors.php: invalid AuthorID: " . var_export($_REQUEST['AuthorID'] ?? null, true));
                    echo json_encode(['success' => false, 'message' => 'AuthorID không hợp lệ.']);
                    exit;
                }

                // Debug log (tạm nếu cần)
                // error_log("actionForAuthors.php getBooksByAuthor AuthorID=$authorID currentBookID=" . ($currentBookID ?? 'null'));

                // Gọi hàm với các tham số đã được xác thực
                $books = $authorObj->getBooksByAuthor($authorID, $currentBookID ?: null);
                echo json_encode(["success" => true, 'data' => $books]);
                exit;

            // ADD AUTHORS
            case 'AddAuthors':
             if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    // Sử dụng toán tử ?? để gán giá trị mặc định, tránh lỗi "Undefined index"
                    $AuthorName = trim($_POST['AuthorName'] ?? '');
                    $BirthYear = !empty($_POST['BirthYear']) ? (int)$_POST['BirthYear'] : null;
                    $Country = trim($_POST['Country'] ?? '');
                    $Description = trim($_POST['Description'] ?? '');

                    // Gọi hàm với đúng tham số
                    $result = $authorObj->addAuthors($AuthorName, $BirthYear, $Country, $Description);

                    if ($result > 0) {
                        echo json_encode(['success' => true, 'message' => 'Thêm tác giả thành công!']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Thêm tác giả thất bại. Vui lòng kiểm tra lại tên tác giả không được để trống.']);
                    }
                }
                exit;

            // DELETE Authors
            case 'DeleteAuthors':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    // Lấy ID từ request POST
                    $AuthorID = $_POST['AuthorID'] ?? 0;

                    if ($AuthorID > 0) {
                        $result = $authorObj->deleteAuthors($AuthorID);
                        if ($result > 0) {
                            echo json_encode(['success' => true, 'message' => 'Tác giả đã được xóa thành công.']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Xóa tác giả thất bại.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'ID Tác giả không hợp lệ.']);
                    }
                }
                exit;

            case 'getCountAuthors':
                if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                    echo json_encode(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.']);
                    exit;
                }
                try {
                    $count = $authorObj->getCountAuthors(); // Giả sử phương thức này tồn tại và trả về số
                    echo json_encode(['success' => true, 'data' => $count]);
                } catch (PDOException $e) {
                    error_log("getCountAuthor error: " . $e->getMessage());
                    echo json_encode(['success' => false, 'message' => 'Lỗi server .']);
                }
                exit;

            // UPDATE AUTHORS
            case 'UpdateAuthors':
                //   placeholder 
                
                exit;


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
