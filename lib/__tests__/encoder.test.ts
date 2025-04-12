import { collapseHQE } from '../encoder.js'; // Adjust path as necessary

describe('collapseHQE', () => {
  // Mock wavefunction state (Ψ) - needs 32 elements based on wavefunction.ts
  // Let's create a simple one where probabilities are easy to predict
  const mockPsi_uniform: number[] = Array(32).fill(1); // All elements equal -> uniform probability
  const mockPsi_skewed: number[] = Array(32).fill(0);
  mockPsi_skewed[5] = 10; // Skew probability towards index 5

  // Mock entropy input
  const mockEntropy_low = { delta: 10, entropyBits: '00000000' }; // Low entropy bits -> index 0
  // const mockEntropy_high = { delta: 10, entropyBits: 'ffffffff' }; // High entropy bits -> last index (Removed as unused)
  const mockEntropy_mid = { delta: 10, entropyBits: '80000000' }; // Mid entropy bits -> middle index

  it('should return the correct structure for CollapseResult', () => {
    const result = collapseHQE(mockPsi_uniform, mockEntropy_low);
    expect(result).toHaveProperty('symbol');
    expect(result).toHaveProperty('resonance');
    expect(result.symbol).toHaveProperty('type', 'hexagram');
    expect(result.symbol).toHaveProperty('code');
    expect(result.symbol).toHaveProperty('index');
    expect(result.symbol).toHaveProperty('overlay');
    expect(Array.isArray(result.symbol.overlay)).toBe(true);
    expect(result.symbol.overlay.length).toBe(3); // Tarot, Rune, Hebrew
    expect(result.resonance).toHaveProperty('score');
    expect(result.resonance).toHaveProperty('deviation');
  });

  it('should select index 0 for minimum entropyBits with uniform probability', () => {
    const result = collapseHQE(mockPsi_uniform, mockEntropy_low);
    // With uniform probability and lowest entropy bits, index 0 should be selected
    // Note: Uses first 6 hex digits (24 bits) -> '000000' -> r = 0
    expect(result.symbol.index).toBe(0);
  });

   it('should select the last index for maximum entropyBits with uniform probability', () => {
     // Uses first 6 hex digits -> 'ffffff' -> r = 1
     // With uniform probability and r=1, the loop should select the last index
     const entropy_max_24bit = { delta: 10, entropyBits: 'ffffff00' };
     const result = collapseHQE(mockPsi_uniform, entropy_max_24bit);
     expect(result.symbol.index).toBe(mockPsi_uniform.length - 1); // Last index (31)
   });

  it('should select an index near the middle for mid-range entropyBits with uniform probability', () => {
    // Uses first 6 hex digits -> '800000' -> r = 0.5
    const entropy_mid_24bit = { delta: 10, entropyBits: '80000000' };
    const result = collapseHQE(mockPsi_uniform, entropy_mid_24bit);
    // With uniform probability and r=0.5, index should be near the middle
    expect(result.symbol.index).toBeGreaterThanOrEqual(15);
    expect(result.symbol.index).toBeLessThanOrEqual(16); // Should be 15 or 16 depending on float precision
  });


  it('should heavily favor the index with higher magnitude in skewed probability', () => {
    // Run multiple times to check probabilistic favoring
    let selectedCounts: { [key: number]: number } = {};
    const runs = 100;
    for (let i = 0; i < runs; i++) {
      // Generate slightly varying entropy bits for each run
      const randomBits = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
      const entropy = { delta: 10, entropyBits: randomBits + '00' };
      const result = collapseHQE(mockPsi_skewed, entropy);
      selectedCounts[result.symbol.index] = (selectedCounts[result.symbol.index] || 0) + 1;
    }
    // Index 5 should be selected far more often than others
    expect(selectedCounts[5]).toBeGreaterThan(runs * 0.8); // Expect it selected >80% of the time
    expect(Object.keys(selectedCounts).length).toBeLessThan(runs * 0.5); // Expect few other indices selected
  });

  it('should calculate resonance score and deviation correctly for uniform probability', () => {
    const result = collapseHQE(mockPsi_uniform, mockEntropy_mid); // Use mid entropy for an average index
    const expectedProb = 1 / mockPsi_uniform.length;
    expect(result.resonance.score).toBeCloseTo(expectedProb);
    expect(result.resonance.deviation).toBeCloseTo(0); // Deviation should be near 0 for uniform
  });

   it('should calculate resonance score and deviation correctly for skewed probability', () => {
     // Force selection of index 5 using low entropy bits
     const result = collapseHQE(mockPsi_skewed, mockEntropy_low);
     // Find the probability of index 5
     const magnitude = mockPsi_skewed.map(x => Math.abs(x));
     const total = magnitude.reduce((a, b) => a + b, 0);
     const probIndex5 = magnitude[5] / total;
     const uniformProb = 1 / mockPsi_skewed.length;

     expect(result.symbol.index).toBe(5); // Should select 5 due to skew and low entropy bits
     expect(result.resonance.score).toBeCloseTo(probIndex5);
     expect(result.resonance.deviation).toBeCloseTo(probIndex5 - uniformProb);
   });

  it('should map selected index correctly to symbol overlays', () => {
    const indexToTest = 10;
    // Create Psi that guarantees index 10 is selected (e.g., only index 10 has magnitude)
    const mockPsi_forceIndex10: number[] = Array(32).fill(0);
    mockPsi_forceIndex10[indexToTest] = 1;
    const result = collapseHQE(mockPsi_forceIndex10, mockEntropy_low); // Low entropy ensures index 10

    expect(result.symbol.index).toBe(indexToTest);

    // Check overlay indices based on modulo arithmetic from encoder.ts
    // SYMBOLIC_MAP length 65 (index 10 % 65 = 10)
    // TAROT_MAJOR_ARCANA length 22 (index 10 % 22 = 10)
    // RUNES length 24 (index 10 % 24 = 10)
    // HEBREW length 22 (index 10 % 22 = 10)
    expect(result.symbol.overlay[0].index).toBe(indexToTest % 22); // Tarot
    expect(result.symbol.overlay[1].index).toBe(indexToTest % 24); // Rune
    expect(result.symbol.overlay[2].index).toBe(indexToTest % 22); // Hebrew

    // You could also check the names/codes if you import the const arrays, but index check is simpler
  });

  it('should handle zero magnitude wavefunction (fallback to uniform probability)', () => {
      const mockPsi_zero: number[] = Array(32).fill(0);
      const result = collapseHQE(mockPsi_zero, mockEntropy_mid); // Use mid entropy

      // Expect behavior similar to uniform probability
      const expectedProb = 1 / mockPsi_zero.length;
      expect(result.resonance.score).toBeCloseTo(expectedProb);
      expect(result.resonance.deviation).toBeCloseTo(0);
      // Index should be near middle due to mid entropy bits
      expect(result.symbol.index).toBeGreaterThanOrEqual(15);
      expect(result.symbol.index).toBeLessThanOrEqual(16);
  });

});