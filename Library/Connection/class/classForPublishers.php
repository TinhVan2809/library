<?php 
require_once __DIR__ . '/../connectDB.php';

class publishers extends Data{
    public function getConnection() {
        return $this->conn;
    }

    // GET PUBLISHERS
    public function getPublishers() {
        try{
            $sql = "SELECT PublisherID, PublisherName, Address, Phone, Email, Website 
                    FROM publishers ORDER BY PublisherName ASC"; 
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Get Publishers " . $e->getMessage());
            return [];
        }
    }

    // ADD PUBLISHERS
    public function addPublishers(?string $PublisherName, ?string $Address, ?string $Phone, ?string $Email, ?string $Website): int {
       // Kiểm tra trường không được null
        if(empty(trim($PublisherName))) {

            return 0;
        }   
        try{    
            $sql = "INSERT INTO publishers (PublisherName, Address, Phone, Email, Website) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$PublisherName, $Address, $Phone, $Email, $Website]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Add Publishers " . $e->getMessage());
            return 0;
        }
    }

    // DELETE PUBLISGHERS
    public function deletePublishers(int $PublisherID): int {
        if ($PublisherID <= 0) {
            return 0;
        }
        try{
            $sql = "DELETE FROM publishers WHERE PublisherID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$PublisherID]);
            return $stmt->rowCount();
        } catch(PDOException $e) {
            error_log("Error Delete Publishers " . $e->getMessage());
            return 0;
        }
    }

    // UPDATE PUBLISHERS
    public function updatePublishers(int $PublisherID, array $data): int {
        if ($PublisherID <= 0 || empty($data)) {
            return 0;
        }

        $allowed = ['PublisherName', 'Address', 'Phone', 'Email', 'Website'];
        $setParts = [];
        $params = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($setParts)) {
            return 0;
        }

        $params[] = $PublisherID;

        try {
            $sql = "UPDATE publishers SET " . implode(', ', $setParts) . " WHERE PublisherID = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Error Update Publishers: " . $e->getMessage());
            return 0;
        }
    }

    public function getCountPublishers() {
         try{
        $sql = "SELECT COUNT(PublisherID) FROM publishers";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
        } catch(PDOException $e) {
            error_log("Error get publishers " . $e->getMessage());
            return 0;
        }
    }
}

?>