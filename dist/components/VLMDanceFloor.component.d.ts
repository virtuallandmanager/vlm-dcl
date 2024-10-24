import { Entity } from '@dcl/sdk/ecs';
import { VLMBase } from './VLMBase.component';
import { Vector3 } from '@dcl/sdk/math';
import { MaterialService } from '../services/Material.service';
import { MeshService } from '../services/Mesh.service';
import { TransformService } from '../services/Transform.service';
import { VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem } from '../shared/interfaces';
import { AutoDanceService } from '../services/AutoDance.service';
export type EmoteList = TriggeredEmote[];
export type TriggeredEmote = {
    emote: string;
    isCustom?: string;
    loop: boolean;
};
export declare namespace VLMDanceFloor {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    type VLMConfig = VLMBaseProperties & VLMInstancedItem;
    const reset: () => void;
    class Config extends VLMBase.Config {
        debugMode?: boolean;
        emotes?: EmoteList;
        interval?: number;
        services: {
            material: MaterialService;
            mesh: MeshService;
            transform: TransformService;
            autodance: AutoDanceService;
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
    class Instance extends VLMBase.Instance {
        constructor(config: Config, instanceConfig: VLMInstanceProperties);
        init: CallableFunction;
        add: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        updateTransform: CallableFunction;
        updateParent: CallableFunction;
    }
}
export type QuickDanceFloorConfig = {
    emotes?: EmoteList;
    interval?: number;
    position: Vector3;
    scale?: Vector3;
    rotation?: Vector3;
    parent?: Entity;
    debug?: boolean;
    enabledOnLoad?: boolean;
} & VLMClickable;
export declare class QuickDanceFloor {
    entity: Entity;
    services: {
        material: MaterialService;
        mesh: MeshService;
        transform: TransformService;
        autodance: AutoDanceService;
    };
    constructor(config: QuickDanceFloorConfig);
}
//# sourceMappingURL=VLMDanceFloor.component.d.ts.map