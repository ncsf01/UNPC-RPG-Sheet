// === Dice Roller ===
const rollSkillSel = document.getElementById("rollSkill");
const allIds = [...broadIds, ...combatIds];

// Populate skill dropdown for dice roller
allIds.forEach((id) => {
  const opt = document.createElement("option");
  opt.value = id;
  opt.textContent = id.toUpperCase();
  rollSkillSel.appendChild(opt);
});

// Update target number based on skill + difficulty
function updateTarget() {
  const skillId = document.getElementById("rollSkill").value;
  const sel = document.getElementById(skillId);
  const baseVal = sel && sel.value ? parseInt(sel.value) : 0;
  const spec = skillId
    ? document.getElementById(skillId + "_spec").checked
    : false;
  let skillVal = spec ? baseVal + 20 : baseVal;

  const diff = parseInt(document.getElementById("rollDifficulty").value);
  const target = skillVal + diff;
  document.getElementById("targetNumber").textContent = target || "";
}

// Roll d100 and evaluate result
function rollDice() {
  const skillId = document.getElementById("rollSkill").value;
  const sel = document.getElementById(skillId);
  const baseVal = sel && sel.value ? parseInt(sel.value) : 0;
  const spec = skillId
    ? document.getElementById(skillId + "_spec").checked
    : false;
  let skillVal = spec ? baseVal + 20 : baseVal;

  const diff = parseInt(document.getElementById("rollDifficulty").value);
  const target = skillVal + diff;

  // Roll 2d10 → d100
  const tens = Math.floor(Math.random() * 10) * 10;
  const ones = Math.floor(Math.random() * 10);
  let roll = tens + ones;
  if (tens === 0 && ones === 0) roll = 100; // double zero = 100

  // Build result text + class
  let resultText = `Rolled ${roll} vs target ${target}. `;
  let resultClass = "";

  if (roll === 99 || roll === 100) {
    resultText += "FUMBLE!";
    resultClass = "fumble";
  } else if (roll <= Math.floor(skillVal / 10)) {
    resultText += "CRITICAL SUCCESS!";
    resultClass = "critical";
  } else if (roll <= target) {
    resultText += "SUCCESS.";
    resultClass = "success";
  } else {
    resultText += "FAILURE.";
    resultClass = "failure";
  }

  const resultEl = document.getElementById("rollResult");
  resultEl.textContent = resultText;
  resultEl.className = resultClass;
}
