document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Mobile menu toggle
  const menuButton = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuButton) {
    menuButton.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
});