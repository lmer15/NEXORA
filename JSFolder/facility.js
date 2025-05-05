const projectId = document.body.dataset.projectId;
const calendarView = document.getElementById('calendar-view');
const sortableInstances = [];

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${escapeHtml(message)}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", function () {
    initMainApp();

    function initMainApp() {
        function debounce(func, wait, immediate) {
            let timeout;
            return function() {
                const context = this, args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }

        const navItems = document.querySelectorAll(".nav-item");
        const contentContainer = document.getElementById("dynamic-content");
        const projectActions = handleProjectActions();
        projectActions.init();

        initProjectForm();
        initJoinFacilityModal();
        setupGlobalEventListeners();

        function initProfileModal() {
            const profileDropdown = document.querySelector('.profile');
            const profileModal = document.getElementById('profileModal');
            const closeModalBtn = profileModal?.querySelector('.modal-close'); 
            const cancelProfileBtn = document.getElementById('cancelProfileBtn');
            const changePhotoBtn = document.getElementById('changePhotoBtn');
            const removePhotoBtn = document.getElementById('removePhotoBtn');
            const profilePicture = document.getElementById('profilePicture');
            const profilePicturePreview = document.getElementById('profilePicturePreview');
            const currentProfilePic = document.getElementById('currentProfilePic');
            const profileForm = document.getElementById('profileForm');

            
            if (currentProfilePic) {
                currentProfilePic.src = document.querySelector('.profile-pic').src;
            }

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
        
            closeModalBtn?.addEventListener('click', closeProfileModal); 
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
                currentProfilePic.src = '../Images/profile.PNG';
                profilePicture.value = ''; 
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
                        if (data.profile_picture) {
                            const cleanPath = data.profile_picture.replace(/^\.\.\//, '');
                            document.querySelector('.profile-pic').src = '../' + cleanPath;
                            if (currentProfilePic) {
                                currentProfilePic.src = '../' + cleanPath;
                            }
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
                        initProfileModal();
                        enhanceDashboardUI();
                        loadProjects();
                    }
                    if (file.includes('members.php')) {
                        handleMembersPage();
                    }
                    if (file.includes('settings.php')) {
                        handleSettingsPage();
                    }
                    if (file.includes('archivedProject.php')) {
                        const projectActions = handleProjectActions();
                        projectActions.loadArchivedProjects();
                        document.getElementById('refreshArchivedBtn')?.addEventListener('click', () => {
                            projectActions.loadArchivedProjects();
                        });
                    }
                    if (file.includes('project-')) {
                        const projectId = file.split('project-')[1].replace('.php', '');
                        initProjectView(projectId);
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

        function handleMembersPage() {
            const currentUserId = parseInt(document.body.dataset.userId) || 0;
            const isAdmin = document.body.dataset.userRole === 'admin';
            const regenerateCodeBtn = document.getElementById('regenerateCodeBtn');
            const inviteMembersBtn = document.getElementById('inviteMembersBtn');
            const inviteModal = document.getElementById('inviteModal');
            const confirmModal = document.getElementById('confirmModal');
            const membersTableBody = document.getElementById('membersTableBody');
            const inviteLinkInput = document.getElementById('inviteLinkInput');
            const copyInviteLinkBtn = document.getElementById('copyInviteLinkBtn');
            const userSearchInput = document.getElementById('userSearchInput');
            const userSuggestions = document.getElementById('userSuggestions');
            const suggestionList = document.getElementById('suggestionList');
            const selectedUsersList = document.getElementById('selectedUsersList');
            const sendInvitationBtn = document.getElementById('sendInvitationBtn');
            const inviteSuccessMessage = document.getElementById('inviteSuccessMessage');
            const inviteErrorMessage = document.getElementById('inviteErrorMessage');
            
            let selectedUsers = [];
            let facilityCode = document.getElementById('facilityCodeValue')?.textContent;
        
            // Initialize modals
            function initModals() {
                // Invite Modal
                if (inviteModal) {
                    const inviteModalClose = inviteModal.querySelector('.modal-close');
                    
                    inviteMembersBtn?.addEventListener('click', () => {
                        inviteModal.style.display = 'flex';
                        setTimeout(() => {
                            inviteModal.classList.add('show');
                        }, 10);
                    });
                    
                    inviteModalClose?.addEventListener('click', () => {
                        inviteModal.classList.remove('show');
                        setTimeout(() => {
                            inviteModal.style.display = 'none';
                            // Clear selections when closing
                            selectedUsers = [];
                            renderSelectedUsers();
                            userSearchInput.value = '';
                            suggestionList.innerHTML = '';
                        }, 300);
                    });
                    
                    inviteModal?.addEventListener('click', (e) => {
                        if (e.target === inviteModal) {
                            inviteModal.classList.remove('show');
                            setTimeout(() => {
                                inviteModal.style.display = 'none';
                                selectedUsers = [];
                                renderSelectedUsers();
                                userSearchInput.value = '';
                                suggestionList.innerHTML = '';
                            }, 300);
                        }
                    });
                }
                
                // Confirm Modal
                if (confirmModal) {
                    const confirmModalClose = confirmModal.querySelector('.modal-close');
                    const confirmBtn = confirmModal.querySelector('.confirm-btn');
                    const cancelBtn = confirmModal.querySelector('.cancel-btn');
                    
                    confirmModalClose?.addEventListener('click', () => {
                        confirmModal.classList.remove('show');
                        setTimeout(() => {
                            confirmModal.style.display = 'none';
                        }, 300);
                    });
                    
                    cancelBtn?.addEventListener('click', () => {
                        confirmModal.classList.remove('show');
                        setTimeout(() => {
                            confirmModal.style.display = 'none';
                        }, 300);
                    });
                    
                    confirmModal?.addEventListener('click', (e) => {
                        if (e.target === confirmModal) {
                            confirmModal.classList.remove('show');
                            setTimeout(() => {
                                confirmModal.style.display = 'none';
                            }, 300);
                        }
                    });
                }
            }
        
            // Copy invite link functionality
            function setupCopyInviteLink() {
                if (copyInviteLinkBtn && inviteLinkInput && facilityCode) {
                    // Set initial invite link
                    inviteLinkInput.value = `${window.location.origin}/join/${facilityCode}`;
                    
                    copyInviteLinkBtn.addEventListener('click', () => {
                        if (!inviteLinkInput.value) return;
                        
                        navigator.clipboard.writeText(inviteLinkInput.value)
                            .then(() => {
                                const copyText = copyInviteLinkBtn.querySelector('.copy-code-text');
                                if (copyText) {
                                    copyText.textContent = 'Copied!';
                                    setTimeout(() => {
                                        copyText.textContent = 'Copy';
                                    }, 2000);
                                }
                                showSuccessNotification('Invite link copied to clipboard!');
                            })
                            .catch(err => {
                                console.error('Failed to copy: ', err);
                                showErrorNotification('Failed to copy invite link');
                            });
                    });
                }
            }
            
            // Regenerate facility code
            function setupRegenerateCode() {
                regenerateCodeBtn.addEventListener('click', () => {
                    showConfirmModal(
                        'Are you sure you want to regenerate the facility code? The old code will no longer work.',
                        () => {
                            regenerateCodeBtn.disabled = true;
                            regenerateCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
                            
                            fetch('../Controller/memberController.php?action=regenerateCode', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                }
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    facilityCode = data.code;
                                    document.getElementById('facilityCodeValue').textContent = data.code;
                                    if (inviteLinkInput) {
                                        inviteLinkInput.value = `${window.location.origin}/join/${data.code}`;
                                    }
                                    showSuccessNotification('Facility code regenerated successfully!');
                                } else {
                                    throw new Error(data.message || 'Failed to regenerate code');
                                }
                            })
                            .catch(error => {
                                showErrorNotification(error.message);
                            })
                            .finally(() => {
                                regenerateCodeBtn.disabled = false;
                                regenerateCodeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Regenerate';
                            });
                        }
                    );
                });
            }
        
            // User search functionality
            function setupUserSearch() {
                if (!userSearchInput || !suggestionList) return;
            
                userSearchInput.addEventListener('input', debounce(function(e) {
                    const query = e.target.value.trim();
                    if (query.length < 2) {
                        suggestionList.innerHTML = '';
                        userSuggestions.style.display = 'none';
                        return;
                    }
            
                    fetch(`../Controller/userController.php?action=search&query=${encodeURIComponent(query)}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                if (data.users && data.users.length > 0) {
                                    displayUserSuggestions(data.users);
                                    userSuggestions.style.display = 'block';
                                    userSuggestions.classList.add('active');
                                } else {
                                    showNoResults(query);
                                    userSuggestions.style.display = 'block';
                                    userSuggestions.classList.add('active');
                                }
                            } else {
                                throw new Error(data.message || 'Search failed');
                            }
                        })
                        .catch(error => {
                            console.error('Search error:', error);
                            showErrorState(error.message);
                            userSuggestions.style.display = 'block';
                            userSuggestions.classList.add('active');
                        });
                }, 300));
            }
            
            function showErrorState(message) {
                suggestionList.innerHTML = `
                    <div class="suggestion-item error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="suggestion-details">
                            <div class="suggestion-name">Error: ${message || 'Search failed'}</div>
                        </div>
                    </div>
                `;
            }

            // Display user suggestions
            function displayUserSuggestions(users) {
                suggestionList.innerHTML = '';
                
                // Filter out already selected users
                const availableUsers = users.filter(user => 
                    !selectedUsers.some(selected => selected.id === user.id)
                );
                
                if (availableUsers.length === 0) {
                    showNoResults(userSearchInput.value.trim());
                    return;
                }
                
                availableUsers.forEach(user => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    suggestionItem.dataset.userId = user.id;
                    
                    // Use profile picture if available, otherwise show initials
                    const avatarContent = user.profile_picture 
                        ? `<img src="../${user.profile_picture}" alt="${user.name}" class="suggestion-avatar-img">`
                        : `<div class="suggestion-avatar-initials" style="background-color: ${user.color}">${user.initials}</div>`;
                    
                    suggestionItem.innerHTML = `
                        <div class="suggestion-avatar">
                            ${avatarContent}
                        </div>
                        <div class="suggestion-details">
                            <div class="suggestion-name">${escapeHtml(user.name)}</div>
                            <div class="suggestion-email">${escapeHtml(user.email)}</div>
                        </div>
                        <button class="add-user-btn" title="Add user">
                            <i class="fas fa-plus"></i>
                        </button>
                    `;
                    
                    suggestionItem.addEventListener('click', (e) => {
                        // Only add if clicking on the main item, not the add button
                        if (!e.target.closest('.add-user-btn')) {
                            addSelectedUser(user);
                            userSuggestions.style.display = 'none';
                        }
                    });
                    
                    // Add click handler for the add button specifically
                    suggestionItem.querySelector('.add-user-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        addSelectedUser(user);
                        userSuggestions.style.display = 'none';
                    });
                    
                    suggestionList.appendChild(suggestionItem);
                });
                
                userSuggestions.style.display = 'block';
                userSuggestions.classList.add('active');
            }
            
            function showNoResults(query = '') {
                suggestionList.innerHTML = `
                    <div class="suggestion-item no-results">
                        <div class="suggestion-avatar">
                            <i class="fas fa-user-slash"></i>
                        </div>
                        <div class="suggestion-details">
                            <div class="suggestion-name">No users found</div>
                            ${query ? `<div class="suggestion-email">Try a different search term</div>` : ''}
                        </div>
                    </div>
                `;
            }
        
            // Add user to selected list
            function addSelectedUser(user) {
                if (selectedUsers.some(u => u.id === user.id)) return;
                
                selectedUsers.push(user);
                renderSelectedUsers();
                userSearchInput.value = '';
                userSuggestions.style.display = 'none';
                
                if (selectedUsers.length > 0) {
                    sendInvitationBtn.disabled = false;
                }
            }
        
            // Render selected users
            function renderSelectedUsers() {
                if (!selectedUsersList) return;
                
                if (selectedUsers.length === 0) {
                    selectedUsersList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>No users selected</p>
                        </div>
                    `;
                    selectedUsersList.classList.remove('has-items');
                    if (sendInvitationBtn) sendInvitationBtn.disabled = true;
                    return;
                }
                
                selectedUsersList.innerHTML = selectedUsers.map(user => `
                    <div class="selected-user" data-user-id="${user.id}">
                        <div class="selected-avatar">
                            ${user.profile_picture 
                                ? `<img src="../${user.profile_picture}" alt="${user.name}" class="selected-avatar-img">`
                                : `<div class="selected-avatar-initials" style="background-color: ${user.color}">${user.initials}</div>`
                            }
                        </div>
                        <div class="selected-details">
                            <div class="selected-name">${escapeHtml(user.name)}</div>
                            <div class="selected-email">${escapeHtml(user.email)}</div>
                        </div>
                        <button class="remove-user-btn" title="Remove user">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
                
                selectedUsersList.classList.add('has-items');
                
                // Add event listeners to remove buttons
                document.querySelectorAll('.remove-user-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const userId = parseInt(this.closest('.selected-user').dataset.userId);
                        selectedUsers = selectedUsers.filter(u => u.id !== userId);
                        renderSelectedUsers();
                    });
                });
            }           
        
            function setupSendInvitation() {
                if (!sendInvitationBtn) return;
                
                sendInvitationBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (selectedUsers.length === 0) {
                        showMessage(inviteErrorMessage, 'Please select at least one user');
                        return;
                    }
                    
                    // Disable button during request
                    const originalBtnText = sendInvitationBtn.innerHTML;
                    sendInvitationBtn.disabled = true;
                    sendInvitationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
                    
                    const userIds = selectedUsers.map(user => user.id);
                    
                    fetch('../Controller/memberController.php?action=addMembers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ user_ids: userIds })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            showMessage(inviteSuccessMessage, data.message || `${data.added_count} user(s) added successfully`);
                            selectedUsers = [];
                            renderSelectedUsers();
                            
                            // Refresh members list after a short delay
                            setTimeout(() => {
                                refreshMembersList();
                            }, 1000);
                            
                            // Close modal after success
                            setTimeout(() => {
                                if (inviteModal) {
                                    inviteModal.classList.remove('show');
                                    setTimeout(() => {
                                        inviteModal.style.display = 'none';
                                    }, 300);
                                }
                            }, 1500);
                        } else {
                            throw new Error(data.message || 'Failed to add members');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showMessage(inviteErrorMessage, error.message || 'Failed to add members');
                    })
                    .finally(() => {
                        sendInvitationBtn.disabled = false;
                        sendInvitationBtn.innerHTML = originalBtnText;
                    });
                });
            }
        
            // Handle member actions (make admin, revoke admin, remove)
            function setupMemberActions() {
                if (!membersTableBody) return;
                
                membersTableBody.addEventListener('click', function(e) {
                    const makeAdminBtn = e.target.closest('.make-admin-btn');
                    const revokeAdminBtn = e.target.closest('.revoke-admin-btn');
                    const removeMemberBtn = e.target.closest('.remove-member-btn');
                    
                    if (makeAdminBtn) {
                        const userId = makeAdminBtn.dataset.userId;
                        showConfirmModal(
                            'Are you sure you want to make this member an admin? Admins will have additional privileges.',
                            () => makeAdmin(userId)
                        );
                    } else if (revokeAdminBtn) {
                        const userId = revokeAdminBtn.dataset.userId;
                        showConfirmModal(
                            'Are you sure you want to revoke admin privileges from this member?',
                            () => revokeAdmin(userId)
                        );
                    } else if (removeMemberBtn) {
                        const userId = removeMemberBtn.dataset.userId;
                        showConfirmModal(
                            'Are you sure you want to remove this member from the facility?',
                            () => removeMember(userId)
                        );
                    }
                });
            }
        
            // Show confirmation modal
            function showConfirmModal(message, confirmCallback) {
                if (!confirmModal) return;
                
                const confirmMessage = document.getElementById('confirmMessage');
                const confirmBtn = confirmModal.querySelector('.confirm-btn');
                const cancelBtn = confirmModal.querySelector('.cancel-btn');
                
                confirmMessage.textContent = message;
                confirmModal.style.display = 'flex';
                setTimeout(() => {
                    confirmModal.classList.add('show');
                }, 10);
                
                const closeModal = () => {
                    confirmModal.classList.remove('show');
                    setTimeout(() => {
                        confirmModal.style.display = 'none';
                    }, 300);
                };
                
                const handleConfirm = () => {
                    confirmCallback();
                    closeModal();
                };
                
                confirmBtn.onclick = handleConfirm;
                cancelBtn.onclick = closeModal;
                confirmModal.querySelector('.modal-close').onclick = closeModal;
                confirmModal.onclick = (e) => {
                    if (e.target === confirmModal) closeModal();
                };
            }
        
            // Make member admin
            function makeAdmin(userId) {
                const originalBtn = document.querySelector(`.make-admin-btn[data-user-id="${userId}"]`);
                if (originalBtn) {
                    originalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    originalBtn.disabled = true;
                }
            
                fetch('../Controller/memberController.php?action=makeAdmin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.message || 'Request failed');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showSuccessNotification(data.message);
                        renderMembersTable(data.members);
                    } else {
                        throw new Error(data.message || 'Operation failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showErrorNotification(error.message || 'Failed to grant admin privileges');
                })
                .finally(() => {
                    if (originalBtn) {
                        originalBtn.innerHTML = '<i class="fas fa-crown"></i>';
                        originalBtn.disabled = false;
                    }
                });
            }

            // Revoke member admin
            function revokeAdmin(userId) {
                const originalBtn = document.querySelector(`.revoke-admin-btn[data-user-id="${userId}"]`);
                if (originalBtn) {
                    originalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    originalBtn.disabled = true;
                }
            
                fetch('../Controller/memberController.php?action=revokeAdmin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.message || 'Request failed');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showSuccessNotification(data.message);
                        renderMembersTable(data.members);
                    } else {
                        throw new Error(data.message || 'Operation failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showErrorNotification(error.message || 'Failed to revoke admin privileges');
                })
                .finally(() => {
                    if (originalBtn) {
                        originalBtn.innerHTML = '<i class="fas fa-user-shield"></i>';
                        originalBtn.disabled = false;
                    }
                });
            }
            
            // Remove member
            function removeMember(userId) {
                const originalBtn = document.querySelector(`.remove-member-btn[data-user-id="${userId}"]`);
                if (originalBtn) {
                    originalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    originalBtn.disabled = true;
                }
            
                fetch('../Controller/memberController.php?action=removeMember', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: userId })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.message || 'Request failed');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showSuccessNotification(data.message);
                        renderMembersTable(data.members);
                        const memberCountElement = document.querySelector('.facilityMembers');
                        if (memberCountElement) {
                            memberCountElement.textContent = `(${data.members.length})`;
                        }
                    } else {
                        throw new Error(data.message || 'Operation failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showErrorNotification(error.message || 'Failed to remove member');
                })
                .finally(() => {
                    if (originalBtn) {
                        originalBtn.innerHTML = '<i class="fas fa-user-times"></i>';
                        originalBtn.disabled = false;
                    }
                });
            }

            // Refresh members list
            function refreshMembersList() {
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'loading-members';
                loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading members...';
                
                if (membersTableBody) {
                    membersTableBody.parentNode.insertBefore(loadingIndicator, membersTableBody);
                    membersTableBody.style.opacity = '0.5';
                }
            
                fetch('../Controller/memberController.php?action=getMembers')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            renderMembersTable(data.members);
                            // Update member count
                            const memberCountElement = document.querySelector('.facilityMembers');
                            if (memberCountElement) {
                                memberCountElement.textContent = `(${data.members.length})`;
                            }
                        } else {
                            throw new Error(data.message || 'Failed to load members');
                        }
                    })
                    .catch(error => {
                        console.error('Error refreshing members list:', error);
                        showErrorNotification(error.message || 'Failed to load members');
                    })
                    .finally(() => {
                        if (loadingIndicator) loadingIndicator.remove();
                        if (membersTableBody) membersTableBody.style.opacity = '1';
                    });
            }
        
            // Render members table
            function renderMembersTable(members) {
                if (!membersTableBody) return;
                
                membersTableBody.innerHTML = members.map(member => `
                    <tr data-user-id="${member.id}">
                        <td data-label="Member">
                            <div class="member-info">
                                <div class="avatar" style="background-color: ${getColorFromName(member.name)};">
                                    ${getInitials(member.name)}
                                </div>
                                <div class="member-details">
                                    <span class="member-name">${escapeHtml(member.name)}</span>
                                    <span class="member-status">${member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
                                </div>
                            </div>
                        </td>
                        <td data-label="Email">${escapeHtml(member.email)}</td>
                        <td data-label="Role">
                            <span class="role-badge ${member.role}">
                                ${member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                        </td>
                        <td data-label="Joined">
                            ${new Date(member.joined_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })}
                        </td>
                        <td data-label="Actions">
                            <div class="action-buttons">
                                ${member.id != currentUserId ? `
                                    ${member.role === 'admin' ? `
                                        <button class="btn-icon revoke-admin-btn" 
                                                data-user-id="${member.id}" 
                                                title="Revoke Admin" 
                                                aria-label="Revoke admin privileges">
                                            <i class="fas fa-user-shield"></i>
                                        </button>
                                    ` : `
                                        <button class="btn-icon make-admin-btn" 
                                                data-user-id="${member.id}" 
                                                title="Make Admin" 
                                                aria-label="Make member admin">
                                            <i class="fas fa-crown"></i>
                                        </button>
                                    `}
                                    <button class="btn-icon danger remove-member-btn" 
                                            data-user-id="${member.id}" 
                                            title="Remove Member" 
                                            aria-label="Remove member">
                                        <i class="fas fa-user-times"></i>
                                    </button>
                                ` : `
                                    <button class="btn-icon" disabled aria-label="Current user">
                                        <i class="fas fa-user"></i>
                                    </button>
                                `}
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        
            // Helper functions
            function handleResponse(response) {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Request failed');
                    });
                }
                return response.json();
            }

            function handleError(error) {
                console.error('Error:', error);
                showErrorNotification(error.message || 'Operation failed');
                throw error; // Re-throw for further handling if needed
            }

            function showNoResults(query = '') {
                suggestionList.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-user-slash"></i>
                        <p>No users found</p>
                    </div>
                `;
            }
            
            function showErrorState() {
                suggestionList.innerHTML = `
                    <div class="suggestion-item error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="suggestion-details">
                            <div class="suggestion-name">Error searching users</div>
                        </div>
                    </div>
                `;
            }
            
            function showMessage(element, message) {
                if (!element) return;
                
                // Hide all messages first
                document.querySelectorAll('.message-area > div').forEach(el => {
                    el.style.display = 'none';
                });
                
                element.querySelector('.message-text').textContent = message;
                element.style.display = 'flex';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        
            function getInitials(name) {
                if (!name) return 'NA';
                return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
            }
        
            function getColorFromName(name) {
                if (!name) return '#ccc';
                const colors = ['#3b82f6', '#06a566', '#f08c00', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'];
                let hash = 0;
                for (let i = 0; i < name.length; i++) {
                    hash = name.charCodeAt(i) + ((hash << 5) - hash);
                }
                return colors[Math.abs(hash) % colors.length];
            }
            
            function escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
        
            // Initialize all functionality
            initModals();
            setupCopyInviteLink();
            setupRegenerateCode();
            setupUserSearch();
            setupSendInvitation();
            setupMemberActions();
            refreshMembersList();
            renderSelectedUsers();
        }

        function handleSettingsPage() {
            loadSecurityQuestions();
            const passwordForm = document.getElementById('passwordForm');
            if (passwordForm) {
                passwordForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    updatePassword();
                });
            }
            const recoveryForm = document.getElementById('recoveryForm');
            if (recoveryForm) {
                recoveryForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    updateSecurityQuestions();
                });
            }

            const saveBtn = document.getElementById('saveSettingsBtn');
            if (saveBtn) {
                saveBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    let messages = [];
                    let hasChanges = false;
        
                    const currentPassword = document.getElementById('currentPassword')?.value;
                    const newPassword = document.getElementById('newPassword')?.value;
                    if (currentPassword || newPassword) {
                        hasChanges = true;
                        updatePassword().then(result => {
                            if (result && result.success) messages.push(result.message);
                            checkAndShowMessages(messages, hasChanges);
                        });
                    }
        
                    let hasQuestionChanges = false;
                    document.querySelectorAll('[id^="recoveryQuestion"]').forEach(question => {
                        if (question.value) hasQuestionChanges = true;
                    });
                    if (hasQuestionChanges) {
                        hasChanges = true;
                        updateSecurityQuestions().then(result => {
                            if (result && result.success) messages.push(result.message);
                            checkAndShowMessages(messages, hasChanges);
                        });
                    }
        
                    if (!hasChanges) {
                        showSuccessNotification('No changes were made');
                    }
                });
            }

            function checkAndShowMessages(messages, hasChanges) {
                if (messages.length > 0) {
                    showSuccessNotification(messages.join(' and '));
                } else if (!hasChanges) {
                    showSuccessNotification('No changes were made');
                }
            }

            const cancelBtn = document.getElementById('cancelSettingsBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    window.location.reload();
                });
            }

            const deleteBtn = document.getElementById('deleteAccountBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                        // Add your account deletion logic here
                        alert('Account deletion initiated');
                    }
                });
            }
        }

        function loadSecurityQuestions() {
            fetch('../Controller/SettingsController.php?action=getSecurityQuestions')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.questions) {
                        data.questions.forEach((question, index) => {
                            const questionId = `recoveryQuestion${index + 1}`;
                            const answerId = `answer${index + 1}`;
                            
                            const questionSelect = document.getElementById(questionId);
                            const answerInput = document.getElementById(answerId);
                            
                            if (questionSelect) questionSelect.value = question.question;
                        });
                    }
                })
                .catch(error => {
                    console.error('Error loading security questions:', error);
                });
        }
        
        function updatePassword() {
            return new Promise((resolve) => {
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmNewPassword').value;
                
                if (newPassword !== confirmPassword) {
                    showErrorNotification("Passwords don't match");
                    return resolve(null);
                }
                
                const formData = new FormData();
                formData.append('currentPassword', currentPassword);
                formData.append('newPassword', newPassword);
                
                fetch('../Controller/SettingsController.php?action=updatePassword', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('currentPassword').value = '';
                        document.getElementById('newPassword').value = '';
                        document.getElementById('confirmNewPassword').value = '';
                        resolve(data);
                    } else {
                        showErrorNotification(data.message);
                        resolve(null);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showErrorNotification('Failed to update password');
                    resolve(null);
                });
            });
        }
        
        function updateSecurityQuestions() {
            return new Promise((resolve) => {
                const formData = new FormData();
                
                document.querySelectorAll('[id^="recoveryQuestion"]').forEach((question, index) => {
                    const questionNum = index + 1;
                    const answer = document.getElementById(`answer${questionNum}`).value;
                    
                    if (question.value && answer) {
                        formData.append(`question${questionNum}`, question.value);
                        formData.append(`answer${questionNum}`, answer);
                    }
                });
                
                fetch('../Controller/SettingsController.php?action=updateSecurityQuestions', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        resolve(data);
                    } else {
                        showErrorNotification(data.message);
                        resolve(null);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showErrorNotification('Failed to update security questions');
                    resolve(null);
                });
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
                    document.getElementById('projectForm').reset();
                    
                    // Reset date picker
                    const datePicker = flatpickr("#projectDueDate");
                    if (datePicker) {
                        datePicker.clear();
                        datePicker.setDate(new Date().fp_incr(7));
                    }
                    
                    // Reset color to default
                    const defaultColor = '#3b82f6';
                    const colorPreview = document.getElementById('colorPreview');
                    const selectedColorInput = document.getElementById('selectedColor');
                    const colorOptions = document.querySelectorAll('.color-option');
                    
                    if (colorPreview) {
                        colorPreview.style.backgroundColor = defaultColor;
                        updateColorPreviewText(defaultColor);
                    }
                    if (selectedColorInput) selectedColorInput.value = defaultColor;
                    if (colorOptions.length) {
                        colorOptions.forEach(opt => opt.classList.remove('selected'));
                        colorOptions[0]?.classList.add('selected');
                    }
                    
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
                    <i class="fas fa-user-plus"></i> Join Existing Facility
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
            const columns = document.querySelectorAll('.kanban-column');
            
            columns.forEach(column => {
                column.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const draggingTask = document.querySelector('.kanban-task.dragging');
                    if (draggingTask) {
                        column.classList.add('drag-over');
                        
                        // Calculate where to show the drop indicator
                        const afterElement = getDragAfterElement(column, e.clientY);
                        const dropIndicator = document.querySelector('.drop-indicator') || 
                            document.createElement('div');
                        dropIndicator.className = 'drop-indicator';
                        
                        if (afterElement) {
                            column.querySelector('.column-content').insertBefore(dropIndicator, afterElement);
                        } else {
                            column.querySelector('.column-content').appendChild(dropIndicator);
                        }
                    }
                });
            
                column.addEventListener('dragleave', () => {
                    column.classList.remove('drag-over');
                    const indicator = document.querySelector('.drop-indicator');
                    if (indicator) indicator.remove();
                });
            
                column.addEventListener('drop', (e) => {
                    e.preventDefault();
                    column.classList.remove('drag-over');
                    const indicator = document.querySelector('.drop-indicator');
                    if (indicator) indicator.remove();
                    
                    const projectId = e.dataTransfer.getData('text/plain');
                    const newStatus = column.dataset.status;
                    
                    updateProjectStatus(projectId, newStatus);
                });
            });
        }
        
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.kanban-task:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function updateProjectStatus(projectId, newStatus) {
            fetch('../Controller/projectsController.php?action=updateStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: projectId,
                    status: newStatus
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Failed to update status');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Remove the old project element
                    const oldElement = document.querySelector(`.kanban-task[data-project-id="${projectId}"]`);
                    if (oldElement) oldElement.remove();
                    
                    // Add the project to the new column
                    const projects = data.projects || [];
                    const updatedProject = projects.find(p => p.id == projectId);
                    if (updatedProject) {
                        const column = document.querySelector(`.kanban-column[data-status="${newStatus}"] .column-content`);
                        if (column) {
                            const projectElement = createProjectElement(updatedProject);
                            const newProjectBtn = column.querySelector('.new-project-btn');
                            if (newProjectBtn) {
                                column.insertBefore(projectElement, newProjectBtn);
                            } else {
                                column.appendChild(projectElement);
                            }
                        }
                    }
                    
                    // Update project counts
                    updateProjectCounts(projects);
                } else {
                    throw new Error(data.message || 'Failed to update project status');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorNotification(error.message || 'Failed to update project status');
                // Reload all projects to reset the board
                loadProjects();
            });
        }
        
        function updateProjectCounts(projects) {
            document.querySelectorAll('.project-quantity').forEach(el => {
                const status = el.closest('.kanban-column').dataset.status;
                const count = projects.filter(p => p.status === status).length;
                el.textContent = count;
            });
        }

        function loadProjects() {
            const userId = document.body.dataset.userId;
            
            fetch(`../Controller/projectsController.php?action=getAll`)
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
                        updateProjectsNav(data.projects);
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

        function updateProjectsNav(projects) {
            const projectsNavSection = document.querySelector('.nav-section:nth-child(2) .nav-list');
            if (!projectsNavSection) return;
        
            projectsNavSection.innerHTML = '';
            projects.forEach(project => {
                const projectItem = document.createElement('li');
                projectItem.className = 'nav-item';
                projectItem.dataset.view = `project-${project.id}`;
                projectItem.innerHTML = `
                    <div class="nav-item-left">
                        <i class="fa-solid fa-diagram-project"></i>
                        <span class="nav-item-text">${project.name}</span>
                    </div>
                    <div class="nav-item-actions">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                `;
                projectsNavSection.appendChild(projectItem);
        
                projectItem.addEventListener('click', function() {
                    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                    this.classList.add('active');
                    loadProjectView(project.id);
                });
            });
        
            const newProjectIcon = document.querySelector('.new-project-nav-icon');
            if (newProjectIcon) {
                newProjectIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showProjectOptionsMenu(this);
                });
            }
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

            if (!projects || projects.length === 0) {
                console.warn('No projects to display');
                return;
            }

            // Add projects to their respective columns
            projects.forEach(project => {
                const column = columns[project.status] || columns.todo;
                if (column) {
                    const projectElement = createProjectElement(project);
                    column.appendChild(projectElement);
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
            if (project.color && project.color !== '#ffffff') {
                element.classList.add('colorful');
                element.style.backgroundColor = project.color;
            }
            element.dataset.projectId = project.id;
            element.dataset.status = project.status;
            element.draggable = true;
        
            const textColor = getTextColorForBackground(project.color);
            const secondaryTextColor = textColor === '#333' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.85)';
            const iconColor = textColor === '#333' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)';
        
            element.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title" style="color: ${textColor}">${escapeHtml(project.name)}</h3>
                    <span class="task-priority ${project.priority}" style="color: ${textColor}">
                        ${project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </span>
                    <div class="task-actions">
                        <div class="dropdown">
                            <button class="btn-icon dropdown-toggle" aria-label="More options">
                                <i class="fas fa-ellipsis-v" style="color: ${iconColor}"></i>
                            </button>
                            <div class="dropdown-menu">
                                <button class="dropdown-item archive-project" data-project-id="${project.id}">
                                    <i class="fas fa-box-archive"></i> Archive
                                </button>
                                <button class="dropdown-item delete-project" data-project-id="${project.id}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="task-meta">
                    <div class="task-due-date" style="color: ${secondaryTextColor}">
                        <i class="far fa-calendar-alt" style="color: ${iconColor}"></i>
                        Due: ${new Date(project.due_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })}
                    </div>
                    <p class="task-description" style="color: ${secondaryTextColor}">${escapeHtml(truncateText(project.description, 100))}</p>
                </div>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                    </div>
                    <span class="progress-text" style="color: ${secondaryTextColor}">${project.progress || 0}% Complete</span>
                </div>
                <div class="task-footer">
                    <div class="task-owner" style="color: ${secondaryTextColor}">
                        <i class="fas fa-user" style="color: ${iconColor}"></i>
                        ${escapeHtml(project.owner_name)}
                    </div>
                </div>
            `;
        
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', project.id);
                element.classList.add('dragging');
                
                const dragImage = element.cloneNode(true);
                dragImage.style.width = `${element.offsetWidth}px`;
                dragImage.style.position = 'fixed';
                dragImage.style.top = '-9999px'; 
                dragImage.style.left = '-9999px';
                dragImage.style.zIndex = '10000';
                dragImage.style.pointerEvents = 'none';
                dragImage.style.transform = 'rotate(2deg) scale(1.02)';
                dragImage.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
                dragImage.style.opacity = '0.9';
                dragImage.id = 'drag-ghost';

                document.body.appendChild(dragImage);
                
                setTimeout(() => {
                    e.dataTransfer.setDragImage(dragImage, 0, 0);
                }, 0);
            });
        
            element.addEventListener('dragend', () => {
                element.classList.remove('dragging');
                const ghost = document.getElementById('drag-ghost');
                if (ghost) ghost.remove();
            });

            element.addEventListener('click', (e) => {
                if (e.target.closest('.dropdown') || e.target.closest('.task-actions')) {
                    return;
                }
                loadProjectView(project.id);
            });        
            
            return element;
        }

        function handleProjectActions() {

            function createConfirmationModal(message, confirmCallback) {
                const modalId = 'confirmationModal';
                let modal = document.getElementById(modalId);
                
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = modalId;
                    modal.className = 'modal-overlay';
                    modal.innerHTML = `
                        <div class="modal-container small">
                            <div class="modal-header">
                                <h3>Confirmation</h3>
                                <button class="modal-close">&times;</button>
                            </div>
                            <div class="modal-content">
                                <p id="confirmationMessage">${message}</p>
                                <div class="modal-actions">
                                    <button class="btn btn-outline cancel-btn">Cancel</button>
                                    <button class="btn btn-primary confirm-btn">Confirm</button>
                                </div>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    
                    // Add event listeners
                    modal.querySelector('.modal-close').addEventListener('click', () => {
                        modal.remove();
                    });
                    
                    modal.querySelector('.cancel-btn').addEventListener('click', () => {
                        modal.remove();
                    });
                    
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.remove();
                        }
                    });
                }
                
                // Update message and confirm action
                modal.querySelector('#confirmationMessage').textContent = message;
                const confirmBtn = modal.querySelector('.confirm-btn');
                
                // Remove previous listeners
                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                
                newConfirmBtn.addEventListener('click', () => {
                    modal.remove();
                    confirmCallback();
                });
                
                // Show modal
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
            }

            // Archive project
            async function archiveProject(projectId) {
                    createConfirmationModal(
                        'Are you sure you want to archive this project? Archived projects can be restored later.',
                        async () => {
                            try {
                                const response = await fetch('../Controller/projectsController.php?action=archive', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ projectId })
                                });
                                
                                const data = await response.json();
                                
                                if (data.success) {
                                    showSuccessNotification('Project archived successfully');
                                    loadProjects();
                                } else {
                                    throw new Error(data.message || 'Failed to archive project');
                                }
                            } catch (error) {
                                console.error('Error:', error);
                                showErrorNotification(error.message);
                            }
                        }
                    );
                }
            
            // Unarchive project
            async function unarchiveProject(projectId) {
                try {
                    const response = await fetch('../Controller/projectsController.php?action=unarchive', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ projectId })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showSuccessNotification('Project retrieved successfully');
                        loadProjects();
                        if (document.querySelector('.archived-projects-view')) {
                            loadArchivedProjects();
                        }
                    } else {
                        throw new Error(data.message || 'Failed to retrieve project');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showErrorNotification(error.message);
                }
            }
            
            // Delete project
            async function deleteProject(projectId) {
                createConfirmationModal(
                    'Are you sure you want to permanently delete this project? This action cannot be undone.',
                    async () => {
                        try {
                            const response = await fetch('../Controller/projectsController.php?action=delete', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ projectId })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                showSuccessNotification('Project deleted successfully');
                                loadProjects();
                            } else {
                                throw new Error(data.message || 'Failed to delete project');
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            showErrorNotification(error.message);
                        }
                    }
                );
            }
            
            // Load archived projects
            async function loadArchivedProjects() {
                const container = document.getElementById('archivedProjectsContainer');
                if (!container) return;

                // Show loading state
                container.innerHTML = `
                    <div class="loading-container">
                        <i class="fas fa-spinner fa-spin"></i> Loading archived projects...
                    </div>
                `;

                try {
                    const response = await fetch('../Controller/projectsController.php?action=getArchived');
                    
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (!data.success) {
                        throw new Error(data.message || 'Failed to load archived projects');
                    }

                    if (data.projects && data.projects.length > 0) {
                        container.innerHTML = renderArchivedProjects(data.projects);
                        setupProjectCardActions();
                    } else {
                        container.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-box-open"></i>
                                <p>Your archive is empty</p>
                                <p>Projects you archive will appear here</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Error loading archived projects:', error);
                    container.innerHTML = `
                        <div class="error-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load archived projects</p>
                            <p class="error-detail">${error.message}</p>
                            <button class="btn btn-outline" id="retryLoadBtn">
                                <i class="fas fa-sync-alt"></i> Try Again
                            </button>
                        </div>
                    `;
                    
                    document.getElementById('retryLoadBtn')?.addEventListener('click', loadArchivedProjects);
                }
            }

            function renderArchivedProjects(projects) {
                if (!projects || projects.length === 0) {
                    return `
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <p>Your archive is empty</p>
                            <p>Projects you archive will appear here</p>
                        </div>
                    `;
                }
            
                return `
                    <div class="archived-project-list">
                        ${projects.map(project => {
                            const textColor = getTextColorForBackground(project.color || '#ffffff');
                            const textStyle = `style="color: ${textColor}"`;
                            
                            return `
                            <div class="archived-project-card" 
                                data-project-id="${project.id}" 
                                style="--project-color: ${project.color || '#ffffff'}; --text-color: ${textColor}">
                                
                                <div class="project-info">
                                    <div class="project-header">
                                        <div class="project-title-wrapper">
                                            <h3 class="project-name" ${textStyle}>${escapeHtml(project.name)}</h3>
                                        </div>
                                        <div class="project-actions">
                                            <button class="dropdown-toggle" aria-label="More options" ${textStyle}>
                                                <i class="fas fa-ellipsis-v"></i>
                                            </button>
                                            <div class="dropdown-menu">
                                                <button class="dropdown-item unarchive-project" data-project-id="${project.id}">
                                                    <i class="fas fa-box-open"></i> Retrieve
                                                </button>
                                                <button class="dropdown-item delete-project" data-project-id="${project.id}">
                                                    <i class="fas fa-trash"></i> Delete Permanently
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p class="project-description" ${textStyle}>${escapeHtml(truncateText(project.description, 120))}</p>
                                    
                                    <div class="project-meta">
                                        <div class="project-due-date" ${textStyle}>
                                            ${new Date(project.due_date).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </div>
                                        <div class="project-priority ${project.priority}" ${textStyle}>
                                            ${project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            function setupProjectCardActions() {
                // Close all dropdowns when clicking outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.dropdown-toggle') && !e.target.closest('.dropdown-menu')) {
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            menu.classList.remove('show');
                        });
                    }
                });
            
                // Toggle dropdown menus
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const menu = toggle.nextElementSibling;
                        
                        // Close all other menus
                        document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                            if (otherMenu !== menu) {
                                otherMenu.classList.remove('show');
                            }
                        });
                        
                        menu.classList.toggle('show');
                    });
                });
            
                // Handle unarchive action - only when dropdown is visible
                document.querySelectorAll('.unarchive-project').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const menu = btn.closest('.dropdown-menu');
                        if (!menu || !menu.classList.contains('show')) return;
                        
                        e.stopPropagation();
                        const projectId = btn.dataset.projectId;
                        const projectCard = btn.closest('.archived-project-card');
                        
                        // Add loading state to the card
                        projectCard.innerHTML = `
                            <div class="loading-container" style="color: inherit">
                                <i class="fas fa-spinner fa-spin"></i> Retrieving project...
                            </div>
                        `;
                        
                        try {
                            const response = await fetch('../Controller/projectsController.php?action=unarchive', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ projectId })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                showSuccessNotification('Project retrieved successfully!');
                                
                                // Remove the card from view
                                projectCard.style.opacity = '0';
                                projectCard.style.transform = 'translateY(20px)';
                                projectCard.style.transition = 'all 0.3s ease';
                                
                                setTimeout(() => {
                                    projectCard.remove();
                                    
                                    // Check if we have any projects left
                                    const remainingProjects = document.querySelectorAll('.archived-project-card');
                                    if (remainingProjects.length === 0) {
                                        document.getElementById('archivedProjectsContainer').innerHTML = `
                                            <div class="empty-state">
                                                <i class="fas fa-box-open"></i>
                                                <p>Your archive is empty</p>
                                                <p>Projects you archive will appear here</p>
                                            </div>
                                        `;
                                    }
                                }, 300);
                            } else {
                                throw new Error(data.message || 'Failed to retrieve project');
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            showErrorNotification(error.message);
                            // Reload the card
                            loadArchivedProjects();
                        }
                    });
                });
            
                // Handle delete action - only when dropdown is visible
                document.querySelectorAll('.delete-project').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const menu = btn.closest('.dropdown-menu');
                        if (!menu || !menu.classList.contains('show')) return;
                        
                        e.stopPropagation();
                        const projectId = btn.dataset.projectId;
                        const projectCard = btn.closest('.archived-project-card');
                        
                        // Create confirmation modal
                        createConfirmationModal(
                            'Are you sure you want to permanently delete this project? This action cannot be undone.',
                            async () => {
                                // Add loading state to the card
                                projectCard.innerHTML = `
                                    <div class="loading-container" style="color: inherit">
                                        <i class="fas fa-spinner fa-spin"></i> Deleting project...
                                    </div>
                                `;
                                
                                try {
                                    const response = await fetch('../Controller/projectsController.php?action=delete', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ projectId })
                                    });
                                    
                                    const data = await response.json();
                                    
                                    if (data.success) {
                                        showSuccessNotification('Project deleted permanently');
                                        
                                        // Remove the card from view with animation
                                        projectCard.style.opacity = '0';
                                        projectCard.style.transform = 'scale(0.9)';
                                        projectCard.style.transition = 'all 0.3s ease';
                                        
                                        setTimeout(() => {
                                            projectCard.remove();
                                            
                                            // Check if we have any projects left
                                            const remainingProjects = document.querySelectorAll('.archived-project-card');
                                            if (remainingProjects.length === 0) {
                                                document.getElementById('archivedProjectsContainer').innerHTML = `
                                                    <div class="empty-state">
                                                        <i class="fas fa-box-open"></i>
                                                        <p>Your archive is empty</p>
                                                        <p>Projects you archive will appear here</p>
                                                    </div>
                                                `;
                                            }
                                        }, 300);
                                    } else {
                                        throw new Error(data.message || 'Failed to delete project');
                                    }
                                } catch (error) {
                                    console.error('Error:', error);
                                    showErrorNotification(error.message);
                                    // Reload the card
                                    loadArchivedProjects();
                                }
                            }
                        );
                    });
                });
            }
            
            // Setup project card actions
            function setupProjectCardActions() {
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const menu = toggle.nextElementSibling;
                        
                        // Close all other menus
                        document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                            if (otherMenu !== menu) {
                                otherMenu.classList.remove('show');
                            }
                        });
                        
                        menu.classList.toggle('show');
                    });
                });
                
                // Close menus when clicking outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.dropdown-toggle') && !e.target.closest('.dropdown-menu')) {
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            menu.classList.remove('show');
                        });
                    }
                });
                
                // Unarchive project handler
                document.querySelectorAll('.unarchive-project').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const projectId = btn.dataset.projectId;
                        await projectActions.unarchiveProject(projectId);
                    });
                });
                
                // Delete project handler
                document.querySelectorAll('.delete-project').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const projectId = btn.dataset.projectId;
                        await projectActions.deleteProject(projectId);
                    });
                });
            }
            
            function setupKanbanProjectActions() {
                document.addEventListener('click', (e) => {
                    const dropdownToggle = e.target.closest('.dropdown-toggle');
                    const isInsideDropdown = e.target.closest('.dropdown-menu');

                    if (!dropdownToggle && !isInsideDropdown) {
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            menu.classList.remove('show');
                        });
                    }
                    if (dropdownToggle) {
                        e.preventDefault();
                        e.stopPropagation();
                        const menu = dropdownToggle.nextElementSibling;
                        menu.classList.toggle('show');
                        
                        // Close other open menus
                        document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                            if (otherMenu !== menu) {
                                otherMenu.classList.remove('show');
                            }
                        });
                    }
                    
                    // Handle archive button
                    const archiveBtn = e.target.closest('.archive-project');
                    if (archiveBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        const projectId = archiveBtn.dataset.projectId;
                        projectActions.archiveProject(projectId); // Use the projectActions method
                    }
                    
                    // Handle delete button
                    const deleteBtn = e.target.closest('.delete-project');
                    if (deleteBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        const projectId = deleteBtn.dataset.projectId;
                        projectActions.deleteProject(projectId); // Use the projectActions method
                    }
                });
            }
            
            function initProjectActions() {
                setupKanbanProjectActions();
                if (document.querySelector('.archived-projects-view')) {
                    loadArchivedProjects();
                }
            }

            return {
                init: initProjectActions,
                archiveProject,
                unarchiveProject,
                deleteProject,
                loadArchivedProjects
            };
        }
        
        function getTextColorForBackground(hexColor) {
            if (!hexColor || hexColor === '#ffffff') return '#333';
            const r = parseInt(hexColor.substr(1, 2), 16);
            const g = parseInt(hexColor.substr(3, 2), 16);
            const b = parseInt(hexColor.substr(5, 2), 16);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5 ? '#333' : '#fff';
        }

        function truncateText(text, maxLength) {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }

        function loadProjectView(projectId) {
            contentContainer.innerHTML = `
                <div class="loading-container">
                    <i class="fas fa-spinner fa-spin"></i> Loading project...
                </div>
            `;
        
            fetch(`../View/projectView.php?id=${projectId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load project view: ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    contentContainer.innerHTML = html;
                    document.body.dataset.projectId = projectId;
                    initProjectView(projectId); // Call directly instead of loading projectView.js
                })
                .catch(error => {
                    console.error('Error loading project:', error);
                    contentContainer.innerHTML = `
                        <div class="error-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load project</p>
                            <p class="error-detail">${error.message}</p>
                        </div>
                    `;
                });
        }

        function initProjectView(projectId) {
            // Initialize variables to track instances for cleanup
            let sortableInstances = [];
            let flatpickrInstances = [];
            let activeModals = [];
            let quillEditor = null;
        
            // DOM elements
            const projectViewContainer = document.querySelector('.project-view-container');
            const categoriesContainer = document.querySelector('.categories-container');
            const addCategoryBtn = document.querySelector('.add-category-btn');
            const backToDashboardBtn = document.querySelector('.back-to-dashboard');
            const viewToggleBtns = document.querySelectorAll('.toggle-btn');
            const kanbanView = document.querySelector('.kanban-view');
            const calendarView = document.querySelector('.calendar-view');
            const projectTitle = document.querySelector('.project-title');
            const projectDescription = document.querySelector('.project-description');
            const editDescriptionBtn = document.querySelector('.edit-description-btn');
            const projectDueDate = document.querySelector('.project-due-date input');
        
            // Current calendar state
            let currentCalendarMonth = new Date().getMonth();
            let currentCalendarYear = new Date().getFullYear();
        
            // Initialize the project view
            function initialize() {
                if (!projectId) {
                    showErrorNotification('Project ID is missing');
                    return;
                }
        
                setupEventListeners();
                loadProjectData();
                loadCategories();
            }
        
            function setupEventListeners() {
                backToDashboardBtn?.addEventListener('click', () => {
                    loadPage("../View/dashboard.php");
                });
        
                // View toggle buttons
                viewToggleBtns?.forEach(btn => {
                    btn.addEventListener('click', () => {
                        viewToggleBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
        
                        if (btn.dataset.view === 'kanban') {
                            kanbanView.classList.add('active-view');
                            calendarView.classList.remove('active-view');
                        } else {
                            kanbanView.classList.remove('active-view');
                            calendarView.classList.add('active-view');
                            updateCalendarView();
                        }
                    });
                });
        
                // Add category button
                addCategoryBtn?.addEventListener('click', showCategoryModal);
        
                // Project title editing
                projectTitle?.addEventListener('blur', () => {
                    updateProjectField('name', projectTitle.textContent);
                });
        
                // Project description editing
                editDescriptionBtn?.addEventListener('click', () => {
                    const isEditable = projectDescription.getAttribute('contenteditable') === 'true';
                    if (isEditable) {
                        updateProjectField('description', projectDescription.textContent);
                        projectDescription.setAttribute('contenteditable', 'false');
                        editDescriptionBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Edit';
                    } else {
                        projectDescription.setAttribute('contenteditable', 'true');
                        projectDescription.focus();
                        editDescriptionBtn.innerHTML = '<i class="fas fa-check"></i> Save';
                    }
                });
        
                if (projectDueDate) {
                    const fp = flatpickr(projectDueDate, {
                        dateFormat: "Y-m-d",
                        minDate: "today",
                        allowInput: true,
                        onChange: function(selectedDates, dateStr) {
                            updateProjectField('due_date', dateStr).then(success => {
                                if (success) {
                                    updateDueDateUI(dateStr);
                                }
                            });
                        }
                    });
                    flatpickrInstances.push(fp);
        
                    projectDueDate.addEventListener('blur', () => {
                        const dateStr = projectDueDate.value;
                        if (dateStr && fp.parseDate(dateStr, 'Y-m-d')) {
                            updateProjectField('due_date', dateStr).then(success => {
                                if (success) {
                                    updateDueDateUI(dateStr);
                                }
                            });
                        }
                    });
        
                    loadProjectData();
                }
            }
        
            function setupTaskDetailPanel() {
                const panel = document.createElement('div');
                panel.className = 'task-detail-modal';
                panel.innerHTML = `
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Task Details</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="taskDetailForm">
                                <div class="form-group">
                                    <label for="taskTitle">Title</label>
                                    <input type="text" id="taskTitle" required>
                                </div>
                                <div class="form-group">
                                    <label for="taskDescription">Description</label>
                                    <div id="taskDescriptionEditor"></div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="taskStatus">Status</label>
                                        <select id="taskStatus">
                                            <option value="todo">To Do</option>
                                            <option value="progress">In Progress</option>
                                            <option value="done">Done</option>
                                            <option value="blocked">Blocked</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="taskPriority">Priority</label>
                                        <select id="taskPriority">
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Due Date</label>
                                    <input type="text" id="taskDueDate" class="date-picker">
                                </div>
                                <div class="form-group">
                                    <label>Assignees</label>
                                    <div class="assignees-container">
                                        <div class="assignee-list" id="assigneeList"></div>
                                        <div class="assignee-selector">
                                            <button type="button" class="add-assignee-btn">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                            <div class="assignee-dropdown" id="assigneeDropdown"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-danger" id="deleteTaskBtn">
                                        <i class="fas fa-trash"></i> Delete Task
                                    </button>
                                    <button type="submit" class="btn-primary">
                                        <i class="fas fa-save"></i> Save Changes
                                    </button>
                                </div>
                            </form>
                            <div class="task-activity">
                                <h4>Activity Log</h4>
                                <div class="activity-list" id="activityList"></div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(panel);
            
                // Initialize Quill editor
                const quill = new Quill('#taskDescriptionEditor', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link'],
                            ['clean']
                        ]
                    }
                });
            
                // Initialize date picker
                flatpickr('#taskDueDate', {
                    dateFormat: 'Y-m-d',
                    allowInput: true
                });
            
                let currentTaskId = null;
                let currentAssignees = [];
            
                // Close modal function
                function closeModal() {
                    panel.classList.remove('active');
                    document.body.style.overflow = '';
                    currentTaskId = null;
                    currentAssignees = [];
                    quill.root.innerHTML = '';
                }
            
                // Event listeners for closing modal
                panel.querySelector('.modal-close').addEventListener('click', closeModal);
                panel.querySelector('.modal-overlay').addEventListener('click', closeModal);
            
                // Load assignees dropdown
                async function loadAssigneeDropdown() {
                    try {
                        const response = await fetch('../Controller/projectController.php?action=getFacilityMembers');
                        const data = await response.json();
                        
                        if (data.success) {
                            const dropdown = document.getElementById('assigneeDropdown');
                            dropdown.innerHTML = data.members.map(member => `
                                <div class="dropdown-item" data-user-id="${member.id}">
                                    <img src="../${member.profile_picture}" alt="${member.name}">
                                    <span>${member.name}</span>
                                </div>
                            `).join('');
                            
                            // Show dropdown
                            dropdown.style.display = 'block';
                            
                            // Add click handlers
                            document.querySelectorAll('.dropdown-item').forEach(item => {
                                item.addEventListener('click', () => {
                                    const userId = parseInt(item.dataset.userId);
                                    if (!currentAssignees.includes(userId)) {
                                        currentAssignees.push(userId);
                                        renderAssignees();
                                    }
                                    dropdown.style.display = 'none';
                                });
                            });
                            
                            // Close dropdown when clicking outside
                            document.addEventListener('click', function outsideClickHandler(e) {
                                if (!dropdown.contains(e.target) && e.target !== panel.querySelector('.add-assignee-btn')) {
                                    dropdown.style.display = 'none';
                                    document.removeEventListener('click', outsideClickHandler);
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Error loading assignees:', error);
                        showError('Failed to load assignees. Please try again.');
                    }
                }
            
                // Render assignees list
                async function renderAssignees() {
                    const assigneeList = document.getElementById('assigneeList');
                    assigneeList.innerHTML = '';
                    
                    if (currentAssignees.length === 0) return;
                    
                    try {
                        const response = await fetch(`../Controller/projectController.php?action=getFacilityMembers`);
                        const data = await response.json();
                        
                        if (data.success) {
                            currentAssignees.forEach(userId => {
                                const user = data.members.find(m => m.id === userId);
                                if (user) {
                                    const assigneeItem = document.createElement('div');
                                    assigneeItem.className = 'assignee-item';
                                    assigneeItem.dataset.userId = userId;
                                    assigneeItem.innerHTML = `
                                        <img src="../${user.profile_picture}" alt="${user.name}">
                                        <span class="remove-assignee">&times;</span>
                                    `;
                                    assigneeList.appendChild(assigneeItem);
                                }
                            });
                            
                            // Add remove handlers
                            document.querySelectorAll('.remove-assignee').forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    const userId = parseInt(btn.closest('.assignee-item').dataset.userId);
                                    currentAssignees = currentAssignees.filter(id => id !== userId);
                                    renderAssignees();
                                });
                            });
                        }
                    } catch (error) {
                        console.error('Error rendering assignees:', error);
                    }
                }
            
                // Show task details
                async function showTaskDetails(task) {
                    currentTaskId = task.id;
                    
                    // Set form values
                    document.getElementById('taskTitle').value = task.title;
                    quill.root.innerHTML = task.description || '';
                    document.getElementById('taskStatus').value = task.status;
                    document.getElementById('taskPriority').value = task.priority;
                    document.getElementById('taskDueDate').value = task.due_date || '';
                    
                    // Load assignees
                    try {
                        const response = await fetch(`../Controller/projectController.php?action=getAssignees&taskId=${task.id}`);
                        const data = await response.json();
                        
                        if (data.success) {
                            currentAssignees = data.assignees.map(a => a.id);
                            renderAssignees();
                        }
                    } catch (error) {
                        console.error('Error loading assignees:', error);
                    }
                    
                    // Load activity log
                    loadActivityLog(task.id);
                    
                    // Show modal
                    panel.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            
                // Load activity log
                async function loadActivityLog(taskId) {
                    try {
                        const response = await fetch(`../Controller/projectController.php?action=getTaskActivity&taskId=${taskId}`);
                        const data = await response.json();
                        
                        if (data.success) {
                            const activityList = document.getElementById('activityList');
                            activityList.innerHTML = data.activity.map(activity => `
                                <div class="activity-item">
                                    <div class="activity-user">
                                        <img src="../${activity.profile_picture}" alt="${activity.user_name}">
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-meta">
                                            <span class="user-name">${activity.user_name}</span>
                                            <span class="activity-time">${formatActivityTime(activity.created_at)}</span>
                                        </div>
                                        <div class="activity-action">${formatActivityAction(activity)}</div>
                                    </div>
                                </div>
                            `).join('');
                        }
                    } catch (error) {
                        console.error('Error loading activity:', error);
                    }
                }
            
                // Format activity time
                function formatActivityTime(timestamp) {
                    return new Date(timestamp).toLocaleString();
                }
            
                // Format activity action
                function formatActivityAction(activity) {
                    switch(activity.action) {
                        case 'assignee_added':
                            return `assigned this task to ${activity.details.user_name}`;
                        case 'assignee_removed':
                            return `removed ${activity.details.user_name} from this task`;
                        case 'status_changed':
                            return `changed status to ${activity.details.status}`;
                        case 'created':
                            return `created this task`;
                        default:
                            return activity.action;
                    }
                }
            
                // Add assignee button
                panel.querySelector('.add-assignee-btn').addEventListener('click', loadAssigneeDropdown);
                
                // Form submission
                panel.querySelector('#taskDetailForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    try {
                        const formData = new FormData();
                        formData.append('taskId', currentTaskId);
                        formData.append('title', document.getElementById('taskTitle').value);
                        formData.append('description', quill.root.innerHTML);
                        formData.append('status', document.getElementById('taskStatus').value);
                        formData.append('priority', document.getElementById('taskPriority').value);
                        formData.append('due_date', document.getElementById('taskDueDate').value);
                        
                        const response = await fetch('../Controller/projectController.php?action=updateTask', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                            },
                            body: formData
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            // Update assignees
                            const assigneeResponse = await fetch('../Controller/projectController.php?action=updateAssignees', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                                },
                                body: JSON.stringify({
                                    taskId: currentTaskId,
                                    assignees: currentAssignees
                                })
                            });
                            
                            const assigneeData = await assigneeResponse.json();
                            
                            if (assigneeData.success) {
                                showSuccessNotification('Task updated successfully');
                                closeModal();
                                loadCategories();
                            } else {
                                throw new Error(assigneeData.message || 'Failed to update assignees');
                            }
                        } else {
                            throw new Error(data.message || 'Failed to update task');
                        }
                    } catch (error) {
                        console.error('Error updating task:', error);
                        showError(error.message || 'Failed to update task. Please try again.');
                    }
                });
                
                // Delete task button
                panel.querySelector('#deleteTaskBtn').addEventListener('click', async () => {
                    if (!currentTaskId) return;
                    
                    const confirmed = await showConfirmModal(
                        'Delete Task',
                        'Are you sure you want to delete this task? This action cannot be undone.',
                        'Delete',
                        'Cancel'
                    );
                    
                    if (confirmed) {
                        try {
                            const response = await fetch('../Controller/projectController.php?action=deleteTask', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                                },
                                body: JSON.stringify({ taskId: currentTaskId })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                showSuccessNotification('Task deleted successfully');
                                closeModal();
                                loadCategories();
                            } else {
                                throw new Error(data.message || 'Failed to delete task');
                            }
                        } catch (error) {
                            console.error('Error deleting task:', error);
                            showError(error.message || 'Failed to delete task. Please try again.');
                        }
                    }
                });
            
                return {
                    show: showTaskDetails,
                    close: closeModal
                };
            }
        
            const taskDetailPanel = setupTaskDetailPanel();
        
            function loadProjectData() {
                fetch(`../Controller/projectController.php?action=getProjectDetails&projectId=${projectId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            updateProjectUI(data.project);
                            if (data.categories.length > 0) {
                                document.getElementById('noCategoriesMessage')?.remove();
                                renderCategories(data.categories);
                            }
                        } else {
                            throw new Error(data.message || 'Failed to load project');
                        }
                    })
                    .catch(error => {
                        console.error('Error loading project:', error);
                        showErrorNotification(error.message);
                    });
            }
        
            function updateProjectNavName(projectId, newName) {
                const projectNavItem = document.querySelector(`.nav-item[data-view="project-${projectId}"] .nav-item-text`);
                if (projectNavItem) {
                    projectNavItem.textContent = newName;
                }
            }
        
            function updateProjectUI(project) {
                if (projectTitle) projectTitle.textContent = project.name;
                if (projectDescription) projectDescription.textContent = project.description;
        
                const statusBadge = document.querySelector('.project-status-badge');
                if (statusBadge) {
                    statusBadge.className = `project-status-badge ${project.status}`;
                    statusBadge.textContent = project.status.charAt(0).toUpperCase() + project.status.slice(1);
                }
        
                const priorityBadge = document.querySelector('.project-priority');
                if (priorityBadge) {
                    priorityBadge.className = `project-priority ${project.priority}`;
                    priorityBadge.textContent = project.priority.charAt(0).toUpperCase() + project.priority.slice(1);
                }
            }
        
            function loadCategories() {
                fetch(`../Controller/projectController.php?action=getCategories&projectId=${projectId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.categories) {
                            renderCategories(data.categories);
                            if (data.categories.length > 0) {
                                document.getElementById('noCategoriesMessage')?.remove();
                            } else {
                                if (!document.getElementById('noCategoriesMessage')) {
                                    const noCategoriesMsg = document.createElement('div');
                                    noCategoriesMsg.id = 'noCategoriesMessage';
                                    noCategoriesMsg.innerHTML = `
                                        <i class="fas fa-folder-open" aria-hidden="true"></i>
                                        <p>No categories yet</p>
                                    `;
                                    categoriesContainer.appendChild(noCategoriesMsg);
                                }
                            }
                        } else {
                            throw new Error(data.message || 'Failed to load categories');
                        }
                    })
                    .catch(error => {
                        console.error('Error loading categories:', error);
                        showErrorNotification(error.message);
                    });
            }
        
            function renderCategories(categories) {
                if (!categoriesContainer) return;
            
                document.querySelectorAll('.category-column').forEach(el => el.remove());
            
                categories.forEach(category => {
                    const categoryColumn = document.createElement('div');
                    categoryColumn.className = 'category-column';
                    categoryColumn.dataset.categoryId = category.id;
                    categoryColumn.innerHTML = `
                        <div class="category-header" style="border-color: ${category.color}">
                            <h3 contenteditable="true" class="editable-category-name">${escapeHtml(category.name)}</h3>
                            <div class="category-actions">
                                <button class="btn-icon add-task-btn" title="Add Task">
                                    <i class="fas fa-plus"></i>
                                </button>
                                <button class="btn-icon delete-category-btn" title="Delete Category">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="category-task-list" data-sortable-initialized="false">
                            <div class="empty-state">
                                <i class="fas fa-tasks"></i>
                                <p>No tasks in this category</p>
                            </div>
                        </div>
                    `;
            
                    categoriesContainer.appendChild(categoryColumn);
            
                    // Make category name editable and save on blur/enter
                    const categoryNameEl = categoryColumn.querySelector('.editable-category-name');
                    let isEditing = false;
                    let originalName = category.name;
            
                    categoryNameEl.addEventListener('focus', () => {
                        isEditing = true;
                        originalName = categoryNameEl.textContent;
                        categoryNameEl.classList.add('editing');
                    });
            
                    categoryNameEl.addEventListener('blur', async () => {
                        if (!isEditing) return;
                        isEditing = false;
                        categoryNameEl.classList.remove('editing');
            
                        const newName = categoryNameEl.textContent.trim();
                        if (!newName) {
                            categoryNameEl.textContent = originalName;
                            return;
                        }
            
                        if (newName !== originalName) {
                            try {
                                const response = await fetch('../Controller/projectController.php?action=updateCategory', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                                    },
                                    body: JSON.stringify({
                                        categoryId: category.id,
                                        name: newName
                                    })
                                });
            
                                const data = await response.json();
                                if (data.success) {
                                    category.name = newName; // Update local copy
                                    showSuccessNotification('Category name updated');
                                } else {
                                    throw new Error(data.message || 'Failed to update category name');
                                }
                            } catch (error) {
                                console.error('Error updating category name:', error);
                                showErrorNotification(error.message);
                                categoryNameEl.textContent = originalName; // Revert to original name
                            }
                        }
                    });
            
                    categoryNameEl.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            categoryNameEl.blur();
                        }
                    });
            
                    // Add task button functionality
                    const addTaskBtn = categoryColumn.querySelector('.add-task-btn');
                    addTaskBtn.addEventListener('click', () => {
                        const taskList = categoryColumn.querySelector('.category-task-list');
                        const addTaskForm = document.createElement('div');
                        addTaskForm.className = 'add-task-form active';
                        addTaskForm.innerHTML = `
                            <input type="text" class="add-task-input" placeholder="Enter a title for this task...">
                            <div class="add-task-actions">
                                <button type="button" class="add-task-btn">Add Task</button>
                                <button type="button" class="cancel-add-task">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
            
                        taskList.appendChild(addTaskForm);
                        updateEmptyState(taskList);
            
                        const input = addTaskForm.querySelector('.add-task-input');
                        const saveBtn = addTaskForm.querySelector('.add-task-btn');
                        const cancelBtn = addTaskForm.querySelector('.cancel-add-task');
            
                        setTimeout(() => input.focus(), 10);
            
                        saveBtn.addEventListener('click', async () => {
                            const title = input.value.trim();
                            if (!title) return;
            
                            try {
                                const response = await fetch('../Controller/projectController.php?action=createTask', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                                    },
                                    body: JSON.stringify({
                                        projectId: projectId,
                                        categoryId: category.id,
                                        title: title,
                                        status: 'todo'
                                    })
                                });
            
                                const data = await response.json();
                                if (data.success) {
                                    loadTasksForCategory(category.id);
                                    addTaskForm.remove();
                                    updateEmptyState(taskList);
                                } else {
                                    throw new Error(data.message || 'Failed to create task');
                                }
                            } catch (error) {
                                console.error('Error creating task:', error);
                                showErrorNotification(error.message);
                            }
                        });
            
                        cancelBtn.addEventListener('click', () => {
                            addTaskForm.remove();
                            updateEmptyState(taskList);
                        });
            
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter') {
                                saveBtn.click();
                            }
                        });
                    });
            
                    // Delete category button functionality
                    categoryColumn.querySelector('.delete-category-btn').addEventListener('click', () => {
                        deleteCategory(category.id);
                    });
            
                    const taskList = categoryColumn.querySelector('.category-task-list');
                    updateEmptyState(taskList);
                    
                    if (category.task_count > 0) {
                        loadTasksForCategory(category.id);
                    }
            
                    initializeSortable(categoryColumn.querySelector('.category-task-list'));
                });
            
                if (!document.querySelector('.add-category-btn')) {
                    const addBtn = document.createElement('button');
                    addBtn.className = 'add-category-btn';
                    addBtn.innerHTML = '<i class="fas fa-plus"></i>';
                    addBtn.title = 'Add Category';
                    addBtn.addEventListener('click', showCategoryModal);
                    categoriesContainer.appendChild(addBtn);
                }
            }

            async function loadTasksForCategory(categoryId) {
                try {
                    const response = await fetch(`../Controller/projectController.php?action=getTasks&categoryId=${categoryId}&projectId=${projectId}`);
                    const data = await response.json();
                    
                    if (data.success && data.tasks) {
                        const tasksWithAssignees = await Promise.all(data.tasks.map(async task => {
                            const assigneeResponse = await fetch(`../Controller/projectController.php?action=getAssignees&taskId=${task.id}`);
                            const assigneeData = await assigneeResponse.json();
                            
                            return {
                                ...task,
                                assignees: assigneeData.success ? assigneeData.assignees : []
                            };
                        }));
                        
                        renderTasks(tasksWithAssignees, categoryId);
                        const taskList = document.querySelector(`.category-column[data-category-id="${categoryId}"] .category-task-list`);
                        if (taskList) {
                            updateEmptyState(taskList);
                        }
                    } else {
                        throw new Error(data.message || 'Failed to load tasks');
                    }
                } catch (error) {
                    console.error('Error loading tasks:', error);
                    showErrorNotification(error.message);
                }
            }
        
            function renderTasks(tasks, categoryId) {
                const taskList = document.querySelector(`.category-column[data-category-id="${categoryId}"] .category-task-list`);
                if (!taskList) return;
            
                taskList.innerHTML = '';
            
                if (tasks.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <p>No tasks in this category</p>
                        </div>
                    `;
                    return;
                }
            
                tasks.forEach(task => {
                    const taskCard = document.createElement('div');
                    taskCard.className = `task-card ${task.priority}`;
                    taskCard.dataset.taskId = task.id;
                    taskCard.draggable = true;
                    taskCard.innerHTML = `
                        <div class="task-content">
                            <h4>${escapeHtml(task.title)}</h4>
                            ${task.description ? `<p>${escapeHtml(truncateText(task.description, 50))}</p>` : ''}
                            ${task.due_date ? `
                                <div class="task-due-date">
                                    <i class="far fa-calendar-alt"></i>
                                    ${new Date(task.due_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            ` : ''}
                        </div>
                        <div class="task-actions">
                            <button class="btn-icon edit-task-btn" title="Edit Task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete-task-btn" title="Delete Task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
            
                    taskCard.addEventListener('dragstart', () => {
                        taskCard.classList.add('dragging');
                    });
            
                    taskCard.addEventListener('dragend', () => {
                        taskCard.classList.remove('dragging');
                        updateEmptyState(taskList);
                    });
            
                    taskList.appendChild(taskCard);
            
                    taskCard.addEventListener('click', (e) => {
                        if (!e.target.closest('.task-actions')) {
                            taskDetailPanel.show(task);
                        }
                    });
            
                    taskCard.querySelector('.edit-task-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        taskDetailPanel.show(task);
                    });
            
                    taskCard.querySelector('.delete-task-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteTask(task.id, categoryId);
                    });
                });
            
                // Remove any existing empty state
                const emptyState = taskList.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }
            }
        
            function initializeSortable(list) {
                const categoryId = list.closest('.category-column').dataset.categoryId;
                const emptyState = list.querySelector('.empty-state');
                
                list.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const draggingTask = document.querySelector('.task-card.dragging');
                    if (!draggingTask) return;
            
                    const afterElement = getDragAfterElement(list, e.clientY);
                    const placeholder = list.querySelector('.drop-placeholder') || document.createElement('div');
                    placeholder.className = 'drop-placeholder';
            
                    if (afterElement) {
                        list.insertBefore(placeholder, afterElement);
                    } else {
                        list.appendChild(placeholder);
                    }
            
                    if (emptyState) {
                        emptyState.style.display = 'none';
                    }
                });
            
                list.addEventListener('dragleave', (e) => {
                    if (!list.contains(e.relatedTarget)) {
                        const placeholder = list.querySelector('.drop-placeholder');
                        if (placeholder) placeholder.remove();
                    }
                });
            
                list.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    const placeholder = list.querySelector('.drop-placeholder');
                    const draggingTask = document.querySelector('.task-card.dragging');
                    if (!draggingTask) return;
            
                    const taskId = draggingTask.dataset.taskId;
                    const sourceTaskList = draggingTask.closest('.category-task-list');
                    const sourceCategoryId = sourceTaskList.closest('.category-column').dataset.categoryId;
            
                    const tasks = Array.from(list.querySelectorAll('.task-card:not(.dragging)'));
                    let newPosition = tasks.length;
            
                    if (placeholder) {
                        const placeholderIndex = Array.from(list.children).indexOf(placeholder);
                        if (placeholderIndex > -1) {
                            newPosition = placeholderIndex;
                        }
                        placeholder.remove();
                    }
            
                    try {
                        const response = await fetch('../Controller/projectController.php?action=updateTaskPosition', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                            },
                            body: JSON.stringify({ 
                                taskId, 
                                categoryId, 
                                position: newPosition 
                            })
                        });
            
                        const data = await response.json();
                        
                        if (data.success) {
                            if (placeholder && placeholder.parentNode === list) {
                                list.insertBefore(draggingTask, placeholder);
                            } else {
                                list.appendChild(draggingTask);
                            }
                        
                            draggingTask.classList.remove('dragging');
                            await Promise.all([
                                loadTasksForCategory(categoryId),
                                sourceCategoryId !== categoryId ? loadTasksForCategory(sourceCategoryId) : Promise.resolve()
                            ]);
                        } else {
                            throw new Error(data.message || 'Failed to update task position');
                        }
                    } catch (error) {
                        console.error('Error updating task position:', error);
                        showErrorNotification('Failed to update task position. Please try again.');
                        loadCategories();
                    }
                });
            }
        
            function updateEmptyState(taskList) {
                const tasks = taskList.querySelectorAll('.task-card');
                const emptyState = taskList.querySelector('.empty-state');
                const addTaskForm = taskList.querySelector('.add-task-form');
        
                if (tasks.length === 0 && !addTaskForm) {
                    if (!emptyState) {
                        const emptyDiv = document.createElement('div');
                        emptyDiv.className = 'empty-state';
                        emptyDiv.innerHTML = `
                            <i class="fas fa-tasks"></i>
                            <p>No tasks in this category</p>
                        `;
                        taskList.appendChild(emptyDiv);
                    } else {
                        emptyState.style.display = 'flex';
                    }
                } else {
                    if (emptyState) {
                        emptyState.style.display = 'none';
                    }
                }
            }
        
            function getDragAfterElement(container, y) {
                const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
        
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }
        
            function showCategoryModal() {
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-container small">
                        <div class="modal-header">
                            <h3>Add New Category</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-content">
                            <form id="categoryForm">
                                <div class="input-group">
                                    <label for="categoryName">Category Name</label>
                                    <input type="text" id="categoryName" required maxlength="50">
                                    <div class="char-counter"><span>0</span>/50</div>
                                </div>
                                <div class="modal-actions">
                                    <button type="button" class="btn btn-outline cancel-btn">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
        
                document.body.appendChild(modal);
                activeModals.push(modal);
        
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
        
                const form = modal.querySelector('#categoryForm');
                const nameInput = modal.querySelector('#categoryName');
                const charCounter = modal.querySelector('.char-counter span');
        
                nameInput.addEventListener('input', () => {
                    charCounter.textContent = nameInput.value.length;
                });
        
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
        
                    const name = nameInput.value.trim();
        
                    if (!name) {
                        showError('Category name is required');
                        return;
                    }
        
                    try {
                        const response = await fetch('../Controller/projectController.php?action=addCategory', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
                            },
                            body: JSON.stringify({
                                projectId: projectId,
                                name: name
                            })
                        });
        
                        const data = await response.json();
                        if (data.success) {
                            showSuccessNotification('Category added successfully');
                            loadCategories();
                            closeModal(modal);
                        } else {
                            throw new Error(data.message || 'Failed to add category');
                        }
                    } catch (error) {
                        console.error('Error adding category:', error);
                        showErrorNotification(error.message);
                    }
                });
        
                modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
                modal.querySelector('.cancel-btn').addEventListener('click', () => closeModal(modal));
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal(modal);
                    }
                });
            }
        
            async function deleteCategory(categoryId) {
                const confirmed = await showConfirmModal(
                    'Delete Category',
                    'Are you sure you want to delete this category? All tasks will be deleted.',
                    'Delete',
                    'Cancel'
                );
        
                if (!confirmed) return;
        
                try {
                    const response = await fetch('../Controller/projectController.php?action=deleteCategory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
                        },
                        body: JSON.stringify({ categoryId })
                    });
        
                    const data = await response.json();
                    if (data.success) {
                        showSuccessNotification('Category deleted successfully');
                        const categoryColumn = document.querySelector(`.category-column[data-category-id="${categoryId}"]`);
                        if (categoryColumn) {
                            categoryColumn.remove();
                        }
                    } else {
                        throw new Error(data.message || 'Failed to delete category');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    showErrorNotification(error.message);
                }
            }
        
            async function deleteTask(taskId, categoryId) {
                const confirmed = await showConfirmModal(
                    'Delete Task',
                    'Are you sure you want to delete this task?',
                    'Delete',
                    'Cancel'
                );
            
                if (!confirmed) return;
            
                try {
                    const response = await fetch('../Controller/projectController.php?action=deleteTask', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
                        },
                        body: JSON.stringify({ taskId: taskId })
                    });
            
                    const data = await response.json();
                    if (data.success) {
                        showSuccessNotification('Task deleted successfully');
                        // Reload tasks for the category to refresh the UI
                        await loadTasksForCategory(categoryId);
                    } else {
                        throw new Error(data.message || 'Failed to delete task');
                    }
                } catch (error) {
                    console.error('Error deleting task:', error);
                    showErrorNotification(error.message);
                }
            }
        
            function updateDueDateUI(dateStr) {
                if (projectDueDate) {
                    projectDueDate.value = dateStr;
                }
                const dueDateDisplay = document.querySelector('.project-due-date-display');
                if (dueDateDisplay) {
                    dueDateDisplay.textContent = new Date(dateStr).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }
            }
        
            async function updateProjectField(field, value) {
                try {
                    const response = await fetch('../Controller/projectController.php?action=updateProject', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
                        },
                        body: JSON.stringify({
                            projectId: projectId,
                            field: field,
                            value: value
                        })
                    });
        
                    const data = await response.json();
                    if (data.success) {
                        if (field === 'name') {
                            updateProjectNavName(projectId, value);
                        }
                        return true;
                    } else {
                        throw new Error(data.message || 'Failed to update project');
                    }
                } catch (error) {
                    console.error('Error updating project:', error);
                    showErrorNotification(error.message);
                    loadProjectData();
                    return false;
                }
            }
        
            function updateCalendarView() {
                if (!calendarView) return;
        
                calendarView.innerHTML = `
                    <div class="loading-container">
                        <i class="fas fa-spinner fa-spin"></i> Loading calendar...
                    </div>
                `;
        
                fetch(`../Controller/projectController.php?action=getTasks&projectId=${projectId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.tasks) {
                            renderCalendarView(data.tasks);
                            setupCalendarNavigation();
                        } else {
                            throw new Error(data.message || 'Failed to load tasks for calendar');
                        }
                    })
                    .catch(error => {
                        console.error('Error loading calendar tasks:', error);
                        calendarView.innerHTML = `
                            <div class="error-state">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p>Failed to load calendar</p>
                            </div>
                        `;
                    });
            }
        
            function setupCalendarNavigation() {
                document.querySelector('.prev-month')?.addEventListener('click', () => {
                    currentCalendarMonth--;
                    if (currentCalendarMonth < 0) {
                        currentCalendarMonth = 11;
                        currentCalendarYear--;
                    }
                    updateCalendarView();
                });
        
                document.querySelector('.next-month')?.addEventListener('click', () => {
                    currentCalendarMonth++;
                    if (currentCalendarMonth > 11) {
                        currentCalendarMonth = 0;
                        currentCalendarYear++;
                    }
                    updateCalendarView();
                });
            }
        
            function renderCalendarView(tasks) {
                const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
        
                const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
                const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
        
                calendarView.innerHTML = `
                    <div class="calendar-header">
                        <button class="calendar-nav-btn prev-month"><i class="fas fa-chevron-left"></i></button>
                        <h3 class="calendar-month-year">${monthNames[currentCalendarMonth]} ${currentCalendarYear}</h3>
                        <button class="calendar-nav-btn next-month"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="calendar-grid">
                        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
                            <div class="calendar-day-header">${day}</div>
                        `).join('')}
                        ${Array(42).fill().map((_, i) => `
                            <div class="calendar-day"></div>
                        `).join('')}
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
                `;
        
                const dayElements = calendarView.querySelectorAll('.calendar-day');
                let dayCount = 1;
                const now = new Date();
        
                dayElements.forEach((dayEl, index) => {
                    dayEl.innerHTML = '';
                    dayEl.classList.remove('current-month', 'today');
        
                    if (index >= firstDay && dayCount <= daysInMonth) {
                        dayEl.classList.add('current-month');
                        dayEl.innerHTML = `<div class="day-number">${dayCount}</div>`;
        
                        if (dayCount === now.getDate() && currentCalendarMonth === now.getMonth() && currentCalendarYear === now.getFullYear()) {
                            dayEl.classList.add('today');
                        }
        
                        const currentDate = new Date(currentCalendarYear, currentCalendarMonth, dayCount).toISOString().split('T')[0];
                        const dayTasks = tasks.filter(task => task.due_date === currentDate);
        
                        if (dayTasks.length > 0) {
                            const tasksContainer = document.createElement('div');
                            tasksContainer.className = 'day-tasks';
        
                            dayTasks.forEach(task => {
                                const taskEl = document.createElement('div');
                                taskEl.className = `calendar-task ${task.priority}`;
                                taskEl.textContent = task.title;
                                taskEl.title = task.description || task.title;
                                taskEl.addEventListener('click', () => {
                                    taskDetailPanel.show(task);
                                });
                                tasksContainer.appendChild(taskEl);
                            });
        
                            dayEl.appendChild(tasksContainer);
                        }
        
                        dayCount++;
                    }
                });
            }
        
            function closeModal(modal) {
                if (!modal) return;
        
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        
            function cleanup() {
                sortableInstances.forEach(sortable => {
                    if (sortable && sortable.destroy) {
                        sortable.destroy();
                    }
                });
        
                flatpickrInstances.forEach(fp => {
                    if (fp && fp.destroy) {
                        fp.destroy();
                    }
                });
        
                activeModals.forEach(modal => {
                    if (modal && modal.parentNode) {
                        modal.remove();
                    }
                });
        
                if (quillEditor) {
                    quillEditor = null;
                }
        
                sortableInstances = [];
                flatpickrInstances = [];
                activeModals = [];
            }
        
            function showSuccessNotification(message, duration = 3000) {
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${message}</span>
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
                }, duration);
            }
            
            function showErrorNotification(message, duration = 5000) {
                const notification = document.createElement('div');
                notification.className = 'notification error';
                notification.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${message}</span>
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
                }, duration);
            }
            
            function showConfirmModal(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
                return new Promise((resolve) => {
                    const modal = document.createElement('div');
                    modal.className = 'confirm-modal';
                    modal.innerHTML = `
                        <div class="modal-overlay"></div>
                        <div class="modal-content">
                            <h3>${title}</h3>
                            <p>${message}</p>
                            <div class="modal-actions">
                                <button class="btn-cancel">${cancelText}</button>
                                <button class="btn-confirm">${confirmText}</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    modal.classList.add('active');
                    
                    const confirmHandler = () => {
                        resolve(true);
                        closeModal();
                    };
                    
                    const cancelHandler = () => {
                        resolve(false);
                        closeModal();
                    };
                    
                    const closeModal = () => {
                        modal.classList.remove('active');
                        setTimeout(() => {
                            modal.remove();
                        }, 300);
                    };
                    
                    modal.querySelector('.btn-confirm').addEventListener('click', confirmHandler);
                    modal.querySelector('.btn-cancel').addEventListener('click', cancelHandler);
                    modal.querySelector('.modal-overlay').addEventListener('click', cancelHandler);
                });
            }
        
            // Utility function to escape HTML
            function escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
        
            // Utility function to truncate text
            function truncateText(text, maxLength) {
                if (text.length > maxLength) {
                    return text.substring(0, maxLength - 3) + '...';
                }
                return text;
            }
        
            initialize();
        
            return {
                cleanup: cleanup
            };
        }

        loadPage("../View/dashboard.php");
        
        navItems.forEach(item => {
            item.addEventListener("click", function () {
                navItems.forEach(el => el.classList.remove("active"));
                this.classList.add("active");
        
                const view = this.getAttribute("data-view");
                
                if (view.startsWith('project-')) {
                    const projectId = view.split('-')[1];
                    loadProjectView(projectId);
                } else {
                    const views = {
                        "dashboard": "../View/dashboard.php",
                        "members": "../View/members.php",
                        "settings": "../View/settings.php",
                        "archived-projects": "../View/archivedProject.php"
                    };
                    
                    loadPage(views[view] || "../View/dashboard.php");
                }
            });
        });
    }
});