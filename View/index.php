<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loading Animation</title>
    <link rel="stylesheet" href="../CSS_Files/home.css">
</head>
<body>
    <div class="loading-container">
        <img src="../Images/Logo.png" alt="Logo" class="logo">
        <div class="loading-spinner"></div> 
        <p class="loading-text">Loading system, please wait...</p> 
    </div>

    <script>
        function simulateSystemTask() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve("System initialized!"); 
                }, 5000); 
            });
        }

        async function initializeSystem() {
            console.log("Starting system initialization...");

            const result = await simulateSystemTask();
            console.log(result);

            const loadingContainer = document.querySelector('.loading-container');
            loadingContainer.style.opacity = '0'; 
            setTimeout(() => {
                window.location.href = "access.php";
            }, 200);
        }

        initializeSystem();
    </script>
</body>
</html>