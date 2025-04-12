const baselineEntropy = 45; // Example baseline, might need calibration
const coherenceThreshold = 0.25; // Example threshold, might need tuning

export function computeEDM(entropy: { delta: number }) {
  // Ensure baselineEntropy is not zero to avoid division by zero
  // Ensure baselineEntropy is not zero to avoid division by zero (handled by const value)
  const deviation = (baselineEntropy - entropy.delta) / baselineEntropy;

  // Clamp level between 0 and 1
  const level = Math.max(0, Math.min(1, deviation));
  const coherent = level > coherenceThreshold;

  return {
    deviation,
    level,
    coherent
  };
}