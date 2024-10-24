import { Entity } from '@dcl/sdk/ecs';
import { Vector3 } from '@dcl/sdk/math';
import { VLMClickEvent } from './VLMClickEvent.component';
import { MaterialService } from '../services/Material.service';
import { MeshService } from '../services/Mesh.service';
import { VideoService } from '../services/Video.service';
import { TransformService } from '../services/Transform.service';
import { AudioService } from '../services/Audio.service';
import { BaseProperties, VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMMeshOptions } from '../shared/interfaces';
export declare namespace VLMBase {
    class Config implements BaseProperties {
        pk: string;
        sk: string;
        enabled: boolean;
        parent?: Entity;
        customId?: string;
        customRendering?: boolean;
        name?: string;
        withCollisions?: boolean;
        clickEvent?: VLMClickEvent.Config;
        instanceIds: string[];
        services: {
            material?: MaterialService;
            model?: MeshService;
            video?: VideoService;
            transform?: TransformService;
            audio?: AudioService;
        };
        constructor(config: VLMBaseProperties & VLMClickable & VLMMeshOptions & VLMInstancedItem);
    }
    class Instance {
        entity: Entity;
        sk: string;
        configId: string;
        enabled: boolean;
        parent?: Entity;
        customId?: string;
        customRendering?: boolean;
        name?: string;
        defaultClickEvent?: VLMClickEvent.Config;
        clickEvent?: VLMClickEvent.Config;
        withCollisions?: boolean;
        position: Vector3;
        scale: Vector3;
        rotation: Vector3;
        constructor(config: Config, instance: VLMInstanceProperties);
    }
}
export type QuickNullConfig = {
    position: Vector3;
    scale?: Vector3;
    rotation?: Vector3;
    colliders?: boolean;
    parent?: Entity;
} & VLMClickable;
export declare class QuickNull {
    entity: Entity;
    services: {
        transform: TransformService;
    };
    constructor(config: QuickNullConfig);
}
//# sourceMappingURL=VLMBase.component.d.ts.map