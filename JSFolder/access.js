document.addEventListener('DOMContentLoaded', function() {
    // Check for remember me cookie and fill email if exists
    const rememberCookie = document.cookie.split('; ').find(row => row.startsWith('remember_me='));
    if (rememberCookie) {
        try {
            const cookieValue = rememberCookie.split('=')[1];
            const decodedValue = JSON.parse(atob(cookieValue));
            if (decodedValue.email) {
                const emailInput = document.getElementById('loginEmail');
                emailInput.value = decodedValue.email;
                // Trigger the email validation check
                emailInput.dispatchEvent(new Event('input'));
                // Check the remember me checkbox
                document.getElementById('rememberMe').checked = true;
            }
        } catch (e) {
            console.error('Error parsing remember me cookie:', e);
            // Clear invalid cookie
            document.cookie = 'remember_me=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
    }

    // DOM Elements
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginMessage = document.getElementById('loginMessage');
    const welkam = document.getElementById('welkam');
    const welcomeEmail = document.getElementById('welcomeEmail');

    // Form Toggle Functionality
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
        // Clear any existing messages
        document.getElementById('registerMessage').innerHTML = '';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');
        // Clear any existing messages
        document.getElementById('loginMessage').innerHTML = '';
    });

    // Password Visibility Toggle
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle-password')) {
            e.preventDefault();
            const inputId = e.target.getAttribute('data-input');
            const passwordInput = document.getElementById(inputId);
            
            if (passwordInput) {
                // Toggle input type
                passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
                
                // Toggle icon
                e.target.classList.toggle('fa-eye-slash');
                e.target.classList.toggle('fa-eye');
            }
        }
    });

    // Email Validation
    loginEmailInput.addEventListener('input', async (e) => {
        const email = e.target.value.trim();
        welkam.style.display = 'none'; 
        loginMessage.style.display = 'block'; 

        if (email) {
            try {
                const response = await fetch('../Model/check-email.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `email=${encodeURIComponent(email)}`,
                });

                const result = await response.json();

                if (result.exists) {
                    loginMessage.style.display = 'none'; 
                    welkam.style.display = 'block'; 
                    welcomeEmail.textContent = email; 
                    clearInputError(loginEmailInput); 
                } else {
                    loginMessage.style.display = 'block'; 
                    welkam.style.display = 'none';
                    showInputError(loginEmailInput, 'Email/username does not exist.');
                }
            } catch (error) {
                console.error('Validation error:', error);
            }
        } else {
            loginMessage.style.display = 'block'; 
            welkam.style.display = 'none'; 
            clearInputError(loginEmailInput);
        }
    });

    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // Clear previous errors
            clearInputError(document.getElementById('loginEmail'));
            clearInputError(document.getElementById('loginPassword'));

            try {
                const response = await fetch('../Controller/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&rememberMe=${rememberMe}`,
                });

                const result = await response.json();
                
                if (result.status === 'success') {
                    showMessage('loginMessage', 'success', result.message);
                    welkam.style.display = 'block';
                    welcomeEmail.textContent = email;
                    
                    // Redirect after successful login
                    setTimeout(() => {
                        window.location.href = '../View/dashboard.html';
                    }, 1500);
                } else {
                    if (result.errors) {
                        if (result.errors.email) {
                            showInputError(document.getElementById('loginEmail'), result.errors.email);
                        }
                        if (result.errors.password) {
                            showInputError(document.getElementById('loginPassword'), result.errors.password);
                        }
                    }
                    showMessage('loginMessage', 'error', result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('loginMessage', 'error', 'An error occurred during login.');
            }
        });
    }

    // Register Form Submission - FIXED VERSION
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            clearAllRegisterErrors();
            let isValid = true;
            
            // Client-side validation
            if (!name) {
                showInputError(document.getElementById('registerName'), 'Full name is required');
                isValid = false;
            }
            
            if (!email) {
                showInputError(document.getElementById('registerEmail'), 'Email is required');
                isValid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                showInputError(document.getElementById('registerEmail'), 'Invalid email format');
                isValid = false;
            }
            
            if (!password) {
                showInputError(document.getElementById('registerPassword'), 'Password is required');
                isValid = false;
            } else if (password.length < 8) {
                showInputError(document.getElementById('registerPassword'), 'Password must be at least 8 characters');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                showInputError(document.getElementById('registerConfirmPassword'), 'Passwords do not match');
                isValid = false;
            }

            if (!isValid) {
                showMessage('registerMessage', 'error', 'Please fix the errors in the form');
                return;
            }

            try {
                const response = await fetch('../Controller/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword
                    })
                });

                const result = await response.json();
                
                if (result.status === 'success') {
                    showMessage('registerMessage', 'success', result.message);
                    // Clear form on successful registration
                    registerForm.reset();
                    // Switch to login form
                    registerFormContainer.classList.add('hidden');
                    loginFormContainer.classList.remove('hidden');
                    // Auto-fill email in login form
                    document.getElementById('loginEmail').value = email;
                    // Focus on password field
                    document.getElementById('loginPassword').focus();
                } else {
                    // Show server-side validation errors
                    if (result.errors) {
                        for (const [field, error] of Object.entries(result.errors)) {
                            const inputId = `register${field.charAt(0).toUpperCase() + field.slice(1)}`;
                            const inputElement = document.getElementById(inputId);
                            if (inputElement) {
                                showInputError(inputElement, error);
                            }
                        }
                    }
                    showMessage('registerMessage', 'error', result.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showMessage('registerMessage', 'error', 'An error occurred during registration.');
            }
        });
    }

    // Helper Functions
    function showMessage(elementId, status, message) {
        const messageDiv = document.getElementById(elementId);
        if (!messageDiv) return;
        
        messageDiv.className = `message ${status}`;
        messageDiv.innerHTML = `<i class="fas ${status === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.innerHTML = '';
            messageDiv.className = 'message';
            messageDiv.style.display = 'none';
        }, 5000);
    }

    function showInputError(inputElement, message) {
        clearInputError(inputElement);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        inputElement.parentElement.appendChild(errorDiv);
        inputElement.classList.add('error-border');
    }

    function clearInputError(inputElement) {
        const errorDiv = inputElement.parentElement.querySelector('.input-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        inputElement.classList.remove('error-border');
    }

    function clearAllRegisterErrors() {
        const registerInputs = [
            document.getElementById('registerName'),
            document.getElementById('registerEmail'),
            document.getElementById('registerPassword'),
            document.getElementById('registerConfirmPassword')
        ];
        
        registerInputs.forEach(input => {
            if (input) clearInputError(input);
        });
    }
});