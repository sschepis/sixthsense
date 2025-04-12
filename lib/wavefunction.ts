const PRIMES: number[] = [
  2, 3, 5, 7, 11, 13, 17, 19,
  23, 29, 31, 37, 41, 43, 47, 53,
  59, 61, 67, 71, 73, 79, 83, 89,
  97, 101, 103, 107, 109, 113, 127, 131
];

// Define the expected structure of the entropy object
interface EntropyInput {
  delta: number;
  timestamp: number;
}

export function evolveWavefunction(entropy: EntropyInput): number[] {
  const t = entropy.timestamp / 1000; // normalize time scale
  const λ = entropy.delta || 1; // Use 1 if delta is 0 or undefined to avoid issues

  const state = PRIMES.map((p) => {
    // Simple wave evolution model, could be expanded
    const phase = Math.sin(p * t) * Math.exp(-λ * 0.001 * p);
    return phase;
  });

  return state;
}