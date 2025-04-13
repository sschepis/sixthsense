# Sixth Sense

[![npm version](https://badge.fury.io/js/sixthsense.svg)](https://badge.fury.io/js/sixthsense) <!-- Placeholder badge -->

A TypeScript library for generating symbolic representations based on environmental entropy, primarily derived from user interactions like mouse movements and keystrokes.

## Overview

Resonator Core captures subtle timing variations in user input to generate an "entropy snapshot". This snapshot is then used to:

1.  **Compute EDM (Entropy Deviation Metric):** Measures the deviation from a baseline entropy level, indicating potential shifts in user attention or system state.
2.  **Evolve a Wavefunction (Ψ):** Simulates a quantum-like state based on the current entropy characteristics.
3.  **Collapse HQE (Holographic Quantum Encoding):** Probabilistically selects a symbolic representation (based on I Ching hexagrams, Tarot, Runes, Hebrew letters) from the evolved wavefunction, influenced by the entropy snapshot.

The library also provides a `SymbolicEventBus` for emitting events related to entropy generation, attention levels, and wavefunction collapse.

## Installation

```bash
npm install @sschepis/sixthsense
# or
yarn add @sschepis/sixthsense
```

## Basic Usage

```typescript
import { tickResonator, ResonatorBus } from 'resonator-core';

// Listen for collapse events
ResonatorBus.on('resonator:collapse', {
  handler: (event) => {
    console.log('Wavefunction Collapsed:', event.symbol.code);
    console.log('Symbol Details:', event.symbol);
    console.log('Resonance Score:', event.resonance.score);
  }
});

// Listen for attention events
ResonatorBus.on('resonator:attention', {
  handler: (event) => {
    console.log('Attention Level:', event.level, 'Coherent:', event.coherent);
  }
});

// --- Triggering the Resonator ---

// Option 1: On an interval
setInterval(() => {
  const collapseResult = tickResonator();
  // You can use the direct result if needed, though the bus is often preferred
  // console.log('Direct Collapse Result:', collapseResult);
}, 1000); // Example: tick every second

// Option 2: Hooked to requestAnimationFrame (for smoother browser integration)
function animationLoop() {
  tickResonator();
  requestAnimationFrame(animationLoop);
}
// requestAnimationFrame(animationLoop); // Uncomment to start loop

// Option 3: Triggered by specific UI events
// Make sure the event listeners in lib/entropy.ts are active (they run by default in browser)
document.body.addEventListener('click', (event) => {
  console.log('Ticking resonator on click...');
  tickResonator(event); // Pass the event context (optional)
});

```

## Core Concepts

*   **Entropy (`lib/entropy.ts`):** Captures timing deltas from `mousemove` and `keydown` events. Requires a browser-like environment with `window.performance` and event listeners.
*   **EDM (`lib/edm.ts`):** Calculates attention/coherence based on entropy deviation.
*   **Wavefunction (`lib/wavefunction.ts`):** A mathematical model representing potential states, influenced by time and entropy delta.
*   **Encoder (`lib/encoder.ts`):** Collapses the wavefunction into a specific symbol based on probabilities derived from the wavefunction's state and entropy bits. Includes mappings for I Ching, Tarot, Runes, and Hebrew letters.
*   **Event Bus (`lib/bus.ts`):** Allows different parts of an application to subscribe to resonator events without tight coupling.

## Environment

This library is primarily designed for browser environments where `window.addEventListener` and `performance.now()` are available for entropy generation. Limited functionality might be possible in Node.js if entropy data is provided externally.

## License

ISC (See `package.json`)
