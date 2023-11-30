import {
  Entity,
  PBMaterial_PbrMaterial,
  PBMaterial_UnlitMaterial,
  PBVideoPlayer,
  PBVideoEvent,
  DeepReadonlyObject,
  VideoState,
  TextureUnion,
  Material,
  VideoPlayer,
} from '@dcl/sdk/ecs'
import { Color3 } from '@dcl/sdk/math'
import { ecs } from '../environment'
import { VLMVideo } from '../components'
import { VLMDebug } from '../logic/VLMDebug.logic'
import { DynamicMedia, DynamicMediaType } from '../shared/interfaces'

export class VideoService {
  entities: Entity[] = []
  static videoPlayerEntity: Entity = ecs?.engine?.addEntity()
  videoPlayerEntity: Entity = VideoService.videoPlayerEntity
  videoTexture?: TextureUnion

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
    if (!VideoService.videoPlayerEntity) {
      VideoService.videoPlayerEntity = ecs.engine.addEntity()
    }
  }

  setImageTexture: CallableFunction = (entity: Entity, textureOptions?: DynamicMedia & PBMaterial_PbrMaterial & PBMaterial_UnlitMaterial): void => {
    VLMDebug.log('setting texture', textureOptions)
    try {
      this.addEntity(entity)
      const texture = Material.Texture.Common({ src: textureOptions?.offImageSrc || '' })
      const defaultTextureOptions = {
        texture: texture,
        roughness: 1.0,
        specularIntensity: 0,
        metallic: 0,
        emissiveTexture: texture,
        emissiveIntensity: 0.6,
        emissiveColor: Color3.White(),
      }
      VLMDebug.log('setting texture', {
        ...defaultTextureOptions,
        ...textureOptions,
      })
      ecs.Material.setPbrMaterial(entity, {
        ...defaultTextureOptions,
        ...textureOptions,
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  setTexture: CallableFunction = (entity: Entity, textureOptions?: PBMaterial_PbrMaterial): void => {
    VLMDebug.log('setting texture', textureOptions)
    try {
      this.addEntity(entity)
      const defaultTextureOptions = {
        texture: this.videoTexture,
        roughness: 1.0,
        specularIntensity: 0,
        metallic: 0,
        emissiveTexture: this.videoTexture,
        emissiveIntensity: 0.6,
        emissiveColor: Color3.White(),
      }
      VLMDebug.log('setting texture', {
        ...defaultTextureOptions,
        ...textureOptions,
      })
      ecs.Material.setPbrMaterial(entity, {
        ...defaultTextureOptions,
        ...textureOptions,
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  setPlayer: CallableFunction = (entity: Entity | null, videoOptions: PBVideoPlayer, textureOptions?: PBMaterial_PbrMaterial): void => {
    this.videoTexture = ecs.Material.Texture.Video({
      videoPlayerEntity: this.videoPlayerEntity,
    })

    const defaultVideoOptions = {
      src: '',
      playing: true,
      loop: false,
      volume: 1.0,
      position: 0.0,
      playbackRate: 1.0,
    }

    ecs.VideoPlayer.createOrReplace(this.videoPlayerEntity, {
      ...defaultVideoOptions,
      ...videoOptions,
    })

    if (entity) {
      this.setTexture(entity, textureOptions)
    } else {
      this.setAllTextures({ ...textureOptions, texture: this.videoTexture })
    }
  }

  setAllImageTextures: CallableFunction = (textureOptions: DynamicMedia & PBMaterial_PbrMaterial): void => {
    this.entities.forEach((entity: Entity) => {
      this.setImageTexture(entity, textureOptions)
    })
  }

  setAllTextures: CallableFunction = (textureOptions: PBMaterial_PbrMaterial): void => {
    this.entities.forEach((entity: Entity) => {
      this.setTexture(entity, textureOptions)
    })
  }

  clear: CallableFunction = (entity: Entity): void => {
    ecs.VideoPlayer.deleteFrom(entity)
    ecs.Material.deleteFrom(entity)
  }

  removeVideoScreen: CallableFunction = (entity: Entity): void => {
    ecs.VideoPlayer.deleteFrom(entity)
    ecs.Material.deleteFrom(entity)
  }

  removeVideoScreens: CallableFunction = (): void => {
    this.entities.forEach((entity: Entity) => {
      this.removeVideoScreen(entity)
    })
  }

  play: CallableFunction = (): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(this.videoPlayerEntity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.playing = true
  }

  stop: CallableFunction = (): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(this.videoPlayerEntity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.position = 0
    videoPlayer.playing = false
    ecs.VideoPlayer.deleteFrom(this.videoPlayerEntity)
  }

  pause: CallableFunction = (): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(this.videoPlayerEntity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.playing = false
  }

  toggle: CallableFunction = (): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(this.videoPlayerEntity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.playing ? this.stop() : this.play()
  }

  setVolume: CallableFunction = (entity: Entity, volume: number): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(entity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.volume = volume
  }

  setLoop: CallableFunction = (entity: Entity, loop: boolean): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(entity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.loop = loop
  }

  setVideoOptions: CallableFunction = (entity: Entity, options: PBVideoPlayer): void => {
    this.addEntity(entity)
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(this.videoPlayerEntity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.src = options.src
    videoPlayer.playing = options.playing
  }

  setAllVideoOptions: CallableFunction = (options: { src: string; playing: boolean; loop: boolean; volume: number }): void => {
    this.entities.forEach((entity: Entity) => {
      this.setVideoOptions(entity, options)
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

  initEventSystem: CallableFunction = (config: VLMVideo.Config): void => {
    if (ecs.videoEventsSystem.hasVideoEventsEntity(this.videoPlayerEntity)) {
      return
    }
    ecs.videoEventsSystem.registerVideoEventsEntity(this.videoPlayerEntity, function (videoEvent: DeepReadonlyObject<PBVideoEvent>) {
      VLMDebug.log(
        'video',
        'event - state: ' + videoEvent.state + '\ncurrent offset:' + videoEvent.currentOffset + '\nvideo length:' + videoEvent.videoLength,
        config,
      )
      if (
        config.mediaType == DynamicMediaType.PLAYLIST &&
        videoEvent.state > VideoState.VS_PLAYING &&
        videoEvent.videoLength > 0 &&
        videoEvent.currentOffset === videoEvent.videoLength
      ) {
        VLMDebug.log('video', 'event - video ended', config)
        config.startPlaylistVideo(config.activePlaylistVideo + 1)
      }

      switch (videoEvent.state) {
        case VideoState.VS_READY:
          VLMDebug.log('video', 'event - video is READY')
          break
        case VideoState.VS_NONE:
          VLMDebug.log('video', 'event - video is in NO STATE')
          break
        case VideoState.VS_ERROR:
          VLMDebug.log('video', 'event - video ERROR')
          if (config.mediaType == DynamicMediaType.PLAYLIST) {
            config.startPlaylistVideo(config.activePlaylistVideo + 1)
          }
          break
        case VideoState.VS_SEEKING:
          VLMDebug.log('video', 'event - video is SEEKING')
          break
        case VideoState.VS_LOADING:
          VLMDebug.log('video', 'event - video is LOADING')
          break
        case VideoState.VS_BUFFERING:
          VLMDebug.log('video', 'event - video is BUFFERING')
          break
        case VideoState.VS_PLAYING:
          VLMDebug.log('video', 'event - video started PLAYING')
          break
        case VideoState.VS_PAUSED:
          VLMDebug.log('video', 'event - video is PAUSED')
          break
      }
    })
  }

  clearEventSystem: CallableFunction = (): void => {
    if (ecs.videoEventsSystem.hasVideoEventsEntity(this.videoPlayerEntity)) {
      ecs.videoEventsSystem.removeVideoEventsEntity(this.videoPlayerEntity)
    }
  }

  getVideoState: CallableFunction = (): DeepReadonlyObject<PBVideoEvent> | undefined => {
    return ecs.videoEventsSystem.getVideoState(this.videoPlayerEntity)
  }
}
