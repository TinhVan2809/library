<?php
session_start();
header('Content-Type: application/json');

// Cấu hình CORS để cho phép frontend React gọi API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Xử lý request pre-flight của trình duyệt
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../class/classForUsers.php';

/**
 * Hàm trợ giúp để gửi phản hồi JSON và thoát script.
 * @param mixed $payload Dữ liệu cần gửi.
 * @param int $statusCode Mã trạng thái HTTP.
 */
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$users = new users();
$action = $_REQUEST['action'] ?? null;

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ. Vui lòng sử dụng POST.'], 405);
        }

        $email = $_POST['email'] ?? null;
        $password = $_POST['password'] ?? null;

        if (empty($email) || empty($password)) {
            sendJson(['success' => false, 'message' => 'Vui lòng cung cấp email và mật khẩu.'], 400);
        }

        $user = $users->login($email, $password);

        if ($user) {
            // Đăng nhập thành công, lưu thông tin người dùng vào session
            $_SESSION['user_id'] = $user->userid;
            $_SESSION['username'] = $user->username;
            // Trả về dữ liệu người dùng cho frontend
            sendJson(['success' => true, 'data' => $user]);
        } else {
            // Đăng nhập thất bại
            sendJson(['success' => false, 'message' => 'Email hoặc mật khẩu không chính xác.'], 401);
        }
        break;

    default:
        sendJson(['success' => false, 'message' => 'Hành động không hợp lệ.'], 404);
        break;
}
?>