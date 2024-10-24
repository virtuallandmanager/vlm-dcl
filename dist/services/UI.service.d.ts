import { UiComponent } from '@dcl/sdk/react-ecs';
export declare namespace ReactEcsRenderer {
    let rendererSet: boolean;
    const setUiRenderer: (components?: UiComponent) => void;
}
export declare class UIService {
    static internalComponents: UiComponent;
    static notificationComponent: CallableFunction;
    static modules: UiComponent[];
}
export declare enum UIMode {
    AUTO = 0,
    LIBRARY = 1,
    SCENE = 2
}
//# sourceMappingURL=UI.service.d.ts.map