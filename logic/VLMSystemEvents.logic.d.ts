declare class EventManager {
    private events;
    on(eventName: string, listener: Function): void;
    off(eventName: string, listener: Function): void;
    emit(eventName: string, ...args: any[]): void;
}
export declare abstract class VLMEventManager {
    static events: EventManager;
}
export {};
