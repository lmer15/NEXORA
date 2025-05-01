
function initProjectView() {
    const projectId = document.body.dataset.projectId;
    if (!projectId) {
        console.error('No project ID found');
        return;
    }

    loadCategories();
    setupModalCloseHandlers();
}

document.addEventListener("DOMContentLoaded", function() {
    // Initialize variables
    const projectId = document.body.dataset.projectId;
    let currentView = 'kanban';
    let currentDate = new Date();
    
    // DOM elements
    const backButton = document.querySelector('.back-to-dashboard');
    const projectTitle = document.querySelector('.project-title');
    const projectDueDate = document.querySelector('.project-due-date input');
    const projectDescription = document.querySelector('.project-description');
    const editDescriptionBtn = document.querySelector('.edit-description-btn');
    const viewToggleButtons = document.querySelectorAll('.toggle-btn');
    const kanbanView = document.querySelector('.kanban-view');
    const calendarView = document.querySelector('.calendar-view');
    const categoriesContainer = document.querySelector('.categories-container');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    const addCategoryBtn = document.querySelector('.add-category-btn');
    const addCategoryModal = document.getElementById('addCategoryModal');
    const addCategoryForm = document.getElementById('addCategoryForm');
    const taskDetailModal = document.getElementById('taskDetailModal');
    
    // Event listeners
    backButton.addEventListener('click', () => {
        window.location.href = '../View/dashboard.php';
    });
    
    initProjectView();
    
    // View toggle functionality
    viewToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewToggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentView = button.dataset.view;
            
            kanbanView.classList.remove('active-view');
            calendarView.classList.remove('active-view');
            
            if (currentView === 'kanban') {
                kanbanView.classList.add('active-view');
                loadCategories();
            } else {
                calendarView.classList.add('active-view');
                renderCalendar();
            }
        });
    });
    
    // Project title edit
    projectTitle.addEventListener('blur', () => {
        updateProjectField('name', projectTitle.textContent);
    });
    
    // Project due date edit
    projectDueDate.addEventListener('change', () => {
        updateProjectField('due_date', projectDueDate.value);
    });
    
    // Project description edit
    editDescriptionBtn.addEventListener('click', () => {
        const isEditable = projectDescription.getAttribute('contenteditable') === 'true';
        
        if (isEditable) {
            projectDescription.setAttribute('contenteditable', 'false');
            editDescriptionBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';
            updateProjectField('description', projectDescription.textContent);
        } else {
            projectDescription.setAttribute('contenteditable', 'true');
            projectDescription.focus();
            editDescriptionBtn.innerHTML = '<i class="fas fa-check"></i> Save';
        }
    });
    
    // Add category button
    addCategoryBtn.addEventListener('click', () => {
        addCategoryModal.style.display = 'flex';
        setTimeout(() => {
            addCategoryModal.classList.add('show');
        }, 10);
    });
    
    // Add category form submission
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const categoryName = document.getElementById('categoryName').value;
        const categoryColor = document.getElementById('categoryColorPicker').value;
        
        try {
            const response = await fetch(`../Controller/projectController.php?action=addCategory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    name: categoryName,
                    color: categoryColor
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                closeModal(addCategoryModal);
                loadCategories();
            } else {
                throw new Error(data.message || 'Failed to add category');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorNotification(error.message);
        }
    });
    
    // Load categories and tasks
    async function loadCategories() {
        try {
            const response = await fetch(`../Controller/projectController.php?action=getCategories&projectId=${projectId}`);
            const data = await response.json();
            
            if (data.success && data.categories.length > 0) {
                noCategoriesMessage.style.display = 'none';
                renderCategories(data.categories);
            } else {
                noCategoriesMessage.style.display = 'flex';
                categoriesContainer.innerHTML = '';
                categoriesContainer.appendChild(noCategoriesMessage);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            showErrorNotification('Failed to load categories');
        }
    }
    
    // Render categories in kanban view
    function renderCategories(categories) {
        categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
            const categoryColumn = document.createElement('div');
            categoryColumn.className = 'category-column';
            categoryColumn.dataset.categoryId = category.id;
            
            categoryColumn.innerHTML = `
                <div class="category-header">
                    <h3 class="category-title">
                        <span class="category-color" style="background-color: ${category.color}"></span>
                        ${category.name}
                    </h3>
                    <div class="category-actions">
                        <button class="category-action-btn edit-category-btn" title="Edit category">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                <div class="task-list" id="task-list-${category.id}">
                    ${category.tasks.map(task => renderTask(task)).join('')}
                </div>
                <button class="add-task-btn" data-category-id="${category.id}">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            `;
            
            categoriesContainer.appendChild(categoryColumn);
            
            // Make task list sortable
            new Sortable(document.getElementById(`task-list-${category.id}`), {
                group: 'shared',
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function(evt) {
                    const taskId = evt.item.dataset.taskId;
                    const newCategoryId = evt.to.parentElement.dataset.categoryId;
                    const newPosition = evt.newIndex;
                    
                    updateTaskPosition(taskId, newCategoryId, newPosition);
                }
            });
        });
        
        // Add event listeners to tasks
        document.querySelectorAll('.task-card').forEach(task => {
            task.addEventListener('click', () => {
                openTaskDetailModal(task.dataset.taskId);
            });
        });
        
        // Add event listeners to add task buttons
        document.querySelectorAll('.add-task-btn').forEach(button => {
            button.addEventListener('click', () => {
                const categoryId = button.dataset.categoryId;
                createNewTask(categoryId);
            });
        });
    }
    
    // Render a single task
    function renderTask(task) {
        return `
            <div class="task-card ${task.priority}-priority" data-task-id="${task.id}">
                <h4 class="task-title">${escapeHtml(task.title)}</h4>
                <div class="task-meta">
                    <span>${task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}</span>
                    <span>${task.assignee_name || 'Unassigned'}</span>
                </div>
            </div>
        `;
    }
    
    // Update project field
    async function updateProjectField(field, value) {
        try {
            const response = await fetch(`../Controller/projectController.php?action=updateProject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    field,
                    value
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to update project');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorNotification(error.message);
        }
    }
    
    // Update task position
    async function updateTaskPosition(taskId, categoryId, position) {
        try {
            const response = await fetch(`../Controller/projectController.php?action=updateTaskPosition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId,
                    categoryId,
                    position
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to update task position');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorNotification(error.message);
        }
    }
    
    // Create new task
    async function createNewTask(categoryId) {
        try {
            const response = await fetch(`../Controller/projectController.php?action=createTask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId,
                    categoryId,
                    title: 'New Task',
                    description: '',
                    status: 'todo'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                loadCategories();
                openTaskDetailModal(data.taskId);
            } else {
                throw new Error(data.message || 'Failed to create task');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorNotification(error.message);
        }
    }
    
    // Open task detail modal
    async function openTaskDetailModal(taskId) {
        try {
            const response = await fetch(`../Controller/projectController.php?action=getTask&taskId=${taskId}`);
            const data = await response.json();
            
            if (data.success) {
                renderTaskDetailModal(data.task);
                taskDetailModal.style.display = 'flex';
                setTimeout(() => {
                    taskDetailModal.classList.add('show');
                }, 10);
            } else {
                throw new Error(data.message || 'Failed to load task details');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorNotification(error.message);
        }
    }
    
    // Render task detail modal
    function renderTaskDetailModal(task) {
        // This would populate all the fields in the task detail modal
        // Implementation depends on your specific UI requirements
    }
    
    // Render calendar view
    function renderCalendar() {
        // Implementation for calendar view
    }
    
    // Helper functions
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    function setupModalCloseHandlers() {
        document.querySelectorAll('.modal-close, .cancel-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                closeModal(modal);
            });
        });
        
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
    }
    
    function showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    function showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
});