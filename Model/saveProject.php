<?php
class Project {
    private PDO $conn;

    public function __construct(PDO $conn) {
        $this->conn = $conn;
    }

    public function create(array $data): array {
        $errors = $this->validateProjectData($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            $this->conn->beginTransaction();

            $sql = "INSERT INTO projects (name, description, priority, due_date, color, status, owner_id, created_at) 
                    VALUES (:name, :description, :priority, :due_date, :color, 'todo', :owner_id, NOW())";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':priority', $data['priority']);
            $stmt->bindParam(':due_date', $data['due_date']);
            $stmt->bindParam(':color', $data['color']);
            $stmt->bindParam(':owner_id', $data['owner_id'], PDO::PARAM_INT);
            $stmt->execute();

            $projectId = $this->conn->lastInsertId();
            $this->conn->commit();

            return ['success' => true, 'project_id' => $projectId];

        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Project creation error: ' . $e->getMessage());
            return ['success' => false, 'errors' => ['database' => 'Failed to create project']];
        }
    }

    private function validateProjectData(array $data): array {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Project name is required';
        } elseif (strlen($data['name']) > 255) {
            $errors['name'] = 'Project name must be less than 255 characters';
        }

        if (empty($data['description'])) {
            $errors['description'] = 'Description is required';
        }

        if (!in_array($data['priority'], ['high', 'medium', 'low'])) {
            $errors['priority'] = 'Invalid priority level';
        }

        if (empty($data['due_date']) || !strtotime($data['due_date'])) {
            $errors['due_date'] = 'Invalid due date';
        } elseif (strtotime($data['due_date']) < strtotime('today')) {
            $errors['due_date'] = 'Due date cannot be in the past';
        }

        if (!preg_match('/^#[a-f0-9]{6}$/i', $data['color'])) {
            $errors['color'] = 'Invalid color format (must be #RRGGBB)';
        }

        if (empty($data['owner_id']) || !is_numeric($data['owner_id'])) {
            $errors['owner'] = 'Invalid project owner';
        }

        return $errors;
    }

    public function getAll(): array {
        try {
            $sql = "SELECT p.*, u.name as owner_name 
                    FROM projects p 
                    JOIN users u ON p.owner_id = u.id 
                    ORDER BY p.due_date ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $projects ?: [];

        } catch (PDOException $e) {
            error_log('Database error: ' . $e->getMessage());
            throw new Exception('Failed to retrieve projects');
        }
    }
}
