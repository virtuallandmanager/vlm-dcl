import { VLMBase } from "./VLMBase.component";
import { PBMaterial_PbrMaterial } from "@dcl/sdk/ecs";
import { MaterialService } from "../services/Material.service";
import { MeshService } from "../services/Mesh.service";
import { TransformService } from "../services/Transform.service";
import { ClickEventService } from "../services/ClickEvent.service";
import { ColliderService } from "../services/Collider.service";
export declare namespace VLMImage {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    class Config extends VLMBase.Config {
        textureOptions: PBMaterial_PbrMaterial;
        services: {
            material: MaterialService;
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
