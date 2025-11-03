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

require_once '../class/classForAdmin.php';
// Helper to send JSON responses and set HTTP status code
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Lấy hành động từ request (GET hoặc POST)
    $action = $_REQUEST['action'] ?? null;
     $action = is_string($action) ? trim(filter_var($action, FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : null;

    if (!$action) {
        sendJson(['success' => false, 'message' => 'Không có hành động nào được chỉ định.'], 400);
    }

    if ($action) {
        $adminObj = new admin();

        switch ($action) {

            case 'getAdmins':
                $admins = $adminObj->getAdmins();
                echo json_encode(['success' => true, 'data' => $admins]);
                exit; // Thêm exit để không chạy xuống case dưới

          // GET ADMIN BY ID
            case 'getAdminById':
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
            }

            $AdminID = filter_input(INPUT_GET, 'AdminID', FILTER_VALIDATE_INT);
            if (!$AdminID || $AdminID <= 0) {
                sendJson(['success' => false, 'message' => 'ID Admin không hợp lệ.'], 400);
            }

            $admin = $adminObj->getAdminById($AdminID);
            if ($admin === null) {
                sendJson(['success' => false, 'message' => 'Không tìm thấy admin.'], 404);
            }

            // getAdminById already excludes password; return result directly
            sendJson(['success' => true, 'data' => $admin]);
            exit;

            // ADD ADMIN
            case 'AddAdmin':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    $name = $_POST['AdminName'] ?? null;
                    $gmail = $_POST['AdminGmail'] ?? null;
                    $raw_password = $_POST['AdminPassword'] ?? null;
                    $age = $_POST['AdminAge'] ?? null;
                    $gender = $_POST['AdminGender'] ?? null;

                    // Luôn mã hóa mật khẩu trước khi lưu vào CSDL
                    $password = password_hash($raw_password, PASSWORD_DEFAULT);

                    // Gọi hàm với đúng tham số
                    $result = $adminObj->addAdmin($name, $gmail, $password, $age, $gender);

                    if ($result > 0) {
                        echo json_encode(['success' => true, 'message' => 'Thêm admin thành công!']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Thêm admin thất bại. Có thể do Gmail đã tồn tại hoặc lỗi hệ thống.']);
                    }
                }
                exit;

            // DELETE ADMIN
            case 'DeleteAdmin':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    // Lấy ID từ request POST
                    $AdminID = $_POST['AdminID'] ?? 0;

                    if ($AdminID > 0) {
                        $result = $adminObj->deleteAdmin($AdminID);
                        if ($result > 0) {
                            echo json_encode(['success' => true, 'message' => 'Admin đã được xóa thành công.']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Xóa admin thất bại.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'ID Admin không hợp lệ.']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Yêu cầu không hợp lệ. Chỉ chấp nhận phương thức POST.']);
                }
                exit;

            // UPDATE ADMIN
            case 'UpdateAdmin':
                   if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    $id = $_POST['AdminID'] ?? 0;

                    if ($id > 0) {
                        // Lọc các trường được phép cập nhật để tăng bảo mật
                        $allowed_fields = ['AdminName', 'AdminGmail', 'AdminPassword', 'AdminAge', 'AdminGender'];
                        $updateData = [];
                        foreach ($allowed_fields as $field) {
                            if (isset($_POST[$field])) {
                                $updateData[$field] = $_POST[$field];
                            }
                        }

                        // Phương thức updateAdmin đã được làm linh hoạt và sẽ xử lý việc mã hóa
                        $result = $adminObj->updateAdmin($id, $updateData);

                        if ($result > 0) {
                            echo json_encode(['success' => true, 'message' => 'Cập nhật admin thành công!']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại, email có thể đã tồn tại hoặc không có gì thay đổi.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'ID Admin không hợp lệ.']);
                    }
                }
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
