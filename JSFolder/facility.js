document.addEventListener("DOMContentLoaded", function () {
    // Load Pikaday first
    loadPikaday().then(() => {
        // Now initialize everything else
        initMainApp();
    });

    function loadPikaday() {
        return new Promise((resolve) => {
            if (typeof Pikaday !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/pikaday/pikaday.js';
            script.onload = resolve;
            document.head.appendChild(script);

            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css';
            document.head.appendChild(css);
        });
    }

    function initMainApp() {
        const navItems = document.querySelectorAll(".nav-item");
        const contentContainer = document.getElementById("dynamic-content");

        function loadPage(file) {
            contentContainer.innerHTML = `<div class="loading-container"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
        
            fetch(file)
                .then(response => response.text())
                .then(html => {
                    contentContainer.innerHTML = html;
                    if (file.includes('dashboard.php')) {
                        initProjectForm();
                        enhanceDashboardUI();
                    }
                    if (file.includes('members.php')) {
                        handleMembersPage();
                    }
                })
                .catch(error => {
                    contentContainer.innerHTML = `<p class="error-message">Error loading page. Please try again.</p>`;
                    console.error("Error loading the page:", error);
                });
        }

        function handleMembersPage() {
            // Invite modal functionality
            const inviteBtn = document.querySelector('.invite-btn');
            const inviteModal = document.getElementById('inviteModal');
            const inviteModalClose = inviteModal.querySelector('.modal-close');
            
            if (inviteBtn && inviteModal) {
                inviteBtn.addEventListener('click', () => {
                    inviteModal.style.display = 'flex';
                    setTimeout(() => {
                        inviteModal.classList.add('show');
                    }, 10);
                });
                
                inviteModalClose.addEventListener('click', () => {
                    inviteModal.classList.remove('show');
                    setTimeout(() => {
                        inviteModal.style.display = 'none';
                    }, 300);
                });
            }
            
            // Copy invite link functionality
            const copyBtn = document.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const inviteLink = document.querySelector('.invite-link');
                    navigator.clipboard.writeText(inviteLink.value);
                    showNotification('Invite link copied to clipboard!', 'success');
                });
            }
            
            // Confirmation modal for member actions
            const actionButtons = document.querySelectorAll('.btn-icon.danger, .btn-icon[title*="Make Admin"], .btn-icon[title*="Revoke Admin"]');
            const confirmModal = document.getElementById('confirmModal');
            
            if (actionButtons.length && confirmModal) {
                const confirmModalClose = confirmModal.querySelector('.modal-close');
                const cancelBtn = confirmModal.querySelector('.cancel-btn');
                const confirmBtn = confirmModal.querySelector('.confirm-btn');
                
                actionButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        // Set appropriate message based on action
                        const isRemove = btn.classList.contains('danger');
                        const isMakeAdmin = btn.getAttribute('title')?.includes('Make Admin');
                        const isRevokeAdmin = btn.getAttribute('title')?.includes('Revoke Admin');
                        
                        let message = 'Are you sure?';
                        if (isRemove) message = 'Are you sure you want to remove this member?';
                        if (isMakeAdmin) message = 'Are you sure you want to make this member an admin?';
                        if (isRevokeAdmin) message = 'Are you sure you want to revoke admin privileges?';
                        
                        document.getElementById('confirmMessage').textContent = message;
                        
                        confirmModal.style.display = 'flex';
                        setTimeout(() => {
                            confirmModal.classList.add('show');
                        }, 10);
                        
                        // Store the clicked button for later reference
                        confirmModal.dataset.source = Array.from(btn.classList).join(' ');
                    });
                });
                
                const closeConfirmModal = () => {
                    confirmModal.classList.remove('show');
                    setTimeout(() => {
                        confirmModal.style.display = 'none';
                    }, 300);
                };
                
                confirmModalClose.addEventListener('click', closeConfirmModal);
                cancelBtn.addEventListener('click', closeConfirmModal);
                
                confirmBtn.addEventListener('click', () => {
                    // Here you would handle the actual action (remove/make admin/etc.)
                    // For now, just show a notification
                    const source = confirmModal.dataset.source;
                    let message = 'Action completed';
                    
                    if (source.includes('danger')) {
                        message = 'Member removed successfully';
                    } else if (source.includes('fa-crown')) {
                        message = 'Admin privileges granted';
                    } else if (source.includes('fa-user-shield')) {
                        message = 'Admin privileges revoked';
                    }
                    
                    showNotification(message, 'success');
                    closeConfirmModal();
                });
            }
            
            // Regenerate facility code
            const regenerateBtn = document.querySelector('.regenerate-btn');
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => {
                    // Generate a random facility code
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                    let code = '';
                    for (let i = 0; i < 8; i++) {
                        code += chars.charAt(Math.floor(Math.random() * chars.length));
                        if (i === 3) code += '-';
                    }
                    
                    document.querySelector('.code-value').textContent = code;
                    document.querySelector('.invite-link').value = `https://facility.example.com/join/${code}`;
                    showNotification('Facility code regenerated!', 'success');
                });
            }

            function setupCopyButton(button, textToCopy, successMessage) {
                if (!button) return;
                
                const copyTextElement = button.querySelector('.copy-code-text') || button.querySelector('.copy-text');
                
                button.addEventListener('click', () => {
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => {
                            // Change to "Copied!" temporarily
                            if (copyTextElement) {
                                copyTextElement.textContent = 'Copied!';
                                button.classList.add('copied');
                                
                                // Revert back after 2 seconds
                                setTimeout(() => {
                                    copyTextElement.textContent = 'Copy';
                                    button.classList.remove('copied');
                                }, 2000);
                            }
                            
                            showNotification(successMessage, 'success');
                        })
                        .catch(err => {
                            console.error('Failed to copy: ', err);
                            showNotification('Failed to copy', 'error');
                        });
                });
            }
        
            // Setup facility code copy button
            const copyCodeBtn = document.querySelector('.code-display .copy-code-btn');
            if (copyCodeBtn) {
                setupCopyButton(
                    copyCodeBtn,
                    document.querySelector('.code-value').textContent,
                    'Facility code copied to clipboard!'
                );
            }
        
            // Setup invite link copy button
            const copyInviteBtn = document.querySelector('.invite-link-container .copy-code-btn');
            if (copyInviteBtn) {
                setupCopyButton(
                    copyInviteBtn,
                    document.querySelector('.invite-link').value,
                    'Invite link copied to clipboard!'
                );
            }
        }

        function initProjectForm() {
            // Initialize date picker
            const dateInput = document.getElementById('projectDueDate');
            if (dateInput) {
                new Pikaday({
                    field: dateInput,
                    format: 'YYYY-MM-DD',
                    minDate: new Date(),
                    position: 'bottom left',
                    reposition: false,
                    onOpen: function() {
                        this.adjustPosition();
                    },
                    i18n: {
                        previousMonth: 'Prev',
                        nextMonth: 'Next',
                        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    }
                });
            }

            const newProjectBtns = document.querySelectorAll('.new-project-btn, .new-project-nav-icon');
            const formOverlay = document.getElementById('projectFormOverlay');
            
            if (!formOverlay) return;

            newProjectBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Only show the context menu for the nav icon
                    if (btn.classList.contains('new-project-nav-icon')) {
                        showProjectOptionsMenu(btn);
                    } else {
                        // Regular new project button behavior
                        formOverlay.style.display = 'flex';
                        setTimeout(() => {
                            formOverlay.classList.add('show');
                            document.querySelector('.floating-form-container').classList.add('show');
                        }, 10);
                    }
                });
            });
            
            document.getElementById('closeFormBtn').addEventListener('click', closeForm);
            document.getElementById('cancelFormBtn').addEventListener('click', closeForm);
            formOverlay.addEventListener('click', function(e) {
                if (e.target === formOverlay) closeForm();
            });
            
            // Color picker functionality
            const colorPreview = document.getElementById('colorPreview');
            const colorOptions = document.querySelectorAll('.color-option');
            const customColorBtn = document.getElementById('customColorBtn');
            const colorPicker = document.getElementById('colorPicker');
            const selectedColorInput = document.getElementById('selectedColor');
            
            if (colorPreview) {
                updateColorPreviewText('#3b82f6');
            }

            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    const color = this.dataset.color;
                    colorPreview.style.backgroundColor = color;
                    selectedColorInput.value = color;
                    updateColorPreviewText(color);
                });
            });
            
            customColorBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Position color picker near the button
                const rect = e.target.getBoundingClientRect();
                colorPicker.style.position = 'fixed';
                colorPicker.style.top = `${rect.bottom + window.scrollY + 5}px`;
                colorPicker.style.left = `${rect.left + window.scrollX}px`;
                colorPicker.click();
            });
            
            colorPicker.addEventListener('input', function() {
                const color = this.value;
                colorPreview.style.backgroundColor = color;
                selectedColorInput.value = color;
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                updateColorPreviewText(color);
            });
            
            // Form submission
            document.getElementById('projectForm').addEventListener('submit', function(e) {
                e.preventDefault();
                showNotification('Project created successfully!', 'success');
                this.reset();
                closeForm();
                
                // Reset color picker
                colorPreview.style.backgroundColor = '#3b82f6';
                selectedColorInput.value = '#3b82f6';
                document.querySelector('.color-option[data-color="#3b82f6"]').classList.add('selected');
            });
            
            function updateColorPreviewText(color) {
                const brightness = getColorBrightness(color);
                colorPreview.style.color = brightness > 180 ? '#333' : 'white';
            }
            
            function getColorBrightness(hexColor) {
                const r = parseInt(hexColor.substr(1, 2), 16);
                const g = parseInt(hexColor.substr(3, 2), 16);
                const b = parseInt(hexColor.substr(5, 2), 16);
                return (r * 299 + g * 587 + b * 114) / 1000;
            }
        }

        function showProjectOptionsMenu(button) {
            // Remove any existing menu
            const existingMenu = document.querySelector('.project-options-menu');
            if (existingMenu) existingMenu.remove();
            
            // Create the options menu
            const menu = document.createElement('div');
            menu.className = 'project-options-menu';
            menu.innerHTML = `
                <div class="menu-item" data-action="new-project">
                    <i class="fas fa-plus-circle"></i> Create New Project
                </div>
                <div class="menu-item" data-action="join-project">
                    <i class="fas fa-user-plus"></i> Join Existing Project
                </div>
            `;
            
            // Position the menu near the clicked button
            const rect = button.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
            
            document.body.appendChild(menu);
            
            // Handle menu item clicks
            menu.querySelector('[data-action="new-project"]').addEventListener('click', () => {
                // Show the existing new project form
                const formOverlay = document.getElementById('projectFormOverlay');
                formOverlay.style.display = 'flex';
                setTimeout(() => {
                    formOverlay.classList.add('show');
                    document.querySelector('.floating-form-container').classList.add('show');
                }, 10);
                menu.remove();
            });
            
            menu.querySelector('[data-action="join-project"]').addEventListener('click', () => {
                showJoinProjectModal();
                menu.remove();
            });
            
            // Close menu when clicking elsewhere
            const closeMenu = (e) => {
                if (!menu.contains(e.target) && e.target !== button) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            
            setTimeout(() => {
                document.addEventListener('click', closeMenu);
            }, 10);
        }

        function showJoinProjectModal() {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'joinProjectModal';
            modal.innerHTML = `
                <div class="modal-container small">
                    <div class="modal-header">
                        <h3>Join Project</h3>
                        <button class="modal-close" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="modal-content">
                        <div class="form-group">
                            <label for="projectCode">Enter Project Code</label>
                            <input type="text" id="projectCode" placeholder="e.g., XK7H-9P2M" autofocus>
                            <p class="help-text">Get the code from the project owner</p>
                        </div>
                        <div class="modal-actions">
                            <button class="btn cancel-btn" aria-label="Cancel">Cancel</button>
                            <button class="btn btn-primary confirm-btn" aria-label="Join Project">Join Project</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Show modal
            setTimeout(() => {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
            }, 10);
            
            // Close modal handlers
            const closeModal = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            };
            
            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
            
            // Join project handler
            modal.querySelector('.confirm-btn').addEventListener('click', () => {
                const projectCode = modal.querySelector('#projectCode').value.trim();
                if (!projectCode) {
                    showNotification('Please enter a project code', 'error');
                    return;
                }
                
                // Here you would normally make an API call to join the project
                showNotification(`Request sent to join project: ${projectCode}`, 'success');
                closeModal();
            });
            
            // Close when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        function closeForm() {
            const formOverlay = document.getElementById('projectFormOverlay');
            const formContainer = document.querySelector('.floating-form-container');
            
            formOverlay.classList.remove('show');
            formContainer.classList.remove('show');
            
            setTimeout(() => {
                formOverlay.style.display = 'none';
            }, 300);
        }

        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 5000);
            
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            });
        }

        function enhanceDashboardUI() {
            const kanbanTasks = document.querySelectorAll('.kanban-task');
            kanbanTasks.forEach(task => {
                task.addEventListener('mouseenter', () => {
                    task.style.transform = 'translateY(-3px)';
                    task.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
                });
                task.addEventListener('mouseleave', () => {
                    task.style.transform = 'translateY(0)';
                    task.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                });
            });

            const newProjectBtns = document.querySelectorAll('.new-project-btn');
            newProjectBtns.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.animation = 'pulse 1.5s infinite';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.animation = 'none';
                });
            });

            const dashboard = document.querySelector('.dashboard-view');
            if (dashboard) {
                dashboard.style.backgroundImage = 'radial-gradient(circle at 1px 1px, #f0f0f0 1px, transparent 0)';
                dashboard.style.backgroundSize = '20px 20px';
            }
        }

        loadPage("../View/dashboard.php");

        navItems.forEach(item => {
            item.addEventListener("click", function () {
                navItems.forEach(el => el.classList.remove("active"));
                this.classList.add("active");

                let page = "";
                switch (this.getAttribute("data-view")) {
                    case "dashboard":
                        page = "../View/dashboard.php";
                        break;
                    case "members":
                        page = "../View/members.php";
                        break;
                    case "settings":
                        page = "../View/settings.php";
                        break;
                    case "project-alpha":
                        page = "../View/project-alpha.php";
                        break;
                    case "project-beta":
                        page = "../View/project-beta.php";
                        break;
                    default:
                        page = "../View/dashboard.php";
                }

                loadPage(page);
            });
        });
    }
});