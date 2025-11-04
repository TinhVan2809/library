<?php
require_once __DIR__ . '/../connectDB.php';

class books extends Data {
 
    public function getConnection() {
       return $this->conn;
    }

    // GET BOOKS
    /**
     * Lấy danh sách sách đã được phân trang, có thể lọc và tìm kiếm.
     * @param int $limit Số lượng sách mỗi trang.
     * @param int $page Trang hiện tại.
     * @param int|null $categoryId ID của thể loại để lọc.
     * @param string|null $searchTerm Từ khóa tìm kiếm.
     * @return array Mảng chứa dữ liệu sách và thông tin phân trang.
     */
    public function getBooks($limit, $page, $categoryId = null, $searchTerm = null, $year = null) {
        try {
            $limit = (int)$limit;
            $page = max(1, (int)$page);
            $offset = ($page - 1) * $limit;

            // Normalize searchTerm
            $searchTerm = is_null($searchTerm) ? null : trim($searchTerm);
            if ($searchTerm === '') $searchTerm = null;

            // Truyền tham số year vào hàm đếm
            $totalBooks = $this->getTotalBooksCount($categoryId, $searchTerm, $year);
            $totalPages = $limit > 0 ? (int) ceil($totalBooks / $limit) : 0;

            $sql = "SELECT b.BooksID, b.ISBN, b.Title, b.PublisherYears, b.Language, b.Description, b.ImageUrl, b.BookImportDate, b.StockQuantity, b.Status,
                           a.AuthorID, a.AuthorName, c.CategoryID, c.CategoryName, p.PublisherID, p.PublisherName
                    FROM books b
                    LEFT JOIN authors a ON b.AuthorID = a.AuthorID
                    LEFT JOIN categories c ON b.CategoryID = c.CategoryID
                    LEFT JOIN publishers p ON b.PublisherID = p.PublisherID";

            $where = [];
            $params = [];

            if (!is_null($categoryId)) {
                $where[] = "b.CategoryID = :categoryId";
                $params['categoryId'] = (int)$categoryId;
            }

            if (!is_null($searchTerm)) {
                // use two distinct placeholders to avoid driver issues with repeated named params
                $where[] = "(b.Title LIKE :searchTerm1 OR a.AuthorName LIKE :searchTerm2)";
                $params['searchTerm1'] = '%' . $searchTerm . '%';
                $params['searchTerm2'] = '%' . $searchTerm . '%';
            }

            if (!is_null($year)) {
                $where[] = "YEAR(b.PublisherYears) = :year";
                $params['year'] = (int)$year;
            }

            if (!empty($where)) {
                $sql .= " WHERE " . implode(" AND ", $where);
            }

            $sql .= " ORDER BY b.BookImportDate DESC LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($sql);

            if (!is_null($categoryId)) {
                $stmt->bindValue(':categoryId', $categoryId, PDO::PARAM_INT);
            }
            if (!is_null($searchTerm)) {
                $stmt->bindValue(':searchTerm1', $params['searchTerm1'], PDO::PARAM_STR);
                $stmt->bindValue(':searchTerm2', $params['searchTerm2'], PDO::PARAM_STR);
            }
            if (!is_null($year)) {
                $stmt->bindValue(':year', $year, PDO::PARAM_INT);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

            $stmt->execute();
            $books = $stmt->fetchAll(PDO::FETCH_OBJ);

            return [
                'data' => $books,
                'total_pages' => $totalPages,
                'current_page' => $page
            ];
        } catch (PDOException $e) {
            error_log("Error Get Books with pagination: " . $e->getMessage());
            return ['data' => [], 'total_pages' => 0, 'current_page' => $page];
        }
    }

/**
 * Thêm một cuốn sách mới vào cơ sở dữ liệu.
 *
 * @param string $isbn Mã ISBN của sách.
 * @param string $title Tựa đề sách.
 * @param int $authorId ID của tác giả.
 * @param int $categoryId ID của thể loại.
 * @param int $publisherId ID của nhà xuất bản.
 * @param string|null $publisherYears Năm xuất bản.
 * @param string $language Ngôn ngữ.
 * @param string $description Mô tả.
 * @param string $imageUrl URL hình ảnh.
 * @param int $stockQuantity Số lượng tồn kho.
 * @param string $status Trạng thái sách ('available' hoặc 'unavailable').
 * @return bool Trả về true nếu thêm thành công, false nếu thất bại.
 */
public function addBooks($isbn, $title, $authorId, $categoryId, $publisherId, $publisherYears, $seriesId, $language, $description, $imageUrl, $stockQuantity, $status) {
    // 1. Ép kiểu và xác thực dữ liệu đầu vào ngay từ đầu
    $authorId = (int)$authorId;
    $categoryId = (int)$categoryId;
    $publisherId = (int)$publisherId;
    $stockQuantity = (int)$stockQuantity;
    $seriesId = (int)$seriesId; 

    // 2. Kiểm tra các trường bắt buộc một cách chặt chẽ hơn
    if (empty($isbn) || empty($title) || $authorId <= 0 || $categoryId <= 0 || $publisherId <= 0 || $stockQuantity < 0) {
        // Ghi log lỗi nếu cần để debug
        error_log("addBooks: Thiếu thông tin bắt buộc hoặc ID không hợp lệ.");
        return false;
    }

    // 3. Chuẩn bị câu lệnh SQL với đầy đủ các cột
    $sql = "INSERT INTO books (ISBN, Title, AuthorID, CategoryID, PublisherID, PublisherYears, `Language`, SeriesID, Description, ImageUrl, BookImportDate, StockQuantity, `Status`)
            VALUES (:isbn, :title, :authorId, :categoryId, :publisherId, :publisherYears, :language, :seriesId, :description, :imageUrl, NOW(), :stockQuantity, :status)";

    try {
        $stmt = $this->conn->prepare($sql);

        // 4. Bind các tham số để tăng cường bảo mật (chống SQL Injection)
        $stmt->bindParam(':isbn', $isbn);
        $stmt->bindParam(':seriesID', $seriesId );
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':authorId', $authorId, PDO::PARAM_INT);
        $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
        $stmt->bindParam(':publisherId', $publisherId, PDO::PARAM_INT);
        
        // Xử lý giá trị NULL cho năm xuất bản
        $stmt->bindParam(':publisherYears', $publisherYears, is_null($publisherYears) ? PDO::PARAM_NULL : PDO::PARAM_STR);
        
        $stmt->bindParam(':language', $language);
        $stmt->bindParam(':seriesID', $seriesId);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':imageUrl', $imageUrl);
        $stmt->bindParam(':stockQuantity', $stockQuantity, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);

        // 5. Thực thi và trả về kết quả boolean
        return $stmt->execute();

    } catch (PDOException $e) {
        // Ghi log lỗi rõ ràng hơn
        error_log("Lỗi khi thêm sách (addBooks): " . $e->getMessage());
        // Trả về false khi có lỗi
        return false;
    }
}


    // DELETE BOOKS
    public function deleteBooks(int $BooksID): int {
    try {
        $this->conn->beginTransaction();

        // 1) Lấy đường dẫn ảnh phụ để xóa file (nếu lưu file trên đĩa)
        $stmt = $this->conn->prepare("SELECT image_url_sp FROM book_supplementary_images WHERE BooksID = ?");
        $stmt->execute([$BooksID]);
        $suppImgs = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // xóa file ảnh phụ (tuỳ chọn)
        foreach ($suppImgs as $p) {
            if ($p && file_exists(__DIR__ . '/../../' . $p)) {
                @unlink(__DIR__ . '/../../' . $p);
            }
        }

        // 2) Xóa các bản ghi ảnh phụ
        $stmt = $this->conn->prepare("DELETE FROM book_supplementary_images WHERE BooksID = ?");
        $stmt->execute([$BooksID]);

        // 3) Lấy đường dẫn ảnh bìa để xóa file (nếu cần)
        $stmt = $this->conn->prepare("SELECT ImageUrl FROM books WHERE BooksID = ? LIMIT 1");
        $stmt->execute([$BooksID]);
        $cover = $stmt->fetchColumn();
        if ($cover && file_exists(__DIR__ . '/../../' . $cover)) {
            @unlink(__DIR__ . '/../../' . $cover);
        }

        // 4) Xóa bản ghi sách
        $stmt = $this->conn->prepare("DELETE FROM books WHERE BooksID = ?");
        $stmt->execute([$BooksID]);
        $deleted = $stmt->rowCount();

        $this->conn->commit();
        return (int)$deleted;
    } catch (PDOException $e) {
        if ($this->conn->inTransaction()) $this->conn->rollBack();
        error_log("deleteBooks error: " . $e->getMessage());
        return 0;
    }
}

    // UPDATE BOOOKS
    public function updateBooks(int $BooksID, array $data): int {
        // Validate
        if ($BooksID <= 0) {
            return 0;
        }
        if (empty($data) || !is_array($data)) {
            return 0;
        }

        // Các trường được cho phép cập nhật (phù hợp với cấu trúc bảng)
        $allowed = [
            'ISBN', 'Title', 'AuthorID', 'CategoryID', 'PublisherID',
            'PublisherYears', 'Language', 'Description', 'ImageUrl', 'StockQuantity', 'Status',
            'SeriesID' // Thêm SeriesID vào danh sách cho phép
        ];

        $setParts = []; 
        $params = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "$field = ?";
                $value = $data[$field];
                // Ép kiểu cho các trường ID / số nếu cần
                if (in_array($field, ['AuthorID', 'CategoryID', 'PublisherID', 'StockQuantity', 'SeriesID'])) {
                    $value = (int) $value;
                    if ($value === 0) { // Nếu giá trị là 0 (ví dụ: dropdown rỗng), chuyển thành null
                        $value = null;
                    }
                }
                $params[] = $value;
            }
        }

        if (empty($setParts)) {
            // Không có trường hợp lệ để cập nhật
            return 0;
        }

        // Thêm điều kiện WHERE
        $params[] = $BooksID;

        try {
            $sql = "UPDATE books SET " . implode(', ', $setParts) . " WHERE BooksID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Update Books: " . $e->getMessage());
            return 0;
        }
    }

    // get book by id
   // get book by id
