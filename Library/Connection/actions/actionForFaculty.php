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

// Xử lý request pre-flight của trình duyệt
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}


require_once '../class/classForFaculty.php';

// Helper to send JSON responses and set HTTP status code
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$faculty = new faculty();
$action = $_REQUEST['action'] ?? null;

switch ($action) {
    case 'getFaculties':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
        }
        $data = $faculty->getAllFaculty();
        if ($data === false) {
            sendJson(['success' => false, 'message' => 'Không thể lấy danh sách khoa.'], 500);
        }
        sendJson(['success' => true, 'data' => $data]);
        break;
    
    case 'getFacultyById':
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
            }

            $FacultyID = filter_input(INPUT_GET, 'FacultyID', FILTER_VALIDATE_INT);
            if (!$FacultyID || $FacultyID <= 0) {
                sendJson(['success' => false, 'message' => 'ID  khoa không hợp lệ.'], 400);
            }

            $data = $faculty ->getFacultyById($FacultyID);
            if ($data === null) {
                sendJson(['success' => false, 'message' => 'Không tìm thấy khoa.'], 404);
            }

            // getAdminById already excludes password; return result directly
            sendJson(['success' => true, 'data' => $data]);
            exit;

    case 'addFaculty':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $facultyCode = $_POST['FacultyCode'] ?? '';
        $facultyName = $_POST['FacultyName'] ?? '';
        $phone = $_POST['Phone'] ?? null;
        $email = $_POST['Email'] ?? null;
        $address = $_POST['Address'] ?? null;
        $establishedYear = isset($_POST['EstablishedYear']) && !empty($_POST['EstablishedYear']) ? (int)$_POST['EstablishedYear'] : null;

        if (trim($facultyCode) === '' || trim($facultyName) === '') {
            sendJson(['success' => false, 'message' => 'Mã khoa và Tên khoa là bắt buộc.'], 400);
        }

        $result = $faculty->addFaculty($facultyCode, $facultyName, $phone, $email, $address, $establishedYear);

        if ($result) {
            sendJson(['success' => true, 'message' => 'Thêm khoa thành công.'], 201);
        } else {
            sendJson(['success' => false, 'message' => 'Thêm khoa thất bại. Mã khoa có thể đã tồn tại.'], 400);
        }
        break;

    case 'updateFaculty':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $facultyId = isset($_POST['FacultyID']) ? (int)$_POST['FacultyID'] : 0;
        if ($facultyId <= 0) {
            sendJson(['success' => false, 'message' => 'ID Khoa không hợp lệ.'], 400);
        }

        $updateData = [];
        $allowedFields = ['FacultyCode', 'FacultyName', 'Phone', 'Email', 'Address', 'EstablishedYear'];
        foreach ($allowedFields as $field) {
            if (isset($_POST[$field])) {
                $updateData[$field] = $_POST[$field];
            }
        }

        if (empty($updateData)) {
            sendJson(['success' => false, 'message' => 'Không có dữ liệu để cập nhật.'], 400);
        }

        $result = $faculty->updateFaculty($facultyId, $updateData);

        if ($result) {
            sendJson(['success' => true, 'message' => 'Cập nhật khoa thành công.']);
        } else {
            sendJson(['success' => false, 'message' => 'Cập nhật khoa thất bại hoặc không có gì thay đổi.']);
        }
        break;

    case 'deleteFaculty':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $facultyId = isset($_POST['FacultyID']) ? (int)$_POST['FacultyID'] : 0;
        if ($facultyId <= 0) {
            sendJson(['success' => false, 'message' => 'ID Khoa không hợp lệ.'], 400);
        }

        $result = $faculty->deleteFaculty($facultyId);

        if ($result) {
            sendJson(['success' => true, 'message' => 'Xóa khoa thành công.']);
        } else {
            sendJson(['success' => false, 'message' => 'Xóa khoa thất bại. Khoa có thể không tồn tại hoặc đã có sinh viên/ngành học.'], 400);
        }
        break;

    default:
        sendJson(['success' => false, 'message' => 'Hành động không hợp lệ.'], 404);
        break;
}
?>