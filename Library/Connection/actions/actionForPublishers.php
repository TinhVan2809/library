<?php 
header('Content-Type: application/json');

// Ensure session only started when needed
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Consolidated headers and CORS
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
require_once '../class/classForPublishers.php';


try {
    // Lấy hành động từ request (GET hoặc POST)
    $action = $_REQUEST['action'] ?? null;

    if ($action) {
        $publishersObj = new publishers();

        switch ($action) {

            case 'GetPublishers':
                $publishers = $publishersObj->getPublishers();
                echo json_encode(['success' => true, 'data' => $publishers]);
                exit; // Thêm exit để không chạy xuống case dưới

            // ADD PUBLISHERS
            case 'AddPublishers':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    $PublisherName = $_POST['PublisherName'] ?? null;
                    $Address = $_POST['Address'] ?? null;
                    $Phone = $_POST['Phone'] ?? null;
                    $Email = $_POST['Email'] ?? null;
                    $Website = $_POST['Website'] ?? null;

                    $result = $publishersObj->addPublishers($PublisherName, $Address, $Phone, $Email, $Website);

                    if ($result > 0) {
                        echo json_encode(['success' => true, 'message' => 'Thêm nhà xuất bản thành công!']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Thêm nhà xuất bản thất bại. Vui lòng kiểm tra lại dữ liệu.']);
                    }
                }
                exit;

            // DELETE PUBLISHERS
            case 'DeletePublisher':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    // Lấy ID từ request POST
                    $PublisherID = $_POST['PublisherID'] ?? 0;

                    if ($PublisherID > 0) {
                        $result = $publishersObj->deletePublishers($PublisherID);
                        if ($result > 0) {
                            echo json_encode(['success' => true, 'message' => 'Nhà xuất bản đã được xóa thành công.']);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Xóa nhà xuất bản thất bại.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'ID nhà xuất bản không hợp lệ.']);
                    }
                }
                exit;

            // UPDATE PUBLISHERS
            case 'UpdatePublishers':
                if ($_SERVER['REQUEST_METHOD'] == 'POST') {
                    $id = $_POST['PublisherID'] ?? 0;

                    if ($id > 0) {
                        // Lọc các trường được phép cập nhật để tăng bảo mật
                        $allowed_fields = ['PublisherName', 'Address', 'Phone', 'Email', 'Website'];
                        $updateData = [];
                        foreach ($allowed_fields as $field) {
                            if (isset($_POST[$field])) {
                                $updateData[$field] = $_POST[$field];
                            }
                        }

                        if (!empty($updateData)) {
                            $result = $publishersObj->updatePublishers($id, $updateData);
                            if ($result > 0) {
                                echo json_encode(['success' => true, 'message' => 'Cập nhật nhà xuất bản thành công!']);
                            } else {
                                echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại hoặc không có gì thay đổi.']);
                            }
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Không có dữ liệu để cập nhật.']);
                        }
                    } else {
                        echo json_encode(['success' => false, 'message' => 'ID nhà xuất bản không hợp lệ.']);
                    }
                }
                exit;

            case 'getCountPublishers':
                if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                    echo json_encode(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.']);
                    exit;
                }
                try {
                    $count = $publishersObj->getCountPublishers(); // Giả sử phương thức này tồn tại và trả về số
                    echo json_encode(['success' => true, 'data' => $count]);
                } catch (PDOException $e) {
                    error_log("getCountPublishers error: " . $e->getMessage());
                    echo json_encode(['success' => false, 'message' => 'Lỗi server .']);
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
    error_log("General Error in actionForPublishers.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    // Trả về thông báo lỗi chung cho client
    echo json_encode(['success' => false, 'message' => 'Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.']);
}
?>