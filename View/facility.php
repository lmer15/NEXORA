<?php
include_once '../config/db.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: access.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXORA FACILITY DASHBOARD</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shopify/draggable@1.0.0-beta.8/lib/draggable.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@shopify/draggable@1.0.0-beta.8/lib/draggable.min.js"></script>
    <link rel="stylesheet" href="../CSS_Files/facility.css">
</head>
<body data-user-id="<?php echo $_SESSION['user_id']; ?>">
    <div class="container">
        <header class="header">
            <div class="logo-container">
                <img src="../Images/Logo.png" alt="Nexora Facility Logo">
                <span class="logo-text">NEXORA</span>
            </div>

            <div class="header-right">
                <div class="notification-bell-container">
                    <button id="notificationBell" class="notification-bell" aria-label="Notifications">
                        <i class="fas fa-bell"></i>
                        <span id="notificationCount" class="notification-count" style="display:none;">0</span>
                    </button>
                    <div id="notificationDropdown" class="notification-dropdown">
                        <div class="dropdown-header">Notifications</div>
                        <div id="notificationList" class="notification-list">
                            <div class="empty-state">No notifications</div>
                        </div>
                    </div>
                </div>
                <div class="profile" id="profileDropdown">
                    <div class="profile-info">
                        <div class="profile-name"><?php echo htmlspecialchars($_SESSION['user_name'] ?? 'user_name'); ?></div>
                        <div class="profile-role"><?php echo htmlspecialchars($_SESSION['role'] ?? 'Owner'); ?></div>
                    </div>
                    <img src="<?php echo '../' . htmlspecialchars($_SESSION['profile_picture'] ?? 'Images/profile.PNG'); ?>" alt="Profile picture" class="profile-pic">
                    <div class="profile-dropdown-menu">
                        <a href="#" class="dropdown-item"><i class="fas fa-user"></i> Profile</a>
                        <a href="#" class="dropdown-item"><i class="fas fa-cog"></i> Settings</a>
                        <a href="../Controller/logout.php" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            </div>
        </header>

        <main class="content">
            <nav class="left-navigator">
                <div class="nav-section">
                    <div class="nav-title">Nexora Facility</div>
                    <ul class="nav-list">
                        <li class="nav-item active" data-view="dashboard">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-table-columns"></i>
                                <span class="nav-item-text">Dashboards</span>
                            </div>
                        </li>
                        <li class="nav-item" data-view="members">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-users"></i>
                                <span class="nav-item-text">Members</span>
                            </div>
                        </li>
                        <li class="nav-item" data-view="settings">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-gear"></i>
                                <span class="nav-item-text">Settings</span>
                            </div>
                        </li>
                        <li class="nav-item" data-view="archived-projects">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-box-archive"></i>
                                <span class="nav-item-text">Archived Projects</span>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <div class="nav-title">Your Projects <i class="fa-solid fa-plus new-project-nav-icon"></i></div>
                    <ul class="nav-list">
                        <!-- Projects will be added here dynamically -->
                    </ul>
                </div>
                
                <div class="nav-section bottom-nav">
                    <div class="nav-title">Joined Facility</div>
                    <ul class="nav-list">
                        <li class="nav-item" data-view="project-beta">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-briefcase"></i>
                                <span class="nav-item-text">Elmer's Facility</span>
                            </div>
                            <div class="nav-item-actions">
                                <i class="fa-solid fa-ellipsis"></i>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <div class="right-dashboard" id="dynamic-content">
                <div id="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i> Loading Dashboard...
                </div>
            </div>
        </main>

        <div class="floating-form-overlay" id="projectFormOverlay">
            <div class="floating-form-container">
                <div class="form-header">
                    <div class="form-header-content">
                        <i class="fas fa-project-diagram form-icon"></i>
                        <h3 class="form-title">Create New Project</h3>
                    </div>
                    <button class="form-close" id="closeFormBtn" aria-label="Close form">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="form-body">
                    <form id="projectForm">
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <div class="input-group">
                                    <label for="projectName">
                                        <i class="fas fa-heading"></i> Project Name
                                    </label>
                                    <div class="input-with-icon">
                                        <i class="fas fa-pencil-alt input-icon"></i>
                                        <input type="text" id="projectName" placeholder="Enter project name" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="projectPriority">
                                        <i class="fas fa-exclamation-circle"></i> Priority
                                    </label>
                                    <div class="select-wrapper">
                                        <i class="fas fa-chevron-down select-icon"></i>
                                        <select id="projectPriority" required>
                                            <option value="" disabled selected>Select priority</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="projectDueDate">
                                        <i class="far fa-calendar-alt"></i> Due Date
                                    </label>
                                    <div class="input-with-icon">
                                        <i class="far fa-calendar input-icon"></i>
                                        <input type="text" id="projectDueDate" class="date-picker-input" placeholder="Select date" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group full-width">
                                <div class="input-group">
                                    <label>
                                        <i class="fas fa-palette"></i> Project Color
                                    </label>
                                    <div class="color-chooser">
                                        <div class="color-preview" id="colorPreview" style="background-color: #3b82f6">
                                            <span class="color-preview-text">Project Color</span>
                                        </div>
                                        <div class="color-options">
                                            <div class="color-presets">
                                                <button type="button" class="color-option selected" data-color="#3b82f6" style="background-color: #3b82f6">
                                                    <span class="color-name">Blue</span>
                                                </button>
                                                <button type="button" class="color-option" data-color="#10b981" style="background-color: #10b981">
                                                    <span class="color-name">Green</span>
                                                </button>
                                                <button type="button" class="color-option" data-color="#f59e0b" style="background-color: #f59e0b">
                                                    <span class="color-name">Amber</span>
                                                </button>
                                                <button type="button" class="color-option" data-color="#ef4444" style="background-color: #ef4444">
                                                    <span class="color-name">Red</span>
                                                </button>
                                                <button type="button" class="color-option" data-color="#8b5cf6" style="background-color: #8b5cf6">
                                                    <span class="color-name">Violet</span>
                                                </button>
                                            </div>
                                            <div class="color-picker-container">
                                                <button type="button" class="custom-color-btn" id="customColorBtn">
                                                <i class="fas fa-sliders-h"></i> Custom Color
                                                </button>
                                                <input type="color" id="colorPicker" value="#3b82f6">
                                            </div>
                                        </div>
                                        <input type="hidden" id="selectedColor" name="projectColor" value="#3b82f6">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group full-width">
                                <div class="input-group">
                                    <label for="projectDescription">
                                        <i class="fas fa-align-left"></i> Description
                                    </label>
                                    <textarea id="projectDescription" placeholder="Enter project details" required></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="form-footer">
                            <button type="button" class="btn btn-outline" id="cancelFormBtn">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button type="submit" form="projectForm" class="btn btn-primary">
                                <i class="fas fa-plus-circle"></i> Create Project
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Join Facility Modal -->
        <div class="modal-overlay" id="joinFacilityModal">
            <div class="modal-container small">
                <div class="modal-header">
                    <h3>Join Facility</h3>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="form-group">
                        <label for="facilityCode">Enter Facility Code</label>
                        <input type="text" id="facilityCode" placeholder="e.g., XK7H-9P2M" autofocus>
                        <p class="help-text">Get the code from the facility admin</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-outline cancel-btn">Cancel</button>
                        <button class="btn btn-primary confirm-btn">Join Facility</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Edit Modal -->
        <div class="modal-overlay" id="profileModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Edit Profile</h3>
                    <button class="modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="modal-content">
                    <form id="profileForm">
                        <div class="form-grid">
                            <!-- Profile Picture Section -->
                            <div class="form-group full-width">
                                <div class="profile-picture-container">
                                    <div class="profile-picture-preview" id="profilePicturePreview">
                                        <img src="../Images/profile.PNG" alt="Current profile picture" id="currentProfilePic">
                                        <div class="upload-overlay">
                                            <i class="fas fa-camera"></i>
                                            <span>Change Photo</span>
                                        </div>
                                    </div>
                                    <input type="file" id="profilePicture" accept="image/*" style="display: none;">
                                    <div class="profile-picture-actions">
                                        <button type="button" class="btn btn-outline" id="changePhotoBtn">
                                            <i class="fas fa-upload"></i> Change Photo
                                        </button>
                                        <button type="button" class="btn btn-outline danger" id="removePhotoBtn">
                                            <i class="fas fa-trash"></i> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Personal Info Section -->
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="profileName">
                                        <i class="fas fa-user"></i> Full Name
                                    </label>
                                    <div class="input-with-icon">
                                        <i class="fas fa-pencil-alt input-icon"></i>
                                        <input type="text" id="profileName" value="<?php echo htmlspecialchars($_SESSION['user_name'] ?? ''); ?>" required>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="input-group">
                                    <label for="profileEmail">
                                        <i class="fas fa-envelope"></i> Email
                                    </label>
                                    <div class="input-with-icon">
                                        <i class="fas fa-at input-icon"></i>
                                        <input type="email" id="profileEmail" value="<?php echo htmlspecialchars($_SESSION['user_email'] ?? ''); ?>" required>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-footer">
                            <button type="button" class="btn btn-outline" id="cancelProfileBtn">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <script src="../JSFolder/facility.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
        <script>
        document.addEventListener("DOMContentLoaded", function() {
            flatpickr("#projectDueDate", {
                dateFormat: "Y-m-d",
                minDate: "today",
                allowInput: true,
                defaultDate: new Date().fp_incr(7) 
            });
        });
        </script>
    </div>
</body>
</html>