import { tickResonator, ResonatorBus } from '../dist/index.js';

// --- Get DOM Elements ---
// Entropy Section
const entropyTimestampEl = document.getElementById('entropy-timestamp');
const entropyBitsEl = document.getElementById('entropy-bits');
const entropyDeltaEl = document.getElementById('entropy-delta');
const entropyContextEl = document.getElementById('entropy-context');

// Attention Section
const attentionLevelEl = document.getElementById('attention-level');
const attentionProgressEl = document.getElementById('attention-progress');
const attentionDeviationEl = document.getElementById('attention-deviation');
const attentionCoherentEl = document.getElementById('attention-coherent');

// Collapse Section
const collapseTimestampEl = document.getElementById('collapse-timestamp');
const collapseSymbolEl = document.getElementById('collapse-symbol');
const collapseSymbolTypeEl = document.getElementById('collapse-symbol-type');
const collapseIndexEl = document.getElementById('collapse-index');
const resonanceScoreEl = document.getElementById('resonance-score');
const resonanceDeviationEl = document.getElementById('resonance-deviation');
const collapseOverlaysEl = document.getElementById('collapse-overlays');

// --- Helper Functions ---
function formatTimestamp(ts) {
    if (!ts || typeof ts !== 'number') return '-';
    return new Date(ts).toLocaleTimeString();
}

function formatFloat(num, digits = 4) {
     if (typeof num !== 'number') return '-';
     return num.toFixed(digits);
}

// --- Event Listeners ---
ResonatorBus.on('resonator:entropy', {
    handler: (event) => {
        // console.log('Entropy Event:', event);
        if (entropyTimestampEl) entropyTimestampEl.textContent = formatTimestamp(event.timestamp);
        if (entropyBitsEl) entropyBitsEl.textContent = event.entropyBits || '-';
        if (entropyDeltaEl) entropyDeltaEl.textContent = formatFloat(event.delta);
        if (entropyContextEl) entropyContextEl.textContent = event.contextHash || '-';
    }
});

ResonatorBus.on('resonator:attention', {
    handler: (event) => {
        // console.log('Attention Event:', event);
        const levelPercent = (event.level * 100).toFixed(1);
        if (attentionLevelEl) attentionLevelEl.textContent = formatFloat(event.level);
        if (attentionProgressEl) {
             attentionProgressEl.style.width = `${levelPercent}%`;
             attentionProgressEl.textContent = `${levelPercent}%`; // Show percentage inside bar
        }
        if (attentionDeviationEl) attentionDeviationEl.textContent = formatFloat(event.deviation);
        if (attentionCoherentEl) attentionCoherentEl.textContent = event.coherent ? 'Yes' : 'No';
    }
});

ResonatorBus.on('resonator:collapse', {
    handler: (event) => {
        // console.log('Collapse Event:', event);
        if (collapseTimestampEl) collapseTimestampEl.textContent = formatTimestamp(event.timestamp);
        if (collapseSymbolEl) collapseSymbolEl.textContent = event.symbol?.code || '-';
        if (collapseSymbolTypeEl) collapseSymbolTypeEl.textContent = `(${event.symbol?.type || 'N/A'})`;
        if (collapseIndexEl) collapseIndexEl.textContent = typeof event.symbol?.index === 'number' ? event.symbol.index.toString() : '-';
        if (resonanceScoreEl) resonanceScoreEl.textContent = formatFloat(event.resonance?.score);
        if (resonanceDeviationEl) resonanceDeviationEl.textContent = formatFloat(event.resonance?.deviation);

        if (collapseOverlaysEl && event.symbol?.overlay) {
            collapseOverlaysEl.innerHTML = ''; // Clear previous overlays
            event.symbol.overlay.forEach(overlay => {
                const li = document.createElement('li');
                li.textContent = `${overlay.type}: ${overlay.name} (Index: ${overlay.index})`;
                collapseOverlaysEl.appendChild(li);
            });
        } else if (collapseOverlaysEl) {
             collapseOverlaysEl.innerHTML = '<li>-</li>';
        }
    }
});

// --- Start Ticking ---
console.log('Starting Resonator Core Ticker...');
// Trigger the resonator periodically
// The entropy listeners in the library itself will capture mouse/key events automatically
setInterval(() => {
    try {
        tickResonator(); // Pass null or an event object if needed
    } catch (error) {
        console.error("Error during tickResonator:", error);
        // Optionally stop the interval if errors persist
    }
}, 750); // Tick every 750ms

// Initial tick to populate dashboard faster
try {
    tickResonator();
} catch (error) {
    console.error("Error during initial tickResonator:", error);
}

// Add a listener to tick on clicks as well, passing the event context
document.body.addEventListener('click', (event) => {
    console.log('Ticking resonator on click...');
    try {
        tickResonator(event); // Pass the event context
    } catch (error) {
        console.error("Error during click tickResonator:", error);
    }
});