public function getBookById(int $BooksID) {

    if ($BooksID <= 0) return null;

    try {
        $sql = "SELECT
                    b.BooksID, b.ISBN, b.Title, b.PublisherYears, b.Language, 
                    b.Description, b.ImageUrl, b.BookImportDate, b.StockQuantity, b.Status, b.SeriesID,
                    a.AuthorID, a.AuthorName, c.CategoryID, c.CategoryName, p.PublisherName,
                    bs.SeriesName,
                    -- Tính toán điểm trung bình và số lượt đánh giá
                    AVG(br.Rating) as avg_rating, 
                    COUNT(br.ReviewID) as review_count
                FROM books b
                INNER JOIN authors a ON b.AuthorID = a.AuthorID
                INNER JOIN categories c ON b.CategoryID = c.CategoryID
                INNER JOIN publishers p ON b.PublisherID = p.PublisherID
                -- Dùng LEFT JOIN để vẫn lấy được sách dù chưa có review nào
                LEFT JOIN book_review br ON b.BooksID = br.BooksID
                -- Thêm LEFT JOIN để lấy thông tin bộ sách
                LEFT JOIN Book_Series bs ON b.SeriesID = bs.SeriesID
                WHERE b.BooksID = ?
                -- Cần GROUP BY để các hàm tổng hợp (AVG, COUNT) hoạt động đúng
                GROUP BY b.BooksID";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$BooksID]);
        $row = $stmt->fetch(PDO::FETCH_OBJ);

        if ($row) {
            // Lấy ảnh phụ từ bảng book_supplementary_images
            $stmt2 = $this->conn->prepare("SELECT image_url_sp FROM book_supplementary_images WHERE BooksID = ?");
            $stmt2->execute([$BooksID]);
            $images = $stmt2->fetchAll(PDO::FETCH_COLUMN);
            $row->supplementaryImages = $images ?: []; // mảng url (relative hoặc absolute)
        }

        return $row ?: null;

    } catch (PDOException $e) {
        error_log("Error get book by id " . $e->getMessage());
        return null;
    }
}




