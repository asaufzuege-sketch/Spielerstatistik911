// season_table_ui_patch.js
(function () {
  'use strict';

  // helpers to safely call app functions (fallback to localStorage)
  function safeGetGoalValueData() {
    if (typeof window.getGoalValueData === 'function') return window.getGoalValueData();
    try { return JSON.parse(localStorage.getItem('goalValueData') || '{}'); } catch(e){ return {}; }
  }
  function safeSetGoalValueData(obj) {
    if (typeof window.setGoalValueData === 'function') { window.setGoalValueData(obj); return; }
    try { localStorage.setItem('goalValueData', JSON.stringify(obj)); } catch(e) {}
  }
  function safeGetGoalValueBottom() {
    if (typeof window.getGoalValueBottom === 'function') return window.getGoalValueBottom();
    try { return JSON.parse(localStorage.getItem('goalValueBottom') || '[]'); } catch(e){ return []; }
  }
  function safeSetGoalValueBottom(arr) {
    if (typeof window.setGoalValueBottom === 'function') { window.setGoalValueBottom(arr); return; }
    try { localStorage.setItem('goalValueBottom', JSON.stringify(arr)); } catch(e) {}
  }
  function safeComputeValueForPlayer(name) {
    if (typeof window.computeValueForPlayer === 'function') return window.computeValueForPlayer(name);
    const data = safeGetGoalValueData(); const bottom = safeGetGoalValueBottom();
    const vals = (data[name] && Array.isArray(data[name])) ? data[name] : [];
    let sum = 0;
    for (let i = 0; i < bottom.length; i++) {
      sum += (Number(vals[i] || 0) || 0) * (Number(bottom[i] || 0) || 0);
    }
    return sum;
  }

  // Move columns MVP Points & MVP to the end (MVP last)
  function moveSeasonColumnsToEnd() {
    const container = document.getElementById('seasonContainer');
    if (!container) return;
    const table = container.querySelector('table.stats-table');
    if (!table) return;
    const thead = table.tHead;
    if (!thead) return;
    const headerRow = thead.rows[0];
    const headerTextArray = Array.from(headerRow.cells).map(h => (h.textContent||'').trim().toLowerCase());

    const findIndex = (token) => {
      token = token.toLowerCase();
      let idx = headerTextArray.indexOf(token);
      if (idx !== -1) return idx;
      idx = headerTextArray.findIndex(h => h.includes(token));
      return idx;
    };

    const idxMvpPoints = findIndex('mvp points');
    const idxMvp = findIndex('mvp');

    const moveHeaderToEnd = (token) => {
      const th = Array.from(headerRow.cells).find(h => (h.textContent||'').toLowerCase().includes(token.toLowerCase()));
      if (!th) return;
      headerRow.appendChild(th);
    };

    if (idxMvpPoints !== -1) moveHeaderToEnd('mvp points');
    if (idxMvp !== -1) moveHeaderToEnd('mvp');

    const tbody = table.tBodies[0];
    if (!tbody) return;

    const snapshot = headerTextArray.slice();

    const moveColumnByHeaderText = (token) => {
      token = token.toLowerCase();
      let origIdx = snapshot.findIndex(h => h.includes(token));
      if (origIdx === -1) {
        const curIdx = Array.from(headerRow.cells).findIndex(h => (h.textContent||'').toLowerCase().includes(token));
        if (curIdx !== -1) origIdx = curIdx;
      }
      if (origIdx === -1) return;
      Array.from(tbody.rows).forEach(row => {
        if (row.cells.length > origIdx) {
          row.appendChild(row.cells[origIdx]);
        } else {
          const candidate = Array.from(row.cells).find(c => {
            const meta = (c.getAttribute('data-col')||c.getAttribute('aria-label')||'').toLowerCase();
            return meta && meta.includes(token);
          });
          if (candidate) row.appendChild(candidate);
        }
      });
    };

    if (idxMvpPoints !== -1) moveColumnByHeaderText('mvp points');
    if (idxMvp !== -1) moveColumnByHeaderText('mvp');

    Array.from(tbody.rows).forEach((row, i) => {
      if (row.classList.contains('total-row')) return;
      row.classList.remove('even-row', 'odd-row');
      row.classList.add((i % 2 === 0) ? 'even-row' : 'odd-row');
    });
  }

  // Enhance Goal Value table - NUR STYLING, KEIN CLICK-HANDLING
  function enhanceGoalValueTable() {
    const container = document.getElementById('goalValueContainer');
    if (!container) return;
    const table = container.querySelector('table.goalvalue-table[data-original-render="true"]');
    if (!table) return;

    if (table.dataset.styled === 'true') return;
    table.dataset.styled = 'true';

    table.classList.add('goal-value-table');
    table.style.tableLayout = 'fixed';
    table.style.width = '100%';

    const thead = table.tHead;
    const headerCells = thead ? Array.from(thead.rows[0].cells) : [];
    const oppCount = Math.max(0, headerCells.length - 2);

    const tbody = table.tBodies[0];
    if (!tbody) return;

    const rows = Array.from(tbody.rows);
    if (rows.length === 0) return;
    const bottomRow = rows[rows.length - 1];

    let maxNameLength = 0;
    rows.slice(0, rows.length - 1).forEach(row => {
      const nameCell = row.cells[0];
      if (nameCell) {
        const len = (nameCell.textContent || '').trim().length;
        if (len > maxNameLength) maxNameLength = len;
      }
    });
    
    const nameColWidth = Math.max(120, Math.min(250, maxNameLength * 9 + 24));
    
    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.insertBefore(colgroup, table.firstChild);
    }
    colgroup.innerHTML = '';
    
    const col1 = document.createElement('col');
    col1.style.width = `${nameColWidth}px`;
    colgroup.appendChild(col1);
    
    for (let i = 0; i < oppCount; i++) {
      const col = document.createElement('col');
      col.style.width = '80px';
      colgroup.appendChild(col);
    }
    
    const colValue = document.createElement('col');
    colValue.style.width = '90px';
    colgroup.appendChild(colValue);

    // NUR STYLING - KEIN EVENT-HANDLING
    rows.slice(0, rows.length - 1).forEach(row => {
      const nameCell = row.cells[0];
      if (nameCell) {
        nameCell.style.whiteSpace = 'nowrap';
        nameCell.style.overflow = 'hidden';
        nameCell.style.textOverflow = 'ellipsis';
      }
    });

    // Bottom Row: Dropdown-Styling
    const bottomCells = Array.from(bottomRow.cells);
    
    bottomCells.forEach((td, idx) => {
      if (idx === 0 || idx === bottomCells.length - 1) return;
      
      const span = td.querySelector('.gv-scale');
      if (!span) return;
      
      // Ersetze Span mit Select
      const curVal = span.textContent || '0';
      const select = document.createElement('select');
      select.className = 'gv-scale-dropdown';
      
      const goalValueOptions = [];
      for (let v = 0; v <= 10; v++) goalValueOptions.push((v*0.5).toFixed(1));
      
      goalValueOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === String(curVal)) option.selected = true;
        select.appendChild(option);
      });
      
      td.innerHTML = '';
      td.appendChild(select);
      
      const oppIdx = idx - 1;
      
      select.addEventListener('change', () => {
        const nv = Number(select.value);
        const bottom = safeGetGoalValueBottom();
        while (bottom.length <= oppIdx) bottom.push(0);
        bottom[oppIdx] = nv;
        safeSetGoalValueBottom(bottom);
        
        // Trigger re-render durch Modul
        if (App.goalValue && typeof App.goalValue.render === 'function') {
          App.goalValue.render();
        }
      });
    });
  }

  function setupObservers() {
    const root = document.body;
    const mo = new MutationObserver(() => {
      if (setupObservers._timer) clearTimeout(setupObservers._timer);
      setupObservers._timer = setTimeout(() => {
        moveSeasonColumnsToEnd();
        enhanceGoalValueTable();
      }, 150);
    });
    mo.observe(root, { childList: true, subtree: true, attributes: false });
    setTimeout(() => { moveSeasonColumnsToEnd(); enhanceGoalValueTable(); }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObservers);
  } else {
    setupObservers();
  }

  window._seasonTablePatch_moveCols = moveSeasonColumnsToEnd;
  window._seasonTablePatch_enhanceGoalValue = enhanceGoalValueTable;
})();
