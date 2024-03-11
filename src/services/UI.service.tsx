import ReactEcs, { UiComponent, UiEntity, Label } from '@dcl/sdk/react-ecs'
import { ecs, ui } from '../environment'

export namespace ReactEcsRenderer {
  export const setUiRenderer = (components?: UiComponent) => {
    let externalComponents: UiComponent = () => []
    UIService.internalComponents = () => [UIService.uiComponent(), UIService.notificationComponent()]

    if (components) {
      externalComponents = components
    }

    const mainComponent = () => [UIService.internalComponents(), externalComponents()]
    ui.ReactEcsRenderer.setUiRenderer(mainComponent)
  }

  export const render = () => {
    setUiRenderer()
  }
}

export class UIService {
  public static internalComponents: UiComponent = () => [this.uiComponent(), this.notificationComponent()]
  public static uiComponent: CallableFunction = () => (
    <UiEntity
      key={Date.now()}
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
      }}
      uiBackground={{}}
    ></UiEntity>
  )
  public static notificationComponent: CallableFunction = () => {}
  static modules: UiComponent[] = []

  static render: CallableFunction = (): void => {
    ReactEcsRenderer.render()
  }
}
