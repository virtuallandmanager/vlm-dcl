import { VLMBase } from './VLMBase.component';
import { Vector3 } from '@dcl/sdk/math';
import { AudioService } from '../services/Audio.service';
import { TransformService } from '../services/Transform.service';
import { MeshService } from '../services/Mesh.service';
import { MaterialService } from '../services/Material.service';
import { VLMAudible, VLMBaseProperties, VLMInstanceProperties, VLMInstancedItem } from '../shared/interfaces';
export declare namespace VLMSound {
    const configs: {
        [uuid: string]: Config;
    };
    const instances: {
        [uuid: string]: Instance;
    };
    type VLMConfig = VLMBaseProperties & VLMAudible & VLMInstancedItem;
    const reset: () => void;
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
        setStorage: CallableFunction;
        init: CallableFunction;
        addAll: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        createOrReplaceInstance: CallableFunction;
        removeInstance: CallableFunction;
        deleteInstance: CallableFunction;
        toggleLocators: CallableFunction;
    }
    class Instance extends VLMBase.Instance {
        hasLocator: boolean;
        constructor(config: Config, instanceConfig: VLMInstanceProperties);
        setStorage: CallableFunction;
        init: CallableFunction;
        add: CallableFunction;
        remove: CallableFunction;
        delete: CallableFunction;
        updateTransform: CallableFunction;
        updateParent: CallableFunction;
        toggleLocator: CallableFunction;
    }
}
export type QuickSoundConfig = {
    audioSrc?: string;
    path?: string;
    position?: Vector3;
    volume?: number;
    loop?: boolean;
};
export declare class QuickSound {
    config: VLMSound.Config;
    instance: VLMSound.Instance;
    constructor(config: QuickSoundConfig);
}
//# sourceMappingURL=VLMSound.component.d.ts.map