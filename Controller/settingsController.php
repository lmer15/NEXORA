<?php
require_once '../config/db.php';
require_once '../Model/settingsModel.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../access.php");
    exit();
}

$settingsModel = new SettingsModel($conn);

// Handle different actions
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'updatePassword':
            updatePassword();
            break;
        case 'updateSecurityQuestions':
            updateSecurityQuestions();
            break;
        case 'getSecurityQuestions':
            getSecurityQuestions();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
}

function updatePassword() {
    global $settingsModel;
    
    $userId = $_SESSION['user_id'];
    $currentPassword = $_POST['currentPassword'] ?? '';
    $newPassword = $_POST['newPassword'] ?? '';
    
    // Only update if both current and new password are provided
    if (!empty($currentPassword) && !empty($newPassword)) {
        $result = $settingsModel->updatePassword($userId, $currentPassword, $newPassword);
        echo json_encode($result);
    } else {
        echo json_encode(['success' => true, 'message' => 'No password changes made']);
    }
}

function updateSecurityQuestions() {
    global $settingsModel;
    
    $userId = $_SESSION['user_id'];
    $questions = [];
    
    // Collect all submitted questions and answers
    foreach ($_POST as $key => $value) {
        if (strpos($key, 'question') === 0) {
            $index = substr($key, strlen('question'));
            $questions[] = [
                'question' => $value,
                'answer' => $_POST['answer'.$index] ?? ''
            ];
        }
    }
    
    // Filter out empty question/answer pairs
    $questions = array_filter($questions, function($q) {
        return !empty($q['question']) && !empty($q['answer']);
    });
    
    // Only update if there are valid questions
    if (!empty($questions)) {
        $result = $settingsModel->updateSecurityQuestions($userId, $questions);
        echo json_encode($result);
    } else {
        echo json_encode(['success' => true, 'message' => 'No security question changes made']);
    }
}

function getSecurityQuestions() {
    global $settingsModel;
    
    $userId = $_SESSION['user_id'];
    $result = $settingsModel->getUserSecurityQuestions($userId);
    
    echo json_encode($result);
}
?>