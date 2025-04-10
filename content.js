let popup = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "lookupWord") {
        showPopup(request.selection);
    }
});

// Listen for text selection events
document.addEventListener('mouseup', (event) => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
        // Small delay to ensure selection is complete
        setTimeout(() => {
            showPopup(selection);
        }, 200);
    } else if (popup && !popup.contains(event.target)) {
        removePopup();
    }
});

function removePopup() {
    if (popup) {
        try {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        } catch (e) {
            console.warn("Popup removal failed safely:", e.message);
        }
        popup = null; // Reset popup regardless of removal success
    }
}

async function showPopup(text) {
    if (!text || !text.trim()) return; // Early return for empty input

    removePopup(); // Remove existing popup if any
    
    // Create popup element
    popup = document.createElement('div');
    popup.className = 'smart-dictionary-popup';
    
    // Add loading spinner
    popup.innerHTML = `
        <div class="smart-dictionary-header">
            <h3>${text}</h3>
            <button class="smart-dictionary-close-btn">×</button>
        </div>
        <div class="smart-dictionary-content">
            <div class="smart-dictionary-loading">
                <div class="smart-dictionary-spinner"></div>
                <p>Looking up...</p>
            </div>
        </div>
    `;
    
    // Add close button functionality immediately after creation
    const closeBtn = popup.querySelector('.smart-dictionary-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', removePopup);
    }
    
    // Position the popup
    const selection = window.getSelection();
    let leftPosition = 100;
    let topPosition = 100;
    
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popupWidth = 320;
        
        leftPosition = rect.left + window.scrollX;
        if (leftPosition + popupWidth > viewportWidth) {
            leftPosition = viewportWidth - popupWidth - 20;
        }
        
        topPosition = rect.bottom + window.scrollY + 10;
        if (topPosition + 300 > viewportHeight + window.scrollY) {
            topPosition = rect.top + window.scrollY - 320;
        }
    } else {
        leftPosition = window.innerWidth / 2 - 160;
        topPosition = window.scrollY + 100;
    }
    
    popup.style.left = `${leftPosition}px`;
    popup.style.top = `${topPosition}px`;
    
    // Add popup to page
    document.body.appendChild(popup);
    
    // Get surrounding text for context
    let surroundingText = "";
    try {
        if (selection && selection.rangeCount > 0) {
            surroundingText = getSurroundingText(selection, 100);
        }
    } catch (error) {
        console.error("Error getting surrounding text:", error);
    }
    
    // Fetch data from API
    try {
        const data = await fetchLLMData(text, surroundingText);
        updatePopupContent(data, text);
    } catch (error) {
        popup.querySelector('.smart-dictionary-content').innerHTML = `
            <div class="smart-dictionary-error">
                <p>Sorry, couldn't find information for "${text}".</p>
                <p class="smart-dictionary-error-details">${error.message}</p>
            </div>
        `;
    }
}

function getSurroundingText(selection, charCount) {
    try {
        if (!selection || selection.rangeCount === 0) {
            return "";
        }
        
        const range = selection.getRangeAt(0);
        const startNode = range.startContainer;
        
        let parentNode = startNode;
        while (parentNode && parentNode.nodeName !== 'P' && parentNode.nodeName !== 'DIV' && parentNode.nodeName !== 'BODY') {
            parentNode = parentNode.parentNode;
        }
        
        if (parentNode) {
            const text = parentNode.textContent;
            return text.length <= charCount * 2 ? text : text.substring(0, charCount * 2);
        }
        
        return "";
    } catch (e) {
        console.error("Error in getSurroundingText:", e);
        return "";
    }
}

async function fetchLLMData(text, context = "") {
    // const apiKey = "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";
    // const modelName = "mistralai/Mistral-7B-Instruct-v0.1";
    const { apiKey, modelName } = await chrome.storage.local.get(["apiKey", "modelName"]);
    
    if (!apiKey) {
        throw new Error("API key not set. Please add your Hugging Face API key in the extension settings.");
    }
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const isSingleWord = words.length === 1;
    
    let prompt;
    if (isSingleWord) {
        prompt = `
        I need information about the word "${text}". Please provide:
        1. A clear, concise definition
        2. Part of speech (noun, verb, adjective, etc.)
        3. Three to five synonyms
        4. Two to three antonyms (if applicable)
        
        Format your response as JSON with the following structure:
        {
            "definition": "Definition here",
            "partOfSpeech": "part of speech here",
            "synonyms": ["synonym1", "synonym2", "synonym3"],
            "antonyms": ["antonym1", "antonym2"]
        }
        
        If context helps, this word appeared in: "${context}"
        `;
    } else {
        prompt = `
        Explain this phrase or sentence in simple language: "${text}"
        
        Format your response as JSON with the following structure:
        {
            "explanation": "Simple explanation here"
        }
        
        If context helps, this phrase appeared in: "${context}"
        `;
    }
    
    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.3,
                    top_p: 0.95,
                    return_full_text: false
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const result = await response.json();
        let responseText = result[0]?.generated_text || '';
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            return JSON.parse(jsonStr);
        } else {
            return isSingleWord ? 
                {
                    definition: responseText,
                    partOfSpeech: "",
                    synonyms: [],
                    antonyms: []
                } : 
                {
                    explanation: responseText
                };
        }
    } catch (error) {
        console.error("API Error:", error);
        throw new Error("Failed to get data from the LLM model. Please try again later.");
    }
}

function updatePopupContent(data, text) {
    const contentDiv = popup.querySelector('.smart-dictionary-content');
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const isSingleWord = words.length === 1;
    
    if (isSingleWord) {
        contentDiv.innerHTML = `
            <div class="smart-dictionary-section">
                <h4>Definition</h4>
                <p>${data.definition || "No definition available."}</p>
            </div>
            
            ${data.partOfSpeech ? `
            <div class="smart-dictionary-section">
                <h4>Part of Speech</h4>
                <p>${data.partOfSpeech}</p>
            </div>
            ` : ''}
            
            ${data.synonyms && data.synonyms.length > 0 ? `
            <div class="smart-dictionary-section">
                <h4>Synonyms</h4>
                <div class="smart-dictionary-word-list">
                    ${data.synonyms.map(syn => `<span class="word-chip">${syn}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${data.antonyms && data.antonyms.length > 0 ? `
            <div class="smart-dictionary-section">
                <h4>Antonyms</h4>
                <div class="smart-dictionary-word-list">
                    ${data.antonyms.map(ant => `<span class="word-chip">${ant}</span>`).join('')}
                </div>
            </div>
            ` : ''}
        `;
    } else {
        contentDiv.innerHTML = `
            <div class="smart-dictionary-section">
                <h4>Simple Explanation</h4>
                <p>${data.explanation || "No explanation available."}</p>
            </div>
        `;
    }
}