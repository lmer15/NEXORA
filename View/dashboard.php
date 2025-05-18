<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facility Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../CSS_Files/views/dashboard.css">
</head>
<body>
    <div class="dashboard-view">
        <div class="dashboard-header">
            <h1 class="dashboard-title">Facility Dashboard</h1>
            <div class="searchbar">
                <input type="text" placeholder="Search facilities, projects...">
            </div>
            <div class="dashboard-filters">
                <select class="filter-select" id="dashboardProjectFilter">
                    <option value="all">All Projects</option>
                    <option value="active">Active Projects</option>
                    <option value="completed">Completed Projects</option>
                </select>
            </div>
            <div class="dashboard-actions">
                <button class="btn btn-outline">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn btn-primary new-project-btn">
                    <i class="fas fa-plus"></i> New Project
                </button>
            </div>
        </div>
        
        <div class="dashboard-scroll-container">
            <div class="dashboard-content">
                <!-- Main Kanban Board -->
                <div id="main-kanban" class="kanban-board">
                    <h2><i class="fas fa-table-columns"></i> Project Status</h2>
                    <div class="kanban-container">
                        <!-- TO DO -->
                        <div class="kanban-column" data-status="todo">
                            <div class="column-header">
                                <span>To Do</span>
                                <span class="project-quantity">0</span>
                            </div>
                            <div class="column-content">
                                <!-- New Project button should be inside column-content -->
                                <button class="new-project-btn btn btn-primary">
                                    <i class="fas fa-plus"></i> New Project
                                </button>
                            </div>
                        </div>
                        
                        <!-- IN PROGRESS -->
                        <div class="kanban-column" data-status="progress">
                            <div class="column-header">
                                <span>In Progress</span>
                                <span class="project-quantity">0</span>
                            </div>
                            <div class="column-content">
                                <button class="new-project-btn btn btn-primary">
                                    <i class="fas fa-plus"></i> New Project
                                </button>
                            </div>
                        </div>
                        
                        <!-- DONE -->
                        <div class="kanban-column" data-status="done">
                            <div class="column-header">
                                <span>Done</span>
                                <span class="project-quantity">0</span>
                            </div>
                            <div class="column-content">
                                <button class="new-project-btn btn btn-primary">
                                    <i class="fas fa-plus"></i> New Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Joined Projects Kanban Board -->
                <div id="joined-kanban" class="kanban-board">
                    <h2><i class="fas fa-users"></i> Joined Projects</h2>
                    <div class="kanban-container">
                        <div class="kanban-column" data-status="todo">
                            <div class="column-header">
                                <span>To Do</span>
                                <span class="project-quantity">0</span>
                            </div>
                            <div class="column-content"></div>
                        </div>
                        <div class="kanban-column" data-status="progress">
                            <div class="column-header">
                                <span>In Progress</span>
                                <span class="project-quantity">0</span>
                            </div>
                            <div class="column-content"></div>
                        </div>
                        <div class="kanban-column" data-status="done">
                            <div class="column-header">
                                <span>Done</span>
                                <span class="project-quantity">0</span>
                            </div>
                            <div class="column-content"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="../JSFolder/facility.js"></script>
</body>
</html>