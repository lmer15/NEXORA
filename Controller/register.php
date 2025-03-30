<?php
require '../config/db.php';
require '../Model/UserModel.php';

header('Content-Type: application/json');

$userModel = new UserModel($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postData = file_get_contents('php://input');
    $data = json_decode($postData, true);

    $response = [
        'status' => 'error',
        'message' => 'Registration failed',
        'errors' => [],
        'user' => null
    ];

    $name = trim($data['name'] ?? '');
    $email = trim(strtolower($data['email'] ?? '')); 
    $password = $data['password'] ?? '';
    $confirmPassword = $data['confirmPassword'] ?? '';

    // Validate name
    if (empty($name)) {
        $response['errors']['name'] = 'Full name is required';
    } elseif (strlen($name) < 2) {
        $response['errors']['name'] = 'Name must be at least 2 characters';
    } elseif (strlen($name) > 50) {
        $response['errors']['name'] = 'Name cannot exceed 50 characters';
    } elseif (!preg_match("/^[a-zA-Z-' ]+$/", $name)) {
        $response['errors']['name'] = 'Only letters, spaces, hyphens and apostrophes allowed';
    }

    // Validate email
    if (empty($email)) {
        $response['errors']['email'] = 'Email is required';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['errors']['email'] = 'Invalid email format';
    } elseif (strlen($email) > 100) {
        $response['errors']['email'] = 'Email cannot exceed 100 characters';
    } elseif ($userModel->getUserByEmail($email)) {
        $response['errors']['email'] = 'Email already exists';
    }

    // Validate password
    if (empty($password)) {
        $response['errors']['password'] = 'Password is required';
    } else {
        if (strlen($password) < 8) {
            $response['errors']['password'] = 'Must be at least 8 characters';
        }
        if (!preg_match("/[A-Z]/", $password)) {
            $response['errors']['password'] = 'Requires at least one uppercase letter';
        }
        if (!preg_match("/[a-z]/", $password)) {
            $response['errors']['password'] = 'Requires at least one lowercase letter';
        }
        if (!preg_match("/[0-9]/", $password)) {
            $response['errors']['password'] = 'Requires at least one number';
        }
        if (!preg_match("/[^A-Za-z0-9]/", $password)) {
            $response['errors']['password'] = 'Requires at least one special character';
        }
    }

    // Validate password confirmation
    if (empty($confirmPassword)) {
        $response['errors']['confirmPassword'] = 'Please confirm your password';
    } elseif ($password !== $confirmPassword) {
        $response['errors']['confirmPassword'] = 'Passwords do not match';
    }

    // If no validation errors, attempt registration
    if (empty($response['errors'])) {
        try {
            if ($userModel->createUser($name, $email, $password)) {
                $response['status'] = 'success';
                $response['message'] = 'Registration successful! You can now login.';
                $response['user'] = [
                    'name' => $name,
                    'email' => $email
                ];
                
                session_start();
                $_SESSION['user_id'] = $userModel->getUserByEmail($email)['id'];
                $_SESSION['user_name'] = $name;
            }
        } catch (PDOException $e) {
            error_log('Registration error: ' . $e->getMessage());
            $response['message'] = 'Database error occurred. Please try again.';
        }
    }

    echo json_encode($response);
    exit;
}

http_response_code(405);
echo json_encode([
    'status' => 'error',
    'message' => 'Method not allowed. Only POST requests accepted.'
]);