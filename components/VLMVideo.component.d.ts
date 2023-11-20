import { VLMBase } from "./VLMBase.component";
import { PBMaterial_PbrMaterial, SystemFn } from "@dcl/sdk/ecs";
import { VideoService } from "../services/Video.service";
import { MaterialService } from "../services/Material.service";
import { MeshService } from "../services/Mesh.service";
import { TransformService } from "../services/Transform.service";
import { ClickEventService } from "../services/ClickEvent.service";
export declare namespace VLMVideo {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    const systems: {
        [uuid: string]: PlaylistSystem;
    };
    enum SourceType {
        NONE = 0,
        IMAGE = 1,
        PLAYLIST = 2,
        LIVE = 3
    }
    enum StreamState {
        NOT_FOUND = 0,
        INACTIVE = 1,
        STATIC = 2,
        LIVE = 3
    }
    class Config extends VLMBase.Config {
        textureOptions: PBMaterial_PbrMaterial;
        services: {
            material: MaterialService;
            model: MeshService;
            transform: TransformService;
            clickEvent: ClickEventService;
            video: VideoService;
        };
        enableLiveStream?: boolean;
        instances?: string[] | Instance[];
        isLive: boolean;
        liveSrc?: string;
        offType?: SourceType;
        offImageSrc?: string;
        volume?: number;
        constructor(config: VLMConfig);
        init: CallableFunction;
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
        setLiveState: CallableFunction;
    }
    type VLMConfig = Config & VLMBase.VLMTextureConfig & {
        instances: Instance[];
    };
    class Instance extends VLMBase.Instance {
        constructor(config: Config, instanceConfig: Instance);
        init: CallableFunction;
        add: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        updateTransform: CallableFunction;
        updateParent: CallableFunction;
        updateClickEvent: CallableFunction;
    }
    class PlaylistSystem {
        sk: string;
        config: Config;
        constructor(config: Config);
        init: CallableFunction;
        update: SystemFn;
        remove: CallableFunction;
        delete: CallableFunction;
    }
}
