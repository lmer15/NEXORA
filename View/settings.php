<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facility Settings</title>
    <link rel="stylesheet" href="default.css">
    <link rel="stylesheet" href="../CSS_Files/views/settings.css">
</head>
<body>
    <div class="settings-container">
        <h1 class="settings-title">Facility Settings</h1>
        
        <div class="settings-grid">
            <!-- Security Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-shield-alt"></i>
                    <h2>Security Settings</h2>
                </div>
                <div class="settings-card-body">
                    <!-- Current Password Verification -->
                    <div class="form-group">
                        <label for="currentPassword">Current Password</label>
                        <input type="password" id="currentPassword" name="currentPassword" 
                            placeholder="Enter your current password" class="form-control" required>
                    </div>
                    
                    <!-- New Password Section -->
                    <div class="form-group">
                        <label for="newPassword">New Password</label>
                        <input type="password" id="newPassword" name="newPassword" 
                            placeholder="New Password" class="form-control" required>
                        <small class="form-text text-muted">Minimum 8 characters with at least one number and one special character</small>
                    </div>
                    <div class="form-group">
                        <input type="password" id="confirmNewPassword" name="confirmNewPassword" 
                            placeholder="Confirm New Password" class="form-control" required>
                    </div>
                    
                    <!-- Security Options -->
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" name="twoFactorAuth" checked="checked">
                            <span class="checkmark"></span>
                            Two-Factor Authentication
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" name="reAuthSensitive">
                            <span class="checkmark"></span>
                            Require re-authentication for sensitive actions
                        </label>
                    </div>
                </div>
            </div>

            <!-- Recovery Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-key"></i>
                    <h2>Account Recovery</h2>
                </div>
                <div class="settings-card-body">
                    <p class="recovery-description">Set up security questions to recover your account if you forget your password.</p>
                    
                    <div class="form-group">
                        <label for="recoveryQuestion1">Security Question 1</label>
                        <select id="recoveryQuestion1" name="recoveryQuestion1" class="form-control que" required>
                            <option value="">Select a question</option>
                            <option value="What was your first pet's name?">What was your first pet's name?</option>
                            <option value="What city were you born in?">What city were you born in?</option>
                            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                        </select>
                        <input type="text" id="answer1" name="answer1" placeholder="Your answer" class="form-control mt-2" required>
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
            <d iv class="settings-card danger">
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
                        <h3>Delete Facility</h3>
                        <p>Permanently delete your facility and all its data</p>
                        <button class="btn btn-danger">
                            <i class="fas fa-trash-alt"></i> Delete Facility
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="settings-footer">
            <button class="btn btn-secondary">Cancel</button>
            <button class="btn btn-primary">Save Changes</button>
        </div>
    </div>

    <script src="../JSFolder/views/settings.js"></script>
</body>
</html>