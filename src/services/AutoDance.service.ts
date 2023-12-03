import { Entity } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { ecs } from '../environment'
import { VLMQuaternion } from '../shared/maths'
import { TriggeredEmote } from '../shared/interfaces'
import { triggerEmote, triggerSceneEmote } from '~system/RestrictedActions'
import { VLMDebug } from '../logic/VLMDebug.logic'
import { VLMEventListeners } from '../logic/VLMSystemListeners.logic'

export class AutoDanceService {
  static userEnabled = false
  static defaultEmotes: TriggeredEmote[] = [
    { emote: 'robot', loop: false },
    { emote: 'tik', loop: false },
    { emote: 'tektonik', loop: false },
    { emote: 'hammer', loop: false },
    { emote: 'disco', loop: false },
  ]
  entities: Entity[] = []
  emotesToTrigger: TriggeredEmote[] = []
  currentEmoteIndex: number | null = null
  interval: number = 5000
  lastTriggered: number = 0

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  setup: CallableFunction = ({ emotes, interval, enabledOnLoad }: { emotes: TriggeredEmote[]; interval?: number; enabledOnLoad: boolean }): void => {
    if (!enabledOnLoad) {
      return
    } else {
      AutoDanceService.userEnabled = true
    }
    this.emotesToTrigger = emotes.length ? emotes : AutoDanceService.defaultEmotes
    this.interval = interval || this.interval
    this.startCheckingDanceFloors()
  }

  clear: CallableFunction = (): void => {
    this.entities = []
    this.emotesToTrigger = []
    this.currentEmoteIndex = null
    this.stopCheckingDanceFloors()
  }

  static toggleGlobalAutoDance: CallableFunction = (enabled?: boolean): void => {
    if (enabled === undefined) {
      this.userEnabled = !this.userEnabled
    } else {
      this.userEnabled = !enabled
    }
  }

  startCheckingDanceFloors: CallableFunction = (): void => {
    ecs.engine.addSystem(this.danceFloorCheck)
  }

  stopCheckingDanceFloors: CallableFunction = (): void => {
    ecs.engine.removeSystem(this.danceFloorCheck)
  }

  triggerNextEmote: CallableFunction = () => {
    if (this.currentEmoteIndex === null) {
      this.currentEmoteIndex = Math.floor(Math.random() * this.emotesToTrigger.length)
    } else {
      const otherEmotes = this.emotesToTrigger.filter((emote: TriggeredEmote, index: number) => index !== this.currentEmoteIndex)
      this.currentEmoteIndex = Math.floor(Math.random() * otherEmotes.length)
    }
    const nextEmote = this.emotesToTrigger[this.currentEmoteIndex]
    if (!nextEmote) {
      return
    }
    VLMEventListeners.ignoreNextEmote = true
    if (nextEmote.isCustom) {
      triggerSceneEmote({ src: nextEmote.emote, loop: nextEmote.loop })
    } else {
      triggerEmote({ predefinedEmote: nextEmote.emote })
    }
  }

  onDanceFloor: CallableFunction = (playerPosition: Vector3, box: { position: Vector3; scale: Vector3; rotation: Quaternion }): boolean => {
    // Convert player position to the box's local space
    let localPlayerPos = Vector3.subtract(playerPosition, box.position)

    // Apply inverse rotation using the quaternion
    let inverseRotation = new VLMQuaternion(box.rotation.x, box.rotation.y, box.rotation.z, box.rotation.w).invert(box.rotation)
    localPlayerPos = Vector3.rotate(localPlayerPos, inverseRotation)

    // Check if the player is within the box boundaries
    return (
      localPlayerPos.x >= -box.scale.x / 2 &&
      localPlayerPos.x <= box.scale.x / 2 &&
      localPlayerPos.y >= -box.scale.y / 2 &&
      localPlayerPos.y <= box.scale.y / 2 &&
      localPlayerPos.z >= -box.scale.z / 2 &&
      localPlayerPos.z <= box.scale.z / 2
    )
  }

  danceFloorCheck: CallableFunction = (dt: number): void => {
    if (this.lastTriggered + this.interval > Date.now()) {
      return
    } else {
      this.lastTriggered = Date.now()
    }
    let playerPosition = { ...ecs.Transform.get(ecs.engine.PlayerEntity).position }
    playerPosition.y -= 1
    this.entities.forEach((entity) => {
      const boxTransform = { ...ecs.Transform.get(entity) }

      if (boxTransform.parent) {
        // boxTransform.position = Vector3.add(ecs.Transform.get(boxTransform.parent).position, boxTransform.position)
        playerPosition = Vector3.subtract(playerPosition, ecs.Transform.get(boxTransform.parent).position)
      }

      if (AutoDanceService.userEnabled && this.onDanceFloor(playerPosition, boxTransform)) {
        VLMDebug.log('Player is on dance floor')
        this.triggerNextEmote()
        return
      } else if (!AutoDanceService.userEnabled) {
        VLMDebug.log('Player has autodance disabled')
        this.stopCheckingDanceFloors()
        return
      }

      VLMDebug.log('Player is not on dance floor', playerPosition, boxTransform.position)
    })
  }
}
