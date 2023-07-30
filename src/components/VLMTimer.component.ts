export namespace VLMTimer {
  export class System implements ISystem {
    private static instance: System | null = null;

    private _components: ComponentConstructor<ITimerComponent>[] = [];

    static createAndAddToEngine(): System {
      if (this.instance == null) {
        this.instance = new System();
        engine.addSystem(this.instance);
      }
      return this.instance;
    }

    static registerCustomComponent<T extends ITimerComponent>(component: ComponentConstructor<T>) {
      this.createAndAddToEngine()._components.push(component);
    }

    public addComponentType(component: ComponentConstructor<ITimerComponent>) {
      for (let comp of this._components) {
        if (component == comp) {
          return;
        }
      }
      this._components.push(component);
    }

    private constructor() {
      System.instance = this;
    }

    update(dt: number) {
      this._components.forEach((component) => {
        this.updateComponent(dt, component);
      });
    }

    private updateComponent<T extends ITimerComponent>(dt: number, component: ComponentConstructor<T>) {
      let record = engine.getEntitiesWithComponent(component);

      for (const key in record) {
        if (record.hasOwnProperty(key)) {
          let entity = record[key];
          let timerComponent = entity.getComponent(component);

          timerComponent.elapsedTime += dt;
          if (timerComponent.elapsedTime >= timerComponent.targetTime) {
            timerComponent.onTargetTimeReached(entity);
          }
        }
      }
    }
  }
  /**
   * Execute every X milliseconds
   * @public
   */
  @Component("vlmTimerInterval")
  export class Interval implements ITimerComponent {
    elapsedTime: number;
    targetTime: number;
    onTargetTimeReached: (ownerEntity: IEntity) => void;

    private onTimeReachedCallback?: () => void;

    /**
     * @param millisecs - amount of time in milliseconds
     * @param onTimeReachedCallback - callback for when time is reached
     */
    constructor(millisecs: number, onTimeReachedCallback?: () => void) {
      let instance = VLMTimer.System.createAndAddToEngine();
      instance.addComponentType(Interval);

      this.elapsedTime = 0;
      this.targetTime = millisecs / 1000;
      this.onTimeReachedCallback = onTimeReachedCallback;
      this.onTargetTimeReached = () => {
        this.elapsedTime = 0;
        if (this.onTimeReachedCallback) this.onTimeReachedCallback();
      };
    }

    setCallback(onTimeReachedCallback: () => void) {
      this.onTimeReachedCallback = onTimeReachedCallback;
    }
  }

  /**
   * Execute once after X milliseconds
   * @public
   */
  @Component("vlmTimerDelay")
  export class Delay implements ITimerComponent {
    elapsedTime: number;
    targetTime: number;
    onTargetTimeReached: (ownerEntity: IEntity) => void;

    private onTimeReachedCallback?: () => void;

    /**
     * @param millisecs - amount of time in milliseconds
     * @param onTimeReachedCallback - callback for when time is reached
     */
    constructor(millisecs: number, onTimeReachedCallback?: () => void) {
      let instance = VLMTimer.System.createAndAddToEngine();
      instance.addComponentType(Delay);

      this.elapsedTime = 0;
      this.targetTime = millisecs / 1000;
      this.onTimeReachedCallback = onTimeReachedCallback;
      this.onTargetTimeReached = (entity) => {
        if (this.onTimeReachedCallback) this.onTimeReachedCallback();
        entity.removeComponent(this);
      };
    }

    setCallback(onTimeReachedCallback: () => void) {
      this.onTimeReachedCallback = onTimeReachedCallback;
    }
  }

  /**
   * @public
   */
  export interface ITimerComponent {
    elapsedTime: number;
    targetTime: number;
    onTargetTimeReached: (ownerEntity: IEntity) => void;
  }
}
