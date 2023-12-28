import ReactEcs, { UiComponent, UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { ecs, ui } from '../environment'

let externalComponents: UiComponent = () => []

export namespace ReactEcsRenderer {
  export const setUiRenderer = (components?: UiComponent) => {
    const internalComponents: UiComponent = () => [UIService.uiComponent(), UIService.notificationComponent()]
    if (components) {
      externalComponents = components
    }
    const mainComponent = () => [internalComponents(), externalComponents()]
    ui.ReactEcsRenderer.setUiRenderer(mainComponent)
  }

  export const render = () => {
    setUiRenderer()
  }
}

export class UIService {
  public static uiComponent: CallableFunction = () => (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        positionType: 'absolute',
      }}
      uiBackground={{}}
    >
    </UiEntity>
  )
  public static notificationComponent: CallableFunction = () => {}
  static modules: UiComponent[] = []

  static render: CallableFunction = (): void => {
    ReactEcsRenderer.render()
  }
}
