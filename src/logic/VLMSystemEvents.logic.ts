class EventManager {
  private events: Record<string, Array<Function>> = {};

  // Add a listener for a specific event
  on(eventName: string, listener: Function): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  // Remove a listener for a specific event
  off(eventName: string, listener: Function): void {
    if (!this.events[eventName]) return;

    const index = this.events[eventName].indexOf(listener);
    if (index !== -1) {
      this.events[eventName].splice(index, 1);
    }
  }

  // Emit/fire an event
  emit(eventName: string, ...args: any[]): void {
    if (!this.events[eventName]) return;

    for (const listener of this.events[eventName]) {
      listener(...args);
    }
  }
}

export abstract class VLMEventManager {
  static events: EventManager = new EventManager();
}