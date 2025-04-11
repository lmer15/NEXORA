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
                                <button class="btn btn-primary to-do new-project-btn">
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
                                <button class="btn btn-primary progress new-project-btn">
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
                                <button class="btn btn-primary done new-project-btn">
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
                                        <input type="text" id="projectDueDate" class="date-picker-input" placeholder="Select date" readonly>
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
                    </form>
                </div>
                
                <div class="form-footer">
                    <button type="button" class="btn btn-outline" id="cancelFormBtn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="submit" form="projectForm" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> Create Project
                    </button>
                </div>
            </div>
        </div>
    </div>
   <script src="../JSFolder/facility.js"></script>

</body>
</html>