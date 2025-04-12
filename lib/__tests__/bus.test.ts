import { SymbolicEventBus } from '../bus.js'; // Adjust path as necessary

describe('SymbolicEventBus', () => {
  let bus: SymbolicEventBus;
  let listener1: jest.Mock;
  let listener2: jest.Mock;
  let filterListener: jest.Mock;

  beforeEach(() => {
    // Create a new bus and mock listeners for each test
    bus = new SymbolicEventBus();
    listener1 = jest.fn();
    listener2 = jest.fn();
    filterListener = jest.fn();
  });

  it('should register and trigger a simple listener', () => {
    bus.on('testEvent', { handler: listener1 });
    const eventData = { message: 'hello' };
    bus.emit('testEvent', eventData);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith(eventData);
  });

  it('should trigger multiple listeners for the same event', () => {
    bus.on('testEvent', { handler: listener1 });
    bus.on('testEvent', { handler: listener2 });
    const eventData = { value: 42 };
    bus.emit('testEvent', eventData);

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith(eventData);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledWith(eventData);
  });

  it('should not trigger listeners for different events', () => {
    bus.on('eventA', { handler: listener1 });
    bus.on('eventB', { handler: listener2 });
    bus.emit('eventA', { data: 'A' });

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener1).toHaveBeenCalledWith({ data: 'A' });
    expect(listener2).not.toHaveBeenCalled();
  });

  it('should handle events with no listeners gracefully', () => {
    // No listeners registered
    expect(() => bus.emit('unheardEvent', { info: 'test' })).not.toThrow();
  });

  // --- Filtering Tests ---

  it('should trigger listener when function filter returns true', () => {
    const filterFn = (event: any) => event.value > 10;
    bus.on('filteredEvent', { filter: filterFn, handler: filterListener });

    bus.emit('filteredEvent', { value: 5 }); // Should not trigger
    expect(filterListener).not.toHaveBeenCalled();

    bus.emit('filteredEvent', { value: 15 }); // Should trigger
    expect(filterListener).toHaveBeenCalledTimes(1);
    expect(filterListener).toHaveBeenCalledWith({ value: 15 });
  });

  it('should not trigger listener when function filter returns false', () => {
    const filterFn = (event: any) => event.value === 'match';
    bus.on('filteredEvent', { filter: filterFn, handler: filterListener });

    bus.emit('filteredEvent', { value: 'no-match' });
    expect(filterListener).not.toHaveBeenCalled();
  });

  it('should trigger listener when object filter matches', () => {
    const filterObj = { type: 'important', status: 'active' };
    bus.on('objectFiltered', { filter: filterObj, handler: filterListener });

    // Non-matching event
    bus.emit('objectFiltered', { type: 'important', status: 'inactive', data: 1 });
    expect(filterListener).not.toHaveBeenCalled();

    // Matching event
    const matchingEvent = { type: 'important', status: 'active', data: 2 };
    bus.emit('objectFiltered', matchingEvent);
    expect(filterListener).toHaveBeenCalledTimes(1);
    expect(filterListener).toHaveBeenCalledWith(matchingEvent);

    // Matching event with extra properties
    const extraPropsEvent = { type: 'important', status: 'active', data: 3, extra: true };
    bus.emit('objectFiltered', extraPropsEvent);
    expect(filterListener).toHaveBeenCalledTimes(2);
    expect(filterListener).toHaveBeenCalledWith(extraPropsEvent);
  });

  it('should not trigger listener when object filter does not match', () => {
    const filterObj = { id: 123 };
    bus.on('objectFiltered', { filter: filterObj, handler: filterListener });

    bus.emit('objectFiltered', { id: 456 });
    expect(filterListener).not.toHaveBeenCalled();

    bus.emit('objectFiltered', { otherId: 123 });
    expect(filterListener).not.toHaveBeenCalled();
  });

  it('should handle mixed listeners (filtered and unfiltered)', () => {
     bus.on('mixedEvent', { handler: listener1 }); // Unfiltered
     bus.on('mixedEvent', { filter: { priority: 'high' }, handler: filterListener }); // Filtered

     const lowPriorityEvent = { priority: 'low', data: 'a' };
     const highPriorityEvent = { priority: 'high', data: 'b' };

     bus.emit('mixedEvent', lowPriorityEvent);
     expect(listener1).toHaveBeenCalledTimes(1);
     expect(listener1).toHaveBeenCalledWith(lowPriorityEvent);
     expect(filterListener).not.toHaveBeenCalled();

     bus.emit('mixedEvent', highPriorityEvent);
     expect(listener1).toHaveBeenCalledTimes(2);
     expect(listener1).toHaveBeenCalledWith(highPriorityEvent);
     expect(filterListener).toHaveBeenCalledTimes(1);
     expect(filterListener).toHaveBeenCalledWith(highPriorityEvent);
  });

  // --- Removal Tests ---

  it('should remove a specific listener using off()', () => {
    bus.on('removableEvent', { handler: listener1 });
    bus.on('removableEvent', { handler: listener2 });

    bus.off('removableEvent', listener1); // Remove listener1

    bus.emit('removableEvent', { data: 'test' });

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledTimes(1);
  });

   it('off() should not affect listeners for different events', () => {
     bus.on('eventX', { handler: listener1 });
     bus.on('eventY', { handler: listener2 });

     bus.off('eventX', listener1); // Remove listener1 for eventX

     bus.emit('eventY', { data: 'Y' }); // Emit eventY

     expect(listener1).not.toHaveBeenCalled(); // Still removed for eventX
     expect(listener2).toHaveBeenCalledTimes(1); // Listener for eventY should still work
   });

   it('off() should handle removing non-existent listeners gracefully', () => {
     const nonExistentListener = jest.fn();
     expect(() => bus.off('someEvent', nonExistentListener)).not.toThrow();
     expect(() => bus.off('nonExistentEvent', listener1)).not.toThrow();
   });

  it('should remove all listeners for a specific event using clear()', () => {
    bus.on('clearableEvent', { handler: listener1 });
    bus.on('clearableEvent', { handler: listener2 });
    bus.on('otherEvent', { handler: filterListener });

    bus.clear('clearableEvent');

    bus.emit('clearableEvent', { data: 1 });
    bus.emit('otherEvent', { data: 2 });

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
    expect(filterListener).toHaveBeenCalledTimes(1); // Listener for otherEvent remains
  });

  it('should remove all listeners entirely using clear() without arguments', () => {
    bus.on('event1', { handler: listener1 });
    bus.on('event2', { handler: listener2 });

    bus.clear(); // Clear all

    bus.emit('event1', {});
    bus.emit('event2', {});

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  // --- Error Handling ---
  it('should catch errors in listener handlers and continue emitting', () => {
     const errorListener = jest.fn(() => { throw new Error('Listener Error'); });
     const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console output

     bus.on('errorEvent', { handler: errorListener });
     bus.on('errorEvent', { handler: listener1 }); // Add another listener after the faulty one

     expect(() => bus.emit('errorEvent', { data: 'test' })).not.toThrow(); // Emit should not throw

     expect(errorListener).toHaveBeenCalledTimes(1);
     expect(listener1).toHaveBeenCalledTimes(1); // Subsequent listener should still be called
     expect(consoleErrorSpy).toHaveBeenCalled(); // Ensure error was logged

     consoleErrorSpy.mockRestore(); // Clean up spy
  });

   it('should catch errors in filter functions and continue emitting', () => {
     const errorFilter = jest.fn(() => { throw new Error('Filter Error'); });
     const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

     bus.on('errorFilterEvent', { filter: errorFilter, handler: listener1 });
     bus.on('errorFilterEvent', { handler: listener2 }); // Add another listener

     expect(() => bus.emit('errorFilterEvent', { data: 'test' })).not.toThrow();

     expect(errorFilter).toHaveBeenCalledTimes(1);
     expect(listener1).not.toHaveBeenCalled(); // Handler after faulty filter shouldn't run
     expect(listener2).toHaveBeenCalledTimes(1); // Unfiltered listener should still run
     expect(consoleErrorSpy).toHaveBeenCalled();

     consoleErrorSpy.mockRestore();
   });

});