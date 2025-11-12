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

  // Enhance Goal Value table
  function enhanceGoalValueTable() {
    const container = document.getElementById('goalValueContainer');
    if (!container) return;
    const table = container.querySelector('table.goalvalue-table');
    if (!table) return;

    table.classList.add('goal-value-table');
    table.style.setProperty('--hover-disabled', '1');
    
    // WICHTIG: table-layout fixed damit Spalten kontrollierbar sind
    table.style.tableLayout = 'fixed';
    table.style.width = '100%';
    
    Array.from(table.tBodies[0].rows).forEach((row, i) => {
      row.classList.remove('odd-row','even-row');
      row.classList.add((i % 2 === 0) ? 'even-row' : 'odd-row');
    });

    const thead = table.tHead;
    const headerCells = thead ? Array.from(thead.rows[0].cells) : [];
    const oppCount = Math.max(0, headerCells.length - 2);

    const tbody = table.tBodies[0];
    if (!tbody) return;

    const rows = Array.from(tbody.rows);
    if (rows.length === 0) return;
    const bottomRow = rows[rows.length - 1];

    let goalValueOptions = [];
    const selectsInBottom = Array.from(bottomRow.querySelectorAll('select'));
    if (selectsInBottom.length) {
      goalValueOptions = Array.from(selectsInBottom[0].options).map(o => o.value);
    } else {
      for (let v = 0; v <= 10; v++) goalValueOptions.push((v*0.5).toFixed(1));
    }

    const updateComputedCell = (playerName, cellEl) => {
      const val = safeComputeValueForPlayer(playerName);
      if (cellEl) cellEl.textContent = (Math.abs(val - Math.round(val)) < 0.0001) ? String(Math.round(val)) : String(Number(val.toFixed(1)));
    };

    // Berechne maximale Namenslänge für optimale Spaltenbreite
    let maxNameLength = 0;
    rows.slice(0, rows.length - 1).forEach(row => {
      const nameCell = row.cells[0];
      if (nameCell) {
        const len = (nameCell.textContent || '').trim().length;
        if (len > maxNameLength) maxNameLength = len;
      }
    });
    
    // Dynamische Breite: 8px pro Zeichen + Padding
    const nameColWidth = Math.max(120, Math.min(250, maxNameLength * 9 + 24));
    
    // Setze col-group für fixe Spaltenbreiten
    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.insertBefore(colgroup, table.firstChild);
    }
    colgroup.innerHTML = '';
    
    // Erste Spalte: dynamisch basierend auf Namen
    const col1 = document.createElement('col');
    col1.style.width = `${nameColWidth}px`;
    colgroup.appendChild(col1);
    
    // Opponent-Spalten: je 80px
    for (let i = 0; i < oppCount; i++) {
      const col = document.createElement('col');
      col.style.width = '80px';
      colgroup.appendChild(col);
    }
    
    // Value-Spalte: 90px
    const colValue = document.createElement('col');
    colValue.style.width = '90px';
    colgroup.appendChild(colValue);

    // Player rows - Click = +3, Dblclick = -1
    rows.slice(0, rows.length - 1).forEach(row => {
      const nameCell = row.cells[0];
      const playerName = (nameCell && nameCell.textContent) ? nameCell.textContent.trim() : '';
      
      // Namensspalte: nowrap damit kein Umbruch
      if (nameCell) {
        nameCell.style.whiteSpace = 'nowrap';
        nameCell.style.overflow = 'hidden';
        nameCell.style.textOverflow = 'ellipsis';
        nameCell.title = playerName; // Tooltip für lange Namen
      }
      
      for (let ci = 1; ci <= oppCount; ci++) {
        const td = row.cells[ci];
        if (!td) continue;
        const input = td.querySelector('input');
        const curVal = input ? (input.value || '0') : (td.textContent || '0');
        td.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'gv-cell';
        span.style.display = 'inline-block';
        span.style.minWidth = '56px';
        span.style.textAlign = 'center';
        span.textContent = String(curVal);
        td.appendChild(span);

        let clickTimeout = null;

        // Single Click: +3 (mit 250ms Debounce für Doppelklick-Erkennung)
        span.addEventListener('click', (ev) => {
          ev.preventDefault();
          if (clickTimeout) clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            let v = Number(span.textContent) || 0;
            v = v + 3; // GEÄNDERT: +3 statt +1
            span.textContent = String(v);
            const all = safeGetGoalValueData();
            if (!all[playerName]) all[playerName] = Array(oppCount).fill(0);
            all[playerName][ci - 1] = v;
            safeSetGoalValueData(all);
            const computedCell = row.cells[row.cells.length - 1];
            updateComputedCell(playerName, computedCell);
            clickTimeout = null;
          }, 250);
        });

        // Double Click: -1
        span.addEventListener('dblclick', (ev) => {
          ev.preventDefault();
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          let v = Number(span.textContent) || 0;
          v = Math.max(0, v - 1); // -1 mit Minimum 0
          span.textContent = String(v);
          const all = safeGetGoalValueData();
          if (!all[playerName]) all[playerName] = Array(oppCount).fill(0);
          all[playerName][ci - 1] = v;
          safeSetGoalValueData(all);
          const computedCell = row.cells[row.cells.length - 1];
          updateComputedCell(playerName, computedCell);
        });
      }
    });

    // Bottom Row: Dropdown mit verbessertem Fix
    const bottomCells = Array.from(bottomRow.cells);
    
    if (bottomCells[0]) {
      bottomCells[0].textContent = "";
    }
    
    bottomCells.forEach((td, idx) => {
      if (idx === 0 || idx === bottomCells.length - 1) return;
      const sel = td.querySelector('select');
      const curVal = sel ? (sel.value || goalValueOptions[0]) : (td.textContent || goalValueOptions[0]);
      td.innerHTML = '';
      
      const select = document.createElement('select');
      select.className = 'gv-scale-dropdown';
      
      // Inline-Styles für maximale Kompatibilität
      select.style.cssText = `
        width: 75px !important;
        padding: 6px 4px !important;
        border-radius: 6px !important;
        border: 1px solid #444 !important;
        background: rgba(0,0,0,0.35) !important;
        color: #fff !important;
        font-weight: 700 !important;
        text-align: center !important;
        cursor: pointer !important;
        font-size: 0.9rem !important;
        -webkit-appearance: menulist !important;
        -moz-appearance: menulist !important;
        appearance: auto !important;
      `;
      
      goalValueOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === String(curVal)) option.selected = true;
        select.appendChild(option);
      });
      
      td.appendChild(select);
      
      // KRITISCHER FIX: Alle Events die Dropdown schließen könnten
      let isChanging = false;
      
      select.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isChanging = true;
      });
      
      select.addEventListener('click', (e) => {
        e.stopPropagation();
        isChanging = true;
      });
      
      select.addEventListener('change', (e) => {
        e.stopPropagation();
        const nv = Number(select.value);
        const bottom = safeGetGoalValueBottom();
        while (bottom.length < oppCount) bottom.push(0);
        bottom[idx - 1] = nv;
        safeSetGoalValueBottom(bottom);
        
        rows.slice(0, rows.length - 1).forEach(r => {
          const pname = (r.cells[0] && r.cells[0].textContent) ? r.cells[0].textContent.trim() : '';
          const computedCell = r.cells[r.cells.length - 1];
          updateComputedCell(pname, computedCell);
        });
        
        // Keep focus
        setTimeout(() => {
          select.blur();
          isChanging = false;
        }, 100);
      });
      
      // Verhindere Blur während Änderung
      select.addEventListener('blur', (e) => {
        if (isChanging) {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            if (document.activeElement !== select) {
              select.focus();
            }
          }, 50);
        }
      });
      
      // Focus-Event
      select.addEventListener('focus', (e) => {
        e.stopPropagation();
      });
    });

    rows.slice(0, rows.length - 1).forEach(r => {
      const pname = (r.cells[0] && r.cells[0].textContent) ? r.cells[0].textContent.trim() : '';
      const computedCell = r.cells[r.cells.length - 1];
      updateComputedCell(pname, computedCell);
    });
  }

  function setupObservers() {
    const root = document.body;
    const mo = new MutationObserver(() => {
      if (setupObservers._timer) clearTimeout(setupObservers._timer);
      setupObservers._timer = setTimeout(() => {
        moveSeasonColumnsToEnd();
        enhanceGoalValueTable();
      }, 120);
    });
    mo.observe(root, { childList: true, subtree: true, attributes: false });
    setTimeout(() => { moveSeasonColumnsToEnd(); enhanceGoalValueTable(); }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObservers);
  } else {
    setupObservers();
  }

  window._seasonTablePatch_moveCols = moveSeasonColumnsToEnd;
  window._seasonTablePatch_enhanceGoalValue = enhanceGoalValueTable;
})();
