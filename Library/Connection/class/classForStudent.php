<?php

require_once __DIR__ . '/../connectDB.php';

class student extends Data {

    public function getConnection() {
       return $this->conn;
    }

    /**
     * Xác thực thông tin đăng nhập của sinh viên.
     *
     * @param string $email Email của sinh viên.
     * @param string $password Mật khẩu dạng văn bản thuần túy.
     * @return object|null Trả về đối tượng sinh viên (không có mật khẩu) nếu đăng nhập thành công, ngược lại trả về null.
     */
    public function login(string $email, string $password): ?object
    {
        if (empty($email) || empty($password)) {
            return null;
        }
        try {
            // Lấy thông tin sinh viên bao gồm cả mật khẩu đã mã hóa
            $sql = "SELECT StudentID, StudentCode, FullName, Avata_image, Email, Phone, Address, Password FROM student WHERE Email = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_OBJ);

            // Nếu tìm thấy người dùng và mật khẩu khớp
            if ($user && password_verify($password, $user->Password)) {
                unset($user->Password); // Xóa mật khẩu khỏi đối tượng trước khi trả về
                return $user;
            }
            return null; // Không tìm thấy người dùng hoặc mật khẩu không khớp
        } catch (PDOException $e) {
            error_log("Error during login: " . $e->getMessage());
            return null;
        }
    }


    // ADD STUDENT
    public function addStudent(string $StudentCode, string $FullName, string $Gender, ?string $DateOfBirth, string $Email, string $Password, ?string $Phone, ?string $Address, ?string $EnrollmentYear, ?string $Status, ?int $MajorID, ?int $FacultyID): int {
        // Xác thực các trường bắt buộc
        if (empty(trim($StudentCode)) || empty(trim($FullName)) || empty(trim($Email)) || empty($Password)) {
            return 0;
        }

        // Mã hóa mật khẩu trước khi lưu
        $hashedPassword = password_hash($Password, PASSWORD_DEFAULT);

        try {
            $sql = "INSERT INTO student (StudentCode, FullName, Gender, DateOfBirth, Email, Password, Phone,  Address, EnrollmentYear, Status, MajorID, FacultyID)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"; 
            $stmt = $this->conn->prepare($sql);
            // Sử dụng mật khẩu đã mã hóa
            $stmt->execute([$StudentCode, $FullName, $Gender, $DateOfBirth, $Email, $hashedPassword, $Phone, $Address, $EnrollmentYear, $Status, $MajorID, $FacultyID]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Add Student " . $e->getMessage());
            return 0;
        }
    } 

    // GET STUDENT
    public function getStudent() {
        try{
            $sql = "SELECT StudentID, StudentCode ,FullName, Email
                    FROM student 
                    ORDER BY FullName ASC;
                   ";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Get Student " . $e->getMessage());
            return 0;
        }
    }

    //GET STUDENT BY ID
    public function getStudentById($StudentID)
    {
        try {
            $sql = "SELECT s.*, f.FacultyName, m.MajorName 
            FROM ((student s 
            JOIN faculty f ON f.FacultyID = s.FacultyID) 
            JOIN major m ON m.MajorID = s.MajorID)
            WHERE StudentID = ?;";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$StudentID]);
            $row = $stmt->fetch(PDO::FETCH_OBJ);

            return $row ?: null;
        } catch (PDOException $e) {
            error_log("Error Get Student By Id " . $e->getMessage());
            return [];
        }
    }
    // DELETE STUDENT
    public function deleteStudent(int $StudentID): int {
        if($StudentID <= 0) {
            return 0;
        }
        try{
            $sql = "DELETE FROM student WHERE StudentID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$StudentID]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Delete Student " . $e->getMessage());
            return 0;
        }
    }

    // UPDATE STUDENT
    public function updateStudent(int $StudentID, array $data): int {
        // Kiểm tra ID và dữ liệu
        if ($StudentID <= 0) {
            return 0;
        }
        if (empty($data) || !is_array($data)) {
            return 0;
        }

        // Các trường được phép cập nhật
        $allowed = [
            'StudentCode', 'FullName', 'Gender', 'DateOfBirth', 'Email', 'Password',
            'Phone', 'Address', 'EnrollmentYear', 'Status', 'MajorID', 'FacultyID'
            
        ];

        $setParts = [];
        $params = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "$field = ?";
                if ($field === 'Password' && !empty($data[$field])) {
                    // Mã hóa mật khẩu nếu có mật khẩu mới được cung cấp
                    $params[] = password_hash($data[$field], PASSWORD_DEFAULT);
                } else {
                    $params[] = $data[$field];
                }
            }
        }

        if (empty($setParts)) {
            // Không có trường hợp lệ để cập nhật
            return 0;
        }

        $params[] = $StudentID; // tham số cho WHERE

        try {
            $sql = "UPDATE student SET " . implode(', ', $setParts) . " WHERE StudentID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Update Student: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Cập nhật ảnh đại diện cho sinh viên và xóa ảnh cũ.
     *
     * @param int $studentID ID của sinh viên.
     * @param string $newImagePath Đường dẫn tương đối của ảnh mới.
     * @return bool True nếu thành công, false nếu thất bại.
     */
    public function updateAvatar(int $studentID, string $newImagePath): bool
    {
        if ($studentID <= 0 || empty($newImagePath)) {
            return false;
        }

        try {
            $this->conn->beginTransaction();

            // 1. Lấy đường dẫn ảnh cũ để xóa file
            $stmt = $this->conn->prepare("SELECT Avata_image FROM student WHERE StudentID = ?");
            $stmt->execute([$studentID]);
            $oldImagePath = $stmt->fetchColumn();

            // 2. Cập nhật CSDL với đường dẫn ảnh mới
            $updateStmt = $this->conn->prepare("UPDATE student SET Avata_image = ? WHERE StudentID = ?");
            $updateStmt->execute([$newImagePath, $studentID]);

            // 3. Xóa file ảnh cũ nếu tồn tại
            if ($oldImagePath && file_exists(__DIR__ . '/../../' . $oldImagePath)) {
                @unlink(__DIR__ . '/../../' . $oldImagePath);
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            if ($this->conn->inTransaction()) $this->conn->rollBack();
            error_log("Error updating avatar: " . $e->getMessage());
            return false;
        }
    }
  
}

?>