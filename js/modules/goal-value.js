// Goal Value Modul
App.goalValue = {
  container: null,
  
  init() {
    this.container = document.getElementById("goalValueContainer");
    
    // Event Listeners
    document.getElementById("resetGoalValueBtn")?.addEventListener("click", () => {
      this.reset();
    });
  },
  
  getOpponents() {
    try {
      const raw = localStorage.getItem("goalValueOpponents");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return Array.from({ length: 19 }, (_, i) => `Gegner ${i + 1}`);
  },
  
  setOpponents(arr) {
    localStorage.setItem("goalValueOpponents", JSON.stringify(arr));
  },
  
  getData() {
    try {
      const raw = localStorage.getItem("goalValueData");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  },
  
  setData(obj) {
    localStorage.setItem("goalValueData", JSON.stringify(obj));
  },
  
  getBottom() {
    try {
      const raw = localStorage.getItem("goalValueBottom");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return this.getOpponents().map(() => 0);
  },
  
  setBottom(arr) {
    localStorage.setItem("goalValueBottom", JSON.stringify(arr));
  },
  
  computeValueForPlayer(name) {
    const data = this.getData();
    const bottom = this.getBottom();
    const vals = Array.isArray(data[name]) ? data[name] : [];
    return bottom.reduce((sum, w, i) => sum + (Number(vals[i] || 0) * Number(w || 0)), 0);
  },
  
  formatValueNumber(v) {
    return Math.abs(v - Math.round(v)) < 1e-4 ? String(Math.round(v)) : String(Number(v.toFixed(1)));
  },
  
  ensureDataForSeason() {
    const opponents = this.getOpponents();
    const all = this.getData();
    
    Object.keys(App.data.seasonData).forEach(name => {
      if (!all[name] || !Array.isArray(all[name])) {
        all[name] = opponents.map(() => 0);
      } else {
        while (all[name].length < opponents.length) all[name].push(0);
        if (all[name].length > opponents.length) all[name] = all[name].slice(0, opponents.length);
      }
    });
    
    this.setData(all);
  },
  
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = "";
    
    const opponents = this.getOpponents();
    this.ensureDataForSeason();
    const gData = this.getData();
    const bottom = this.getBottom();
    
    const playersList = Object.keys(App.data.seasonData).length 
      ? Object.keys(App.data.seasonData).sort() 
      : App.data.selectedPlayers.map(p => p.name);
    
    const table = document.createElement("table");
    table.className = "goalvalue-table";
    
    // Header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    
    const thPlayer = document.createElement("th");
    thPlayer.textContent = "Spieler";
    headerRow.appendChild(thPlayer);
    
    opponents.forEach((op, idx) => {
      const th = document.createElement("th");
      const input = document.createElement("input");
      input.type = "text";
      input.value = op;
      input.className = "goalvalue-title-input";
      input.addEventListener("change", () => {
        const list = this.getOpponents();
        list[idx] = input.value || `Gegner ${idx + 1}`;
        this.setOpponents(list);
        this.ensureDataForSeason();
        this.render();
      });
      th.appendChild(input);
      headerRow.appendChild(th);
    });
    
    const thValue = document.createElement("th");
    thValue.textContent = "Value";
    headerRow.appendChild(thValue);
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement("tbody");
    const valueCellMap = {};
    const colors = App.helpers.getColorStyles();
    
    playersList.forEach((name, rowIdx) => {
      const row = document.createElement("tr");
      row.className = (rowIdx % 2 === 0 ? "even-row" : "odd-row");
      
      const tdName = document.createElement("td");
      tdName.textContent = name;
      tdName.style.textAlign = "left";
      tdName.style.fontWeight = "700";
      row.appendChild(tdName);
      
      const vals = (gData[name] && Array.isArray(gData[name])) ? gData[name].slice() : opponents.map(() => 0);
      while (vals.length < opponents.length) vals.push(0);
      
      opponents.forEach((_, i) => {
        const td = document.createElement("td");
        td.dataset.player = name;
        td.dataset.opp = String(i);
        const v = Number(vals[i] || 0);
        td.textContent = String(v);
        td.style.color = v > 0 ? colors.pos : v < 0 ? colors.neg : colors.zero;
        td.style.cursor = "pointer";
        
        let clickTimeout = null;
        
        td.addEventListener("click", () => {
          if (clickTimeout) clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            const d = this.getData();
            if (!d[name]) d[name] = opponents.map(() => 0);
            d[name][i] = Math.max(0, Number(d[name][i] || 0) + 1);
            this.setData(d);
            
            const nv = d[name][i];
            td.textContent = nv;
            td.style.color = nv > 0 ? colors.pos : nv < 0 ? colors.neg : colors.zero;
            
            const vc = valueCellMap[name];
            if (vc) {
              const val = this.computeValueForPlayer(name);
              vc.textContent = this.formatValueNumber(val);
              vc.style.color = val > 0 ? colors.pos : val < 0 ? colors.neg : colors.zero;
              vc.style.fontWeight = val !== 0 ? "700" : "400";
            }
            clickTimeout = null;
          }, 200);
        });
        
        td.addEventListener("dblclick", (e) => {
          e.preventDefault();
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          
          const d = this.getData();
          if (!d[name]) d[name] = opponents.map(() => 0);
          d[name][i] = Math.max(0, Number(d[name][i] || 0) - 1);
          this.setData(d);
          
          const nv = d[name][i];
          td.textContent = nv;
          td.style.color = nv > 0 ? colors.pos : nv < 0 ? colors.neg : colors.zero;
          
          const vc = valueCellMap[name];
          if (vc) {
            const val = this.computeValueForPlayer(name);
            vc.textContent = this.formatValueNumber(val);
            vc.style.color = val > 0 ? colors.pos : val < 0 ? colors.neg : colors.zero;
            vc.style.fontWeight = val !== 0 ? "700" : "400";
          }
        });
        
        row.appendChild(td);
      });
      
      const valueTd = document.createElement("td");
      const val = this.computeValueForPlayer(name);
      valueTd.textContent = this.formatValueNumber(val);
      valueTd.style.color = val > 0 ? colors.pos : val < 0 ? colors.neg : colors.zero;
      valueTd.style.fontWeight = val !== 0 ? "700" : "400";
      row.appendChild(valueTd);
      
      valueCellMap[name] = valueTd;
      tbody.appendChild(row);
    });
    
    // Bottom Scale Row
    const bottomRow = document.createElement("tr");
    bottomRow.className = (playersList.length % 2 === 0 ? "even-row" : "odd-row");
    
    const labelTd = document.createElement("td");
    labelTd.textContent = "Skala";
    labelTd.style.fontWeight = "700";
    bottomRow.appendChild(labelTd);
    
    const scaleOptions = [];
    for (let v = 0; v <= 10; v++) scaleOptions.push((v * 0.5).toFixed(1));
    
    const storedBottom = this.getBottom();
    while (storedBottom.length < opponents.length) storedBottom.push(0);
    if (storedBottom.length > opponents.length) storedBottom.length = opponents.length;
    this.setBottom(storedBottom);
    
    opponents.forEach((_, i) => {
      const td = document.createElement("td");
      const span = document.createElement("span");
      span.className = "gv-scale";
      span.textContent = String(storedBottom[i]);
      span.style.cursor = "pointer";
      
      span.addEventListener("click", () => {
        const arr = this.getBottom();
        let idx = scaleOptions.indexOf(String(span.textContent));
        if (idx === -1) idx = 0;
        idx = (idx + 1) % scaleOptions.length;
        span.textContent = scaleOptions[idx];
        arr[i] = Number(scaleOptions[idx]);
        this.setBottom(arr);
        
        Object.keys(valueCellMap).forEach(pn => {
          const cell = valueCellMap[pn];
          const newVal = this.computeValueForPlayer(pn);
          cell.textContent = this.formatValueNumber(newVal);
          cell.style.color = newVal > 0 ? colors.pos : newVal < 0 ? colors.neg : colors.zero;
          cell.style.fontWeight = newVal !== 0 ? "700" : "400";
        });
      });
      
      td.appendChild(span);
      bottomRow.appendChild(td);
    });
    
    const emptyTd = document.createElement("td");
    emptyTd.textContent = "";
    bottomRow.appendChild(emptyTd);
    
    tbody.appendChild(bottomRow);
    table.appendChild(tbody);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    wrapper.style.width = '100%';
    wrapper.style.boxSizing = 'border-box';
    wrapper.appendChild(table);
    
    this.container.appendChild(wrapper);
  },
  
  reset() {
    if (!confirm("Goal Value zurücksetzen?")) return;
    
    const opponents = this.getOpponents();
    const playersList = Object.keys(App.data.seasonData).length 
      ? Object.keys(App.data.seasonData) 
      : App.data.selectedPlayers.map(p => p.name);
    
    const newData = {};
    playersList.forEach(n => newData[n] = opponents.map(() => 0));
    this.setData(newData);
    this.setBottom(opponents.map(() => 0));
    
    this.render();
    alert("Goal Value zurückgesetzt.");
  }
};
