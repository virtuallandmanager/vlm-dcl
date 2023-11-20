import { ecs } from '../environment'
import { VLMBase } from './VLMBase.component'
import { VLMClickEvent } from './VLMClickEvent.component'
import { PBMaterial_PbrMaterial, PBVideoPlayer, SystemFn } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { VideoService } from '../services/Video.service'
import { MaterialService } from '../services/Material.service'
import { MeshService } from '../services/Mesh.service'
import { TransformService } from '../services/Transform.service'
import { ClickEventService } from '../services/ClickEvent.service'
import { VLMDebug } from '../logic/VLMDebug.logic'
import {
  DynamicMediaType,
  VLMAudible,
  VLMBaseProperties,
  VLMClickable,
  VLMDynamicMedia,
  VLMInstanceProperties,
  VLMPlayable,
  VLMTextureOptions,
} from '../shared/interfaces'
import { ColliderService } from '../services/Collider.service'

export namespace VLMVideo {
  export const configs: { [uuid: string]: Config } = {}
  export const instances: { [uuid: string]: Instance } = {}

  export type VLMConfig = VLMBaseProperties & VLMClickable & VLMAudible & VLMPlayable & VLMDynamicMedia & VLMTextureOptions

  /**
   * @public
   * VLM Image Config: A config for VLMImage components
   *
   * Configs are used to define properties shared by multiple instances, such as materials, textures, files, etc.
   *
   * @param textureOptions - an object of textures for the image
   * @param videoOptions - an object of options for the video source
   * @param services - an object of services used by the config
   * @param enableLiveStream - whether or not to enable live streaming
   * @param instances - an array of instance configs
   * @param isLive - whether or not the video is live
   * @param liveSrc - the live source of the video
   * @param playlist - an array of video sources
   * @param activePlaylistVideo - the index of the current video in the playlist
   * @param offImageSrc - the image source to display when the video is off
   * @param offType - the type of media to display when the video is off
   * @param volume - the volume of the video
   *
   *
   * @constructor - creates a new config
   * @returns void
   */
  export class Config extends VLMBase.Config {
    textureOptions: PBMaterial_PbrMaterial = {}
    videoOptions: PBVideoPlayer = { src: '', playing: true }
    services: {
      collider: ColliderService
      material: MaterialService
      mesh: MeshService
      transform: TransformService
      clickEvent: ClickEventService
      video: VideoService
    }
    enableLiveStream?: boolean = false
    isLive: boolean = false
    liveSrc?: string = ''
    playlist: string[] = []
    emission?: number = 0
    activePlaylistVideo: number = 0
    offImageSrc?: string = ''
    mediaType?: DynamicMediaType = DynamicMediaType.NONE
    offType?: DynamicMediaType = DynamicMediaType.NONE
    volume?: number = 1

    constructor(config: VLMConfig) {
      super(config)
      this.services = {
        collider: new ColliderService(),
        material: new MaterialService(),
        mesh: new MeshService(),
        transform: new TransformService(),
        clickEvent: new ClickEventService(),
        video: new VideoService(),
      }
      this.init(config)
    }

    /**
     * @public init
     * Initializes the config
     * @returns void
     */
    init: CallableFunction = (config: VLMConfig) => {
      try {
        Object.assign(this, config)

        configs[this.sk] = this

        if (this.customId) {
          configs[this.customId] = configs[this.sk]
        }

        VLMDebug.log('Creating Video Config', config)

        if (!this.enabled || this.customRendering || !config.instances || config.instances.length < 1) {
          return
        }

        if (this.liveSrc && this.enableLiveStream && this.isLive) {
          // if live stream exists, is enabled, and is live
          // set the video source to the live source
          this.mediaType = DynamicMediaType.LIVE
          this.videoOptions.src = this.liveSrc
        } else if (this.playlist.length > 0 && this.offType === DynamicMediaType.PLAYLIST) {
          // if playlist exists
          // set the video source to the current video in the playlist
          this.mediaType = DynamicMediaType.PLAYLIST
          this.videoOptions.src = this.playlist[this.activePlaylistVideo]
          this.services.video.initEventSystem(this)
        } else if (this.offImageSrc && this.offType === DynamicMediaType.IMAGE) {
          // if off image exists
          // set the video source to the off image
          this.mediaType = DynamicMediaType.IMAGE
        } else if (this.offType === DynamicMediaType.NONE) {
          // if no off image exists
          // set the video source to the off image
          this.mediaType = DynamicMediaType.NONE
          return
        }

        VLMDebug.log('Video Media Type', this.mediaType)

        config.instances.forEach((instance: VLMInstanceProperties) => {
          this.createOrReplaceInstance(instance)
        })
      } catch (error) {
        throw error
      }
    }

    /**
     * @public addAll
     * Adds all of the config's instances to the engine
     * @returns void
     */

