<?php

require_once __DIR__ . '/../connectDB.php';

class users extends Data{
    public function getConnection()
    {
        return $this->conn;
    }

    /**
     * Thêm một người dùng mới vào cơ sở dữ liệu một cách an toàn.
     *
     * @param string $username Tên đăng nhập.
     * @param string $email Email của người dùng.
     * @param string $password Mật khẩu (chưa được mã hóa).
     * @return int Số dòng bị ảnh hưởng (1 nếu thành công, 0 nếu thất bại).
     */
    public function addUser(string $username, string $email, string $password): int
    {
        // 1. Xác thực dữ liệu đầu vào
        if (empty($username) || empty($email) || empty($password)) {
            return 0; // Trả về 0 nếu thiếu thông tin
        }

        // 2. Mã hóa mật khẩu trước khi lưu
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        try {
            // 3. Câu lệnh SQL chỉ chứa các cột cần thiết
            $sql = "INSERT INTO users (username, email, password) VALUES (:username, :email, :password)";
            $stmt = $this->conn->prepare($sql);

            // 4. Bind các tham số để tăng cường bảo mật
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $hashedPassword);

            $stmt->execute();
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Add User " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Xác thực thông tin đăng nhập của người dùng.
     *
     * @param string $identifier Tên đăng nhập hoặc email của người dùng.
     * @param string $password Mật khẩu dạng văn bản thuần túy.
     * @return object|null Trả về đối tượng người dùng (không có mật khẩu) nếu đăng nhập thành công, ngược lại trả về null.
     */
    public function login(string $identifier, string $password): ?object
    {
        // 1. Xác thực dữ liệu đầu vào cơ bản
        if (empty($identifier) || empty($password)) {
            return null;
        }

        try {
            // 2. Tìm người dùng bằng email
            $sql = "SELECT userid, username, email, password FROM users WHERE email = :identifier";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':identifier', $identifier);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_OBJ);

            // 3. Nếu tìm thấy người dùng, xác thực mật khẩu bằng password_verify()
            if ($user && password_verify($password, $user->password)) {
                unset($user->password); // Xóa mật khẩu khỏi đối tượng trước khi trả về
                return $user;
            }

            return null; // Trả về null nếu không tìm thấy người dùng hoặc sai mật khẩu
        } catch (PDOException $e) {
            error_log("Error User Login: " . $e->getMessage());
            return null;
        }
    }
}