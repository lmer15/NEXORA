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
            $data['title'] = filter_var(trim($data['title']), FILTER_DEFAULT);
            $data['description'] = isset($data['description']) ? filter_var(trim($data['description']), FILTER_DEFAULT) : '';
            $data['status'] = filter_var($data['status'], FILTER_DEFAULT);
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

    public function updateTask($taskId, $data) {
        try {
            $updateFields = [];
            $params = [':taskId' => $taskId];

            if (isset($data['title'])) {
                $updateFields[] = 'title = :title';
                $params[':title'] = filter_var($data['title'], FILTER_DEFAULT);
            }
            if (isset($data['status'])) {
                $updateFields[] = 'status = :status';
                $params[':status'] = filter_var($data['status'], FILTER_DEFAULT);
            }
            if (isset($data['priority'])) {
                $updateFields[] = 'priority = :priority';
                $params[':priority'] = filter_var($data['priority'], FILTER_DEFAULT);
            }
            if (isset($data['description'])) {
                $updateFields[] = 'description = :description';
                $params[':description'] = filter_var($data['description'], FILTER_DEFAULT);
            }
            if (isset($data['due_date'])) {
                // Save as NULL if empty or invalid, else as YYYY-MM-DD
                $dueDate = $data['due_date'];
                if (!$dueDate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dueDate)) {
                    $dueDate = null;
                }
                $updateFields[] = 'due_date = :due_date';
                $params[':due_date'] = $dueDate;
            }

            if (empty($updateFields)) {
                return false;
            }

            $sql = "UPDATE tasks SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = :taskId";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute($params);
        } catch (Exception $e) {
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
                SELECT u.id, u.name, 
                    CASE 
                        WHEN u.profile_picture IS NOT NULL AND u.profile_picture != '' 
                        THEN CONCAT('../', u.profile_picture)
                        ELSE '../Images/profile.PNG'
                    END as profile_picture
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

    public function getComments($taskId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT tc.*, 
                    u.name as user_name,
                    CASE 
                        WHEN u.profile_picture IS NOT NULL AND u.profile_picture != '' 
                        THEN CONCAT('../', u.profile_picture)
                        ELSE '../Images/profile.PNG'
                    END as profile_picture
                FROM task_comments tc
                JOIN users u ON tc.user_id = u.id
                WHERE tc.task_id = :taskId
                ORDER BY tc.created_at DESC
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching comments: ' . $e->getMessage());
            return [];
        }
    }

    public function addComment($taskId, $userId, $content) {
        $stmt = $this->conn->prepare("
            INSERT INTO task_comments (task_id, user_id, content, created_at) 
            VALUES (:taskId, :userId, :content, NOW())
        ");
        $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':content', $content, PDO::PARAM_STR);
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function addLink($taskId, $url, $userId) {
        try {
            $stmt = $this->conn->prepare("
                INSERT INTO task_links (task_id, url, created_by)
                VALUES (:taskId, :url, :userId)
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->bindParam(':url', $url, PDO::PARAM_STR);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log('Error adding link: ' . $e->getMessage());
            return false;
        }
    }

    public function getLinks($taskId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT l.*, u.name as created_by
                FROM task_links l
                JOIN users u ON l.created_by = u.id
                WHERE l.task_id = :taskId
                ORDER BY l.created_at DESC
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching links: ' . $e->getMessage());
            return [];
        }
    }

    public function canUserModifyTask($userId, $taskId) {
        try {
            // Get the project owner
            $sql = "SELECT p.owner_id 
                    FROM tasks t 
                    JOIN projects p ON t.project_id = p.id 
                    WHERE t.id = :taskId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':taskId', $taskId);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                return false;
            }

            // Check if user is project owner
            if ($result['owner_id'] == $userId) {
                return true;
            }

            // For assignees, check if they're assigned to this task
            $sql = "SELECT 1 FROM task_assignments 
                    WHERE task_id = :taskId AND user_id = :userId";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':taskId', $taskId);
            $stmt->bindParam(':userId', $userId);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log('Error in canUserModifyTask: ' . $e->getMessage());
            return false;
        }
    }

    public function getTasksForUser($userId) {
        $stmt = $this->conn->prepare("
            SELECT t.* FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN task_assignments ta ON ta.task_id = t.id
            WHERE p.owner_id = :userId OR ta.user_id = :userId
            GROUP BY t.id
        ");
        $stmt->execute(['userId' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRecentActivitiesForUser($userId) {
        $stmt = $this->conn->prepare("
            SELECT a.*, t.title as task_title FROM task_activities a
            JOIN tasks t ON a.task_id = t.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE a.user_id = :userId OR p.owner_id = :userId
            AND a.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            ORDER BY a.created_at DESC
            LIMIT 30
        ");
        $stmt->execute(['userId' => $userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Format description for display
        foreach ($rows as &$row) {
            $row['description'] = $row['description'] ?? 'Activity on task "' . $row['task_title'] . '"';
        }
        return $rows;
    }
}
?>