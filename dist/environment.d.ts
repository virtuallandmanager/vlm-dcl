import { VLMWidget } from './components/VLMWidget.component';
import { UIMode } from './services/UI.service';
export declare let ecs: any;
export declare let ui: any;
export declare abstract class VLMEnvironment {
    static devMode: boolean;
    static debug: boolean;
    private static wssUrls;
    private static apiUrls;
    static apiUrl: string;
    static wssUrl: string;
    static init: CallableFunction;
    static configureEcs: CallableFunction;
}
export type VLMInitConfig = {
    env: 'dev' | 'staging' | 'prod';
    widgets?: VLMWidget.Config[];
    modelFolder?: string;
    soundFolder?: string;
    debug?: boolean | string[];
    uiMode?: UIMode;
    ecs?: any;
};
//# sourceMappingURL=environment.d.ts.map