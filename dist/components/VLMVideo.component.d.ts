import { Entity } from '@dcl/sdk/ecs';
import { VLMBase } from './VLMBase.component';
import { PBMaterial_PbrMaterial, PBVideoPlayer } from '@dcl/sdk/ecs';
import { Vector3 } from '@dcl/sdk/math';
import { VideoService } from '../services/Video.service';
import { MaterialService } from '../services/Material.service';
import { MeshService } from '../services/Mesh.service';
import { TransformService } from '../services/Transform.service';
import { ClickEventService } from '../services/ClickEvent.service';
import { DynamicMediaType, VLMAudible, VLMBaseProperties, VLMClickable, VLMDynamicMedia, VLMInstanceProperties, VLMInstancedItem, VLMTextureOptions } from '../shared/interfaces';
import { ColliderService } from '../services/Collider.service';
export declare namespace VLMVideo {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    type VLMConfig = VLMBaseProperties & VLMClickable & VLMAudible & VLMDynamicMedia & VLMTextureOptions & VLMInstancedItem;
    const reset: () => void;
    class Config extends VLMBase.Config {
        textureOptions: PBMaterial_PbrMaterial;
        videoOptions: PBVideoPlayer;
        services: {
            collider: ColliderService;
            material: MaterialService;
            mesh: MeshService;
            transform: TransformService;
            clickEvent: ClickEventService;
            video: VideoService;
        };
        enableLiveStream?: boolean;
        isLive: boolean;
        liveSrc?: string;
        playlist: string[];
        emission?: number;
        activePlaylistVideo: number;
        offImageSrc?: string;
        mediaType?: DynamicMediaType;
        offType?: DynamicMediaType;
        volume?: number;
        constructor(config: VLMConfig);
        setStorage: CallableFunction;
        init: CallableFunction;
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
        setLiveState: CallableFunction;
        setLiveSrc: CallableFunction;
        setPlaylist: CallableFunction;
        startLiveStream: CallableFunction;
        startPlaylistVideo: CallableFunction;
        showOffImage: CallableFunction;
    }
    class Instance extends VLMBase.Instance {
        constructor(config: Config, instanceConfig: VLMInstanceProperties);
        setStorage: CallableFunction;
        init: CallableFunction;
        add: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        startPlaylistVideo: CallableFunction;
        updateTransform: CallableFunction;
        updateParent: CallableFunction;
        updateClickEvent: CallableFunction;
        updateVideoOptions: CallableFunction;
        updateTextureOptions: CallableFunction;
        updateCollider: CallableFunction;
    }
    enum SystemState {
        CREATED = 0,
        INITIALIZING = 1,
        INITIALIZED = 2,
        UPDATING = 3,
        REMOVING = 4
    }
}
export type QuickVideoConfig = {
    liveUrl: string;
    playlist?: string[];
    position: Vector3;
    scale?: Vector3;
    rotation?: Vector3;
    volume?: number;
    colliders?: boolean;
    parent?: Entity;
} & VLMClickable;
export declare class QuickVideoScreen {
    entity: Entity;
    mediaType: DynamicMediaType;
    services: {
        material: MaterialService;
        mesh: MeshService;
        collider: ColliderService;
        transform: TransformService;
        clickEvent: ClickEventService;
        video: VideoService;
    };
    constructor(config: QuickVideoConfig);
}
//# sourceMappingURL=VLMVideo.component.d.ts.map