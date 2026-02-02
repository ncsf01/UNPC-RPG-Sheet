let currentTheme = "default";
let previewTheme = "default";

document.getElementById("themeToggle").addEventListener("click", () => {
  document.getElementById("themeModal").style.display = "block";
  document.getElementById("themeSelect").value = currentTheme;
});

document.getElementById("themeSelect").addEventListener("change", (e) => {
  previewTheme = e.target.value;
  applyTheme(previewTheme);
});

function applyTheme(themeName) {
  document.body.classList.remove(
    "theme-default",
    "theme-fantasy",
    "theme-sci-fi",
    "theme-noir",
  );
  document.body.classList.add("theme-" + themeName);

  // Preserve dark mode if active
  if (document.body.classList.contains("dark-mode")) {
    document.body.classList.add("dark-mode");
  }
}

function confirmTheme() {
  currentTheme = previewTheme;
  document.getElementById("themeModal").style.display = "none";
}

function cancelTheme() {
  applyTheme(currentTheme);
  document.getElementById("themeModal").style.display = "none";
}
