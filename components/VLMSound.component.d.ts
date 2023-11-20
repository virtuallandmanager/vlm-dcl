import { VLMBase } from "./VLMBase.component";
import { AudioService } from "../services/Audio.service";
import { TransformService } from "../services/Transform.service";
import { MeshService } from "../services/Mesh.service";
import { MaterialService } from "../services/Material.service";
export declare namespace VLMSound {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    class Config extends VLMBase.Config {
        audioOptions: {
            volume: number;
        };
        services: {
            audio: AudioService;
            mesh: MeshService;
            material: MaterialService;
            transform: TransformService;
        };
        constructor(config: VLMConfig);
        init: CallableFunction;
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
        toggleLocators: CallableFunction;
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
        toggleLocator: CallableFunction;
    }
}
