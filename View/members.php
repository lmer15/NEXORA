<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facility Members</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="default.css">
    <link rel="stylesheet" href="../CSS_Files/views/members.css">
</head>
<body>
    <div class="members-container">        
        <!-- Facility Code Section -->
        <div class="facility-code-section">
            <div class="section-header">
                <h2>Facility Access</h2>
                <div class="divider"></div>
            </div>
            
            <div class="code-container">
                <div class="code-display">
                    <div class="code">
                        <span class="code-label">Facility Code:</span>
                        <span class="code-value">XK7H-9P2M</span>
                    </div>
                    <div class="desc">
                        <span class="code-description">Invite other people to join in your facility. 
                        You can use and regenerate new codes to allow other Nexora users to access your facility.</span>
                    </div>
                </div>
                <button class="btn regenerate-btn" aria-label="Regenerate facility code">
                    <i class="fas fa-sync-alt"></i> Regenerate
                </button>
            </div>
            
            <div class="invite-section">
                <p class="invite-text">Invite members to join your facility</p>
                <button class="btn invite-btn" aria-label="Send invitation">
                    <i class="fas fa-user-plus"></i> Send Invitation
                </button>
            </div>
        </div>
        
        <!-- Members List Section -->
        <div class="members-list-section">
            <div class="section-header">
                <h2>Current Members</h2>
                <span class="facilityMembers">(10)</span>
                <div class="divider"></div>
            </div>
            
            <div class="members-table-container">
                <table class="members-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td data-label="Member">
                                <div class="member-info">
                                    <div class="avatar" style="background-color: #3b82f6;">JD</div>
                                    <div class="member-details">
                                        <span class="member-name">John Doe</span>
                                        <span class="member-status">Owner</span>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Email">john.doe@example.com</td>
                            <td data-label="Role">
                                <span class="role-badge owner">Owner</span>
                            </td>
                            <td data-label="Joined">Jan 15, 2023</td>
                            <td data-label="Actions">
                                <div class="action-buttons">
                                    <button class="btn-icon" disabled aria-label="Owner actions disabled">
                                        <i class="fas fa-crown"></i>
                                    </button>
                                    <button class="btn-icon" disabled aria-label="Owner actions disabled">
                                        <i class="fas fa-user-times"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td data-label="Member">
                                <div class="member-info">
                                    <div class="avatar" style="background-color: #06a566;">AS</div>
                                    <div class="member-details">
                                        <span class="member-name">Alice Smith</span>
                                        <span class="member-status">Admin</span>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Email">alice.smith@example.com</td>
                            <td data-label="Role">
                                <span class="role-badge admin">Admin</span>
                            </td>
                            <td data-label="Joined">Mar 22, 2023</td>
                            <td data-label="Actions">
                                <div class="action-buttons">
                                    <button class="btn-icon" title="Revoke Admin" aria-label="Revoke admin privileges">
                                        <i class="fas fa-user-shield"></i>
                                    </button>
                                    <button class="btn-icon danger" title="Remove Member" aria-label="Remove member">
                                        <i class="fas fa-user-times"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td data-label="Member">
                                <div class="member-info">
                                    <div class="avatar" style="background-color: #f08c00;">RJ</div>
                                    <div class="member-details">
                                        <span class="member-name">Robert Johnson</span>
                                        <span class="member-status">Member</span>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Email">robert.j@example.com</td>
                            <td data-label="Role">
                                <span class="role-badge member">Member</span>
                            </td>
                            <td data-label="Joined">May 10, 2023</td>
                            <td data-label="Actions">
                                <div class="action-buttons">
                                    <button class="btn-icon" title="Make Admin" aria-label="Make member admin">
                                        <i class="fas fa-crown"></i>
                                    </button>
                                    <button class="btn-icon danger" title="Remove Member" aria-label="Remove member">
                                        <i class="fas fa-user-times"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Invitation Modal -->
    <div class="modal-overlay" id="inviteModal">
        <div class="modal-container">
            <div class="modal-header">
                <h3>Invite Members</h3>
                <button class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-content">
                <div class="invite-method">
                    <p class="method-title">Quick Invite Link</p>
                    <p class="method-description">Share this link with people you want to invite to your facility:</p>
                    <div class="invite-link-container">
                        <input type="text" class="invite-link" value="https://facility.example.com/join/XK7H-9P2M" readonly aria-label="Invitation link">
                        <button class="btn copy-code-btn" aria-label="Copy invitation link">
                            <i class="fas fa-copy"></i>
                            <span class="copy-code-text">Copy</span>
                        </button>
                    </div>
                    <div class="divider-light"></div>
                </div>
                
                <div class="invite-method">
                    <p class="method-title">Direct Add Members</p>
                    <p class="method-description">Add existing Nexora users to your facility immediately:</p>
                    
                    <div class="search-add-container">
                        <div class="search-input-wrapper">
                            <input type="text" class="email-input" placeholder="Search for Nexora users..." aria-label="Search users">
                            <i class="fas fa-search search-icon"></i>
                        </div>
                        <div class="user-suggestions"></div>
                        
                        <div class="selected-users">
                            <p class="selected-title">Users to be added:</p>
                            <div class="selected-list"></div>
                        </div>
                        
                        <div class="message-area">
                            <div class="success-message" style="display: none;">
                                <i class="fas fa-check-circle"></i>
                                <span class="message-text"></span>
                            </div>
                            <div class="error-message" style="display: none;">
                                <i class="fas fa-exclamation-circle"></i>
                                <span class="message-text"></span>
                            </div>
                        </div>
                        
                        <button class="btn send-btn full-width" aria-label="Add members">
                            <i class="fas fa-user-plus"></i> Add Members
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" id="confirmModal">
        <div class="modal-container small">
            <div class="modal-header">
                <h3>Confirm Action</h3>
                <button class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-content">
                <p id="confirmMessage">Are you sure you want to remove this member?</p>
                <div class="modal-actions">
                    <button class="btn cancel-btn" aria-label="Cancel action">Cancel</button>
                    <button class="btn danger confirm-btn" aria-label="Confirm action">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <script src="../JSFolder/views/members.js"></script>
</body>
</html>