// === Skills Setup ===
// Pool of values to distribute across skills.
// Duplicates are intentional: e.g. two 50s, two 40s, etc.
const skillValues = [60, 50, 50, 40, 40, 30, 30, 20, 20, 20];

// IDs for broad skills
const broadIds = [
  "body",
  "finesse",
  "aware",
  "intellect",
  "will",
  "ingenuity",
  "social",
];

// IDs for combat skills
const combatIds = ["melee", "ranged", "defend"];

// The grid container in HTML where skills are rendered
const skillsGrid = document.getElementById("skillsGrid");

// Flag used when randomCharacter() locks the sheet
let sheetLocked = false;

// === Build skill rows dynamically ===
// Creates dropdowns, specialization checkboxes, and calculated value fields
function buildSkills(ids, title) {
  // Divider label (e.g. "Broad Skills", "Combat Skills")
  const divider = document.createElement("div");
  divider.className = "divider";
  divider.textContent = title;
  skillsGrid.appendChild(divider);

  ids.forEach((id) => {
    const row = document.createElement("div");
    row.style.display = "contents";

    // Label for the skill
    const label = document.createElement("div");
    label.textContent = id.toUpperCase();
    row.appendChild(label);

    // Dropdown (will be populated in updateSheet)
    const select = document.createElement("select");
    select.id = id;
    select.innerHTML = "<option value=''>--</option>";

    // Event listener: recalc sheet + target number
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

// === Update sheet values ===
// Handles pool distribution, specialization, and strikes/status
function updateSheet() {
  const allIds = [...broadIds, ...combatIds];

  // Count how many times each value is currently used
  const counts = {};
  allIds.forEach((id) => {
    const val = document.getElementById(id).value;
    if (val) {
      const num = parseInt(val);
      counts[num] = (counts[num] || 0) + 1;
    }
  });

  // For each skill dropdown...
  allIds.forEach((id) => {
    const sel = document.getElementById(id);
    const currentVal = sel.value ? parseInt(sel.value) : null;

    // Clear options
    sel.innerHTML = "<option value=''>--</option>";

    // For each distinct value in the pool
    [...new Set(skillValues)].forEach((num) => {
      const totalAllowed = skillValues.filter((v) => v === num).length;

      // Count how many times this value is used in OTHER dropdowns
      let usedElsewhere = 0;
      allIds.forEach((otherId) => {
        if (otherId !== id) {
          const otherVal = document.getElementById(otherId).value;
          if (parseInt(otherVal) === num) {
            usedElsewhere++;
          }
        }
      });

      const remaining = totalAllowed - usedElsewhere;

      // Only add option if there are copies left OR it's the current selection
      if (remaining > 0 || currentVal === num) {
        const opt = document.createElement("option");
        opt.value = num;
        opt.textContent = num;
        sel.appendChild(opt);
      }
    });

    // Restore current selection if still valid
    if (currentVal !== null) sel.value = currentVal;

    // Calculate skill value (base + specialization)
    const baseVal = sel.value ? parseInt(sel.value) : 0;
    const spec = document.getElementById(id + "_spec").checked;
    const calcVal = spec ? baseVal + 20 : baseVal;
    document.getElementById(id + "_calc").textContent = calcVal ? calcVal : "";
  });

  // === Strikes calculation ===
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

// === Random character generator ===
// Shuffles the pool and assigns values automatically
function randomCharacter() {
  const values = [...skillValues]; // copy
  const shuffled = values.sort(() => 0.5 - Math.random());
  const allIds = [...broadIds, ...combatIds];

  allIds.forEach((id, idx) => {
    const sel = document.getElementById(id);
    const val = shuffled[idx];

    // Assign value
    sel.value = val.toString();

    // Reset specialization
    document.getElementById(id + "_spec").checked = false;
  });

  sheetLocked = true;
  updateSheet();
  updateTarget();
}
