import { ITimerComponent } from './itimercomponent'
import { VLMTimerSystem } from '../systems/timerSystem'

/**
 * Execute once after X milliseconds
 * @public
 */
@Component('vlmTimerDelay')
export class VLMDelay implements ITimerComponent {
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (ownerEntity: IEntity) => void

  private onTimeReachedCallback?: () => void

  /**
   * @param millisecs - amount of time in milliseconds
   * @param onTimeReachedCallback - callback for when time is reached
   */
  constructor(millisecs: number, onTimeReachedCallback?: () => void) {
    let instance = VLMTimerSystem.createAndAddToEngine()
    instance.addComponentType(VLMDelay)

    this.elapsedTime = 0
    this.targetTime = millisecs / 1000
    this.onTimeReachedCallback = onTimeReachedCallback
    this.onTargetTimeReached = entity => {
      if (this.onTimeReachedCallback) this.onTimeReachedCallback()
      entity.removeComponent(this)
    }
  }

  setCallback(onTimeReachedCallback: () => void) {
    this.onTimeReachedCallback = onTimeReachedCallback
  }
}