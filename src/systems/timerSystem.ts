import { ITimerComponent } from '../components/itimercomponent'

export class VLMTimerSystem implements ISystem {
  private static _instance: VLMTimerSystem | null = null

  private _components: ComponentConstructor<ITimerComponent>[] = []

  static createAndAddToEngine(): VLMTimerSystem {
    if (this._instance == null) {
      this._instance = new VLMTimerSystem()
      engine.addSystem(this._instance)
    }
    return this._instance
  }

  static registerCustomComponent<T extends ITimerComponent>(
    component: ComponentConstructor<T>
  ) {
    this.createAndAddToEngine()._components.push(component)
  }

  public addComponentType(component: ComponentConstructor<ITimerComponent>) {
    for (let comp of this._components) {
      if (component == comp) {
        return
      }
    }
    this._components.push(component)
  }

  private constructor() {
    VLMTimerSystem._instance = this
  }

  update(dt: number) {
    this._components.forEach(component => {
      this.updateComponent(dt, component)
    })
  }

  private updateComponent<T extends ITimerComponent>(
    dt: number,
    component: ComponentConstructor<T>
  ) {
    let record = engine.getEntitiesWithComponent(component)

    for (const key in record) {
      if (record.hasOwnProperty(key)) {
        let entity = record[key]
        let timerComponent = entity.getComponent(component)

        timerComponent.elapsedTime += dt
        if (timerComponent.elapsedTime >= timerComponent.targetTime) {
          timerComponent.onTargetTimeReached(entity)
        }
      }
    }
  }
}