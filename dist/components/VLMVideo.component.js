import { ecs } from '../environment';
import { VLMBase } from './VLMBase.component';
import { Vector3 } from '@dcl/sdk/math';
import { VideoService } from '../services/Video.service';
import { MaterialService } from '../services/Material.service';
import { MeshService } from '../services/Mesh.service';
import { TransformService } from '../services/Transform.service';
import { ClickEventService } from '../services/ClickEvent.service';
import { VLMDebug } from '../logic/VLMDebug.logic';
import { DynamicMediaType, } from '../shared/interfaces';
import { ColliderService } from '../services/Collider.service';
export var VLMVideo;
(function (VLMVideo) {
    VLMVideo.configs = {};
    VLMVideo.instances = {};
    VLMVideo.reset = () => {
        Object.keys(VLMVideo.configs).forEach((key) => {
            VLMVideo.configs[key].delete();
            delete VLMVideo.configs[key];
        });
        Object.keys(VLMVideo.instances).forEach((key) => {
            delete VLMVideo.instances[key];
        });
    };
    class Config extends VLMBase.Config {
        constructor(config) {
            super(config);
            this.textureOptions = {};
            this.videoOptions = { src: '', playing: true };
            this.enableLiveStream = false;
            this.isLive = false;
            this.liveSrc = '';
            this.playlist = [];
            this.emission = 0;
            this.activePlaylistVideo = 0;
            this.offImageSrc = '';
            this.mediaType = DynamicMediaType.NONE;
            this.offType = DynamicMediaType.NONE;
            this.volume = 1;
            this.setStorage = (config) => {
                try {
                    Object.assign(this, config);
                    VLMVideo.configs[this.sk] = this;
                    if (this.customId) {
                        VLMVideo.configs[this.customId] = VLMVideo.configs[this.sk];
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.init = (config) => {
                try {
                    VLMDebug.log('Storing Video Config', config);
                    if (config) {
                        this.setStorage(config);
                    }
                    else {
                        config = this;
                    }
                    VLMDebug.log('Creating Video Config', config);
                    const originalMediaType = this.mediaType;
                    if (this.liveSrc && this.enableLiveStream && this.isLive) {
                        this.mediaType = DynamicMediaType.LIVE;
                        this.videoOptions.src = this.liveSrc;
                    }
                    else if (this.playlist.length > 0 && this.offType === DynamicMediaType.PLAYLIST) {
                        this.mediaType = DynamicMediaType.PLAYLIST;
                        this.videoOptions.src = this.playlist[this.activePlaylistVideo];
                    }
                    else if (this.offImageSrc && this.offType === DynamicMediaType.IMAGE) {
                        this.mediaType = DynamicMediaType.IMAGE;
                    }
                    else if ((!this.enableLiveStream || !this.isLive) && this.offType === DynamicMediaType.NONE) {
                        this.mediaType = DynamicMediaType.NONE;
                    }
                    if (originalMediaType !== this.mediaType || !this.enabled || !config.enabled) {
                        VLMDebug.log('Video Media Type Changed', originalMediaType, this.mediaType);
                        this.services.video.stop();
                        this.services.video.clearEventSystem();
                    }
                    if (originalMediaType !== this.mediaType && this.mediaType === DynamicMediaType.NONE) {
                        this.remove();
                        return;
                    }
                    VLMDebug.log('Video Media Type', this.mediaType);
                    if (!config?.instances || config.instances.length < 1 || this.mediaType === DynamicMediaType.NONE) {
                        return;
                    }
                    config.instances.forEach((instance) => {
                        this.createOrReplaceInstance(instance);
                    });
                    if (this.playlist.length > 0 && this.offType === DynamicMediaType.PLAYLIST) {
                        this.services.video.initEventSystem(this);
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.addAll = () => {
                try {
                    VLMDebug.log(VLMVideo.instances);
                    this.instanceIds.forEach((instanceId) => {
                        VLMVideo.instances[instanceId].add();
                    });
                }
                catch (error) {
                    throw error;
                }
            };
            this.remove = () => {
                try {
                    if (this.services.video.getVideoState().state === 4) {
                        this.services.video.stop();
                    }
                    this.instanceIds.forEach((instanceId) => {
                        VLMVideo.instances[instanceId].remove();
                    });
                }
                catch (error) {
                    throw error;
                }
            };
            this.delete = () => {
                try {
                    if (this.services.video.getVideoState().state === 4) {
                        this.services.video.stop();
                    }
                    delete VLMVideo.configs[this.sk];
                    this.instanceIds.forEach((instanceId) => {
                        VLMVideo.instances[instanceId].delete();
                    });
                }
                catch (error) {
                    throw error;
                }
            };
            this.createOrReplaceInstance = (config) => {
                if (!this.instanceIds.includes(config.sk)) {
                    this.instanceIds.push(config.sk);
                }
                if (VLMVideo.instances[config.sk]) {
                    ecs.engine.removeEntity(VLMVideo.instances[config.sk].entity);
                    delete VLMVideo.instances[config.sk];
                }
                new Instance(this, config);
            };
            this.removeInstance = (config) => {
                if (VLMVideo.instances[config.sk]) {
                    ecs.engine.removeEntity(VLMVideo.instances[config.sk].entity);
                }
            };
            this.deleteInstance = (_instanceId) => {
                if (!this.instanceIds.includes(_instanceId)) {
                    this.instanceIds = this.instanceIds.filter((instanceId) => instanceId !== _instanceId);
                }
                if (VLMVideo.instances[_instanceId]) {
                    ecs.engine.removeEntity(VLMVideo.instances[_instanceId].entity);
                    delete VLMVideo.instances[_instanceId];
                }
            };
            this.setLiveState = (state) => {
                if (this.isLive === state)
                    return;
                this.isLive = state;
                this.init(this);
            };
            this.setLiveSrc = (src) => {
                if (this.liveSrc === src)
                    return;
                this.liveSrc = src;
                if (this.isLive) {
                    this.init(this);
                }
            };
            this.setPlaylist = (playlist) => {
                const currentlyPlaying = `${this.playlist[this.activePlaylistVideo]}`;
                if (playlist.every((src) => this.playlist.includes(src)))
                    return;
                this.playlist = playlist;
                if (this.playlist.includes(currentlyPlaying)) {
                    this.activePlaylistVideo = this.playlist.indexOf(currentlyPlaying);
                    this.services.video.clearEventSystem();
                    this.services.video.initEventSystem(this);
                }
                else {
                    this.activePlaylistVideo = 0;
                    this.services.video.clearEventSystem();
                    this.init(this);
                }
            };
            this.startLiveStream = () => {
                if (this.liveSrc) {
                    this.videoOptions.src = this.liveSrc;
                    this.services.video.setPlayer(null, this.videoOptions);
                }
                else {
                    VLMDebug.log('error', 'Tried to start live stream but no url was provided');
                }
            };
            this.startPlaylistVideo = (activePlaylistVideo) => {
                this.activePlaylistVideo = activePlaylistVideo || 0;
                if (this.activePlaylistVideo >= this.playlist.length) {
                    this.activePlaylistVideo = 0;
                }
                this.videoOptions.src = this.playlist[this.activePlaylistVideo];
                this.videoOptions.loop = this.playlist.length == 1;
                this.services.video.setPlayer(null, this.videoOptions);
            };
            this.showOffImage = () => {
                this.services.video.clearEventSystem();
                this.services.video.clear();
                this.services.material.buildOptions({ textureSrc: this.offImageSrc, emission: this.emission });
                this.services.video.setAllImageTextures(this);
                VLMDebug.log('showing off image', this.textureOptions);
            };
            this.services = {
                collider: new ColliderService(),
                material: new MaterialService(),
                mesh: new MeshService(),
                transform: new TransformService(),
                clickEvent: new ClickEventService(),
                video: new VideoService(),
            };
            if (config?.instances?.length) {
                config.instances.forEach((instance) => {
                    this.createOrReplaceInstance(instance);
                });
            }
            if (this.customRendering) {
                this.setStorage(config);
                return;
            }
            this.init(config);
        }
    }
    VLMVideo.Config = Config;
    class Instance extends VLMBase.Instance {
        constructor(config, instanceConfig) {
            super(config, instanceConfig);
            this.setStorage = (config) => {
                try {
                    Object.assign(this, config);
                    VLMVideo.instances[this.sk] = this;
                    if (this.customId) {
                        VLMVideo.instances[this.customId] = VLMVideo.instances[this.sk];
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.init = (config, instanceConfig) => {
                if (instanceConfig) {
                    this.setStorage(instanceConfig);
                }
                else {
                    instanceConfig = this;
                }
                if (!this.enabled || !config.enabled) {
                    return;
                }
                config.services.video.addEntity(this.entity);
                if (config.mediaType === DynamicMediaType.LIVE) {
                    config.startLiveStream();
                }
                else if (config.mediaType === DynamicMediaType.PLAYLIST) {
                    this.startPlaylistVideo();
                }
                else if (config.mediaType === DynamicMediaType.IMAGE) {
                    config.showOffImage();
                }
                config.services.mesh.set(this.entity, 'plane');
                config.services.collider.set(this.entity, 'plane', this.withCollisions || config.withCollisions, !!this.clickEvent);
                config.services.transform.set(this.entity, {
                    position: this.position,
                    scale: { ...this.scale, z: 0.01 },
                    rotation: this.rotation,
                    parent: config.parent ? VLMVideo.instances[config.parent].entity : undefined,
                });
                config.services.clickEvent.set(this.entity, this.clickEvent);
            };
            this.add = () => {
                try {
                    if (VLMVideo.instances[this.sk]) {
                        this.init(VLMVideo.configs[this.configId], this);
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.remove = () => {
                try {
                    ecs.engine.removeEntity(this.entity);
                }
                catch (error) {
                    throw error;
                }
            };
            this.delete = () => {
                try {
                    ecs.engine.removeEntity(this.entity);
                    if (VLMVideo.instances[this.sk]) {
                        delete VLMVideo.instances[this.sk];
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.startPlaylistVideo = () => {
                const config = VLMVideo.configs[this.configId];
                config.services.video.setPlayer(this.entity, config.videoOptions);
            };
            this.updateTransform = (position, scale, rotation) => {
                const config = VLMVideo.configs[this.configId];
                this.position = position || this.position;
                this.scale = scale || this.scale;
                this.rotation = rotation || this.rotation;
                config.services.transform.set(this.entity, {
                    position: this.position,
                    scale: { ...this.scale, z: 0.01 },
                    rotation: this.rotation,
                    parent: this.parent,
                });
            };
            this.updateParent = (parent) => {
                const config = VLMVideo.configs[this.configId];
                this.parent = parent;
                this.updateTransform(this.position, this.scale, this.rotation);
            };
            this.updateClickEvent = (clickEvent) => {
                const config = VLMVideo.configs[this.configId];
                this.clickEvent = clickEvent;
                config.services.clickEvent.set(this.entity, this.clickEvent);
            };
            this.updateVideoOptions = (videoOptions) => {
                const config = VLMVideo.configs[this.configId];
                config.services.video.setPlayer(this.entity, videoOptions);
            };
            this.updateTextureOptions = (textureOptions) => {
                const config = VLMVideo.configs[this.configId];
                config.services.material.set(this.entity, 'pbr', textureOptions);
            };
            this.updateCollider = (withCollisions) => {
                const config = VLMVideo.configs[this.configId];
                this.withCollisions = withCollisions;
                if (withCollisions || this.clickEvent) {
                    config.services.collider.set(this.entity, 'plane', withCollisions, this.clickEvent);
                }
                else {
                    config.services.collider.clear(this.entity);
                }
            };
            if (!this.customRendering) {
                this.init(config, instanceConfig);
            }
            else {
                this.setStorage(instanceConfig);
            }
        }
    }
    VLMVideo.Instance = Instance;
    let SystemState;
    (function (SystemState) {
        SystemState[SystemState["CREATED"] = 0] = "CREATED";
        SystemState[SystemState["INITIALIZING"] = 1] = "INITIALIZING";
        SystemState[SystemState["INITIALIZED"] = 2] = "INITIALIZED";
        SystemState[SystemState["UPDATING"] = 3] = "UPDATING";
        SystemState[SystemState["REMOVING"] = 4] = "REMOVING";
    })(SystemState = VLMVideo.SystemState || (VLMVideo.SystemState = {}));
})(VLMVideo || (VLMVideo = {}));
export class QuickVideoScreen {
    constructor(config) {
        this.entity = ecs.engine.addEntity();
        this.mediaType = DynamicMediaType.NONE;
        this.services = {
            material: new MaterialService(),
            mesh: new MeshService(),
            collider: new ColliderService(),
            transform: new TransformService(),
            clickEvent: new ClickEventService(),
            video: new VideoService(),
        };
        new VLMVideo.Config({
            pk: '',
            sk: '',
            name: '',
            enabled: true,
            offType: DynamicMediaType.PLAYLIST,
            enableLiveStream: config.liveUrl ? true : false,
            liveSrc: config.liveUrl,
            playlist: config.playlist || [],
            instances: [
                {
                    pk: '',
                    sk: '',
                    name: '',
                    position: config.position,
                    scale: config.scale || Vector3.create(16 / 2, 9 / 2, 0.01),
                    rotation: config.rotation || Vector3.Zero(),
                    parent: config.parent,
                    enabled: true,
                },
            ],
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxNVmlkZW8uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvVkxNVmlkZW8uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUVwQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFHN0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFBO0FBQzlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQTtBQUN0RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUNoRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDbEQsT0FBTyxFQUNMLGdCQUFnQixHQVFqQixNQUFNLHNCQUFzQixDQUFBO0FBQzdCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQTtBQUU5RCxNQUFNLEtBQVcsUUFBUSxDQThrQnhCO0FBOWtCRCxXQUFpQixRQUFRO0lBQ1YsZ0JBQU8sR0FBK0IsRUFBRSxDQUFBO0lBQ3hDLGtCQUFTLEdBQWlDLEVBQUUsQ0FBQTtJQUk1QyxjQUFLLEdBQUcsR0FBRyxFQUFFO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBQSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRTtZQUMzQyxTQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtZQUNyQixPQUFPLFNBQUEsT0FBTyxDQUFDLEdB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ICcuLi9lbnZpcm9ubWVudCdcclxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSAnQGRjbC9zZGsvZWNzJ1xyXG5pbXBvcnQgeyBWTE1CYXNlIH0gZnJvbSAnLi9WTE1CYXNlLmNvbXBvbmVudCdcclxuaW1wb3J0IHsgVkxNQ2xpY2tFdmVudCB9IGZyb20gJy4vVkxNQ2xpY2tFdmVudC5jb21wb25lbnQnXHJcbmltcG9ydCB7IFBCTWF0ZXJpYWxfUGJyTWF0ZXJpYWwsIFBCVmlkZW9QbGF5ZXIsIFZpZGVvU3RhdGUgfSBmcm9tICdAZGNsL3Nkay9lY3MnXHJcbmltcG9ydCB7IFZlY3RvcjMgfSBmcm9tICdAZGNsL3Nkay9tYXRoJ1xyXG5pbXBvcnQgeyBWaWRlb1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9WaWRlby5zZXJ2aWNlJ1xyXG5pbXBvcnQgeyBNYXRlcmlhbFNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9NYXRlcmlhbC5zZXJ2aWNlJ1xyXG5pbXBvcnQgeyBNZXNoU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL01lc2guc2VydmljZSdcclxuaW1wb3J0IHsgVHJhbnNmb3JtU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL1RyYW5zZm9ybS5zZXJ2aWNlJ1xyXG5pbXBvcnQgeyBDbGlja0V2ZW50U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL0NsaWNrRXZlbnQuc2VydmljZSdcclxuaW1wb3J0IHsgVkxNRGVidWcgfSBmcm9tICcuLi9sb2dpYy9WTE1EZWJ1Zy5sb2dpYydcclxuaW1wb3J0IHtcclxuICBEeW5hbWljTWVkaWFUeXBlLFxyXG4gIFZMTUF1ZGlibGUsXHJcbiAgVkxNQmFzZVByb3BlcnRpZXMsXHJcbiAgVkxNQ2xpY2thYmxlLFxyXG4gIFZMTUR5bmFtaWNNZWRpYSxcclxuICBWTE1JbnN0YW5jZVByb3BlcnRpZXMsXHJcbiAgVkxNSW5zdGFuY2VkSXRlbSxcclxuICBWTE1UZXh0dXJlT3B0aW9ucyxcclxufSBmcm9tICcuLi9zaGFyZWQvaW50ZXJmYWNlcydcclxuaW1wb3J0IHsgQ29sbGlkZXJTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvQ29sbGlkZXIuc2VydmljZSdcclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgVkxNVmlkZW8ge1xyXG4gIGV4cG9ydCBjb25zdCBjb25maWdzOiB7IFt1dWlkOiBzdHJpbmddOiBDb25maWcgfSA9IHt9XHJcbiAgZXhwb3J0IGNvbnN0IGluc3RhbmNlczogeyBbdXVpZDogc3RyaW5nXTogSW5zdGFuY2UgfSA9IHt9XHJcblxyXG4gIGV4cG9ydCB0eXBlIFZMTUNvbmZpZyA9IFZMTUJhc2VQcm9wZXJ0aWVzICYgVkxNQ2xpY2thYmxlICYgVkxNQXVkaWJsZSAmIFZMTUR5bmFtaWNNZWRpYSAmIFZMTVRleHR1cmVPcHRpb25zICYgVkxNSW5zdGFuY2VkSXRlbVxyXG5cclxuICBleHBvcnQgY29uc3QgcmVzZXQgPSAoKSA9PiB7XHJcbiAgICBPYmplY3Qua2V5cyhjb25maWdzKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xyXG4gICAgICBjb25maWdzW2tleV0uZGVsZXRlKClcclxuICAgICAgZGVsZXRlIGNvbmZpZ3Nba2V5XVxyXG4gICAgfSlcclxuICAgIE9iamVjdC5rZXlzKGluc3RhbmNlcykuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcclxuICAgICAgZGVsZXRlIGluc3RhbmNlc1trZXldXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIFZMTSBJbWFnZSBDb25maWc6IEEgY29uZmlnIGZvciBWTE1JbWFnZSBjb21wb25lbnRzXHJcbiAgICpcclxuICAgKiBDb25maWdzIGFyZSB1c2VkIHRvIGRlZmluZSBwcm9wZXJ0aWVzIHNoYXJlZCBieSBtdWx0aXBsZSBpbnN0YW5jZXMsIHN1Y2ggYXMgbWF0ZXJpYWxzLCB0ZXh0dXJlcywgZmlsZXMsIGV0Yy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB0ZXh0dXJlT3B0aW9ucyAtIGFuIG9iamVjdCBvZiB0ZXh0dXJlcyBmb3IgdGhlIGltYWdlXHJcbiAgICogQHBhcmFtIHZpZGVvT3B0aW9ucyAtIGFuIG9iamVjdCBvZiBvcHRpb25zIGZvciB0aGUgdmlkZW8gc291cmNlXHJcbiAgICogQHBhcmFtIHNlcnZpY2VzIC0gYW4gb2JqZWN0IG9mIHNlcnZpY2VzIHVzZWQgYnkgdGhlIGNvbmZpZ1xyXG4gICAqIEBwYXJhbSBlbmFibGVMaXZlU3RyZWFtIC0gd2hldGhlciBvciBub3QgdG8gZW5hYmxlIGxpdmUgc3RyZWFtaW5nXHJcbiAgICogQHBhcmFtIGluc3RhbmNlcyAtIGFuIGFycmF5IG9mIGluc3RhbmNlIGNvbmZpZ3NcclxuICAgKiBAcGFyYW0gaXNMaXZlIC0gd2hldGhlciBvciBub3QgdGhlIHZpZGVvIGlzIGxpdmVcclxuICAgKiBAcGFyYW0gbGl2ZVNyYyAtIHRoZSBsaXZlIHNvdXJjZSBvZiB0aGUgdmlkZW9cclxuICAgKiBAcGFyYW0gcGxheWxpc3QgLSBhbiBhcnJheSBvZiB2aWRlbyBzb3VyY2VzXHJcbiAgICogQHBhcmFtIGFjdGl2ZVBsYXlsaXN0VmlkZW8gLSB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgdmlkZW8gaW4gdGhlIHBsYXlsaXN0XHJcbiAgICogQHBhcmFtIG9mZkltYWdlU3JjIC0gdGhlIGltYWdlIHNvdXJjZSB0byBkaXNwbGF5IHdoZW4gdGhlIHZpZGVvIGlzIG9mZlxyXG4gICAqIEBwYXJhbSBvZmZUeXBlIC0gdGhlIHR5cGUgb2YgbWVkaWEgdG8gZGlzcGxheSB3aGVuIHRoZSB2aWRlbyBpcyBvZmZcclxuICAgKiBAcGFyYW0gdm9sdW1lIC0gdGhlIHZvbHVtZSBvZiB0aGUgdmlkZW9cclxuICAgKlxyXG4gICAqXHJcbiAgICogQGNvbnN0cnVjdG9yIC0gY3JlYXRlcyBhIG5ldyBjb25maWdcclxuICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIENvbmZpZyBleHRlbmRzIFZMTUJhc2UuQ29uZmlnIHtcclxuICAgIHRleHR1cmVPcHRpb25zOiBQQk1hdGVyaWFsX1Bick1hdGVyaWFsID0ge31cclxuICAgIHZpZGVvT3B0aW9uczogUEJWaWRlb1BsYXllciA9IHsgc3JjOiAnJywgcGxheWluZzogdHJ1ZSB9XHJcbiAgICBzZXJ2aWNlczoge1xyXG4gICAgICBjb2xsaWRlcjogQ29sbGlkZXJTZXJ2aWNlXHJcbiAgICAgIG1hdGVyaWFsOiBNYXRlcmlhbFNlcnZpY2VcclxuICAgICAgbWVzaDogTWVzaFNlcnZpY2VcclxuICAgICAgdHJhbnNmb3JtOiBUcmFuc2Zvcm1TZXJ2aWNlXHJcbiAgICAgIGNsaWNrRXZlbnQ6IENsaWNrRXZlbnRTZXJ2aWNlXHJcbiAgICAgIHZpZGVvOiBWaWRlb1NlcnZpY2VcclxuICAgIH1cclxuICAgIGVuYWJsZUxpdmVTdHJlYW0/OiBib29sZWFuID0gZmFsc2VcclxuICAgIGlzTGl2ZTogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICBsaXZlU3JjPzogc3RyaW5nID0gJydcclxuICAgIHBsYXlsaXN0OiBzdHJpbmdbXSA9IFtdXHJcbiAgICBlbWlzc2lvbj86IG51bWJlciA9IDBcclxuICAgIGFjdGl2ZVBsYXlsaXN0VmlkZW86IG51bWJlciA9IDBcclxuICAgIG9mZkltYWdlU3JjPzogc3RyaW5nID0gJydcclxuICAgIG1lZGlhVHlwZT86IER5bmFtaWNNZWRpYVR5cGUgPSBEeW5hbWljTWVkaWFUeXBlLk5PTkVcclxuICAgIG9mZlR5cGU/OiBEeW5hbWljTWVkaWFUeXBlID0gRHluYW1pY01lZGlhVHlwZS5OT05FXHJcbiAgICB2b2x1bWU/OiBudW1iZXIgPSAxXHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBWTE1Db25maWcpIHtcclxuICAgICAgc3VwZXIoY29uZmlnKVxyXG4gICAgICB0aGlzLnNlcnZpY2VzID0ge1xyXG4gICAgICAgIGNvbGxpZGVyOiBuZXcgQ29sbGlkZXJTZXJ2aWNlKCksXHJcbiAgICAgICAgbWF0ZXJpYWw6IG5ldyBNYXRlcmlhbFNlcnZpY2UoKSxcclxuICAgICAgICBtZXNoOiBuZXcgTWVzaFNlcnZpY2UoKSxcclxuICAgICAgICB0cmFuc2Zvcm06IG5ldyBUcmFuc2Zvcm1TZXJ2aWNlKCksXHJcbiAgICAgICAgY2xpY2tFdmVudDogbmV3IENsaWNrRXZlbnRTZXJ2aWNlKCksXHJcbiAgICAgICAgdmlkZW86IG5ldyBWaWRlb1NlcnZpY2UoKSxcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGNvbmZpZz8uaW5zdGFuY2VzPy5sZW5ndGgpIHtcclxuICAgICAgICBjb25maWcuaW5zdGFuY2VzLmZvckVhY2goKGluc3RhbmNlOiBWTE1JbnN0YW5jZVByb3BlcnRpZXMpID0+IHtcclxuICAgICAgICAgIHRoaXMuY3JlYXRlT3JSZXBsYWNlSW5zdGFuY2UoaW5zdGFuY2UpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5jdXN0b21SZW5kZXJpbmcpIHtcclxuICAgICAgICB0aGlzLnNldFN0b3JhZ2UoY29uZmlnKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaW5pdChjb25maWcpXHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3RvcmFnZTogQ2FsbGFibGVGdW5jdGlvbiA9IChjb25maWc6IFZMTUNvbmZpZykgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgY29uZmlnKVxyXG5cclxuICAgICAgICBjb25maWdzW3RoaXMuc2tdID0gdGhpc1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jdXN0b21JZCkge1xyXG4gICAgICAgICAgY29uZmlnc1t0aGlzLmN1c3RvbUlkXSA9IGNvbmZpZ3NbdGhpcy5za11cclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgZXJyb3JcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyBpbml0XHJcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIGluaXQ6IENhbGxhYmxlRnVuY3Rpb24gPSAoY29uZmlnPzogVkxNQ29uZmlnKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgVkxNRGVidWcubG9nKCdTdG9yaW5nIFZpZGVvIENvbmZpZycsIGNvbmZpZylcclxuICAgICAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3JhZ2UoY29uZmlnKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25maWcgPSB0aGlzXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBWTE1EZWJ1Zy5sb2coJ0NyZWF0aW5nIFZpZGVvIENvbmZpZycsIGNvbmZpZylcclxuICAgICAgICBjb25zdCBvcmlnaW5hbE1lZGlhVHlwZSA9IHRoaXMubWVkaWFUeXBlXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxpdmVTcmMgJiYgdGhpcy5lbmFibGVMaXZlU3RyZWFtICYmIHRoaXMuaXNMaXZlKSB7XHJcbiAgICAgICAgICAvLyBpZiBsaXZlIHN0cmVhbSBleGlzdHMsIGlzIGVuYWJsZWQsIGFuZCBpcyBsaXZlXHJcbiAgICAgICAgICAvLyBzZXQgdGhlIHZpZGVvIHNvdXJjZSB0byB0aGUgbGl2ZSBzb3VyY2VcclxuICAgICAgICAgIHRoaXMubWVkaWFUeXBlID0gRHluYW1pY01lZGlhVHlwZS5MSVZFXHJcbiAgICAgICAgICB0aGlzLnZpZGVvT3B0aW9ucy5zcmMgPSB0aGlzLmxpdmVTcmNcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGxheWxpc3QubGVuZ3RoID4gMCAmJiB0aGlzLm9mZlR5cGUgPT09IER5bmFtaWNNZWRpYVR5cGUuUExBWUxJU1QpIHtcclxuICAgICAgICAgIC8vIGlmIHBsYXlsaXN0IGV4aXN0c1xyXG4gICAgICAgICAgLy8gc2V0IHRoZSB2aWRlbyBzb3VyY2UgdG8gdGhlIGN1cnJlbnQgdmlkZW8gaW4gdGhlIHBsYXlsaXN0XHJcbiAgICAgICAgICB0aGlzLm1lZGlhVHlwZSA9IER5bmFtaWNNZWRpYVR5cGUuUExBWUxJU1RcclxuICAgICAgICAgIHRoaXMudmlkZW9PcHRpb25zLnNyYyA9IHRoaXMucGxheWxpc3RbdGhpcy5hY3RpdmVQbGF5bGlzdFZpZGVvXVxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vZmZJbWFnZVNyYyAmJiB0aGlzLm9mZlR5cGUgPT09IER5bmFtaWNNZWRpYVR5cGUuSU1BR0UpIHtcclxuICAgICAgICAgIC8vIGlmIG9mZiBpbWFnZSBleGlzdHNcclxuICAgICAgICAgIC8vIHNldCB0aGUgdmlkZW8gc291cmNlIHRvIHRoZSBvZmYgaW1hZ2VcclxuICAgICAgICAgIHRoaXMubWVkaWFUeXBlID0gRHluYW1pY01lZGlhVHlwZS5JTUFHRVxyXG4gICAgICAgIH0gZWxzZSBpZiAoKCF0aGlzLmVuYWJsZUxpdmVTdHJlYW0gfHwgIXRoaXMuaXNMaXZlKSAmJiB0aGlzLm9mZlR5cGUgPT09IER5bmFtaWNNZWRpYVR5cGUuTk9ORSkge1xyXG4gICAgICAgICAgLy8gaWYgbm8gb2ZmIGltYWdlIGV4aXN0c1xyXG4gICAgICAgICAgLy8gc2V0IHRoZSB2aWRlbyBzb3VyY2UgdG8gdGhlIG9mZiBpbWFnZVxyXG4gICAgICAgICAgdGhpcy5tZWRpYVR5cGUgPSBEeW5hbWljTWVkaWFUeXBlLk5PTkVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvcmlnaW5hbE1lZGlhVHlwZSAhPT0gdGhpcy5tZWRpYVR5cGUgfHwgIXRoaXMuZW5hYmxlZCB8fCAhY29uZmlnLmVuYWJsZWQpIHtcclxuICAgICAgICAgIFZMTURlYnVnLmxvZygnVmlkZW8gTWVkaWEgVHlwZSBDaGFuZ2VkJywgb3JpZ2luYWxNZWRpYVR5cGUsIHRoaXMubWVkaWFUeXBlKVxyXG4gICAgICAgICAgdGhpcy5zZXJ2aWNlcy52aWRlby5zdG9wKClcclxuICAgICAgICAgIHRoaXMuc2VydmljZXMudmlkZW8uY2xlYXJFdmVudFN5c3RlbSgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3JpZ2luYWxNZWRpYVR5cGUgIT09IHRoaXMubWVkaWFUeXBlICYmIHRoaXMubWVkaWFUeXBlID09PSBEeW5hbWljTWVkaWFUeXBlLk5PTkUpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlKClcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVkxNRGVidWcubG9nKCdWaWRlbyBNZWRpYSBUeXBlJywgdGhpcy5tZWRpYVR5cGUpXHJcblxyXG4gICAgICAgIGlmICghY29uZmlnPy5pbnN0YW5jZXMgfHwgY29uZmlnLmluc3RhbmNlcy5sZW5ndGggPCAxIHx8IHRoaXMubWVkaWFUeXBlID09PSBEeW5hbWljTWVkaWFUeXBlLk5PTkUpIHtcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnLmluc3RhbmNlcy5mb3JFYWNoKChpbnN0YW5jZTogVkxNSW5zdGFuY2VQcm9wZXJ0aWVzKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNyZWF0ZU9yUmVwbGFjZUluc3RhbmNlKGluc3RhbmNlKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgaWYgKHRoaXMucGxheWxpc3QubGVuZ3RoID4gMCAmJiB0aGlzLm9mZlR5cGUgPT09IER5bmFtaWNNZWRpYVR5cGUuUExBWUxJU1QpIHtcclxuICAgICAgICAgIHRoaXMuc2VydmljZXMudmlkZW8uaW5pdEV2ZW50U3lzdGVtKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIHRocm93IGVycm9yXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgYWRkQWxsXHJcbiAgICAgKiBBZGRzIGFsbCBvZiB0aGUgY29uZmlnJ3MgaW5zdGFuY2VzIHRvIHRoZSBlbmdpbmVcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG5cclxuICAgIGFkZEFsbDogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBWTE1EZWJ1Zy5sb2coaW5zdGFuY2VzKVxyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VJZHMuZm9yRWFjaCgoaW5zdGFuY2VJZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICBpbnN0YW5jZXNbaW5zdGFuY2VJZF0uYWRkKClcclxuICAgICAgICB9KVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIHRocm93IGVycm9yXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgcmVtb3ZlXHJcbiAgICAgKiAgUmVtb3ZlcyB0aGUgY29uZmlnJ3MgaW5zdGFuY2VzIGZyb20gdGhlIGVuZ2luZSwga2VlcHMgdGhlIGNvbmZpZyBhbmQgaW5zdGFuY2UgcmVjb3JkcyBzbyB3ZSBjYW4gYnJpbmcgc3R1ZmYgYmFja1xyXG4gICAgICogIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlcnZpY2VzLnZpZGVvLmdldFZpZGVvU3RhdGUoKS5zdGF0ZSA9PT0gVmlkZW9TdGF0ZS5WU19QTEFZSU5HKSB7XHJcbiAgICAgICAgICB0aGlzLnNlcnZpY2VzLnZpZGVvLnN0b3AoKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluc3RhbmNlSWRzLmZvckVhY2goKGluc3RhbmNlSWQ6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgaW5zdGFuY2VzW2luc3RhbmNlSWRdLnJlbW92ZSgpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIGRlbGV0ZVxyXG4gICAgICogRGVsZXRlcyB0aGUgY29uZmlnJ3MgbWF0ZXJpYWwgcmVjb3JkIEFORCByZW1vdmVzIHRoZSBjb25maWcncyBpbnN0YW5jZXMgZnJvbSB0aGUgZW5naW5lXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZTogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAodGhpcy5zZXJ2aWNlcy52aWRlby5nZXRWaWRlb1N0YXRlKCkuc3RhdGUgPT09IFZpZGVvU3RhdGUuVlNfUExBWUlORykge1xyXG4gICAgICAgICAgdGhpcy5zZXJ2aWNlcy52aWRlby5zdG9wKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVsZXRlIGNvbmZpZ3NbdGhpcy5za11cclxuICAgICAgICB0aGlzLmluc3RhbmNlSWRzLmZvckVhY2goKGluc3RhbmNlSWQ6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgaW5zdGFuY2VzW2luc3RhbmNlSWRdLmRlbGV0ZSgpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIGNyZWF0ZU9yUmVwbGFjZUluc3RhbmNlXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWdcclxuICAgICAqIEBwYXJhbSBjb25maWcgLSB0aGUgaW5zdGFuY2UgY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZU9yUmVwbGFjZUluc3RhbmNlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKGNvbmZpZzogVkxNSW5zdGFuY2VQcm9wZXJ0aWVzKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5pbnN0YW5jZUlkcy5pbmNsdWRlcyhjb25maWcuc2spKSB7XHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZUlkcy5wdXNoKGNvbmZpZy5zaylcclxuICAgICAgfVxyXG4gICAgICAvL3JlcGxhY2UgaW5zdGFuY2UgaWYgaXQgYWxyZWFkeSBleGlzdHNcclxuICAgICAgaWYgKGluc3RhbmNlc1tjb25maWcuc2tdKSB7XHJcbiAgICAgICAgZWNzLmVuZ2luZS5yZW1vdmVFbnRpdHkoaW5zdGFuY2VzW2NvbmZpZy5za10uZW50aXR5KVxyXG4gICAgICAgIGRlbGV0ZSBpbnN0YW5jZXNbY29uZmlnLnNrXVxyXG4gICAgICB9XHJcbiAgICAgIG5ldyBJbnN0YW5jZSh0aGlzLCBjb25maWcpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIGNyZWF0ZU9yUmVwbGFjZUluc3RhbmNlXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWdcclxuICAgICAqIEBwYXJhbSBjb25maWcgLSB0aGUgaW5zdGFuY2UgY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUluc3RhbmNlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKGNvbmZpZzogSW5zdGFuY2UpID0+IHtcclxuICAgICAgLy9yZXBsYWNlIGluc3RhbmNlIGlmIGl0IGFscmVhZHkgZXhpc3RzXHJcbiAgICAgIGlmIChpbnN0YW5jZXNbY29uZmlnLnNrXSkge1xyXG4gICAgICAgIGVjcy5lbmdpbmUucmVtb3ZlRW50aXR5KGluc3RhbmNlc1tjb25maWcuc2tdLmVudGl0eSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyBkZWxldGVJbnN0YW5jZVxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnXHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gdGhlIGluc3RhbmNlIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgdm9pZFxyXG4gICAgICovXHJcbiAgICBkZWxldGVJbnN0YW5jZTogQ2FsbGFibGVGdW5jdGlvbiA9IChfaW5zdGFuY2VJZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5pbnN0YW5jZUlkcy5pbmNsdWRlcyhfaW5zdGFuY2VJZCkpIHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlSWRzID0gdGhpcy5pbnN0YW5jZUlkcy5maWx0ZXIoKGluc3RhbmNlSWQ6IHN0cmluZykgPT4gaW5zdGFuY2VJZCAhPT0gX2luc3RhbmNlSWQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vcmVwbGFjZSBpbnN0YW5jZSBpZiBpdCBhbHJlYWR5IGV4aXN0c1xyXG4gICAgICBpZiAoaW5zdGFuY2VzW19pbnN0YW5jZUlkXSkge1xyXG4gICAgICAgIGVjcy5lbmdpbmUucmVtb3ZlRW50aXR5KGluc3RhbmNlc1tfaW5zdGFuY2VJZF0uZW50aXR5KVxyXG4gICAgICAgIGRlbGV0ZSBpbnN0YW5jZXNbX2luc3RhbmNlSWRdXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgc2V0TGl2ZVN0YXRlXHJcbiAgICAgKiBTZXRzIHRoZSBsaXZlIHN0YXRlIG9mIHRoZSBjb25maWdcclxuICAgICAqIEBwYXJhbSBzdGF0ZSAtIHRoZSBzdGF0ZSB0byBzZXRcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgc2V0TGl2ZVN0YXRlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKHN0YXRlOiBib29sZWFuKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmlzTGl2ZSA9PT0gc3RhdGUpIHJldHVyblxyXG4gICAgICB0aGlzLmlzTGl2ZSA9IHN0YXRlXHJcbiAgICAgIHRoaXMuaW5pdCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyBzZXRMaXZlU3JjXHJcbiAgICAgKiBTZXRzIHRoZSBsaXZlIHNvdXJjZSBvZiB0aGUgY29uZmlnXHJcbiAgICAgKiBAcGFyYW0gc3JjIC0gdGhlIHNvdXJjZSB0byBzZXRcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgc2V0TGl2ZVNyYzogQ2FsbGFibGVGdW5jdGlvbiA9IChzcmM6IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAodGhpcy5saXZlU3JjID09PSBzcmMpIHJldHVyblxyXG4gICAgICB0aGlzLmxpdmVTcmMgPSBzcmNcclxuXHJcbiAgICAgIGlmICh0aGlzLmlzTGl2ZSkge1xyXG4gICAgICAgIHRoaXMuaW5pdCh0aGlzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIHNldFBsYXlsaXN0XHJcbiAgICAgKiBTZXRzIHRoZSBwbGF5bGlzdCBvZiB0aGUgY29uZmlnXHJcbiAgICAgKiBAcGFyYW0gcGxheWxpc3QgLSB0aGUgcGxheWxpc3QgdG8gc2V0XHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHNldFBsYXlsaXN0OiBDYWxsYWJsZUZ1bmN0aW9uID0gKHBsYXlsaXN0OiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgICBjb25zdCBjdXJyZW50bHlQbGF5aW5nID0gYCR7dGhpcy5wbGF5bGlzdFt0aGlzLmFjdGl2ZVBsYXlsaXN0VmlkZW9dfWBcclxuICAgICAgLy8gY2hlY2sgaWYgcGxheWxpc3QgaGFzIGNoYW5nZWRcclxuICAgICAgaWYgKHBsYXlsaXN0LmV2ZXJ5KChzcmM6IHN0cmluZykgPT4gdGhpcy5wbGF5bGlzdC5pbmNsdWRlcyhzcmMpKSkgcmV0dXJuXHJcbiAgICAgIHRoaXMucGxheWxpc3QgPSBwbGF5bGlzdFxyXG5cclxuICAgICAgLy8gY2hlY2sgaWYgY3VycmVudGx5IHBsYXlpbmcgdmlkZW8gaXMgc3RpbGwgaW4gcGxheWxpc3RcclxuICAgICAgaWYgKHRoaXMucGxheWxpc3QuaW5jbHVkZXMoY3VycmVudGx5UGxheWluZykpIHtcclxuICAgICAgICAvLyBpZiBzbywgc2V0IHRoZSBwbGF5bGlzdCBpbmRleCB0byB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRseSBwbGF5aW5nIHZpZGVvXHJcbiAgICAgICAgdGhpcy5hY3RpdmVQbGF5bGlzdFZpZGVvID0gdGhpcy5wbGF5bGlzdC5pbmRleE9mKGN1cnJlbnRseVBsYXlpbmcpXHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy52aWRlby5jbGVhckV2ZW50U3lzdGVtKCk7XHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy52aWRlby5pbml0RXZlbnRTeXN0ZW0odGhpcyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gaWYgbm90LCBzZXQgdGhlIHBsYXlsaXN0IGluZGV4IHRvIDAgYW5kIHJlLWluaXRcclxuICAgICAgICB0aGlzLmFjdGl2ZVBsYXlsaXN0VmlkZW8gPSAwXHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlcy52aWRlby5jbGVhckV2ZW50U3lzdGVtKCk7XHJcbiAgICAgICAgdGhpcy5pbml0KHRoaXMpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgc3RhcnRMaXZlU3RyZWFtXHJcbiAgICAgKiBTdGFydHMgdGhlIGxpdmUgc3RyZWFtXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0TGl2ZVN0cmVhbTogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgaWYgKHRoaXMubGl2ZVNyYykge1xyXG4gICAgICAgIHRoaXMudmlkZW9PcHRpb25zLnNyYyA9IHRoaXMubGl2ZVNyY1xyXG4gICAgICAgIHRoaXMuc2VydmljZXMudmlkZW8uc2V0UGxheWVyKG51bGwsIHRoaXMudmlkZW9PcHRpb25zKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFZMTURlYnVnLmxvZygnZXJyb3InLCAnVHJpZWQgdG8gc3RhcnQgbGl2ZSBzdHJlYW0gYnV0IG5vIHVybCB3YXMgcHJvdmlkZWQnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIHN0YXJ0UGxheWxpc3RWaWRlb1xyXG4gICAgICogU3RhcnRzIGEgdmlkZW8gaW4gdGhlIHBsYXlsaXN0XHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0UGxheWxpc3RWaWRlbzogQ2FsbGFibGVGdW5jdGlvbiA9IChhY3RpdmVQbGF5bGlzdFZpZGVvPzogbnVtYmVyKSA9PiB7XHJcbiAgICAgIHRoaXMuYWN0aXZlUGxheWxpc3RWaWRlbyA9IGFjdGl2ZVBsYXlsaXN0VmlkZW8gfHwgMFxyXG5cclxuICAgICAgaWYgKHRoaXMuYWN0aXZlUGxheWxpc3RWaWRlbyA+PSB0aGlzLnBsYXlsaXN0Lmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlUGxheWxpc3RWaWRlbyA9IDBcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy52aWRlb09wdGlvbnMuc3JjID0gdGhpcy5wbGF5bGlzdFt0aGlzLmFjdGl2ZVBsYXlsaXN0VmlkZW9dXHJcbiAgICAgIHRoaXMudmlkZW9PcHRpb25zLmxvb3AgPSB0aGlzLnBsYXlsaXN0Lmxlbmd0aCA9PSAxXHJcbiAgICAgIHRoaXMuc2VydmljZXMudmlkZW8uc2V0UGxheWVyKG51bGwsIHRoaXMudmlkZW9PcHRpb25zKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyBzaG93T2ZmSW1hZ2VcclxuICAgICAqIFNob3dzIHRoZSBvZmYgaW1hZ2VcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgc2hvd09mZkltYWdlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLnNlcnZpY2VzLnZpZGVvLmNsZWFyRXZlbnRTeXN0ZW0oKVxyXG4gICAgICB0aGlzLnNlcnZpY2VzLnZpZGVvLmNsZWFyKClcclxuICAgICAgdGhpcy5zZXJ2aWNlcy5tYXRlcmlhbC5idWlsZE9wdGlvbnMoeyB0ZXh0dXJlU3JjOiB0aGlzLm9mZkltYWdlU3JjLCBlbWlzc2lvbjogdGhpcy5lbWlzc2lvbiB9KVxyXG4gICAgICB0aGlzLnNlcnZpY2VzLnZpZGVvLnNldEFsbEltYWdlVGV4dHVyZXModGhpcylcclxuICAgICAgVkxNRGVidWcubG9nKCdzaG93aW5nIG9mZiBpbWFnZScsIHRoaXMudGV4dHVyZU9wdGlvbnMpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljIEluc3RhbmNlXHJcbiAgICogVkxNIEltYWdlIEluc3RhbmNlOiBBbiBpbnN0YW5jZSBvZiBhIFZMTUltYWdlIGNvbmZpZ1xyXG4gICAqXHJcbiAgICogSW5zdGFuY2VzIGdldCBzaGFyZWQgcHJvcGVydGllcyBmcm9tIGEgY29uZmlnIHdoaWxlIGRlZmluaW5nIHRoZWlyIG93biB1bmlxdWUgcHJvcGVydGllcywgc3VjaCBhcyBwb3NpdGlvbiwgcm90YXRpb24sIHNjYWxlLCBldGMuXHJcbiAgICpcclxuICAgKiBAY29uc3RydWN0b3IgLSBjcmVhdGVzIGEgbmV3IGluc3RhbmNlXHJcbiAgICogQHJldHVybnMgdm9pZFxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBJbnN0YW5jZSBleHRlbmRzIFZMTUJhc2UuSW5zdGFuY2Uge1xyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb25maWcsIGluc3RhbmNlQ29uZmlnOiBWTE1JbnN0YW5jZVByb3BlcnRpZXMpIHtcclxuICAgICAgc3VwZXIoY29uZmlnLCBpbnN0YW5jZUNvbmZpZylcclxuXHJcbiAgICAgIGlmICghdGhpcy5jdXN0b21SZW5kZXJpbmcpIHtcclxuICAgICAgICB0aGlzLmluaXQoY29uZmlnLCBpbnN0YW5jZUNvbmZpZylcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNldFN0b3JhZ2UoaW5zdGFuY2VDb25maWcpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTdG9yYWdlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKGNvbmZpZzogVkxNQ29uZmlnKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBjb25maWcpXHJcblxyXG4gICAgICAgIGluc3RhbmNlc1t0aGlzLnNrXSA9IHRoaXNcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VzdG9tSWQpIHtcclxuICAgICAgICAgIGluc3RhbmNlc1t0aGlzLmN1c3RvbUlkXSA9IGluc3RhbmNlc1t0aGlzLnNrXVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIGluaXRcclxuICAgICAqIGluaXRpYWxpemVzIHRoZSBpbnN0YW5jZVxyXG4gICAgICogQHJldHVybnMgdm9pZFxyXG4gICAgICovXHJcbiAgICBpbml0OiBDYWxsYWJsZUZ1bmN0aW9uID0gKGNvbmZpZzogQ29uZmlnLCBpbnN0YW5jZUNvbmZpZzogSW5zdGFuY2UpID0+IHtcclxuICAgICAgaWYgKGluc3RhbmNlQ29uZmlnKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9yYWdlKGluc3RhbmNlQ29uZmlnKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGluc3RhbmNlQ29uZmlnID0gdGhpc1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXRoaXMuZW5hYmxlZCB8fCAhY29uZmlnLmVuYWJsZWQpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnZpZGVvLmFkZEVudGl0eSh0aGlzLmVudGl0eSlcclxuXHJcbiAgICAgIGlmIChjb25maWcubWVkaWFUeXBlID09PSBEeW5hbWljTWVkaWFUeXBlLkxJVkUpIHtcclxuICAgICAgICBjb25maWcuc3RhcnRMaXZlU3RyZWFtKClcclxuICAgICAgfSBlbHNlIGlmIChjb25maWcubWVkaWFUeXBlID09PSBEeW5hbWljTWVkaWFUeXBlLlBMQVlMSVNUKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydFBsYXlsaXN0VmlkZW8oKVxyXG4gICAgICB9IGVsc2UgaWYgKGNvbmZpZy5tZWRpYVR5cGUgPT09IER5bmFtaWNNZWRpYVR5cGUuSU1BR0UpIHtcclxuICAgICAgICBjb25maWcuc2hvd09mZkltYWdlKClcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYWRkIG1lc2hcclxuICAgICAgY29uZmlnLnNlcnZpY2VzLm1lc2guc2V0KHRoaXMuZW50aXR5LCAncGxhbmUnKVxyXG4gICAgICBjb25maWcuc2VydmljZXMuY29sbGlkZXIuc2V0KHRoaXMuZW50aXR5LCAncGxhbmUnLCB0aGlzLndpdGhDb2xsaXNpb25zIHx8IGNvbmZpZy53aXRoQ29sbGlzaW9ucywgISF0aGlzLmNsaWNrRXZlbnQpXHJcblxyXG4gICAgICAvLyBhZGQgdHJhbnNmb3JtXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy50cmFuc2Zvcm0uc2V0KHRoaXMuZW50aXR5LCB7XHJcbiAgICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb24sXHJcbiAgICAgICAgc2NhbGU6IHsgLi4udGhpcy5zY2FsZSwgejogMC4wMSB9LFxyXG4gICAgICAgIHJvdGF0aW9uOiB0aGlzLnJvdGF0aW9uLFxyXG4gICAgICAgIHBhcmVudDogY29uZmlnLnBhcmVudCA/IGluc3RhbmNlc1tjb25maWcucGFyZW50XS5lbnRpdHkgOiB1bmRlZmluZWQsXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBhZGQgY2xpY2sgZXZlbnRcclxuICAgICAgY29uZmlnLnNlcnZpY2VzLmNsaWNrRXZlbnQuc2V0KHRoaXMuZW50aXR5LCB0aGlzLmNsaWNrRXZlbnQpXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgYWRkXHJcbiAgICAgKiBBZGRzIHRoZSBpbnN0YW5jZSB0byB0aGUgZW5naW5lXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuXHJcbiAgICBhZGQ6IENhbGxhYmxlRnVuY3Rpb24gPSAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKGluc3RhbmNlc1t0aGlzLnNrXSkge1xyXG4gICAgICAgICAgdGhpcy5pbml0KGNvbmZpZ3NbdGhpcy5jb25maWdJZF0sIHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIHRocm93IGVycm9yXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgcmVtb3ZlXHJcbiAgICAgKiAgUmVtb3ZlcyB0aGUgY29uZmlnJ3MgaW5zdGFuY2VzIGZyb20gdGhlIGVuZ2luZSwga2VlcHMgdGhlIGNvbmZpZyBhbmQgaW5zdGFuY2UgcmVjb3JkcyBzbyB3ZSBjYW4gYnJpbmcgc3R1ZmYgYmFja1xyXG4gICAgICogIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGVjcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIHRocm93IGVycm9yXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgZGVsZXRlXHJcbiAgICAgKiBEZWxldGVzIHRoZSBjb25maWcncyBtYXRlcmlhbCByZWNvcmQgQU5EIHJlbW92ZXMgdGhlIGNvbmZpZydzIGluc3RhbmNlcyBmcm9tIHRoZSBlbmdpbmVcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgZGVsZXRlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGVjcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KVxyXG4gICAgICAgIGlmIChpbnN0YW5jZXNbdGhpcy5za10pIHtcclxuICAgICAgICAgIGRlbGV0ZSBpbnN0YW5jZXNbdGhpcy5za11cclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgZXJyb3JcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIHN0YXJ0UGxheWxpc3RWaWRlb1xyXG4gICAgICogU3RhcnRzIGEgdmlkZW8gaW4gdGhlIHBsYXlsaXN0XHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHN0YXJ0UGxheWxpc3RWaWRlbzogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgY29uc3QgY29uZmlnID0gY29uZmlnc1t0aGlzLmNvbmZpZ0lkXVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnZpZGVvLnNldFBsYXllcih0aGlzLmVudGl0eSwgY29uZmlnLnZpZGVvT3B0aW9ucylcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyB1cGRhdGVUcmFuc2Zvcm1cclxuICAgICAqIFVwZGF0ZXMgdGhlIGluc3RhbmNlJ3MgdHJhbnNmb3JtXHJcbiAgICAgKiBAcGFyYW0gcG9zaXRpb24gLSB0aGUgcG9zaXRpb24gb2YgdGhlIGluc3RhbmNlXHJcbiAgICAgKiBAcGFyYW0gc2NhbGUgLSB0aGUgc2NhbGUgb2YgdGhlIGluc3RhbmNlXHJcbiAgICAgKiBAcGFyYW0gcm90YXRpb24gLSB0aGUgcm90YXRpb24gb2YgdGhlIGluc3RhbmNlXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICB1cGRhdGVUcmFuc2Zvcm06IENhbGxhYmxlRnVuY3Rpb24gPSAocG9zaXRpb24/OiBWZWN0b3IzLCBzY2FsZT86IFZlY3RvcjMsIHJvdGF0aW9uPzogVmVjdG9yMykgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW3RoaXMuY29uZmlnSWRdXHJcbiAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbiB8fCB0aGlzLnBvc2l0aW9uXHJcbiAgICAgIHRoaXMuc2NhbGUgPSBzY2FsZSB8fCB0aGlzLnNjYWxlXHJcbiAgICAgIHRoaXMucm90YXRpb24gPSByb3RhdGlvbiB8fCB0aGlzLnJvdGF0aW9uXHJcblxyXG4gICAgICBjb25maWcuc2VydmljZXMudHJhbnNmb3JtLnNldCh0aGlzLmVudGl0eSwge1xyXG4gICAgICAgIHBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uLFxyXG4gICAgICAgIHNjYWxlOiB7IC4uLnRoaXMuc2NhbGUsIHo6IDAuMDEgfSxcclxuICAgICAgICByb3RhdGlvbjogdGhpcy5yb3RhdGlvbixcclxuICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50LFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyB1cGRhdGVQYXJlbnRcclxuICAgICAqIFVwZGF0ZXMgdGhlIGluc3RhbmNlJ3MgcGFyZW50XHJcbiAgICAgKiBAcGFyYW0gcGFyZW50IC0gdGhlIHBhcmVudCBvZiB0aGUgaW5zdGFuY2VcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVBhcmVudDogQ2FsbGFibGVGdW5jdGlvbiA9IChwYXJlbnQ6IEVudGl0eSkgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW3RoaXMuY29uZmlnSWRdXHJcbiAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50XHJcblxyXG4gICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSh0aGlzLnBvc2l0aW9uLCB0aGlzLnNjYWxlLCB0aGlzLnJvdGF0aW9uKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyB1cGRhdGVDbGlja0V2ZW50XHJcbiAgICAgKiBVcGRhdGVzIHRoZSBpbnN0YW5jZSdzIGNsaWNrIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0gY2xpY2tFdmVudCAtIHRoZSBjbGljayBldmVudCBvZiB0aGUgaW5zdGFuY2VcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgdXBkYXRlQ2xpY2tFdmVudDogQ2FsbGFibGVGdW5jdGlvbiA9IChjbGlja0V2ZW50OiBWTE1DbGlja0V2ZW50LkNvbmZpZykgPT4ge1xyXG4gICAgICBjb25zdCBjb25maWcgPSBjb25maWdzW3RoaXMuY29uZmlnSWRdXHJcbiAgICAgIHRoaXMuY2xpY2tFdmVudCA9IGNsaWNrRXZlbnRcclxuXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5jbGlja0V2ZW50LnNldCh0aGlzLmVudGl0eSwgdGhpcy5jbGlja0V2ZW50KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyB1cGRhdGVWaWRlb09wdGlvbnNcclxuICAgICAqIFVwZGF0ZXMgdGhlIGluc3RhbmNlJ3MgdmlkZW8gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHZpZGVvT3B0aW9ucyAtIHRoZSB2aWRlbyBvcHRpb25zIG9mIHRoZSBpbnN0YW5jZVxyXG4gICAgICogQHJldHVybnMgdm9pZFxyXG4gICAgICovXHJcbiAgICB1cGRhdGVWaWRlb09wdGlvbnM6IENhbGxhYmxlRnVuY3Rpb24gPSAodmlkZW9PcHRpb25zOiBQQlZpZGVvUGxheWVyKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbdGhpcy5jb25maWdJZF1cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnZpZGVvLnNldFBsYXllcih0aGlzLmVudGl0eSwgdmlkZW9PcHRpb25zKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyB1cGRhdGVUZXh0dXJlT3B0aW9uc1xyXG4gICAgICogVXBkYXRlcyB0aGUgaW5zdGFuY2UncyB0ZXh0dXJlIG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB0ZXh0dXJlT3B0aW9ucyAtIHRoZSB0ZXh0dXJlIG9wdGlvbnMgb2YgdGhlIGluc3RhbmNlXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVRleHR1cmVPcHRpb25zOiBDYWxsYWJsZUZ1bmN0aW9uID0gKHRleHR1cmVPcHRpb25zOiBQQk1hdGVyaWFsX1Bick1hdGVyaWFsKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbdGhpcy5jb25maWdJZF1cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLm1hdGVyaWFsLnNldCh0aGlzLmVudGl0eSwgJ3BicicsIHRleHR1cmVPcHRpb25zKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyB1cGRhdGVDb2xsaWRlclxyXG4gICAgICogVXBkYXRlcyB0aGUgaW5zdGFuY2UncyBjb2xsaWRlclxyXG4gICAgICogQHBhcmFtIHdpdGhDb2xsaWRlciAtIHRoZSB0ZXh0dXJlIG9wdGlvbnMgb2YgdGhlIGluc3RhbmNlXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZUNvbGxpZGVyOiBDYWxsYWJsZUZ1bmN0aW9uID0gKHdpdGhDb2xsaXNpb25zOiBib29sZWFuKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbdGhpcy5jb25maWdJZF1cclxuICAgICAgdGhpcy53aXRoQ29sbGlzaW9ucyA9IHdpdGhDb2xsaXNpb25zXHJcblxyXG4gICAgICBpZiAod2l0aENvbGxpc2lvbnMgfHwgdGhpcy5jbGlja0V2ZW50KSB7XHJcbiAgICAgICAgY29uZmlnLnNlcnZpY2VzLmNvbGxpZGVyLnNldCh0aGlzLmVudGl0eSwgJ3BsYW5lJywgd2l0aENvbGxpc2lvbnMsIHRoaXMuY2xpY2tFdmVudClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25maWcuc2VydmljZXMuY29sbGlkZXIuY2xlYXIodGhpcy5lbnRpdHkpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGV4cG9ydCBlbnVtIFN5c3RlbVN0YXRlIHtcclxuICAgIENSRUFURUQsXHJcbiAgICBJTklUSUFMSVpJTkcsXHJcbiAgICBJTklUSUFMSVpFRCxcclxuICAgIFVQREFUSU5HLFxyXG4gICAgUkVNT1ZJTkcsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgdHlwZSBRdWlja1ZpZGVvQ29uZmlnID0ge1xyXG4gIGxpdmVVcmw6IHN0cmluZ1xyXG4gIHBsYXlsaXN0Pzogc3RyaW5nW11cclxuICBwb3NpdGlvbjogVmVjdG9yM1xyXG4gIHNjYWxlPzogVmVjdG9yM1xyXG4gIHJvdGF0aW9uPzogVmVjdG9yM1xyXG4gIHZvbHVtZT86IG51bWJlclxyXG4gIGNvbGxpZGVycz86IGJvb2xlYW5cclxuICBwYXJlbnQ/OiBFbnRpdHlcclxufSAmIFZMTUNsaWNrYWJsZVxyXG5cclxuLyoqXHJcbiAqIFF1aWNrIGNyZWF0b3IgZnVuY3Rpb24gZm9yIFZMTVZpZGVvIENvbmZpZ3NcclxuICogQHBhcmFtIGNvbmZpZyAtIHRoZSBjb25maWcgb2JqZWN0XHJcbiAqIEByZXR1cm5zIHZvaWRcclxuICpcclxuICpcclxuICovXHJcbmV4cG9ydCBjbGFzcyBRdWlja1ZpZGVvU2NyZWVuIHtcclxuICBlbnRpdHk6IEVudGl0eSA9IGVjcy5lbmdpbmUuYWRkRW50aXR5KClcclxuICBtZWRpYVR5cGU6IER5bmFtaWNNZWRpYVR5cGUgPSBEeW5hbWljTWVkaWFUeXBlLk5PTkVcclxuICBzZXJ2aWNlczoge1xyXG4gICAgbWF0ZXJpYWw6IE1hdGVyaWFsU2VydmljZVxyXG4gICAgbWVzaDogTWVzaFNlcnZpY2VcclxuICAgIGNvbGxpZGVyOiBDb2xsaWRlclNlcnZpY2VcclxuICAgIHRyYW5zZm9ybTogVHJhbnNmb3JtU2VydmljZVxyXG4gICAgY2xpY2tFdmVudDogQ2xpY2tFdmVudFNlcnZpY2VcclxuICAgIHZpZGVvOiBWaWRlb1NlcnZpY2VcclxuICB9XHJcbiAgY29uc3RydWN0b3IoY29uZmlnOiBRdWlja1ZpZGVvQ29uZmlnKSB7XHJcbiAgICB0aGlzLnNlcnZpY2VzID0ge1xyXG4gICAgICBtYXRlcmlhbDogbmV3IE1hdGVyaWFsU2VydmljZSgpLFxyXG4gICAgICBtZXNoOiBuZXcgTWVzaFNlcnZpY2UoKSxcclxuICAgICAgY29sbGlkZXI6IG5ldyBDb2xsaWRlclNlcnZpY2UoKSxcclxuICAgICAgdHJhbnNmb3JtOiBuZXcgVHJhbnNmb3JtU2VydmljZSgpLFxyXG4gICAgICBjbGlja0V2ZW50OiBuZXcgQ2xpY2tFdmVudFNlcnZpY2UoKSxcclxuICAgICAgdmlkZW86IG5ldyBWaWRlb1NlcnZpY2UoKSxcclxuICAgIH1cclxuXHJcbiAgICBuZXcgVkxNVmlkZW8uQ29uZmlnKHtcclxuICAgICAgcGs6ICcnLFxyXG4gICAgICBzazogJycsXHJcbiAgICAgIG5hbWU6ICcnLFxyXG4gICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICBvZmZUeXBlOiBEeW5hbWljTWVkaWFUeXBlLlBMQVlMSVNULFxyXG4gICAgICBlbmFibGVMaXZlU3RyZWFtOiBjb25maWcubGl2ZVVybCA/IHRydWUgOiBmYWxzZSxcclxuICAgICAgbGl2ZVNyYzogY29uZmlnLmxpdmVVcmwsXHJcbiAgICAgIHBsYXlsaXN0OiBjb25maWcucGxheWxpc3QgfHwgW10sXHJcbiAgICAgIGluc3RhbmNlczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBrOiAnJyxcclxuICAgICAgICAgIHNrOiAnJyxcclxuICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgcG9zaXRpb246IGNvbmZpZy5wb3NpdGlvbixcclxuICAgICAgICAgIHNjYWxlOiBjb25maWcuc2NhbGUgfHwgVmVjdG9yMy5jcmVhdGUoMTYgLyAyLCA5IC8gMiwgMC4wMSksXHJcbiAgICAgICAgICByb3RhdGlvbjogY29uZmlnLnJvdGF0aW9uIHx8IFZlY3RvcjMuWmVybygpLFxyXG4gICAgICAgICAgcGFyZW50OiBjb25maWcucGFyZW50LFxyXG4gICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSlcclxuICB9XHJcbn1cclxuIl19