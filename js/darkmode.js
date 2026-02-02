// === Dark Mode Toggle ===
const darkToggle = document.getElementById("darkModeToggle");

// Update icon based on current mode
function updateToggleIcon() {
  if (document.body.classList.contains("dark-mode")) {
    darkToggle.textContent = "☼"; // sun when in dark mode
  } else {
    darkToggle.textContent = "☾"; // moon when in light mode
  }
}

// Apply system preference on load
if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.classList.add("dark-mode");
} else {
  document.body.classList.remove("dark-mode");
}
updateToggleIcon();

// Listen for system theme changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (e.matches) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
  updateToggleIcon();
});

// Manual toggle
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  updateToggleIcon();
});