    addAll: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId]?.add()
        })
      } catch (error) {
        throw error
      }
    }

    /**
     * @public remove
     *  Removes the config's instances from the engine, keeps the config and instance records so we can bring stuff back
     *  @returns void
     */
    remove: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].remove()
        })
      } catch (error) {
        throw error
      }
    }

    /**
     * @public delete
     * Deletes the config's material record AND removes the config's instances from the engine
     * @returns void
     */
    delete: CallableFunction = () => {
      try {
        delete configs[this.sk]
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].delete()
        })
      } catch (error) {
        throw error
      }
    }

    /**
     * @public createOrReplaceInstance
     * Creates a new instance of the config
     * @param config - the instance config
     * @returns void
     */
    createOrReplaceInstance: CallableFunction = (config: VLMInstanceProperties) => {
      if (!this.instanceIds.includes(config.sk)) {
        this.instanceIds.push(config.sk)
      }
      //replace instance if it already exists
      if (instances[config.sk]) {
        ecs.engine.removeEntity(instances[config.sk].entity)
        delete instances[config.sk]
      }
      new Instance(this, config)
    }

    /**
     * @public createOrReplaceInstance
     * Creates a new instance of the config
     * @param config - the instance config
     * @returns void
     */
    removeInstance: CallableFunction = (config: Instance) => {
      //replace instance if it already exists
      if (instances[config.sk]) {
        ecs.engine.removeEntity(instances[config.sk].entity)
      }
    }

    /**
     * @public deleteInstance
     * Creates a new instance of the config
     * @param config - the instance config
     * @returns void
     */
    deleteInstance: CallableFunction = (config: Instance) => {
      if (!this.instanceIds.includes(config.sk)) {
        this.instanceIds = this.instanceIds.filter((instanceId: string) => instanceId !== config.sk)
      }
      //replace instance if it already exists
      if (instances[config.sk]) {
        ecs.engine.removeEntity(instances[config.sk].entity)
        delete instances[config.sk]
      }
    }

    /**
     * @public setLiveState
     * Sets the live state of the config
     * @param state - the state to set
     * @returns void
     */
    setLiveState: CallableFunction = (state: boolean) => {
      if (this.isLive === state) return
      this.isLive = state
      this.init(this)
    }

    /**
     * @public setLiveSrc
     * Sets the live source of the config
     * @param src - the source to set
     * @returns void
     */
    setLiveSrc: CallableFunction = (src: string) => {
      if (this.liveSrc === src) return
      this.liveSrc = src

      if (this.isLive) {
        this.init(this)
      }
    }

    /**
     * @public setPlaylist
     * Sets the playlist of the config
     * @param playlist - the playlist to set
     * @returns void
     */
    setPlaylist: CallableFunction = (playlist: string[]) => {
      const currentlyPlaying = `${this.playlist[this.activePlaylistVideo]}`
      // check if playlist has changed
      if (playlist.every((src: string) => this.playlist.includes(src))) return
      this.playlist = playlist

      // check if currently playing video is still in playlist
      if (this.playlist.includes(currentlyPlaying)) {
        // if so, set the playlist index to the index of the currently playing video
        this.activePlaylistVideo = this.playlist.indexOf(currentlyPlaying)
      } else {
        // if not, set the playlist index to 0 and re-init
        this.activePlaylistVideo = 0
        this.init(this)
      }
    }

    /**
     * @public startLiveStream
     * Starts the live stream
     * @returns void
     */
    startLiveStream: CallableFunction = () => {
      if (this.liveSrc) {
        this.videoOptions.src = this.liveSrc
        this.services.video.setPlayer(this.videoOptions)
      } else {
        VLMDebug.log('error', 'Tried to start live stream but no url was provided')
      }
    }

    /**
     * @public startPlaylistVideo
     * Starts a video in the playlist
     * @returns void
     */
    startPlaylistVideo: CallableFunction = (activePlaylistVideo?: number) => {
      this.activePlaylistVideo = activePlaylistVideo || 0

      if (this.activePlaylistVideo >= this.playlist.length) {
        this.activePlaylistVideo = 0
      }

      this.videoOptions.src = this.playlist[this.activePlaylistVideo]
      this.services.video.setPlayer(null, this.videoOptions)
    }

    /**
     * @public showOffImage
     * Shows the off image
     * @returns void
     */
    showOffImage: CallableFunction = () => {
      this.services.video.clearEventSystem()
      this.services.video.clear()
      this.services.material.buildOptions({ textureSrc: this.offImageSrc, emission: this.emission })
      this.services.video.setAllImageTextures(this)
      VLMDebug.log('showing off image', this.textureOptions)
    }
  }

  /**
   * @public Instance
   * VLM Image Instance: An instance of a VLMImage config
   *
   * Instances get shared properties from a config while defining their own unique properties, such as position, rotation, scale, etc.
   *
   * @constructor - creates a new instance
   * @returns void
   */
  export class Instance extends VLMBase.Instance {
    constructor(config: Config, instanceConfig: VLMInstanceProperties) {
      super(config, instanceConfig)
      this.init(config, instanceConfig)
    }

    /**
     * @public init
     * initializes the instance
     * @returns void
     */
    init: CallableFunction = (config: Config, instanceConfig: Instance) => {
      Object.assign(this, instanceConfig)

      instances[this.sk] = this

      if (this.customId) {
        instances[this.customId] = instances[this.sk]
      }

      config.services.video.addEntity(this.entity)

      if (!config.enabled || !this.enabled || config.mediaType === DynamicMediaType.NONE) {
        // move this to after the storage is set
        this.remove()
        return
      }

      if (config.mediaType === DynamicMediaType.LIVE) {
        config.startLiveStream()
      } else if (config.mediaType === DynamicMediaType.PLAYLIST) {
        this.startPlaylistVideo()
      } else if (config.mediaType === DynamicMediaType.IMAGE) {
        config.showOffImage()
      }

      // add mesh
      config.services.mesh.set(this.entity, 'plane', this.withCollisions)

      // add transform
      config.services.transform.set(this.entity, {
        position: this.position,
        scale: this.scale,
        rotation: this.rotation,
        parent: config.parent ? instances[config.parent].entity : undefined,
      })

      // add click event
      config.services.clickEvent.set(this.entity, this.clickEvent)
    }
    /**
     * @public add
     * Adds the instance to the engine
     * @returns void
     */

    add: CallableFunction = () => {
      try {
        if (instances[this.sk]) {
          this.init(configs[this.configId], this)
        }
      } catch (error) {
        throw error
      }
    }

    /**
     * @public remove
     *  Removes the config's instances from the engine, keeps the config and instance records so we can bring stuff back
     *  @returns void
     */
    remove: CallableFunction = () => {
      try {
        ecs.engine.removeEntity(this.entity)
      } catch (error) {
        throw error
      }
    }

    /**
     * @public delete
     * Deletes the config's material record AND removes the config's instances from the engine
     * @returns void
     */
    delete: CallableFunction = () => {
      try {
        ecs.engine.removeEntity(this.entity)
        if (instances[this.sk]) {
          delete instances[this.sk]
        }
      } catch (error) {
        throw error
      }
    }
    /**
     * @public startPlaylistVideo
     * Starts a video in the playlist
     * @returns void
     */
    startPlaylistVideo: CallableFunction = () => {
      const config = configs[this.configId]

      config.services.video.setPlayer(this.entity, config.videoOptions)
    }
    /**
     * @public updateTransform
     * Updates the instance's transform
     * @param position - the position of the instance
     * @param scale - the scale of the instance
     * @param rotation - the rotation of the instance
     * @returns void
     *
     */
    updateTransform: CallableFunction = (position?: Vector3, scale?: Vector3, rotation?: Vector3) => {
      const config = configs[this.configId]
      this.position = position || this.position
      this.scale = scale || this.scale
      this.rotation = rotation || this.rotation

      config.services.transform.set(this.entity, {
        position: this.position,
        scale: this.scale,
        rotation: this.rotation,
        parent: this.parent,
      })
    }

    /**
     * @public updateParent
     * Updates the instance's parent
     * @param parent - the parent of the instance
     * @returns void
     *
     */
    updateParent: CallableFunction = (parent: string) => {
      const config = configs[this.configId]
      this.parent = parent

      this.updateTransform(this.position, this.scale, this.rotation)
    }

    /**
     * @public updateClickEvent
     * Updates the instance's click event
     * @param clickEvent - the click event of the instance
     * @returns void
     */
    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.Config) => {
      const config = configs[this.configId]
      this.clickEvent = clickEvent

      config.services.clickEvent.set(this.entity, this.clickEvent)
    }

    /**
     * @public updateVideoOptions
     * Updates the instance's video options
     * @param videoOptions - the video options of the instance
     * @returns void
     */
    updateVideoOptions: CallableFunction = (videoOptions: PBVideoPlayer) => {
      const config = configs[this.configId]
      config.services.video.setPlayer(this.entity, videoOptions)
    }

    /**
     * @public updateTextureOptions
     * Updates the instance's texture options
     * @param textureOptions - the texture options of the instance
     * @returns void
     */
    updateTextureOptions: CallableFunction = (textureOptions: PBMaterial_PbrMaterial) => {
      const config = configs[this.configId]
      config.services.material.set(this.entity, 'basic', textureOptions)
    }

    /**
     * @public updateCollider
     * Updates the instance's collider
     * @param withCollider - the texture options of the instance
     * @returns void
     */
    updateCollider: CallableFunction = (withCollisions: boolean) => {
      const config = configs[this.configId]
      this.withCollisions = withCollisions

      if (withCollisions) {
        config.services.collider.set(this.entity, 'plane')
      } else {
        config.services.collider.clear(this.entity)
      }
    }
  }

  export enum SystemState {
    CREATED,
    INITIALIZING,
    INITIALIZED,
    UPDATING,
    REMOVING,
  }
}
