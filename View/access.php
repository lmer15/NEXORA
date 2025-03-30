<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login & Register</title>
    <link rel="stylesheet" href="../CSS_Files/access.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="logo">
            <p>Let's get started with,</p>
            <img src="../Images/Logo.png" alt="">
        </div>

        <div class="tagline">
            <p><i class="fa-solid fa-check"></i> Your project organizer</p>
            <p><i class="fa-solid fa-check"></i> Your project progress tracker</p>
            <p><i class="fa-solid fa-check"></i> Your partner in providing better communication platform</p>
            <p><i class="fa-solid fa-check"></i> Your assistant in managing teams</p>
        </div>

        <div class="form-container">
            <!-- Login Form -->
            <div class="form login-form" id="loginFormContainer">
                <h2>Login</h2>
                <div class="message" id="loginMessage" style="display: none;"></div>
                <div class="welkam" id="welkam" style="display: none;">
                    <p>Welcome!</p>
                    <p id="welcomeEmail"></p>
                </div>
                <form id="loginForm">
                    <div class="input-group">
                        <input type="email" id="loginEmail" required>
                        <label for="loginEmail"> <i class="fas fa-envelope"></i> Username or Email</label>
                    </div>
                    <div class="input-group">
                        <input type="password" id="loginPassword" required>
                        <label for="loginPassword"> <i class="fas fa-lock"></i> Password</label>
                        <i class="fas fa-eye-slash toggle-password" data-input="loginPassword"></i>
                    </div>
                    <div class="remember-me">
                        <input type="checkbox" id="rememberMe">
                        <label for="rememberMe">Remember Me</label>
                    </div>
                    <button type="submit">Login</button>
                </form>
                <p>Don't have an account? <a href="#" id="showRegister">Register</a></p>
            </div>

            <!-- Register Form -->
            <div class="form register-form hidden" id="registerFormContainer">
                <h2>Register</h2>
                <div class="message" id="registerMessage" style="display: none;"></div>
                <form id="registerForm">
                    <div class="input-group">
                        <input type="text" id="registerName" required>
                        <label for="registerName"> <i class="fas fa-user"></i> Full Name</label>
                    </div>
                    <div class="input-group">
                        <input type="email" id="registerEmail" required>
                        <label for="registerEmail"> <i class="fas fa-envelope"></i> Email</label>
                    </div>
                    <div class="input-group">
                        <input type="password" id="registerPassword" required>
                        <label for="registerPassword"> <i class="fas fa-lock"></i> Password</label>
                        <i class="fas fa-eye-slash toggle-password" data-input="registerPassword"></i>
                    </div>
                    <div class="input-group">
                        <input type="password" id="registerConfirmPassword" required>
                        <label for="registerConfirmPassword"> <i class="fas fa-lock"></i> Confirm Password</label>
                        <i class="fas fa-eye-slash toggle-password" data-input="registerConfirmPassword"></i>
                    </div>
                    <button type="submit">Register</button>
                </form>
                <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
            </div>
        </div>
    </div>

    <div id="floatingWelcome" class="floating-welcome">
        <i class="fas fa-smile-beam"></i>
        <span id="welcomeUserText"></span>
        <span class="close-btn" id="closeWelcome">&times;</span>
    </div>

    <script src="../JSFolder/access.js?v=1.3"></script>
</body>
</html>