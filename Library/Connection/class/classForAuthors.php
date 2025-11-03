<?php 
require_once __DIR__ . '/../connectDB.php';


class authors extends Data {
 
    public function getConnection() {
       return $this->conn;
    }

    // GET AUTHORS
    public function getAuthors() {
        try{
            $sql = "SELECT * FROM authors ORDER BY AuthorName ASC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("Error Get Authors" . $e->getMessage());
            return 0;
        }
    }

    // ADD AUTHORS
    public function addAuthors($AuthorName, $BirthYear, $Country, $Description) {
        // Sử dụng trim để loại bỏ khoảng trắng và kiểm tra xem AuthorName có rỗng không.
        if(empty(trim($AuthorName))){
            return 0; // Trả về 0 nếu tên tác giả rỗng.
        }
        try{
            $sql = "INSERT INTO authors (AuthorName, BirthYear, Country, Description)
                    VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$AuthorName, $BirthYear, $Country, $Description]);
            return $stmt->rowCount();
        } catch(PDOException $e) {
            error_log("Error Add Authors" . $e->getMessage());
            return 0;
        }
    }

    // UPDATE AUTHORS
    public function updateAuthors($AuthorName, $BirthYear, $Country, $Description){

        try{
            $sql = "UPDATE authors SET AuthorName = ?, BirthYear = ?, Country = ?, Description = ? WHERE AuthorsID = ?  ";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$AuthorName, $BirthYear, $Country, $Description]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Update Author" . $e->getMessage());
            return 0;
        }
    }

    // DELETE AUTHORS
    public function deleteAuthors($AuthorID) {

        try{
            $sql = "DELETE FROM authors 
                    WHERE AuthorID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute(array($AuthorID));
            return $stmt->rowCount();
        } catch (PDOException $e) {
             error_log("Error Delete Author" . $e->getMessage());
            return 0;
        }

    }

    /**
     * Lấy danh sách các sách của một tác giả, có thể loại trừ một sách cụ thể.
     *
     * @param int $AuthorID ID của tác giả.
     * @param int|null $currentBookID ID của sách hiện tại cần loại trừ (tùy chọn).
     * @return array Mảng các đối tượng sách.
     */
    public function getBooksByAuthor(int $AuthorID, ?int $currentBookID = null): array {
       try{
            // đảm bảo AuthorID hợp lệ
            $AuthorID = (int)$AuthorID;
            if ($AuthorID <= 0) return [];

            $sql = "SELECT BooksID, AuthorID, Title, ImageUrl FROM books WHERE AuthorID = :authorId";
            $params = [':authorId' => $AuthorID];

            if ($currentBookID !== null && (int)$currentBookID > 0) {
                $sql .= " AND BooksID != :currentBookId";
                $params[':currentBookId'] = (int)$currentBookID;
            }

            // giới hạn số kết quả để tránh trả quá nhiều dữ liệu
            $sql .= " ORDER BY BookImportDate DESC LIMIT 10";

            $stmt = $this->conn->prepare($sql);
            foreach ($params as $k => $v) {
                $type = is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($k, $v, $type);
            }
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
       } catch(PDOException $e) {
            error_log('Error getBooksByAuthor: ' . $e->getMessage() . ' params: AuthorID=' . $AuthorID . ' currentBookID=' . ($currentBookID ?? 'null'));
            return [];
       }    
    }

    public function getCountAuthors() {
         try{
        $sql = "SELECT COUNT(AuthorID) FROM authors";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
        } catch(PDOException $e) {
            error_log("Error get count authors " . $e->getMessage());
            return 0;
        }
    }
}
?>
