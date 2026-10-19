/**
 * Labelscript - Background Service Worker
 *
 * Provides right-click context menu options to:
 * 1. Convert selected text into Unicode superscripts (single character or string).
 * 2. Paste saved snippet labels into editable input fields.
 */

const DEFAULT_LABELS = {
  "Email": "myemail@example.com",
  "Address": "123 Main St",
  "Signature": "Best regards,\nJohn"
};

/**
 * Builds or rebuilds context menu items.
 */
async function buildMenu() {
  chrome.contextMenus.removeAll(async () => {
    // Context menu option when text is selected anywhere
    chrome.contextMenus.create({
      id: "superscriptThis",
      title: "Superscript this",
      contexts: ["selection"]
    });

    // Context menu root for saved labels in editable inputs
    chrome.contextMenus.create({
      id: "pasteRoot",
      title: "Labelscript",
      contexts: ["editable"]
    });

    const data = await chrome.storage.local.get("labels");
    const labels = data.labels || DEFAULT_LABELS;
    for (const name of Object.keys(labels)) {
      chrome.contextMenus.create({
        id: "paste_" + name,
        parentId: "pasteRoot",
        title: name,
        contexts: ["editable"]
      });
    }
  });
}

// Lifecycle listeners
chrome.runtime.onInstalled.addListener(buildMenu);
chrome.runtime.onStartup.addListener(buildMenu);
chrome.storage.onChanged.addListener(buildMenu);

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  // 1. Superscript selection
  if (info.menuItemId === "superscriptThis") {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedFallback) => {
        const SUPERSCRIPT_MAP = {
          "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
          "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
          "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
          "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ",
          "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ⁱ", "j": "ʲ",
          "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ",
          "p": "ᵖ", "q": "\u{107A5}", "r": "ʳ", "s": "ˢ", "t": "ᵗ",
          "u": "ᵘ", "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ",
          "A": "ᴬ", "B": "ᴮ", "C": "ᶜ", "D": "ᴰ", "E": "ᴱ",
          "F": "ᶠ", "G": "ᴳ", "H": "ᴴ", "I": "ᴵ", "J": "ᴶ",
          "K": "ᴷ", "L": "ᴸ", "M": "ᴹ", "N": "ᴺ", "O": "ᴼ",
          "P": "ᴾ", "Q": "\u{107A5}", "R": "ᴿ", "S": "ˢ", "T": "ᵀ",
          "U": "ᵁ", "V": "ⱽ", "W": "ᵂ", "X": "ˣ", "Y": "ʸ", "Z": "ᶻ"
        };

        const toSuperscript = (str) =>
          Array.from(str).map((c) => SUPERSCRIPT_MAP[c] || c).join("");

        const copyToClipboard = (text) => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
          } else {
            fallbackCopy(text);
          }
        };

        const fallbackCopy = (text) => {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
          } finally {
            ta.remove();
          }
        };

        const showToast = (message) => {
          const existing = document.getElementById("__labelscript_toast__");
          if (existing) existing.remove();

          const toast = document.createElement("div");
          toast.id = "__labelscript_toast__";
          toast.textContent = message;
          toast.style.cssText = [
            "position: fixed",
            "bottom: 24px",
            "right: 24px",
            "background: #111827",
            "color: #f9fafb",
            "padding: 10px 16px",
            "border-radius: 8px",
            "font-size: 13px",
            "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            "box-shadow: 0 4px 14px rgba(0,0,0,0.2)",
            "border: 1px solid rgba(255,255,255,0.12)",
            "z-index: 2147483647",
            "opacity: 0",
            "transform: translateY(8px)",
            "transition: opacity 0.2s ease, transform 0.2s ease",
            "pointer-events: none"
          ].join("; ");

          document.body.appendChild(toast);
          requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
          });

          setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(8px)";
            setTimeout(() => toast.remove(), 250);
          }, 2000);
        };

        const el = document.activeElement;
        let selectedText = "";

        // 1. Text selection inside an input or textarea
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
          const start = el.selectionStart;
          const end = el.selectionEnd;
          selectedText = (start !== null && end !== null && start !== end)
            ? el.value.slice(start, end)
            : (selectedFallback || "");

          const converted = toSuperscript(selectedText);
          if (start !== null && end !== null && start !== end) {
            el.value = el.value.slice(0, start) + converted + el.value.slice(end);
            el.selectionStart = el.selectionEnd = start + converted.length;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }

          copyToClipboard(converted);
          const preview = converted.length > 20 ? converted.slice(0, 18) + "…" : converted;
          showToast(`Superscripted: "${preview}"`);
          return;
        }

        // 2. Text selection in contentEditable
        if (el && el.isContentEditable) {
          const sel = window.getSelection();
          selectedText = sel ? sel.toString() : (selectedFallback || "");
          const converted = toSuperscript(selectedText);
          document.execCommand("insertText", false, converted);
          copyToClipboard(converted);
          const preview = converted.length > 20 ? converted.slice(0, 18) + "…" : converted;
          showToast(`Superscripted: "${preview}"`);
          return;
        }

        // 3. Selection in static text on webpage
        const sel = window.getSelection();
        selectedText = (sel && sel.toString()) ? sel.toString() : (selectedFallback || "");
        const converted = toSuperscript(selectedText);
        copyToClipboard(converted);
        const preview = converted.length > 20 ? converted.slice(0, 18) + "…" : converted;
        showToast(`Superscript copied: "${preview}"`);
      },
      args: [info.selectionText || ""]
    });
    return;
  }

  // 2. Paste saved label into editable field
  if (info.menuItemId.startsWith("paste_")) {
    const key = info.menuItemId.replace("paste_", "");
    const data = await chrome.storage.local.get("labels");
    const labels = data.labels || DEFAULT_LABELS;
    const text = labels[key] || "";

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (t) => {
        const el = document.activeElement;
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
          const start = el.selectionStart ?? el.value.length;
          const end = el.selectionEnd ?? el.value.length;
          el.value = el.value.slice(0, start) + t + el.value.slice(end);
          el.selectionStart = el.selectionEnd = start + t.length;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (el && el.isContentEditable) {
          document.execCommand("insertText", false, t);
        }
      },
      args: [text]
    });
  }
});