// Define a generic event handler type
type EventHandler = (event: any) => void;

// Define the structure for a listener entry
interface ListenerEntry {
  filter: EventFilter;
  handler: EventHandler;
}

// Define the filter type: either a function or an object for property matching
type EventFilter = ((event: any) => boolean) | { [key: string]: any };

export class SymbolicEventBus {
  // Use a Map for potentially better performance with frequent additions/removals
  private listeners: Map<string, ListenerEntry[]> = new Map();

  /**
   * Registers an event listener for a specific event type.
   * @param eventType The name of the event to listen for.
   * @param options An object containing the handler and an optional filter.
   *                The filter can be a function or an object for property matching.
   */
  on(eventType: string, {
    filter = () => true, // Default filter allows all events
    handler
  }: { filter?: EventFilter, handler: EventHandler }) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push({ filter, handler });
  }

  /**
   * Emits an event, triggering all matching listeners.
   * @param eventType The name of the event being emitted.
   * @param event The event payload.
   */
  emit(eventType: string, event: any) {
    const matches = this.listeners.get(eventType) || [];
    for (const { filter, handler } of matches) {
      try {
        let shouldHandle = false;
        if (typeof filter === 'function') {
          shouldHandle = Boolean(filter(event)); // Explicitly cast result to boolean
        } else {
          // Check if all key-value pairs in the filter match the event object
          // Ensure event is an object before accessing properties
          shouldHandle = typeof event === 'object' && event !== null &&
                         Object.entries(filter).every(([key, value]) => (event as Record<string, unknown>)[key] === value);
        }

        if (shouldHandle) {
          handler(event);
        }
      } catch (error: unknown) { // Explicitly type error as unknown
        // Handle error safely
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error in event handler for ${eventType}:`, errorMessage, error);
        // Optionally, add more robust error handling or logging
      }
    }
  }

  /**
   * Removes a specific listener.
   * Note: Requires the exact handler function reference to remove.
   * @param eventType The event type to remove the listener from.
   * @param handlerToRemove The handler function to remove.
   */
  off(eventType: string, handlerToRemove: EventHandler) {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
          const filteredListeners = eventListeners.filter(({ handler }) => handler !== handlerToRemove);
          this.listeners.set(eventType, filteredListeners);
      }
  }

  /**
   * Removes all listeners for a specific event type, or all listeners entirely.
   * @param eventType Optional. The event type to clear listeners for. If omitted, clears all listeners.
   */
  clear(eventType?: string) {
      if (eventType) {
          this.listeners.delete(eventType);
      } else {
          this.listeners.clear();
      }
  }
}