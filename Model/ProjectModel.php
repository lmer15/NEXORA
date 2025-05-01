<?php

require_once __DIR__ . '/TaskModel.php';

class ProjectModel {
    private $conn;
    private $taskModel;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->taskModel = new Task($conn);
    }

    public function getById($projectId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT p.*, u.name as owner_name 
                FROM projects p 
                JOIN users u ON p.owner_id = u.id 
                WHERE p.id = :projectId
            ");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
        } catch (PDOException $e) {
            error_log('Error fetching project: ' . $e->getMessage());
            return false;
        }
    }

    public function updateField($projectId, $field, $value) {
        $allowedFields = ['name', 'description', 'due_date', 'priority', 'color', 'status'];
        
        if (!in_array($field, $allowedFields)) {
            return false;
        }

        try {
            // Sanitize field name to prevent SQL injection
            $field = filter_var($field, FILTER_SANITIZE_STRING);
            
            $sql = "UPDATE projects SET {$field} = :value WHERE id = :projectId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error updating project field: ' . $e->getMessage());
            return false;
        }
    }

    public function getCategories($projectId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT 
                    pc.*,
                    (SELECT COUNT(*) FROM tasks t WHERE t.category_id = pc.id) as task_count
                FROM project_categories pc
                WHERE pc.project_id = :projectId
                ORDER BY pc.position
            ");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get tasks for each category
            foreach ($categories as &$category) {
                $category['tasks'] = $this->taskModel->getByCategory($category['id']);
            }
            unset($category); // Unset reference to prevent side effects

            return $categories;
        } catch (PDOException $e) {
            error_log('Error fetching categories: ' . $e->getMessage());
            return [];
        }
    }

    public function addCategory($projectId, $name, $color = '#3b82f6') {
        try {
            $this->conn->beginTransaction();

            // Get current max position
            $stmt = $this->conn->prepare("
                SELECT COALESCE(MAX(position), 0) + 1 as new_position 
                FROM project_categories 
                WHERE project_id = :projectId
            ");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->execute();
            $position = $stmt->fetchColumn();

            $stmt = $this->conn->prepare("
                INSERT INTO project_categories (
                    project_id, 
                    name, 
                    color, 
                    position
                ) VALUES (
                    :projectId, 
                    :name, 
                    :color, 
                    :position
                )
            ");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->bindParam(':name', $name, PDO::PARAM_STR);
            $stmt->bindParam(':color', $color, PDO::PARAM_STR);
            $stmt->bindParam(':position', $position, PDO::PARAM_INT);
            $stmt->execute();
            
            $categoryId = $this->conn->lastInsertId();
            $this->conn->commit();
            
            return $categoryId;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error adding category: ' . $e->getMessage());
            return false;
        }
    }
}
?>