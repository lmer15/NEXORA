<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facility Settings</title>
    <link rel="stylesheet" href="../CSS_Files/views/settings.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="settings-container">
        <h1 class="settings-title">Facility Settings</h1>
        <div class="settings-intro">
            <p>Manage your facility settings, including security, appearance, and account recovery options.</p>
        </div>
        
        <div class="settings-grid">
            <!-- Security Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-shield-alt"></i>
                    <h2>Security Settings</h2>
                </div>
                <div class="settings-card-body" id="passwordForm">
                    <!-- Current Password Verification -->
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" name="currentPassword" 
                            placeholder="Enter your current password" class="form-control">
                    </div>
                    
                    <!-- New Password Section -->
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" 
                            placeholder="New Password" class="form-control">
                        <small class="form-text text-muted">Minimum 8 characters with at least one number and one special character</small>
                    </div>
                    <div class="form-group">
                        <input type="password" id="confirmNewPassword" name="confirmNewPassword" 
                            placeholder="Confirm New Password" class="form-control">
                    </div>
                </div>
            </div>

            <!-- Recovery Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-key"></i>
                    <h2>Account Recovery</h2>
                </div>
                <div class="settings-card-body" id="recoveryForm">
                    <p class="recovery-description">Set up security questions to recover your account if you forget your password.</p>
                    
                    <div class="form-group">
                        <label for="recoveryQuestion1">Security Question 1</label>
                        <select id="recoveryQuestion1" name="recoveryQuestion1" class="form-control que">
                            <option value="">Select a question</option>
                            <option value="What was your first pet's name?">What was your first pet's name?</option>
                            <option value="What city were you born in?">What city were you born in?</option>
                            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                        </select>
                        <input type="text" id="answer1" name="answer1" placeholder="Your answer" class="form-control mt-2">
                    </div>
                </div>
            </div>

            <!-- Appearance Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-palette"></i>
                    <h2>Appearance</h2>
                </div>
                <div class="settings-card-body">
                    <div class="form-group">
                        <label>Theme</label>
                        <div class="theme-selector">
                            <div class="theme-option light active" data-theme="light">
                                <div class="theme-preview"></div>
                                <span>Light</span>
                            </div>
                            <div class="theme-option dark" data-theme="dark">
                                <div class="theme-preview"></div>
                                <span>Dark</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Danger Zone Card -->
            <div class="settings-card danger">
                <div class="settings-card-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Danger Zone</h2>
                </div>
                <div class="settings-card-body">
                    <div class="danger-item">
                        <h3>Export Facility Data</h3>
                        <p>Download all your facility data as a JSON file</p>
                        <button class="btn btn-outline">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                    </div>
                    <div class="danger-item">
                        <h3>Deactivate Facility</h3>
                        <p>Temporarily disable your facility</p>
                        <button class="btn btn-outline">
                            <i class="fas fa-power-off"></i> Deactivate
                        </button>
                    </div>
                    <div class="danger-item">
                        <h3>Delete Account</h3>
                        <p>Permanently delete your account and all its data</p>
                        <button class="btn btn-danger" id="deleteAccountBtn">
                            <i class="fas fa-trash-alt"></i> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="settings-footer">
            <button class="btn btn-secondary" id="cancelSettingsBtn">Cancel</button>
            <button class="btn btn-primary" id="saveSettingsBtn">Save Changes</button>
        </div>
    </div>

    <script src="../JSFolder/views/settings.js"></script>
</body>
</html>