<?php
session_start();
header('Content-Type: text/html; charset=UTF-8');

require_once '../config/db.php';
require_once '../Model/ProjectModel.php';

$projectModel = new ProjectModel($conn);
$projectId = $_GET['id'] ?? null;

if (!$projectId) {
    die('Project ID is required');
}

$project = $projectModel->getById($projectId);
if (!$project) {
    die('Project not found');
}

// Check if the user has access to the project
if ($project['owner_id'] !== $_SESSION['user_id']) {
    die('Access denied to this project');
}

// Check if the project is archived
if ($project['status'] === 'archived') {
    die('This project is archived and cannot be viewed.');
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project View</title>
    <link href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <link rel="stylesheet" href="../CSS_Files/views/projectView.css">
</head>
<body data-project-id="<?php echo htmlspecialchars($projectId); ?>">
    <div class="project-view-container">
        <!-- Back button to return to dashboard -->
        <button class="back-to-dashboard">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
        
        <!-- Project Header -->
        <div class="project-header">
            <div class="project-title-container">
                <h1 class="project-title" contenteditable="true"><?php echo htmlspecialchars($project['name']); ?></h1>
                <div class="project-status-badge <?php echo htmlspecialchars($project['status']); ?>">
                    <?php echo ucfirst(htmlspecialchars($project['status'])); ?>
                </div>
            </div>
            
            <div class="project-meta">
                <div class="project-due-date">
                    <i class="far fa-calendar-alt"></i>
                    <span>Due: </span>
                    <input type="text" class="date-picker" value="<?php echo date('M j, Y', strtotime($project['due_date'])); ?>">
                </div>
                <div class="project-priority <?php echo htmlspecialchars($project['priority']); ?>">
                    <?php echo ucfirst(htmlspecialchars($project['priority'])); ?>
                </div>
            </div>
        </div>
        
        <!-- Project Description -->
        <div class="project-description-container">
            <div class="description-header">
                <h3>Description</h3>
                <button class="edit-description-btn">
                    <i class="fas fa-pencil-alt"></i> Edit
                </button>
            </div>
            <div class="project-description" contenteditable="false">
                <?php echo nl2br(htmlspecialchars($project['description'])); ?>
            </div>
        </div>
        
        <!-- View Toggle -->
        <div class="view-toggle">
            <button class="toggle-btn active" data-view="kanban">
                <i class="fas fa-table-columns"></i> Kanban View
            </button>
            <button class="toggle-btn" data-view="calendar">
                <i class="far fa-calendar-alt"></i> Calendar View
            </button>
        </div>
        
        <!-- Kanban View -->
        <div class="kanban-view active-view">
            <div class="categories-container">
                <!-- Categories will be loaded here dynamically -->
                <div class="empty-state" id="noCategoriesMessage">
                    <i class="fas fa-folder-open"></i>
                    <p>No categories yet</p>
                    <button class="btn btn-primary add-category-btn">
                        <i class="fas fa-plus"></i> Add Category
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Calendar View (Hidden by default) -->
        <div class="calendar-view">
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button class="btn btn-outline prev-month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 class="current-month">Month Year</h3>
                    <button class="btn btn-outline next-month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="view-options">
                    <button class="btn btn-outline view-option active" data-view="month">Month</button>
                    <button class="btn btn-outline view-option" data-view="week">Week</button>
                    <button class="btn btn-outline view-option" data-view="day">Day</button>
                </div>
            </div>
            <div class="calendar-grid">
                <!-- Calendar will be rendered here -->
            </div>
        </div>
        
        <!-- Add Category Modal -->
        <div class="modal-overlay" id="addCategoryModal">
            <div class="modal-container small">
                <div class="modal-header">
                    <h3>Add New Category</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    <form id="addCategoryForm">
                        <div class="form-group">
                            <label for="categoryName">Category Name</label>
                            <input type="text" id="categoryName" placeholder="e.g., Design, Development" required>
                        </div>
                        <div class="form-group">
                            <label>Category Color</label>
                            <div class="color-options">
                                <div class="color-preview" id="categoryColorPreview"></div>
                                <input type="color" id="categoryColorPicker" value="#3b82f6">
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-outline cancel-btn">Cancel</button>
                            <button class="btn btn-primary" type="submit">Add Category</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Task Detail Modal -->
        <div class="modal-overlay" id="taskDetailModal">
            <div class="modal-container large">
                <div class="modal-header">
                    <h3 class="task-modal-title">Task Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    <form id="taskDetailForm">
                        <div class="task-detail-grid">
                            <div class="task-main-content">
                                <div class="form-group">
                                    <input type="text" class="task-title-input" placeholder="Task title" required>
                                </div>
                                <div class="form-group">
                                    <label>Description</label>
                                    <div class="rich-text-editor" id="taskDescriptionEditor"></div>
                                </div>
                                <div class="form-group">
                                    <label>Attachments</label>
                                    <div class="attachments-container">
                                        <div class="attachment-list">
                                            <!-- Attachments will be listed here -->
                                        </div>
                                        <div class="attachment-upload">
                                            <input type="file" id="taskAttachment" multiple style="display: none;">
                                            <button type="button" class="btn btn-outline upload-btn">
                                                <i class="fas fa-paperclip"></i> Add Attachment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Comments</label>
                                    <div class="comments-container">
                                        <div class="comment-list">
                                            <!-- Comments will be listed here -->
                                        </div>
                                        <div class="comment-input">
                                            <textarea placeholder="Add a comment..." rows="3"></textarea>
                                            <button type="button" class="btn btn-primary post-comment-btn">
                                                Post Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="task-sidebar">
                                <div class="form-group">
                                    <label>Status</label>
                                    <select class="task-status-select">
                                        <option value="todo">To Do</option>
                                        <option value="progress">In Progress</option>
                                        <option value="done">Done</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Assignee</label>
                                    <select class="task-assignee-select">
                                        <option value="">Unassigned</option>
                                        <!-- Team members will be populated here -->
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Due Date</label>
                                    <input type="text" class="task-due-date-picker">
                                </div>
                                <div class="form-group">
                                    <label>Priority</label>
                                    <select class="task-priority-select">
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Category</label>
                                    <select class="task-category-select">
                                        <!-- Categories will be populated here -->
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Activity</label>
                                    <div class="activity-log">
                                        <!-- Activity logs will be shown here -->
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button type="button" class="btn btn-outline delete-task-btn">
                                        <i class="fas fa-trash"></i> Delete Task
                                    </button>
                                    <button type="submit" class="btn btn-primary save-task-btn">
                                        <i class="fas fa-save"></i> Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <script src="../JSFolder/projectView.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script>
    // Initialize date pickers
    document.addEventListener("DOMContentLoaded", function() {
        flatpickr(".date-picker", {
            dateFormat: "M j, Y",
            allowInput: true
        });
        
        flatpickr(".task-due-date-picker", {
            dateFormat: "M j, Y",
            allowInput: true
        });
    });
    </script>
</body>
</html>
