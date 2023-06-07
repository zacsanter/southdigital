  document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.reveal');

    elements.forEach(element => {
      element.classList.remove('reveal');
    });
  });
  
  function isInViewport(element) {
    const bounding = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const threshold = windowHeight * 0.06; // 6% of the viewport height

    return (
      bounding.top + threshold <= windowHeight &&
      bounding.bottom >= threshold
    );
  }

  function handleViewportAnimations() {
    const elements = document.querySelectorAll('.fadein, .fadeup, .fadedown, .fadeleft, .faderight, .scalein');

    elements.forEach(element => {
      if (isInViewport(element)) {
        element.classList.add('in-viewport');
      }
    });
  }

  function init() {
    // Initial check for elements in viewport
    handleViewportAnimations();

    // Add event listener to check for elements in viewport on scroll
    window.addEventListener('scroll', handleViewportAnimations);
  }

  init();
