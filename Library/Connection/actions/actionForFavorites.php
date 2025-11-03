<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (session_status() === PHP_SESSION_NONE) { 
    session_start();
}

require_once '../class/classForFavorites.php';

// Helper function to send JSON response
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

$action = $_REQUEST['action'] ?? null;
$favorites = new Favorites(); 

switch ($action) {
    case 'toggleFavorite':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
        }

        // Lấy StudentID từ session hoặc từ request (ưu tiên session)
        $studentId = $_SESSION['user_id'] ?? filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);
        $bookId = filter_input(INPUT_POST, 'BooksID', FILTER_VALIDATE_INT);

        if (!$studentId || !$bookId) {
            sendJson(['success' => false, 'message' => 'Thiếu StudentID hoặc BooksID.'], 400);
        }

        $result = $favorites->toggleFavorite($studentId, $bookId);

        // Chỉ coi là lỗi khi kết quả trả về chính xác là `false`
        if ($result !== false) {
            // Lấy lại tổng số lượt thích mới nhất
            $newCount = $favorites->getFavoriteCountByBook($bookId);
            sendJson([
                'success' => true,
                'status' => $result, // 'added' or 'removed'
                'new_favorite_count' => $newCount
            ], 200);
        } else {
            sendJson(['success' => false, 'message' => 'Thao tác thất bại.'], 500);
        }
        break;

    case 'getFavoriteStatus':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
        }

        $studentId = $_SESSION['user_id'] ?? filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);
        $bookId = filter_input(INPUT_GET, 'BooksID', FILTER_VALIDATE_INT);

        if (!$bookId) {
            sendJson(['success' => false, 'message' => 'Thiếu BooksID.'], 400);
        }

        $totalCount = $favorites->getFavoriteCountByBook($bookId);
        $isFavorited = false;
        if ($studentId) {
            $isFavorited = $favorites->isFavoritedByUser($studentId, $bookId);
        }

        sendJson([
            'success' => true,
            'is_favorited' => $isFavorited,
            'total_favorites' => $totalCount
        ], 200);
        break;

                    case 'getTopFavoritedBooks':
                    // Chỉ cho phép phương thức GET
                    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                        sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                        break;
                    }

                    // Gọi phương thức mới để lấy dữ liệu
                    $topBooks = $favorites->getTopFavoritedBooks();

                    // Gửi dữ liệu về cho client
                    // Dữ liệu có thể là một mảng rỗng nếu không có sách nào được yêu thích.
                    sendJson(['success' => true, 'data' => $topBooks], 200);
                    
                    break;

    case 'getCountFavoritesByStudentId': 
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
        }

        $studentId = $_SESSION['user_id'] ?? filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);

        if (!$studentId) {
            sendJson(['success' => false, 'message' => 'Thiếu StudentID'], 400);
        }

        try{
            $data = $favorites->getCountFavoritesByStudentID($studentId);
           
            if ($data === null) {
                $data = (object)['FullName' => null, 'TongSoSachDaThich' => 0];
            }
            sendJson(['success' => true, 'data' => $data], 200);
        } catch(PDOException $e) {
            error_log('Error ' . $e-> getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi máy chủ khi truy vấn sách.'], 500);
        }
        break;


        case 'getFavoritesByStudentId' :
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
        }

        $studentId = $_SESSION['user_id'] ?? filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);

        if (!$studentId) {
            sendJson(['success' => false, 'message' => 'Thiếu StudentID'], 400);
        }

        try{
            $data = $favorites->getFavoritedBooksByStudent($studentId);
            sendJson(['success' => true, 'data' => $data], 200);
        } catch(PDOException $e) {
            error_log('Error ' . $e-> getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi máy chủ.'], 500);
        }

        break;
        

    default:
        sendJson(['success' => false, 'message' => 'Hành động không hợp lệ.'], 400);
        break;


    
        
}
?>
