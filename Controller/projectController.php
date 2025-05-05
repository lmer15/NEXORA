<?php
require_once '../config/db.php';
require_once '../Model/ProjectModel.php';
require_once '../Model/TaskModel.php';

session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== ($_SESSION['csrf_token'] ?? '')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'CSRF token validation failed']);
        exit;
    }
}

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Action parameter is required', 400);
    }

    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Unauthorized access', 401);
    }

    $projectModel = new ProjectModel($conn);
    $taskModel = new TaskModel($conn);
    $userId = $_SESSION['user_id'];
    $action = filter_var($_GET['action'], FILTER_SANITIZE_STRING);

    switch ($action) {
        case 'getTasks':
            $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT) ?: null;
            if (!$projectId) {
                throw new Exception('Project ID is required', 400);
            }

            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $categoryId = filter_input(INPUT_GET, 'categoryId', FILTER_VALIDATE_INT) ?: null;
            if ($categoryId) {
                $category = $projectModel->getCategoryById($categoryId);
                if (!$category || $category['project_id'] != $projectId) {
                    throw new Exception('Invalid category for this project', 400);
                }
                $tasks = $taskModel->getByCategory($categoryId);
            } else {
                $tasks = $taskModel->getByProject($projectId);
            }

            echo json_encode(['success' => true, 'tasks' => $tasks]);
            break;

        case 'getProject':
            $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT) ?: null;
            if (!$projectId) throw new Exception('Project ID is required', 400);

            $project = $projectModel->getById($projectId);
            if (!$project) throw new Exception('Project not found', 404);

            if ($project['owner_id'] !== $userId) {
                throw new Exception('Access denied to this project', 403);
            }

            echo json_encode(['success' => true, 'project' => $project]);
            break;

        case 'updateProject':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['projectId']) || !isset($data['field']) || !isset($data['value'])) {
                throw new Exception('Missing required fields', 400);
            }

            $projectId = filter_var($data['projectId'], FILTER_VALIDATE_INT);
            $field = filter_var($data['field'], FILTER_SANITIZE_STRING);
            $value = $data['value'];

            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $allowedFields = ['name', 'description', 'due_date', 'priority', 'color'];
            if (!in_array($field, $allowedFields)) {
                throw new Exception('Invalid field to update', 400);
            }

            if ($field === 'name' && strlen(trim($value)) < 3) {
                throw new Exception('Name must be at least 3 characters', 400);
            }
            if ($field === 'due_date' && $value && !strtotime($value)) {
                throw new Exception('Invalid date format', 400);
            }

            $success = $projectModel->updateField($projectId, $field, $value);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Project updated successfully' : 'Failed to update project'
            ]);
            break;

        case 'getCategories':
            $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT) ?: null;
            if (!$projectId) throw new Exception('Project ID is required', 400);

            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $categories = $projectModel->getCategories($projectId);
            echo json_encode(['success' => true, 'categories' => $categories]);
            break;

        case 'addCategory':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
        
            if (!isset($data['projectId']) || !isset($data['name'])) {
                throw new Exception('Missing required fields', 400);
            }
        
            $projectId = filter_var($data['projectId'], FILTER_VALIDATE_INT);
            $name = filter_var(trim($data['name']), FILTER_SANITIZE_STRING);
            if (strlen($name) < 2 || strlen($name) > 50) {
                throw new Exception('Category name must be between 2-50 characters', 400);
            }
        
            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }
        
            $categoryId = $projectModel->addCategory($projectId, $name);
            if (!$categoryId) {
                throw new Exception('Failed to add category', 500);
            }
        
            echo json_encode([
                'success' => true,
                'categoryId' => $categoryId,
                'message' => 'Category added successfully'
            ]);
            break;

        case 'createTask':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            $requiredFields = ['projectId', 'categoryId', 'title'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    throw new Exception("Missing required field: $field", 400);
                }
            }

            $projectId = filter_var($data['projectId'], FILTER_VALIDATE_INT);
            $categoryId = filter_var($data['categoryId'], FILTER_VALIDATE_INT);
            $title = filter_var(trim($data['title']), FILTER_SANITIZE_STRING);
            if (strlen($title) < 3 || strlen($title) > 100) {
                throw new Exception('Task title must be between 3-100 characters', 400);
            }

            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $category = $projectModel->getCategoryById($categoryId);
            if (!$category || $category['project_id'] != $projectId) {
                throw new Exception('Invalid category for this project', 400);
            }

            $description = isset($data['description']) ? filter_var(trim($data['description']), FILTER_SANITIZE_STRING) : '';
            if (strlen($description) > 500) {
                throw new Exception('Description too long (max 500 chars)', 400);
            }

            $status = isset($data['status']) && in_array($data['status'], ['todo', 'progress', 'done', 'blocked'])
                ? $data['status']
                : 'todo';

            $taskData = [
                'project_id' => $projectId,
                'category_id' => $categoryId,
                'title' => $title,
                'description' => $description,
                'status' => $status,
                'created_by' => $userId
            ];

            $taskId = $taskModel->create($taskData);
            if (!$taskId) {
                throw new Exception('Failed to create task', 500);
            }

            error_log("Task created: ID=$taskId, Project=$projectId, Category=$categoryId");
            echo json_encode([
                'success' => true,
                'taskId' => $taskId,
                'message' => 'Task created successfully'
            ]);
            break;

        case 'getTask':
            $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT) ?: null;
            if (!$taskId) {
                throw new Exception('Task ID is required', 400);
            }

            $task = $taskModel->getById($taskId);
            if (!$task) {
                throw new Exception('Task not found', 404);
            }

            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            echo json_encode(['success' => true, 'task' => $task]);
            break;

        case 'updateTaskPosition':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['taskId']) || !isset($data['categoryId']) || !isset($data['position'])) {
                throw new Exception('Missing required fields', 400);
            }

            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            $categoryId = filter_var($data['categoryId'], FILTER_VALIDATE_INT);
            $position = filter_var($data['position'], FILTER_VALIDATE_INT);

            if (!$taskId || !$categoryId || $position === false) {
                throw new Exception('Invalid input data', 400);
            }

            $task = $taskModel->getById($taskId);
            if (!$task) {
                throw new Exception('Task not found', 404);
            }

            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $category = $projectModel->getCategoryById($categoryId);
            if (!$category || $category['project_id'] != $task['project_id']) {
                throw new Exception('Invalid category for this project', 400);
            }

            $success = $taskModel->updatePosition($taskId, $categoryId, $position);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Task position updated' : 'Failed to update task position'
            ]);
            break;
            
        case 'deleteTask':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
        
            if (!isset($data['taskId'])) {
                throw new Exception('Task ID is required', 400);
            }
        
            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            $task = $taskModel->getById($taskId);
            if (!$task) {
                throw new Exception('Task not found', 404);
            }
        
            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }
        
            $success = $taskModel->delete($taskId);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Task deleted successfully' : 'Failed to delete task'
            ]);
            break;

        case 'updateCategory':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['categoryId']) || !isset($data['name']) || !isset($data['color'])) {
                throw new Exception('Missing required fields', 400);
            }

            $categoryId = filter_var($data['categoryId'], FILTER_VALIDATE_INT);
            $name = filter_var(trim($data['name']), FILTER_SANITIZE_STRING);
            if (strlen($name) < 2 || strlen($name) > 50) {
                throw new Exception('Category name must be between 2-50 characters', 400);
            }

            $category = $projectModel->getCategoryById($categoryId);
            if (!$category) {
                throw new Exception('Category not found', 404);
            }

            $project = $projectModel->getById($category['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $color = filter_var($data['color'], FILTER_SANITIZE_STRING);
            if (!preg_match('/^#[a-f0-9]{6}$/i', $color)) {
                throw new Exception('Invalid color format', 400);
            }

            $success = $projectModel->updateCategory($categoryId, $name, $color);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Category updated successfully' : 'Failed to update category'
            ]);
            break;

        case 'deleteCategory':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['categoryId'])) {
                throw new Exception('Category ID is required', 400);
            }

            $categoryId = filter_var($data['categoryId'], FILTER_VALIDATE_INT);
            $category = $projectModel->getCategoryById($categoryId);
            if (!$category) {
                throw new Exception('Category not found', 404);
            }

            $project = $projectModel->getById($category['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $success = $projectModel->deleteCategory($categoryId);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Category deleted successfully' : 'Failed to delete category'
            ]);
            break;

        case 'updateTask':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            $requiredFields = ['taskId', 'title', 'status', 'priority'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field])) {
                    throw new Exception("Missing required field: $field", 400);
                }
            }

            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            $title = filter_var(trim($data['title']), FILTER_SANITIZE_STRING);
            if (strlen($title) < 3 || strlen($title) > 100) {
                throw new Exception('Task title must be between 3-100 characters', 400);
            }

            $description = isset($data['description']) ? filter_var(trim($data['description']), FILTER_SANITIZE_STRING) : '';
            if (strlen($description) > 500) {
                throw new Exception('Description too long (max 500 chars)', 400);
            }

            $status = $data['status'];
            if (!in_array($status, ['todo', 'progress', 'done', 'blocked'])) {
                throw new Exception('Invalid task status', 400);
            }

            $priority = $data['priority'];
            if (!in_array($priority, ['high', 'medium', 'low'])) {
                throw new Exception('Invalid task priority', 400);
            }

            $dueDate = isset($data['due_date']) ? $data['due_date'] : null;
            if ($dueDate && !strtotime($dueDate)) {
                throw new Exception('Invalid due date format', 400);
            }

            $task = $taskModel->getById($taskId);
            if (!$task) {
                throw new Exception('Task not found', 404);
            }

            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $fieldsToUpdate = [
                'title' => $title,
                'description' => $description,
                'status' => $status,
                'priority' => $priority,
                'due_date' => $dueDate
            ];

            $success = true;
            foreach ($fieldsToUpdate as $field => $value) {
                if ($value !== null && !$taskModel->updateField($taskId, $field, $value)) {
                    $success = false;
                    break;
                }
            }

            error_log("Task updated: ID=$taskId, Project={$task['project_id']}");
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Task updated successfully' : 'Failed to update task'
            ]);
            break;

        case 'getProjectDetails':
            $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT) ?: null;
            if (!$projectId) throw new Exception('Project ID is required', 400);
        
            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }
        
            // Get all categories with their tasks
            $categories = $projectModel->getCategories($projectId);
            $tasks = $taskModel->getByProject($projectId);
        
            // Organize tasks by category
            $organizedTasks = [];
            foreach ($tasks as $task) {
                $organizedTasks[$task['category_id']][] = $task;
            }
        
            // Add tasks to their categories
            foreach ($categories as &$category) {
                $category['tasks'] = $organizedTasks[$category['id']] ?? [];
            }
        
            echo json_encode([
                'success' => true,
                'project' => $project,
                'categories' => $categories
            ]);
            break;
        
        case 'getCalendarTasks':
            $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT) ?: null;
            if (!$projectId) throw new Exception('Project ID is required', 400);
        
            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }
        
            $tasks = $taskModel->getByProject($projectId);
            
            // Format tasks for calendar
            $calendarTasks = [];
            foreach ($tasks as $task) {
                $calendarTasks[] = [
                    'id' => $task['id'],
                    'title' => $task['title'],
                    'start' => $task['due_date'],
                    'color' => $task['category_color'],
                    'priority' => $task['priority'],
                    'extendedProps' => [
                        'description' => $task['description'],
                        'status' => $task['status'],
                        'category' => $task['category_name']
                    ]
                ];
            }
        
            echo json_encode([
                'success' => true,
                'tasks' => $calendarTasks
            ]);
            break;

        case 'getAssignees':
            $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT);
            if (!$taskId) throw new Exception('Task ID is required', 400);
            
            $task = $taskModel->getById($taskId);
            if (!$task) throw new Exception('Task not found', 404);
            
            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }
            
            $assignees = $taskModel->getAssignees($taskId);
            echo json_encode(['success' => true, 'assignees' => $assignees]);
            break;
        
        case 'updateAssignees':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!isset($data['taskId']) || !isset($data['assignees'])) {
                throw new Exception('Missing required fields', 400);
            }
            
            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            $assignees = filter_var_array($data['assignees'], FILTER_VALIDATE_INT);
            
            $task = $taskModel->getById($taskId);
            if (!$task) throw new Exception('Task not found', 404);
            
            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }
            
            // Get current assignees
            $currentAssignees = $taskModel->getAssignees($taskId);
            $currentAssigneeIds = array_column($currentAssignees, 'id');
            
            // Add new assignees
            foreach ($assignees as $assigneeId) {
                if (!in_array($assigneeId, $currentAssigneeIds)) {
                    $taskModel->addAssignee($taskId, $assigneeId);
                    $taskModel->logActivity(
                        $taskId, 
                        $userId, 
                        'assignee_added', 
                        json_encode(['user_id' => $assigneeId])
                    );
                }
            }
            
            // Remove unassigned users
            foreach ($currentAssigneeIds as $currentId) {
                if (!in_array($currentId, $assignees)) {
                    $taskModel->removeAssignee($taskId, $currentId);
                    $taskModel->logActivity(
                        $taskId, 
                        $userId, 
                        'assignee_removed', 
                        json_encode(['user_id' => $currentId])
                    );
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Assignees updated']);
            break;
        
        case 'getTaskActivity':
            $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT);
            if (!$taskId) throw new Exception('Task ID is required', 400);
            
            $task = $taskModel->getById($taskId);
            if (!$task) throw new Exception('Task not found', 404);
            
            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }
            
            $activity = $taskModel->getActivity($taskId);
            echo json_encode(['success' => true, 'activity' => $activity]);
            break;

        case 'getFacilityMembers':
            $stmt = $conn->prepare("SELECT default_facility_id FROM users WHERE id = :userId");
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !$user['default_facility_id']) {
                throw new Exception('No facility found', 404);
            }
            
            // Get all members of this facility
            $stmt = $conn->prepare("
                SELECT u.id, u.name, u.profile_picture 
                FROM facility_members fm
                JOIN users u ON fm.user_id = u.id
                WHERE fm.facility_id = :facilityId
            ");
            $stmt->bindParam(':facilityId', $user['default_facility_id'], PDO::PARAM_INT);
            $stmt->execute();
            $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'members' => $members
            ]);
            break;

        default:
            throw new Exception('Invalid action', 400);
    }
} catch (Exception $e) {
    $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'code' => $code
    ]);
    error_log("Project Controller Error: {$e->getMessage()} (Action: $action)");
}
?>