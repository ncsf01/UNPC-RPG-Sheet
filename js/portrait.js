// === Portrait Upload ===

// Open the upload modal
function openUploadCard() {
  // Reset inputs
  document.getElementById("portraitUpload").value = "";
  document.getElementById("portraitUrl").value = "";
  // Show card
  document.getElementById("uploadCard").style.display = "block";
}

// Close the upload modal
function closeUploadCard() {
  document.getElementById("uploadCard").style.display = "none";
}

// Apply portrait from file or URL
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
  } else {
    // Fallback to default stickfigure if nothing provided
    imgEl.src = "stickfigure.jpg";
  }

  // Reset inputs after applying portrait
  fileInput.value = "";
  urlInput.value = "";

  // Hide the upload card again
  closeUploadCard();
}
