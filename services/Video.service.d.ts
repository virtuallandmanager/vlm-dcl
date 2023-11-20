import { Entity } from "@dcl/sdk/ecs";
export declare class VideoService {
    entities: Entity[];
    addEntity: CallableFunction;
    set: CallableFunction;
    setAll: CallableFunction;
    clear: CallableFunction;
    removeVideoScreen: CallableFunction;
    removeVideoScreens: CallableFunction;
    play: CallableFunction;
    stop: CallableFunction;
    toggle: CallableFunction;
    setVolume: CallableFunction;
    setLoop: CallableFunction;
    setVideoOptions: CallableFunction;
    setAllVideoOptions: CallableFunction;
    setAllVolume: CallableFunction;
    setAllLoop: CallableFunction;
    playAll: CallableFunction;
    stopAll: CallableFunction;
    toggleAll: CallableFunction;
}
