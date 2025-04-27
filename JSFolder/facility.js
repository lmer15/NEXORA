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
            // Set up drop zones
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
                    loadProjectDetails(project.id);
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
        
        function loadProjectDetails(projectId) {
            console.log('Loading project:', projectId);
            // You can fetch project details and display them in the main content area
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
            `;
        
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', project.id);
                element.classList.add('dragging');
                
                const dragImage = element.cloneNode(true);
                dragImage.style.width = `${element.offsetWidth}px`;
                dragImage.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
                dragImage.style.transform = 'rotate(2deg)';
                dragImage.style.position = 'fixed';
                dragImage.style.pointerEvents = 'none';
                dragImage.style.zIndex = '10000';
                dragImage.id = 'drag-ghost';
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 0, 0);
            });
        
            element.addEventListener('dragend', () => {
                element.classList.remove('dragging');
                const ghost = document.getElementById('drag-ghost');
                if (ghost) ghost.remove();
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
                        
                        // If on archived projects page, reload that content
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
            
                container.innerHTML = `
                    <div class="loading-container">
                        <i class="fas fa-spinner fa-spin"></i> Loading archived projects...
                    </div>
                `;
            
                try {
                    const response = await fetch('../Controller/projectsController.php?action=getArchived');
                    const data = await response.json();
                    
                    if (data.success && data.projects.length > 0) {
                        container.innerHTML = renderArchivedProjects(data.projects);
                        setupProjectCardActions();
                    } else {
                        container.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-box-open"></i>
                                <p>No archived projects found</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Error loading archived projects:', error);
                    container.innerHTML = `
                        <div class="error-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load archived projects</p>
                        </div>
                    `;
                }
            }
            
            // Render archived projects
            function renderArchivedProjects(projects) {
                return `
                    <div class="projects-grid">
                        ${projects.map(project => `
                            <div class="archived-project-card" data-project-id="${project.id}">
                                <div class="project-header">
                                    <h3 class="project-title">${escapeHtml(project.name)}</h3>
                                    <span class="project-priority ${project.priority}">
                                        ${project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                                    </span>
                                </div>
                                <div class="project-meta">
                                    <div class="project-due-date">
                                        <i class="far fa-calendar-alt"></i>
                                        ${new Date(project.due_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <p class="project-description">${escapeHtml(truncateText(project.description, 100))}</p>
                                <div class="project-footer">
                                    <div class="project-owner">
                                        <i class="fas fa-user"></i>
                                        ${escapeHtml(project.owner_name)}
                                    </div>
                                    <div class="dropdown">
                                        <button class="btn-icon dropdown-toggle" aria-label="More options">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </button>
                                        <div class="dropdown-menu">
                                            <button class="dropdown-item unarchive-project" data-project-id="${project.id}">
                                                <i class="fas fa-box-open"></i> Retrieve
                                            </button>
                                            <button class="dropdown-item delete-project" data-project-id="${project.id}">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Setup project card actions
            function setupProjectCardActions() {
                document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                    toggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const menu = toggle.nextElementSibling;
                        menu.classList.toggle('show');
                        
                        // Close other open menus
                        document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                            if (otherMenu !== menu) {
                                otherMenu.classList.remove('show');
                            }
                        });
                    });
                });
                
                // Close menus when clicking outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.dropdown')) {
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
                        await unarchiveProject(projectId);
                    });
                });
                
                // Delete project handler
                document.querySelectorAll('.delete-project').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const projectId = btn.dataset.projectId;
                        await deleteProject(projectId);
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
            
            // Initialize all project action handlers
            function initProjectActions() {
                setupKanbanProjectActions();
                
                // If on archived projects page, load the projects
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
                    "archived-projects": "../View/archivedProject.php",
                    "project-alpha": "../View/project-alpha.php",
                    "project-beta": "../View/project-beta.php"
                };
        
                loadPage(views[view] || "../View/dashboard.php");
            });
        });
    }
});