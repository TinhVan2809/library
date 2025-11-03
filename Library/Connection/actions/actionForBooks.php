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


require_once '../class/classForBooks.php';

// Check if the user is logged in and is an admin, otherwise redirect
// if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
//     header("Location: ../../login.php");
//     exit();
// }


$books = new books();

// ensure we have a PDO instance in $db
$db = null;
if (method_exists($books, 'getConnection')) {
    $db = $books->getConnection();
}
// fallback if connectDB exposed $conn
if (!$db && isset($conn) && $conn instanceof PDO) {
    $db = $conn;
}
// try to require connectDB as last resort
if (!$db) {
    $maybe = __DIR__ . '/../connectDB.php';
    if (file_exists($maybe)) {
        require_once $maybe;
        if (isset($conn) && $conn instanceof PDO) {
            $db = $conn;
        }
    }
}
if (!$db) {
    sendJson(['success' => false, 'message' => 'Database connection not found.'], 500);
}

// --- Di chuyển helper upload ra ngoài để tái sử dụng ---
$allowedExt = ['jpg','jpeg','png','gif', 'webp', 'jfif'];
$maxFileSize = 5 * 1024 * 1024; // 5MB per file
$uploadDir = __DIR__ . '/../../uploads/series/'; // Thư mục riêng cho ảnh series
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    error_log("Cannot create series upload directory: $uploadDir");
    // Không sendJson ở đây để tránh lỗi khi action khác không cần upload
}

$saveUploadedImage = function(array $file, string $prefix = 'img_') use ($allowedExt, $maxFileSize, $uploadDir) {
    if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) throw new RuntimeException('No uploaded file');
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) throw new RuntimeException('Upload error code: ' . ($file['error'] ?? 'unknown'));
    if (($file['size'] ?? 0) > $maxFileSize) throw new RuntimeException('File too large');
    $imgInfo = @getimagesize($file['tmp_name']);
    if ($imgInfo === false) throw new RuntimeException('Uploaded file is not a valid image');
    $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) throw new RuntimeException('Invalid file extension');
    
    // Đổi tên thư mục trong đường dẫn trả về
    $filename = $prefix . bin2hex(random_bytes(8)) . '.' . $ext;
    $destination = $uploadDir . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new RuntimeException('Failed to move uploaded file');
    }

    return 'uploads/series/' . $filename; // Trả về đường dẫn tương đối
};
// ---------------------------------------------------------

// Determine the action from POST or GET
$action = $_POST['action'] ?? $_GET['action'] ?? null;

switch ($action) {



         case 'getBooks':
            try {
              
                // Lấy các tham số từ query string, với giá trị mặc định
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 36;
                $categoryId = isset($_GET['categoryId']) ? (int)$_GET['categoryId'] : null;
                $searchTerm = isset($_GET['search']) ? $_GET['search'] : null;
                $year = isset($_GET['year']) ? (int)$_GET['year'] : null; // Lấy tham số năm
                if ($searchTerm === '') $searchTerm = null;

                // Gọi hàm getBooks mới với đầy đủ tham số
                $result = $books->getBooks($limit, $page, $categoryId, $searchTerm, $year);

                // Trả về JSON với cấu trúc mới bao gồm cả thông tin phân trang
                // Luôn trả về cấu trúc nhất quán, ngay cả khi không có dữ liệu
                sendJson([
                    'success' => !empty($result['data']),
                    'data' => $result['data'],
                    'total_pages' => $result['total_pages']
                ]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()]);
            }
            exit;

        
            case 'getAllBooks': // Dùng cho slide liên tục
                $data = $books->getAllBooks();
                echo json_encode((['success' => true, 'data' => $data]));
                exit;


        
        case 'getLowStockBooks':
            $data = $books->getLowStockBooks();
            echo json_encode(['success' => true, 'data' => $data]);
            exit;

    case 'getBookById':
            // Accept GET only
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
            }

            $BooksID = filter_input(INPUT_GET, 'BooksID', FILTER_VALIDATE_INT);
            if ($BooksID === false || $BooksID === null || $BooksID <= 0) {
                sendJson(['success' => false, 'message' => 'Book ID không hợp lệ.'], 400);
            }

            try {
                $data = $books->getBookById((int)$BooksID);
                if (empty($data)) {
                    sendJson(['success' => false, 'message' => 'Không tìm thấy sách với ID đã cho.'], 404);
                }
                sendJson(['success' => true, 'data' => $data], 200);
            } catch (Throwable $e) {
                error_log("Error getBookById: " . $e->getMessage());
                sendJson(['success' => false, 'message' => 'Lỗi máy chủ khi truy vấn sách.'], 500);
            }
            break;


 
