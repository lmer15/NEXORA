<?php

class Task {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getByCategory($categoryId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT * 
                FROM tasks 
                WHERE category_id = :categoryId
            ");
            $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching tasks by category: ' . $e->getMessage());
            return [];
        }
    }

    public function create(array $data) {
        try {
            $this->conn->beginTransaction();

            $sql = "INSERT INTO tasks (
                project_id, 
                category_id, 
                title, 
                description, 
                status, 
                created_by,
                position
            ) VALUES (
                :project_id, 
                :category_id, 
                :title, 
                :description, 
                :status, 
                :created_by,
                (SELECT COALESCE(MAX(position), 0) + 1 FROM tasks WHERE category_id = :category_id)
            )";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':project_id', $data['project_id']);
            $stmt->bindParam(':category_id', $data['category_id']);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':created_by', $data['created_by']);
            $stmt->execute();

            $taskId = $this->conn->lastInsertId();
            $this->conn->commit();

            return $taskId;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Task creation error: ' . $e->getMessage());
            return false;
        }
    }

    public function getById($taskId) {
        $stmt = $this->conn->prepare("
            SELECT 
                t.*,
                u.name as assignee_name,
                pc.name as category_name,
                pc.color as category_color
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            LEFT JOIN project_categories pc ON t.category_id = pc.id
            WHERE t.id = ?
        ");
        $stmt->execute([$taskId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updatePosition($taskId, $categoryId, $position) {
        try {
            $this->conn->beginTransaction();

            // First get the current position and category
            $stmt = $this->conn->prepare("SELECT category_id, position FROM tasks WHERE id = ?");
            $stmt->execute([$taskId]);
            $currentData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$currentData) {
                throw new Exception('Task not found');
            }

            $currentCategory = $currentData['category_id'];
            $currentPosition = $currentData['position'];

            // If category changed, we need to update positions in both old and new categories
            if ($currentCategory != $categoryId) {
                // Decrement positions in old category
                $stmt = $this->conn->prepare("
                    UPDATE tasks 
                    SET position = position - 1 
                    WHERE category_id = ? AND position > ?
                ");
                $stmt->execute([$currentCategory, $currentPosition]);

                // Increment positions in new category to make space
                $stmt = $this->conn->prepare("
                    UPDATE tasks 
                    SET position = position + 1 
                    WHERE category_id = ? AND position >= ?
                ");
                $stmt->execute([$categoryId, $position]);
            } else {
                // Same category, just adjust positions
                if ($currentPosition < $position) {
                    // Moving down
                    $stmt = $this->conn->prepare("
                        UPDATE tasks 
                        SET position = position - 1 
                        WHERE category_id = ? AND position > ? AND position <= ?
                    ");
                    $stmt->execute([$categoryId, $currentPosition, $position]);
                } else {
                    // Moving up
                    $stmt = $this->conn->prepare("
                        UPDATE tasks 
                        SET position = position + 1 
                        WHERE category_id = ? AND position >= ? AND position < ?
                    ");
                    $stmt->execute([$categoryId, $position, $currentPosition]);
                }
            }

            // Update the task's position and category
            $stmt = $this->conn->prepare("
                UPDATE tasks 
                SET category_id = ?, position = ? 
                WHERE id = ?
            ");
            $stmt->execute([$categoryId, $position, $taskId]);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log('Error updating task position: ' . $e->getMessage());
            return false;
        }
    }

    public function updateField($taskId, $field, $value) {
        $allowedFields = ['title', 'description', 'status', 'priority', 'due_date', 'assignee_id', 'category_id'];
        
        if (!in_array($field, $allowedFields)) {
            return false;
        }

        $sql = "UPDATE tasks SET $field = :value WHERE id = :taskId";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':value', $value);
        $stmt->bindParam(':taskId', $taskId);
        
        return $stmt->execute();
    }

    public function getByProject($projectId) {
        $stmt = $this->conn->prepare("
            SELECT 
                t.*,
                u.name as assignee_name,
                pc.name as category_name
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            LEFT JOIN project_categories pc ON t.category_id = pc.id
            WHERE t.project_id = ?
            ORDER BY t.due_date ASC, t.priority DESC
        ");
        $stmt->execute([$projectId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}