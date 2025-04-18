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
