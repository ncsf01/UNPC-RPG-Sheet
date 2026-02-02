// === Strikes Management ===

// Change current strikes (increment/decrement)
function changeStrikes(delta) {
  let current = parseInt(document.getElementById("currentStrikes").textContent) || 0;

  // Get max strikes from BODY
  const bodySel = document.getElementById("body").value;
  const bodyVal = bodySel ? parseInt(bodySel) : 0;
  const maxStrikes = Math.floor(bodyVal / 10);

  // Apply delta
  current += delta;

  // Clamp between 0 and maxStrikes
  if (current < 0) current = 0;
  if (current > maxStrikes) current = maxStrikes;

  document.getElementById("currentStrikes").textContent = current;
  updateSheet(); // refresh status display
}
