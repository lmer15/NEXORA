<?php
require_once '../config/db.php';
require_once '../Model/facilityModel.php';
require_once '../Model/UserModel.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$facilityModel = new FacilityModel($conn);
$userModel = new UserModel($conn);

$currentUserId = $_SESSION['user_id'];
$currentUser = $userModel->getUserById($currentUserId);

if (!$currentUser || !isset($currentUser['default_facility_id'])) {
    echo json_encode(['success' => false, 'message' => 'User facility not found']);
    exit();
}

$facilityId = $currentUser['default_facility_id'];
$facility = $facilityModel->getFacilityById($facilityId);

if (!$facility) {
    echo json_encode(['success' => false, 'message' => 'Facility not found']);
    exit();
}

// Verify current user is the facility owner
$isOwner = ($facility['owner_id'] == $currentUserId);

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Action parameter is required');
    }

    switch ($_GET['action']) {
        case 'regenerateCode':
            if (!$isOwner) {
                throw new Exception('Only facility owner can regenerate code');
            }
            
            $newCode = $facilityModel->generateFacilityCode();
            $success = $facilityModel->updateFacilityCode($facilityId, $newCode);
            
            echo json_encode([
                'success' => $success,
                'code' => $success ? $newCode : null,
                'message' => $success ? 'Code regenerated' : 'Failed to update facility code'
            ]);
            break;
            
        case 'getMembers':
            $members = $facilityModel->getFacilityMembers($facilityId);
            echo json_encode(['success' => true, 'members' => $members]);
            break;
                
        case 'makeAdmin':
            if (!$isOwner) {
                throw new Exception('Only facility owner can grant admin privileges');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $userId = $input['user_id'] ?? 0;
            if (empty($userId) || !is_numeric($userId) || $userId == $currentUserId) {
                throw new Exception('Invalid user ID');
            }
            
            // Verify user is a member
            $isMember = false;
            foreach ($facilityModel->getFacilityMembers($facilityId) as $member) {
                if ($member['id'] == $userId) {
                    $isMember = true;
                    break;
                }
            }
            
            if (!$isMember) {
                throw new Exception('User is not a member of this facility');
            }
            
            try {
                if ($facilityModel->makeAdmin($facilityId, $userId, $currentUserId)) {
                    $members = $facilityModel->getFacilityMembers($facilityId);
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Admin privileges granted',
                        'members' => $members
                    ]);
                } else {
                    throw new Exception('Failed to make admin');
                }
            } catch (Exception $e) {
                throw new Exception($e->getMessage());
            }
            break;

        case 'revokeAdmin':
            if (!$isOwner) {
                throw new Exception('Only facility owner can revoke admin privileges');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $userId = $input['user_id'] ?? 0;
            if (empty($userId) || !is_numeric($userId) || $userId == $currentUserId) {
                throw new Exception('Invalid user ID');
            }
            
            try {
                if ($facilityModel->revokeAdmin($facilityId, $userId)) {
                    $members = $facilityModel->getFacilityMembers($facilityId);
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Admin privileges revoked',
                        'members' => $members
                    ]);
                } else {
                    throw new Exception('Failed to revoke admin');
                }
            } catch (Exception $e) {
                throw new Exception($e->getMessage());
            }
            break;

        case 'removeMember':
            $input = json_decode(file_get_contents('php://input'), true);
            $userId = $input['user_id'] ?? 0;
            if (empty($userId) || !is_numeric($userId) || $userId == $currentUserId) {
                throw new Exception('Invalid user ID');
            }
            
            // Owner can't be removed
            if ($userId == $facility['owner_id']) {
                throw new Exception('Cannot remove facility owner');
            }
            
            // Only owner can remove members (admins can't remove)
            if (!$isOwner) {
                throw new Exception('Only facility owner can remove members');
            }
            
            // Verify user is a member
            $isMember = false;
            foreach ($facilityModel->getFacilityMembers($facilityId) as $member) {
                if ($member['id'] == $userId) {
                    $isMember = true;
                    break;
                }
            }
            
            if (!$isMember) {
                throw new Exception('User is not a member of this facility');
            }
            
            try {
                if ($facilityModel->removeMember($facilityId, $userId)) {
                    $members = $facilityModel->getFacilityMembers($facilityId);
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Member removed',
                        'members' => $members
                    ]);
                } else {
                    throw new Exception('Failed to remove member');
                }
            } catch (Exception $e) {
                throw new Exception($e->getMessage());
            }
            break;
    
        case 'addMembers':
            $data = json_decode(file_get_contents('php://input'), true);
            $userIds = $data['user_ids'] ?? [];
            
            if (empty($userIds)) {
                echo json_encode(['success' => false, 'message' => 'No users selected']);
                break;
            }
            
            try {
                $conn->beginTransaction();
                
                $addedCount = 0;
                $errors = [];
                
                foreach ($userIds as $userId) {
                    if (!is_numeric($userId)) {
                        $errors[] = "Invalid user ID format";
                        continue;
                    }
                    
                    $userId = (int)$userId;
                    
                    if ($userId == $currentUserId) {
                        $errors[] = "You cannot add yourself";
                        continue;
                    }
        
                    $stmt = $conn->prepare("SELECT id, name FROM users WHERE id = ?");
                    $stmt->execute([$userId]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if (!$user) {
                        $errors[] = "User not found";
                        continue;
                    }
                    
                    $stmt = $conn->prepare("
                        SELECT 1 FROM facility_members 
                        WHERE facility_id = ? AND user_id = ?
                    ");
                    $stmt->execute([$facilityId, $userId]);
                    
                    if ($stmt->rowCount() > 0) {
                        $errors[] = "{$user['name']} is already a member";
                        continue;
                    }

                    $stmt = $conn->prepare("
                        INSERT INTO facility_members (facility_id, user_id, joined_at)
                        VALUES (?, ?, NOW())
                    ");
                    
                    if ($stmt->execute([$facilityId, $userId])) {
                        $addedCount++;
                    } else {
                        $errors[] = "Failed to add {$user['name']}";
                    }
                }
                
                if ($addedCount > 0) {
                    $conn->commit();
                    $message = "Successfully added $addedCount member(s)";
                    if (!empty($errors)) {
                        $message .= ". Issues: " . implode(', ', $errors);
                    }
                    echo json_encode([
                        'success' => true,
                        'added_count' => $addedCount,
                        'message' => $message
                    ]);
                } else {
                    $conn->rollBack();
                    echo json_encode([
                        'success' => false,
                        'message' => implode(', ', $errors) ?: 'Failed to add members'
                    ]);
                }
            } catch (Exception $e) {
                $conn->rollBack();
                throw $e;
            }
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    error_log("Error in memberController: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}