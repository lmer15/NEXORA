<?php
class TaskModel {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getByCategory($categoryId) {
        try {
            $categoryId = filter_var($categoryId, FILTER_VALIDATE_INT);
            if (!$categoryId) return [];

            $stmt = $this->conn->prepare("
                SELECT 
                    t.*,
                    u.name as assignee_name,
                    pc.name as category_name,
                    pc.color as category_color
                FROM tasks t
                LEFT JOIN users u ON t.assignee_id = u.id
                LEFT JOIN project_categories pc ON t.category_id = pc.id
                WHERE t.category_id = :categoryId
                ORDER BY t.position
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
            $requiredFields = ['project_id', 'category_id', 'title', 'status', 'created_by'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    throw new Exception("Missing required field: $field", 400);
                }
            }
    
            // Validate input data
            $data['project_id'] = filter_var($data['project_id'], FILTER_VALIDATE_INT);
            $data['category_id'] = filter_var($data['category_id'], FILTER_VALIDATE_INT);
            $data['title'] = filter_var(trim($data['title']), FILTER_SANITIZE_STRING);
            $data['description'] = isset($data['description']) ? filter_var(trim($data['description']), FILTER_SANITIZE_STRING) : '';
            $data['status'] = filter_var($data['status'], FILTER_SANITIZE_STRING);
            $data['created_by'] = filter_var($data['created_by'], FILTER_VALIDATE_INT);
    
            if (!$data['project_id'] || !$data['category_id'] || !$data['created_by']) {
                throw new Exception('Invalid numeric input', 400);
            }
    
            $this->conn->beginTransaction();
    
            // Get the next position
            $stmt = $this->conn->prepare("
                SELECT COALESCE(MAX(position), 0) + 1 as new_position 
                FROM tasks 
                WHERE category_id = :category_id
            ");
            $stmt->bindParam(':category_id', $data['category_id'], PDO::PARAM_INT);
            $stmt->execute();
            $position = $stmt->fetchColumn();
    
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
                :position
            )";
    
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':project_id', $data['project_id'], PDO::PARAM_INT);
            $stmt->bindParam(':category_id', $data['category_id'], PDO::PARAM_INT);
            $stmt->bindParam(':title', $data['title'], PDO::PARAM_STR);
            $stmt->bindParam(':description', $data['description'], PDO::PARAM_STR);
            $stmt->bindParam(':status', $data['status'], PDO::PARAM_STR);
            $stmt->bindParam(':created_by', $data['created_by'], PDO::PARAM_INT);
            $stmt->bindParam(':position', $position, PDO::PARAM_INT);
            $stmt->execute();
    
            $taskId = $this->conn->lastInsertId();
            $this->conn->commit();
    
