// CSV Import/Export Handler
App.csvHandler = {
  fileInput: null,
  
  init() {
    this.createFileInput();
    this.ensureImportButtons();
  },
  
  createFileInput() {
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = ".csv,text/csv";
    this.fileInput.style.display = "none";
    document.body.appendChild(this.fileInput);
    
    this.fileInput.addEventListener("change", () => {
      const file = this.fileInput.files?.[0];
      if (!file) return;
      
      const target = this.fileInput.dataset.target || "";
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const txt = String(e.target.result || "");
        if (target === "stats") this.importStats(txt);
        else if (target === "season") this.importSeason(txt);
        this.fileInput.value = "";
        delete this.fileInput.dataset.target;
      };
      
      reader.readAsText(file, "utf-8");
    });
  },
  
  ensureImportButtons() {
    // Stats Import Button
    const exportBtn = document.getElementById("exportBtn");
    const resetBtn = document.getElementById("resetBtn");
    
    if (exportBtn && resetBtn && !document.getElementById("importCsvStatsBtn")) {
      const btn = document.createElement("button");
      btn.id = "importCsvStatsBtn";
      btn.type = "button";
      btn.textContent = "Import CSV";
      btn.className = "top-btn import-csv-btn";
      btn.addEventListener("click", () => {
        this.fileInput.dataset.target = "stats";
        this.fileInput.click();
      });
      resetBtn.parentNode?.insertBefore(btn, resetBtn);
    }
    
    // Season Import Button - prüfe ob Button im HTML existiert
    const existingImportBtn = document.getElementById("importCsvSeasonBtn");
    if (existingImportBtn) {
      // Button existiert bereits im HTML, nur Event Listener hinzufügen
      existingImportBtn.addEventListener("click", () => {
        this.fileInput.dataset.target = "season";
        this.fileInput.click();
      });
    } else {
      // Fallback: Button dynamisch erstellen
      const exportSeasonBtn = document.getElementById("exportSeasonBtn");
      const resetSeasonBtn = document.getElementById("resetSeasonBtn");
      if (exportSeasonBtn && resetSeasonBtn) {
        const btn = document.createElement("button");
        btn.id = "importCsvSeasonBtn";
        btn.type = "button";
        btn.textContent = "Import CSV";
        btn.className = "top-btn import-csv-btn";
        btn.addEventListener("click", () => {
          this.fileInput.dataset.target = "season";
          this.fileInput.click();
        });
        resetSeasonBtn.parentNode?.insertBefore(btn, resetSeasonBtn);
      }
    }
  },
  
  importStats(txt) {
    try {
      const lines = App.helpers.splitCsvLines(txt);
      if (lines.length === 0) {
        alert("Leere CSV");
        return;
      }
      
      const header = App.helpers.parseCsvLine(lines[0]);
      const nameIdx = header.findIndex(h => /spieler/i.test(h) || h.toLowerCase() === "spieler");
      const timeIdx = header.findIndex(h => /time|zeit/i.test(h));
      
      const categoryIdxMap = {};
      App.data.categories.forEach(cat => {
        const idx = header.findIndex(h => h.toLowerCase() === cat.toLowerCase());
        if (idx !== -1) categoryIdxMap[cat] = idx;
      });
      
      for (let i = 1; i < lines.length; i++) {
        const cols = App.helpers.parseCsvLine(lines[i]);
        const name = (cols[nameIdx] || "").trim();
        if (!name) continue;
        
        if (!App.data.statsData[name]) App.data.statsData[name] = {};
        
        Object.keys(categoryIdxMap).forEach(cat => {
          App.data.statsData[name][cat] = Number(cols[categoryIdxMap[cat]] || 0) || 0;
        });
        
        if (timeIdx !== -1) {
          App.data.playerTimes[name] = App.helpers.parseTimeToSeconds(cols[timeIdx]);
        }
      }
      
      App.storage.saveStatsData();
      App.storage.savePlayerTimes();
      App.statsTable?.render();
      alert("Stats-CSV importiert.");
    } catch (e) {
      console.error("Import Stats CSV failed:", e);
      alert("Fehler beim Importieren (siehe Konsole).");
    }
  },
  
  importSeason(txt) {
    try {
      const lines = App.helpers.splitCsvLines(txt);
      if (lines.length === 0) {
        alert("Leere CSV");
        return;
      }
      
      const header = App.helpers.parseCsvLine(lines[0]);
      const idx = (key) => header.findIndex(h => new RegExp(key, "i").test(h));
      
      const idxNr = idx("^nr\\.?$|nr");
      const idxName = idx("spieler|player");
      const idxGames = idx("^games$|games");
      const idxGoals = idx("^goals$|goals");
      const idxAssists = idx("^assists$|assists");
      const idxPlusMinus = header.findIndex(h => /\+\/-|plus.?minus/i.test(h));
      const idxShots = idx("^shots$|shots");
      const idxPenalty = idx("penalty|penaltys");
      const idxFaceOffs = idx("faceoffs");
      const idxFaceOffsWon = header.findIndex(h => /faceoffs won|faceoffswon/i.test(h));
      const idxGoalValue = idx("goal value|gv");
      const idxTime = idx("time|zeit");
      
      const parseTimeLocal = (s) => {
        if (!s) return 0;
        s = String(s).trim();
        if (/^\d+:\d{2}$/.test(s)) {
          const [mm, ss] = s.split(":").map(Number);
          return mm * 60 + ss;
        }
        const n = Number(s.replace(/[^0-9.-]/g, ""));
        return isNaN(n) ? 0 : n;
      };
      
      for (let i = 1; i < lines.length; i++) {
        const cols = App.helpers.parseCsvLine(lines[i]);
        const name = (idxName !== -1 ? (cols[idxName] || "").trim() : "");
        if (!name) continue;
        
        const parsed = {
          num: idxNr !== -1 ? (cols[idxNr] || "").trim() : "",
          games: idxGames !== -1 ? (Number(cols[idxGames]) || 0) : 0,
          goals: idxGoals !== -1 ? (Number(cols[idxGoals]) || 0) : 0,
          assists: idxAssists !== -1 ? (Number(cols[idxAssists]) || 0) : 0,
          plusMinus: idxPlusMinus !== -1 ? (Number(cols[idxPlusMinus]) || 0) : 0,
          shots: idxShots !== -1 ? (Number(cols[idxShots]) || 0) : 0,
          penaltys: idxPenalty !== -1 ? (Number(cols[idxPenalty]) || 0) : 0,
          faceOffs: idxFaceOffs !== -1 ? (Number(cols[idxFaceOffs]) || 0) : 0,
          faceOffsWon: idxFaceOffsWon !== -1 ? (Number(cols[idxFaceOffsWon]) || 0) : 0,
          timeSeconds: idxTime !== -1 ? parseTimeLocal(cols[idxTime]) : 0,
          goalValue: idxGoalValue !== -1 ? (Number(cols[idxGoalValue]) || 0) : 0
        };
        
        if (!App.data.seasonData[name]) {
          App.data.seasonData[name] = {
            num: parsed.num || "",
            name,
            games: parsed.games || 0,
            goals: parsed.goals,
            assists: parsed.assists,
            plusMinus: parsed.plusMinus,
            shots: parsed.shots,
            penaltys: parsed.penaltys,
            faceOffs: parsed.faceOffs,
            faceOffsWon: parsed.faceOffsWon,
            timeSeconds: parsed.timeSeconds,
            goalValue: parsed.goalValue
          };
        } else
