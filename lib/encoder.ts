const SYMBOLIC_MAP = [
  "䷀", "䷁", "䷂", "䷃", "䷄", "䷅", "䷆", "䷇",
  "䷈", "䷉", "䷊", "䷋", "䷌", "䷍", "䷎", "䷏",
  "䷐", "䷑", "䷒", "䷓", "䷔", "䷕", "䷖", "䷗",
  "䷘", "䷙", "䷚", "䷛", "䷜", "䷝", "䷞", "䷟",
  "䷠", "䷡", "䷢", "䷣", "䷤", "䷥", "䷦", "䷧",
  "䷨", "䷩", "䷪", "䷫", "䷬", "䷭", "䷮", "䷯",
  "䷰", "䷱", "䷲", "䷳", "䷴", "䷵", "䷶", "䷷",
  "䷸", "䷹", "䷺", "䷻", "䷼", "䷽", "䷾", "䷿", "☯" // Added ☯ as 65th symbol
];

const TAROT_MAJOR_ARCANA = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
]; // 22 cards

const RUNES = [
  "Fehu", "Uruz", "Thurisaz", "Ansuz", "Raidho", "Kenaz", "Gebo", "Wunjo",
  "Hagalaz", "Nauthiz", "Isa", "Jera", "Eihwaz", "Perthro", "Algiz", "Sowilo",
  "Tiwaz", "Berkano", "Ehwaz", "Mannaz", "Laguz", "Ingwaz", "Dagaz", "Othala"
]; // 24 runes

const HEBREW = [
  "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י",
  "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר",
  "ש", "ת"
]; // 22 letters

// Define the expected structure of the entropy object
interface EntropyInput {
  delta: number;
  entropyBits: string;
}

// Define the structure of the collapse result
export interface CollapseResult {
  symbol: {
    type: string;
    code: string;
    index: number;
    overlay: { type: string; name: string; index: number }[];
  };
  resonance: {
    score: number;
    deviation: number;
  };
}

export function collapseHQE(Ψ: number[], entropy: EntropyInput): CollapseResult {
  const magnitude = Ψ.map(x => Math.abs(x));
  const total = magnitude.reduce((a, b) => a + b, 0);

  // Handle potential division by zero if total magnitude is 0
  const safeTotal = total === 0 ? 1 : total;
  const probabilities = magnitude.map(x => x / safeTotal);

  // Use more bits for potentially better distribution, ensure it's within safe integer range
  const entropyValue = parseInt(entropy.entropyBits.slice(0, 6), 16); // Use 24 bits
  const maxEntropyValue = Math.pow(16, 6) - 1; // Max value for 6 hex digits
  const r = entropyValue / maxEntropyValue; // Normalize to 0-1 range

  let cumulative = 0;
  let selectedIndex = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (r <= cumulative) {
      selectedIndex = i;
      break;
    }
  }
  // Fallback if loop doesn't select (e.g., due to floating point issues)
  if (selectedIndex === 0 && r > cumulative) {
      selectedIndex = probabilities.length - 1;
  }


  const hexagram = SYMBOLIC_MAP[selectedIndex % SYMBOLIC_MAP.length];
  const tarot = TAROT_MAJOR_ARCANA[selectedIndex % TAROT_MAJOR_ARCANA.length];
  const rune = RUNES[selectedIndex % RUNES.length];
  const hebrew = HEBREW[selectedIndex % HEBREW.length];

  return {
    symbol: {
      type: "hexagram",
      code: hexagram,
      index: selectedIndex,
      overlay: [
        { type: "tarot", name: tarot, index: selectedIndex % TAROT_MAJOR_ARCANA.length },
        { type: "rune", name: rune, index: selectedIndex % RUNES.length },
        { type: "hebrew", name: hebrew, index: selectedIndex % HEBREW.length }
      ]
    },
    resonance: {
      score: probabilities[selectedIndex],
      // Calculate deviation from uniform probability
      deviation: probabilities[selectedIndex] - (1 / probabilities.length)
    }
  };
}