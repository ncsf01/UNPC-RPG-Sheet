/* === Skill Setup === */
const skillValues = [60,50,50,40,40,30,30,20,20,20]; // possible skill values
const broadIds = ["body","finesse","aware","intellect","will","ingenuity","social"]; // broad skill categories
const combatIds = ["melee","ranged","defend"]; // combat skill categories
const skillsGrid = document.getElementById("skillsGrid"); // container for skills grid

// Build skill rows dynamically
function buildSkills(ids, title) {
  // Divider line with section title
  const divider = document.createElement("div");
  divider.className = "divider";
  divider.textContent = title;
  skillsGrid.appendChild(divider);

  // For each skill ID, create a row with label, dropdown, specialization checkbox, and calc box
  ids.forEach(id => {
    const row = document.createElement("div");
    row.style.display = "contents";

    // Label (skill name)
    const label = document.createElement("div");
    label.textContent = id.toUpperCase();
    row.appendChild(label);

    // Dropdown for skill values
    const select = document.createElement("select");
    select.id = id;
    select.innerHTML = "<option value=''>--</option>";
    skillValues.forEach((val, idx) => {
      select.innerHTML += `<option value="${val}_${idx}">${val}</option>`;
    });
    select.addEventListener("change", () => { updateSheet(); updateTarget(); });
    row.appendChild(select);

    // Specialization checkbox (+20 bonus)
    const specBox = document.createElement("input");
    specBox.type = "checkbox";
    specBox.id = id+"_spec";
    specBox.addEventListener("change", () => { updateSheet(); updateTarget(); });
    row.appendChild(specBox);

    // Calculated skill value (base + specialization)
    const calc = document.createElement("div");
    calc.id = id+"_calc";
    calc.className = "calcBox";
    calc.textContent = "";
    row.appendChild(calc);

    skillsGrid.appendChild(row);
  });
}

// Build both skill sections
buildSkills(broadIds, "Broad Skills");
buildSkills(combatIds, "Combat Skills");

/* === Character Sheet Updates === */
function updateSheet() {
  const allIds = [...broadIds, ...combatIds];

  // Prevent duplicate skill values across dropdowns
  const chosen = allIds.map(id => document.getElementById(id).value).filter(v => v !== "");
  allIds.forEach(id => {
    const sel = document.getElementById(id);
    Array.from(sel.options).forEach(opt => {
      if (opt.value !== "" && chosen.includes(opt.value) && sel.value !== opt.value) {
        opt.disabled = true;
      } else {
        opt.disabled = false;
      }
    });

    // Calculate skill value (base + specialization)
    const baseVal = sel.value ? parseInt(sel.value.split("_")[0]) : 0;
    const spec = document.getElementById(id+"_spec").checked;
    const calcVal = spec ? baseVal + 20 : baseVal;
    document.getElementById(id+"_calc").textContent = calcVal ? calcVal : "";
  });

  // Max strikes = BODY skill / 10
  const bodySel = document.getElementById("body").value;
  const bodyVal = bodySel ? parseInt(bodySel.split("_")[0]) : 0;
  const maxStrikes = Math.floor(bodyVal / 10);
  document.getElementById("maxStrikes").textContent = maxStrikes;

  // Status calculation based on current strikes
  const current = parseInt(document.getElementById("currentStrikes").textContent) || 0;
  let status = "Healthy";
  let statusClass = "status-healthy";

  if (current >= maxStrikes) {
    status = "Incapacitated!";
    statusClass = "status-incapacitated";
  } else if (current >= Math.ceil(maxStrikes / 2)) {
    status = "Bloody";
    statusClass = "status-bloody";
  }

  const statusEl = document.getElementById("status");
  statusEl.textContent = status;
  statusEl.className = statusClass; // apply CSS class for color
}

// Change current strikes (increment/decrement)
function changeStrikes(delta) {
  let current = parseInt(document.getElementById("currentStrikes").textContent) || 0;
  current += delta;
  if (current < 0) current = 0;
  document.getElementById("currentStrikes").textContent = current;
  updateSheet();
}

/* === Dice Roller === */
const rollSkillSel = document.getElementById("rollSkill");
const allIds = [...broadIds, ...combatIds];

// Populate skill dropdown for dice roller
allIds.forEach(id => {
  const opt = document.createElement("option");
  opt.value = id;
  opt.textContent = id.toUpperCase();
  rollSkillSel.appendChild(opt);
});

// Update target number based on skill + difficulty
function updateTarget() {
  const skillId = document.getElementById("rollSkill").value;
  const sel = document.getElementById(skillId);
  const baseVal = sel && sel.value ? parseInt(sel.value.split("_")[0]) : 0;
  const spec = skillId ? document.getElementById(skillId + "_spec").checked : false;
  let skillVal = spec ? baseVal + 20 : baseVal;

  const diff = parseInt(document.getElementById("rollDifficulty").value);
  const target = skillVal + diff;
  document.getElementById("targetNumber").textContent = target || "";
}

// Roll d100 and evaluate result
function rollDice() {
  const skillId = document.getElementById("rollSkill").value;
  const sel = document.getElementById(skillId);
  const baseVal = sel && sel.value ? parseInt(sel.value.split("_")[0]) : 0;
  const spec = skillId ? document.getElementById(skillId + "_spec").checked : false;
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

/* === Random Character Generator === */
function randomCharacter() {
  const values = [60,50,50,40,40,30,30,20,20,20];
  const shuffled = values.sort(() => 0.5 - Math.random());
  const allIds = [...broadIds, ...combatIds];

  allIds.forEach((id, idx) => {
    const sel = document.getElementById(id);
    const val = shuffled[idx];
    // assign random value to dropdown
    for (let opt of sel.options) {
      if (opt.value.startsWith(val.toString())) {
        sel.value = opt.value;
        break;
      }
    }
    document.getElementById(id+"_spec").checked = false; // reset specialization
  });

  updateSheet();
  updateTarget();
}

/* === Portrait Upload === */
function openUploadCard() {
  // Reset inputs
  document.getElementById("portraitUpload").value = "";
  document.getElementById("portraitUrl").value = "";
  // Show card
  document.getElementById("uploadCard").style.display = "block";
}

function closeUploadCard() {
  document.getElementById("uploadCard").style.display = "none";
}

function applyPortrait() {
  const fileInput = document.getElementById("portraitUpload");
  const urlInput = document.getElementById("portraitUrl");
  const imgEl = document.getElementById("portraitImg");

  // Clear previous image
  imgEl.src = "";

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imgEl.src = e.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else if (urlInput.value) {
    imgEl.src = urlInput.value;
  }

  // Reset inputs after applying portrait
  fileInput.value = "";
  urlInput.value = "";

  // Hide the upload card again
  closeUploadCard();
}

/* === Dark Mode Toggle === */
// Toggles dark mode by adding/removing the "dark-mode" class on <body>
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});