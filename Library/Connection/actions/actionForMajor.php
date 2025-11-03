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

require_once '../class/classForMajor.php';
// Helper to send JSON responses and set HTTP status code
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
$major = new major();
$action = $_REQUEST['action'] ?? null;
switch ($action) {

    case 'getMajors':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
        }
        $data = $major->getAllMajor();
        if ($data === false) {
            sendJson(['success' => false, 'message' => 'Không thể lấy danh sách ngành.'], 500);
        }
        sendJson(['success' => true, 'data' => $data]);
        

    case 'getMajorById':
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
            }

            $MajorID = filter_input(INPUT_GET, 'MajorID', FILTER_VALIDATE_INT);
            if (!$MajorID || $MajorID <= 0) {
                sendJson(['success' => false, 'message' => 'ID ngành không hợp lệ.'], 400);
            }

            $data = $major->getMajorById($MajorID);
            if ($data === null) {
                sendJson(['success' => false, 'message' => 'Không tìm thấy ngành.'], 404);
            }

            // getAdminById already excludes password; return result directly
            sendJson(['success' => true, 'data' => $data]);
            exit;

    case 'addMajor':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $MajorCode = $_POST['MajorCode'] ?? '';
        $MajorName = $_POST['MajorName'] ?? '';
        // Sửa lỗi key và ép kiểu sang integer
        $facultyID = isset($_POST['FacultyID']) ? (int)$_POST['FacultyID'] : 0;
        $TrainingLevel = $_POST['TrainingLevel'] ?? null;
        // Xử lý trường số có thể null
        $CreditsRequired = isset($_POST['CreditsRequired']) && !empty($_POST['CreditsRequired']) ? (int)$_POST['CreditsRequired'] : null;
        // Sửa lỗi chính tả $POST -> $_POST
        $Description = $_POST['Description'] ?? null;

        // Cải thiện logic xác thực
        if (trim($MajorCode) === '' || trim($MajorName) === '' || $facultyID <= 0) {
            sendJson(['success' => false, 'message' => 'Mã ngành, Tên ngành, và Khoa là các trường bắt buộc.'], 400);
        }

        $result = $major->addMajor(
            $MajorCode,
            $MajorName,
            $facultyID, // Đã là kiểu int
            $TrainingLevel,
            $CreditsRequired, // Đã là kiểu int hoặc null
            $Description
        );

        if ($result) {
            sendJson(['success' => true, 'message' => 'Thêm ngành thành công.'], 201);
        } else {
            sendJson(['success' => false, 'message' => 'Thêm ngành thất bại. Mã ngành có thể đã tồn tại hoặc ID Khoa không hợp lệ.'], 400);
        }
        break;

    case 'updateMajor':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $majorId = isset($_POST['MajorID']) ? (int)$_POST['MajorID'] : 0;
        if ($majorId <= 0) {
            sendJson(['success' => false, 'message' => 'ID Ngành không hợp lệ.'], 400);
        }

        $updateData = [];
        $allowedFields = ['MajorCode', 'MajorName', 'FacultyID', 'TrainingLevel', 'CreditsRequired', 'Description'];
        foreach ($allowedFields as $field) {
            if (isset($_POST[$field])) {
                $updateData[$field] = $_POST[$field];
            }
        }

        if (empty($updateData)) {
            sendJson(['success' => false, 'message' => 'Không có dữ liệu để cập nhật.'], 400);
        }

        $result = $major->updateMajor($majorId, $updateData);

        if ($result) {
            sendJson(['success' => true, 'message' => 'Cập nhật ngành thành công.']);
        } else {
            sendJson(['success' => false, 'message' => 'Cập nhật ngành thất bại hoặc không có gì thay đổi.']);
        }
        break;

    case 'deleteMajor':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $majorId = isset($_POST['MajorID']) ? (int)$_POST['MajorID'] : 0;
        if ($majorId <= 0) {
            sendJson(['success' => false, 'message' => 'ID Ngành không hợp lệ.'], 400);
        }

        $result = $major->deleteMajor($majorId);

        if ($result) {
            sendJson(['success' => true, 'message' => 'Xóa ngành thành công.']);
        } else {
            sendJson(['success' => false, 'message' => 'Xóa ngành thất bại. Ngành có thể không tồn tại hoặc đã có sinh viên.'], 400);
        }
        break;

     default:
        sendJson(['success' => false, 'message' => 'Hành động không hợp lệ.'], 404);
        break;
}