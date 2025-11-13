// goal-value-scroll-fix.js - GARANTIERT FUNKTIONIERENDES SCROLLING
(function() {
  'use strict';
  
  console.log('🔧 Goal Value Scroll Fix loaded');
  
  function forceScrolling() {
    const container = document.getElementById('goalValueContainer');
    if (!container) {
      console.log('❌ Container not found');
      return;
    }
    
    const table = container.querySelector('table');
    if (!table) {
      console.log('❌ Table not found');
      return;
    }
    
    console.log('✅ Found container and table');
    
    // BRUTAL FORCE: Überschreibe ALLE Styles
    container.setAttribute('style', 
      'width: 100% !important; ' +
      'max-width: 100% !important; ' +
      'overflow-x: scroll !important; ' +
      'overflow-y: hidden !important; ' +
      'display: block !important; ' +
      '-webkit-overflow-scrolling: touch !important;'
    );
    
    // Berechne benötigte Breite
    const thCount = table.querySelectorAll('thead th').length;
    const minWidth = 150 + ((thCount - 2) * 100) + 100; // Name + Opponents + Value
    
    table.setAttribute('style',
      `width: ${minWidth}px !important; ` +
      `min-width: ${minWidth}px !important; ` +
      'display: table !important; ' +
      'table-layout: fixed !important;'
    );
    
    // Setze feste Spaltenbreiten
    const headers = table.querySelectorAll('thead th');
    headers.forEach((th, i) => {
      if (i === 0) {
        th.style.width = '150px';
        th.style.minWidth = '150px';
        th.style.maxWidth = '150px';
      } else if (i === headers.length - 1) {
        th.style.width = '100px';
        th.style.minWidth = '100px';
        th.style.maxWidth = '100px';
      } else {
        th.style.width = '100px';
        th.style.minWidth = '100px';
        th.style.maxWidth = '100px';
      }
    });
    
    // Wende gleiche Breiten auf Body-Zellen an
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      cells.forEach((td, i) => {
        if (i === 0) {
          td.style.width = '150px';
          td.style.minWidth = '150px';
          td.style.maxWidth = '150px';
        } else if (i === cells.length - 1) {
          td.style.width = '100px';
          td.style.minWidth = '100px';
          td.style.maxWidth = '100px';
        } else {
          td.style.width = '100px';
          td.style.minWidth = '100px';
          td.style.maxWidth = '100px';
        }
      });
    });
    
    // Force Re-Layout
    void container.offsetHeight;
    void table.offsetWidth;
    
    // Measure
    setTimeout(() => {
      const result = {
        containerWidth: container.clientWidth,
        tableWidth: table.offsetWidth,
        scrollWidth: container.scrollWidth,
        columnsCount: thCount,
        calculatedMinWidth: minWidth,
        isScrollable: container.scrollWidth > container.clientWidth,
        scrollLeft: container.scrollLeft,
        scrollLeftMax: container.scrollWidth - container.clientWidth
      };
      
      console.log('📊 Goal Value Scroll Status:', result);
      
      if (!result.isScrollable) {
        console.error('⚠️ STILL NOT SCROLLABLE! Forcing wider...');
        table.style.minWidth = (minWidth + 500) + 'px';
        table.style.width = (minWidth + 500) + 'px';
      } else {
        console.log('✅ SCROLLING ENABLED! You can now scroll to the Value column.');
      }
    }, 100);
  }
  
  // Versuche es mehrfach
  function tryMultipleTimes() {
    console.log('🔄 Attempting to fix Goal Value scrolling...');
    setTimeout(() => forceScrolling(), 300);
    setTimeout(() => forceScrolling(), 800);
    setTimeout(() => forceScrolling(), 1500);
    setTimeout(() => forceScrolling(), 3000);
  }
  
  // Initial
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMultipleTimes);
  } else {
    tryMultipleTimes();
  }
  
  // Bei jedem Seitenwechsel
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      tryMultipleTimes();
    }
  }).observe(document, {subtree: true, childList: true});
  
  // Bei jeder DOM-Änderung in goalValueContainer
  const checkContainer = setInterval(() => {
    const container = document.getElementById('goalValueContainer');
    if (container) {
      const observer = new MutationObserver(() => {
        setTimeout(forceScrolling, 200);
      });
      observer.observe(container, {childList: true, subtree: true});
      clearInterval(checkContainer);
    }
  }, 500);
  
})();
