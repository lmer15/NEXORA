document.addEventListener('DOMContentLoaded', function() {
    // Check for remember me cookie
    const rememberCookie = document.cookie.split('; ').find(row => row.startsWith('remember_me='));
    if (rememberCookie) {
        try {
            const cookieValue = rememberCookie.split('=')[1];
            const decodedValue = JSON.parse(atob(cookieValue));
            if (decodedValue.email) {
                const emailInput = document.getElementById('loginEmail');
                emailInput.value = decodedValue.email;
                emailInput.dispatchEvent(new Event('input'));
                document.getElementById('rememberMe').checked = true;
            }
        } catch (e) {
            console.error('Error parsing remember me cookie:', e);
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
    const floatingWelcome = document.getElementById('floatingWelcome');
    const welcomeUserText = document.getElementById('welcomeUserText');
    const closeWelcome = document.getElementById('closeWelcome');
    const registerMessage = document.getElementById('registerMessage');

    // Form Toggle
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
        clearLoginMessage();
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');
        clearRegisterMessage();
    });

    // Password Toggle
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle-password')) {
            e.preventDefault();
            const inputId = e.target.getAttribute('data-input');
            const passwordInput = document.getElementById(inputId);
            if (passwordInput) {
                passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
                e.target.classList.toggle('fa-eye-slash');
                e.target.classList.toggle('fa-eye');
            }
        }
    });

    // Email Validation
    loginEmailInput.addEventListener('input', async (e) => {
        const email = e.target.value.trim();
        welkam.style.display = 'none';
        clearLoginMessage();

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
                    welkam.style.display = 'block';
                    welcomeEmail.textContent = email;
                    clearInputError(loginEmailInput);
                } else {
                    showInputError(loginEmailInput, 'Email/username does not exist.');
                }
            } catch (error) {
                console.error('Validation error:', error);
            }
        } else {
            clearInputError(loginEmailInput);
        }
    });

    // Login Form 
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            clearInputError(document.getElementById('loginEmail'));
            clearInputError(document.getElementById('loginPassword'));
            clearLoginMessage();

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
                    welkam.style.display = 'block';
                    welcomeEmail.textContent = email;
                    
                    // Show login welcome message
                    if (result.name) {
                        showLoginWelcome(result.name);
                    }
                    
                    setTimeout(() => {
                        window.location.href = 'facility.php';
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
                    showLoginMessage('error', result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showLoginMessage('error', 'An error occurred during login.');
            }
        });
    }

    // Register Form 
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            clearAllRegisterErrors();
            clearRegisterMessage();
            
            let isValid = true;
            
            // Validation
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
                showRegisterMessage('error', 'Please fix the errors in the form');
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
                    showRegisterMessage('success', 'Registration successful! Welcome to Nexora');
                    if (result.user && result.user.name) {
                        showRegisterWelcome(result.user.name);
                    }
                    
                    registerForm.reset();
                    setTimeout(() => {
                        registerFormContainer.classList.add('hidden');
                        loginFormContainer.classList.remove('hidden');
                        document.getElementById('loginEmail').value = email;
                        document.getElementById('loginPassword').focus();
                    }, 1500);
                } else {
                    if (result.errors) {
                        for (const [field, error] of Object.entries(result.errors)) {
                            const inputId = `register${field.charAt(0).toUpperCase() + field.slice(1)}`;
                            const inputElement = document.getElementById(inputId);
                            if (inputElement) {
                                showInputError(inputElement, error);
                            }
                        }
                    }
                    showRegisterMessage('error', result.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showRegisterMessage('error', 'An error occurred during registration.');
            }
        });
    }

    // Separate Welcome Messages
    function showLoginWelcome(name) {
        welcomeUserText.innerHTML = `Welcome back, <span class="highlight-name">${name}</span>!`;
        floatingWelcome.classList.add('show');
        setTimeout(() => {
            floatingWelcome.classList.remove('show');
        }, 5000);
    }

    function showRegisterWelcome(name) {
        welcomeUserText.innerHTML = `Welcome to Nexora, <span class="highlight-name">${name}</span>! Let's get your work come and easy.`;
        floatingWelcome.classList.add('show');
        setTimeout(() => {
            floatingWelcome.classList.remove('show');
        }, 5000);
    }

    closeWelcome.addEventListener('click', () => {
        floatingWelcome.classList.remove('show');
    });

    // Message Functions
    function showLoginMessage(status, message) {
        loginMessage.className = `message ${status}`;
        loginMessage.innerHTML = `<i class="fas ${status === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
        loginMessage.style.display = 'block';
        setTimeout(() => clearLoginMessage(), 5000);
    }

    function showRegisterMessage(status, message) {
        registerMessage.className = `message ${status}`;
        registerMessage.innerHTML = `<i class="fas ${status === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
        registerMessage.style.display = 'block';
        setTimeout(() => clearRegisterMessage(), 5000);
    }

    function clearLoginMessage() {
        loginMessage.style.display = 'none';
        loginMessage.innerHTML = '';
    }

    function clearRegisterMessage() {
        registerMessage.style.display = 'none';
        registerMessage.innerHTML = '';
    }

    // Input Error Handling
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
        if (errorDiv) errorDiv.remove();
        inputElement.classList.remove('error-border');
    }

    function clearAllRegisterErrors() {
        const registerInputs = [
            document.getElementById('registerName'),
            document.getElementById('registerEmail'),
            document.getElementById('registerPassword'),
            document.getElementById('registerConfirmPassword')
        ];
        registerInputs.forEach(input => input && clearInputError(input));
    }
});