case 'AddBook':
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJson(['success' => false, 'message' => 'Use POST'], 405);
    }

    try {
        // sanitize inputs
        $ISBN = trim($_POST['ISBN'] ?? '');
        $Title = trim($_POST['Title'] ?? '');
        $AuthorID = filter_var($_POST['AuthorID'] ?? 0, FILTER_VALIDATE_INT) ?: 0;
        $CategoryID = filter_var($_POST['CategoryID'] ?? 0, FILTER_VALIDATE_INT) ?: 0;
        $PublisherID = filter_var($_POST['PublisherID'] ?? 0, FILTER_VALIDATE_INT) ?: 0;
        $PublisherYears = trim($_POST['PublisherYears'] ?? '');
        $Language = trim($_POST['Language'] ?? '');
        $Description = trim($_POST['Description'] ?? '');
        $StockQuantity = filter_var($_POST['StockQuantity'] ?? 0, FILTER_VALIDATE_INT);
        $StockQuantity = ($StockQuantity !== false) ? $StockQuantity : 0;
        $Status = trim($_POST['Status'] ?? 'available');
        $SeriesID = trim($_POST['SeriesID'] ?? '');

        if ($Title === '' || $AuthorID <= 0) {
            sendJson(['success' => false, 'message' => 'Thiếu dữ liệu bắt buộc (Title hoặc AuthorID)'], 400);
        }

        // begin transaction
        $db->beginTransaction();

        // save cover if present
        $coverPath = null;
        if (!empty($_FILES['ImageUrl']['tmp_name'] ?? '')) {
            try {
                $coverPath = $saveUploadedImage($_FILES['ImageUrl'], 'cover_'); // Vẫn dùng thư mục 'books' cho ảnh sách
            } catch (Throwable $ex) {
                error_log("Cover upload failed: " . $ex->getMessage());
                $db->rollBack();
                sendJson(['success' => false, 'message' => 'Không thể lưu ảnh bìa: ' . $ex->getMessage()], 400);
            }
        }

        // insert book (use prepared statement)
        $stmt = $db->prepare("INSERT INTO books (ISBN, Title, AuthorID, CategoryID, PublisherID, PublisherYears, Language, SeriesID, Description, ImageUrl, StockQuantity, Status, BookImportDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([
            $ISBN,
            $Title,
            $AuthorID,
            $CategoryID,
            $PublisherID, 
            $PublisherYears !== '' ? $PublisherYears : null,
            $Language,
            $SeriesID !== '' ? $SeriesID : null,
            $Description,
            $coverPath,
            $StockQuantity, 
            $Status
        ]);

        $booksId = (int)$db->lastInsertId();
        if ($booksId <= 0) {
            $db->rollBack();
            sendJson(['success' => false, 'message' => 'Không lấy được BooksID sau khi thêm'], 500);
        }

        // DEBUG: log received files (optional)
        error_log("DEBUG \$_FILES in AddBook: " . print_r($_FILES, true));

        // handle supplementary images: accept field name 'image_url_sp' or 'image_url_sp[]'
         if (isset($_FILES['image_url_sp'])) {
            $raw = $_FILES['image_url_sp'];
            // normalize to arrays
            $names = (array) ($raw['name'] ?? []);
            $tmpNames = (array) ($raw['tmp_name'] ?? []);
            $errors = (array) ($raw['error'] ?? []);
            $sizes = (array) ($raw['size'] ?? []);

            $insertSuppStmt = $db->prepare("INSERT INTO book_supplementary_images (BooksID, image_url_sp, IsPrimary) VALUES (?, ?, ?)");

            $count = count($names);
            for ($i = 0; $i < $count; $i++) {
                $file = [
                    'name' => $names[$i] ?? '',
                    'tmp_name' => $tmpNames[$i] ?? '',
                    'error' => $errors[$i] ?? UPLOAD_ERR_NO_FILE,
                    'size' => $sizes[$i] ?? 0
                ];

                if ($file['error'] !== UPLOAD_ERR_OK) {
                    error_log("Supp image upload error index $i: " . $file['error']);
                    continue;
                }

                try {
                    $imgPath = $saveUploadedImage($file, 'sp_');
                    $insertSuppStmt->execute([$booksId, $imgPath, 0]);
                } catch (Throwable $ex) {
                    error_log("Failed to save supplementary image index $i: " . $ex->getMessage());
                    // continue next image (do not rollback here)
                }
            }
        }

        $db->commit();
        sendJson(['success' => true, 'message' => 'Thêm sách thành công', 'BooksID' => $booksId], 201);
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        error_log("AddBook error: " . $e->getMessage());
        sendJson(['success' => false, 'message' => 'Lỗi server, Hoặc trùng ISBN'], 500);
    }
    break;

    // delete book by id
  case 'DeleteBookById':
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ'], 405);
    }
    try {
        $BooksID = isset($_POST['BooksID']) ? intval($_POST['BooksID']) : 0;
        if ($BooksID <= 0) {
            sendJson(['success' => false, 'message' => 'ID sách không hợp lệ.'], 400);
        }

        $result = $books->deleteBooks($BooksID); // model method
        if ($result > 0) {
            sendJson(['success' => true, 'message' => 'Sách đã được xóa thành công.']);
        } else {
            // trả thêm debug message nhẹ — kiểm tra logs server
            sendJson(['success' => false, 'message' => 'Xóa sách thất bại. Sách đang được mượn hoặc đang trong tủ sách, cũng có thể do ràng buộc.'], 400);
        }
    } catch (Throwable $e) {
        error_log("DeleteBookById error: " . $e->getMessage());
        if ($db->inTransaction()) $db->rollBack();
        sendJson(['success' => false, 'message' => 'Lỗi máy chủ khi xóa sách.'], 500);
    }
    error_log("DEBUG DeleteBookById \$_POST: " . print_r($_POST, true));
    exit;

    case 'UpdateBook':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Phương thức không hợp lệ.'], 405);
        }

        $bookId = isset($_POST['BooksID']) ? (int)$_POST['BooksID'] : 0;
        if ($bookId <= 0) {
            sendJson(['success' => false, 'message' => 'ID sách không hợp lệ.'], 400);
        }

        // Tái sử dụng logic upload an toàn từ 'AddBook'
        $allowedExt = ['jpg','jpeg','png','gif', 'webp', 'jfif'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB
        $uploadDir = __DIR__ . '/../../uploads/books/';
        $saveUploadedImage = function(array $file, string $prefix = 'img_') use ($allowedExt, $maxFileSize, $uploadDir) {
            if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) throw new RuntimeException('No uploaded file');
            if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) throw new RuntimeException('Upload error code: ' . ($file['error'] ?? 'unknown'));
            if (($file['size'] ?? 0) > $maxFileSize) throw new RuntimeException('File too large');
            $imgInfo = @getimagesize($file['tmp_name']);
            if ($imgInfo === false) throw new RuntimeException('Uploaded file is not a valid image');
            $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt, true)) throw new RuntimeException('Invalid file extension');
            $filename = $prefix . bin2hex(random_bytes(8)) . '.' . $ext;
            $destination = $uploadDir . $filename;
            if (!move_uploaded_file($file['tmp_name'], $destination)) throw new RuntimeException('Failed to move uploaded file');
            return 'uploads/books/' . $filename; // Trả về đường dẫn tương đối
        };

        try {
            $db->beginTransaction();

            // 1. Xử lý các trường văn bản
            $updateData = ['SeriesID' => null]; // Mặc định SeriesID là NULL nếu không được gửi
            $allowedFields = ['ISBN', 'Title', 'AuthorID', 'CategoryID', 'PublisherID', 'PublisherYears', 'Language', 'Description', 'StockQuantity', 'Status'];
            foreach ($allowedFields as $field) {
                if (isset($_POST[$field])) {
                    $updateData[$field] = trim($_POST[$field]);
                }
            }

            if (isset($_POST['SeriesID']) && $_POST['SeriesID'] !== '') {
                $updateData['SeriesID'] = filter_var($_POST['SeriesID'], FILTER_VALIDATE_INT);
            }

            // 2. Xử lý upload ảnh bìa mới
            if (isset($_FILES['ImageUrl']) && $_FILES['ImageUrl']['error'] === UPLOAD_ERR_OK) {
                // Lấy đường dẫn ảnh cũ để xóa
                $oldCoverStmt = $db->prepare("SELECT ImageUrl FROM books WHERE BooksID = ?");
                $oldCoverStmt->execute([$bookId]);
                $oldCoverPath = $oldCoverStmt->fetchColumn();

                // Lưu ảnh mới và thêm vào dữ liệu cập nhật
                $updateData['ImageUrl'] = $saveUploadedImage($_FILES['ImageUrl'], 'cover_');

                // Xóa file ảnh cũ nếu tồn tại
                if ($oldCoverPath && file_exists(__DIR__ . '/../../' . $oldCoverPath)) {
                    @unlink(__DIR__ . '/../../' . $oldCoverPath);
                }
            }

            // 3. Xử lý xóa ảnh phụ
            if (isset($_POST['deleted_images'])) {
                $deletedImages = json_decode($_POST['deleted_images'], true);
                if (is_array($deletedImages) && !empty($deletedImages)) {
                    $deleteSuppStmt = $db->prepare("DELETE FROM book_supplementary_images WHERE BooksID = ? AND image_url_sp = ?");
                    foreach ($deletedImages as $imgUrl) {
                        // Chuyển đổi URL tuyệt đối từ client về đường dẫn tương đối
                        $relativePath = str_replace('http://localhost/Library/', '', $imgUrl);
                        $deleteSuppStmt->execute([$bookId, $relativePath]);
                        // Xóa file vật lý
                        if (file_exists(__DIR__ . '/../../' . $relativePath)) {
                            @unlink(__DIR__ . '/../../' . $relativePath);
                        }
                    }
                }
            }

            // 4. Xử lý thêm ảnh phụ mới
            if (isset($_FILES['image_url_sp'])) {
                $raw = $_FILES['image_url_sp'];
                $names = (array) ($raw['name'] ?? []);
                $tmpNames = (array) ($raw['tmp_name'] ?? []);
                $errors = (array) ($raw['error'] ?? []);
                $sizes = (array) ($raw['size'] ?? []);
                $insertSuppStmt = $db->prepare("INSERT INTO book_supplementary_images (BooksID, image_url_sp, IsPrimary) VALUES (?, ?, ?)");
                for ($i = 0; $i < count($names); $i++) {
                    $file = ['name' => $names[$i] ?? '', 'tmp_name' => $tmpNames[$i] ?? '', 'error' => $errors[$i] ?? UPLOAD_ERR_NO_FILE, 'size' => $sizes[$i] ?? 0];
                    if ($file['error'] !== UPLOAD_ERR_OK) continue;
                    try {
                        $imgPath = $saveUploadedImage($file, 'sp_');
                        $insertSuppStmt->execute([$bookId, $imgPath, 0]);
                    } catch (Throwable $ex) {
                        error_log("Failed to save supplementary image on update: " . $ex->getMessage());
                    }
                }
            }

            // 5. Thực hiện cập nhật vào DB (nếu có gì để cập nhật)
            $updatedRows = 0;
            if (!empty($updateData)) {
                $updatedRows = $books->updateBooks($bookId, $updateData);
            }

            // 6. Lấy lại dữ liệu sách đã cập nhật để trả về cho frontend
            $updatedBookData = $books->getBookById($bookId);

            $db->commit();

            // Luôn trả về success nếu không có lỗi, ngay cả khi không có dòng nào được cập nhật
            sendJson(['success' => true, 'message' => 'Cập nhật sách thành công.', 'data' => $updatedBookData]);

        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            error_log("UpdateBook error: " . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi server khi cập nhật sách: ' . $e->getMessage()], 500);
        }
        break;

     case 'addSeries':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $seriesName = trim($_POST['SeriesName'] ?? '');

        if (empty($seriesName)) {
            sendJson(['success' => false, 'message' => 'Tên bộ sách không được để trống.'], 400);
        }

        $imageBackgroundPath = null;
        // Frontend đang gửi file với key 'SeriesCoverImage'
        if (isset($_FILES['SeriesCoverImage']) && $_FILES['SeriesCoverImage']['error'] === UPLOAD_ERR_OK) {
            try {
                // Sử dụng helper đã được chuyển ra ngoài
                $imageBackgroundPath = $saveUploadedImage($_FILES['SeriesCoverImage'], 'series_bg_');
            } catch (Throwable $ex) {
                error_log("Series background image upload failed: " . $ex->getMessage());
                sendJson(['success' => false, 'message' => 'Không thể lưu ảnh nền: ' . $ex->getMessage()], 400);
            }
        }

        try {
            $stmt = $db->prepare("INSERT INTO Book_Series (SeriesName, Image_background) VALUES (?, ?)");
            $stmt->execute([$seriesName, $imageBackgroundPath]);
            $seriesId = $db->lastInsertId();

            if ($seriesId > 0) {
                // Lấy lại dữ liệu vừa thêm để trả về
                $newSeries = ['SeriesID' => $seriesId, 'SeriesName' => $seriesName, 'Image_background' => $imageBackgroundPath];
                sendJson(['success' => true, 'message' => 'Thêm bộ sách thành công.', 'data' => $newSeries], 201);
            } else {
                sendJson(['success' => false, 'message' => 'Thêm bộ sách thất bại.'], 500);
            }
        } catch (Throwable $e) {
            error_log("addSeries error: " . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi server khi thêm bộ sách. Tên bộ sách có thể đã tồn tại.'], 500);
        }
        break;

    case 'updateSeries':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $seriesId = filter_input(INPUT_POST, 'SeriesID', FILTER_VALIDATE_INT);
        if (!$seriesId || $seriesId <= 0) {
            sendJson(['success' => false, 'message' => 'Series ID không hợp lệ.'], 400);
        }

        $seriesName = trim($_POST['SeriesName'] ?? '');
        $newImageFile = $_FILES['SeriesCoverImage'] ?? null;

        if (empty($seriesName) && (empty($newImageFile) || $newImageFile['error'] !== UPLOAD_ERR_OK)) {
            sendJson(['success' => false, 'message' => 'Không có dữ liệu để cập nhật.'], 400);
        }

        try {
            $db->beginTransaction();

            $updateFields = [];
            $params = [];

            $stmt = $db->prepare("SELECT Image_background FROM Book_Series WHERE SeriesID = ?");
            $stmt->execute([$seriesId]);
            $oldImagePath = $stmt->fetchColumn();

            if (!empty($seriesName)) {
                $updateFields[] = "SeriesName = ?";
                $params[] = $seriesName;
            }

            if (isset($newImageFile) && $newImageFile['error'] === UPLOAD_ERR_OK) {
                $newImagePath = $saveUploadedImage($newImageFile, 'series_bg_');
                $updateFields[] = "Image_background = ?";
                $params[] = $newImagePath;

                // Xóa ảnh cũ nếu có
                if ($oldImagePath && file_exists(__DIR__ . '/../../' . $oldImagePath)) {
                    @unlink(__DIR__ . '/../../' . $oldImagePath);
                }
            }

            $params[] = $seriesId;
            $sql = "UPDATE Book_Series SET " . implode(', ', $updateFields) . " WHERE SeriesID = ?";
            $updateStmt = $db->prepare($sql);
            $updateStmt->execute($params);

            $db->commit();
            sendJson(['success' => true, 'message' => 'Cập nhật bộ sách thành công.'], 200);
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            error_log("updateSeries error: " . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi server khi cập nhật bộ sách.'], 500);
        }
        break;

    case 'deleteSeries':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức POST.'], 405);
        }

        $seriesId = filter_input(INPUT_POST, 'SeriesID', FILTER_VALIDATE_INT);
        if (!$seriesId || $seriesId <= 0) {
            sendJson(['success' => false, 'message' => 'Series ID không hợp lệ.'], 400);
        }

        try {
            $db->beginTransaction();

            // 1. Gán SeriesID của các sách thuộc bộ này về NULL
            $updateStmt = $db->prepare("UPDATE books SET SeriesID = NULL WHERE SeriesID = ?");
            $updateStmt->execute([$seriesId]);

            // 2. Xóa bộ sách khỏi bảng Book_Series
            $deleteStmt = $db->prepare("DELETE FROM Book_Series WHERE SeriesID = ?");
            $deleteStmt->execute([$seriesId]);
            $deletedRows = $deleteStmt->rowCount();

            $db->commit();

            if ($deletedRows > 0) {
                sendJson(['success' => true, 'message' => 'Xóa bộ sách thành công.'], 200);
            } else {
                sendJson(['success' => false, 'message' => 'Không tìm thấy bộ sách để xóa.'], 404);
            }
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            error_log("deleteSeries error: " . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi server khi xóa bộ sách.'], 500);
        }
        break;

    case 'getAllSeries':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
        }
        try {
            $stmt = $db->query("SELECT SeriesID, SeriesName, Image_background FROM Book_Series ORDER BY SeriesID ASC");
            $series = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($series) {
                sendJson(['success' => true, 'data' => $series], 200);
            } else {
                sendJson(['success' => true, 'data' => [], 'message' => 'Không tìm thấy bộ sách nào.'], 200);
            }
        } catch (Throwable $e) {
            error_log("getAllSeries error: " . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi server khi lấy danh sách bộ sách.'], 500);
        }
        break;

    case 'getSeriesWithBooks':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
        }
        try {
            // 1. Lấy tất cả các bộ sách, bao gồm cả ảnh nền
            $seriesStmt = $db->query("SELECT SeriesID, SeriesName, Image_background FROM Book_Series ORDER BY SeriesName ASC");
            $allSeries = $seriesStmt->fetchAll(PDO::FETCH_ASSOC);

            $resultData = [];

            // 2. Với mỗi bộ, lấy danh sách sách thuộc về nó
            $booksStmt = $db->prepare("SELECT BooksID, Title, ImageUrl FROM books WHERE SeriesID = ? ORDER BY Title ASC");

            foreach ($allSeries as $series) {
                $booksStmt->execute([$series['SeriesID']]);
                $booksInSeries = $booksStmt->fetchAll(PDO::FETCH_ASSOC);

                // Chỉ thêm bộ sách vào kết quả nếu nó có sách
                if (!empty($booksInSeries)) {
                    $series['books'] = $booksInSeries;
                    $resultData[] = $series;
                }
            }
            sendJson(['success' => true, 'data' => $resultData], 200);
        } catch (Throwable $e) {
            error_log("getSeriesWithBooks error: " . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi server khi lấy danh sách bộ sách.'], 500);
        }
        break;

        // Hiển thị các cuốn sách cùng bộ (KHông phải lấy Series)
        // Những cuốn sách có value SeriesID giống nhau sẽ được lấy
        case 'getBooksBySeriesId': // Đổi tên cho rõ ràng hơn
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
            }

            $seriesId = filter_input(INPUT_GET, 'SeriesID', FILTER_VALIDATE_INT);
            $currentBookID = filter_input(INPUT_GET, 'currentBookID', FILTER_VALIDATE_INT);

            if (!$seriesId || $seriesId <= 0) {
                sendJson(['success' => false, 'message' => 'SeriesID không hợp lệ.'], 400);
            }

            try {
                $sql = "SELECT BooksID, Title, ImageUrl FROM books WHERE SeriesID = ? AND BooksID != ?";
                $stmt = $db->prepare($sql);
                $stmt->execute([$seriesId, $currentBookID]);
                $seriesBooks = $stmt->fetchAll(PDO::FETCH_OBJ);
                sendJson(['success' => true, 'data' => $seriesBooks], 200);
            } catch (Throwable $e) {
                error_log("getBooksBySeriesId error: " . $e->getMessage());
                sendJson(['success' => false, 'message' => 'Lỗi server khi lấy danh sách sách cùng bộ.'], 500);
            }
            break;

    case 'getCountSeries':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
        }
        try {
                $sql = "SELECT COUNT(SeriesID) FROM Book_Series";
                $stmt = $db->prepare($sql);
                $stmt->execute();
                $count = $stmt->fetchColumn();
                sendJson(['success' => true, 'data' => (int)$count]);
        } catch (PDOException $e) {
                error_log("getCountSeries error: " . $e->getMessage());
                sendJson(['success' => false, 'message' => 'Lỗi server .'], 500);
            }
            break;

                // Lấy limit 

         case 'getBooksLimit':
    // 1. Lấy tham số phân trang từ GET, có giá trị mặc định an toàn
    $page = isset($_GET['page']) ? filter_var($_GET['page'], FILTER_VALIDATE_INT, ["options" => ["default" => 1, "min_range" => 1]]) : 1;
    $limit = isset($_GET['limit']) ? filter_var($_GET['limit'], FILTER_VALIDATE_INT, ["options" => ["default" => 8, "min_range" => 1]]) : 8;
 $categoryId = filter_input(INPUT_GET, 'categoryId', FILTER_VALIDATE_INT, ['options' => ['default' => null]]);
        $searchTerm = isset($_GET['search']) ? trim($_GET['search']) : null;
    // 2. Tính toán OFFSET cho câu lệnh SQL
    $offset = ($page - 1) * $limit;

    try {
        // 3. Lấy tổng số sách để tính toán total_pages
        $totalBooks = $books->getTotalBooksCount(); // <-- Bạn sẽ cần thêm phương thức này
        $totalPages = ceil($totalBooks / $limit);

        // 4. Lấy dữ liệu sách cho trang hiện tại
        $data = $books->getBooksLimit($limit, $offset); // <-- Sửa phương thức này để nhận limit và offset

        // 5. Trả về dữ liệu JSON bao gồm cả thông tin phân trang
        echo json_encode([
            'success' => true,
            'data' => $data,
            'total_pages' => $totalPages,
            'current_page' => $page
        ]);

    } catch (Exception $e) {
        // Xử lý lỗi nếu có
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Lỗi server: ' . $e->getMessage()]);
    }


    case 'getCountBooks' :
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            sendJson(['success' => false, 'message' => 'Chỉ chấp nhận phương thức GET.'], 405);
        }
        try {
            $count = $books->getCountBooks(); // Giả sử phương thức này trả về một số
            sendJson(['success' => true, 'data' => $count]);
        } catch (PDOException $e) {
            error_log("getCountBooks error: " . $e->getMessage());
            sendJson(['success' => false, 'message' => 'Lỗi server .'], 500);
        }
        break;

                

    default:
        $_SESSION['error_message'] = "Invalid action specified.";
        header("Location: ../../Manager/admin.html"); // Redirect to a default safe page
        exit();
}
?>
