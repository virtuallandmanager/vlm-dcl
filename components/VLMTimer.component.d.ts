import { IEngine } from '@dcl/sdk/ecs';
export declare namespace priority {
    const TimerSystemPriority: number;
    const TweenSystemPriority: number;
    const PerpetualMotionSystemPriority: number;
    const PathSystemPriority: number;
    const TriggerSystemPriority: number;
    const ActionSystemPriority: number;
}
export type Callback = () => void;
export type TimerId = number;
export declare namespace VLMTimer {
    class System {
        static createTimers(targetEngine: IEngine): {
            setTimeout(callback: Callback, milliseconds: number): TimerId;
            clearTimeout(timer: TimerId): void;
            setInterval(callback: Callback, milliseconds: number): TimerId;
            clearInterval(timer: TimerId): void;
        };
    }
}
export declare const timers: {
    setTimeout(callback: Callback, milliseconds: number): TimerId;
    clearTimeout(timer: TimerId): void;
    setInterval(callback: Callback, milliseconds: number): TimerId;
    clearInterval(timer: TimerId): void;
};
