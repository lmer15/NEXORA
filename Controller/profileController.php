<?php
include_once '../config/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'update') {
    try {
        $userId = $_SESSION['user_id'];
        $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
        $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);

        if (empty($name) || empty($email)) {
            throw new Exception('Name and email are required');
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }

        // Check if email is already in use by another account
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $userId]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('Email already in use by another account');
        }

        // Get current profile picture path before update
        $stmt = $conn->prepare("SELECT profile_picture FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $currentProfile = $stmt->fetch(PDO::FETCH_ASSOC);
        $oldProfilePicture = $currentProfile['profile_picture'] ?? null;

        $profilePicturePath = null;
        if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../uploads/profile_pictures/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // File validation
            $file = $_FILES['profile_picture'];
            $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            
            // Check file type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            
            $allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($mime, $allowedMimes)) {
                throw new Exception('Only JPG, PNG, and GIF images are allowed');
            }
            
            // Check file extension
            if (!in_array($fileExtension, $allowedExtensions)) {
                throw new Exception('Invalid file extension');
            }
            
            // Check file size (max 2MB)
            if ($file['size'] > 2097152) {
                throw new Exception('File size must be less than 2MB');
            }
            
            // Check image dimensions (max 2000x2000)
            list($width, $height) = getimagesize($file['tmp_name']);
            if ($width > 2000 || $height > 2000) {
                throw new Exception('Image dimensions must be less than 2000x2000 pixels');
            }
            
            // Generate unique filename
            $fileName = 'user_' . $userId . '_' . time() . '.' . $fileExtension;
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $profilePicturePath = 'uploads/profile_pictures/' . $fileName;
                
                // Delete old profile picture if it exists and isn't the default
                if ($oldProfilePicture && $oldProfilePicture !== 'Images/profile.PNG' && file_exists('../' . $oldProfilePicture)) {
                    unlink('../' . $oldProfilePicture);
                }
            } else {
                throw new Exception('Failed to upload profile picture');
            }
        }

        // Update user in database
        if ($profilePicturePath) {
            $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, profile_picture = ? WHERE id = ?");
            $stmt->execute([$name, $email, $profilePicturePath, $userId]);
        } else {
            $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
            $stmt->execute([$name, $email, $userId]);
        }
        
        // Update session
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['profile_picture'] = $profilePicturePath ? $profilePicturePath : ($oldProfilePicture ? $oldProfilePicture : 'Images/profile.PNG');
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'name' => $name,
            'profile_picture' => $_SESSION['profile_picture']
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}