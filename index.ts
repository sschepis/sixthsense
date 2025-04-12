import { generateEntropySnapshot } from "./lib/entropy.js";
import { computeEDM } from "./lib/edm.js";
import { evolveWavefunction } from "./lib/wavefunction.js";
import { collapseHQE } from "./lib/encoder.js";
import { SymbolicEventBus } from "./lib/bus.js";

const bus = new SymbolicEventBus();

export function tickResonator(context: Event | null = null) {
  const entropy = generateEntropySnapshot(context);
  const edm = computeEDM(entropy);

  bus.emit("resonator:entropy", {
    ...entropy
  });

  bus.emit("resonator:attention", {
    timestamp: Date.now(),
    level: edm.level,
    deviation: edm.deviation,
    coherent: edm.coherent
  });

  const Ψ = evolveWavefunction(entropy);
  const collapse = collapseHQE(Ψ, entropy);

  bus.emit("resonator:collapse", {
    timestamp: Date.now(),
    ...collapse
  });

  return collapse;
}

export { bus as ResonatorBus };

// Hook this function to requestAnimationFrame, setInterval, or UI-driven triggers