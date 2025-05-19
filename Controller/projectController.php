<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../config/db.php';
require_once '../Model/ProjectModel.php';
require_once '../Model/TaskModel.php';

function getHttpCode($code) {
    if (is_numeric($code)) {
        $code = (int)$code;
        return ($code >= 100 && $code < 600) ? $code : 500;
    }
    return 500;
}

function isProjectOwner($conn, $projectId, $userId) {
    $stmt = $conn->prepare("SELECT owner_id FROM projects WHERE id = ?");
    $stmt->execute([$projectId]);
    $project = $stmt->fetch(PDO::FETCH_ASSOC);
    return $project && $project['owner_id'] == $userId;
}

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred',
        'error' => $errstr,
        'code' => $errno
    ]);
    exit;
});

set_exception_handler(function($exception) {
    error_log("PHP Exception: " . $exception->getMessage());
    $code = $exception->getCode();
    if (!is_int($code) || $code < 400 || $code > 599) {
        $code = 500;
    }
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $exception->getMessage(),
        'error' => $exception->getMessage(),
        'code' => $code
    ]);
    exit;
});

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== ($_SESSION['csrf_token'] ?? '')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'CSRF token validation failed']);
        exit;
    }
}

function isProjectMember($conn, $project, $userId) {
    if (!isset($project['id'])) {
        error_log("isProjectMember: project['id'] is missing!");
        return false;
    }
    if ($project['owner_id'] == $userId) return true;
    $stmt = $conn->prepare("SELECT COUNT(*) FROM task_assignees ta JOIN tasks t ON ta.task_id = t.id WHERE t.project_id = :projectId AND ta.user_id = :userId");
    $stmt->execute([':projectId' => $project['id'], ':userId' => $userId]);
    $count = $stmt->fetchColumn();
    error_log("isProjectMember: user $userId, project {$project['id']}, count=$count");
    return $count > 0;
}

