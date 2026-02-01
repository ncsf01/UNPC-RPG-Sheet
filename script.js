let sheetLocked = false;
// /* === Skill Setup === */
const skillValues = [60, 50, 50, 40, 40, 30, 30, 20, 20, 20]; // possible skill values
const broadIds = [
  "body",
  "finesse",
  "aware",
  "intellect",
  "will",
  "ingenuity",
  "social",
]; // broad skill categories
const combatIds = ["melee", "ranged", "defend"]; // combat skill categories
const skillsGrid = document.getElementById("skillsGrid"); // container for skills grid

// Build skill rows dynamically
function buildSkills(ids, title) {
  // Divider line with section title
  const divider = document.createElement("div");
  divider.className = "divider";
  divider.textContent = title;
  skillsGrid.appendChild(divider);

  // For each skill ID, create a row with label, dropdown, specialization checkbox, and calc box
  ids.forEach((id) => {
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
    [...new Set(skillValues)].forEach((val) => {
      select.innerHTML += `<option value="${val}">${val}</option>`;
    });

    select.addEventListener("change", () => {
      updateSheet();
      updateTarget();
    });
    row.appendChild(select);

    // Specialization checkbox (+20 bonus)
    const specBox = document.createElement("input");
    specBox.type = "checkbox";
    specBox.id = id + "_spec";
    specBox.addEventListener("change", () => {
      updateSheet();
      updateTarget();
    });
    row.appendChild(specBox);

    // Calculated skill value (base + specialization)
    const calc = document.createElement("div");
    calc.id = id + "_calc";
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

  // Collect chosen values (ignoring "--")
  const chosen = allIds
    .map((id) => document.getElementById(id).value)
    .filter((v) => v !== "");

  allIds.forEach((id) => {
    const sel = document.getElementById(id);

    if (sheetLocked) {
      // Count how many of each value are currently selected
      const counts = {};
      allIds.forEach((otherId) => {
        const val = document.getElementById(otherId).value;
        if (val) {
          const num = parseInt(val);
          counts[num] = (counts[num] || 0) + 1;
        }
      });

      Array.from(sel.options).forEach((opt, idx) => {
        if (idx === 0) {
          opt.disabled = false; // "--" always enabled
        } else if (sel.value === opt.value) {
          opt.disabled = false; // keep current selection enabled
        } else {
          const num = parseInt(opt.textContent);
          const totalAllowed = skillValues.filter((v) => v === num).length;
          const currentlyUsed = counts[num] || 0;
          opt.disabled = currentlyUsed >= totalAllowed;
        }
      });
    } else {
      // Normal duplicate-prevention mode
      Array.from(sel.options).forEach((opt) => {
        if (
          opt.value !== "" &&
          chosen.includes(opt.value) &&
          sel.value !== opt.value
        ) {
          opt.disabled = true;
        } else {
          opt.disabled = false;
        }
      });
    }

    // Calculate skill value (base + specialization)
    const baseVal = sel.value ? parseInt(sel.value) : 0;
    const spec = document.getElementById(id + "_spec").checked;
    const calcVal = spec ? baseVal + 20 : baseVal;
    document.getElementById(id + "_calc").textContent = calcVal ? calcVal : "";
  });

  // === FIXED: Strikes calculation ===
  const bodySel = document.getElementById("body").value;
  const bodyVal = bodySel ? parseInt(bodySel) : 0;
  const maxStrikes = Math.floor(bodyVal / 10);
  document.getElementById("maxStrikes").textContent = maxStrikes;

  const current =
    parseInt(document.getElementById("currentStrikes").textContent) || 0;
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
  statusEl.className = statusClass;
}

// Change current strikes (increment/decrement)
function changeStrikes(delta) {
  let current =
    parseInt(document.getElementById("currentStrikes").textContent) || 0;

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
  updateSheet();
}

/* === Dice Roller === */
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

/* === Random Character Generator === */
function randomCharacter() {
  const values = [60, 50, 50, 40, 40, 30, 30, 20, 20, 20];
  const shuffled = values.sort(() => 0.5 - Math.random());
  const allIds = [...broadIds, ...combatIds];

  allIds.forEach((id, idx) => {
    const sel = document.getElementById(id);
    const val = shuffled[idx];

    for (let opt of sel.options) {
      if (opt.value === val.toString()) {
        sel.value = opt.value;
        break;
      }
    }
    document.getElementById(id + "_spec").checked = false;
    sheetLocked = true;
    updateSheet();
    updateTarget();
  });

  sheetLocked = true;
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
    reader.onload = function (e) {
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

function showLoadWindow() {
  const container = document.getElementById("savedList");
  container.innerHTML = ""; // clear old content

  const saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  if (saved.length === 0) {
    container.innerHTML = "<p>No saved characters found.</p>";
  } else {
    saved.forEach((char, index) => {
      const card = document.createElement("div");
      card.style.border = "1px solid #000";
      card.style.padding = "10px";
      card.style.margin = "10px 0";
      card.style.display = "flex";
      card.style.alignItems = "center";
      card.style.justifyContent = "space-between";

      // Portrait + name
      const info = document.createElement("div");
      info.style.display = "flex";
      info.style.alignItems = "center";

      const img = document.createElement("img");
      img.src = char.portrait;
      img.style.width = "50px";
      img.style.height = "50px";
      img.style.objectFit = "cover";
      img.style.marginRight = "10px";
      info.appendChild(img);

      const name = document.createElement("span");
      name.textContent = char.name;
      name.style.fontWeight = "bold";
      info.appendChild(name);

      card.appendChild(info);

      // Buttons
      const buttons = document.createElement("div");

      const loadBtn = document.createElement("button");
      loadBtn.textContent = "Load";
      loadBtn.onclick = () => {
        loadCharacter(index);
        closeLoadWindow();
      };
      buttons.appendChild(loadBtn);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = () => deleteCharacter(index);
      buttons.appendChild(delBtn);

      card.appendChild(buttons);
      container.appendChild(card);
    });
  }

  document.getElementById("loadWindow").style.display = "block";
}

function closeLoadWindow() {
  document.getElementById("loadWindow").style.display = "none";
}

function openCharacterManager() {
  showSavedCharacters();
  document.getElementById("characterManager").style.display = "block";
}

function closeCharacterManager() {
  document.getElementById("characterManager").style.display = "none";
}

function showSavedCharacters() {
  const container = document.getElementById("savedList");
  container.innerHTML = "";

  const saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  if (saved.length === 0) {
    container.innerHTML = "<p>No saved characters found.</p>";
    return;
  }

  saved.forEach((char, index) => {
    const card = document.createElement("div");
    card.style.border = "1px solid #000";
    card.style.padding = "10px";
    card.style.margin = "10px 0";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.justifyContent = "space-between";

    // Portrait + name
    const info = document.createElement("div");
    info.style.display = "flex";
    info.style.alignItems = "center";

    const img = document.createElement("img");
    img.src = char.portrait;
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.objectFit = "cover";
    img.style.marginRight = "10px";
    info.appendChild(img);

    const name = document.createElement("span");
    name.textContent = char.name;
    name.style.fontWeight = "bold";
    info.appendChild(name);

    card.appendChild(info);

    // Buttons
    const buttons = document.createElement("div");

    const loadBtn = document.createElement("button");
    loadBtn.textContent = "Load";
    loadBtn.onclick = () => {
      loadCharacter(index);
      closeCharacterManager();
    };
    buttons.appendChild(loadBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = () => {
      deleteCharacter(index);
      showSavedCharacters();
    };
    buttons.appendChild(delBtn);

    const dlBtn = document.createElement("button");
    dlBtn.textContent = "Download";
    dlBtn.style.marginLeft = "10px";
    dlBtn.onclick = () => downloadCharacter(index);
    buttons.appendChild(dlBtn);

    card.appendChild(buttons);
    container.appendChild(card);
  });
}

function saveCharacter() {
  const charData = {
    name: document.getElementById("charName").value || "Unnamed",
    notes: document.getElementById("charNotes").value,
    strikes: document.getElementById("currentStrikes").textContent,
    portrait: document.getElementById("portraitImg").src,
    skills: {},
  };

  const allIds = [...broadIds, ...combatIds];
  allIds.forEach((id) => {
    charData.skills[id] = {
      value: document.getElementById(id).value,
      spec: document.getElementById(id + "_spec").checked,
    };
  });

  let saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  saved.push(charData);
  localStorage.setItem("savedCharacters", JSON.stringify(saved));

  alert("Character saved locally!");
  showSavedCharacters();
}

function loadCharacter(index) {
  const saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  const charData = saved[index];
  if (!charData) return;

  document.getElementById("charName").value = charData.name;
  document.getElementById("charNotes").value = charData.notes;
  document.getElementById("currentStrikes").textContent = charData.strikes;
  document.getElementById("portraitImg").src = charData.portrait;

  const allIds = [...broadIds, ...combatIds];
  allIds.forEach((id) => {
    document.getElementById(id).value = charData.skills[id].value;
    document.getElementById(id + "_spec").checked = charData.skills[id].spec;
  });

  updateSheet();
  updateTarget();
}

function deleteCharacter(index) {
  let saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  saved.splice(index, 1);
  localStorage.setItem("savedCharacters", JSON.stringify(saved));
}

function downloadCharacter(index) {
  const saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  const charData = saved[index];
  if (!charData) return;

  const blob = new Blob([JSON.stringify(charData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = (charData.name || "Unnamed") + ".json";
  a.click();

  URL.revokeObjectURL(url);
}

function applyCharacterUpload() {
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const charData = JSON.parse(e.target.result);
      let saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
      saved.push(charData);
      localStorage.setItem("savedCharacters", JSON.stringify(saved));
      alert("Character uploaded successfully!");
      showSavedCharacters();
    } catch (err) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}

function resetCharacter() {
  document.getElementById("charName").value = "";
  document.getElementById("charNotes").value = "";
  document.getElementById("portraitImg").src = "";
  document.getElementById("currentStrikes").textContent = "0";

  const allIds = [...broadIds, ...combatIds];
  allIds.forEach((id) => {
    document.getElementById(id).value = "";
    document.getElementById(id + "_spec").checked = false;
    document.getElementById(id + "_calc").textContent = "";
  });

  sheetLocked = false;
  updateSheet();
  updateTarget();
}

//DARK MODE

// Dark mode toggle button
const darkToggle = document.getElementById("darkModeToggle");

// Function to update icon based on current mode
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
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (e.matches) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    updateToggleIcon(); // update icon when system theme changes
  });

// Manual toggle (only once!)
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  updateToggleIcon(); // update icon when user clicks
});
