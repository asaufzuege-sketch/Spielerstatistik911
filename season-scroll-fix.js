// season-scroll-fix.js - Erzwingt Scrolling
(function() {
  'use strict';
  
  function setupScrolling() {
    // Season Container
    const seasonContainer = document.getElementById('seasonContainer');
    if (seasonContainer) {
      const seasonTable = seasonContainer.querySelector('table');
      if (seasonTable) {
        // Stelle sicher dass Tabelle breiter wird
        seasonTable.style.minWidth = 'max-content';
        
        // Force Scrollbar
        seasonContainer.style.overflowX = 'scroll';
        seasonContainer.style.overflowY = 'hidden';
        
        console.log('Season:', {
          tableWidth: seasonTable.offsetWidth,
          containerWidth: seasonContainer.clientWidth,
          scrollable: seasonTable.offsetWidth > seasonContainer.clientWidth
        });
      }
    }
    
    // Goal Value Container
    const goalValueContainer = document.getElementById('goalValueContainer');
    if (goalValueContainer) {
      const goalValueTable = goalValueContainer.querySelector('table');
      if (goalValueTable) {
        // Stelle sicher dass Tabelle breiter wird
        goalValueTable.style.minWidth = 'max-content';
        
        // Force Scrollbar
        goalValueContainer.style.overflowX = 'scroll';
        goalValueContainer.style.overflowY = 'hidden';
        
        console.log('Goal Value:', {
          tableWidth: goalValueTable.offsetWidth,
          containerWidth: goalValueContainer.clientWidth,
          scrollable: goalValueTable.offsetWidth > goalValueContainer.clientWidth
        });
      }
    }
  }
  
  // Initial Setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(setupScrolling, 500);
    });
  } else {
    setTimeout(setupScrolling, 500);
  }
  
  // Bei jedem Seitenwechsel
  const observer = new MutationObserver(() => {
    setTimeout(setupScrolling, 300);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();
