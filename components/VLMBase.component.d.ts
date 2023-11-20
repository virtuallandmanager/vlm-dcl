/// <reference types="@dcl/js-runtime" />
import { Entity } from "@dcl/sdk/ecs";
import { Vector3 } from "~system/EngineApi";
import { VLMClickEvent } from "./VLMClickEvent.component";
import { MaterialService } from "../services/Material.service";
import { MeshService } from "../services/Mesh.service";
import { VideoService } from "../services/Video.service";
import { TransformService } from "../services/Transform.service";
import { AudioService } from "../services/Audio.service";
export declare namespace VLMBase {
    class Config {
        sk: string;
        enabled: boolean;
        parent: string;
        customId?: string;
        customRendering?: boolean;
        name: string;
        clickEvent?: VLMClickEvent.Config;
        instanceIds: string[];
        services: {
            material?: MaterialService;
            model?: MeshService;
            video?: VideoService;
            transform?: TransformService;
            audio?: AudioService;
        };
        constructor(config: Config & {
            instances: Instance[];
        });
    }
    type VLMConfig = Config & {
        instances: Instance[];
    };
    const ConfigSpec: {
        id: import("@dcl/sdk/ecs").ISchema<number>;
        sk: import("@dcl/sdk/ecs").ISchema<string>;
        enabled: import("@dcl/sdk/ecs").ISchema<boolean>;
        parent: import("@dcl/sdk/ecs").ISchema<string>;
        customId: import("@dcl/sdk/ecs").ISchema<string>;
        customRendering: import("@dcl/sdk/ecs").ISchema<boolean>;
        name: import("@dcl/sdk/ecs").ISchema<string>;
    };
    class Instance {
        entity: Entity;
        sk: string;
        configId: string;
        enabled: boolean;
        parent: string;
        customId?: string;
        customRendering?: boolean;
        name: string;
        defaultClickEvent?: VLMClickEvent.Config;
        clickEvent?: VLMClickEvent.Config;
        position: Vector3;
        scale: Vector3;
        rotation: Vector3;
        constructor(config: Config, instance: Instance);
    }
    const InstanceSpec: {
        entity: import("@dcl/sdk/ecs").ISchema<Entity>;
        sk: import("@dcl/sdk/ecs").ISchema<string>;
        enabled: import("@dcl/sdk/ecs").ISchema<boolean>;
        parent: import("@dcl/sdk/ecs").ISchema<string>;
        customId: import("@dcl/sdk/ecs").ISchema<string>;
        customRendering: import("@dcl/sdk/ecs").ISchema<boolean>;
        name: import("@dcl/sdk/ecs").ISchema<string>;
        position: import("@dcl/sdk/ecs").ISchema<import("@dcl/sdk/ecs").Vector3Type>;
        rotation: import("@dcl/sdk/ecs").ISchema<import("@dcl/sdk/ecs").Vector3Type>;
        scale: import("@dcl/sdk/ecs").ISchema<import("@dcl/sdk/ecs").Vector3Type>;
    };
    type VLMTextureConfig = {
        textureSrc?: string;
        bumpSrc?: string;
        emissiveSrc?: string;
        alphaSrc?: string;
        emission?: number;
    };
    type VLMAudibleConfig = {
        enabled: boolean;
        sourceType: AudioSourceType;
        volume: number;
        audioSrc: string;
    };
    enum AudioSourceType {
        CLIP = 0,
        LOOP = 1,
        PLAYLIST = 2,
        STREAM = 3
    }
}
