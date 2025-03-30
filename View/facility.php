<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEXORA FACILITY DASHBOARD</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../CSS_Files/facility.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo-container">
                <img src="../Images/Logo.png" alt="Nexora Facility Logo">
                <span class="logo-text">NEXORA</span>
            </div>
            <div class="searchbar">
                <input type="text" placeholder="Search facilities, projects...">
            </div>
            <div class="profile">
                <div class="profile-info">
                    <div class="profile-name">Elmer Rapon</div>
                    <div class="profile-role">Facility Admin</div>
                </div>
                <img src="../Images/profile.jpg" alt="Profile picture" class="profile-pic">
            </div>
        </header>

        <main class="content">
            <nav class="left-navigator">
                <div class="nav-section">
                    <div class="nav-title">Nexora Facility</div>
                    <ul class="nav-list">
                        <li class="nav-item active">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-table-columns"></i>
                                <span class="nav-item-text">Facility Dashboards</span>
                            </div>
                        </li>
                        <li class="nav-item">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-users"></i>
                                <span class="nav-item-text">Facility Members</span>
                            </div>
                        </li>
                        <li class="nav-item">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-gear"></i>
                                <span class="nav-item-text">Facility Settings</span>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section">
                    <div class="nav-title">Your Projects <i class="fa-solid fa-plus"></i></div>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-diagram-project"></i>
                                <span class="nav-item-text">Project Alpha</span>
                            </div>
                            <div class="nav-item-actions">
                                <i class="fa-solid fa-ellipsis"></i>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="nav-section bottom-nav">
                    <div class="nav-title">Joined Facility</div>
                    <ul class="nav-list">
                        <li class="nav-item">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-diagram-project"></i>
                                <span class="nav-item-text">Project Beta</span>
                            </div>
                            <div class="nav-item-actions">
                                <i class="fa-solid fa-ellipsis"></i>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <div class="right-dashboard">
                <div class="dashboard-header">
                    <h1 class="dashboard-title">Facility Dashboard</h1>
                    <div class="dashboard-actions">
                        <button class="btn btn-outline">
                            <i class="fa-solid fa-download"></i> Export
                        </button>
                        <button class="btn btn-primary">
                            <i class="fa-solid fa-plus"></i> New Project
                        </button>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <h2>Welcome to Nexora Facility Management</h2>
                    <p>Here you can manage all your facility projects, members, and settings.</p>
                    
                    <!-- Dashboard widgets would go here -->
                    <div style="margin-top: 24px; padding: 16px; background: var(--primary-light); border-radius: 6px;">
                        <h3 style="color: var(--primary); margin-bottom: 12px;">Quick Actions</h3>
                        <div style="display: flex; gap: 16px;">
                            <button class="btn btn-outline" style="flex: 1;">
                                <i class="fa-solid fa-user-plus"></i> Add Member
                            </button>
                            <button class="btn btn-outline" style="flex: 1;">
                                <i class="fa-solid fa-file-import"></i> Import Data
                            </button>
                            <button class="btn btn-outline" style="flex: 1;">
                                <i class="fa-solid fa-chart-line"></i> View Reports
                            </button>
                        </div>
                    </div>
                </div>




                <div class="dashboard-footer">
                    <p>&copy; 2023 Nexora Facility. All rights reserved.</p>
                </div>
        </main>
    </div>

    <script>
        // Mobile navigation toggle would go here
        document.addEventListener('DOMContentLoaded', function() {
            // This is where you'd add JavaScript for interactive elements
            console.log('Dashboard loaded');
        });
    </script>
</body>
</html>