import { IEngine } from '@dcl/sdk/ecs'
import { ecs } from '../environment'

const REGULAR_PRIORITY = 100e3

export namespace priority {
  export const TimerSystemPriority = REGULAR_PRIORITY + 256
  export const TweenSystemPriority = REGULAR_PRIORITY + 192
  export const PerpetualMotionSystemPriority = REGULAR_PRIORITY + 192
  export const PathSystemPriority = REGULAR_PRIORITY + 192
  export const TriggerSystemPriority = REGULAR_PRIORITY + 128
  export const ActionSystemPriority = REGULAR_PRIORITY + 64
}

export type Callback = () => void

export type TimerId = number

export namespace VLMTimer {
  export class System {
    static createTimers(targetEngine: IEngine) {
      type TimerData = {
        accumulatedTime: number
        interval: number
        recurrent: boolean
        callback: Callback
      }

      const timers: Map<TimerId, TimerData> = new Map()
      let timerIdCounter = 0

      function system(dt: number) {
        let deadTimers = []
        let callbacks = []

        for (let [timerId, timerData] of timers) {
          timerData.accumulatedTime += 1000 * dt
          if (timerData.accumulatedTime < timerData.interval) continue

          callbacks.push(timerData.callback)

          if (timerData.recurrent) {
            timerData.accumulatedTime -= Math.floor(timerData.accumulatedTime / timerData.interval) * timerData.interval
          } else {
            deadTimers.push(timerId)
          }
        }

        for (let timerId of deadTimers) timers.delete(timerId)

        for (let callback of callbacks) callback()
      }

      targetEngine.addSystem(system, priority.TimerSystemPriority)
      return {
        setTimeout(callback: Callback, milliseconds: number): TimerId {
          let timerId = timerIdCounter++
          timers.set(timerId, { callback: callback, interval: milliseconds, recurrent: false, accumulatedTime: 0 })
          return timerId
        },
        clearTimeout(timer: TimerId) {
          timers.delete(timer)
        },
        setInterval(callback: Callback, milliseconds: number): TimerId {
          let timerId = timerIdCounter++
          timers.set(timerId, { callback: callback, interval: milliseconds, recurrent: true, accumulatedTime: 0 })
          return timerId
        },
        clearInterval(timer: TimerId) {
          timers.delete(timer)
        },
      }
    }
  }
}

export const timers = VLMTimer.System.createTimers(ecs.engine)
