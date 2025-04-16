document.addEventListener("DOMContentLoaded", function () {
    initMainApp();
    function initMainApp() {
        const navItems = document.querySelectorAll(".nav-item");
        const contentContainer = document.getElementById("dynamic-content");

        initProjectForm();
        initJoinFacilityModal();
        setupGlobalEventListeners();
        initProfileModal();

        function initProfileModal() {
            const profileDropdown = document.querySelector('.profile');
            const profileModal = document.getElementById('profileModal');
            const closeProfileModal = profileModal?.querySelector('.modal-close');
            const cancelProfileBtn = document.getElementById('cancelProfileBtn');
            const changePhotoBtn = document.getElementById('changePhotoBtn');
            const removePhotoBtn = document.getElementById('removePhotoBtn');
            const profilePicture = document.getElementById('profilePicture');
            const profilePicturePreview = document.getElementById('profilePicturePreview');
            const currentProfilePic = document.getElementById('currentProfilePic');
            const profileForm = document.getElementById('profileForm');

            // Open profile modal from dropdown
            document.querySelector('.dropdown-item[href="#"]')?.addEventListener('click', function(e) {
                e.preventDefault();
                showProfileModal();
            });

            function showProfileModal() {
                if (!profileModal) return;
                profileModal.style.display = 'flex';
                setTimeout(() => {
                    profileModal.classList.add('show');
                }, 10);
            }

            function closeProfileModal() {
                if (!profileModal) return;
                profileModal.classList.remove('show');
                setTimeout(() => {
                    profileModal.style.display = 'none';
                }, 300);
            }

            closeProfileModal?.addEventListener('click', closeProfileModal);
            cancelProfileBtn?.addEventListener('click', closeProfileModal);
            profileModal?.addEventListener('click', (e) => {
                if (e.target === profileModal) closeProfileModal();
            });

            // Profile picture handling
            profilePicturePreview?.addEventListener('click', () => {
                profilePicture.click();
            });

            changePhotoBtn?.addEventListener('click', () => {
                profilePicture.click();
            });

            removePhotoBtn?.addEventListener('click', () => {
                currentProfilePic.src = '../Images/default-profile.jpg'; // Set to your default image
                profilePicture.value = ''; // Clear the file input
            });

            profilePicture?.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        currentProfilePic.src = e.target.result;
                    }
                    reader.readAsDataURL(this.files[0]);
                }
            });

            // Form submission
            profileForm?.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                submitBtn.disabled = true;
                
                try {
                    const formData = new FormData();
                    formData.append('name', document.getElementById('profileName').value.trim());
                    formData.append('email', document.getElementById('profileEmail').value.trim());
                    
                    if (profilePicture.files[0]) {
                        formData.append('profile_picture', profilePicture.files[0]);
                    }
                    
                    const response = await fetch('../Controller/profileController.php?action=update', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showSuccessNotification('Profile updated successfully!');
                        // Update the profile picture in the header if changed
                        if (data.profile_picture) {
                            document.querySelector('.profile-pic').src = data.profile_picture;
                        }
                        // Update the name in the header
                        document.querySelector('.profile-name').textContent = data.name;
                        closeProfileModal();
                    } else {
                        throw new Error(data.message || 'Failed to update profile');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showErrorNotification(error.message || 'Failed to update profile');
                } finally {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }

        function loadPage(file) {
            if (!contentContainer) return;
            cleanupEventListeners();
            
            contentContainer.innerHTML = `<div class="loading-container"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
            
            fetch(file)
                .then(response => response.text())
                .then(html => {
                    contentContainer.innerHTML = html;
        
                    window.projectFormInitialized = false;
                    
                    initProjectForm();
                    setupGlobalEventListeners();
 
                    if (document.getElementById('projectDueDate') && !document.getElementById('projectDueDate')._flatpickr) {
                        flatpickr("#projectDueDate", {
                            dateFormat: "Y-m-d",
                            minDate: "today",
                            allowInput: true,
                            defaultDate: new Date().fp_incr(7)
                        });
                    }
        
                    if (file.includes('dashboard.php')) {
                        enhanceDashboardUI();
                        loadProjects();
                    }
                    if (file.includes('members.php')) {
                        handleMembersPage();
                    }
                    if (file.includes('settings.php')) {
                        handleSettingsPage();
                    }
                })
                .catch(error => {
                    showErrorNotification('Error loading page. Please try again.');
                    console.error("Error loading the page:", error);
                });
        }

        function cleanupEventListeners() {
            const projectForm = document.getElementById('projectForm');
            if (projectForm) {
                const newForm = projectForm.cloneNode(true);
                projectForm.parentNode.replaceChild(newForm, projectForm);
            }

            const newProjectBtns = document.querySelectorAll('.new-project-btn, .new-project-nav-icon');
            newProjectBtns.forEach(btn => {
                btn.replaceWith(btn.cloneNode(true));
            });
        }
        
        function initJoinFacilityModal() {
            const joinFacilityModal = document.getElementById('joinFacilityModal');
            if (!joinFacilityModal) return;

            window.showJoinFacilityModal = function() {
                joinFacilityModal.style.display = 'flex';
                setTimeout(() => {
                    joinFacilityModal.classList.add('show');
                }, 10);
            };

            const closeModal = () => {
                joinFacilityModal.classList.remove('show');
                setTimeout(() => {
                    joinFacilityModal.style.display = 'none';
                }, 300);
            };

            joinFacilityModal.querySelector('.modal-close').addEventListener('click', closeModal);
            joinFacilityModal.querySelector('.cancel-btn').addEventListener('click', closeModal);
            joinFacilityModal.addEventListener('click', (e) => {
                if (e.target === joinFacilityModal) closeModal();
            });

            joinFacilityModal.querySelector('.confirm-btn').addEventListener('click', () => {
                const facilityCode = document.getElementById('facilityCode').value.trim();
                if (!facilityCode) {
                    showNotification('Please enter a facility code', 'error');
                    return;
                }
                
                showNotification(`Request sent to join facility: ${facilityCode}`, 'success');
                closeModal();
            });
        }

        function setupGlobalEventListeners() {
            const newProjectBtns = document.querySelectorAll('.new-project-btn, .new-project-nav-icon');
            const formOverlay = document.getElementById('projectFormOverlay');
            
            if (newProjectBtns.length && formOverlay) {
                newProjectBtns.forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (btn.classList.contains('new-project-nav-icon')) {
                            showProjectOptionsMenu(btn);
                        } else {
                            formOverlay.style.display = 'flex';
                            setTimeout(() => {
                                formOverlay.classList.add('show');
                                document.querySelector('.floating-form-container').classList.add('show');
                            }, 10);
                        }
                    });
                });
            }

            const joinFacilityNavItem = document.getElementById('joinFacilityNavItem');
            if (joinFacilityNavItem) {
                joinFacilityNavItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    showJoinFacilityModal();
                });
            }
        }

        function handleMembersPage() {
            const inviteBtn = document.querySelector('.invite-btn');
            const inviteModal = document.getElementById('inviteModal');
            const inviteModalClose = inviteModal?.querySelector('.modal-close');
            
            if (inviteBtn && inviteModal && inviteModalClose) {
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
            
            const copyBtn = document.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const inviteLink = document.querySelector('.invite-link');
                    if (inviteLink) {
                        navigator.clipboard.writeText(inviteLink.value);
                        showNotification('Invite link copied to clipboard!', 'success');
                    }
                });
            }
            
            const actionButtons = document.querySelectorAll('.btn-icon.danger, .btn-icon[title*="Make Admin"], .btn-icon[title*="Revoke Admin"]');
            const confirmModal = document.getElementById('confirmModal');
            
            if (actionButtons.length && confirmModal) {
                const confirmModalClose = confirmModal.querySelector('.modal-close');
                const cancelBtn = confirmModal.querySelector('.cancel-btn');
                const confirmBtn = confirmModal.querySelector('.confirm-btn');
                
                actionButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        
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
                        
                        confirmModal.dataset.source = Array.from(btn.classList).join(' ');
                    });
                });
                
                const closeConfirmModal = () => {
                    confirmModal.classList.remove('show');
                    setTimeout(() => {
                        confirmModal.style.display = 'none';
                    }, 300);
                };
                
                confirmModalClose?.addEventListener('click', closeConfirmModal);
                cancelBtn?.addEventListener('click', closeConfirmModal);
                
                confirmBtn?.addEventListener('click', () => {
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
            
            const regenerateBtn = document.querySelector('.regenerate-btn');
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                    let code = '';
                    for (let i = 0; i < 8; i++) {
                        code += chars.charAt(Math.floor(Math.random() * chars.length));
                        if (i === 3) code += '-';
                    }
                    
                    const codeValue = document.querySelector('.code-value');
                    const inviteLink = document.querySelector('.invite-link');
                    
                    if (codeValue) codeValue.textContent = code;
                    if (inviteLink) inviteLink.value = `https://facility.example.com/join/${code}`;
                    
                    showNotification('Facility code regenerated!', 'success');
                });
            }

            function setupCopyButton(button, textToCopy, successMessage) {
                if (!button) return;
                
                const copyTextElement = button.querySelector('.copy-code-text') || button.querySelector('.copy-text');
                
                button.addEventListener('click', () => {
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => {
                            if (copyTextElement) {
                                copyTextElement.textContent = 'Copied!';
                                button.classList.add('copied');
                                
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
        
            const copyCodeBtn = document.querySelector('.code-display .copy-code-btn');
            if (copyCodeBtn) {
                const codeValue = document.querySelector('.code-value');
                if (codeValue) {
                    setupCopyButton(
                        copyCodeBtn,
                        codeValue.textContent,
                        'Facility code copied to clipboard!'
                    );
                }
            }
        
            const copyInviteBtn = document.querySelector('.invite-link-container .copy-code-btn');
            if (copyInviteBtn) {
                const inviteLink = document.querySelector('.invite-link');
                if (inviteLink) {
                    setupCopyButton(
                        copyInviteBtn,
                        inviteLink.value,
                        'Invite link copied to clipboard!'
                    );
                }
            }
        }

        function handleSettingsPage() {
            const currentPassword = document.getElementById('currentPassword');
            const newPassword = document.getElementById('newPassword');
            const confirmPassword = document.getElementById('confirmNewPassword');
            
            if (currentPassword && newPassword && confirmPassword) {
                confirmPassword.addEventListener('input', function() {
                    if (newPassword.value !== confirmPassword.value) {
                        confirmPassword.setCustomValidity("Passwords don't match");
                    } else {
                        confirmPassword.setCustomValidity('');
                    }
                });
                
                newPassword.addEventListener('input', function() {
                    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
                    if (!passwordRegex.test(newPassword.value)) {
                        newPassword.setCustomValidity('Password must be at least 8 characters with one number and one special character');
                    } else {
                        newPassword.setCustomValidity('');
                    }
                });
            }
            
            const recoveryQuestions = document.querySelectorAll('[id^="recoveryQuestion"]');
            recoveryQuestions.forEach(question => {
                question.addEventListener('change', function() {
                    const answerId = this.id.replace('Question', '');
                    const answerInput = document.getElementById(answerId);
                    if (this.value && !answerInput.value) {
                        answerInput.setCustomValidity('Please provide an answer');
                    } else {
                        answerInput.setCustomValidity('');
                    }
                });
            });

            const themeOptions = document.querySelectorAll('.theme-option');
            themeOptions.forEach(option => {
                option.addEventListener('click', function() {
                    themeOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    console.log('Theme changed to:', this.dataset.theme);
                });
            });

            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    console.log('Primary color changed to:', this.dataset.color);
                });
            });

            const saveBtn = document.querySelector('.btn-primary');
            if (saveBtn) {
                saveBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const forms = document.querySelectorAll('.settings-card-body');
                    let isValid = true;
                    
                    forms.forEach(form => {
                        const inputs = form.querySelectorAll('input[required], select[required]');
                        inputs.forEach(input => {
                            if (!input.value) {
                                input.reportValidity();
                                isValid = false;
                            }
                        });
                    });
                    
                    if (isValid) {
                        showNotification('Security settings saved successfully!', 'success');
                    }
                });
            }

            const deleteBtn = document.querySelector('.btn-danger');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('Are you sure you want to permanently delete this facility? This action cannot be undone.')) {
                        alert('Facility deletion initiated');
                    }
                });
            }
        }

        function initJoinFacilityModal() {
            const joinFacilityModal = document.getElementById('joinFacilityModal');
            if (!joinFacilityModal) return;

            window.showJoinFacilityModal = function() {
                joinFacilityModal.style.display = 'flex';
                setTimeout(() => {
                    joinFacilityModal.classList.add('show');
                }, 10);
            };

            const closeModal = () => {
                joinFacilityModal.classList.remove('show');
                setTimeout(() => {
                    joinFacilityModal.style.display = 'none';
                }, 300);
            };

            joinFacilityModal.querySelector('.modal-close')?.addEventListener('click', closeModal);
            joinFacilityModal.querySelector('.cancel-btn')?.addEventListener('click', closeModal);
            joinFacilityModal.addEventListener('click', (e) => {
                if (e.target === joinFacilityModal) closeModal();
            });

            joinFacilityModal.querySelector('.confirm-btn')?.addEventListener('click', () => {
                const facilityCode = document.getElementById('facilityCode')?.value.trim();
                if (!facilityCode) {
                    showNotification('Please enter a facility code', 'error');
                    return;
                }
                
                showNotification(`Request sent to join facility: ${facilityCode}`, 'success');
                closeModal();
            });
        }

        function setupGlobalEventListeners() {
            const newProjectBtns = document.querySelectorAll('.new-project-btn, .new-project-nav-icon');
            const formOverlay = document.getElementById('projectFormOverlay');
            
            newProjectBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (btn.classList.contains('new-project-nav-icon')) {
                        showProjectOptionsMenu(btn);
                    } else if (formOverlay) {
                        formOverlay.style.display = 'flex';
                        setTimeout(() => {
                            formOverlay.classList.add('show');
                            document.querySelector('.floating-form-container')?.classList.add('show');
                        }, 10);
                    }
                });
            });

            const joinFacilityNavItem = document.getElementById('joinFacilityNavItem');
            if (joinFacilityNavItem) {
                joinFacilityNavItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    showJoinFacilityModal();
                });
            }
        }

        function initProjectForm() {
            if (window.projectFormInitialized) return;
            window.projectFormInitialized = true;

            const formOverlay = document.getElementById('projectFormOverlay');
            const projectForm = document.getElementById('projectForm');
            
            if (!projectForm) {
                console.warn('Project form not found');
                return;
            }
            
            if (!formOverlay) return;
        
            // Close form handlers
            document.getElementById('closeFormBtn')?.addEventListener('click', closeForm);
            document.getElementById('cancelFormBtn')?.addEventListener('click', closeForm);
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
            
            customColorBtn?.addEventListener('click', function(e) {
                e.preventDefault();
                const rect = e.target.getBoundingClientRect();
                colorPicker.style.position = 'fixed';
                colorPicker.style.top = `${rect.bottom + window.scrollY + 5}px`;
                colorPicker.style.left = `${rect.left + window.scrollX}px`;
                colorPicker.click();
            });
            
            colorPicker?.addEventListener('input', function() {
                const color = this.value;
                colorPreview.style.backgroundColor = color;
                selectedColorInput.value = color;
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                updateColorPreviewText(color);
            });
        
            // Form submission
            projectForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('button[type="submit"]');
                if (!submitBtn || submitBtn.disabled) return;
                
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                submitBtn.disabled = true;
                
                try {
                    const datePicker = flatpickr("#projectDueDate");
                    const userId = document.body.dataset.userId;
                    const formData = {
                        name: document.getElementById('projectName').value.trim(),
                        description: document.getElementById('projectDescription').value.trim(),
                        priority: document.getElementById('projectPriority').value,
                        due_date: datePicker.selectedDates[0] ? 
                                datePicker.formatDate(datePicker.selectedDates[0], 'Y-m-d') : 
                                document.getElementById('projectDueDate').value,
                        color: document.getElementById('selectedColor').value,
                        owner_id: userId 
                    };

                    // Validate required fields
                    if (!formData.name || !formData.description || !formData.due_date) {
                        throw new Error('Please fill all required fields');
                    }

                    const response = await fetch('../Controller/projectsController.php?action=create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (data.success) {
                        showSuccessNotification('Project created successfully!');
                        projectForm.reset();
                        closeForm();
                        loadProjects();

                        // Reset the button state immediately after successful submission
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;

                        const dashboardNav = document.querySelector('.nav-item[data-view="dashboard"]');
                        if (dashboardNav) {
                            dashboardNav.click();
                        } else {
                            loadPage("../View/dashboard.php");
                        }
                    } else {
                        throw new Error(data.message || 'Failed to create project');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showErrorNotification(error.message || 'Failed to create project');
                    // Reset the button state on error too
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        
            function updateColorPreviewText(color) {
                if (!colorPreview) return;
                const brightness = getColorBrightness(color);
                colorPreview.style.color = brightness > 180 ? '#333' : 'white';
                colorPreview.querySelector('.color-preview-text').textContent = 
                    colorOptions.length ? 'Project Color' : color;
            }
            
            function getColorBrightness(hexColor) {
                const r = parseInt(hexColor.substr(1, 2), 16);
                const g = parseInt(hexColor.substr(3, 2), 16);
                const b = parseInt(hexColor.substr(5, 2), 16);
                return (r * 299 + g * 587 + b * 114) / 1000;
            }
        
            function displayFormErrors(errors) {
                // Clear previous errors
                document.querySelectorAll('.form-error').forEach(el => el.remove());
                document.querySelectorAll('.input-group input, .input-group select, .input-group textarea')
                    .forEach(el => el.classList.remove('error'));
                
                // Display new errors
                for (const field in errors) {
                    const inputId = `project${field.charAt(0).toUpperCase() + field.slice(1)}`;
                    const input = document.getElementById(inputId);
                    
                    if (input) {
                        const errorElement = document.createElement('div');
                        errorElement.className = 'form-error';
                        errorElement.textContent = errors[field];
                        
                        // Insert error message after input
                        const inputGroup = input.closest('.input-group');
                        if (inputGroup) {
                            inputGroup.appendChild(errorElement);
                        } else {
                            input.parentNode.insertBefore(errorElement, input.nextSibling);
                        }
                        
                        input.classList.add('error');
                        input.addEventListener('input', function() {
                            this.classList.remove('error');
                            errorElement.remove();
                        }, { once: true });
                    }
                }
            }
        
            function closeForm() {
                const formOverlay = document.getElementById('projectFormOverlay');
                const formContainer = document.querySelector('.floating-form-container');
                
                if (!formOverlay || !formContainer) return;
                
                formOverlay.classList.remove('show');
                formContainer.classList.remove('show');
                
                setTimeout(() => {
                    formOverlay.style.display = 'none';
                    // Reset form when closing
                    projectForm.reset();
                    // Reset color to default
                    const defaultColor = '#3b82f6';
                    colorPreview.style.backgroundColor = defaultColor;
                    selectedColorInput.value = defaultColor;
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    colorOptions[0]?.classList.add('selected');
                    updateColorPreviewText(defaultColor);
                    // Clear any errors
                    document.querySelectorAll('.form-error').forEach(el => el.remove());
                    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
                }, 300);
            }
        }

        function showSuccessNotification(message) {
            showNotification(message, 'success', 'check-circle', 5000);
        }

        function showErrorNotification(message) {
            showNotification(message, 'error', 'exclamation-circle', 8000);
        }

        function showNotification(message, type, icon, duration) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            `;
            
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '1000';
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            notification.style.transition = 'all 0.3s ease';
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateY(0)';
            }, 1);
            
            const removeNotification = () => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            };
            
            setTimeout(removeNotification, duration);
            
            notification.querySelector('.notification-close').addEventListener('click', removeNotification);
        }

        function showProjectOptionsMenu(button) {
            const existingMenu = document.querySelector('.project-options-menu');
            if (existingMenu) existingMenu.remove();
            
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
            
            const rect = button.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
            
            document.body.appendChild(menu);
            
            menu.querySelector('[data-action="new-project"]').addEventListener('click', () => {
                const formOverlay = document.getElementById('projectFormOverlay');
                if (formOverlay) {
                    formOverlay.style.display = 'flex';
                    setTimeout(() => {
                        formOverlay.classList.add('show');
                        document.querySelector('.floating-form-container').classList.add('show');
                    }, 10);
                }
                menu.remove();
            });
            
            menu.querySelector('[data-action="join-project"]').addEventListener('click', () => {
                showJoinFacilityModal();
                menu.remove();
            });
            
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

        function loadProjects() {
            fetch('../Controller/projectsController.php?action=getAll')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status} ${response.statusText}`);
                    }
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        return response.text().then(text => {
                            throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
                        });
                    }
                    
                    return response.json();
                })
                .then(data => {
                    if (!data) {
                        throw new Error('No data received from server');
                    }
                    if (data.success && data.projects) {
                        updateKanbanBoard(data.projects);
                    } else {
                        throw new Error(data.message || 'Failed to load projects');
                    }
                })
                .catch(error => {
                    console.error('Error loading projects:', error);
                    showErrorNotification(error.message || 'Failed to load projects. Please check console for details.');
                    updateKanbanBoard([]);
                });
        }
        
        function updateKanbanBoard(projects) {
            const columns = {
                todo: document.querySelector('.kanban-column[data-status="todo"] .column-content'),
                progress: document.querySelector('.kanban-column[data-status="progress"] .column-content'),
                done: document.querySelector('.kanban-column[data-status="done"] .column-content')
            };

            // Clear existing projects (except the "New Project" button)
            Object.values(columns).forEach(column => {
                if (column) {
                    const newProjectBtn = column.querySelector('.new-project-btn');
                    column.innerHTML = '';
                    if (newProjectBtn) {
                        column.appendChild(newProjectBtn);
                    }
                }
            });

            // Add projects to their respective columns
            projects.forEach(project => {
                const column = columns[project.status] || columns.todo;
                if (column) {
                    const projectElement = createProjectElement(project);
                    const newProjectBtn = column.querySelector('.new-project-btn');
                    if (newProjectBtn) {
                        column.insertBefore(projectElement, newProjectBtn);
                    } else {
                        column.appendChild(projectElement);
                    }
                }
            });

            // Update project counts
            document.querySelectorAll('.project-quantity').forEach(el => {
                const status = el.closest('.kanban-column').dataset.status;
                const count = projects.filter(p => p.status === status).length;
                el.textContent = count;
            });
        }

        function createProjectElement(project) {
            const element = document.createElement('div');
            element.className = 'kanban-task';
            element.style.borderLeft = `4px solid ${project.color}`;
            element.innerHTML = `
                <div class="task-header">
                    <h4>${project.name}</h4>
                    <div class="task-priority ${project.priority}">
                        ${project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </div>
                </div>
                <div class="task-due-date">
                    <i class="far fa-calendar-alt"></i>
                    ${new Date(project.due_date).toLocaleDateString()}
                </div>
                <div class="task-description">${project.description}</div>
                <div class="task-footer">
                    <div class="task-owner">
                        <i class="fas fa-user"></i> ${project.owner_name}
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                    </div>
                </div>
            `;
            return element;
        }

        loadPage("../View/dashboard.php");
        
        navItems.forEach(item => {
            item.addEventListener("click", function () {
                navItems.forEach(el => el.classList.remove("active"));
                this.classList.add("active");
        
                const view = this.getAttribute("data-view");
                const views = {
                    "dashboard": "../View/dashboard.php",
                    "members": "../View/members.php",
                    "settings": "../View/settings.php",
                    "project-alpha": "../View/project-alpha.php",
                    "project-beta": "../View/project-beta.php"
                };
        
                loadPage(views[view] || "../View/dashboard.php");
            });
        });
    }
});