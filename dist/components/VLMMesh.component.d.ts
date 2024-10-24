import { VLMBase } from './VLMBase.component';
import { Vector3 } from '@dcl/sdk/math';
import { Entity } from '@dcl/sdk/ecs';
import { MeshService } from '../services/Mesh.service';
import { TransformService } from '../services/Transform.service';
import { ClickEventService } from '../services/ClickEvent.service';
import { ColliderService } from '../services/Collider.service';
import { VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMMeshOptions } from '../shared/interfaces';
export declare namespace VLMMesh {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    type VLMConfig = VLMBaseProperties & VLMMeshOptions & VLMClickable & VLMInstancedItem;
    const reset: () => void;
    class Config extends VLMBase.Config {
        services: {
            mesh: MeshService;
            collider: ColliderService;
            transform: TransformService;
            clickEvent: ClickEventService;
        };
        modelSrc: string;
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
export type QuickMeshConfig = {
    path: string;
    position: Vector3;
    scale?: Vector3;
    rotation?: Vector3;
    colliders?: boolean;
    parent?: Entity;
} & VLMClickable;
export declare class QuickMesh {
    entity: Entity;
    services: {
        mesh: MeshService;
        collider: ColliderService;
        transform: TransformService;
        clickEvent: ClickEventService;
    };
    constructor(config: QuickMeshConfig);
}
//# sourceMappingURL=VLMMesh.component.d.ts.map