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
                        <li class="nav-item active" data-view="dashboard">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-table-columns"></i>
                                <span class="nav-item-text">Facility Dashboards</span>
                            </div>
                        </li>
                        <li class="nav-item" data-view="members">
                            <div class="nav-item-left">
                                <i class="fa-solid fa-users"></i>
                                <span class="nav-item-text">Facility Members</span>
                            </div>
                        </li>
                        <li class="nav-item" data-view="settings">
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
                        <li class="nav-item" data-view="project-alpha">
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
                        <li class="nav-item" data-view="project-beta">
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
            
            <div class="right-dashboard" id="dynamic-content">
                <div id="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i> Loading Dashboard...
                </div>
            </div>
        </main>
    </div>

    <script src="../JSFolder/facility.js"></script>
</body>
</html>