document.addEventListener("DOMContentLoaded", function() {
    // Theme selection
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            // Here you would implement theme switching logic
            console.log('Theme changed to:', this.dataset.theme);
        });
    });

    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            // Here you would implement color scheme changing logic
            console.log('Primary color changed to:', this.dataset.color);
        });
    });

    // Form submission
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Here you would implement form submission logic
            alert('Settings saved successfully!');
        });
    }

    // Danger zone actions
    const deleteBtn = document.querySelector('.btn-danger');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to permanently delete this facility? This action cannot be undone.')) {
                // Here you would implement deletion logic
                alert('Facility deletion initiated');
            }
        });
    }

    // Initialize any existing selections
    document.querySelector('.theme-option.light').classList.add('active');
    document.querySelector('.color-option[data-color="#06a566"]').classList.add('selected');
});