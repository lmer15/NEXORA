<?php
require '../config/db.php';
require '../Model/UserModel.php';

header('Content-Type: application/json');

$userModel = new UserModel($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get raw POST data
    $postData = file_get_contents('php://input');
    $data = json_decode($postData, true);
    
    // Initialize response array
    $response = [
        'status' => 'error',
        'message' => '',
        'errors' => []
    ];

    // Sanitize and validate inputs
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $confirmPassword = $data['confirmPassword'] ?? '';

    // Validate name
    if (empty($name)) {
        $response['errors']['name'] = 'Full name is required.';
    } elseif (strlen($name) < 2) {
        $response['errors']['name'] = 'Name must be at least 2 characters.';
    } elseif (strlen($name) > 50) {
        $response['errors']['name'] = 'Name cannot exceed 50 characters.';
    } elseif (!preg_match("/^[a-zA-Z-' ]*$/", $name)) {
        $response['errors']['name'] = 'Only letters and spaces allowed.';
    }

    // Validate email
    if (empty($email)) {
        $response['errors']['email'] = 'Email is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['errors']['email'] = 'Invalid email format.';
    } elseif (strlen($email) > 100) {
        $response['errors']['email'] = 'Email cannot exceed 100 characters.';
    } else {
        // Check if email exists
        $user = $userModel->getUserByEmail($email);
        if ($user) {
            $response['errors']['email'] = 'Email already exists.';
        }
    }

    // Validate password
    if (empty($password)) {
        $response['errors']['password'] = 'Password is required.';
    } elseif (strlen($password) < 8) {
        $response['errors']['password'] = 'Password must be at least 8 characters.';
    } elseif (!preg_match("/[A-Z]/", $password)) {
        $response['errors']['password'] = 'Password must contain at least one uppercase letter.';
    } elseif (!preg_match("/[a-z]/", $password)) {
        $response['errors']['password'] = 'Password must contain at least one lowercase letter.';
    } elseif (!preg_match("/[0-9]/", $password)) {
        $response['errors']['password'] = 'Password must contain at least one number.';
    } elseif (!preg_match("/[^A-Za-z0-9]/", $password)) {
        $response['errors']['password'] = 'Password must contain at least one special character.';
    }

    // Validate confirm password
    if (empty($confirmPassword)) {
        $response['errors']['confirmPassword'] = 'Please confirm your password.';
    } elseif ($password !== $confirmPassword) {
        $response['errors']['confirmPassword'] = 'Passwords do not match.';
    }

    // If no errors, proceed with registration
    if (empty($response['errors'])) {
        if ($userModel->createUser($name, $email, $password)) {
            $response['status'] = 'success';
            $response['message'] = 'Registration successful! You can now login.';
        } else {
            $response['message'] = 'Registration failed. Please try again.';
            $response['errors']['database'] = 'Database error occurred.';
        }
    } else {
        $response['message'] = 'Please fix the errors in the form.';
    }

    echo json_encode($response);
    exit;
}

// If not POST request
echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
?>