import { VLMBase } from "./VLMBase.component";
import { MeshService } from "../services/Mesh.service";
import { TransformService } from "../services/Transform.service";
import { ClickEventService } from "../services/ClickEvent.service";
import { ColliderService } from "../services/Collider.service";
export declare namespace VLMMesh {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    class Config extends VLMBase.Config {
        services: {
            mesh: MeshService;
            collider: ColliderService;
            transform: TransformService;
            clickEvent: ClickEventService;
        };
        constructor(config: VLMConfig);
        init: CallableFunction;
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
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
}
