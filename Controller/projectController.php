<?php
require_once '../config/db.php';
require_once '../Model/ProjectModel.php';
require_once '../Model/TaskModel.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Action parameter is required');
    }

    $projectModel = new ProjectModel($conn);
    $taskModel = new Task($conn);

    switch ($_GET['action']) {
        case 'getProject':
            $projectId = $_GET['projectId'] ?? null;
            if (!$projectId) {
                throw new Exception('Project ID is required');
            }
            
            $project = $projectModel->getById($projectId);
            if (!$project) {
                throw new Exception('Project not found');
            }
            
            echo json_encode([
                'success' => true,
                'project' => $project
            ]);
            break;

        case 'updateProject':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!isset($data['projectId']) || !isset($data['field']) || !isset($data['value'])) {
                throw new Exception('Missing required fields');
            }
            
            $allowedFields = ['name', 'description', 'due_date', 'priority', 'color'];
            if (!in_array($data['field'], $allowedFields)) {
                throw new Exception('Invalid field to update');
            }
            
            $success = $projectModel->updateField($data['projectId'], $data['field'], $data['value']);
            
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Project updated successfully' : 'Failed to update project'
            ]);
            break;

        case 'getCategories':
            $projectId = $_GET['projectId'] ?? null;
            if (!$projectId) {
                throw new Exception('Project ID is required');
            }
            
            $categories = $projectModel->getCategories($projectId);
            
            echo json_encode([
                'success' => true,
                'categories' => $categories
            ]);
            break;

        case 'addCategory':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!isset($data['projectId']) || !isset($data['name'])) {
                throw new Exception('Missing required fields');
            }
            
            $color = $data['color'] ?? '#3b82f6';
            $categoryId = $projectModel->addCategory($data['projectId'], $data['name'], $color);
            
            echo json_encode([
                'success' => (bool)$categoryId,
                'categoryId' => $categoryId,
                'message' => $categoryId ? 'Category added successfully' : 'Failed to add category'
            ]);
            break;

        case 'createTask':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!isset($data['projectId']) || !isset($data['categoryId']) || !isset($data['title'])) {
                throw new Exception('Missing required fields');
            }
            
            $taskData = [
                'project_id' => $data['projectId'],
                'category_id' => $data['categoryId'],
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'status' => $data['status'] ?? 'todo',
                'created_by' => $_SESSION['user_id']
            ];
            
            $taskId = $taskModel->create($taskData);
            
            echo json_encode([
                'success' => (bool)$taskId,
                'taskId' => $taskId,
                'message' => $taskId ? 'Task created successfully' : 'Failed to create task'
            ]);
            break;

        case 'getTask':
            $taskId = $_GET['taskId'] ?? null;
            if (!$taskId) {
                throw new Exception('Task ID is required');
            }
            
            $task = $taskModel->getById($taskId);
            if (!$task) {
                throw new Exception('Task not found');
            }
            
            echo json_encode([
                'success' => true,
                'task' => $task
            ]);
            break;

        case 'updateTaskPosition':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!isset($data['taskId']) || !isset($data['categoryId']) || !isset($data['position'])) {
                throw new Exception('Missing required fields');
            }
            
            $success = $taskModel->updatePosition($data['taskId'], $data['categoryId'], $data['position']);
            
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Task position updated' : 'Failed to update task position'
            ]);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}