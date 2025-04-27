<?php
require_once '../config/db.php';
require_once '../Model/UserModel.php';

session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$userModel = new UserModel($conn);

// Helper functions outside the switch
function getInitials($name) {
    $initials = '';
    $words = explode(' ', $name);
    foreach ($words as $word) {
        $initials .= strtoupper(substr($word, 0, 1));
    }
    return substr($initials, 0, 2);
}

function getColorFromName($name) {
    $colors = ['#3b82f6', '#06a566', '#f08c00', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'];
    $hash = crc32($name);
    return $colors[abs($hash) % count($colors)];
}

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Action parameter is required');
    }

    switch ($_GET['action']) {
        case 'search':
            $query = $_GET['query'] ?? '';
            
            if (empty($query)){
                echo json_encode(['success' => true, 'users' => []]);
                break;
            }
        
            try {
                $searchTerm = "%$query%";
                $currentUserId = $_SESSION['user_id'];
                
                // Get user's default facility
                $user = $userModel->getUserById($currentUserId);
                $facilityId = $user['default_facility_id'] ?? null;
                
                if (!$facilityId) {
                    throw new Exception('User facility not found');
                }
        
                $stmt = $conn->prepare("
                    SELECT id, name, email, profile_picture 
                    FROM users 
                    WHERE (name LIKE :query OR email LIKE :query)
                    AND id != :current_user_id
                    AND id NOT IN (
                        SELECT user_id FROM facility_members 
                        WHERE facility_id = :facility_id
                    )
                    ORDER BY 
                        CASE 
                            WHEN name LIKE :query_start THEN 0 
                            WHEN email LIKE :query_start THEN 1 
                            ELSE 2 
                        END,
                        name ASC
                    LIMIT 10
                ");
                
                $stmt->bindValue(':query', $searchTerm);
                $stmt->bindValue(':query_start', "$query%");
                $stmt->bindValue(':current_user_id', $currentUserId);
                $stmt->bindValue(':facility_id', $facilityId);
                
                if (!$stmt->execute()) {
                    throw new Exception('Database query failed');
                }
                
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Format results
                $formattedUsers = array_map(function($user) {
                    return [
                        'id' => (int)$user['id'],
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'initials' => getInitials($user['name']),
                        'color' => getColorFromName($user['name']),
                        'profile_picture' => $user['profile_picture'] ?? null
                    ];
                }, $users);
                
                echo json_encode([
                    'success' => true,
                    'users' => $formattedUsers
                ]);
            } catch (PDOException $e) {
                error_log("Search error: " . $e->getMessage());
                echo json_encode([
                    'success' => false,
                    'message' => 'Database error'
                ]);
            }
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