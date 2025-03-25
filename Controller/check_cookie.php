<?php
session_start();
require '../config/db.php';
require '../Model/UserModel.php';

$userModel = new UserModel($conn);

if (isset($_COOKIE['remember_me'])) {
    list($userId, $token) = explode(':', base64_decode($_COOKIE['remember_me']));
    $user = $userModel->getUserById($userId);
    
    if ($user && hash('sha256', $user['password']) === $token) {
        $_SESSION['user_id'] = $user['id'];
        echo json_encode(['status' => 'success']);
        exit;
    }
}

echo json_encode(['status' => 'error']);
?>