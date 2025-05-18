<?php
session_start();
header('Content-Type: text/html; charset=UTF-8');

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

require_once '../config/db.php';
require_once '../Model/ProjectModel.php';

$stmt = $conn->prepare("
    SELECT DISTINCT p.*, u.name as owner_name
    FROM projects p
    JOIN tasks t ON t.project_id = p.id
    JOIN users u ON p.owner_id = u.id
    WHERE t.assignee_id = :user_id
    AND (p.is_archived IS NULL OR p.is_archived = 0)
");

$projectId = $_GET['id'] ?? null;
if (!$projectId) die('Project ID is required');

$projectModel = new ProjectModel($conn);
$project = $projectModel->getById($projectId);
if (!$project) die('Project not found');

// Check access
if ($project['owner_id'] !== $_SESSION['user_id']) die('Access denied');
if ($project['status'] === 'archived') die('This project is archived');

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="csrf-token" content="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '') ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project View - <?= htmlspecialchars($project['name']) ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css">
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet">
    <link rel="stylesheet" href="../CSS_Files/views/projectView.css">
</head>
<body data-project-id="<?= htmlspecialchars($projectId) ?>" data-user-id="<?= $_SESSION['user_id'] ?>">
    <div class="project-view-container">
        <header class="project-header">
            <button class="back-to-dashboard" aria-label="Back to Dashboard">
                <i class="fas fa-arrow-left"></i> Dashboard
            </button>
            <div class="project-title-container">
                <h1 class="project-title" contenteditable="true" aria-label="Project Title">
                    <?= htmlspecialchars($project['name']) ?>
                </h1>
            </div>
            <div class="project-meta">
                <div class="project-due-date">
                    <i class="far fa-calendar-alt" aria-hidden="true"></i>
                    <input type="text" class="date-picker" 
                           value="<?= date('M j, Y', strtotime($project['due_date'])) ?>" 
                           aria-label="Project Due Date">
                </div>
                <span class="project-priority <?= htmlspecialchars($project['priority']) ?>" role="status">
                    <?= ucfirst(htmlspecialchars($project['priority'])) ?>
                </span>
            </div>
        </header>

        <section class="project-description-container">
            <div class="description-header">
                <h2>Description</h2>
                <button class="edit-description-btn" aria-label="Edit Description">
                    <i class="fas fa-pencil-alt"></i> Edit
                </button>
            </div>
            <div class="project-description" contenteditable="false" role="textbox">
                <?= nl2br(htmlspecialchars($project['description'])) ?>
            </div>
        </section>

        <nav class="view-toolbar" role="navigation">
            <div class="view-toggle">
                <button class="toggle-btn active" data-view="kanban" aria-label="Kanban View" role="tab">
                    <i class="fas fa-table-columns"></i> Kanban
                </button>
                <button class="toggle-btn" data-view="calendar" aria-label="Calendar View" role="tab">
                    <i class="far fa-calendar-alt"></i> Calendar
                </button>
            </div>
            <div class="tasks-toolbar">
                <input type="text" id="taskSearchInput" class="tasks-searchbar" placeholder="Search tasks...">
                <button class="filter-btn" id="taskFilterBtn" aria-label="Filter">
                    <i class="fas fa-sliders-h"></i>
                </button>
                <div class="filter-dropdown" id="filterDropdown" style="display:none;">
                    <div class="filter-group">
                        <label for="statusFilter">Status</label>
                        <select id="statusFilter">
                            <option value="all">All</option>
                            <option value="todo">To Do</option>
                            <option value="progress">In Progress</option>
                            <option value="done">Done</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="priorityFilter">Priority</label>
                        <select id="priorityFilter">
                            <option value="all">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" id="applyFilterBtn">Apply</button>
                </div>
            </div>
        </nav>

        <main class="kanban-view active-view" role="main">
            <div class="categories-container">
                <div class="empty-state" id="noCategoriesMessage">
                    <i class="fas fa-folder-open" aria-hidden="true"></i>
                    <p>No categories yet</p>
                </div>
            </div>
        </main>

        <section class="calendar-view" role="region">
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="calendar-nav-btn prev-month"><i class="fas fa-chevron-left"></i></button>
                    <h3 class="calendar-month-year">Month Year</h3>
                    <button class="calendar-nav-btn next-month"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="calendar-grid">
                    <!-- Calendar will be populated dynamically -->
                </div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-color high"></span>
                        <span>High Priority</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color medium"></span>
                        <span>Medium Priority</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color low"></span>
                        <span>Low Priority</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.min.js"></script>
    <script defer src="../JSFolder/facility.js"></script>
</body>
</html>