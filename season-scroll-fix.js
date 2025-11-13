// season-scroll-fix.js - Erzwingt sichtbaren Scrollbar
(function() {
  'use strict';
  
  function forceScrollbar() {
    const seasonContainer = document.getElementById('seasonContainer');
    const goalValueContainer = document.getElementById('goalValueContainer');
    
    // Season Container
    if (seasonContainer) {
      // Erzwinge overflow
      seasonContainer.style.overflowX = 'scroll';
      seasonContainer.style.overflowY = 'hidden';
      seasonContainer.style.WebkitOverflowScrolling = 'touch';
      seasonContainer.style.cursor = 'grab';
      
      // Mouse Drag Scrolling
      let isDown = false;
      let startX;
      let scrollLeft;
      
      seasonContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        seasonContainer.style.cursor = 'grabbing';
        startX = e.pageX - seasonContainer.offsetLeft;
        scrollLeft = seasonContainer.scrollLeft;
      });
      
      seasonContainer.addEventListener('mouseleave', () => {
        isDown = false;
        seasonContainer.style.cursor = 'grab';
      });
      
      seasonContainer.addEventListener('mouseup', () => {
        isDown = false;
        seasonContainer.style.cursor = 'grab';
      });
      
      seasonContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - seasonContainer.offsetLeft;
        const walk = (x - startX) * 2;
        seasonContainer.scrollLeft = scrollLeft - walk;
      });
      
      // Debug Info
      console.log('Season Container:', {
        scrollWidth: seasonContainer.scrollWidth,
        clientWidth: seasonContainer.clientWidth,
        isScrollable: seasonContainer.scrollWidth > seasonContainer.clientWidth
      });
    }
    
    // Goal Value Container
    if (goalValueContainer) {
      goalValueContainer.style.overflowX = 'scroll';
      goalValueContainer.style.overflowY = 'hidden';
      goalValueContainer.style.WebkitOverflowScrolling = 'touch';
      goalValueContainer.style.cursor = 'grab';
      
      let isDown = false;
      let startX;
      let scrollLeft;
      
      goalValueContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        goalValueContainer.style.cursor = 'grabbing';
        startX = e.pageX - goalValueContainer.offsetLeft;
        scrollLeft = goalValueContainer.scrollLeft;
      });
      
      goalValueContainer.addEventListener('mouseleave', () => {
        isDown = false;
        goalValueContainer.style.cursor = 'grab';
      });
      
      goalValueContainer.addEventListener('mouseup', () => {
        isDown = false;
        goalValueContainer.style.cursor = 'grab';
      });
      
      goalValueContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - goalValueContainer.offsetLeft;
        const walk = (x - startX) * 2;
        goalValueContainer.scrollLeft = scrollLeft - walk;
      });
      
      console.log('Goal Value Container:', {
        scrollWidth: goalValueContainer.scrollWidth,
        clientWidth: goalValueContainer.clientWidth,
        isScrollable: goalValueContainer.scrollWidth > goalValueContainer.clientWidth
      });
    }
  }
  
  // Warte auf DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(forceScrollbar, 500);
    });
  } else {
    setTimeout(forceScrollbar, 500);
  }
  
  // Nochmal nach Seitenwechsel
  const observer = new MutationObserver(() => {
    setTimeout(forceScrollbar, 300);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();
