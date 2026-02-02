// === Character Manager ===

// === Event Listeners for Controls ===
document
  .getElementById("manageCharacters")
  .addEventListener("click", openCharacterManager);

document.getElementById("cleanSheet").addEventListener("click", resetCharacter);

function openCharacterManager() {
  showSavedCharacters();
  document.getElementById("characterManager").style.display = "block";
}

function closeCharacterManager() {
  document.getElementById("characterManager").style.display = "none";
}

// Show saved characters
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

    if (char.portrait) {
      const img = document.createElement("img");
      img.src = char.portrait;
      img.style.width = "50px";
      img.style.height = "50px";
      img.style.objectFit = "cover";
      img.style.marginRight = "10px";
      info.appendChild(img);
    }

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

// Save character
function saveCharacter() {
  const charData = {
    name: document.getElementById("charName").value || "Unnamed",
    notes: document.getElementById("charNotes").value,
    strikes: document.getElementById("currentStrikes").textContent,
    skills: {},
  };

  const allIds = [...broadIds, ...combatIds];
  allIds.forEach((id) => {
    charData.skills[id] = {
      value: document.getElementById(id).value,
      spec: document.getElementById(id + "_spec").checked,
    };
  });

  // Portrait logic: only save if not default/empty, and add last
  const portraitSrc = document.getElementById("portraitImg").src;
  if (
    portraitSrc &&
    !portraitSrc.includes("stickfigure.jpg") &&
    portraitSrc !== ""
  ) {
    charData.portrait = portraitSrc;
  }

  let saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  saved.push(charData);
  localStorage.setItem("savedCharacters", JSON.stringify(saved));

  alert("Character saved locally!");
  showSavedCharacters();
}

// Load character
function loadCharacter(index) {
  const saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  const charData = saved[index];
  if (!charData) return;

  document.getElementById("charName").value = charData.name;
  document.getElementById("charNotes").value = charData.notes;
  document.getElementById("currentStrikes").textContent = charData.strikes;

  if (charData.portrait) {
    document.getElementById("portraitImg").src = charData.portrait;
  } else {
    document.getElementById("portraitImg").src = "stickfigure.jpg"; // fallback
  }

  const allIds = [...broadIds, ...combatIds];
  allIds.forEach((id) => {
    document.getElementById(id).value = charData.skills[id].value;
    document.getElementById(id + "_spec").checked = charData.skills[id].spec;
  });

  updateSheet();
  updateTarget();
}

// Delete character
function deleteCharacter(index) {
  let saved = JSON.parse(localStorage.getItem("savedCharacters")) || [];
  saved.splice(index, 1);
  localStorage.setItem("savedCharacters", JSON.stringify(saved));
}

// Download character as JSON
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

// Upload character from JSON
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

// Reset character
function resetCharacter() {
  document.getElementById("charName").value = "";
  document.getElementById("charNotes").value = "";
  document.getElementById("portraitImg").src = "stickfigure.jpg";
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
