// Haupt-App Initialisierung
document.addEventListener("DOMContentLoaded", () => {
  console.log(`Spielerstatistik App v${App.version} wird geladen...`);
  
  // 1. Theme & Styles initialisieren
  App.initTheme();
  App.injectTableStyles();
  
  // 2. Pages registrieren
  App.pages = {
    selection: document.getElementById("playerSelectionPage"),
    stats: document.getElementById("statsPage"),
    torbild: document.getElementById("torbildPage"),
    goalValue: document.getElementById("goalValuePage"),
    season: document.getElementById("seasonPage"),
    seasonMap: document.getElementById("seasonMapPage")
  };
  
  // 3. WICHTIG: App.showPage SOFORT definieren (vor Module Init!)
  App.showPage = function(page) {
    try {
      Object.values(App.pages).forEach(p => {
        if (p) p.style.display = "none";
      });
      
      if (App.pages[page]) {
        App.pages[page].style.display = "block";
      }
      
      App.storage.setCurrentPage(page);
      
      // Update Title
      const titles = {
        selection: "Spielerauswahl",
        stats: "Statistiken",
        torbild: "Goal Map",
        goalValue: "Goal Value",
        season: "Season",
        seasonMap: "Season Map"
      };
      document.title = titles[page] || "Spielerstatistik";
      
      // Render bei Seitenwechsel
      setTimeout(() => {
        if (page === "stats" && App.statsTable) App.statsTable.render();
        if (page === "season" && App.seasonTable) App.seasonTable.render();
        if (page === "goalValue" && App.goalValue) App.goalValue.render();
        if (page === "seasonMap" && App.seasonMap) App.seasonMap.render();
      }, 60);
      
    } catch (err) {
      console.warn("showPage failed:", err);
    }
  };
  
  // 4. Daten aus LocalStorage laden
  App.storage.load();
  
  // 5. Alle Module initialisieren (NACH App.showPage Definition!)
  App.timer.init();
  App.csvHandler.init();
  App.playerSelection.init();
  App.statsTable.init();
  App.seasonTable.init();
  App.goalMap.init();
  App.seasonMap.init();
  App.goalValue.init();
  
  // 6. Navigation Event Listeners
  document.getElementById("selectPlayersBtn")?.addEventListener("click", () => {
    App.showPage("selection");
  });
  
  document.getElementById("backToStatsBtn")?.addEventListener("click", () => {
    App.showPage("stats");
  });
  
  document.getElementById("backToStatsFromSeasonBtn")?.addEventListener("click", () => {
    App.showPage("stats");
  });
  
  document.getElementById("backToStatsFromSeasonMapBtn")?.addEventListener("click", () => {
    App.showPage("stats");
  });
  
  document.getElementById("backFromGoalValueBtn")?.addEventListener("click", () => {
    App.showPage("stats");
  });
  
  document.getElementById("torbildBtn")?.addEventListener("click", () => {
    App.showPage("torbild");
  });
  
  document.getElementById("goalValueBtn")?.addEventListener("click", () => {
    App.showPage("goalValue");
  });
  
  document.getElementById("seasonBtn")?.addEventListener("click", () => {
    App.showPage("season");
  });
  
  document.getElementById("seasonMapBtn")?.addEventListener("click", () => {
    App.showPage("seasonMap");
  });
  
  // 7. Delegierte Back-Button Handler
  document.addEventListener("click", (e) => {
    try {
      const btn = e.target.closest("button");
      if (!btn) return;
      
      const backIds = new Set([
        "backToStatsBtn",
        "backToStatsFromSeasonBtn",
        "backToStatsFromSeasonMapBtn",
        "backFromGoalValueBtn"
      ]);
      
      if (backIds.has(btn.id)) {
        App.showPage("stats");
        e.preventDefault();
        e.stopPropagation();
      }
    } catch (err) {
      console.warn("Back button delegation failed:", err);
    }
  }, true);
  
  // 8. Initiale Seite anzeigen
  const lastPage = App.storage.getCurrentPage();
  const initialPage = lastPage === "selection" || !App.data.selectedPlayers.length 
    ? "selection" 
    : lastPage;
  
  App.showPage(initialPage);
  
  // 9. Daten vor Seitenabschluss speichern
  window.addEventListener("beforeunload", () => {
    try {
      App.storage.saveAll();
      localStorage.setItem("timerSeconds", String(App.timer.seconds));
      if (App.goalValue) {
        localStorage.setItem("goalValueOpponents", JSON.stringify(App.goalValue.getOpponents()));
        localStorage.setItem("goalValueData", JSON.stringify(App.goalValue.getData()));
        localStorage.setItem("goalValueBottom", JSON.stringify(App.goalValue.getBottom()));
      }
    } catch (e) {
      console.warn("Save on unload failed:", e);
    }
  });
  
  console.log("✅ App erfolgreich geladen!");
});
