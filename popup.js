document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    const freeApiRadio = document.getElementById('free-api');
    const geminiApiRadio = document.getElementById('gemini-api');
    const geminiSettings = document.getElementById('gemini-settings');
    const apiKeyInput = document.getElementById('api-key');
    const languageSelect = document.getElementById('language');
    const lightThemeRadio = document.getElementById('light-theme');
    const darkThemeRadio = document.getElementById('dark-theme');
    const saveButton = document.getElementById('save-button');
    const statusDiv = document.getElementById('status');
    const fontSelect = document.getElementById('font');

    // Load saved settings
    try {
        const result = await chrome.storage.local.get(['api_choice', 'gemini_api_key', 'settings']);
        
        // Set API choice
        if (result.api_choice === 'gemini') {
            geminiApiRadio.checked = true;
            geminiSettings.style.display = 'block';
        } else {
            freeApiRadio.checked = true;
            geminiSettings.style.display = 'none';
        }

        // Set API key if exists
        if (result.gemini_api_key) {
            apiKeyInput.value = result.gemini_api_key;
        }

        // Set other settings
        if (result.settings) {
            // Set language
            if (result.settings.language) {
                languageSelect.value = result.settings.language;
            }
            
            // Set theme
            if (result.settings.theme === 'dark') {
                darkThemeRadio.checked = true;
            } else {
                lightThemeRadio.checked = true;
            }

            // Set font
            if (result.settings.font) {
                fontSelect.value = result.settings.font;
                document.body.style.fontFamily = result.settings.font;
            }
        }

        // Apply initial font to preview
        updateFontPreview(fontSelect.value);
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings', false);
    }

    // Handle API choice change
    function handleApiChoiceChange() {
        geminiSettings.style.display = geminiApiRadio.checked ? 'block' : 'none';
    }

    // Function to update font preview
    function updateFontPreview(fontFamily) {
        document.body.style.fontFamily = fontFamily;
        // Update the preview text if you want to add a preview element
        const elements = document.querySelectorAll('label, input, select, button');
        elements.forEach(element => {
            element.style.fontFamily = fontFamily;
        });
    }

    // Font change handler
    fontSelect.addEventListener('change', (e) => {
        updateFontPreview(e.target.value);
    });

    freeApiRadio.addEventListener('change', handleApiChoiceChange);
    geminiApiRadio.addEventListener('change', handleApiChoiceChange);

    // Save settings
    saveButton.addEventListener('click', async () => {
        const apiChoice = geminiApiRadio.checked ? 'gemini' : 'free';
        const settings = {
            language: languageSelect.value,
            theme: darkThemeRadio.checked ? 'dark' : 'light',
            font: fontSelect.value,
            fontSize: '14px'
        };

        try {
            await chrome.storage.local.set({
                api_choice: apiChoice,
                gemini_api_key: apiKeyInput.value,
                settings: settings
            });

            // Immediately apply the font change
            updateFontPreview(settings.font);
            showStatus('Settings saved successfully!', true);
        } catch (error) {
            console.error('Error saving settings:', error);
            showStatus('Error saving settings', false);
        }
    });

    function showStatus(message, isSuccess) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${isSuccess ? 'success' : 'error'}`;
        statusDiv.style.display = 'block';
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});