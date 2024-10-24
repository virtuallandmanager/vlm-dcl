import { Entity } from '@dcl/sdk/ecs';
import { VLMBase } from './VLMBase.component';
import { PBMaterial_PbrMaterial } from '@dcl/sdk/ecs';
import { Vector3 } from '@dcl/sdk/math';
import { MaterialService } from '../services/Material.service';
import { MeshService } from '../services/Mesh.service';
import { TransformService } from '../services/Transform.service';
import { ClickEventService } from '../services/ClickEvent.service';
import { ColliderService } from '../services/Collider.service';
import { TextureType, VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMTextureOptions } from '../shared/interfaces';
export declare namespace VLMImage {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    type VLMConfig = VLMBaseProperties & VLMClickable & VLMTextureOptions & VLMInstancedItem;
    const reset: () => void;
    class Config extends VLMBase.Config {
        textureType: TextureType;
        textureOptions: PBMaterial_PbrMaterial;
        services: {
            material: MaterialService;
            mesh: MeshService;
            collider: ColliderService;
            transform: TransformService;
            clickEvent: ClickEventService;
        };
        constructor(config: VLMConfig);
        setStorage: CallableFunction;
        init: CallableFunction;
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
        updateDefaultClickEvent: CallableFunction;
    }
    class Instance extends VLMBase.Instance {
        constructor(config: Config, instanceConfig: VLMInstanceProperties);
        setStorage: CallableFunction;
        init: CallableFunction;
        add: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        updateTransform: CallableFunction;
        updateParent: CallableFunction;
        updateDefaultClickEvent: CallableFunction;
        updateClickEvent: CallableFunction;
    }
}
export type QuickImageConfig = {
    path: string;
    position: Vector3;
    scale?: Vector3;
    rotation?: Vector3;
    colliders?: boolean;
    parent?: Entity;
} & VLMClickable;
export declare class QuickImage {
    entity: Entity;
    services: {
        material: MaterialService;
        mesh: MeshService;
        collider: ColliderService;
        transform: TransformService;
        clickEvent: ClickEventService;
    };
    constructor(config: QuickImageConfig);
}
//# sourceMappingURL=VLMImage.component.d.ts.map