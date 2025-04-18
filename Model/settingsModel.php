<?php
class SettingsModel {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Update user password
    public function updatePassword($userId, $currentPassword, $newPassword) {
        try {
            // First verify current password
            $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !password_verify($currentPassword, $user['password'])) {
                return ['success' => false, 'message' => 'Current password is incorrect'];
            }

            // Update password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $userId]);
            
            return ['success' => true, 'message' => 'Password updated successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    // Update security questions
    public function updateSecurityQuestions($userId, $questions) {
        try {
            // Begin transaction
            $this->conn->beginTransaction();

            // First delete existing questions for this user
            $stmt = $this->conn->prepare("DELETE FROM security_questions WHERE user_id = ?");
            $stmt->execute([$userId]);

            // Insert new questions
            foreach ($questions as $questionData) {
                if (!empty($questionData['question']) && !empty($questionData['answer'])) {
                    $hashedAnswer = password_hash($questionData['answer'], PASSWORD_DEFAULT);
                    $stmt = $this->conn->prepare("INSERT INTO security_questions (user_id, question, answer) VALUES (?, ?, ?)");
                    $stmt->execute([$userId, $questionData['question'], $hashedAnswer]);
                }
            }

            $this->conn->commit();
            return ['success' => true, 'message' => 'Security questions updated successfully'];
        } catch (PDOException $e) {
            $this->conn->rollBack();
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    // Get user security questions
    public function getUserSecurityQuestions($userId) {
        try {
            $stmt = $this->conn->prepare("SELECT id, question FROM security_questions WHERE user_id = ? ORDER BY id");
            $stmt->execute([$userId]);
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return ['success' => true, 'questions' => $questions];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
}
?>