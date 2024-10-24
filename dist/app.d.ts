import { UserData } from '~system/UserIdentity';
import { VLMInitConfig } from './environment';
import { VLMWidget } from './components/VLMWidget.component';
import { VLMVideo } from './components/VLMVideo.component';
import { VLMImage } from './components/VLMImage.component';
import { VLMSound } from './components/VLMSound.component';
import { VLMMesh } from './components/VLMMesh.component';
import { VLMClaimPoint } from './components';
export declare abstract class VLM {
    static version: string;
    static activeServer: string;
    static user: UserData;
    static defaultConfig: VLMInitConfig;
    static init: CallableFunction;
    static configureWidgets: CallableFunction;
    static configureEcs: CallableFunction;
    static sendMessage: CallableFunction;
    static onMessage: CallableFunction;
    static setState: CallableFunction;
    static getState: CallableFunction;
    static recordAction: CallableFunction;
    static setClaimFunctions: CallableFunction;
    static Storage: VLMStorage;
    static storage: VLMStorage;
    static toggleAutoDance: CallableFunction;
    static UI: () => import("@dcl/react-ecs").default.JSX.ReactNode;
}
export type VLMStorage = {
    videos: {
        configs: {
            [customId: string]: VLMVideo.Config;
        };
        instances: {
            [customId: string]: VLMVideo.Instance;
        };
    };
    images: {
        configs: {
            [customId: string]: VLMImage.Config;
        };
        instances: {
            [customId: string]: VLMImage.Instance;
        };
    };
    models: {
        configs: {
            [customId: string]: VLMMesh.Config;
        };
        instances: {
            [customId: string]: VLMMesh.Instance;
        };
    };
    sounds: {
        configs: {
            [customId: string]: VLMSound.Config;
        };
        instances: {
            [customId: string]: VLMSound.Instance;
        };
    };
    claimPoints: {
        configs: {
            [customId: string]: VLMClaimPoint.Config;
        };
        instances: {
            [customId: string]: VLMClaimPoint.Instance;
        };
    };
    widgets: {
        configs: {
            [customId: string]: VLMWidget.Config;
        };
    };
};
//# sourceMappingURL=app.d.ts.map