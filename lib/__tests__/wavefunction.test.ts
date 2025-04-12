import { evolveWavefunction } from '../wavefunction.js'; // Adjust path as necessary

describe('evolveWavefunction', () => {
  // Mock entropy input
  const mockEntropy = {
    delta: 10, // Example delta
    timestamp: 1678886400000 // Example timestamp (e.g., March 15, 2023 12:00:00 PM UTC)
  };

  const expectedPrimeCount = 32; // Based on the PRIMES array in the module

  it('should return an array of the correct length', () => {
    const result = evolveWavefunction(mockEntropy);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(expectedPrimeCount);
  });

  it('should return an array of numbers', () => {
    const result = evolveWavefunction(mockEntropy);
    result.forEach((value: number) => {
      expect(typeof value).toBe('number');
      expect(isNaN(value)).toBe(false); // Ensure no NaN values
    });
  });

  it('should produce different results for different timestamps', () => {
    const entropy1 = { delta: 10, timestamp: 1678886400000 };
    const entropy2 = { delta: 10, timestamp: 1678886401000 }; // 1 second later
    const result1 = evolveWavefunction(entropy1);
    const result2 = evolveWavefunction(entropy2);
    expect(result1).not.toEqual(result2); // Results should differ due to time change
  });

  it('should produce different results for different deltas', () => {
    const entropy1 = { delta: 10, timestamp: 1678886400000 };
    const entropy2 = { delta: 20, timestamp: 1678886400000 }; // Different delta
    const result1 = evolveWavefunction(entropy1);
    const result2 = evolveWavefunction(entropy2);
    expect(result1).not.toEqual(result2); // Results should differ due to delta change
  });

  it('should handle delta being 0 (using fallback of 1)', () => {
    const entropyZeroDelta = { delta: 0, timestamp: 1678886400000 };
    const entropyOneDelta = { delta: 1, timestamp: 1678886400000 }; // Explicit delta 1

    const resultZero = evolveWavefunction(entropyZeroDelta);
    const resultOne = evolveWavefunction(entropyOneDelta);

    // Expect results to be very close or identical if fallback logic matches delta=1
    // Due to floating point precision, use toBeCloseTo for comparison
    expect(resultZero.length).toBe(resultOne.length);
    for (let i = 0; i < resultZero.length; i++) {
        expect(resultZero[i]).toBeCloseTo(resultOne[i]);
    }

    // Ensure it doesn't produce NaNs or errors
    resultZero.forEach((value: number) => expect(isNaN(value)).toBe(false));
  });

  // Optional: Test specific value ranges if expected behavior is known
  // This is harder without knowing the exact expected mathematical output
  it('should produce values within a reasonable range (e.g., roughly -1 to 1)', () => {
    const result = evolveWavefunction(mockEntropy);
    result.forEach((value: number) => {
      expect(value).toBeGreaterThanOrEqual(-1.1); // Allow some margin
      expect(value).toBeLessThanOrEqual(1.1);    // Allow some margin
    });
  });

});