// === App Initialization ===
// This file ties everything together: builds skills, initializes sheet, etc.

window.onload = () => {
  // Build the skill grids
  buildSkills(broadIds, "Broad Skills");
  buildSkills(combatIds, "Combat Skills");

  // Initialize sheet values
  updateSheet();
  updateTarget();

  // Reset strikes display
  document.getElementById("currentStrikes").textContent = "0";
};

function toggleThemeMenu() {
  const menu = document.getElementById("themeOptions");
  menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function setTheme(themeName) {
  document.body.className = "theme-" + themeName;
  // Close menu after selection
  document.getElementById("themeOptions").style.display = "none";
}
