import { computeEDM } from '../edm.js'; // Adjust path as necessary

describe('computeEDM', () => {
  const baselineEntropy = 45; // Assuming the baseline used in edm.ts

  it('should calculate level 0 when delta equals baseline', () => {
    const entropy = { delta: baselineEntropy };
    const result = computeEDM(entropy);
    expect(result.level).toBe(0);
    expect(result.deviation).toBe(0);
    expect(result.coherent).toBe(false); // Assuming threshold > 0
  });

  it('should calculate level 1 when delta is 0', () => {
    const entropy = { delta: 0 };
    const result = computeEDM(entropy);
    expect(result.level).toBe(1);
    expect(result.deviation).toBe(1);
    expect(result.coherent).toBe(true); // Assuming threshold < 1
  });

  it('should calculate intermediate level correctly', () => {
    const delta = baselineEntropy / 2; // Halfway
    const entropy = { delta: delta };
    const result = computeEDM(entropy);
    const expectedDeviation = (baselineEntropy - delta) / baselineEntropy; // 0.5
    const expectedLevel = 0.5;
    expect(result.level).toBeCloseTo(expectedLevel);
    expect(result.deviation).toBeCloseTo(expectedDeviation);
    // Coherence depends on the threshold (0.25 in the module)
    expect(result.coherent).toBe(true);
  });

  it('should clamp level to 0 when delta exceeds baseline', () => {
    const entropy = { delta: baselineEntropy * 2 };
    const result = computeEDM(entropy);
    expect(result.level).toBe(0); // Clamped at 0
    expect(result.deviation).toBe(-1);
    expect(result.coherent).toBe(false);
  });

  it('should handle delta being slightly above baseline', () => {
    const entropy = { delta: baselineEntropy + 1 };
    const result = computeEDM(entropy);
    expect(result.level).toBe(0); // Clamped
    expect(result.deviation).toBeCloseTo(-1 / baselineEntropy);
    expect(result.coherent).toBe(false);
  });

   it('should handle delta being slightly below baseline', () => {
    const entropy = { delta: baselineEntropy - 1 };
    const result = computeEDM(entropy);
    expect(result.level).toBeCloseTo(1 / baselineEntropy);
    expect(result.deviation).toBeCloseTo(1 / baselineEntropy);
    expect(result.coherent).toBe(false); // 1/45 is less than 0.25
  });

  // Test coherence threshold explicitly
  it('should be coherent when level is just above threshold', () => {
    // Coherence threshold is 0.25
    // level = (baseline - delta) / baseline
    // 0.25 = (45 - delta) / 45
    // 0.25 * 45 = 45 - delta
    // 11.25 = 45 - delta
    // delta = 45 - 11.25 = 33.75
    const entropy = { delta: 33.74 }; // Delta slightly lower -> level slightly higher
    const result = computeEDM(entropy);
    expect(result.level).toBeGreaterThan(0.25);
    expect(result.coherent).toBe(true);
  });

  it('should not be coherent when level is just below threshold', () => {
    const entropy = { delta: 33.76 }; // Delta slightly higher -> level slightly lower
    const result = computeEDM(entropy);
    expect(result.level).toBeLessThan(0.25);
    expect(result.coherent).toBe(false);
  });

});