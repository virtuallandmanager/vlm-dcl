import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { ecs } from '../environment'

export class UIService {
  static modules: CallableFunction[] = []

  static init: CallableFunction = (): void => {
    // ecs.engine.addSystem()
    this.render()
  }

  static textFader: CallableFunction = (dt: number): void => {}

  static addModule: CallableFunction = (module: CallableFunction): void => {
    if (!this.modules.includes(module)) {
      this.modules.push(module)
    }
    this.render()
  }

  static render: CallableFunction = (): void => {
    ReactEcsRenderer.setUiRenderer(() => this.modules)
  }
}
