import { Entity, InputAction, EventSystemCallback, PBPointerEventsResult } from '@dcl/sdk/ecs'
import { VLMClickEvent } from '../components/VLMClickEvent.component'
import { movePlayerTo, openExternalUrl } from '~system/RestrictedActions'
import { Vector3 } from '@dcl/sdk/math'
import { requestTeleport } from '~system/UserActionModule'
import { VLMEventManager } from '../logic/VLMSystemEvents.logic'
import { ecs } from '../environment'
import { getSoundPath } from '../shared/paths'
import { VLMDebug } from '../logic/VLMDebug.logic'

export class ClickEventService {
  entities: Entity[] = []
  functions: { [id: number]: EventSystemCallback } = {}

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  set: CallableFunction = (entity: Entity, options: VLMClickEvent.Config): void => {
    this.addEntity(entity)

    const defaultOptions: VLMClickEvent.Config = {
      type: VLMClickEvent.Actions.NONE,
      trackingId: '',
      externalLink: '',
      moveTo: {
        position: { x: 0, y: 0, z: 0 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        setCameraTarget: false,
      },
      teleportTo: '',
      hoverText: '',
      showFeedback: false,
    }

    const clickEvent = new VLMClickEvent.Config({ ...defaultOptions, ...options })

    switch (clickEvent.type) {
      case VLMClickEvent.Actions.TRACKING_ONLY: //tracking clicks only
        this.functions[entity] = () => {}
        break
      case VLMClickEvent.Actions.EXTERNAL: //external link
        this.functions[entity] = () => {
          if (!clickEvent.externalLink) {
            return
          }
          openExternalUrl({ url: clickEvent.externalLink })
        }
        break
      case VLMClickEvent.Actions.SOUND: //play a sound
        this.functions[entity] = () => {
          if (!clickEvent.sound) {
            return
          } else {
            ecs.AudioSource.createOrReplace(entity, { audioClipUrl: getSoundPath(clickEvent.sound), playing: true })
          }
        }
        break
      case VLMClickEvent.Actions.MOVE: // move player
        if (!clickEvent.moveTo) {
          return
        }
        const { position, cameraTarget, setCameraTarget } = clickEvent.moveTo

        if (setCameraTarget) {
          this.functions[entity] = () => {
            movePlayerTo({
              newRelativePosition: Vector3.create(position.x, position.y, position.z),
              cameraTarget: Vector3.create(cameraTarget.x, cameraTarget.y, cameraTarget.z),
            })
          }
        } else {
          this.functions[entity] = () => {
            movePlayerTo({
              newRelativePosition: Vector3.create(position.x, position.y, position.z),
            })
          }
        }
        break
      case VLMClickEvent.Actions.TELEPORT: // teleport player
        this.functions[entity] = () => {
          if (!clickEvent.teleportTo) {
            return
          } else {
            requestTeleport({ destination: clickEvent.teleportTo })
          }
        }
        break
    }

    this.addEntity(entity)

    if (ecs.PointerEvents.has(entity)) {
      ecs.pointerEventsSystem.removeOnPointerDown(entity)
    }

    ecs.pointerEventsSystem.onPointerDown(
      {
        entity,
        opts: { button: InputAction.IA_POINTER, hoverText: clickEvent.hoverText, showFeedback: clickEvent.showFeedback },
      },
      (event: PBPointerEventsResult) => {
        this.functions[entity](event)
        this.trackClickEvent(clickEvent, clickEvent.trackingId)
      },
    )
  }

  setCustom: CallableFunction = (entity: Entity, clickOptions: VLMClickEvent.Config, callback: CallableFunction): void => {
    if (ecs.PointerEvents.has(entity)) {
      ecs.pointerEventsSystem.removeOnPointerDown(entity)
    }

    ecs.pointerEventsSystem.onPointerDown(
      {
        entity,
        opts: { button: InputAction.IA_POINTER, hoverText: clickOptions.hoverText, showFeedback: clickOptions.showFeedback },
      },
      (event: PBPointerEventsResult) => {
        callback()
      },
    )
  }

  setAll: CallableFunction = (options: VLMClickEvent.Config): void => {
    this.entities.forEach((entity: Entity) => {
      this.set(entity, options)
    })
  }

  trackClickEvent: CallableFunction = (clickEvent: VLMClickEvent.Config, id?: string) => {
    const trackingId = clickEvent.trackingId || id

    VLMDebug.log('Tracking Click Event', trackingId)
    if (trackingId && clickEvent.hasTracking) {
      VLMEventManager.events.emit('VLMSessionAction', trackingId)
    }
  }
}
