<?php

require_once __DIR__ . '/../connectDB.php';

class Notifications extends Data{
  public function getConnection() {
    return $this->conn;
  }

    /**
     * Tạo một thông báo mới cho người dùng.
     */
    public function createNotification(int $studentID, string $message, ?string $link = null): int {
        $sql = "INSERT INTO notifications (StudentID, Message, Link) VALUES (?, ?, ?)";
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentID, $message, $link]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Notification Creation Error: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Lấy các thông báo chưa đọc của một sinh viên.
     */
    public function getUnreadNotificationsByStudent(int $studentID): array {
        $sql = "SELECT NotificationID, Message, Link, CreatedAt 
                FROM notifications 
                WHERE StudentID = ? AND IsRead = 0 
                ORDER BY CreatedAt DESC";
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$studentID]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Get Notifications Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Đánh dấu một thông báo là đã đọc.
     */
    public function markAsRead(int $notificationID, int $studentID): int {
        $sql = "UPDATE notifications SET IsRead = 1 WHERE NotificationID = ? AND StudentID = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$notificationID, $studentID]);
        return $stmt->rowCount();
    }

    public function getNotificationByStudentId($studentID) {
        if($studentID <= 0 ) {
            return null;
        }

        try{
            $sql ="SELECT n.NotificationID, n.Message, COUNT(n.StudentID) AS total_notifications, n.CreatedAt, n.isRead, s.FullName 
            FROM notifications n 
            JOIN student s ON s.StudentID = n.StudentID 
            WHERE n.StudentID = ?";

            $get = $this->conn->prepare($sql);
            $get->execute([$studentID]);

            return $get->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {

            error_log('Error to gey count notification by studentid ' .$e-> getMessage());
            return null;
        }
        
    }
}
?>