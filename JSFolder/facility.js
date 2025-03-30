// Handle all navigation in the app
document.addEventListener('DOMContentLoaded', function() {
    // Highlight active menu item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.nav-item');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        const page = link.getAttribute('href');
        
        if (page === currentPage) {
            item.classList.add('active');
        }
        
        // Prevent default for same-page links (optional)
        link.addEventListener('click', function(e) {
            if (page === currentPage) {
                e.preventDefault();
            }
        });
    });

    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.left-navigator');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});