            return $taskId;
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log('Task creation error: ' . $e->getMessage());
            return false;
        }
    }

    public function getById($taskId) {
        try {
            $taskId = filter_var($taskId, FILTER_VALIDATE_INT);
            if (!$taskId) return false;

            $stmt = $this->conn->prepare("
                SELECT 
                    t.*,
                    u.name as assignee_name,
                    pc.name as category_name,
                    pc.color as category_color
                FROM tasks t
                LEFT JOIN users u ON t.assignee_id = u.id
                LEFT JOIN project_categories pc ON t.category_id = pc.id
                WHERE t.id = :taskId
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: false;
        } catch (PDOException $e) {
            error_log('Error fetching task: ' . $e->getMessage());
            return false;
        }
    }

    public function updatePosition($taskId, $categoryId, $position) {
        try {
            $taskId = filter_var($taskId, FILTER_VALIDATE_INT);
            $categoryId = filter_var($categoryId, FILTER_VALIDATE_INT);
            $position = filter_var($position, FILTER_VALIDATE_INT);
            if (!$taskId || !$categoryId || $position < 0) {
                throw new Exception('Invalid input', 400);
            }

            $this->conn->beginTransaction();

            // Get current task position and category
            $stmt = $this->conn->prepare("SELECT category_id, position FROM tasks WHERE id = :taskId");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            $currentData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$currentData) {
                throw new Exception('Task not found', 404);
            }

            $oldCategory = $currentData['category_id'];
            $oldPosition = $currentData['position'];

            if ($oldCategory != $categoryId) {
                $stmt = $this->conn->prepare("
                    UPDATE tasks 
                    SET position = position - 1 
                    WHERE category_id = :categoryId AND position > :position
                ");
                $stmt->bindParam(':categoryId', $oldCategory, PDO::PARAM_INT);
                $stmt->bindParam(':position', $oldPosition, PDO::PARAM_INT);
                $stmt->execute();
                $stmt = $this->conn->prepare("
                    UPDATE tasks 
                    SET position = position + 1 
                    WHERE category_id = :categoryId AND position >= :position
                ");
                $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
                $stmt->bindParam(':position', $position, PDO::PARAM_INT);
                $stmt->execute();
            } 
            else {
                if ($oldPosition < $position) {
                    $stmt = $this->conn->prepare("
                        UPDATE tasks 
                        SET position = position - 1 
                        WHERE category_id = :categoryId 
                        AND position > :oldPosition 
                        AND position <= :newPosition
                    ");
                    $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
                    $stmt->bindParam(':oldPosition', $oldPosition, PDO::PARAM_INT);
                    $stmt->bindParam(':newPosition', $position, PDO::PARAM_INT);
                    $stmt->execute();
                } else {
                    // Moving up in list
                    $stmt = $this->conn->prepare("
                        UPDATE tasks 
                        SET position = position + 1 
                        WHERE category_id = :categoryId 
                        AND position >= :newPosition 
                        AND position < :oldPosition
                    ");
                    $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
                    $stmt->bindParam(':newPosition', $position, PDO::PARAM_INT);
                    $stmt->bindParam(':oldPosition', $oldPosition, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // Update the task's position and category
            $stmt = $this->conn->prepare("
                UPDATE tasks 
                SET category_id = :categoryId, position = :position 
                WHERE id = :taskId
            ");
            $stmt->bindParam(':categoryId', $categoryId, PDO::PARAM_INT);
            $stmt->bindParam(':position', $position, PDO::PARAM_INT);
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();

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

        try {
            $taskId = filter_var($taskId, FILTER_VALIDATE_INT);
            if (!$taskId) return false;

            $sql = "UPDATE tasks SET $field = :value WHERE id = :taskId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error updating task field: ' . $e->getMessage());
            return false;
        }
    }

    public function getByProject($projectId) {
        try {
            $projectId = filter_var($projectId, FILTER_VALIDATE_INT);
            if (!$projectId) return [];

            $stmt = $this->conn->prepare("
                SELECT 
                    t.*,
                    u.name as assignee_name,
                    pc.name as category_name,
                    pc.color as category_color
                FROM tasks t
                LEFT JOIN users u ON t.assignee_id = u.id
                LEFT JOIN project_categories pc ON t.category_id = pc.id
                WHERE t.project_id = :projectId
                ORDER BY t.due_date ASC, t.priority DESC
            ");
            $stmt->bindParam(':projectId', $projectId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching tasks by project: ' . $e->getMessage());
            return [];
        }
    }

    public function updateTask(array $data) {
        try {
            $requiredFields = ['taskId', 'title', 'status', 'priority'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    throw new Exception("Missing required field: $field", 400);
                }
            }

            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            $title = filter_var(trim($data['title']), FILTER_SANITIZE_STRING);
            $description = isset($data['description']) ? filter_var(trim($data['description']), FILTER_SANITIZE_STRING) : '';
            $status = filter_var($data['status'], FILTER_SANITIZE_STRING);
            $priority = filter_var($data['priority'], FILTER_SANITIZE_STRING);
            $dueDate = isset($data['due_date']) ? $data['due_date'] : null;

            if (!$taskId || strlen($title) < 3) {
                throw new Exception('Invalid input data', 400);
            }

            $allowedStatuses = ['todo', 'progress', 'done', 'blocked'];
            $allowedPriorities = ['high', 'medium', 'low'];

            if (!in_array($status, $allowedStatuses) || !in_array($priority, $allowedPriorities)) {
                throw new Exception('Invalid status or priority value', 400);
            }

            $this->conn->beginTransaction();

            $fieldsToUpdate = [
                'title' => $title,
                'description' => $description,
                'status' => $status,
                'priority' => $priority
            ];

            if ($dueDate) {
                $fieldsToUpdate['due_date'] = $dueDate;
            }

            foreach ($fieldsToUpdate as $field => $value) {
                $stmt = $this->conn->prepare("UPDATE tasks SET $field = :value WHERE id = :taskId");
                $stmt->bindParam(':value', $value);
                $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
                $stmt->execute();
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log('Error updating task: ' . $e->getMessage());
            return false;
        }
    }

    public function delete($taskId) {
        try {
            $taskId = filter_var($taskId, FILTER_VALIDATE_INT);
            if (!$taskId) return false;

            $this->conn->beginTransaction();

            // First get the task's position and category for reordering
            $stmt = $this->conn->prepare("SELECT category_id, position FROM tasks WHERE id = :taskId");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            $taskData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$taskData) {
                throw new Exception('Task not found', 404);
            }

            // Delete the task
            $stmt = $this->conn->prepare("DELETE FROM tasks WHERE id = :taskId");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();

            // Update positions of remaining tasks in the same category
            $stmt = $this->conn->prepare("
                UPDATE tasks 
                SET position = position - 1 
                WHERE category_id = :categoryId AND position > :position
            ");
            $stmt->bindParam(':categoryId', $taskData['category_id'], PDO::PARAM_INT);
            $stmt->bindParam(':position', $taskData['position'], PDO::PARAM_INT);
            $stmt->execute();

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log('Error deleting task: ' . $e->getMessage());
            return false;
        }
    }

    public function getAssignees($taskId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT u.id, u.name, u.profile_picture 
                FROM task_assignments ta
                JOIN users u ON ta.user_id = u.id
                WHERE ta.task_id = :taskId
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching assignees: ' . $e->getMessage());
            return [];
        }
    }

    public function addAssignee($taskId, $userId) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO task_assignments (task_id, user_id) 
                VALUES (:taskId, :userId)
                ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error adding assignee: ' . $e->getMessage());
            return false;
        }
    }

    public function removeAssignee($taskId, $userId) {
        try {
            $stmt = $this->conn->prepare("
                DELETE FROM task_assignments 
                WHERE task_id = :taskId AND user_id = :userId
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error removing assignee: ' . $e->getMessage());
            return false;
        }
    }

    public function logActivity($taskId, $userId, $action, $details = null) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO task_activities 
                (task_id, user_id, action, details) 
                VALUES (:taskId, :userId, :action, :details)
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':action', $action, PDO::PARAM_STR);
            $stmt->bindParam(':details', $details, PDO::PARAM_STR);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error logging activity: ' . $e->getMessage());
            return false;
        }
    }

    public function getActivity($taskId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT ta.*, u.name as user_name, u.profile_picture
                FROM task_activities ta
                JOIN users u ON ta.user_id = u.id
                WHERE ta.task_id = :taskId
                ORDER BY ta.created_at DESC
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching activity: ' . $e->getMessage());
            return [];
        }
    }
}
?>