/**
 * Lấy tổng số sách, có thể lọc theo thể loại và từ khóa tìm kiếm.
 * @param int|null $categoryId ID của thể loại để lọc.
 * @param string|null $searchTerm Từ khóa tìm kiếm.
 * @return int Tổng số sách.
 */
public function getTotalBooksCount($categoryId = null, $searchTerm = null, $year = null) {
    $sql = "SELECT COUNT(b.BooksID) as total 
            FROM books b
            LEFT JOIN authors a ON b.AuthorID = a.AuthorID";
    
    $conditions = [];
    $params = [];

    if ($categoryId !== null) {
        $conditions[] = "b.CategoryID = :categoryId";
        $params['categoryId'] = (int)$categoryId;
    }

    if ($searchTerm !== null && $searchTerm !== '') {
        // distinct placeholders to avoid driver limitations
        $conditions[] = "(b.Title LIKE :searchTerm1 OR a.AuthorName LIKE :searchTerm2)";
        $params['searchTerm1'] = '%' . $searchTerm . '%';
        $params['searchTerm2'] = '%' . $searchTerm . '%';
    }

    if ($year !== null) {
        $conditions[] = "YEAR(b.PublisherYears) = :year";
        $params['year'] = (int)$year;
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    try {
        $stmt = $this->conn->prepare($sql);
        // bind params if present
        foreach ($params as $key => $val) {
            if ($key === 'categoryId' || $key === 'year') {
                $stmt->bindValue(':' . $key, (int)$val, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(':' . $key, $val, PDO::PARAM_STR);
            }
        }
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$result['total'];
    } catch (PDOException $e) {
        error_log("Lỗi khi đếm sách: " . $e->getMessage());
        return 0;
    }
}
 
public function getBooksLimit($limit, $offset, $categoryId = null, $searchTerm = null) {
    $sql = "SELECT 
                b.*, 
                a.AuthorName, 
                c.CategoryName, 
                p.PublisherName 
            FROM books b
            LEFT JOIN authors a ON b.AuthorID = a.AuthorID
            LEFT JOIN categories c ON b.CategoryID = c.CategoryID
            LEFT JOIN publishers p ON b.PublisherID = p.PublisherID";

    $conditions = [];
    $params = [];

    if ($categoryId !== null) {
        $conditions[] = "b.CategoryID = :categoryId";
        $params['categoryId'] = (int)$categoryId;
    }

    if ($searchTerm !== null && $searchTerm !== '') {
        $conditions[] = "(b.Title LIKE :searchTerm1 OR a.AuthorName LIKE :searchTerm2)";
        $params['searchTerm1'] = '%' . $searchTerm . '%';
        $params['searchTerm2'] = '%' . $searchTerm . '%';
    }

    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    $sql .= " ORDER BY b.BookImportDate DESC LIMIT :limit OFFSET :offset";

    try {
        $stmt = $this->conn->prepare($sql);

        foreach ($params as $key => $val) {
            if ($key === 'categoryId') {
                $stmt->bindValue(':' . $key, (int)$val, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(':' . $key, $val, PDO::PARAM_STR);
            }
        }

        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Lỗi khi lấy danh sách sách phân trang: " . $e->getMessage());
        return [];
    }
}

    /**
     * Lấy danh sách các sách sắp hết hàng (còn hàng nhưng số lượng ít).
     * @param int $threshold Ngưỡng số lượng tồn kho để xem là sắp hết.
     * @param int $limit Số lượng sách tối đa cần lấy.
     * @return array Mảng các đối tượng sách.
     */
    public function getLowStockBooks(int $threshold = 10, int $limit = 12): array
    {
        try {
            // Chỉ chọn các cột cần thiết và thêm điều kiện StockQuantity > 0
            $sql = "SELECT b.BooksID, b.Title, b.ImageUrl, b.StockQuantity, b.Description, b.PublisherYears, a.AuthorName, c.CategoryName 
                    FROM (( books b 
                    INNER JOIN authors a ON b.AuthorID = a.AuthorID)
                    INNER JOIN categories c ON b.CategoryID = c.CategoryID)
                    WHERE StockQuantity > 0 AND StockQuantity <= :threshold
                    ORDER BY StockQuantity ASC, Title ASC 
                    LIMIT :limit";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':threshold', $threshold, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Get Low Stock Books: " . $e->getMessage());
            return []; // Trả về mảng rỗng khi có lỗi để nhất quán
        }
    }

    // get all book dùng cho silde liên tục 
    public function getAllBooks() {
        try{
            $getAll = $this->conn->prepare("SELECT b.BooksID, b.ImageUrl, p.PublisherID, b.PublisherYears
                                            FROM books b 
                                            JOIN publishers p ON p.PublisherID = b.PublisherID");
            $getAll->execute();
            return $getAll->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("Error get All Books " . $e->getMessage());
            return [];
        }
    }

    // Lấy danh theo series
        public function getCountBooks(): int {
            try{
            $sql = "SELECT COUNT(BooksID) FROM books";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            return (int) $stmt->fetchColumn();
            } catch(PDOException $e) {
                error_log("Error get count books " . $e->getMessage());
                return 0;
            }
        }
    
            public function getBooksBySeriesId(int $seriesId, int $currentBookID): array
            {
                if ($seriesId <= 0) {
                    return [];
                }
                try {
                    $sql = "SELECT BooksID, Title, ImageUrl FROM books WHERE SeriesID = ?";
                    $stmt = $this->conn->prepare($sql);
                    $stmt->execute([$seriesId]);
                    return $stmt->fetchAll(PDO::FETCH_OBJ);
                } catch (PDOException $e) {
                    error_log("Error getting books by series ID: " . $e->getMessage());
                    return [];
                }
            }  
        
        
        }

?>