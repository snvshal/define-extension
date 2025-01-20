// Create a floating "Define" button
const defineButton = document.createElement("button");
defineButton.textContent = "Define";
defineButton.id = "define-button";
defineButton.style.display = "none";
defineButton.style.position = "absolute";
defineButton.style.zIndex = "10000";
defineButton.style.padding = "8px 12px";
defineButton.style.backgroundColor = "#007BFF";
defineButton.style.color = "#fff";
defineButton.style.border = "none";
defineButton.style.borderRadius = "5px";
defineButton.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
defineButton.style.cursor = "pointer";
document.body.appendChild(defineButton);

// Handle text selection
document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  const selectionRange = window.getSelection().getRangeAt(0);

  // Ensure only a single word is selected
  if (selectedText && /^[a-zA-Z]+$/.test(selectedText)) {
    const rect = selectionRange.getBoundingClientRect();

    // Position the button near the selected word
    defineButton.style.left = `${rect.left + window.scrollX}px`;
    defineButton.style.top = `${rect.top + window.scrollY - 40}px`;
    defineButton.style.display = "block";

    defineButton.onclick = async () => {
      showDefinitionDialog(selectedText, "Loading...");

      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(selectedText)}`
        );
        const data = await response.json();

        if (data[0] && data[0].meanings) {
          const definition = data[0].meanings[0].definitions[0].definition;
          updateDefinitionDialog(selectedText, definition);
        } else {
          updateDefinitionDialog(selectedText, "No definition found.");
        }
      } catch (err) {
        console.error("Error fetching definition:", err);
        updateDefinitionDialog(selectedText, "An error occurred. Please try again.");
      }

      // Hide the button after clicking
      defineButton.style.display = "none";
    };
  } else {
    defineButton.style.display = "none"; // Hide button if selection is invalid
  }
});

// Show the dialog with a loading state
function showDefinitionDialog(word, content) {
  const existingDialog = document.getElementById("definition-dialog");
  if (existingDialog) existingDialog.remove();

  const dialog = document.createElement("div");
  dialog.id = "definition-dialog";
  dialog.className = "definition-dialog";
  dialog.innerHTML = `
    <div class="dialog-body">
      <div>
        <strong class="selected-word">${word}</strong>
        <p>${content}</p>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Position the dialog above the selected word
  const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
  dialog.style.position = "absolute";
  dialog.style.left = `${rect.left + window.scrollX}px`;
  dialog.style.top = `${rect.top + window.scrollY - dialog.offsetHeight - 10}px`;

  // Add click listener to close dialog on outside click
  setTimeout(() => attachOutsideClickHandler(dialog), 0);
}

// Update the dialog content with the fetched definition
function updateDefinitionDialog(word, definition) {
  const dialog = document.getElementById("definition-dialog");
  if (dialog) {
    dialog.querySelector(".dialog-body").innerHTML = `
      <div>
        <strong class="selected-word">${word}</strong>
        <p>${definition}</p>
      </div>
    `;
  }
}

// Attach outside click handler to close the dialog
function attachOutsideClickHandler(dialog) {
  const handleOutsideClick = (event) => {
    if (!dialog.contains(event.target) && event.target !== defineButton) {
      dialog.remove();
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  document.addEventListener("click", handleOutsideClick);
}
