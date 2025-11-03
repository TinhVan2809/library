<?php 

session_start(); 
header('Content-Type: application/json');
require_once '../class/classForStudent.php';


// Cho phép React App (chạy ở port khác) có thể gọi API này
header("Access-Control-Allow-Origin: *");
// Cho phép các phương thức (POST, GET, etc.)
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
// Cho phép các header cụ thể
header("Access-Control-Allow-Headers: Content-Type");
// Khai báo kiểu nội dung trả về là JSON
header("Content-Type: application/json; charset=UTF-8");

// Helper to send JSON responses and set HTTP status code
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
$student = new student();
$action = $_REQUEST['action'] ?? null;

try {
    // Lấy hành động từ request (GET hoặc POST)
    $action = $_REQUEST['action'] ?? null;

    if ($action) {
 

        switch ($action) {

            case 'login':
                if (isset($_POST['Email']) && isset($_POST['Password'])) {
                    $user = $student->login($_POST['Email'], $_POST['Password']);
                    if ($user) {
                        sendJson(['success' => true, 'data' => $user]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Email hoặc mật khẩu không chính xác.']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Vui lòng cung cấp Email và mật khẩu.']);
                }
                break;

            case 'GetStudent':
                $student = $student->getStudent();
                echo json_encode(['success' => true, 'data' =>  $student]);
                exit; // Thêm exit để không chạy xuống case dưới

            case 'getStudentById':
                if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                    sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
                }

                $StudentID = filter_input(INPUT_GET, 'StudentID', FILTER_VALIDATE_INT);
                if (!$StudentID || $StudentID <= 0) {
                    sendJson(['success' => false, 'message' => 'ID sinh viên không hợp lệ.'], 400);
                }

                $data = $student->getStudentById($StudentID);
                if ($data === null) {
                    sendJson(['success' => false, 'message' => 'Không tìm thấy sinh viên.'], 404);
                }

                // getAdminById already excludes password; return result directly
                sendJson(['success' => true, 'data' => $data]);
                exit;

            // ADD STUDENT
            case 'AddStudent':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    $StudentCode = $_POST['StudentCode'] ?? null;
                    $FullName = $_POST['FullName'] ?? null;
                    $Gender = $_POST['Gender'] ?? null;
                    $DateOfBirth = $_POST['DateOfBirth'] ?? null;
                    $Email = $_POST['Email'] ?? null;
                    $Password = $_POST['Password'] ?? null;
                    $Phone = $_POST['Phone'] ?? null;
                    $Address = $_POST['Address'] ?? null;
                    $EnrollmentYear = $_POST['EnrollmentYear'] ?? null;
                    $Status = $_POST['Status'] ?? null;
                    $MajorID = isset($_POST['MajorID']) ? (int)$_POST['MajorID'] : null;
                    $FacultyID = isset($_POST['FacultyID']) ? (int)$_POST['FacultyID'] : null;
                  

                    // Sửa lỗi thứ tự tham số khi gọi hàm addStudent
                    $result =$student->addStudent($StudentCode, $FullName, $Gender, $DateOfBirth, $Email, $Password, $Phone, $Address, $EnrollmentYear, $Status, $MajorID, $FacultyID);

                    if ($result === 1) { // addStudent trả về 1 nếu thành công
                        echo json_encode(['success' => true, 'message' => 'Add Student Successfully!']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Thêm sinh viên thất bại. Vui lòng kiểm tra lại dữ liệu đầu vào, có thể bị trùng MSSV']);
                    }
                }
                exit;

            // DELETE STUDENT
            case 'DeleteStudent':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    // Lấy ID từ request POST
                    $StudentID = $_POST['StudentID'] ?? 0;

                    if ($StudentID > 0) {
                        $result = $student->deleteStudent($StudentID);
                        if ($result > 0) {
                            echo json_encode(['success' => true, 'message' => 'Student deleted.']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'False delete Student.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Error ID Student.']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Request false.']);
                }
                exit;

            // UPDATE STUDENT
            case 'UpdateStudent':
                   if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    $id = $_POST['StudentID'] ?? 0;

                    if ($id > 0) {
                        // Lọc các trường được phép cập nhật để tăng bảo mật
                        $allowed_fields = ["StudentCode" ,"FullName", "Gender", "DateOfBirth", "Email", "Password", "Phone", "Address", "EnrollmentYear", "Status", "MajorID", "FacultyID", "BooksID" ];
                        $updateData = []; // Khởi tạo mảng updateData
                        foreach ($allowed_fields as $field) {
                            if (isset($_POST[$field])) {
                                $updateData[$field] = $_POST[$field];
                            }
                        }

                        // Phương thức updateAdmin đã được làm linh hoạt và sẽ xử lý việc mã hóa
                        $result = $student->updateStudent($id, $updateData);
                        
                        if ($result > 0) {
                            echo json_encode(['success' => true, 'message' => 'Update Student successfully!']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Update false']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Error ID Student.']);
                    }
                }
                exit;

            case 'updateAvatar':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
                }

                $studentID = filter_input(INPUT_POST, 'StudentID', FILTER_VALIDATE_INT);
                if (!$studentID || $studentID <= 0) {
                    sendJson(['success' => false, 'message' => 'ID sinh viên không hợp lệ.'], 400);
                }

                if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
                    sendJson(['success' => false, 'message' => 'Không có file ảnh nào được tải lên hoặc có lỗi xảy ra.'], 400);
                }

                $file = $_FILES['avatar'];
                $uploadDir = __DIR__ . '/../../uploads/avatars/';
                if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
                    sendJson(['success' => false, 'message' => 'Không thể tạo thư mục uploads/avatars/.'], 500);
                }

                // Kiểm tra file
                $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                $maxFileSize = 5 * 1024 * 1024; // 5MB
                $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

                if ($file['size'] > $maxFileSize) {
                    sendJson(['success' => false, 'message' => 'Kích thước file quá lớn (tối đa 5MB).'], 400);
                }
                if (!in_array($fileExt, $allowedExt)) {
                    sendJson(['success' => false, 'message' => 'Định dạng file không được hỗ trợ (chỉ chấp nhận jpg, png, gif, webp).'], 400);
                }

                // Tạo tên file mới duy nhất
                $newFileName = 'avatar_' . $studentID . '_' . time() . '.' . $fileExt;
                $destination = $uploadDir . $newFileName;
                $relativePath = 'uploads/avatars/' . $newFileName;

                if (move_uploaded_file($file['tmp_name'], $destination)) {
                    $result = $student->updateAvatar($studentID, $relativePath);
                    if ($result) {
                        sendJson(['success' => true, 'message' => 'Cập nhật ảnh đại diện thành công.', 'newImagePath' => $relativePath]);
                    } else {
                        sendJson(['success' => false, 'message' => 'Lỗi khi cập nhật cơ sở dữ liệu.'], 500);
                    }
                } else {
                    sendJson(['success' => false, 'message' => 'Không thể di chuyển file đã tải lên.'], 500);
                }
                break;

            default: // Thêm default case để xử lý các hành động không xác định
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