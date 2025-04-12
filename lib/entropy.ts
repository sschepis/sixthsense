const mouseMovements: number[] = [];
const keystrokeTimings: number[] = [];
let lastMouseTime = performance.now();
let lastKeyTime = performance.now();

// Setup listeners
// Check if window exists (for non-browser environments)
if (typeof window !== 'undefined') {
  window.addEventListener("mousemove", (_e) => {
    const now = performance.now();
    mouseMovements.push(now - lastMouseTime);
    lastMouseTime = now;
    // Keep arrays from growing indefinitely
    if (mouseMovements.length > 100) mouseMovements.shift();
  });

  window.addEventListener("keydown", (_e) => {
    const now = performance.now();
    keystrokeTimings.push(now - lastKeyTime);
    lastKeyTime = now;
    // Keep arrays from growing indefinitely
    if (keystrokeTimings.length > 100) keystrokeTimings.shift();
  });
}


function hashEntropyBits(arr: number[]): string {
  const seed = arr.map((x) => Math.floor(x)).join("");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function generateEntropySnapshot(context: Event | null = null) {
  // Use copies to avoid race conditions if listeners modify arrays during processing
  const currentMouse = [...mouseMovements];
  const currentKeys = [...keystrokeTimings];

  const merged = [...currentMouse.slice(-32), ...currentKeys.slice(-32)];
  const entropyBits = hashEntropyBits(merged);
  const delta = merged.length > 0 ? merged.reduce((a, b) => a + b, 0) / merged.length : 0;
  const timestamp = Date.now();

  // Basic context hashing, might need refinement
  const contextHash = context ? `${context.type}-${timestamp}` : "none";

  return {
    timestamp,
    entropyBits,
    delta,
    contextHash
  };
}