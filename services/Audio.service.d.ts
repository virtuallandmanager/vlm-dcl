import { Entity } from "@dcl/sdk/ecs";
export declare class AudioService {
    entities: Entity[];
    addEntity: CallableFunction;
    set: CallableFunction;
    setAll: CallableFunction;
    clear: CallableFunction;
    clearAll: CallableFunction;
    play: CallableFunction;
    stop: CallableFunction;
    toggle: CallableFunction;
    setVolume: CallableFunction;
    setLoop: CallableFunction;
    setSourceOptions: CallableFunction;
    setAllSourceOptions: CallableFunction;
    setAllVolume: CallableFunction;
    setAllLoop: CallableFunction;
    playAll: CallableFunction;
    stopAll: CallableFunction;
    toggleAll: CallableFunction;
    buildOptions: CallableFunction;
}
