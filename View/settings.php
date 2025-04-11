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
            <!-- General Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-cog"></i>
                    <h2>General Settings</h2>
                </div>
                <div class="settings-card-body">
                    <div class="form-group">
                        <label for="facilityName">Facility Name</label>
                        <input type="text" id="facilityName" value="My Facility" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="timezone">Timezone</label>
                        <select id="timezone" class="form-control">
                            <option value="UTC">UTC</option>
                            <option value="EST" selected>Eastern Time (EST)</option>
                            <option value="PST">Pacific Time (PST)</option>
                            <option value="CST">Central Time (CST)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dateFormat">Date Format</label>
                        <select id="dateFormat" class="form-control">
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Notification Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-bell"></i>
                    <h2>Notification Settings</h2>
                </div>
                <div class="settings-card-body">
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" checked="checked">
                            <span class="checkmark"></span>
                            Email Notifications
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" checked="checked">
                            <span class="checkmark"></span>
                            Push Notifications
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox">
                            <span class="checkmark"></span>
                            Desktop Notifications
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Notification Frequency</label>
                        <div class="radio-group">
                            <label class="radio-container">
                                <input type="radio" name="frequency" checked="checked">
                                <span class="radiomark"></span>
                                Immediately
                            </label>
                            <label class="radio-container">
                                <input type="radio" name="frequency">
                                <span class="radiomark"></span>
                                Daily Digest
                            </label>
                            <label class="radio-container">
                                <input type="radio" name="frequency">
                                <span class="radiomark"></span>
                                Weekly Summary
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Security Settings Card -->
            <div class="settings-card">
                <div class="settings-card-header">
                    <i class="fas fa-shield-alt"></i>
                    <h2>Security Settings</h2>
                </div>
                <div class="settings-card-body">
                    <div class="form-group">
                        <label for="password">Change Password</label>
                        <input type="password" id="password" placeholder="New Password" class="form-control">
                    </div>
                    <div class="form-group">
                        <input type="password" id="confirmPassword" placeholder="Confirm Password" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" checked="checked">
                            <span class="checkmark"></span>
                            Two-Factor Authentication
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox">
                            <span class="checkmark"></span>
                            Require re-authentication for sensitive actions
                        </label>
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
                            <div class="theme-option system" data-theme="system">
                                <div class="theme-preview"></div>
                                <span>System</span>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Primary Color</label>
                        <div class="color-palette">
                            <div class="color-option" data-color="#06a566" style="background-color: #06a566;"></div>
                            <div class="color-option" data-color="#3b82f6" style="background-color: #3b82f6;"></div>
                            <div class="color-option" data-color="#8b5cf6" style="background-color: #8b5cf6;"></div>
                            <div class="color-option" data-color="#ec4899" style="background-color: #ec4899;"></div>
                            <div class="color-option" data-color="#f59e0b" style="background-color: #f59e0b;"></div>
                            <div class="color-option" data-color="#ef4444" style="background-color: #ef4444;"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" checked="checked">
                            <span class="checkmark"></span>
                            Compact Mode
                        </label>
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