// Global variables for API settings
let GEMINI_API_KEY = '';
let API_CHOICE = 'free'; // Default to free API

// Default user interface settings
let userSettings = {
    language: "en",
    theme: "dark",
    font: "Arial, sans-serif",
    fontSize: "14px",
};

// Load settings when content script initializes
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['gemini_api_key', 'api_choice', 'settings']);
        
        // Load API settings
        if (result.gemini_api_key) {
            GEMINI_API_KEY = result.gemini_api_key;
            console.log('API key loaded successfully');
        }
        
        if (result.api_choice) {
            API_CHOICE = result.api_choice;
            console.log('API choice loaded:', API_CHOICE);
        }

        // Load user interface settings
        if (result.settings) {
            userSettings = { ...userSettings, ...result.settings };
            console.log('User settings loaded successfully');
        }

        // Update UI with loaded settings
        updateUIWithSettings();
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings function
async function saveSettings() {
    try {
        await chrome.storage.local.set({
            gemini_api_key: GEMINI_API_KEY,
            api_choice: API_CHOICE,
            settings: userSettings
        });
        console.log('Settings saved successfully');
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Function to update UI elements with current settings
function updateUIWithSettings() {
    if (defineButton) {
        defineButton.style.fontFamily = userSettings.font;
        defineButton.style.fontSize = userSettings.fontSize;
    }
}

// Listen for settings changes from popup or options page
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.gemini_api_key) {
            GEMINI_API_KEY = changes.gemini_api_key.newValue;
            console.log('API key updated');
        }
        if (changes.api_choice) {
            API_CHOICE = changes.api_choice.newValue;
            console.log('API choice updated:', API_CHOICE);
        }
        if (changes.settings) {
            userSettings = { ...userSettings, ...changes.settings.newValue };
            updateUIWithSettings();
            console.log('Settings updated');
        }
    }
});

// Create styles for the extension
const style = document.createElement('style');
style.textContent = `
    .definition-dialog {
        position: absolute;
        z-index: 10001;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 300px;
        min-width: 200px;
        background-color: ${userSettings.theme === 'dark' ? '#1e1e1e' : '#ffffff'};
        color: ${userSettings.theme === 'dark' ? '#ffffff' : '#000000'};
    }

    .dialog-body {
        margin: 0;
        padding: 0;
    }

    #define-button {
        background-color: #007BFF;
    }

    #define-button:hover {
        background-color: #0056b3;
    }
`;
document.head.appendChild(style);

// Create the Define button
const defineButton = document.createElement("button");
defineButton.textContent = "Define";
defineButton.id = "define-button";
defineButton.style.cssText = `
    display: none;
    position: absolute;
    z-index: 10000;
    padding: 8px 12px;
    color: #fff;
    border: none;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    font-family: ${userSettings.font};
    font-size: ${userSettings.fontSize};
`;

// Main function to get definition based on API choice
async function getDefinition(word, language) {
    try {
        if (API_CHOICE === 'free') {
            return await getFreeDefinition(word);
        } else {
            if (!GEMINI_API_KEY) {
                throw new Error('Gemini API key not set');
            }
            return await getGeminiDefinition(word, language);
        }
    } catch (error) {
        throw new Error(`Definition error: ${error.message}`);
    }
}

// Function to get definition from Free Dictionary API
async function getFreeDefinition(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!response.ok) {
            throw new Error('Word not found');
        }
        const data = await response.json();
        
        if (data && data[0] && data[0].meanings && data[0].meanings[0]) {
            const meaning = data[0].meanings[0];
            const definition = meaning.definitions[0].definition;
            const partOfSpeech = meaning.partOfSpeech;
            return `(${partOfSpeech}) ${definition}`;
        }
        throw new Error('No definition found');
    } catch (error) {
        throw new Error(error.message === 'Word not found' ? 
            'Word not found in dictionary' : 
            'Error fetching definition');
    }
}

