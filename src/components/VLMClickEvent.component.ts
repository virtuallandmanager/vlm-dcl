import { Vector3 } from "@dcl/sdk/math"

export namespace VLMClickEvent {
  export enum Actions {
    NONE,
    EXTERNAL,
    TRACKING_ONLY,
    SOUND,
    STREAM,
    MOVE,
    TELEPORT,
    CLAIM_GIVEAWAY
  }

  export class Config {
    type: Actions
    showFeedback: boolean
    hoverText: string
    externalLink?: string
    sound?: string
    moveTo?: { cameraTarget: Vector3, position: Vector3, setCameraTarget: boolean }
    teleportTo?: string
    hasTracking?: boolean
    trackingId?: string
    synced?: boolean

    constructor(config: Config) {
      try {
        this.type = config.type || Actions.NONE
        this.showFeedback = config.showFeedback
        this.hoverText = config.hoverText
        this.externalLink = config.externalLink
        this.sound = config.sound
        this.moveTo = config.moveTo
        this.teleportTo = config.teleportTo
        this.hasTracking = config.hasTracking
        this.trackingId = config.trackingId
        this.synced = config.synced

        return this;

      } catch (error) {
        throw error
      }
    }
  }
}
