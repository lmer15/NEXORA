function loadView(viewName) {
    const contentDiv = document.getElementById('dynamic-content');
    contentDiv.innerHTML = `<div id="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;

    document.querySelectorAll('link[data-view-css]').forEach(link => link.remove());
    document.querySelectorAll('script[data-view-js]').forEach(script => script.remove());
    
    fetch(`${viewName}.php`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load view');
            return response.text();
        })
        .then(html => {
            contentDiv.innerHTML = html;
            
            // Load CSS (relative path from View directory)
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = `../CSS_files/views/${viewName}.css`;
            cssLink.setAttribute('data-view-css', 'true');
            document.head.appendChild(cssLink);
            
            // Load JS (relative path from View directory)
            const jsScript = document.createElement('script');
            jsScript.src = `../JSfolder/views/${viewName}.js`;
            jsScript.setAttribute('data-view-js', 'true');
            document.body.appendChild(jsScript);
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.view === viewName) {
                    item.classList.add('active');
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            contentDiv.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading content: ${error.message}</p>
                </div>
            `;
        });
}

// Add event listeners to nav items
document.addEventListener('DOMContentLoaded', function() {
    // Load initial view (dashboard)
    loadView('dashboard');
    
    // Set up navigation click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const viewName = this.dataset.view;
            if (viewName) {
                loadView(viewName);
            }
        });
    });
});