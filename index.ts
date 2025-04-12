import { generateEntropySnapshot } from "./lib/entropy";
import { computeEDM } from "./lib/edm";
import { evolveWavefunction } from "./lib/wavefunction";
import { collapseHQE } from "./lib/encoder";
import { SymbolicEventBus } from "./lib/bus";

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