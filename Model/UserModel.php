<?php
class UserModel {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getUserByEmail($email) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createUser($name, $email, $password) {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $this->conn->beginTransaction();
        
        try {
            // Create user
            $stmt = $this->conn->prepare("INSERT INTO users (name, email, password) VALUES (:name, :email, :password)");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->execute();
            
            $userId = $this->conn->lastInsertId();
            
            // Create facility for the user
            $facilityName = $name . "'s Facility";
            $facilityCode = $this->generateUniqueCode();
            
            $stmt = $this->conn->prepare("INSERT INTO facilities (name, code, owner_id) VALUES (:name, :code, :owner_id)");
            $stmt->bindParam(':name', $facilityName);
            $stmt->bindParam(':code', $facilityCode);
            $stmt->bindParam(':owner_id', $userId);
            $stmt->execute();
            
            $facilityId = $this->conn->lastInsertId();
            
            // Add user as member to their own facility
            $stmt = $this->conn->prepare("INSERT INTO facility_members (facility_id, user_id) VALUES (:facility_id, :user_id)");
            $stmt->bindParam(':facility_id', $facilityId);
            $stmt->bindParam(':user_id', $userId);
            $stmt->execute();
            
            // Add user as admin to their own facility
            $stmt = $this->conn->prepare("INSERT INTO facility_admins (facility_id, user_id, assigned_by) VALUES (:facility_id, :user_id, :assigned_by)");
            $stmt->bindParam(':facility_id', $facilityId);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':assigned_by', $userId);
            $stmt->execute();
            
            $this->conn->commit();
            
            return $userId;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
    
    public function getUserById($id) {
        $stmt = $this->conn->prepare("
            SELECT u.*, f.id AS facility_id, f.name AS facility_name, f.code AS facility_code 
            FROM users u
            LEFT JOIN facilities f ON u.default_facility_id = f.id
            WHERE u.id = :id
        ");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function generateUniqueCode($length = 8) {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $code = '';
        
        do {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $characters[rand(0, strlen($characters) - 1)];
            }
            
            // Check if code exists
            $stmt = $this->conn->prepare("SELECT COUNT(*) FROM facilities WHERE code = :code");
            $stmt->bindParam(':code', $code);
            $stmt->execute();
            $count = $stmt->fetchColumn();
            
        } while ($count > 0);
        
        return $code;
    }
}
?>