<?php
session_start();
header('Content-Type: application/json');

error_log('Session data: ' . print_r($_SESSION, true));

require_once '../config/db.php'; 

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Authentication required');
    }

    require_once '../Model/saveProject.php';
    $projectModel = new Project($conn); 

    if (!isset($_GET['action'])) {
        throw new Exception('Action parameter is required');
    }

    switch ($_GET['action']) {
        case 'getAll':
            $projects = $projectModel->getAll($_SESSION['user_id']);
            echo json_encode([
                'success' => true,
                'projects' => $projects
            ]);
            break;

        case 'create':
            $json = file_get_contents('php://input');
            error_log('Raw input: ' . $json);

            $data = json_decode($json, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('JSON decode error: ' . json_last_error_msg());
                throw new Exception('Invalid JSON data');
            }
            
            error_log('Decoded data: ' . print_r($data, true));
            
            if (!isset($_SESSION['user_id'])) {
                error_log('No user_id in session');
                throw new Exception('User not authenticated');
            }
            
            $data['owner_id'] = $_SESSION['user_id'];
            error_log('Final data with owner_id: ' . print_r($data, true));
            
            $result = $projectModel->create($data);
            error_log('Create result: ' . print_r($result, true));
            
            echo json_encode($result);
            break;

        case 'updateStatus':
            $json = file_get_contents('php://input');
            error_log('Raw input for updateStatus: ' . $json);

            $data = json_decode($json, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('JSON decode error in updateStatus: ' . json_last_error_msg());
                throw new Exception('Invalid JSON data');
            }

            if (!isset($data['projectId']) || !isset($data['status'])) {
                throw new Exception('Missing projectId or status');
            }

            $projectId = (int)$data['projectId'];
            $status = $data['status'];

            $result = $projectModel->updateStatus($projectId, $status);

            if (!$result) {
                throw new Exception('Failed to update project status');
            }

            // Return updated projects list for the user
            $projects = $projectModel->getAll($_SESSION['user_id']);
            echo json_encode([
                'success' => true,
                'projects' => $projects
            ]);
            break;

            case 'archive':
                $json = file_get_contents('php://input');
                $data = json_decode($json, true);
                
                if (!isset($data['projectId'])) {
                    throw new Exception('Missing projectId');
                }
                
                $projectId = (int)$data['projectId'];
                $result = $projectModel->archive($projectId);
                
                if (!$result) {
                    throw new Exception('Failed to archive project');
                }
                
                $projects = $projectModel->getAll($_SESSION['user_id']);
                echo json_encode(['success' => true, 'projects' => $projects]);
                break;
            
            case 'unarchive':
                $json = file_get_contents('php://input');
                $data = json_decode($json, true);
                
                if (!isset($data['projectId'])) {
                    throw new Exception('Missing projectId');
                }
                
                $projectId = (int)$data['projectId'];
                $result = $projectModel->unarchive($projectId);
                
                if (!$result) {
                    throw new Exception('Failed to unarchive project');
                }
                
                $projects = $projectModel->getAll($_SESSION['user_id']);
                echo json_encode(['success' => true, 'projects' => $projects]);
                break;
            
            case 'delete':
                $json = file_get_contents('php://input');
                $data = json_decode($json, true);
                
                if (!isset($data['projectId'])) {
                    throw new Exception('Missing projectId');
                }
                
                $projectId = (int)$data['projectId'];
                $result = $projectModel->delete($projectId);
                
                if (!$result) {
                    throw new Exception('Failed to delete project');
                }
                
                $projects = $projectModel->getAll($_SESSION['user_id']);
                echo json_encode(['success' => true, 'projects' => $projects]);
                break;
            
            case 'getArchived':
                $projects = $projectModel->getAll($_SESSION['user_id'], true);
                $archivedProjects = array_filter($projects, function($project) {
                    return $project['is_archived'] == true;
                });
                
                echo json_encode([
                    'success' => true,
                    'projects' => array_values($archivedProjects)
                ]);
                break;

            default:
                    throw new Exception('Invalid action');
            }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}
