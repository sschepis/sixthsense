// Import the functions and bus to be tested
import { tickResonator, ResonatorBus } from '../index';

// Mock the library modules that index.ts depends on
// We need to mock before importing the module under test if using jest.mock
jest.mock('../lib/entropy', () => ({
  generateEntropySnapshot: jest.fn(),
}));
jest.mock('../lib/edm', () => ({
  computeEDM: jest.fn(),
}));
jest.mock('../lib/wavefunction', () => ({
  evolveWavefunction: jest.fn(),
}));
jest.mock('../lib/encoder', () => ({
  collapseHQE: jest.fn(),
}));

// Mock the event bus methods (or the whole class if preferred)
const mockEmit = jest.fn();
jest.mock('../lib/bus', () => {
  return {
    SymbolicEventBus: jest.fn().mockImplementation(() => {
      return {
        emit: mockEmit, // Use the mockEmit function defined above
        on: jest.fn(),   // Mock 'on' as well if needed for other tests
        off: jest.fn(),
        clear: jest.fn(),
      };
    }),
  };
});


// Import the mocked functions for use in tests
import { generateEntropySnapshot } from '../lib/entropy';
import { computeEDM } from '../lib/edm';
import { evolveWavefunction } from '../lib/wavefunction';
import { collapseHQE } from '../lib/encoder';

// Type assertion for mocked functions
const mockedGenerateEntropy = generateEntropySnapshot as jest.Mock;
const mockedComputeEDM = computeEDM as jest.Mock;
const mockedEvolveWavefunction = evolveWavefunction as jest.Mock;
const mockedCollapseHQE = collapseHQE as jest.Mock;


describe('tickResonator', () => {
  // Define mock return values for the library functions
  const mockEntropyData = { timestamp: 12345, entropyBits: 'abc', delta: 50, contextHash: 'test-context' };
  const mockEdmData = { level: 0.5, deviation: 0.1, coherent: true };
  const mockWavefunctionData = [0.1, 0.2, 0.3]; // Example state
  const mockCollapseData = {
      symbol: { type: 'hexagram', code: '䷀', index: 0, overlay: [] },
      resonance: { score: 0.1, deviation: -0.05 }
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockedGenerateEntropy.mockClear();
    mockedComputeEDM.mockClear();
    mockedEvolveWavefunction.mockClear();
    mockedCollapseHQE.mockClear();
    mockEmit.mockClear(); // Clear the bus emit mock

    // Setup mock return values
    mockedGenerateEntropy.mockReturnValue(mockEntropyData);
    mockedComputeEDM.mockReturnValue(mockEdmData);
    mockedEvolveWavefunction.mockReturnValue(mockWavefunctionData);
    mockedCollapseHQE.mockReturnValue(mockCollapseData);

    // Mock Date.now() for consistent timestamps in events
    jest.spyOn(Date, 'now').mockReturnValue(99999); // Fixed timestamp
  });

  afterEach(() => {
      // Restore mocks
      jest.restoreAllMocks();
  });


  it('should call generateEntropySnapshot with context', () => {
    const mockContext = new Event('click');
    tickResonator(mockContext);
    expect(mockedGenerateEntropy).toHaveBeenCalledTimes(1);
    expect(mockedGenerateEntropy).toHaveBeenCalledWith(mockContext);
  });

  it('should call generateEntropySnapshot with null context if none provided', () => {
    tickResonator(); // Call without context
    expect(mockedGenerateEntropy).toHaveBeenCalledTimes(1);
    expect(mockedGenerateEntropy).toHaveBeenCalledWith(null);
  });

  it('should call computeEDM with the result of generateEntropySnapshot', () => {
    tickResonator();
    expect(mockedComputeEDM).toHaveBeenCalledTimes(1);
    expect(mockedComputeEDM).toHaveBeenCalledWith(mockEntropyData);
  });

  it('should call evolveWavefunction with the result of generateEntropySnapshot', () => {
    tickResonator();
    expect(mockedEvolveWavefunction).toHaveBeenCalledTimes(1);
    expect(mockedEvolveWavefunction).toHaveBeenCalledWith(mockEntropyData);
  });

  it('should call collapseHQE with results of evolveWavefunction and generateEntropySnapshot', () => {
    tickResonator();
    expect(mockedCollapseHQE).toHaveBeenCalledTimes(1);
    expect(mockedCollapseHQE).toHaveBeenCalledWith(mockWavefunctionData, mockEntropyData);
  });

  it('should return the result of collapseHQE', () => {
    const result = tickResonator();
    expect(result).toEqual(mockCollapseData);
  });

  // --- Event Emission Tests ---

  it('should emit "resonator:entropy" event with correct data', () => {
    tickResonator();
    expect(mockEmit).toHaveBeenCalledWith('resonator:entropy', {
        // timestamp: Date.now(), // Timestamp comes from mockEntropyData now
        ...mockEntropyData
    });
  });

  it('should emit "resonator:attention" event with correct data', () => {
    tickResonator();
    expect(mockEmit).toHaveBeenCalledWith('resonator:attention', {
        timestamp: 99999, // Mocked Date.now()
        level: mockEdmData.level,
        deviation: mockEdmData.deviation,
        coherent: mockEdmData.coherent
    });
  });

  it('should emit "resonator:collapse" event with correct data', () => {
    tickResonator();
    expect(mockEmit).toHaveBeenCalledWith('resonator:collapse', {
        timestamp: 99999, // Mocked Date.now()
        ...mockCollapseData
    });
  });

  it('should call emit 3 times in total', () => {
      tickResonator();
      expect(mockEmit).toHaveBeenCalledTimes(3);
  });

});

// Optional: Test the exported ResonatorBus instance if needed,
// although its functionality is tested more thoroughly in bus.test.ts
describe('ResonatorBus Export', () => {
    it('should export an instance of the mocked SymbolicEventBus', () => {
        // Because of how mocking works, ResonatorBus will be an instance
        // of the mocked constructor
        expect(ResonatorBus).toBeDefined();
        // Check if it has the mocked methods
        expect(ResonatorBus.emit).toBeDefined();
        expect(ResonatorBus.on).toBeDefined();
    });
});