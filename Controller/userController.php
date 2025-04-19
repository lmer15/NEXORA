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

try {
    if (!isset($_GET['action'])) {
        throw new Exception('Action parameter is required');
    }

    switch ($_GET['action']) {
        case 'search':
            $query = $_GET['query'] ?? '';
            if (empty($query)) {
                echo json_encode(['success' => true, 'users' => []]);
                break;
            }

            $stmt = $conn->prepare("
                SELECT id, name, email, profile_picture 
                FROM users 
                WHERE name LIKE :query OR email LIKE :query
                LIMIT 10
            ");
            $searchQuery = "%$query%";
            $stmt->bindParam(':query', $searchQuery);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'users' => $users]);
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