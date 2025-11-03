<?php
session_start();
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../class/classForNotifications.php';

function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}



$notifications = new Notifications();

$action = $_REQUEST['action'] ?? null;

switch ($action) {
    case 'getUnread':
        $studentID = filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);
        if (!$studentID) {
            sendJson(['success' => false, 'message' => 'Thiếu StudentID.'], 400);
        }
        $data = $notifications->getUnreadNotificationsByStudent($studentID);
        sendJson(['success' => true, 'data' => $data]);
        break;

    case 'markAsRead':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
        }
        $notificationID = filter_input(INPUT_POST, 'NotificationID', FILTER_VALIDATE_INT);
        $studentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);

        if (!$notificationID || !$studentID) {
            sendJson(['success' => false, 'message' => 'Thiếu NotificationID hoặc StudentID.'], 400);
        }

        $result = $notifications->markAsRead($notificationID, $studentID);
        if ($result > 0) {
            sendJson(['success' => true, 'message' => 'Đã đánh dấu là đã đọc.']);
        } else {
            sendJson(['success' => false, 'message' => 'Không thể cập nhật thông báo.']);
        }
        break;

case 'getNotificationsByStudent':
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
    }
    // Sửa: Đọc StudentID từ $_GET thay vì $_POST
    $studentID = filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);

    // Sửa: Chỉ cần kiểm tra StudentID
    if (!$studentID) {
        sendJson(['success' => false, 'message' => 'Thiếu StudentID.'], 400);
    }

    $result = $notifications->getNotificationByStudentId($studentID);
    
    // Trả về dữ liệu là một object chứa tổng số thông báo
    if ($result !== null) {
        sendJson(['success' => true, 'data' => $result]);
    } else {
        sendJson(['success' => false, 'message' => 'Không thể lấy số lượng thông báo.']);
    }

    break;
        

    default:
        sendJson(['success' => false, 'message' => 'Hành động không hợp lệ.'], 400);
        break;
}
?>