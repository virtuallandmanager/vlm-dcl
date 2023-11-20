import { Entity, PBAudioSource } from '@dcl/sdk/ecs'
import { ecs } from '../environment'
import { AudioSourceType, VLMAudible, VLMBaseProperties, VLMDynamicMedia } from '../shared/interfaces'

export class AudioService {
  entities: Entity[] = []

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  set: CallableFunction = (entity: Entity, options: PBAudioSource): void => {
    const defaultOptions = {
      audioClipUrl: '',
      playing: false,
      loop: true,
      volume: 1,
    }

    ecs.AudioSource.createOrReplace(entity, { ...defaultOptions, ...options })
  }

  setAll: CallableFunction = (options: { src: string; playing: boolean; loop: boolean; volume: number }): void => {
    this.entities.forEach((entity: Entity) => {
      this.set(entity, options)
    })
  }

  clear: CallableFunction = (entity: Entity): void => {
    ecs.AudioSource.deleteFrom(entity)
  }

  clearAll: CallableFunction = (): void => {
    this.entities.forEach((entity: Entity) => {
      this.clear(entity)
    })
  }

  play: CallableFunction = (entity: Entity): void => {
    const audioSource = ecs.AudioSource.getMutableOrNull(entity)
    if (!audioSource) {
      return
    }
    audioSource.playing = true
  }

  stop: CallableFunction = (entity: Entity): void => {
    const audioSource = ecs.AudioSource.getMutableOrNull(entity)
    if (!audioSource) {
      return
    }
    audioSource.playing = false
  }

  toggle: CallableFunction = (entity: Entity): void => {
    const audioSource = ecs.AudioSource.getMutableOrNull(entity)
    if (!audioSource) {
      return
    }
    audioSource.playing = !audioSource.playing
  }

  setVolume: CallableFunction = (entity: Entity, volume: number): void => {
    const audioSource = ecs.AudioSource.getMutableOrNull(entity)
    if (!audioSource) {
      return
    }
    audioSource.volume = volume
  }

  setLoop: CallableFunction = (entity: Entity, loop: boolean): void => {
    const audioSource = ecs.AudioSource.getMutableOrNull(entity)
    if (!audioSource) {
      return
    }
    audioSource.loop = loop
  }

  setSourceOptions: CallableFunction = (entity: Entity, options: PBAudioSource): void => {
    const audioSource = ecs.AudioSource.getMutableOrNull(entity)
    if (!audioSource) {
      return
    }
    audioSource.audioClipUrl = options.audioClipUrl
    audioSource.playing = options.playing
    audioSource.loop = options.loop
    audioSource.volume = options.volume
  }

  setAllSourceOptions: CallableFunction = (options: { src: string; playing: boolean; loop: boolean; volume: number }): void => {
    this.entities.forEach((entity: Entity) => {
      this.setSourceOptions(entity, options)
    })
  }

  setAllVolume: CallableFunction = (volume: number): void => {
    this.entities.forEach((entity: Entity) => {
      this.setVolume(entity, volume)
    })
  }

  setAllLoop: CallableFunction = (loop: boolean): void => {
    this.entities.forEach((entity: Entity) => {
      this.setLoop(entity, loop)
    })
  }

  playAll: CallableFunction = (): void => {
    this.entities.forEach((entity: Entity) => {
      this.play(entity)
    })
  }

  stopAll: CallableFunction = (): void => {
    this.entities.forEach((entity: Entity) => {
      this.stop(entity)
    })
  }

  toggleAll: CallableFunction = (): void => {
    this.entities.forEach((entity: Entity) => {
      this.toggle(entity)
    })
  }

  buildOptions: CallableFunction = (config: VLMAudible & VLMBaseProperties) => {
    const audioOptions: PBAudioSource = {
      audioClipUrl: '',
      playing: false,
      loop: true,
      volume: 1,
    }
    try {
      const { enabled, audioSrc, volume, sourceType } = config

      if (audioSrc) {
        audioOptions.audioClipUrl = audioSrc
      }
      if (volume !== undefined) {
        audioOptions.volume = volume
      }
      if (sourceType == AudioSourceType.LOOP) {
        audioOptions.loop = true
      } else {
        audioOptions.loop = false
      }

      if (enabled) {
        audioOptions.playing = true
      } else {
        audioOptions.playing = false
      }

      return audioOptions
    } catch (error) {
      throw error
    }
  }
}
