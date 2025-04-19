<?php
require_once '../config/db.php';
require_once '../Model/FacilityModel.php';
require_once '../Model/UserModel.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$facilityModel = new FacilityModel($conn);
$userModel = new UserModel($conn);

// Get the user's default facility
$user = $userModel->getUserById($_SESSION['user_id']);
if (!$user || !isset($user['default_facility_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'User facility not found']);
    exit();
}

$facilityId = $user['default_facility_id'];

header('Content-Type: application/json');

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Action parameter is required');
    }

    switch ($_GET['action']) {
        case 'regenerateCode':
            $newCode = $facilityModel->generateFacilityCode();
            $success = $facilityModel->updateFacilityCode($facilityId, $newCode);
            
            if ($success) {
                echo json_encode(['success' => true, 'code' => $newCode]);
            } else {
                throw new Exception('Failed to regenerate facility code');
            }
            break;
            
        case 'getMembers':
            $members = $facilityModel->getFacilityMembers($facilityId);
            echo json_encode(['success' => true, 'members' => $members]);
            break;
            
        case 'makeAdmin':
            $userId = $_POST['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('Missing user ID');
            }
            
            $success = $facilityModel->updateMemberRole($facilityId, $userId, 'admin');
            echo json_encode(['success' => $success]);
            break;
            
        case 'revokeAdmin':
            $userId = $_POST['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('Missing user ID');
            }
            
            $success = $facilityModel->updateMemberRole($facilityId, $userId, 'member');
            echo json_encode(['success' => $success]);
            break;
            
        case 'removeMember':
            $userId = $_POST['user_id'] ?? null;
            if (!$userId) {
                throw new Exception('Missing user ID');
            }
            
            $success = $facilityModel->removeFacilityMember($facilityId, $userId);
            echo json_encode(['success' => $success]);
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