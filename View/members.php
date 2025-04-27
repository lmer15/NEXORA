<?php
require_once '../config/db.php';
require_once '../Model/UserModel.php';
require_once '../Model/FacilityModel.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../access.php");
    exit();
}

$userModel = new UserModel($conn);
$facilityModel = new FacilityModel($conn);

// Get current user with facility info
$currentUser = $userModel->getUserById($_SESSION['user_id']);
if (!$currentUser) {
    die("User not found");
}

// Debugging - remove after testing
error_log("User data: " . print_r($currentUser, true));

// Get the user's owned facility if default_facility_id is missing
if (empty($currentUser['default_facility_id'])) {
    $stmt = $conn->prepare("SELECT id FROM facilities WHERE owner_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $ownedFacility = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($ownedFacility) {
        // Update user's default facility
        $conn->prepare("UPDATE users SET default_facility_id = ? WHERE id = ?")
             ->execute([$ownedFacility['id'], $_SESSION['user_id']]);
        $currentUser['default_facility_id'] = $ownedFacility['id'];
        $currentUser['facility_id'] = $ownedFacility['id'];
    } else {
        die("Critical error: User has no facility. Please contact support.");
    }
}

// Now we're sure the user has a facility
$facilityId = $currentUser['default_facility_id'];
$facility = $facilityModel->getFacilityById($facilityId);
if (!$facility) {
    die("Facility not found");
}

$facilityCode = $facility['code'];
$members = $facilityModel->getFacilityMembers($facilityId);

