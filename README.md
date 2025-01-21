# Define Word Chrome Extension

## Overview

The **Define Word Chrome Extension** enhances your browsing experience by allowing you to instantly view the definition of any single word you select on a webpage. It features a sleek dark-themed dialog box that appears above the selected word, ensuring smooth and user-friendly interaction. This extension is powered by AI or a dictionary API, providing definitions in multiple languages.

## Screenshots

### Settings Dialog
![Screenshot 2025-01-21 221358](https://github.com/user-attachments/assets/92f707b2-a1b3-423a-83c2-76c6118b1548)

### Select a Word and Click Define
![Screenshot 2025-01-21 221928](https://github.com/user-attachments/assets/945aa428-032c-41e7-8663-383c6d1afde8)

---

## Features

- **Quick Definitions:** Select a single word, and a "Define" button will appear. Click it to see the definition immediately.
- **Multi-Language Support:** Supports definitions in various languages.
- **Dark Theme:** A modern, visually appealing design with a black background and white text.
- **Loading Indicator:** Displays a loading message while fetching the definition.
- **Dismissable Dialog:** Click outside the dialog to close it instantly.
- **Error Handling:** Gracefully handles errors such as unsupported words or unavailable languages.

---

## How It Works

1. Select a single word on any webpage.
2. If only one word is selected, a "Define" button will appear near the selection.
3. Click the "Define" button to open a dialog box above the selected word.
4. The dialog shows the definition of the word. If the word is not found, an appropriate error message is displayed.

---

## File Structure

```plaintext
root/
├── manifest.json      # Extension manifest file
├── background.js     # Background script for handling settings and communication
├── content.js        # Content script to manage word selection and dialog rendering
├── styles.css        # Styles for the dialog box
├── popup.html        # Popup interface for settings
├── popup.js          # Logic for the popup settings page
├── README.md         # Documentation file
└── icons/            # Folder containing extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** in the top-right corner.
4. Click **Load unpacked** and select the extension's root folder.
5. The extension is now installed and ready to use.

---

## Usage

1. Navigate to any webpage.
2. Highlight a single word by selecting it with your cursor.
3. Click the "Define" button that appears above the selected word.
4. View the word's definition in the dialog box.

---

## Customization

### Language Support

- You can change the default language in the settings popup.
- The settings can be accessed via the extension's icon in the Chrome toolbar.