// Function to get definition from Gemini API
async function getGeminiDefinition(word, language) {
    const languagePrompts = {
        en: `Define the word "${word}" in a single, clear sentence.`,
        hi: `"${word}" शब्द की परिभाषा एक वाक्य में दें।`,
        bn: `"${word}" শব্দের সংজ্ঞা একটি বাক্যে বলুন।`,
        te: `"${word}" పదానికి నిర్వచనాన్ని ఒక వాక్యంలో చెప్పండి.`,
        ta: `"${word}" சொல்லின் விளக்கத்தை ஒரு வாக்கியத்தில் கூறவும்.`,
        mr: `"${word}" या शब्दाची व्याख्या एका वाक्यात सांगा.`,
        gu: `"${word}" શબ્દની વ્યાખ્યા એક વાક્યમાં આપો.`,
        ja: `"${word}"という言葉を一文で定義してください。`,
        ko: `"${word}" 단어를 한 문장으로 정의하세요.`,
        zh: `请用一句话解释"${word}"这个词的定义。`,
        es: `Define la palabra "${word}" en una sola frase clara.`,
        fr: `Définissez le mot "${word}" en une seule phrase claire.`,
        de: `Definieren Sie das Wort "${word}" in einem einzigen klaren Satz.`,
        it: `Definisci la parola "${word}" in una sola frase chiara.`,
        pt: `Defina a palavra "${word}" em uma única frase clara.`,
        ru: `Определите слово "${word}" в одном четком предложении.`,
        default: `Define the word "${word}" in a single, clear sentence.`
    };

    const prompt = languagePrompts[language] || languagePrompts.default;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Unexpected API response format');
        }
    } catch (error) {
        throw new Error(`Gemini API error: ${error.message}`);
    }
}

// Append the define button to the document
document.body.appendChild(defineButton);

// Handle text selection
document.addEventListener("mouseup", (e) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText && 
        /^[a-zA-Z]+$/.test(selectedText) && 
        !e.target.closest('#definition-dialog')) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const buttonLeft = rect.left + window.scrollX;
        const buttonTop = rect.top + window.scrollY - 40;
        
        defineButton.style.left = `${buttonLeft}px`;
        defineButton.style.top = `${buttonTop}px`;
        defineButton.style.display = "block";
    } else {
        defineButton.style.display = "none";
    }
});

// Define button click handler
defineButton.onclick = async (e) => {
    e.stopPropagation();
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (API_CHOICE === 'gemini' && !GEMINI_API_KEY) {
        updateDefinitionDialog(selectedText, "Please set your Gemini API key in the extension settings.");
        return;
    }

    showDefinitionDialog(selectedText, "Loading definition...");
    
    try {
        const definition = await getDefinition(selectedText, userSettings.language);
        updateDefinitionDialog(selectedText, definition);
    } catch (err) {
        console.error("Error fetching definition:", err);
        updateDefinitionDialog(selectedText, `Error: ${err.message}`);
    }

    defineButton.style.display = "none";
};

function showDefinitionDialog(word, content) {
    const existingDialog = document.getElementById("definition-dialog");
    if (existingDialog) existingDialog.remove();

    const dialog = document.createElement("div");
    dialog.id = "definition-dialog";
    dialog.className = "definition-dialog";
    
    dialog.innerHTML = `
        <div class="dialog-body">
            <strong style="font-size: 1.2em; font-family: ${userSettings.font}">${word}</strong>
            <p style="margin: 4px 0 0; font-family: ${userSettings.font}; font-size: ${userSettings.fontSize}">${content}</p>
        </div>
    `;

    // Apply theme styles to dialog
    dialog.style.backgroundColor = userSettings.theme === 'dark' ? '#1e1e1e' : '#ffffff';
    dialog.style.color = userSettings.theme === 'dark' ? '#ffffff' : '#000000';
    dialog.style.fontFamily = userSettings.font;
    dialog.style.fontSize = userSettings.fontSize;

    document.body.appendChild(dialog);

    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    const dialogLeft = rect.left + window.scrollX;
    const dialogTop = rect.top + window.scrollY - dialog.offsetHeight - 10;

    dialog.style.left = `${dialogLeft}px`;
    dialog.style.top = `${dialogTop}px`;

    setTimeout(() => attachOutsideClickHandler(dialog), 0);
}

function updateDefinitionDialog(word, definition) {
    const dialog = document.getElementById("definition-dialog");
    if (dialog) {
        dialog.querySelector(".dialog-body").innerHTML = `
            <strong style="font-size: 1.2em; font-family: ${userSettings.font}">${word}</strong>
            <p style="margin: 4px 0 0; font-family: ${userSettings.font}; font-size: ${userSettings.fontSize}">${definition}</p>
        `;
    }
}

function attachOutsideClickHandler(dialog) {
    const handleOutsideClick = (event) => {
        if (!dialog.contains(event.target) && 
            event.target !== defineButton && 
            !event.target.closest('#define-button')) {
            dialog.remove();
            document.removeEventListener("click", handleOutsideClick);
        }
    };

    document.addEventListener("click", handleOutsideClick);
}

// Initialize settings when the script loads
loadSettings();