function canUserModifyTask($conn, $userId, $taskId) {
    try {
        $stmt = $conn->prepare("
            SELECT p.owner_id, t.assignee_id 
            FROM tasks t 
            JOIN projects p ON t.project_id = p.id 
            WHERE t.id = :taskId
        ");
        $stmt->execute(['taskId' => $taskId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Allow owners and assigned users
        return $result && ($result['owner_id'] == $userId || $result['assignee_id'] == $userId);
    } catch (PDOException $e) {
        error_log('Error in canUserModifyTask: ' . $e->getMessage());
        return false;
    }
}

function canUserAccessTask($conn, $taskId, $userId) {
    try {
        $stmt = $conn->prepare("
            SELECT p.owner_id, t.project_id
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE t.id = :taskId
        ");
        $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            return false;
        }

        // Check if user is project owner
        if ($result['owner_id'] == $userId) {
            return true;
        }

        // Check if user is assigned to the task
        $stmt = $conn->prepare("
            SELECT 1 FROM task_assignments 
            WHERE task_id = :taskId AND user_id = :userId
        ");
        $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        error_log('Error in canUserAccessTask: ' . $e->getMessage());
        return false;
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
    $action = filter_var($_GET['action'], FILTER_DEFAULT);

    switch ($action) {
        case 'getTasks':
            try {
                $categoryId = filter_input(INPUT_GET, 'categoryId', FILTER_VALIDATE_INT);
                $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT);
                $userId = $_SESSION['user_id'] ?? null;

                if (!$projectId || !$userId) {
                    throw new Exception('Invalid parameters', 400);
                }

                // Get project details first for ownership check
                $project = $projectModel->getById($projectId);
                if (!$project) {
                    throw new Exception('Project not found', 404);
                }

                // Check access permission
                if (!$projectModel->canUserAccessProject($userId, $projectId)) {
                    throw new Exception('Access denied', 403);
                }

                $tasks = $categoryId ? 
                    $taskModel->getByCategory($categoryId) : 
                    $taskModel->getByProject($projectId);
                
                echo json_encode([
                    'success' => true,
                    'tasks' => $tasks,
                    'isOwner' => $project['owner_id'] == $userId
                ]);
                exit;

            } catch (Exception $e) {
                http_response_code(getHttpCode($e->getCode()));
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
                exit;
            }
            break;

        case 'getProject':
            $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT) ?: null;
            if (!$projectId) throw new Exception('Project ID is required', 400);

            $project = $projectModel->getById($projectId);
            if (!$project || !isProjectMember($conn, $project, $userId)) {
                throw new Exception('Project not found or access denied', 404);
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
            $field = filter_var($data['field'], FILTER_DEFAULT);
            $value = $data['value'];

            // Add at the beginning of each modification action
            if (!$projectModel->canUserModifyProject($userId, $projectId)) {
                throw new Exception('Access denied. Only project owner can modify.', 403);
            }

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
            try {
                $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT);
                if (!$projectId) {
                    throw new Exception('Project ID is required', 400);
                }

                $project = $projectModel->getById($projectId);
                if (!$project) {
                    throw new Exception('Project not found', 404);
                }

                if (!$projectModel->canUserAccessProject($userId, $projectId)) {
                    throw new Exception('Access denied', 403);
                }

                $categories = $projectModel->getCategories($projectId);
                
                echo json_encode([
                    'success' => true,
                    'categories' => $categories
                ], JSON_UNESCAPED_SLASHES);
                exit;

            } catch (Exception $e) {
                $code = getHttpCode($e->getCode());
                http_response_code($code);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
                exit;
            }
            break;

        case 'addCategory':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['projectId']) || !isset($data['name'])) {
                throw new Exception('Missing required fields', 400);
            }

            $projectId = filter_var($data['projectId'], FILTER_VALIDATE_INT);
            $name = filter_var(trim($data['name']), FILTER_DEFAULT);
            if (strlen($name) < 2 || strlen($name) > 50) {
                throw new Exception('Category name must be between 2-50 characters', 400);
            }

            // Add at the beginning of each modification action
            if (!$projectModel->canUserModifyProject($userId, $projectId)) {
                throw new Exception('Access denied. Only project owner can modify.', 403);
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

            // Check if user is project owner
            if (!isProjectOwner($conn, $category['project_id'], $userId)) {
                throw new Exception('Access denied. Only project owner can delete categories.', 403);
            }

            $success = $projectModel->deleteCategory($categoryId);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Category deleted successfully' : 'Failed to delete category'
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
            
            // Check if user is project owner
            if (!isProjectOwner($conn, $projectId, $userId)) {
                throw new Exception('Access denied. Only project owner can create tasks.', 403);
            }

            $categoryId = filter_var($data['categoryId'], FILTER_VALIDATE_INT);
            $title = filter_var(trim($data['title']), FILTER_DEFAULT);
            if (strlen($title) < 3 || strlen($title) > 100) {
                throw new Exception('Task title must be between 3-100 characters', 400);
            }

            // Add at the beginning of each modification action
            if (!$projectModel->canUserModifyProject($userId, $projectId)) {
                throw new Exception('Access denied. Only project owner can modify.', 403);
            }

            $project = $projectModel->getById($projectId);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            $category = $projectModel->getCategoryById($categoryId);
            if (!$category || $category['project_id'] != $projectId) {
                throw new Exception('Invalid category for this project', 400);
            }

            $description = isset($data['description']) ? filter_var(trim($data['description']), FILTER_DEFAULT) : '';
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
            if (!$project || !isProjectMember($conn, $project, $userId)) {
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

        case 'updateTask':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['taskId'])) {
                throw new Exception('Task ID is required', 400);
            }

            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            if (!$taskId) {
                throw new Exception('Invalid task ID', 400);
            }

            // Check task access
            if (!canUserAccessTask($conn, $taskId, $userId)) {
                throw new Exception('Access denied', 403);
            }

            // Proceed with update
            $success = $taskModel->updateTask($data);
            if (!$success) {
                throw new Exception('Failed to update task', 500);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Task updated successfully'
            ]);
            break;

        case 'getProjectDetails':
            try {
                $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT);
                $userId = $_SESSION['user_id'] ?? null;

                if (!$projectId || !$userId) {
                    throw new Exception('Invalid request parameters', 400);
                }

                $project = $projectModel->getById($projectId);
                if (!$project) {
                    throw new Exception('Project not found', 404);
                }

                $hasAccess = $projectModel->canUserAccessProject($userId, $projectId);
                if (!$hasAccess) {
                    throw new Exception('Access denied', 403);
                }

                echo json_encode([
                    'success' => true,
                    'project' => $project,
                    'isOwner' => $project['owner_id'] == $userId
                ], JSON_UNESCAPED_SLASHES);
                exit;

            } catch (Exception $e) {
                $code = getHttpCode($e->getCode());
                http_response_code($code);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
                exit;
            }
            break;

        case 'getCalendarTasks':
            $projectId = filter_input(INPUT_GET, 'projectId', FILTER_VALIDATE_INT) ?: null;
            if (!$projectId) throw new Exception('Project ID is required', 400);

            $project = $projectModel->getById($projectId);
            if (!$project || !isProjectMember($conn, $project, $userId)) {
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
            try {
                $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT);
                if (!$taskId) {
                    throw new Exception('Task ID is required', 400);
                }

                // Get task details
                $task = $taskModel->getById($taskId);
                if (!$task) {
                    throw new Exception('Task not found', 404);
                }

                // Check project access
                $project = $projectModel->getById($task['project_id']);
                if (!$project || !isProjectMember($conn, $project, $userId)) {
                    throw new Exception('Access denied', 403);
                }

                // Get assignees
                $assignees = $taskModel->getAssignees($taskId);
                echo json_encode([
                    'success' => true,
                    'assignees' => $assignees
                ]);
                
            } catch (Exception $e) {
                $code = getHttpCode($e->getCode());
                http_response_code($code);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'code' => $code
                ]);
                error_log("Error getting assignees: {$e->getMessage()}");
            }
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
            try {
                $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT);
                if (!$taskId) {
                    throw new Exception('Task ID is required', 400);
                }

                // Check task access
                if (!canUserAccessTask($conn, $taskId, $userId)) {
                    throw new Exception('Access denied', 403);
                }

                $activity = $taskModel->getActivity($taskId);
                echo json_encode([
                    'success' => true,
                    'activity' => $activity
                ]);
            } catch (Exception $e) {
                http_response_code(getHttpCode($e->getCode()));
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
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

        case 'getComments':
            $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT);
            if (!$taskId) throw new Exception('Task ID is required', 400);

            $task = $taskModel->getById($taskId);
            if (!$task) throw new Exception('Task not found', 404);

            $project = $projectModel->getById($task['project_id']);
            if (!$project || !isProjectMember($conn, $project, $userId)) {
                throw new Exception('Project not found or access denied', 404);
            }

            $comments = $taskModel->getComments($taskId);
            echo json_encode(['success' => true, 'comments' => $comments]);
            break;

        case 'addComment':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['taskId']) || !isset($data['content'])) {
                throw new Exception('Missing required fields', 400);
            }

            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            $content = filter_var(trim($data['content']), FILTER_DEFAULT);

            if (!$taskId || empty($content)) {
                throw new Exception('Invalid input data', 400);
            }

            $task = $taskModel->getById($taskId);
            if (!$task) throw new Exception('Task not found', 404);

            $project = $projectModel->getById($task['project_id']);
            if (!$project || !isProjectMember($conn, $project, $userId)) {
                throw new Exception('Project not found or access denied', 404);
            }

            $commentId = $taskModel->addComment($taskId, $userId, $content);
            if (!$commentId) {
                throw new Exception('Failed to add comment', 500);
            }

            // Log activity
            $taskModel->logActivity($taskId, $userId, 'comment_added');

            echo json_encode(['success' => true, 'message' => 'Comment added successfully']);
            break;

        case 'addLink':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['taskId']) || !isset($data['url'])) {
                throw new Exception('Missing required fields', 400);
            }

            $taskId = filter_var($data['taskId'], FILTER_VALIDATE_INT);
            $url = filter_var($data['url'], FILTER_SANITIZE_URL);

            if (!$taskId || !filter_var($url, FILTER_VALIDATE_URL)) {
                throw new Exception('Invalid input data', 400);
            }

            // Check task access
            if (!canUserAccessTask($conn, $taskId, $userId)) {
                throw new Exception('Access denied', 403);
            }

            $linkId = $taskModel->addLink($taskId, $url, $userId);
            if (!$linkId) {
                throw new Exception('Failed to add link', 500);
            }

            echo json_encode([
                'success' => true,
                'linkId' => $linkId,
                'message' => 'Link added successfully'
            ]);
            break;

        case 'deleteLink':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['linkId'])) {
                throw new Exception('Link ID is required', 400);
            }

            $linkId = filter_var($data['linkId'], FILTER_VALIDATE_INT);
            // Get link info
            $stmt = $conn->prepare("SELECT * FROM task_links WHERE id = :linkId");
            $stmt->bindParam(':linkId', $linkId, PDO::PARAM_INT);
            $stmt->execute();
            $link = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$link) {
                throw new Exception('Link not found', 404);
            }

            // Check project ownership
            $task = $taskModel->getById($link['task_id']);
            $project = $projectModel->getById($task['project_id']);
            if (!$project || $project['owner_id'] !== $userId) {
                throw new Exception('Project not found or access denied', 404);
            }

            // Delete from DB
            $stmt = $conn->prepare("DELETE FROM task_links WHERE id = :linkId");
            $stmt->bindParam(':linkId', $linkId, PDO::PARAM_INT);
            $success = $stmt->execute();

            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Link deleted successfully' : 'Failed to delete link'
            ]);
            break;

        case 'getLinks':
            $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT);
            if (!$taskId) {
                throw new Exception('Task ID is required', 400);
            }
            $task = $taskModel->getById($taskId);
            if (!$task) {
                throw new Exception('Task not found', 404);
            }
            $project = $projectModel->getById($task['project_id']);
            if (!$project || !isProjectMember($conn, $project, $userId)) {
                throw new Exception('Project not found or access denied', 404);
            }
            $links = $taskModel->getLinks($taskId);
            echo json_encode(['success' => true, 'links' => $links]);
            break;

        case 'getCurrentUser':
            try {
                if (!isset($_SESSION['user_id'])) {
                    throw new Exception('Unauthorized', 401);
                }

                $userId = $_SESSION['user_id'];
                $stmt = $conn->prepare("SELECT id, name, profile_picture FROM users WHERE id = :userId");
                $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$user) {
                    throw new Exception('User not found', 404);
                }

                // Ensure proper profile picture path
                if (!empty($user['profile_picture'])) {
                    $user['profile_picture'] = str_replace('\\', '/', $user['profile_picture']);
                    if (!str_starts_with($user['profile_picture'], '../')) {
                        $user['profile_picture'] = '../' . $user['profile_picture'];
                    }
                } else {
                    $user['profile_picture'] = '../Images/profile.PNG';
                }

                echo json_encode([
                    'success' => true,
                    'user' => $user
                ], JSON_UNESCAPED_SLASHES);
                exit;
            } catch (Exception $e) {
                http_response_code(getHttpCode($e->getCode()));
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
                exit;
            }
            break;

        case 'uploadFile':
            header('Content-Type: application/json');

            try {
                // Verify required data
                if (!isset($_FILES['file'])) {
                    throw new Exception('No file was selected for upload', 400);
                }

                if (!isset($_POST['taskId'])) {
                    throw new Exception('Task information is missing', 400);
                }

                $taskId = (int)$_POST['taskId'];
                $userId = $_SESSION['user_id'] ?? null;

                if (!$userId) {
                    throw new Exception('You need to be logged in to upload files', 401);
                }

                $task = $taskModel->getById($taskId);
                if (!$task) {
                    throw new Exception('The task you\'re trying to upload to doesn\'t exist', 404);
                }

                $file = $_FILES['file'];
                $maxSize = 5 * 1024 * 1024; // 5MB
                $allowedTypes = [
                    'image/jpeg', 'image/png', 'image/gif',
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain'
                ];

                // Check for upload errors
                if ($file['error'] !== UPLOAD_ERR_OK) {
                    $uploadErrors = [
                        UPLOAD_ERR_INI_SIZE => 'File is too large (server limit)',
                        UPLOAD_ERR_FORM_SIZE => 'File is too large (form limit)',
                        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
                    ];
                    $errorMsg = $uploadErrors[$file['error']] ?? 'Unknown upload error';
                    throw new Exception($errorMsg, 400);
                }

                if ($file['size'] > $maxSize) {
                    throw new Exception('File size exceeds the 5MB limit', 400);
                }

                if (!in_array($file['type'], $allowedTypes)) {
                    $allowedExtensions = [
                        'jpg', 'jpeg', 'png', 'gif', 
                        'pdf', 'pptx',
                        'doc', 'docx', 
                        'xls', 'xlsx',
                        'txt'
                    ];
                    throw new Exception(
                        'Only these file types are allowed: ' . 
                        implode(', ', $allowedExtensions), 
                        400
                    );
                }

                // Validate file content (basic check for images)
                if (strpos($file['type'], 'image/') === 0) {
                    $imageInfo = @getimagesize($file['tmp_name']);
                    if (!$imageInfo) {
                        throw new Exception('The uploaded file is not a valid image', 400);
                    }
                }

                // Create upload directory if needed
                $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/nexora/uploads/tasks/';
                if (!file_exists($uploadDir)) {
                    if (!mkdir($uploadDir, 0755, true)) {
                        throw new Exception('Could not create upload directory', 500);
                    }
                }

                // Generate unique filename while preserving extension
                $fileInfo = pathinfo($file['name']);
                $filename = uniqid('task_' . $taskId . '_') . '.' . strtolower($fileInfo['extension']);
                $destination = $uploadDir . $filename;

                // Move uploaded file
                if (!move_uploaded_file($file['tmp_name'], $destination)) {
                    throw new Exception('Failed to save the uploaded file', 500);
                }

                // Save to database
                $relativePath = 'uploads/tasks/' . $filename;
                $stmt = $conn->prepare("INSERT INTO task_attachments 
                    (task_id, uploaded_by, file_name, file_path, file_size, file_type) 
                    VALUES (?, ?, ?, ?, ?, ?)");
                
                $stmt->execute([
                    $taskId,
                    $userId,
                    $file['name'],
                    $relativePath,
                    $file['size'],
                    $file['type']
                ]);
                
                // Log activity
                $taskModel->logActivity($taskId, $userId, 'file_uploaded', json_encode([
                    'file_name' => $file['name'],
                    'file_size' => $file['size']
                ]));
                
                echo json_encode([
                    'success' => true,
                    'message' => 'File "' . htmlspecialchars($file['name']) . '" was uploaded successfully',
                    'filePath' => $relativePath
                ]);
                
            } catch (Exception $e) {
                $responseCode = getHttpCode($e->getCode());
                http_response_code($responseCode);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'code' => $responseCode
                ]);
            }
            break;

        case 'deleteFile':
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);

            if (!isset($data['fileId'])) {
                throw new Exception('File ID is required', 400);
            }

            $fileId = filter_var($data['fileId'], FILTER_VALIDATE_INT);
            if (!$fileId) {
                throw new Exception('Invalid file ID', 400);
            }

            // Get file info
            $stmt = $conn->prepare("
                SELECT ta.*, t.project_id 
                FROM task_attachments ta
                JOIN tasks t ON ta.task_id = t.id
                WHERE ta.id = :fileId
            ");
            $stmt->bindParam(':fileId', $fileId, PDO::PARAM_INT);
            $stmt->execute();
            $file = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$file) {
                throw new Exception('File not found', 404);
            }

            // Check task access
            if (!canUserAccessTask($conn, $file['task_id'], $userId)) {
                throw new Exception('Access denied', 403);
            }

            // Delete file from disk
            $filePath = $_SERVER['DOCUMENT_ROOT'] . '/nexora/' . $file['file_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete from DB
            $stmt = $conn->prepare("DELETE FROM task_attachments WHERE id = :fileId");
            $stmt->bindParam(':fileId', $fileId, PDO::PARAM_INT);
            $success = $stmt->execute();

            echo json_encode([
                'success' => $success,
                'message' => $success ? 'File deleted successfully' : 'Failed to delete file'
            ]);
            break;  

        case 'getFiles':
            $taskId = filter_input(INPUT_GET, 'taskId', FILTER_VALIDATE_INT);
            if (!$taskId) throw new Exception('Task ID is required', 400);

            $task = $taskModel->getById($taskId);
            if (!$task) throw new Exception('Task not found', 404);

            $stmt = $conn->prepare("
                SELECT tf.*, u.name as created_by 
                FROM task_attachments tf
                JOIN users u ON tf.uploaded_by = u.id
                WHERE tf.task_id = :taskId
                ORDER BY tf.uploaded_at DESC
            ");
            $stmt->bindParam(':taskId', $taskId, PDO::PARAM_INT);
            $stmt->execute();
            $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'files' => $files]);
            break;

        default:
            throw new Exception('Invalid action', 400);
    }
} catch (Exception $e) {
    $code = getHttpCode($e->getCode());
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'code' => $code
    ]);
    error_log("Project Controller Error: {$e->getMessage()} (Action: $action)");
}
?>