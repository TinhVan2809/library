<?php
// Đặt chế độ hiển thị lỗi để dễ dàng gỡ lỗi
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Đặt header để trình duyệt hiển thị văn bản thuần, dễ đọc
header('Content-Type: text/plain; charset=utf-8');

echo "=============================================\n";
echo "BẮT ĐẦU SCRIPT SỬA ĐƯỜNG DẪN ẢNH\n";
echo "=============================================\n\n";

try {
    // 1. KẾT NỐI ĐẾN CƠ SỞ DỮ LIỆU
    // Script này giả định nó nằm trong thư mục gốc của 'Library'
    // và file connectDB.php nằm trong 'Library/Connection/'
    require_once __DIR__ . '/Connection/connectDB.php';

    // Khởi tạo đối tượng Data để có kết nối
    $dbInstance = new Data();
    $conn = $dbInstance->conn;
    if (!$conn instanceof PDO) {
        throw new RuntimeException("Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra file connectDB.php.");
    }

    // Bắt đầu một transaction để đảm bảo an toàn dữ liệu
    $conn->beginTransaction();
    
    $totalFixed = 0;

    // =================================================================
    // 2. SỬA LỖI TRONG BẢNG `books` (ẢNH BÌA)
    // =================================================================
    echo "--- Đang kiểm tra bảng 'books' ---\n";
    
    // Tìm các sách có đường dẫn ảnh sai (ví dụ: 'uploads/cover_...')
    $stmtBooks = $conn->prepare(
        "SELECT BooksID, ImageUrl FROM books WHERE ImageUrl LIKE 'uploads/%' AND ImageUrl NOT LIKE 'uploads/books/%'"
    );
    $stmtBooks->execute();
    $booksToFix = $stmtBooks->fetchAll(PDO::FETCH_ASSOC);

    if (count($booksToFix) > 0) {
        echo "Tìm thấy " . count($booksToFix) . " ảnh bìa cần sửa.\n";
        $updateStmtBooks = $conn->prepare("UPDATE books SET ImageUrl = ? WHERE BooksID = ?");

        foreach ($booksToFix as $book) {
            // Tạo đường dẫn mới bằng cách thay thế 'uploads/' bằng 'uploads/books/'
            $newUrl = preg_replace('/^uploads\//', 'uploads/books/', $book['ImageUrl']);
            
            echo "  - Sửa sách ID {$book['BooksID']}: '{$book['ImageUrl']}' -> '{$newUrl}'\n";
            
            // Thực thi cập nhật
            $updateStmtBooks->execute([$newUrl, $book['BooksID']]);
            $totalFixed++;
        }
    } else {
        echo "Không tìm thấy ảnh bìa nào cần sửa trong bảng 'books'.\n";
    }
    echo "\n";


    // =================================================================
    // 3. SỬA LỖI TRONG BẢNG `book_supplementary_images` (ẢNH PHỤ)
    // =================================================================
    echo "--- Đang kiểm tra bảng 'book_supplementary_images' ---\n";

    // Tìm các ảnh phụ có đường dẫn sai
    $stmtSupp = $conn->prepare(
        "SELECT image_url_sp FROM book_supplementary_images WHERE image_url_sp LIKE 'uploads/%' AND image_url_sp NOT LIKE 'uploads/books/%'"
    );
    $stmtSupp->execute();
    $suppImagesToFix = $stmtSupp->fetchAll(PDO::FETCH_COLUMN, 0); // Lấy tất cả giá trị của cột đầu tiên

    if (count($suppImagesToFix) > 0) {
        echo "Tìm thấy " . count($suppImagesToFix) . " ảnh phụ cần sửa.\n";
        $updateStmtSupp = $conn->prepare("UPDATE book_supplementary_images SET image_url_sp = ? WHERE image_url_sp = ?");

        foreach ($suppImagesToFix as $oldUrl) {
            $newUrl = preg_replace('/^uploads\//', 'uploads/books/', $oldUrl);

            echo "  - Sửa ảnh phụ: '{$oldUrl}' -> '{$newUrl}'\n";
            
            // Cập nhật dòng có đường dẫn cũ ($oldUrl) thành đường dẫn mới ($newUrl)
            $updateStmtSupp->execute([$newUrl, $oldUrl]);
            $totalFixed++;
        }
    } else {
        echo "Không tìm thấy ảnh phụ nào cần sửa trong bảng 'book_supplementary_images'.\n";
    }
    echo "\n";

    // Nếu mọi thứ thành công, commit transaction
    $conn->commit();

    echo "=============================================\n";
    echo "HOÀN TẤT! Đã sửa thành công tổng cộng {$totalFixed} đường dẫn.\n";
    echo "=============================================\n";

} catch (Exception $e) {
    // Nếu có lỗi, rollback tất cả các thay đổi
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
        echo "\n!!! ĐÃ CÓ LỖI XẢY RA. TẤT CẢ THAY ĐỔI ĐÃ ĐƯỢC HOÀN TÁC. !!!\n";
    }
    // In ra thông báo lỗi chi tiết
    echo "LỖI: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    // Đặt mã trạng thái HTTP 500 để báo hiệu lỗi server
    http_response_code(500);
}

?>
