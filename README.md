# Labelscript <img src="icon48.png" alt="Labelscript Logo" width="48" align="right"/>

**Labelscript** is a minimal, productivity-focused Chrome extension (Manifest V3) that lets you convert selected text to Unicode superscripts and quickly insert frequently used text snippets via your right-click context menu.

![Labelscript Extension Popup](menu.png)
![Right Click Context Menu](when-right-click.png)

---

## Features

- **Superscript Selection (`Superscript this`)**:
  - Highlight any text (single character or full string) on any webpage or editable field.
  - Right-click and choose **"Superscript this"**.
  - Replaces text in-place inside textboxes, inputs, and rich-text editors (`contentEditable`).
  - Automatically copies the superscripted result to your clipboard and displays an unobtrusive confirmation toast.
  - Supports numbers (`0-9`), lowercase & uppercase letters (`a-z`, `A-Z`), and common symbols (`+`, `-`, `=`, `(`, `)`).
    - Example: `2` &rarr; `²`, `1st` &rarr; `¹ˢᵗ`, `mc2` &rarr; `ᵐᶜ²`, `x+y=z` &rarr; `ˣ⁺ʸ⁼ᶻ`.

- **Label Snippet Pasting**:
  - Save frequently typed snippets (emails, addresses, canned replies, signatures, or templates).
  - Right-click inside any input field, hover over **"Labelscript"**, and click any label to paste instantly.

- **Quick Superscript in Popup**:
  - Click the extension icon in your toolbar for a live superscript generator and one-click copy tool.
  - Manage and delete your saved labels with ease.

- **Minimalist & Lightweight**:
  - Pure vanilla JavaScript with zero external dependencies.
  - Fully compliant with Manifest V3 standards.

---

## How to Use

### 1. Superscripting Text
1. Highlight any character or string on your browser (e.g. `2nd`, `E = mc2`, `10^5`).
2. Right-click the highlighted text.
3. Click **"Superscript this"**.
4. The text will be converted in-place (in editable inputs) and copied to your clipboard.

### 2. Pasting Saved Labels
1. Right-click inside any input field or textarea.
2. Select **"Labelscript"** from the context menu.
3. Click your saved label name to paste the corresponding text.

### 3. Managing Labels & Popup Tool
1. Click the **Labelscript** icon in your browser toolbar.
2. Under **Manage Labels**, review or delete existing snippets.
3. Under **Add New Label**, enter a label name and the snippet text, then click **Save Label**.
4. Under **Quick Superscript**, type any text to see real-time superscript conversion and click **Copy Superscript**.

---

## Installation (Unpacked Extension)

To install locally in Google Chrome, Brave, Edge, or any Chromium-based browser:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/sigmacoy/labelscript.git
   ```
2. Open your browser and navigate to `chrome://extensions/`.
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the folder containing `manifest.json`.
6. Pin **Labelscript** to your browser toolbar for quick access.

---

## License

MIT License. Feel free to use, modify, and distribute.
