// season-scroll-fix.js - Mouse-Drag Scrolling
(function() {
  'use strict';
  
  function setupDragScrolling() {
    setupContainerDrag('seasonContainer', 'Season');
    setupContainerDrag('goalValueContainer', 'Goal Value');
  }
  
  function setupContainerDrag(containerId, name) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Visual Cursor Feedback
    container.style.cursor = 'grab';
    
    // Mouse Down - Start Dragging
    container.addEventListener('mousedown', (e) => {
      // Ignoriere Clicks auf interaktive Elemente
      if (e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'INPUT' || 
          e.target.tagName === 'SELECT' ||
          e.target.tagName === 'A' ||
          e.target.classList.contains('gv-data-cell') ||
          e.target.classList.contains('gv-scale')) {
        return;
      }
      
      isDown = true;
      container.classList.add('active-drag');
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
      
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      
      e.preventDefault();
    });
    
    // Mouse Leave - Stop Dragging
    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.classList.remove('active-drag');
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    });
    
    // Mouse Up - Stop Dragging
    container.addEventListener('mouseup', () => {
      isDown = false;
      container.classList.remove('active-drag');
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    });
    
    // Mouse Move - Do the Dragging
    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // *2 = scroll speed
      container.scrollLeft = scrollLeft - walk;
    });
    
    // Touch Support für Tablets
    let touchStartX = 0;
    let touchScrollLeft = 0;
    
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = container.scrollLeft;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      const touchX = e.touches[0].pageX;
      const diff = touchStartX - touchX;
      container.scrollLeft = touchScrollLeft + diff;
    }, { passive: true });
    
    // Force Scrollbar
    const table = container.querySelector('table');
    if (table) {
      table.style.minWidth = 'max-content';
      container.style.overflowX = 'scroll';
      
      console.log(`${name} Container:`, {
        containerWidth: container.clientWidth,
        tableWidth: table.offsetWidth,
        scrollWidth: container.scrollWidth,
        isScrollable: container.scrollWidth > container.clientWidth
      });
    }
  }
  
  // Initial Setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(setupDragScrolling, 500);
    });
  } else {
    setTimeout(setupDragScrolling, 500);
  }
  
  // Re-setup bei jedem Seitenwechsel
  let lastPage = '';
  setInterval(() => {
    const currentPage = [...document.querySelectorAll('.page')].find(p => p.style.display !== 'none');
    if (currentPage && currentPage.id !== lastPage) {
      lastPage = currentPage.id;
      setTimeout(setupDragScrolling, 400);
    }
  }, 500);
  
  // Re-setup bei Table Render
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'TABLE' || (node.querySelector && node.querySelector('table'))) {
            setTimeout(setupDragScrolling, 200);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();
