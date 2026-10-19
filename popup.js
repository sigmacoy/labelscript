/**
 * Labelscript - Popup Script
 * Manages snippet labels and provides real-time superscript conversion.
 */

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

/**
 * Converts input text to Unicode superscript characters.
 * Unmapped characters are left intact.
 */
function toSuperscript(text) {
  return Array.from(text).map((char) => SUPERSCRIPT_MAP[char] || char).join("");
}

/**
 * Renders the saved label list from local storage.
 */
async function render() {
  const data = await chrome.storage.local.get("labels");
  const labels = data.labels || {};
  const list = document.getElementById("list");
  list.innerHTML = "";

  const entries = Object.entries(labels);
  if (entries.length === 0) {
    list.innerHTML = '<div class="empty-state">No labels found. Add one below!</div>';
    return;
  }

  for (const [k, v] of entries) {
    const row = document.createElement("div");
    row.className = "row";

    const textContainer = document.createElement("div");
    textContainer.className = "row-text";

    const nameEl = document.createElement("div");
    nameEl.className = "row-name";
    nameEl.textContent = k;

    const valEl = document.createElement("div");
    valEl.className = "row-val";
    valEl.textContent = v;

    textContainer.appendChild(nameEl);
    textContainer.appendChild(valEl);

    const btn = document.createElement("button");
    btn.className = "del";
    btn.dataset.k = k;
    btn.title = "Delete label";
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>`;

    btn.onclick = async () => {
      const current = await chrome.storage.local.get("labels");
      const l = current.labels || {};
      delete l[btn.dataset.k];
      await chrome.storage.local.set({ labels: l });
      render();
    };

    row.appendChild(textContainer);
    row.appendChild(btn);
    list.appendChild(row);
  }
}

// Save new label handler
document.getElementById("save").onclick = async () => {
  const nameInput = document.getElementById("name");
  const valueInput = document.getElementById("value");
  const name = nameInput.value.trim();
  const value = valueInput.value;

  if (!name || !value) return;

  const data = await chrome.storage.local.get("labels");
  const labels = data.labels || {};
  labels[name] = value;
  await chrome.storage.local.set({ labels });

  nameInput.value = "";
  valueInput.value = "";
  render();
};

// Quick superscript converter elements
const superInput = document.getElementById("superInput");
const superResult = document.getElementById("superResult");
const copySuperBtn = document.getElementById("copySuper");

superInput.addEventListener("input", () => {
  const val = superInput.value;
  if (!val) {
    superResult.textContent = "Preview appears here";
  } else {
    superResult.textContent = toSuperscript(val);
  }
});

copySuperBtn.addEventListener("click", async () => {
  const raw = superInput.value;
  if (!raw) return;

  const text = toSuperscript(raw);
  await navigator.clipboard.writeText(text);

  copySuperBtn.textContent = "Copied!";
  copySuperBtn.classList.add("copied");

  setTimeout(() => {
    copySuperBtn.textContent = "Copy Superscript";
    copySuperBtn.classList.remove("copied");
  }, 1500);
});

// Initial render
render();