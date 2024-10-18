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
    const serviceEntityIndex = this.entities.findIndex((e) => e === entity)
    if (serviceEntityIndex > -1) {
      this.entities[serviceEntityIndex] = ecs.engine.addEntity()
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
        emissiveIntensity: textureOptions?.emissiveIntensity || 1,
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
    const serviceEntity = this.entities.find((e) => e === entity)
    this.videoTexture = ecs.Material.Texture.Video({
      videoPlayerEntity: serviceEntity,
    })

    const defaultVideoOptions = {
      src: '',
      playing: true,
      loop: false,
      volume: 1.0,
      position: 0.0,
      playbackRate: 1.0,
    }

    ecs.VideoPlayer.createOrReplace(serviceEntity, {
      ...defaultVideoOptions,
      ...videoOptions,
    })

    VLMDebug.log('video', 'setting video texture', textureOptions)

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

  play: CallableFunction = (entity: Entity): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(entity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.playing = true
  }

  stop: CallableFunction = (entity: Entity): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(entity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.position = 0
    videoPlayer.playing = false
    ecs.VideoPlayer.deleteFrom(this.videoPlayerEntity)
  }

  pause: CallableFunction = (entity: Entity): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(entity)
    if (!videoPlayer) {
      return
    }
    videoPlayer.playing = false
  }

  toggle: CallableFunction = (entity: Entity): void => {
    const videoPlayer = ecs.VideoPlayer.getMutableOrNull(entity)
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
    const objThis = this
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
        config.mediaType == DynamicMediaType.PLAYLIST && // is a playlist
        videoEvent.state > VideoState.VS_PLAYING && // is playing
        videoEvent.videoLength > 0 && // video has a length
        videoEvent.currentOffset >= videoEvent.videoLength - 0.01 && // video is at the end
        config.activePlaylistVideo < config.playlist.length - 1 // there are more videos in the playlist
      ) {
        VLMDebug.log('video', 'event - video ended', config)
        config.startPlaylistVideo(config.activePlaylistVideo + 1)
      } else if (
        config.mediaType == DynamicMediaType.PLAYLIST && // is a playlist
        videoEvent.state > VideoState.VS_PLAYING && // is playing
        videoEvent.videoLength > 0 && // video has a length
        videoEvent.currentOffset >= videoEvent.videoLength - 0.01 && // video is at the end
        config.activePlaylistVideo >= config.playlist.length - 1 // there are no more videos in the playlist
      ) {
        VLMDebug.log('video', 'event - video ended', config)
        config.startPlaylistVideo(0)
      }

      switch (videoEvent.state) {
        case VideoState.VS_READY:
          VLMDebug.log('video', 'event - video is READY')
          objThis.play()
          break
        case VideoState.VS_NONE:
          VLMDebug.log('video', 'event - video is in NO STATE')
          break
        case VideoState.VS_ERROR:
          VLMDebug.log('video', 'event - video ERROR')
          if (config.mediaType == DynamicMediaType.PLAYLIST && config.activePlaylistVideo < config.playlist.length - 1) {
            config.startPlaylistVideo(config.activePlaylistVideo + 1)
          } else if (config.mediaType == DynamicMediaType.PLAYLIST && config.activePlaylistVideo >= config.playlist.length - 1) {
            config.startPlaylistVideo(0)
          } else {
            objThis.stop()
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
          objThis.play()
          break
      }
    })
  }

  clearEventSystem: CallableFunction = (): void => {
    if (ecs.videoEventsSystem.hasVideoEventsEntity(this.videoPlayerEntity)) {
      ecs.videoEventsSystem.removeVideoEventsEntity(this.videoPlayerEntity)
    }
  }

  getVideoState: CallableFunction = (): DeepReadonlyObject<PBVideoEvent> => {
    const stateObj = ecs.videoEventsSystem.getVideoState(this.videoPlayerEntity)
    if (!stateObj) {
      return { state: VideoState.VS_NONE, currentOffset: 0, videoLength: 0, timestamp: 0, tickNumber: 0 }
    }
    return stateObj
  }
}
