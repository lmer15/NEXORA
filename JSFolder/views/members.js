document.addEventListener('DOMContentLoaded', function() {
    // Sample member data - in a real app, you'd fetch this from your backend
    const members = [
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            role: "owner",
            joined: "Jan 15, 2023",
            initials: "JD"
        },
        {
            id: 2,
            name: "Alice Smith",
            email: "alice.smith@example.com",
            role: "admin",
            joined: "Mar 22, 2023",
            initials: "AS"
        },
        {
            id: 3,
            name: "Robert Johnson",
            email: "robert.j@example.com",
            role: "member",
            joined: "May 10, 2023",
            initials: "RJ"
        },
        {
            id: 4,
            name: "Maria Garcia",
            email: "maria.g@example.com",
            role: "member",
            joined: "Aug 5, 2023",
            initials: "MG"
        }
    ];

    // DOM elements
    const membersTable = document.querySelector('.members-table tbody');
    const regenerateBtn = document.querySelector('.regenerate-btn');
    const codeValue = document.querySelector('.code-value');
    const inviteBtn = document.querySelector('.invite-btn');
    const inviteModal = document.getElementById('inviteModal');
    const inviteLink = document.querySelector('.invite-link');
    const copyBtn = document.querySelector('.copy-btn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmBtn = document.querySelector('.confirm-btn');

    // Color mapping for avatars
    const avatarColors = {
        owner: '#1971c2',
        admin: '#06a566',
        member: '#f08c00'
    };

    // Initialize the page
    function initPage() {
        renderMembersTable();
        setupEventListeners();
    }

    // Render members table
    function renderMembersTable() {
        membersTable.innerHTML = '';
        
        members.forEach(member => {
            const row = document.createElement('tr');
            const isOwner = member.role === 'owner';
            
            row.innerHTML = `
                <td>
                    <div class="member-info">
                        <div class="avatar" style="background-color: ${avatarColors[member.role]}">${member.initials}</div>
                        <div class="member-details">
                            <span class="member-name">${member.name}</span>
                            <span class="member-status">${capitalizeFirstLetter(member.role)}</span>
                        </div>
                    </div>
                </td>
                <td>${member.email}</td>
                <td>
                    <span class="role-badge ${member.role}">${capitalizeFirstLetter(member.role)}</span>
                </td>
                <td>${member.joined}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" ${isOwner ? 'disabled' : ''} data-action="toggle-admin" data-member-id="${member.id}">
                            <i class="fas ${member.role === 'admin' ? 'fa-user-shield' : 'fa-crown'}"></i>
                        </button>
                        <button class="btn-icon danger" ${isOwner ? 'disabled' : ''} data-action="remove-member" data-member-id="${member.id}">
                            <i class="fas fa-user-times"></i>
                        </button>
                    </div>
                </td>
            `;
            
            membersTable.appendChild(row);
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Facility code regeneration
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', regenerateFacilityCode);
        }
        
        // Invite modal
        if (inviteBtn && inviteModal) {
            inviteBtn.addEventListener('click', openInviteModal);
        }
        
        // Copy invite link
        if (copyBtn) {
            copyBtn.addEventListener('click', copyInviteLink);
        }
        
        // Close modals
        const closeButtons = document.querySelectorAll('.modal-close, .cancel-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        // Click outside modal to close
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal.call(modal);
                }
            });
        });
        
        // Member actions (delegated events)
        membersTable.addEventListener('click', handleMemberAction);
    }

    // Handle member actions
    function handleMemberAction(e) {
        const btn = e.target.closest('.btn-icon');
        if (!btn) return;
        
        const action = btn.dataset.action;
        const memberId = parseInt(btn.dataset.memberId);
        const member = members.find(m => m.id === memberId);
        
        if (!member) return;
        
        if (action === 'toggle-admin') {
            showConfirmModal(
                `Are you sure you want to ${member.role === 'admin' ? 'revoke admin privileges from' : 'make'} ${member.name} an admin?`,
                () => {
                    // In a real app, this would call your backend
                    member.role = member.role === 'admin' ? 'member' : 'admin';
                    renderMembersTable();
                    showNotification(
                        `${member.name} ${member.role === 'admin' ? 'promoted to admin' : 'demoted to member'} successfully!`, 
                        'success'
                    );
                }
            );
        } 
        else if (action === 'remove-member') {
            showConfirmModal(
                `Are you sure you want to remove ${member.name} from the facility?`,
                () => {
                    // In a real app, this would call your backend
                    const index = members.findIndex(m => m.id === memberId);
                    if (index !== -1) {
                        members.splice(index, 1);
                        renderMembersTable();
                        showNotification(
                            `${member.name} removed successfully!`, 
                            'success'
                        );
                    }
                }
            );
        }
    }

    // Regenerate facility code
    function regenerateFacilityCode() {
        // In a real app, this would call your backend
        const newCode = generateRandomCode();
        codeValue.textContent = newCode;
        showNotification('Facility code regenerated successfully!', 'success');
    }

    // Open invite modal
    function openInviteModal() {
        inviteModal.style.display = 'flex';
        setTimeout(() => {
            inviteModal.classList.add('show');
            document.querySelector('.modal-container').classList.add('show');
        }, 10);
        
        // Update invite link with current code
        inviteLink.value = `http://${window.location.host}/join/${codeValue.textContent}`;
    }

    // Copy invite link
    function copyInviteLink() {
        inviteLink.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }

    // Show confirmation modal
    function showConfirmModal(message, confirmCallback) {
        confirmMessage.textContent = message;
        confirmModal.style.display = 'flex';
        
        setTimeout(() => {
            confirmModal.classList.add('show');
            document.querySelector('.modal-container').classList.add('show');
        }, 10);
        
        // Set up confirm button action
        confirmBtn.onclick = function() {
            confirmCallback();
            closeModal.call(confirmModal);
        };
    }

    // Close modal
    function closeModal() {
        this.classList.remove('show');
        setTimeout(() => {
            this.style.display = 'none';
        }, 300);
    }

    // Helper functions
    function generateRandomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            if (i === 4) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Initialize the page
    initPage();
});