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
        echo json_encode([
            'status' => 'error', 
            'message' => 'All fields are required.',
            'errors' => [
                'email' => empty($email) ? 'Email is required' : null,
                'password' => empty($password) ? 'Password is required' : null
            ]
        ]);
        exit;
    }

    $user = $userModel->getUserByEmail($email);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['profile_picture'] = $user['profile_picture']; 
        
        if ($rememberMe) {
            $cookieValue = json_encode([
                'id' => $user['id'],
                'email' => $email,
                'name' => $user['name'],
                'token' => hash('sha256', $user['password'])
            ]);
            setcookie('remember_me', base64_encode($cookieValue), 
                time() + (30 * 24 * 60 * 60), 
                '/', 
                '', 
                true, 
                true   
            );
        } else {
            setcookie('remember_me', '', time() - 3600, '/');
        }
        
        echo json_encode([
            'status' => 'success', 
            'message' => 'Login successful.',
            'name' => $user['name']
        ]);
    } else {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Invalid email or password.',
            'errors' => [
                'email' => 'Invalid credentials',
                'password' => 'Invalid credentials'
            ]
        ]);
    }
}
?>