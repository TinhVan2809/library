<?php

header('Content-Type: application/json');
// Ensure session only started when needed
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Cho phép React App (chạy ở port khác) có thể gọi API này
header("Access-Control-Allow-Origin: *");
// Cho phép các phương thức (POST, GET, etc.)
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
// Cho phép các header cụ thể
header("Access-Control-Allow-Headers: Content-Type");
// Khai báo kiểu nội dung trả về là JSON
header("Content-Type: application/json; charset=UTF-8");

// Xử lý request pre-flight của trình duyệt
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../class/classForReview.php';

function sendJson($data, $statusCode = 200) {
    // Đặt mã trạng thái HTTP
    http_response_code($statusCode);
    // Đặt header Content-Type
    header('Content-Type: application/json; charset=utf-8');
    // In ra dữ liệu đã được mã hóa JSON
    echo json_encode($data);
    // Dừng thực thi script
    exit;
}

$review = new review();
$action = $_REQUEST['action'] ?? null;

try{


    if($action) {

        switch($action) {
            //plcaholder
            case 'addReview':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                }

                // Lấy và xác thực dữ liệu từ POST
                $studentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);
                $booksID   = filter_input(INPUT_POST, 'BooksID', FILTER_VALIDATE_INT);
                $rating    = filter_input(INPUT_POST, 'Rating', FILTER_VALIDATE_INT);
                $comment   = isset($_POST['Comment']) ? trim($_POST['Comment']) : null;

                  // Lấy ParentReviewID, nếu không có thì là null
                $parentReviewID = isset($_POST['ParentReviewID']) && !empty($_POST['ParentReviewID']) ? filter_input(INPUT_POST, 'ParentReviewID', FILTER_VALIDATE_INT) : null;

                if (!$studentID || !$booksID || !$rating) {
                    sendJson(['success' => false, 'message' => 'Thiếu dữ liệu bắt buộc (StudentID, BooksID, Rating).'], 400);
                }

                $result = $review->addReview($studentID, $booksID, $rating, $comment, $parentReviewID);

                if ($result > 0) {
                    sendJson(['success' => true, 'message' => 'Cảm ơn bạn đã gửi đánh giá!'], 201);
                } else {
                    sendJson(['success' => false, 'message' => 'Gửi đánh giá thất bại. Bạn có thể đã đánh giá sách này rồi.'], 400);
                }
                break;

            case 'getReviewsByBookId':
                try {
                    $bookId = isset($_GET['BooksID']) ? (int)$_GET['BooksID'] : 0;
                    if ($bookId <= 0) {
                        echo json_encode(['success' => false, 'message' => 'ID sách không hợp lệ.']);
                        exit;
                    }
                    $result = $review->getReviewsByBookId($bookId);
                    echo json_encode(['success' => true, 'data' => $result]);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()]);
                }
                break;

            case 'updateReview':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                }
                $reviewID  = filter_input(INPUT_POST, 'ReviewID', FILTER_VALIDATE_INT);
                $studentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);
                $comment   = isset($_POST['Comment']) ? trim($_POST['Comment']) : '';

                if (!$reviewID || !$studentID) {
                    sendJson(['success' => false, 'message' => 'Thiếu dữ liệu bắt buộc.'], 400);
                }

                $result = $review->updateReview($reviewID, $studentID, $comment);
                if ($result) {
                    sendJson(['success' => true, 'message' => 'Cập nhật bình luận thành công!']);
                } else {
                    sendJson(['success' => false, 'message' => 'Cập nhật thất bại. Bạn không có quyền hoặc bình luận không tồn tại.'], 403);
                }
                break;

            case 'deleteReview':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                }
                $reviewID  = filter_input(INPUT_POST, 'ReviewID', FILTER_VALIDATE_INT);
                $studentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);

                if (!$reviewID || !$studentID) {
                    sendJson(['success' => false, 'message' => 'Thiếu dữ liệu bắt buộc.'], 400);
                }

                $result = $review->deleteReview($reviewID, $studentID);
                sendJson(['success' => $result, 'message' => $result ? 'Đã xóa bình luận.' : 'Xóa thất bại.']);
                break;


                case 'getCountReviewByStudent':
                    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                        sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
                    }

                    $studentID = filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);

                    if (!$studentID) {
                        sendJson(['success' => false, 'message' => 'Thiếu StudentID.'], 400);
                    }

                    $data = $review->getCountReviewByStudentId($studentID);

                    if ($data) {
                        // Trả về JSON với cấu trúc { success: true, data: { total_review: X } }
                        sendJson(['success' => true, 'data' => $data, 'message' => 'Lấy số lượng đánh giá thành công.']);
                    } else {
                        // Trả về lỗi nếu không có dữ liệu hoặc có lỗi xảy ra
                        sendJson(['success' => false, 'message' => 'Không thể lấy số lượng đánh giá hoặc không có đánh giá nào.'], 404);
                    }
                    break;

                    case 'getReviewByStudentId' :
                         if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                        sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
                    }

                    $studentID = filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);

                     if (!$studentID) {
                        sendJson(['success' => false, 'message' => 'Thiếu StudentID.'], 400);
                    }

                    $data = $review->getReviewByStudentId($studentID);

                     if ($data) {
                        // Trả về JSON với cấu trúc { success: true, data: { total_review: X } }
                        sendJson(['success' => true, 'data' => $data, 'message' => 'Lấy số đánh giá thành công.']);
                    } else {
                        // Trả về lỗi nếu không có dữ liệu hoặc có lỗi xảy ra
                        sendJson(['success' => false, 'message' => 'Không thể lấy đánh giá hoặc không có đánh giá nào.'], 404);
                    }
                    break;


            default: 
            echo json_encode(["success" => false, "message" => 'Hành động không hợp lệ' . htmlspecialchars($action)]);
            exit;
        }

        
        
        
    } else {
        echo json_encode(["success" => false, "message" => 'Không có hành động nào được chỉ định' . htmlspecialchars($action)]);

    }

} catch (PDOException $e) {
    error_log("General Error in adminAct.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    // Trả về thông báo lỗi chung cho client
    echo json_encode(['success' => false, 'message' => 'Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.']);

}


?>