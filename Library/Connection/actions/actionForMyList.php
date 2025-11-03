<?php
session_start();
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require_once '../connectDB.php';
require_once '../class/classForMyList.php';

function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}


$myList = new MyListBooks();

$action = $_REQUEST['action'] ?? null;

switch ($action) {
    case 'addToList':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
        }
        $studentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);
        $booksID = filter_input(INPUT_POST, 'BooksID', FILTER_VALIDATE_INT);

        if (!$studentID || !$booksID) {
            sendJson(['success' => false, 'message' => 'Thiếu thông tin StudentID hoặc BooksID.'], 400);
        }

        $result = $myList->addToList($studentID, $booksID);

        if ($result === 1) {
            sendJson(['success' => true, 'message' => 'Đã thêm sách vào tủ thành công!']);
        } elseif ($result === -1) {
            sendJson(['success' => false, 'message' => 'Sách này đã có trong tủ của bạn.'], 409);
        } else {
            sendJson(['success' => false, 'message' => 'Thêm sách vào tủ thất bại.'], 500);
        }
        break;

    case 'getListByStudent':
        $studentID = filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);
        if (!$studentID) {
            sendJson(['success' => false, 'message' => 'Thiếu StudentID.'], 400);
        }
        $data = $myList->getListByStudent($studentID);
        sendJson(['success' => true, 'data' => $data]);
        break;


    case 'deleteFromList':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Yêu cầu không hợp lệ. Chỉ chấp nhận phương thức POST.'], 405);
        }
        
        $listId = filter_input(INPUT_POST, 'ListID', FILTER_VALIDATE_INT);

        if (!$listId || $listId <= 0) {
            sendJson(['success' => false, 'message' => 'ID không hợp lệ.'], 400);
        }

        $result = $myList->deleteListById($listId);
        
        if ($result > 0) {
            sendJson(['success' => true, 'message' => 'Đã xóa sách khỏi tủ thành công.']);
        } else {
            sendJson(['success' => false, 'message' => 'Xóa thất bại hoặc sách không tồn tại trong tủ.'], 404);
        }
        break;

    default:
        sendJson(['success' => false, 'message' => 'Hành động không hợp lệ.'], 400);
        break;
}
?>