// Make sure the owner is first in the list
usort($members, function($a, $b) use ($facility) {
    if ($a['id'] == $facility['owner_id']) return -1;
    if ($b['id'] == $facility['owner_id']) return 1;
    return strcmp($a['name'], $b['name']);
});
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facility Members</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../CSS_Files/views/members.css?v=1.0">
</head>
<body>
    <div class="members-container">        
        <!-- Facility Code Section -->
        <div class="facility-code-section">
            <div class="section-header">
                <h2>Facility Access</h2>
                <div class="divider"></div>
            </div>
            
            <div class="code-container">
                <div class="code-display">
                    <div class="code">
                        <span class="code-label">Facility Code:</span>
                        <span class="code-value" id="facilityCodeValue"><?php echo htmlspecialchars($facilityCode); ?></span>
                    </div>
                    <div class="desc">
                        <span class="code-description">Invite other people by sending this code to allow other Nexora users to access your facility. 
                        You can use and regenerate new codes to disable the older ones.</span>
                    </div>
                </div>
                <button class="btn regenerate-btn" aria-label="Regenerate facility code" id="regenerateCodeBtn">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
            
            <div class="invite-section">
                <p class="invite-text">Invite members to join your facility</p>
                <button class="btn invite-btn" aria-label="Send invitation" id="inviteMembersBtn">
                    <i class="fas fa-user-plus"></i> Send Invitation
                </button>
            </div>
        </div>
        
        <!-- Members List Section -->
        <div class="members-list-section">
            <div class="section-header">
                <h2>Current Members</h2>
                <span class="facilityMembers">(<?php echo $facilityModel->getMemberCount($facilityId); ?>)</span>
                <div class="divider"></div>
            </div>
            
            <div id="membersError" class="error-message" style="display: none;"></div>
            <div id="membersSuccess" class="success-message" style="display: none;"></div>
            
            <div class="members-table-container">
                <table class="members-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="membersTableBody">
                        <?php foreach ($members as $member): ?>
                            <tr data-user-id="<?php echo $member['id']; ?>">
                                <td data-label="Member">
                                    <div class="member-info">
                                        <?php 
                                            $initials = '';
                                            $names = explode(' ', $member['name']);
                                            foreach ($names as $name) {
                                                $initials .= strtoupper(substr($name, 0, 1));
                                            }
                                            $initials = substr($initials, 0, 2);
                                        ?>
                                        <div class="avatar" style="background-color: <?php echo generateColorFromName($member['name']); ?>;">
                                            <?php echo $initials; ?>
                                        </div>
                                        <div class="member-details">
                                            <span class="member-name"><?php echo htmlspecialchars($member['name']); ?></span>
                                            <span class="member-status"><?php echo ucfirst($member['role']); ?></span>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Email"><?php echo htmlspecialchars($member['email']); ?></td>
                                <td data-label="Role">
                                    <span class="role-badge <?php echo $member['role']; ?>">
                                        <?php echo ucfirst($member['role']); ?>
                                    </span>
                                </td>
                                <td data-label="Joined">
                                    <?php echo date('M j, Y', strtotime($member['joined_at'])); ?>
                                </td>
                                <td data-label="Actions">
                                <div class="action-buttons">
                                    <?php if ($member['id'] != $_SESSION['user_id']): ?>
                                        <?php if ($member['role'] === 'admin'): ?>
                                            <button class="btn-icon revoke-admin-btn" 
                                                    data-user-id="<?php echo $member['id']; ?>" 
                                                    title="Revoke Admin" 
                                                    aria-label="Revoke admin privileges">
                                                <i class="fas fa-user-shield"></i>
                                            </button>
                                        <?php else: ?>
                                            <button class="btn-icon make-admin-btn" 
                                                    data-user-id="<?php echo $member['id']; ?>" 
                                                    title="Make Admin" 
                                                    aria-label="Make member admin">
                                                <i class="fas fa-crown"></i>
                                            </button>
                                        <?php endif; ?>
                                        
                                        <button class="btn-icon danger remove-member-btn" 
                                                data-user-id="<?php echo $member['id']; ?>" 
                                                title="Remove Member" 
                                                aria-label="Remove member">
                                            <i class="fas fa-user-times"></i>
                                        </button>
                                    <?php else: ?>
                                        <button class="btn-icon" disabled aria-label="Owner actions disabled">
                                            <i class="fas fa-crown"></i>
                                        </button>
                                        <button class="btn-icon" disabled aria-label="Owner actions disabled">
                                            <i class="fas fa-user-times"></i>
                                        </button>
                                    <?php endif; ?>
                                </div>
                            </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Invitation Modal -->
    <div class="modal-overlay" id="inviteModal">
        <div class="modal-container">
            <div class="modal-header">
                <h3>Invite Members</h3>
                <button class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-content">
                <div class="invite-method">
                    <p class="method-title">Quick Invite Link</p>
                    <p class="method-description">Share this link with people you want to invite to your facility:</p>
                    <div class="invite-link-container">
                        <input type="text" class="invite-link" id="inviteLinkInput" 
                               value="<?php echo "https://facility.example.com/join/" . htmlspecialchars($facilityCode); ?>" 
                               readonly aria-label="Invitation link">
                        <button class="btn copy-code-btn" id="copyInviteLinkBtn" aria-label="Copy invitation link">
                            <i class="fas fa-copy"></i>
                            <span class="copy-code-text">Copy</span>
                        </button>
                    </div>
                    <div class="divider-light"></div>
                </div>
                
                <div class="invite-method">
                    <p class="method-title">Direct Add Members</p>
                    <p class="method-description">Add existing Nexora users to your facility immediately:</p>
                    
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="search-input" id="userSearchInput" 
                                placeholder="Search by name or email..." aria-label="Search users" autocomplete="off">
                        </div>
                        
                        <!-- Updated floating suggestions dropdown -->
                        <div class="floating-suggestions" id="userSuggestions">
                            <div class="suggestion-list" id="suggestionList">
                                <!-- Suggestions will be populated here -->
                            </div>
                        </div>
                    </div>

                    <div class="selected-users">
                        <p class="selected-title">Users to be added:</p>
                        <div class="selected-list" id="selectedUsersList">
                            <div class="empty-state">
                                <i class="fas fa-users"></i>
                                <p>No users selected</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="message-area">
                        <div class="success-message" id="inviteSuccessMessage" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <span class="message-text"></span>
                        </div>
                        <div class="error-message" id="inviteErrorMessage" style="display: none;">
                            <i class="fas fa-exclamation-circle"></i>
                            <span class="message-text"></span>
                        </div>
                    </div>
                    
                    <button class="btn send-btn full-width" id="sendInvitationBtn" aria-label="Add members" disabled>
                        <i class="fas fa-user-plus"></i> Add Selected Members
                    </button>
                </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" id="confirmModal">
        <div class="modal-container small">
            <div class="modal-header">
                <h3>Confirm Action</h3>
                <button class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-content">
                <p id="confirmMessage">Are you sure you want to remove this member?</p>
                <div class="modal-actions">
                    <button class="btn cancel-btn" aria-label="Cancel action">Cancel</button>
                    <button class="btn danger confirm-btn" aria-label="Confirm action">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <script src="../JSFolder/facility.js"></script>
</body>
</html>

<?php
function generateColorFromName($name) {
    $colors = ['#3b82f6', '#06a566', '#f08c00', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'];
    $hash = crc32($name);
    return $colors[abs($hash) % count($colors)];
}
?>