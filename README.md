# IntelliText - AI-Powered Text Analysis Extension

![IntelliText Icon](path/to/icon.png)  
*An intelligent Chrome extension that provides AI-powered definitions, synonyms, antonyms, and explanations for selected text.*

---

## 📖 Overview

**IntelliText** is a Chrome extension that enhances your browsing experience by offering instant insights into selected text. Whether you select a single word to get a definition, part of speech, synonyms, and antonyms, or multiple words for a simplified explanation, IntelliText leverages the power of the LLM models via the Hugging Face API.

With a modern, attractive UI and seamless integration, it’s perfect for students, professionals, and casual readers.

---

## ✨ Features

- 🔍 **Single Word Lookup**: Displays definitions, part of speech, synonyms, and antonyms.
- 🧠 **Phrase Explanation**: Simplified explanation for selected multiple words or phrases.
- 🎨 **Attractive Popup UI**: Clean design with purple accent, loading animations, and error handling.
- ❌ **Flexible Closing**: Close the popup by clicking outside or using the close button.
- 🖱️ **Context Menu Support**: Right-click selected text to trigger a lookup.
- 🤖 **AI-Driven**: Powered by the LLM models from Hugging Face for accurate and context-aware results.

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/intellitext.git
cd intellitext
```
### 2. Install Dependencies

No external dependencies are required beyond the Chrome browser and a Hugging Face API key.

---

### 3. Set Up API Key

- Sign up for a Hugging Face account at [huggingface.co](https://huggingface.co).
- Obtain an API key from your account settings.
- Replace the placeholder API key in `content.js` (e.g., `hf_xxx...`) with your own key, or securely manage it using Chrome storage.

⚠️ **Important**: Do not commit your API key to version control. Consider using environment variables or Chrome's storage API for safer usage.

---

### 4. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the extension directory

The IntelliText icon should now appear in your toolbar.

---

## 🚀 Usage

### 📌 Select Text

Highlight a **single word** or **multiple words** on any webpage.

---

### 💬 View Popup

A popup will appear showing:

- Definitions, synonyms, antonyms (for single words)
- Simplified explanations (for phrases)

A loading spinner will be shown while data is being fetched.

---

### ❌ Close Popup

Click the `"×"` button or anywhere outside the popup to dismiss it.

---

## 🎥 GIF Demonstrations

Right-click the selected text and choose the **"Lookup with IntelliText"** option from the context menu.
![Word](https://github.com/user-attachments/assets/935579e2-757b-490f-995a-34783060c7af)
![summary](https://github.com/user-attachments/assets/fb2e1fb0-187f-452f-860f-fd03715580cd)

---




---

## 📄 License

**MIT License** — Feel free to use, modify, and distribute responsibly.

---

## 🙌 Contributing

Pull requests and feature suggestions are welcome!  
Let’s make learning easier together 💡
