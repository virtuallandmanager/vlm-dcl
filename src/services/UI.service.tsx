import ReactEcs, { UiComponent, UiEntity } from '@dcl/sdk/react-ecs'
import { ecs, ui } from '../environment'

export namespace ReactEcsRenderer {
  export let rendererSet = false;
  export const setUiRenderer = (components?: UiComponent) => {
    let externalComponents: UiComponent = () => []
    UIService.internalComponents = () => [UIService.notificationComponent()]

    if (components) {
      externalComponents = components
    }

    const mainComponent = () => [UIService.internalComponents(), externalComponents()]
    ui.ReactEcsRenderer.setUiRenderer(mainComponent)
    rendererSet = true
  }
}

export class UIService {
  public static internalComponents: UiComponent = () => [this.notificationComponent()]
  public static notificationComponent: CallableFunction = () => {}
  static modules: UiComponent[] = []
}

export enum UIMode {
  AUTO,
  LIBRARY,
  SCENE,
}
