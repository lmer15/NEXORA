<?php
require_once __DIR__ . '/TaskModel.php';

class ProjectModel {
    private $conn;
    private $taskModel;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->taskModel = new TaskModel($conn); 
    }

    public function getById($projectId) {
        try {
            $projectId = filter_var($projectId, FILTER_VALIDATE_INT);
            if (!$projectId) return false;

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
            $projectId = filter_var($projectId, FILTER_VALIDATE_INT);
            $field = filter_var($field, FILTER_DEFAULT); // FIXED
            if (!$projectId || !$field) return false;
    
            // Special handling for date fields
            if ($field === 'due_date' && $value) {
                $value = date('Y-m-d', strtotime($value));
                if (!$value) return false;
            }
    
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
            $projectId = filter_var($projectId, FILTER_VALIDATE_INT);
            if (!$projectId) return [];

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
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching categories: ' . $e->getMessage());
            return [];
        }
    }

    public function addCategory($projectId, $name) {
        try {
            $projectId = filter_var($projectId, FILTER_VALIDATE_INT);
            $name = filter_var(trim($name), FILTER_DEFAULT); // FIXED
            if (!$projectId || !$name) {
                return false;
            }
    
            $this->conn->beginTransaction();
    
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
                    position
                ) VALUES (
                    :projectId, 
                    :name, 
                    :position
                )
            ");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->bindParam(':name', $name, PDO::PARAM_STR);
            $stmt->bindParam(':position', $position, PDO::PARAM_INT);
            $stmt->execute();
    
            $categoryId = $this->conn->lastInsertId();
            $this->conn->commit();
    
            error_log("Category added: ID=$categoryId, Project=$projectId");
            return $categoryId;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error adding category: ' . $e->getMessage());
            return false;
        }
    }

    public function getCategoryById($categoryId) {
        try {
            $categoryId = filter_var($categoryId, FILTER_VALIDATE_INT);
            if (!$categoryId) return false;

            $stmt = $this->conn->prepare("SELECT * FROM project_categories WHERE id = :categoryId");
            $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
        } catch (PDOException $e) {
            error_log('Error fetching category: ' . $e->getMessage());
            return false;
        }
    }

    public function updateCategory($categoryId, $name) {
        try {
            $categoryId = filter_var($categoryId, FILTER_VALIDATE_INT);
            $name = filter_var(trim($name), FILTER_DEFAULT); // FIXED
            if (!$categoryId || !$name) {
                return false;
            }

            $stmt = $this->conn->prepare("UPDATE project_categories SET name = :name WHERE id = :categoryId");
            $stmt->bindParam(':name', $name, PDO::PARAM_STR);
            $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error updating category: ' . $e->getMessage());
            return false;
        }
    }

    public function deleteCategory($categoryId) {
        try {
            $categoryId = filter_var($categoryId, FILTER_VALIDATE_INT);
            if (!$categoryId) return false;

            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("DELETE FROM tasks WHERE category_id = :categoryId");
            $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
            $stmt->execute();

            $stmt = $this->conn->prepare("DELETE FROM project_categories WHERE id = :categoryId");
            $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
            $stmt->execute();

            $this->conn->commit();
            error_log("Category deleted: ID=$categoryId");
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error deleting category: ' . $e->getMessage());
            return false;
        }
    }
}
?>