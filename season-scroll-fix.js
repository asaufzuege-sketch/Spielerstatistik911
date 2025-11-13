// season-scroll-fix.js - Erzwingt funktionierendes Scrolling
(function() {
  'use strict';
  
  function enableScrolling() {
    const seasonContainer = document.getElementById('seasonContainer');
    const goalValueContainer = document.getElementById('goalValueContainer');
    
    function setupContainer(container, name) {
      if (!container) return;
      
      // Erzwinge Scroll-Styles
      container.style.cssText = `
        overflow-x: auto !important;
        overflow-y: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
        width: 100% !important;
        max-width: 100vw !important;
      `;
      
      // Prüfe ob scrollbar ist
      const checkScroll = () => {
        const table = container.querySelector('table');
        if (table) {
          console.log(`${name}:`, {
            containerWidth: container.clientWidth,
            tableWidth: table.offsetWidth,
            scrollWidth: container.scrollWidth,
            canScroll: container.scrollWidth > container.clientWidth
          });
          
          // Wenn Tabelle breiter als Container, force scrollbar
          if (table.offsetWidth > container.clientWidth) {
            container.style.overflowX = 'scroll';
            console.log(`${name}: Scrollbar aktiviert`);
          }
        }
      };
      
      // Initial check
      setTimeout(checkScroll, 200);
      setTimeout(checkScroll, 500);
      setTimeout(checkScroll, 1000);
      
      // Mouse-Drag Scrolling
      let isDragging = false;
      let startX = 0;
      let scrollLeft = 0;
      
      container.addEventListener('mousedown', (e) => {
        // Ignoriere Clicks auf Buttons/Inputs
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
          return;
        }
        
        isDragging = true;
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
        container.style.userSelect = '';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
      });
      
      // Touch Scrolling (für Tablets)
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
    }
    
    setupContainer(seasonContainer, 'Season');
    setupContainer(goalValueContainer, 'Goal Value');
  }
  
  // Multi-Trigger
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableScrolling);
  } else {
    enableScrolling();
  }
  
  // Nach jedem Seitenwechsel
  let lastPage = '';
  setInterval(() => {
    const currentPage = [...document.querySelectorAll('.page')].find(p => p.style.display !== 'none');
    if (currentPage && currentPage.id !== lastPage) {
      lastPage = currentPage.id;
      setTimeout(enableScrolling, 300);
    }
  }, 500);
  
})();
