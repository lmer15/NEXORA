<?php
require_once '../config/db.php';
require_once '../Model/UserModel.php';

if (isset($_GET['token'])) {
    // Add rate limiting
    $stmt = $conn->prepare("SELECT COUNT(*) FROM token_attempts WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    $stmt->execute([$_SERVER['REMOTE_ADDR']]);
    if ($stmt->fetchColumn() > 10) {
        header("Location: ../access.php?error=rate_limit");
        exit();
    }

    $token = $_GET['token'];
    $userModel = new UserModel($conn);
    
    // Verify token
    $stmt = $conn->prepare("SELECT * FROM email_confirmations WHERE token = ?");
    $stmt->execute([$token]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        // Mark email as confirmed
        $stmt = $conn->prepare("UPDATE users SET email_confirmed = 1 WHERE id = ?");
        $stmt->execute([$result['user_id']]);
        
        // Delete the token
        $stmt = $conn->prepare("DELETE FROM email_confirmations WHERE token = ?");
        $stmt->execute([$token]);
        
        // Start session and log user in
        session_start();
        $_SESSION['user_id'] = $result['user_id'];
        
        // Redirect to facility with success message
        header("Location: ../facility.php?confirmed=1");
        exit();
    }
}

// If token is invalid
header("Location: ../access.php?error=invalid_token");
exit();
?>