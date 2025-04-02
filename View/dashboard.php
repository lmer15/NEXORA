<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facility Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

</head>
<body>
    <div class="dashboard-view">
        <div class="dashboard-header">
            <h1 class="dashboard-title">Facility Dashboard</h1>
            <div class="dashboard-actions">
                <button class="btn btn-outline">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn btn-primary">
                    <i class="fas fa-plus"></i> New Project
                </button>
            </div>
        </div>
        
        <div class="dashboard-scroll-container">
            <div class="dashboard-content">
                <div class="kanban-board">
                    <h2><i class="fas fa-table-columns"></i> Project Status</h2>
                    <div class="kanban-container">
                        <!-- TO DO -->
                        <div class="kanban-column" data-status="todo">
                            <div class="column-header">
                                <span>To Do</span>
                                <span class="project-quantity">2</span>
                            </div>
                            <div class="column-content">
                                <button class="btn btn-primary to-do">
                                    <i class="fas fa-plus"></i> New Project
                                </button>
                                <div class="kanban-task">
                                    <div class="task-header">
                                        <span class="task-priority high">High</span>
                                        <div class="task-actions">
                                            <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                                        </div>
                                    </div>
                                    <h3 class="task-title">Facility Maintenance System Upgrade</h3>
                                    <p class="task-description">Upgrade the maintenance tracking system to support new equipment types.</p>
                                    
                                    <div class="task-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 65%"></div>
                                        </div>
                                        <span class="progress-text">65% complete</span>
                                    </div>
                                    
                                    <div class="task-footer">
                                        <div class="task-dates">
                                            <span class="task-date"><i class="far fa-calendar"></i> May 15</span>
                                        </div>
                                        <div class="task-assignees">
                                            <div class="assignee-avatar" data-tooltip="John Doe">
                                                <img src="https://i.pravatar.cc/150?img=1" alt="JD">
                                            </div>
                                            <div class="assignee-avatar" data-tooltip="Sarah Miller">
                                                <img src="https://i.pravatar.cc/150?img=2" alt="SM">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="kanban-task">
                                    <div class="task-header">
                                        <span class="task-priority medium">Medium</span>
                                        <div class="task-actions">
                                            <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                                        </div>
                                    </div>
                                    <h3 class="task-title">Parking Lot Repaving</h3>
                                    <p class="task-description">Resurface and repaint all parking areas in the north lot.</p>
                                    
                                    <div class="task-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 30%"></div>
                                        </div>
                                        <span class="progress-text">30% complete</span>
                                    </div>
                                    
                                    <div class="task-footer">
                                        <div class="task-dates">
                                            <span class="task-date"><i class="far fa-calendar"></i> Jun 3</span>
                                        </div>
                                        <div class="task-assignees">
                                            <div class="assignee-avatar" data-tooltip="Mike Johnson">
                                                <img src="https://i.pravatar.cc/150?img=3" alt="MJ">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- PROGRESS -->
                        <div class="kanban-column" data-status="progress">
                            <div class="column-header">
                                <span>In Progress</span>
                                <span class="project-quantity">1</span>
                            </div>
                            <div class="column-content">
                                <button class="btn btn-primary progress">
                                    <i class="fas fa-plus"></i> New Project
                                </button>
                                <div class="kanban-task">
                                    <div class="task-header">
                                        <span class="task-priority high">High</span>
                                        <div class="task-actions">
                                            <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                                        </div>
                                    </div>
                                    <h3 class="task-title">HVAC System Maintenance</h3>
                                    <p class="task-description">Seasonal maintenance for all building HVAC units.</p>
                                    
                                    <div class="task-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 80%"></div>
                                        </div>
                                        <span class="progress-text">80% complete</span>
                                    </div>
                                    
                                    <div class="task-footer">
                                        <div class="task-dates">
                                            <span class="task-date"><i class="far fa-calendar"></i> Apr 28</span>
                                        </div>
                                        <div class="task-assignees">
                                            <div class="assignee-avatar" data-tooltip="Alex Chen">
                                                <img src="https://i.pravatar.cc/150?img=4" alt="AC">
                                            </div>
                                            <div class="assignee-avatar" data-tooltip="Taylor Swift">
                                                <img src="https://i.pravatar.cc/150?img=5" alt="TS">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- DONE -->
                        <div class="kanban-column" data-status="done">
                            <div class="column-header">
                                <span>Done</span>
                                <span class="project-quantity">1</span>
                            </div>
                            <div class="column-content">
                                <button class="btn btn-primary done">
                                    <i class="fas fa-plus"></i> New Project
                                </button>
                                <div class="kanban-task">
                                    <div class="task-header">
                                        <span class="task-priority low">Low</span>
                                        <div class="task-actions">
                                            <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                                        </div>
                                    </div>
                                    <h3 class="task-title">Light Bulb Replacement</h3>
                                    <p class="task-description">Replace all fluorescent bulbs with LED in west wing.</p>
                                    
                                    <div class="task-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 100%"></div>
                                        </div>
                                        <span class="progress-text">Completed</span>
                                    </div>
                                    
                                    <div class="task-footer">
                                        <div class="task-dates">
                                            <span class="task-date"><i class="fas fa-check-circle"></i> Apr 15</span>
                                        </div>
                                        <div class="task-assignees">
                                            <div class="assignee-avatar" data-tooltip="Jamie Smith">
                                                <img src="https://i.pravatar.cc/150?img=6" alt="JS">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>