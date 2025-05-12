document.addEventListener('DOMContentLoaded', function() {
  const projectCard = document.getElementById('projectCard');
  const kanbanBoard = document.getElementById('kanbanBoard');
  const task1 = document.getElementById('task1');
  const task2 = document.getElementById('task2');
  const inProgressColumn = document.getElementById('inProgressColumn');
  const doneColumn = document.getElementById('doneColumn');
  const replayButton = document.getElementById('replayAnimation');

  function runAnimation() {
    // Reset all elements
    projectCard.classList.remove('show');
    kanbanBoard.classList.remove('show');
    task1.classList.remove('show', 'move-to-progress', 'move-to-done');
    task2.classList.remove('show', 'move-to-progress');
    task1.style.transform = '';
    task2.style.transform = '';

    // Animation sequence
    setTimeout(() => {
      projectCard.classList.add('show'); // Show project card
    }, 500);

    setTimeout(() => {
      kanbanBoard.classList.add('show'); // Show Kanban board
    }, 1500);

    setTimeout(() => {
      task1.classList.add('show'); // Task 1 appears in To-Do
    }, 2500);

    setTimeout(() => {
      task2.classList.add('show'); // Task 2 appears in To-Do
    }, 3000);

    setTimeout(() => {
      task1.classList.add('move-to-progress'); // Task 1 moves to In Progress
      setTimeout(() => {
        inProgressColumn.appendChild(task1); // Move to In Progress column
        task1.style.transform = ''; // Reset transform for next move
      }, 1000);
    }, 4000);

    setTimeout(() => {
      task2.classList.add('move-to-progress'); // Task 2 moves to In Progress
      setTimeout(() => {
        inProgressColumn.appendChild(task2); // Move to In Progress column
        task2.style.transform = '';
      }, 1000);
    }, 5000);

    setTimeout(() => {
      task1.classList.add('move-to-done'); // Task 1 moves to Done
      setTimeout(() => {
        doneColumn.appendChild(task1); // Move to Done column
        task1.style.transform = '';
      }, 1000);
    }, 6000);
  }

  // Run animation on page load
  runAnimation();

  // Replay animation on button click
  replayButton.addEventListener('click', runAnimation);
});