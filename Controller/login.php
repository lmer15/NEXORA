<?php
session_start();
require '../config/db.php';
require '../Model/UserModel.php';

$userModel = new UserModel($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $rememberMe = isset($_POST['rememberMe']) ? true : false;

    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    $user = $userModel->getUserByEmail($email);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        
        // Set cookie if "Remember Me" is checked
        if ($rememberMe) {
            $cookieValue = json_encode([
                'id' => $user['id'],
                'email' => $email,
                'token' => hash('sha256', $user['password'])
            ]);
            setcookie('remember_me', base64_encode($cookieValue), 
                time() + (30 * 24 * 60 * 60), // 30 days
                '/', 
                '', 
                true,  // Secure
                true   // HttpOnly
            );
        } else {
            // Clear cookie if not checked
            setcookie('remember_me', '', time() - 3600, '/');
        }
        
        echo json_encode(['status' => 'success', 'message' => 'Login successful.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
    }
}
?>