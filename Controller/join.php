<?php
require_once '../config/db.php';
require_once '../Model/FacilityModel.php';
require_once '../Model/UserModel.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../access.php?error=login_required");
    exit();
}

if (!isset($_GET['code']) || empty(trim($_GET['code']))) {
    header("Location: ../facility.php?error=invalid_code");
    exit();
}

$code = trim($_GET['code']);
$facilityModel = new FacilityModel($conn);
$userModel = new UserModel($conn);

try {
    // Check if it's a direct facility code
    $facility = $facilityModel->getFacilityByCode($code);
    if ($facility) {
        // Verify user isn't already a member
        $stmt = $conn->prepare("SELECT 1 FROM facility_members WHERE facility_id = ? AND user_id = ?");
        $stmt->execute([$facility['id'], $_SESSION['user_id']]);
        
        if ($stmt->rowCount() === 0) {
            $success = $facilityModel->addMember($facility['id'], $_SESSION['user_id'], $facility['owner_id']);
            if ($success) {
                header("Location: ../facility.php?joined=1");
                exit();
            }
        } else {
            header("Location: ../facility.php?error=already_member");
            exit();
        }
    }
    
    // Check if it's an invitation code
    $stmt = $conn->prepare("
        SELECT * FROM facility_invitations 
        WHERE code = ? AND status = 'pending' AND expires_at > NOW()
    ");
    $stmt->execute([$code]);
    $invitation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($invitation) {
        // Verify user isn't already a member
        $stmt = $conn->prepare("SELECT 1 FROM facility_members WHERE facility_id = ? AND user_id = ?");
        $stmt->execute([$invitation['facility_id'], $_SESSION['user_id']]);
        
        if ($stmt->rowCount() === 0) {
            $success = $facilityModel->addMember($invitation['facility_id'], $_SESSION['user_id'], $invitation['invited_by']);
            if ($success) {
                // Mark invitation as accepted
                $stmt = $conn->prepare("UPDATE facility_invitations SET status = 'accepted' WHERE code = ?");
                $stmt->execute([$code]);
                
                header("Location: ../facility.php?joined=1");
                exit();
            }
        } else {
            // Mark invitation as accepted even if already a member
            $stmt = $conn->prepare("UPDATE facility_invitations SET status = 'accepted' WHERE code = ?");
            $stmt->execute([$code]);
            
            header("Location: ../facility.php?error=already_member");
            exit();
        }
    }
    
    // If code is invalid
    header("Location: ../facility.php?error=invalid_code");
    exit();
    
} catch (Exception $e) {
    error_log("Join facility error: " . $e->getMessage());
    header("Location: ../facility.php?error=server_error");
    exit();
}