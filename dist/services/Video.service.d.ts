import { Entity, TextureUnion } from '@dcl/sdk/ecs';
export declare class VideoService {
    entities: Entity[];
    static videoPlayerEntity: Entity;
    videoPlayerEntity: Entity;
    static videoPlayerEntities: Entity[];
    videoTexture?: TextureUnion;
    addEntity: CallableFunction;
    setImageTexture: CallableFunction;
    setTexture: CallableFunction;
    setPlayer: CallableFunction;
    setAllImageTextures: CallableFunction;
    setAllTextures: CallableFunction;
    clear: CallableFunction;
    removeVideoScreen: CallableFunction;
    removeVideoScreens: CallableFunction;
    play: CallableFunction;
    stop: CallableFunction;
    pause: CallableFunction;
    toggle: CallableFunction;
    setVolume: CallableFunction;
    setLoop: CallableFunction;
    setVideoOptions: CallableFunction;
    setAllVideoOptions: CallableFunction;
    setAllVolume: CallableFunction;
    setAllLoop: CallableFunction;
    playAll: CallableFunction;
    initEventSystem: CallableFunction;
    clearEventSystem: CallableFunction;
    getVideoState: CallableFunction;
}
//# sourceMappingURL=Video.service.d.ts.map