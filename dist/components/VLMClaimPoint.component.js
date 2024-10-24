import { Material, EntityState, Tween } from '@dcl/sdk/ecs';
import { Vector3, Color3, Color4, Quaternion } from '@dcl/sdk/math';
import { ecs } from '../environment';
import messages from '../messages/giveaway';
import { VLMNotificationManager } from '../logic/VLMNotification.logic';
import { VLMSessionManager } from '../logic/VLMSession.logic';
import { VLMEventManager } from '../logic/VLMSystemEvents.logic';
import { getModelPath } from '../shared/paths';
import { VLMBase } from './VLMBase.component';
import { MaterialService } from '../services/Material.service';
import { MeshService } from '../services/Mesh.service';
import { TransformService } from '../services/Transform.service';
import { ColliderService } from '../services/Collider.service';
import { ClickEventService } from '../services/ClickEvent.service';
import { VLMDebug } from '../logic/VLMDebug.logic';
import defaultMessages from '../messages/giveaway';
export var VLMClaimPoint;
(function (VLMClaimPoint) {
    VLMClaimPoint.configs = {};
    VLMClaimPoint.instances = {};
    const boothLightImageBase64 = 'data:image/png;base64,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';
    class Config extends VLMBase.Config {
        constructor(config) {
            super(config);
            this.giveawayId = '';
            this.properties = { hoverText: '' };
            this.messages = defaultMessages;
            this.requestComplete = false;
            this.hasCustomFunctions = false;
            this.disableDefaults = false;
            this.requestInProgress = false;
            this.setStorage = (config) => {
                try {
                    Object.assign(this, config);
                    VLMClaimPoint.configs[this.sk] = this;
                    if (config.customId) {
                        VLMClaimPoint.configs[config.customId] = VLMClaimPoint.configs[this.sk];
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.init = (config) => {
                try {
                    this.setStorage(config);
                    if (!config.instances || config.instances.length < 1) {
                        return;
                    }
                    config.instances.forEach((instance) => {
                        this.createOrReplaceInstance(instance);
                    });
                }
                catch (error) {
                    throw error;
                }
            };
            this.addAll = () => {
                try {
                    this.instanceIds.forEach((instanceId) => {
                        VLMClaimPoint.instances[instanceId].add();
                    });
                }
                catch (error) {
                    throw error;
                }
            };
            this.remove = () => {
                try {
                    this.instanceIds.forEach((instanceId) => {
                        VLMClaimPoint.instances[instanceId].remove();
                    });
                }
                catch (error) {
                    throw error;
                }
            };
            this.delete = () => {
                try {
                    delete VLMClaimPoint.configs[this.sk];
                    this.instanceIds.forEach((instanceId) => {
                        VLMClaimPoint.instances[instanceId].delete();
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
                if (VLMClaimPoint.instances[config.sk]) {
                    ecs.engine.removeEntity(VLMClaimPoint.instances[config.sk].entity);
                    delete VLMClaimPoint.instances[config.sk];
                }
                new Instance(this, config);
            };
            this.removeInstance = (config) => {
                if (VLMClaimPoint.instances[config.sk]) {
                    VLMClaimPoint.instances[config.sk].remove();
                }
            };
            this.deleteInstance = (config) => {
                if (!this.instanceIds.includes(config.sk)) {
                    this.instanceIds = this.instanceIds.filter((instanceId) => instanceId !== config.sk);
                }
                if (VLMClaimPoint.instances[config.sk]) {
                    VLMClaimPoint.instances[config.sk].delete();
                }
            };
            this.claim = async () => {
                const giveawayId = this.giveawayId;
                if (!VLMSessionManager.sessionData.hasConnectedWeb3 && this.customFunctions?.noWallet) {
                    this.customFunctions.noWallet();
                    return;
                }
                else if (!VLMSessionManager.sessionData.hasConnectedWeb3 && !this.customFunctions?.noWallet) {
                    VLMNotificationManager.addMessage(messages.noWallet);
                    return;
                }
                else if ((this.requestComplete || this.requestInProgress) &&
                    !this.disableDefaults &&
                    VLMNotificationManager.messageQueue.length < 1 &&
                    !this.hasCustomFunctions) {
                    VLMNotificationManager.addMessage(messages.claimInProgress);
                    return;
                }
                else if ((this.requestInProgress || this.requestComplete) && VLMNotificationManager.messageQueue.length > 0) {
                    return;
                }
                else if (this.requestComplete) {
                    return;
                }
                this.requestInProgress = true;
                if (!this.hasCustomFunctions) {
                    VLMNotificationManager.addMessage(messages.claimSubmitted, { delay: 0.5 });
                }
                else if (this.customFunctions?.claimSubmitted) {
                    this.customFunctions.claimSubmitted();
                }
                VLMEventManager.events.emit('VLMClaimEvent', { action: 'giveaway_claim', giveawayId, sk: this.sk || '' });
            };
            this.runClaimFunction = (response) => {
                VLMDebug.log('info', 'VLMClaimPoin.runClaimFunction', response);
                const claimPoint = VLMClaimPoint.configs[response.sk], messageOptions = claimPoint.messageOptions || null, messages = claimPoint.messages;
                if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_DENIED) {
                    this.requestComplete = true;
                }
                if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_ACCEPTED && this.customFunctions?.successfulClaim) {
                    this.customFunctions.successfulClaim();
                }
                else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_SERVER_ERROR && this.customFunctions?.errorMessage) {
                    this.customFunctions.errorMessage();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.BEFORE_EVENT_START && this.customFunctions?.beforeEventTime) {
                    this.customFunctions.beforeEventTime();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.AFTER_EVENT_END && this.customFunctions?.afterEventTime) {
                    this.customFunctions.afterEventTime();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.EXISTING_WALLET_CLAIM && this.customFunctions?.existingClaim) {
                    this.customFunctions.existingClaim();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.CLAIM_COMPLETE && this.customFunctions?.claimComplete) {
                    this.customFunctions.claimComplete();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_IP_LIMIT && this.customFunctions?.ipLimitReached) {
                    this.customFunctions.ipLimitReached();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.SUPPLY_DEPLETED && this.customFunctions?.noSupply) {
                    this.customFunctions.noSupply();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.INAUTHENTIC && this.customFunctions?.inauthenticConnection) {
                    this.customFunctions.inauthenticConnection();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.NO_LINKED_EVENTS && this.customFunctions?.noLinkedEvents) {
                    this.customFunctions.noLinkedEvents();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.PAUSED && this.customFunctions?.paused) {
                    this.customFunctions.paused();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_DAILY_LIMIT && this.customFunctions?.dailyLimitReached) {
                    this.customFunctions.dailyLimitReached();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_WEEKLY_LIMIT && this.customFunctions?.otherLimitReached) {
                    this.customFunctions.otherLimitReached();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_MONTHLY_LIMIT && this.customFunctions?.otherLimitReached) {
                    this.customFunctions.otherLimitReached();
                }
                else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_YEARLY_LIMIT && this.customFunctions?.otherLimitReached) {
                    this.customFunctions.otherLimitReached();
                }
                else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_DENIED && this.customFunctions?.claimDenied) {
                    this.customFunctions.claimDenied();
                }
            };
            VLMDebug.log('Creating Claim Point Config', config);
            this.services = {
                material: new MaterialService(),
                mesh: new MeshService(),
                collider: new ColliderService(),
                transform: new TransformService(),
                clickEvent: new ClickEventService(),
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
    VLMClaimPoint.Config = Config;
    VLMClaimPoint.setClaimFunctions = (customId, claimFunctions, options) => {
        if (customId && claimFunctions && VLMClaimPoint.configs[customId]) {
            VLMClaimPoint.configs[customId].hasCustomFunctions = true;
        }
        else {
            VLMClaimPoint.configs[customId].hasCustomFunctions = false;
            return;
        }
        const config = VLMClaimPoint.configs[customId], originalConfig = VLMClaimPoint.configs[config.sk];
        config.disableDefaults = !!options?.disableDefaults;
        config.customFunctions = claimFunctions;
        originalConfig.customFunctions = claimFunctions;
    };
    class Instance extends VLMBase.Instance {
        constructor(config, instanceConfig) {
            super(config, instanceConfig);
            this.kioskEntities = {};
            this.claimItemEntity = ecs.engine.addEntity();
            this.entity = ecs.engine.addEntity();
            this.properties = { hoverText: '' };
            this.setStorage = (config) => {
                try {
                    Object.assign(this, config);
                    VLMClaimPoint.instances[this.sk] = this;
                    if (this.customId) {
                        VLMClaimPoint.instances[this.customId] = VLMClaimPoint.instances[this.sk];
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.init = (config, instanceConfig) => {
                this.setStorage(instanceConfig);
                if (!this.properties) {
                    this.properties = config.properties || { hoverText: '' };
                }
                if (config.customRendering || !config.enabled || !this.enabled) {
                    this.remove();
                    return;
                }
                config?.services?.transform?.set(this.entity, {
                    position: this.position,
                    scale: this.scale,
                    rotation: this.rotation,
                });
                this.generateClaimItem(config);
                if (this.properties.enableKiosk) {
                    this.generateStandardBooth();
                }
                else {
                    this.removeKiosk();
                }
                if (this.properties.enableKiosk && this.properties.enableSpin) {
                    this.spinClaimItem();
                }
            };
            this.add = () => {
                try {
                    if (VLMClaimPoint.instances[this.sk]) {
                        this.init(VLMClaimPoint.configs[this.configId], this);
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.remove = () => {
                try {
                    ecs.engine.removeEntity(this.entity);
                    ecs.engine.removeEntity(this.claimItemEntity);
                    this.removeKiosk();
                }
                catch (error) {
                    throw error;
                }
            };
            this.removeKiosk = () => {
                try {
                    Object.entries(this.kioskEntities).forEach(([key, entity]) => {
                        if (ecs.engine.getEntityState(entity) === EntityState.UsedEntity) {
                            ecs.engine.removeEntity(entity);
                        }
                    });
                }
                catch (error) {
                    throw error;
                }
            };
            this.delete = () => {
                try {
                    this.remove();
                    if (VLMClaimPoint.instances[this.sk]) {
                        delete VLMClaimPoint.instances[this.sk];
                    }
                }
                catch (error) {
                    throw error;
                }
            };
            this.generateClaimItem = (config) => {
                const objThis = this, { hoverText } = this.properties;
                this.claimItemEntity = this.claimItemEntity || ecs.engine.addEntity();
                if (!config?.services) {
                    return;
                }
                if (this.properties.type == ClaimPointType.MODEL && this.properties.modelSrc) {
                    config?.services.transform.set(this.claimItemEntity, {
                        position: Vector3.Zero(),
                        scale: {
                            x: 1,
                            y: 1,
                            z: 1,
                        },
                        rotation: { x: 0, y: 0, z: 0 },
                        parent: this.entity,
                    });
                    config?.services.mesh.set(this.claimItemEntity, 'gltf', {
                        src: `${getModelPath(this.properties.modelSrc)}`,
                    });
                }
                else if (this.properties.type == ClaimPointType.CUSTOM_IMAGE && this.properties.imgSrc) {
                    const texture = Material.Texture.Common({ src: this.properties.imgSrc });
                    config.services.mesh.set(this.claimItemEntity, 'plane');
                    config.services.collider.set(this.claimItemEntity, 'plane', true, true);
                    config.services.material.set(this.claimItemEntity, 'basic', {
                        texture: texture,
                        emissiveTexture: texture,
                        albedoColor: Color4.White(),
                        emissiveColor: Color4.White(),
                        emissiveIntensity: 2,
                    });
                }
                if (!this.properties.enableKiosk && this.properties.type == ClaimPointType.CUSTOM_IMAGE) {
                    config.services.transform.set(this.claimItemEntity, {
                        position: {
                            x: 0,
                            y: 1 + (this.properties.itemYOffset || 0),
                            z: 0,
                        },
                        scale: {
                            x: this.scale.x * (this.properties.itemScale || 1),
                            y: this.scale.y * (this.properties.itemScale || 1),
                            z: this.properties.type == ClaimPointType.CUSTOM_IMAGE ? 0.01 : this.scale.z * (this.properties.itemScale || 1),
                        },
                        rotation: { x: 0, y: 0, z: 0 },
                        parent: this.entity,
                    });
                }
                if (!this.properties.enableKiosk || !this.properties.enableButton) {
                    config.services.clickEvent.setCustomDown(this.claimItemEntity, { hoverText }, async () => {
                        await config.claim();
                    });
                }
                else {
                    config.services.clickEvent.clearAll(this.claimItemEntity);
                }
            };
            this.spinClaimItem = () => {
                if (!this.claimItemEntity) {
                    return;
                }
                ecs.Tween.createOrReplace(this.claimItemEntity, {
                    mode: Tween.Mode.Rotate({
                        start: Quaternion.fromEulerDegrees(0, 0, 0),
                        end: Quaternion.fromEulerDegrees(0, 180, 0),
                    }),
                    duration: 3000,
                    easingFunction: 0,
                });
                ecs.TweenSequence.createOrReplace(this.claimItemEntity, {
                    loop: 0,
                    sequence: [
                        {
                            mode: Tween.Mode.Rotate({
                                start: Quaternion.fromEulerDegrees(0, 180, 0),
                                end: Quaternion.fromEulerDegrees(0, 360, 0),
                            }),
                            duration: 3000,
                            easingFunction: 0,
                        },
                    ],
                });
            };
            this.generateStandardBooth = () => {
                const objThis = this, config = VLMClaimPoint.configs[this.configId];
                const { color1, color2, color3, hoverText } = this.properties, primaryColor = color1 ? Color4.create(color1.r / 255, color1.g / 255, color1.b / 255, color1.a) : Color4.White(), secondaryColor = color2 ? Color4.create(color2.r / 255, color2.g / 255, color2.b / 255, color2.a) : Color4.White(), glassColor = color3 ? Color4.create(color3.r / 255, color3.g / 255, color3.b / 255, color3.a) : Color4.White();
                this.kioskEntities.baseEntity = this.kioskEntities.baseEntity || ecs.engine.addEntity();
                this.kioskEntities.topEntity = this.kioskEntities.topEntity || ecs.engine.addEntity();
                this.kioskEntities.baseTopEntity = this.kioskEntities.baseTopEntity || ecs.engine.addEntity();
                this.kioskEntities.baseBottomEntity = this.kioskEntities.baseBottomEntity || ecs.engine.addEntity();
                this.kioskEntities.glassEntity = this.kioskEntities.glassEntity || ecs.engine.addEntity();
                if (this.properties.enableButton) {
                    this.generateClaimButton();
                }
                if (this.properties.enableLight || true) {
                    this.generateBoothLight();
                }
                config.services.mesh.set(this.kioskEntities.baseEntity, 'cylinder');
                config.services.mesh.set(this.kioskEntities.topEntity, 'cylinder');
                config.services.mesh.set(this.kioskEntities.baseTopEntity, 'cylinder');
                config.services.mesh.set(this.kioskEntities.baseBottomEntity, 'cylinder');
                config.services.mesh.set(this.kioskEntities.glassEntity, 'cylinder');
                config.services.collider.set(this.kioskEntities.baseEntity, 'cylinder', true, true);
                config.services.collider.set(this.kioskEntities.topEntity, 'cylinder', true, true);
                config.services.collider.set(this.kioskEntities.baseTopEntity, 'cylinder', true, true);
                config.services.collider.set(this.kioskEntities.baseBottomEntity, 'cylinder', true, true);
                config.services.collider.set(this.kioskEntities.glassEntity, 'cylinder', true, true);
                config.services.transform.set(this.kioskEntities.baseEntity, {
                    position: Vector3.create(0, 0.5, 0),
                    scale: Vector3.create(-0.85, 1, 0.85),
                    rotation: { x: 0, y: 90, z: 0 },
                    parent: this.entity,
                });
                config.services.transform.set(this.kioskEntities.topEntity, {
                    position: Vector3.create(0, 2.5, 0),
                    scale: Vector3.create(1, 0.1, 1),
                    rotation: { x: 0, y: 0, z: 0 },
                    parent: this.entity,
                });
                config.services.transform.set(this.kioskEntities.baseTopEntity, {
                    position: Vector3.create(0, 1, 0),
                    scale: Vector3.create(1, 0.1, 1),
                    rotation: { x: 0, y: 0, z: 0 },
                    parent: this.entity,
                });
                config.services.transform.set(this.kioskEntities.baseBottomEntity, {
                    position: Vector3.create(0, 0, 0),
                    scale: Vector3.create(1, 0.1, 1),
                    rotation: { x: 0, y: 0, z: 0 },
                    parent: this.entity,
                });
                config.services.transform.set(this.kioskEntities.glassEntity, {
                    position: Vector3.create(0, 1.75, 0),
                    scale: Vector3.create(0.85, 1.5, 0.85),
                    rotation: { x: 0, y: 0, z: 0 },
                    parent: this.entity,
                });
                const baseTexture = objThis.properties?.kioskImgSrc && Material.Texture.Common({ src: objThis.properties.kioskImgSrc });
                config.services.material.set(this.kioskEntities.baseEntity, 'pbr', {
                    texture: baseTexture,
                    emissiveTexture: baseTexture,
                    emissiveColor: Color3.create(primaryColor.r, primaryColor.g, primaryColor.b),
                    albedoColor: primaryColor,
                });
                config.services.material.set(this.kioskEntities.topEntity, 'pbr', {
                    albedoColor: secondaryColor,
                });
                config.services.material.set(this.kioskEntities.baseTopEntity, 'pbr', {
                    albedoColor: secondaryColor,
                });
                config.services.material.set(this.kioskEntities.baseBottomEntity, 'pbr', {
                    albedoColor: secondaryColor,
                });
                config.services.material.set(this.kioskEntities.glassEntity, 'pbr', {
                    albedoColor: glassColor,
                    emissiveColor: Color3.create(glassColor.r, glassColor.g, glassColor.b),
                    reflectivityColor: Color3.White(),
                    specularIntensity: 10,
                    metallic: 1,
                    roughness: 0.05,
                    emissiveIntensity: 0.1,
                });
                config.services.transform.set(this.claimItemEntity, {
                    position: {
                        x: 0,
                        y: 1 + (this.properties.itemYOffset || 0),
                        z: 0,
                    },
                    scale: {
                        x: this.scale.x * (this.properties.itemScale || 1),
                        y: this.scale.y * (this.properties.itemScale || 1),
                        z: this.properties.type == ClaimPointType.CUSTOM_IMAGE ? 0.01 : this.scale.z * (this.properties.itemScale || 1),
                    },
                    rotation: { x: 0, y: 0, z: 0 },
                    parent: this.entity,
                });
                if (!this.properties.enableButton) {
                    config.services.clickEvent.setCustomDown(this.kioskEntities.baseEntity, { hoverText }, async () => {
                        await config.claim();
                    });
                    config.services.clickEvent.setCustomDown(this.kioskEntities.baseTopEntity, { hoverText }, async () => {
                        await config.claim();
                    });
                    config.services.clickEvent.setCustomDown(this.kioskEntities.glassEntity, { hoverText }, async () => {
                        await config.claim();
                    });
                }
                else {
                    config.services.clickEvent.clearAll(this.claimItemEntity);
                }
            };
            this.generateClaimButton = () => {
                const objThis = this, config = VLMClaimPoint.configs[this.configId], { color2, color4, hoverText } = objThis.properties, secondaryColor = color2 ? Color4.create(color2.r / 255, color2.g / 255, color2.b / 255, color2.a) : Color4.White(), buttonColor = color4 ? Color4.create(color4.r / 255, color4.g / 255, color4.b / 255, color4.a) : Color4.Red();
                this.kioskEntities.buttonHousingEntity = this.kioskEntities.buttonHousingEntity || ecs.engine.addEntity();
                this.kioskEntities.buttonEntity = this.kioskEntities.buttonEntity || ecs.engine.addEntity();
                config.services.mesh.set(this.kioskEntities.buttonHousingEntity, 'box');
                config.services.mesh.set(this.kioskEntities.buttonEntity, 'box');
                config.services.collider.set(this.kioskEntities.buttonEntity, 'box', false, true);
                config.services.transform.set(this.kioskEntities.buttonHousingEntity, {
                    position: Vector3.create(0, 0.98, -0.43),
                    scale: Vector3.create(0.15, 0.25, 0.15),
                    rotation: { x: -45, y: 0, z: 0 },
                    parent: this.entity,
                });
                config.services.transform.set(this.kioskEntities.buttonEntity, {
                    position: Vector3.create(0, 0.98, -0.43),
                    scale: Vector3.create(0.1, 0.3, 0.1),
                    rotation: { x: -45, y: 0, z: 0 },
                    parent: this.entity,
                });
                config.services.material.set(this.kioskEntities.buttonHousingEntity, 'pbr', {
                    albedoColor: secondaryColor,
                    reflectivityColor: Color3.create(secondaryColor.r, secondaryColor.g, secondaryColor.b),
                    specularIntensity: 0,
                    emissiveIntensity: 0,
                });
                config.services.material.set(this.kioskEntities.buttonEntity, 'pbr', {
                    albedoColor: buttonColor,
                    emissiveColor: Color3.create(buttonColor.r, buttonColor.g, buttonColor.b),
                    reflectivityColor: Color3.create(buttonColor.r, buttonColor.g, buttonColor.b),
                    emissiveIntensity: 0.5,
                });
                config.services.clickEvent.setCustomDown(this.kioskEntities.buttonEntity, { hoverText }, async () => {
                    objThis.pressButton();
                    await config.claim();
                });
            };
            this.generateBoothLight = () => {
                const objThis = this, config = VLMClaimPoint.configs[this.configId], { color2, color4, color5, hoverText } = objThis.properties, secondaryColor = color2 ? Color4.create(color2.r / 255, color2.g / 255, color2.b / 255, color2.a) : Color4.White(), buttonColor = color4 ? Color4.create(color4.r / 255, color4.g / 255, color4.b / 255, color4.a) : Color4.Red(), lightColor = color5 ? Color4.create(color5.r / 255, color5.g / 255, color5.b / 255, color5.a) : Color4.create(1, 1, 1, 0.25);
                this.kioskEntities.boothLightEntity = this.kioskEntities.boothLightEntity || ecs.engine.addEntity();
                config.services.mesh.set(this.kioskEntities.boothLightEntity, 'cylinder', { radiusTop: 0.35, radiusBottom: 0.15 });
                config.services.transform.set(this.kioskEntities.boothLightEntity, {
                    position: Vector3.create(0, 1.5, 0),
                    scale: Vector3.create(1, 2, 1),
                    rotation: { x: 0, y: 0, z: 0 },
                    parent: this.entity,
                });
                const lightTexture = Material.Texture.Common({ src: boothLightImageBase64 });
                config.services.material.set(this.kioskEntities.boothLightEntity, 'pbr', {
                    texture: lightTexture,
                    emissiveTexture: lightTexture,
                    alphaTexture: lightTexture,
                    transparencyMode: 2,
                    albedoColor: lightColor,
                    emissiveColor: Color3.create(lightColor.r, lightColor.g, lightColor.b),
                    emissiveIntensity: 2,
                });
            };
            this.pressButton = () => {
                ecs.Tween.createOrReplace(this.kioskEntities.buttonEntity, {
                    mode: Tween.Mode.Scale({
                        start: Vector3.create(0.1, 0.3, 0.1),
                        end: Vector3.create(0.1, 0.255, 0.1),
                    }),
                    duration: 200,
                    easingFunction: 0,
                });
                ecs.TweenSequence.createOrReplace(this.kioskEntities.buttonEntity, {
                    sequence: [
                        {
                            duration: 200,
                            easingFunction: 0,
                            mode: Tween.Mode.Scale({
                                start: Vector3.create(0.1, 0.255, 0.1),
                                end: Vector3.create(0.1, 0.3, 0.1),
                            }),
                        },
                    ],
                });
            };
            this.updateTransform = (position, scale, rotation) => {
                const config = VLMClaimPoint.configs[this.configId];
                this.position = position || this.position;
                this.scale = scale || this.scale;
                this.rotation = rotation || this.rotation;
                config.services.transform.set(this.entity, {
                    position: this.position,
                    scale: this.scale,
                    rotation: this.rotation,
                    parent: this.parent,
                });
            };
            if (!this.customRendering) {
                this.init(config, instanceConfig);
            }
            else {
                this.setStorage(instanceConfig);
            }
        }
    }
    VLMClaimPoint.Instance = Instance;
    let ClaimStatus;
    (function (ClaimStatus) {
        ClaimStatus["PENDING"] = "pending";
        ClaimStatus["QUEUED"] = "queued";
        ClaimStatus["IN_PROGRESS"] = "in_progress";
        ClaimStatus["COMPLETE"] = "complete";
    })(ClaimStatus = VLMClaimPoint.ClaimStatus || (VLMClaimPoint.ClaimStatus = {}));
    let ClaimRejection;
    (function (ClaimRejection) {
        ClaimRejection["PAUSED"] = "paused";
        ClaimRejection["BEFORE_EVENT_START"] = "before_event_start";
        ClaimRejection["AFTER_EVENT_END"] = "after_event_end";
        ClaimRejection["EXISTING_WALLET_CLAIM"] = "existing_wallet_claim";
        ClaimRejection["CLAIM_COMPLETE"] = "claim_complete";
        ClaimRejection["SUPPLY_DEPLETED"] = "supply_depleted";
        ClaimRejection["INAUTHENTIC"] = "inauthentic";
        ClaimRejection["SUSPICIOUS"] = "suspicious";
        ClaimRejection["NO_LINKED_EVENTS"] = "no_linked_events";
        ClaimRejection["OVER_IP_LIMIT"] = "over_ip_limit";
        ClaimRejection["OVER_DAILY_LIMIT"] = "over_daily_limit";
        ClaimRejection["OVER_WEEKLY_LIMIT"] = "over_weekly_limit";
        ClaimRejection["OVER_MONTHLY_LIMIT"] = "over_monthly_limit";
        ClaimRejection["OVER_YEARLY_LIMIT"] = "over_yearly_limit";
        ClaimRejection["OVER_LIMIT"] = "over_limit";
    })(ClaimRejection = VLMClaimPoint.ClaimRejection || (VLMClaimPoint.ClaimRejection = {}));
    let ClaimResponseType;
    (function (ClaimResponseType) {
        ClaimResponseType["CLAIM_ACCEPTED"] = "claim_accepted";
        ClaimResponseType["CLAIM_DENIED"] = "claim_denied";
        ClaimResponseType["CLAIM_IN_PROGRESS"] = "claim_in_progress";
        ClaimResponseType["CLAIM_SERVER_ERROR"] = "claim_server_error";
    })(ClaimResponseType = VLMClaimPoint.ClaimResponseType || (VLMClaimPoint.ClaimResponseType = {}));
    let ClaimPointType;
    (function (ClaimPointType) {
        ClaimPointType[ClaimPointType["MARKETPLACE_IMAGE"] = 0] = "MARKETPLACE_IMAGE";
        ClaimPointType[ClaimPointType["CUSTOM_IMAGE"] = 1] = "CUSTOM_IMAGE";
        ClaimPointType[ClaimPointType["MODEL"] = 2] = "MODEL";
        ClaimPointType[ClaimPointType["MANNEQUIN"] = 3] = "MANNEQUIN";
    })(ClaimPointType = VLMClaimPoint.ClaimPointType || (VLMClaimPoint.ClaimPointType = {}));
    let MannequinType;
    (function (MannequinType) {
        MannequinType[MannequinType["MALE"] = 0] = "MALE";
        MannequinType[MannequinType["FEMALE"] = 1] = "FEMALE";
        MannequinType[MannequinType["MATCH_PLAYER"] = 2] = "MATCH_PLAYER";
    })(MannequinType = VLMClaimPoint.MannequinType || (VLMClaimPoint.MannequinType = {}));
})(VLMClaimPoint || (VLMClaimPoint = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxNQ2xhaW1Qb2ludC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9WTE1DbGFpbVBvaW50LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsUUFBUSxFQUFFLFdBQVcsRUFBaUMsS0FBSyxFQUF1QyxNQUFNLGNBQWMsQ0FBQTtBQUN2SSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQ25FLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNwQyxPQUFPLFFBQVEsTUFBTSxzQkFBc0IsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUV2RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUM3RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDaEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUU3QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUE7QUFDOUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3RELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFBO0FBQ2hFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQTtBQUM5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDbEQsT0FBTyxlQUFlLE1BQU0sc0JBQXNCLENBQUE7QUFFbEQsTUFBTSxLQUFXLGFBQWEsQ0FzMkI3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O1FBQ0wsNkRBQVMsQ0FBQTtJQUNYLENBQUMsRUFMVyxjQUFjLEdBQWQsNEJBQWMsS0FBZCw0QkFBYyxRQUt6QjtJQUVELElBQVksYUFJWDtJQUpELFdBQVksYUFBYTtRQUN2QixpREFBSSxDQUFBO1FBQ0oscURBQU0sQ0FBQTtRQUNOLGlFQUFZLENBQUE7SUFDZCxDQUFDLEVBSlcsYUFBYSxHQUFiLDJCQUFhLEtBQWIsMkJBQWEsUUFJeEI7QUFzREgsQ0FBQyxFQXQyQmdCLGFBQWEsS0FBYixhQUFhLFFBczJCN0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnRpdHksIE1hdGVyaWFsLCBFbnRpdHlTdGF0ZSwgQ29sbGlkZXJMYXllciwgRWFzaW5nRnVuY3Rpb24sIFR3ZWVuLCBUd2Vlbkxvb3AsIE1hdGVyaWFsVHJhbnNwYXJlbmN5TW9kZSB9IGZyb20gJ0BkY2wvc2RrL2VjcydcclxuaW1wb3J0IHsgVmVjdG9yMywgQ29sb3IzLCBDb2xvcjQsIFF1YXRlcm5pb24gfSBmcm9tICdAZGNsL3Nkay9tYXRoJ1xyXG5pbXBvcnQgeyBlY3MgfSBmcm9tICcuLi9lbnZpcm9ubWVudCdcclxuaW1wb3J0IG1lc3NhZ2VzIGZyb20gJy4uL21lc3NhZ2VzL2dpdmVhd2F5J1xyXG5pbXBvcnQgeyBWTE1Ob3RpZmljYXRpb25NYW5hZ2VyIH0gZnJvbSAnLi4vbG9naWMvVkxNTm90aWZpY2F0aW9uLmxvZ2ljJ1xyXG5pbXBvcnQgeyBWTE1Ob3RpZmljYXRpb24gfSBmcm9tICcuL1ZMTU5vdGlmaWNhdGlvbi5jb21wb25lbnQnXHJcbmltcG9ydCB7IFZMTVNlc3Npb25NYW5hZ2VyIH0gZnJvbSAnLi4vbG9naWMvVkxNU2Vzc2lvbi5sb2dpYydcclxuaW1wb3J0IHsgVkxNRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vbG9naWMvVkxNU3lzdGVtRXZlbnRzLmxvZ2ljJ1xyXG5pbXBvcnQgeyBnZXRNb2RlbFBhdGggfSBmcm9tICcuLi9zaGFyZWQvcGF0aHMnXHJcbmltcG9ydCB7IFZMTUJhc2UgfSBmcm9tICcuL1ZMTUJhc2UuY29tcG9uZW50J1xyXG5pbXBvcnQgeyBWTE1CYXNlUHJvcGVydGllcywgVkxNQ2xpY2thYmxlLCBWTE1JbnN0YW5jZVByb3BlcnRpZXMsIFZMTUluc3RhbmNlZEl0ZW0sIFZMTVRleHR1cmVPcHRpb25zIH0gZnJvbSAnLi4vc2hhcmVkL2ludGVyZmFjZXMnXHJcbmltcG9ydCB7IE1hdGVyaWFsU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL01hdGVyaWFsLnNlcnZpY2UnXHJcbmltcG9ydCB7IE1lc2hTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvTWVzaC5zZXJ2aWNlJ1xyXG5pbXBvcnQgeyBUcmFuc2Zvcm1TZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvVHJhbnNmb3JtLnNlcnZpY2UnXHJcbmltcG9ydCB7IENvbGxpZGVyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL0NvbGxpZGVyLnNlcnZpY2UnXHJcbmltcG9ydCB7IENsaWNrRXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvQ2xpY2tFdmVudC5zZXJ2aWNlJ1xyXG5pbXBvcnQgeyBWTE1EZWJ1ZyB9IGZyb20gJy4uL2xvZ2ljL1ZMTURlYnVnLmxvZ2ljJ1xyXG5pbXBvcnQgZGVmYXVsdE1lc3NhZ2VzIGZyb20gJy4uL21lc3NhZ2VzL2dpdmVhd2F5J1xyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBWTE1DbGFpbVBvaW50IHtcclxuICBleHBvcnQgY29uc3QgY29uZmlnczogeyBbdXVpZDogc3RyaW5nXTogVkxNQ2xhaW1Qb2ludC5Db25maWcgfSA9IHt9XHJcbiAgZXhwb3J0IGNvbnN0IGluc3RhbmNlczogeyBbdXVpZDogc3RyaW5nXTogVkxNQ2xhaW1Qb2ludC5JbnN0YW5jZSB9ID0ge31cclxuICBjb25zdCBib290aExpZ2h0SW1hZ2VCYXNlNjQgPVxyXG4gICAgJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFJQUNBWUFBQUJEMWdZRkFBQUFCR2RCVFVFQUFMR1BDL3hoQlFBQUNrbHBRME5RYzFKSFFpQkpSVU0yTVRrMk5pMHlMakVBQUVpSm5WTjNXSlAzRmo3ZjkyVVBWa0xZOExHWGJJRUFJaU9zQ01nUVdhSVFrZ0JoaEJBU1FNV0ZpQXBXRkJVUm5FaFZ4SUxWQ2tpZGlPS2dLTGhuUVlxSVdvdFZYRGp1SDl5bnRYMTY3KzN0KzlmN3ZPZWM1L3pPZWM4UGdCRVNKcEhtb21vQU9WS0ZQRHJZSDQ5UFNNVEp2WUFDRlVqZ0JDQVE1c3ZDWndYRkFBRHdBM2w0Zm5Td1Avd0JyMjhBQWdCdzFTNGtFc2ZoLzRPNlVDWlhBQ0NSQU9BaUV1Y0xBWkJTQU1ndVZNZ1VBTWdZQUxCVHMyUUtBSlFBQUd4NWZFSWlBS29OQU96MFNUNEZBTmlwazl3WEFOaWlIS2tJQUkwQkFKa29SeVFDUUxzQVlGV0JVaXdDd01JQW9LeEFJaTRFd0s0QmdGbTJNa2NDZ0wwRkFIYU9XSkFQUUdBQWdKbENMTXdBSURnQ0FFTWVFODBESUV3RG9ERFN2K0NwWDNDRnVFZ0JBTURMbGMyWFM5SXpGTGlWMEJwMzh2RGc0aUhpd215eFFtRVhLUkJtQ2VRaW5KZWJJeE5JNXdOTXpnd0FBQnI1MGNIK09EK1E1K2JrNGVabTUyenY5TVdpL212d2J5SStJZkhmL3J5TUFnUUFFRTdQNzlwZjVlWFdBM0RIQWJCMXYydXBXd0RhVmdCbzMvbGRNOXNKb0ZvSzBIcjVpM2s0L0VBZW5xRlF5RHdkSEFvTEMrMGxZcUc5TU9PTFB2OHo0Vy9naTM3Mi9FQWUvdHQ2OEFCeG1rQ1pyY0NqZy8xeFlXNTJybEtPNThzRVFqRnU5K2NqL3NlRmYvMk9LZEhpTkxGY0xCV0s4VmlKdUZBaVRjZDV1VktSUkNISmxlSVM2WDh5OFIrVy9RbVRkdzBBcklaUHdFNjJCN1hMYk1CKzdnRUNpdzVZMG5ZQVFIN3pMWXdhQzVFQUVHYzBNbm4zQUFDVHYvbVBRQ3NCQU0yWHBPTUFBTHpvR0Z5b2xCZE14Z2dBQUVTZ2dTcXdRUWNNd1JTc3dBNmN3UjI4d0JjQ1lRWkVRQXdrd0R3UVFnYmtnQndLb1JpV1FSbFV3RHJZQkxXd0F4cWdFWnJoRUxUQk1UZ041K0FTWElIcmNCY0dZQmlld2hpOGhna0VRY2dJRTJFaE9vZ1JZbzdZSXM0SUY1bU9CQ0poU0RTU2dLUWc2WWdVVVNMRnlIS2tBcWxDYXBGZFNDUHlMWElVT1kxY1FQcVEyOGdnTW9yOGlyeEhNWlNCc2xFRDFBSjFRTG1vSHhxS3hxQnowWFEwRDEyQWxxSnIwUnEwSGoyQXRxS24wVXZvZFhRQWZZcU9ZNERSTVE1bWpObGhYSXlIUldDSldCb214eFpqNVZnMVZvODFZeDFZTjNZVkc4Q2VZZThJSkFLTGdCUHNDRjZFRU1Kc2dwQ1FSMWhNV0VPb0pld2p0Qks2Q0ZjSmc0UXh3aWNpazZoUHRDVjZFdm5FZUdJNnNaQllScXdtN2lFZUlaNGxYaWNPRTErVFNDUU95WkxrVGdvaEpaQXlTUXRKYTBqYlNDMmtVNlErMGhCcG5Fd202NUJ0eWQ3a0NMS0FyQ0NYa2JlUUQ1QlBrdnZKdytTM0ZEckZpT0pNQ2FJa1VxU1VFa28xWlQvbEJLV2ZNa0tab0twUnphbWUxQWlxaURxZldrbHRvSFpRTDFPSHFSTTBkWm9selpzV1E4dWtMYVBWMEpwcFoybjNhQy9wZExvSjNZTWVSWmZRbDlKcjZBZnA1K21EOUhjTURZWU5nOGRJWWlnWmF4bDdHYWNZdHhrdm1VeW1CZE9YbWNoVU1OY3lHNWxubUErWWIxVllLdllxZkJXUnloS1ZPcFZXbFg2VjU2cFVWWE5WUDlWNXFndFVxMVVQcTE1V2ZhWkdWYk5RNDZrSjFCYXIxYWtkVmJ1cE5xN09VbmRTajFEUFVWK2p2bC85Z3ZwakRiS0doVWFnaGtpalZHTzN4aG1OSVJiR01tWHhXRUxXY2xZRDZ5eHJtRTFpVzdMNTdFeDJCZnNiZGk5N1RGTkRjNnBtckdhUlpwM21jYzBCRHNheDRQQTUyWnhLemlIT0RjNTdMUU10UHkyeDFtcXRacTErclRmYWV0cSsybUx0Y3UwVzdldmE3M1Z3blVDZExKMzFPbTA2OTNVSnVqYTZVYnFGdXR0MXorbyswMlByZWVrSjljcjFEdW5kMFVmMWJmU2o5UmZxNzlidjBSODNNRFFJTnBBWmJERTRZL0RNa0dQb2E1aHB1Tkh3aE9Hb0VjdG91cEhFYUtQUlNhTW51Q2J1aDJmak5YZ1hQbWFzYnh4aXJEVGVaZHhyUEdGaWFUTGJwTVNreGVTK0tjMlVhNXBtdXRHMDAzVE16TWdzM0t6WXJNbnNqam5Wbkd1ZVliN1p2TnY4allXbFJaekZTb3MyaThlVzJwWjh5d1dXVFpiM3JKaFdQbFo1VnZWVzE2eEoxbHpyTE90dDFsZHNVQnRYbXd5Yk9wdkx0cWl0bTYzRWRwdHQzeFRpRkk4cDBpbjFVMjdhTWV6ODdBcnNtdXdHN1RuMllmWWw5bTMyengzTUhCSWQxanQwTzN4eWRIWE1kbXh3dk91azRUVERxY1NwdytsWFp4dG5vWE9kOHpVWHBrdVF5eEtYZHBjWFUyMm5pcWR1bjNyTGxlVWE3cnJTdGRQMW81dTdtOXl0MlczVTNjdzl4WDJyKzAwdW14dkpYY005NzBIMDhQZFk0bkhNNDUybm02ZkM4NURuTDE1MlhsbGUrNzBlVDdPY0pwN1dNRzNJMjhSYjRMM0xlMkE2UGoxbCtzN3BBejdHUGdLZmVwK0h2cWErSXQ4OXZpTisxbjZaZmdmOG52czcrc3Y5ai9pLzRYbnlGdkZPQldBQndRSGxBYjJCR29HekEyc0RId1NaQktVSE5RV05CYnNHTHd3K0ZVSU1DUTFaSDNLVGI4QVg4aHY1WXpQY1p5eWEwUlhLQ0owVldodjZNTXdtVEI3V0VZNkd6d2pmRUg1dnB2bE02Y3kyQ0lqZ1IyeUl1QjlwR1prWCtYMFVLU295cWk3cVViUlRkSEYwOXl6V3JPUlorMmU5anZHUHFZeTVPOXRxdG5KMlo2eHFiRkpzWSt5YnVJQzRxcmlCZUlmNFJmR1hFblFUSkFudGllVEUyTVE5aWVOekF1ZHNtak9jNUpwVWxuUmpydVhjb3JrWDV1bk95NTUzUEZrMVdaQjhPSVdZRXBleVArV0RJRUpRTHhoUDVhZHVUUjBUOG9TYmhVOUZ2cUtOb2xHeHQ3aEtQSkxtblZhVjlqamRPMzFEK21pR1QwWjF4ak1KVDFJcmVaRVprcmtqODAxV1JOYmVyTS9aY2RrdE9aU2NsSnlqVWcxcGxyUXIxekMzS0xkUFppc3JrdzNrZWVadHlodVRoOHIzNUNQNWMvUGJGV3lGVE5HanRGS3VVQTRXVEMrb0szaGJHRnQ0dUVpOVNGclVNOTltL3VyNUl3dUNGbnk5a0xCUXVMQ3oyTGg0V2ZIZ0lyOUZ1eFlqaTFNWGR5NHhYVks2WkhocDhOSjl5MmpMc3BiOVVPSllVbFh5YW5uYzhvNVNnOUtscFVNcmdsYzBsYW1VeWN0dXJ2UmF1V01WWVpWa1ZlOXFsOVZiVm44cUY1VmZySENzcUs3NHNFYTQ1dUpYVGwvVmZQVjViZHJhM2txM3l1M3JTT3VrNjI2czkxbS9yMHE5YWtIVjBJYndEYTBiOFkzbEcxOXRTdDUwb1hwcTlZN050TTNLelFNMVlUWHRXOHkyck52eW9UYWo5bnFkZjEzTFZ2MnRxN2UrMlNiYTFyL2RkM3Z6RG9NZEZUdmU3NVRzdkxVcmVGZHJ2VVY5OVc3UzdvTGRqeHBpRzdxLzVuN2R1RWQzVDhXZWozdWxld2YyUmUvcmFuUnZiTnl2djcreUNXMVNObzBlU0RwdzVadUFiOXFiN1pwM3RYQmFLZzdDUWVYQko5K21mSHZqVU9paHpzUGN3ODNmbVgrMzlRanJTSGtyMGpxL2Rhd3RvMjJnUGFHOTcraU1vNTBkWGgxSHZyZi9mdTh4NDJOMXh6V1BWNTZnblNnOThmbmtncFBqcDJTbm5wMU9QejNVbWR4NTkwejhtV3RkVVYyOVowUFBuajhYZE81TXQxLzN5ZlBlNTQ5ZDhMeHc5Q0wzWXRzbHQwdXRQYTQ5UjM1dy9lRklyMXR2NjJYM3krMVhQSzUwOUUzck85SHYwMy82YXNEVmM5ZjQxeTVkbjNtOTc4YnNHN2R1SnQwY3VDVzY5ZmgyOXUwWGR3cnVUTnhkZW85NHIveSsydjNxQi9vUDZuKzAvckZsd0czZytHREFZTS9EV1EvdkRnbUhudjZVLzlPSDRkSkh6RWZWSTBZampZK2RIeDhiRFJxOThtVE9rK0duc3FjVHo4cCtWdjk1NjNPcjU5Lzk0dnRMejFqODJQQUwrWXZQdjY1NXFmTnk3NnVwcnpySEk4Y2Z2TTU1UGZHbS9LM08yMzN2dU8rNjM4ZTlINWtvL0VEK1VQUFIrbVBIcDlCUDl6N25mUDc4TC9lRTgvc3RSempQQUFBQUlHTklVazBBQUhvbUFBQ0FoQUFBK2dBQUFJRG9BQUIxTUFBQTZtQUFBRHFZQUFBWGNKeTZVVHdBQUFBSmNFaFpjd0FBTGlNQUFDNGpBWGlsUDNZQUFBQytTVVJCVkVpSjdaUTdFc013Q0VSaDczOW5wWkdHMzRMaktrWFVNRWI3Rm1Fc1dkWmFBaEc1NFlZZkJCRVJmVzFySFVwVFZVMHE1Nzd6N3ZRSUNmWmNTQm1pQUxCaEFFckthK1Q4a3lGQlRSdTFEblc5SE50R1F2cGtPNGpmemRaWUtSUE1saHlXTm11bFNnZ1lWVjYrd3FBZEJBNWp1N3pBWkdPT0FsZU92YSszQVlDYmMxTzVPTmhnSitSbEFVdkQ0U3JJUE5obW5HVWsrOERtU1c2QmZhalRsVmZUTmJEZDZuVDU4WjVMelhDalNoYlkxYTNJL0N1OTRSL0NCd1AxQ3ZiT1hYekJBQUFBQUVsRlRrU3VRbUNDJ1xyXG5cclxuICBleHBvcnQgdHlwZSBWTE1Db25maWcgPSBWTE1CYXNlUHJvcGVydGllcyAmIFZMTUNsaWNrYWJsZSAmIFZMTVRleHR1cmVPcHRpb25zICYgVkxNSW5zdGFuY2VkSXRlbVxyXG5cclxuICBleHBvcnQgY2xhc3MgQ29uZmlnIGV4dGVuZHMgVkxNQmFzZS5Db25maWcge1xyXG4gICAgc2VydmljZXM6IHsgbWF0ZXJpYWw6IE1hdGVyaWFsU2VydmljZTsgbWVzaDogTWVzaFNlcnZpY2U7IGNvbGxpZGVyOiBDb2xsaWRlclNlcnZpY2U7IHRyYW5zZm9ybTogVHJhbnNmb3JtU2VydmljZTsgY2xpY2tFdmVudDogQ2xpY2tFdmVudFNlcnZpY2UgfVxyXG4gICAgbWVzc2FnZU9wdGlvbnM/OiBWTE1Ob3RpZmljYXRpb24uTWVzc2FnZU9wdGlvbnNcclxuICAgIGdpdmVhd2F5SWQ6IHN0cmluZyA9ICcnXHJcbiAgICBwcm9wZXJ0aWVzOiBDbGFpbVBvaW50UHJvcGVydGllcyA9IHsgaG92ZXJUZXh0OiAnJyB9XHJcbiAgICBtZXNzYWdlczogdHlwZW9mIGRlZmF1bHRNZXNzYWdlcyA9IGRlZmF1bHRNZXNzYWdlc1xyXG4gICAgcmVxdWVzdENvbXBsZXRlOiBib29sZWFuID0gZmFsc2VcclxuICAgIGhhc0N1c3RvbUZ1bmN0aW9uczogYm9vbGVhbiA9IGZhbHNlXHJcbiAgICBkaXNhYmxlRGVmYXVsdHM6IGJvb2xlYW4gPSBmYWxzZVxyXG4gICAgY3VzdG9tRnVuY3Rpb25zPzogQ3VzdG9tRnVuY3Rpb25zXHJcbiAgICBwdWJsaWMgcmVxdWVzdEluUHJvZ3Jlc3M6IGJvb2xlYW4gPSBmYWxzZVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVkxNQ29uZmlnKSB7XHJcbiAgICAgIHN1cGVyKGNvbmZpZylcclxuICAgICAgVkxNRGVidWcubG9nKCdDcmVhdGluZyBDbGFpbSBQb2ludCBDb25maWcnLCBjb25maWcpXHJcbiAgICAgIHRoaXMuc2VydmljZXMgPSB7XHJcbiAgICAgICAgbWF0ZXJpYWw6IG5ldyBNYXRlcmlhbFNlcnZpY2UoKSxcclxuICAgICAgICBtZXNoOiBuZXcgTWVzaFNlcnZpY2UoKSxcclxuICAgICAgICBjb2xsaWRlcjogbmV3IENvbGxpZGVyU2VydmljZSgpLFxyXG4gICAgICAgIHRyYW5zZm9ybTogbmV3IFRyYW5zZm9ybVNlcnZpY2UoKSxcclxuICAgICAgICBjbGlja0V2ZW50OiBuZXcgQ2xpY2tFdmVudFNlcnZpY2UoKSxcclxuICAgICAgfVxyXG4gICAgICBpZiAoY29uZmlnPy5pbnN0YW5jZXM/Lmxlbmd0aCkge1xyXG4gICAgICAgIGNvbmZpZy5pbnN0YW5jZXMuZm9yRWFjaCgoaW5zdGFuY2U6IFZMTUluc3RhbmNlUHJvcGVydGllcykgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVPclJlcGxhY2VJbnN0YW5jZShpbnN0YW5jZSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLmN1c3RvbVJlbmRlcmluZykge1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcmFnZShjb25maWcpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5pbml0KGNvbmZpZylcclxuICAgIH1cclxuXHJcbiAgICBzZXRTdG9yYWdlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKGNvbmZpZzogVkxNQ29uZmlnKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBjb25maWcpXHJcblxyXG4gICAgICAgIGNvbmZpZ3NbdGhpcy5za10gPSB0aGlzXHJcblxyXG4gICAgICAgIGlmIChjb25maWcuY3VzdG9tSWQpIHtcclxuICAgICAgICAgIGNvbmZpZ3NbY29uZmlnLmN1c3RvbUlkXSA9IGNvbmZpZ3NbdGhpcy5za11cclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgZXJyb3JcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyBpbml0XHJcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgY29uZmlnXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIGluaXQ6IENhbGxhYmxlRnVuY3Rpb24gPSAoY29uZmlnOiBWTE1Db25maWcpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLnNldFN0b3JhZ2UoY29uZmlnKVxyXG5cclxuICAgICAgICBpZiAoIWNvbmZpZy5pbnN0YW5jZXMgfHwgY29uZmlnLmluc3RhbmNlcy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZy5pbnN0YW5jZXMuZm9yRWFjaCgoaW5zdGFuY2U6IFZMTUluc3RhbmNlUHJvcGVydGllcykgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVPclJlcGxhY2VJbnN0YW5jZShpbnN0YW5jZSlcclxuICAgICAgICB9KVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIHRocm93IGVycm9yXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgYWRkQWxsXHJcbiAgICAgKiBBZGRzIGFsbCBvZiB0aGUgY29uZmlnJ3MgaW5zdGFuY2VzIHRvIHRoZSBlbmdpbmVcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG5cclxuICAgIGFkZEFsbDogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlSWRzLmZvckVhY2goKGluc3RhbmNlSWQ6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgaW5zdGFuY2VzW2luc3RhbmNlSWRdLmFkZCgpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIHJlbW92ZVxyXG4gICAgICogIFJlbW92ZXMgdGhlIGNvbmZpZydzIGluc3RhbmNlcyBmcm9tIHRoZSBlbmdpbmUsIGtlZXBzIHRoZSBjb25maWcgYW5kIGluc3RhbmNlIHJlY29yZHMgc28gd2UgY2FuIGJyaW5nIHN0dWZmIGJhY2tcclxuICAgICAqICBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZTogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlSWRzLmZvckVhY2goKGluc3RhbmNlSWQ6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgaW5zdGFuY2VzW2luc3RhbmNlSWRdLnJlbW92ZSgpXHJcbiAgICAgICAgfSlcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIGRlbGV0ZVxyXG4gICAgICogRGVsZXRlcyB0aGUgY29uZmlnJ3MgbWF0ZXJpYWwgcmVjb3JkIEFORCByZW1vdmVzIHRoZSBjb25maWcncyBpbnN0YW5jZXMgZnJvbSB0aGUgZW5naW5lXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZTogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBkZWxldGUgY29uZmlnc1t0aGlzLnNrXVxyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VJZHMuZm9yRWFjaCgoaW5zdGFuY2VJZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICBpbnN0YW5jZXNbaW5zdGFuY2VJZF0uZGVsZXRlKClcclxuICAgICAgICB9KVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIHRocm93IGVycm9yXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgY3JlYXRlT3JSZXBsYWNlSW5zdGFuY2VcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZ1xyXG4gICAgICogQHBhcmFtIGNvbmZpZyAtIHRoZSBpbnN0YW5jZSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgY3JlYXRlT3JSZXBsYWNlSW5zdGFuY2U6IENhbGxhYmxlRnVuY3Rpb24gPSAoY29uZmlnOiBWTE1JbnN0YW5jZVByb3BlcnRpZXMpID0+IHtcclxuICAgICAgaWYgKCF0aGlzLmluc3RhbmNlSWRzLmluY2x1ZGVzKGNvbmZpZy5zaykpIHtcclxuICAgICAgICB0aGlzLmluc3RhbmNlSWRzLnB1c2goY29uZmlnLnNrKVxyXG4gICAgICB9XHJcbiAgICAgIC8vcmVwbGFjZSBpbnN0YW5jZSBpZiBpdCBhbHJlYWR5IGV4aXN0c1xyXG4gICAgICBpZiAoaW5zdGFuY2VzW2NvbmZpZy5za10pIHtcclxuICAgICAgICBlY3MuZW5naW5lLnJlbW92ZUVudGl0eShpbnN0YW5jZXNbY29uZmlnLnNrXS5lbnRpdHkpXHJcbiAgICAgICAgZGVsZXRlIGluc3RhbmNlc1tjb25maWcuc2tdXHJcbiAgICAgIH1cclxuICAgICAgbmV3IEluc3RhbmNlKHRoaXMsIGNvbmZpZylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWMgY3JlYXRlT3JSZXBsYWNlSW5zdGFuY2VcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZ1xyXG4gICAgICogQHBhcmFtIGNvbmZpZyAtIHRoZSBpbnN0YW5jZSBjb25maWdcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlSW5zdGFuY2U6IENhbGxhYmxlRnVuY3Rpb24gPSAoY29uZmlnOiBJbnN0YW5jZSkgPT4ge1xyXG4gICAgICAvL3JlcGxhY2UgaW5zdGFuY2UgaWYgaXQgYWxyZWFkeSBleGlzdHNcclxuICAgICAgaWYgKGluc3RhbmNlc1tjb25maWcuc2tdKSB7XHJcbiAgICAgICAgaW5zdGFuY2VzW2NvbmZpZy5za10ucmVtb3ZlKClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyBkZWxldGVJbnN0YW5jZVxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnXHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIC0gdGhlIGluc3RhbmNlIGNvbmZpZ1xyXG4gICAgICogQHJldHVybnMgdm9pZFxyXG4gICAgICovXHJcbiAgICBkZWxldGVJbnN0YW5jZTogQ2FsbGFibGVGdW5jdGlvbiA9IChjb25maWc6IEluc3RhbmNlKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5pbnN0YW5jZUlkcy5pbmNsdWRlcyhjb25maWcuc2spKSB7XHJcbiAgICAgICAgdGhpcy5pbnN0YW5jZUlkcyA9IHRoaXMuaW5zdGFuY2VJZHMuZmlsdGVyKChpbnN0YW5jZUlkOiBzdHJpbmcpID0+IGluc3RhbmNlSWQgIT09IGNvbmZpZy5zaylcclxuICAgICAgfVxyXG4gICAgICAvL3JlcGxhY2UgaW5zdGFuY2UgaWYgaXQgYWxyZWFkeSBleGlzdHNcclxuICAgICAgaWYgKGluc3RhbmNlc1tjb25maWcuc2tdKSB7XHJcbiAgICAgICAgaW5zdGFuY2VzW2NvbmZpZy5za10uZGVsZXRlKClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsYWltOiBDYWxsYWJsZUZ1bmN0aW9uID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBnaXZlYXdheUlkID0gdGhpcy5naXZlYXdheUlkXHJcblxyXG4gICAgICBpZiAoIVZMTVNlc3Npb25NYW5hZ2VyLnNlc3Npb25EYXRhLmhhc0Nvbm5lY3RlZFdlYjMgJiYgdGhpcy5jdXN0b21GdW5jdGlvbnM/Lm5vV2FsbGV0KSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21GdW5jdGlvbnMubm9XYWxsZXQoKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9IGVsc2UgaWYgKCFWTE1TZXNzaW9uTWFuYWdlci5zZXNzaW9uRGF0YS5oYXNDb25uZWN0ZWRXZWIzICYmICF0aGlzLmN1c3RvbUZ1bmN0aW9ucz8ubm9XYWxsZXQpIHtcclxuICAgICAgICBWTE1Ob3RpZmljYXRpb25NYW5hZ2VyLmFkZE1lc3NhZ2UobWVzc2FnZXMubm9XYWxsZXQpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH0gZWxzZSBpZiAoXHJcbiAgICAgICAgKHRoaXMucmVxdWVzdENvbXBsZXRlIHx8IHRoaXMucmVxdWVzdEluUHJvZ3Jlc3MpICYmXHJcbiAgICAgICAgIXRoaXMuZGlzYWJsZURlZmF1bHRzICYmXHJcbiAgICAgICAgVkxNTm90aWZpY2F0aW9uTWFuYWdlci5tZXNzYWdlUXVldWUubGVuZ3RoIDwgMSAmJlxyXG4gICAgICAgICF0aGlzLmhhc0N1c3RvbUZ1bmN0aW9uc1xyXG4gICAgICApIHtcclxuICAgICAgICBWTE1Ob3RpZmljYXRpb25NYW5hZ2VyLmFkZE1lc3NhZ2UobWVzc2FnZXMuY2xhaW1JblByb2dyZXNzKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9IGVsc2UgaWYgKCh0aGlzLnJlcXVlc3RJblByb2dyZXNzIHx8IHRoaXMucmVxdWVzdENvbXBsZXRlKSAmJiBWTE1Ob3RpZmljYXRpb25NYW5hZ2VyLm1lc3NhZ2VRdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1ZXN0Q29tcGxldGUpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5yZXF1ZXN0SW5Qcm9ncmVzcyA9IHRydWVcclxuXHJcbiAgICAgIGlmICghdGhpcy5oYXNDdXN0b21GdW5jdGlvbnMpIHtcclxuICAgICAgICBWTE1Ob3RpZmljYXRpb25NYW5hZ2VyLmFkZE1lc3NhZ2UobWVzc2FnZXMuY2xhaW1TdWJtaXR0ZWQsIHsgZGVsYXk6IDAuNSB9KVxyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuY3VzdG9tRnVuY3Rpb25zPy5jbGFpbVN1Ym1pdHRlZCkge1xyXG4gICAgICAgIHRoaXMuY3VzdG9tRnVuY3Rpb25zLmNsYWltU3VibWl0dGVkKClcclxuICAgICAgfVxyXG5cclxuICAgICAgVkxNRXZlbnRNYW5hZ2VyLmV2ZW50cy5lbWl0KCdWTE1DbGFpbUV2ZW50JywgeyBhY3Rpb246ICdnaXZlYXdheV9jbGFpbScsIGdpdmVhd2F5SWQsIHNrOiB0aGlzLnNrIHx8ICcnIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcnVuQ2xhaW1GdW5jdGlvbjogQ2FsbGFibGVGdW5jdGlvbiA9IChyZXNwb25zZTogVkxNQ2xhaW1Qb2ludC5DbGFpbVJlc3BvbnNlKSA9PiB7XHJcbiAgICAgIFZMTURlYnVnLmxvZygnaW5mbycsICdWTE1DbGFpbVBvaW4ucnVuQ2xhaW1GdW5jdGlvbicsIHJlc3BvbnNlKVxyXG5cclxuICAgICAgY29uc3QgY2xhaW1Qb2ludCA9IFZMTUNsYWltUG9pbnQuY29uZmlnc1tyZXNwb25zZS5za10sXHJcbiAgICAgICAgbWVzc2FnZU9wdGlvbnMgPSBjbGFpbVBvaW50Lm1lc3NhZ2VPcHRpb25zIHx8IG51bGwsXHJcbiAgICAgICAgbWVzc2FnZXMgPSBjbGFpbVBvaW50Lm1lc3NhZ2VzXHJcblxyXG4gICAgICBpZiAocmVzcG9uc2UucmVzcG9uc2VUeXBlID09PSBWTE1DbGFpbVBvaW50LkNsYWltUmVzcG9uc2VUeXBlLkNMQUlNX0RFTklFRCkge1xyXG4gICAgICAgIHRoaXMucmVxdWVzdENvbXBsZXRlID0gdHJ1ZVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChyZXNwb25zZS5yZXNwb25zZVR5cGUgPT09IFZMTUNsYWltUG9pbnQuQ2xhaW1SZXNwb25zZVR5cGUuQ0xBSU1fQUNDRVBURUQgJiYgdGhpcy5jdXN0b21GdW5jdGlvbnM/LnN1Y2Nlc3NmdWxDbGFpbSkge1xyXG4gICAgICAgIHRoaXMuY3VzdG9tRnVuY3Rpb25zLnN1Y2Nlc3NmdWxDbGFpbSgpXHJcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UucmVzcG9uc2VUeXBlID09PSBWTE1DbGFpbVBvaW50LkNsYWltUmVzcG9uc2VUeXBlLkNMQUlNX1NFUlZFUl9FUlJPUiAmJiB0aGlzLmN1c3RvbUZ1bmN0aW9ucz8uZXJyb3JNZXNzYWdlKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21GdW5jdGlvbnMuZXJyb3JNZXNzYWdlKClcclxuICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5yZWFzb24gPT09IFZMTUNsYWltUG9pbnQuQ2xhaW1SZWplY3Rpb24uQkVGT1JFX0VWRU5UX1NUQVJUICYmIHRoaXMuY3VzdG9tRnVuY3Rpb25zPy5iZWZvcmVFdmVudFRpbWUpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5iZWZvcmVFdmVudFRpbWUoKVxyXG4gICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnJlYXNvbiA9PT0gVkxNQ2xhaW1Qb2ludC5DbGFpbVJlamVjdGlvbi5BRlRFUl9FVkVOVF9FTkQgJiYgdGhpcy5jdXN0b21GdW5jdGlvbnM/LmFmdGVyRXZlbnRUaW1lKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21GdW5jdGlvbnMuYWZ0ZXJFdmVudFRpbWUoKVxyXG4gICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnJlYXNvbiA9PT0gVkxNQ2xhaW1Qb2ludC5DbGFpbVJlamVjdGlvbi5FWElTVElOR19XQUxMRVRfQ0xBSU0gJiYgdGhpcy5jdXN0b21GdW5jdGlvbnM/LmV4aXN0aW5nQ2xhaW0pIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5leGlzdGluZ0NsYWltKClcclxuICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5yZWFzb24gPT09IFZMTUNsYWltUG9pbnQuQ2xhaW1SZWplY3Rpb24uQ0xBSU1fQ09NUExFVEUgJiYgdGhpcy5jdXN0b21GdW5jdGlvbnM/LmNsYWltQ29tcGxldGUpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5jbGFpbUNvbXBsZXRlKClcclxuICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5yZWFzb24gPT09IFZMTUNsYWltUG9pbnQuQ2xhaW1SZWplY3Rpb24uT1ZFUl9JUF9MSU1JVCAmJiB0aGlzLmN1c3RvbUZ1bmN0aW9ucz8uaXBMaW1pdFJlYWNoZWQpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5pcExpbWl0UmVhY2hlZCgpXHJcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UucmVhc29uID09PSBWTE1DbGFpbVBvaW50LkNsYWltUmVqZWN0aW9uLlNVUFBMWV9ERVBMRVRFRCAmJiB0aGlzLmN1c3RvbUZ1bmN0aW9ucz8ubm9TdXBwbHkpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5ub1N1cHBseSgpXHJcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UucmVhc29uID09PSBWTE1DbGFpbVBvaW50LkNsYWltUmVqZWN0aW9uLklOQVVUSEVOVElDICYmIHRoaXMuY3VzdG9tRnVuY3Rpb25zPy5pbmF1dGhlbnRpY0Nvbm5lY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5pbmF1dGhlbnRpY0Nvbm5lY3Rpb24oKVxyXG4gICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnJlYXNvbiA9PT0gVkxNQ2xhaW1Qb2ludC5DbGFpbVJlamVjdGlvbi5OT19MSU5LRURfRVZFTlRTICYmIHRoaXMuY3VzdG9tRnVuY3Rpb25zPy5ub0xpbmtlZEV2ZW50cykge1xyXG4gICAgICAgIHRoaXMuY3VzdG9tRnVuY3Rpb25zLm5vTGlua2VkRXZlbnRzKClcclxuICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5yZWFzb24gPT09IFZMTUNsYWltUG9pbnQuQ2xhaW1SZWplY3Rpb24uUEFVU0VEICYmIHRoaXMuY3VzdG9tRnVuY3Rpb25zPy5wYXVzZWQpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5wYXVzZWQoKVxyXG4gICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnJlYXNvbiA9PT0gVkxNQ2xhaW1Qb2ludC5DbGFpbVJlamVjdGlvbi5PVkVSX0RBSUxZX0xJTUlUICYmIHRoaXMuY3VzdG9tRnVuY3Rpb25zPy5kYWlseUxpbWl0UmVhY2hlZCkge1xyXG4gICAgICAgIHRoaXMuY3VzdG9tRnVuY3Rpb25zLmRhaWx5TGltaXRSZWFjaGVkKClcclxuICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5yZWFzb24gPT09IFZMTUNsYWltUG9pbnQuQ2xhaW1SZWplY3Rpb24uT1ZFUl9XRUVLTFlfTElNSVQgJiYgdGhpcy5jdXN0b21GdW5jdGlvbnM/Lm90aGVyTGltaXRSZWFjaGVkKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21GdW5jdGlvbnMub3RoZXJMaW1pdFJlYWNoZWQoKVxyXG4gICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnJlYXNvbiA9PT0gVkxNQ2xhaW1Qb2ludC5DbGFpbVJlamVjdGlvbi5PVkVSX01PTlRITFlfTElNSVQgJiYgdGhpcy5jdXN0b21GdW5jdGlvbnM/Lm90aGVyTGltaXRSZWFjaGVkKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21GdW5jdGlvbnMub3RoZXJMaW1pdFJlYWNoZWQoKVxyXG4gICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnJlYXNvbiA9PT0gVkxNQ2xhaW1Qb2ludC5DbGFpbVJlamVjdGlvbi5PVkVSX1lFQVJMWV9MSU1JVCAmJiB0aGlzLmN1c3RvbUZ1bmN0aW9ucz8ub3RoZXJMaW1pdFJlYWNoZWQpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5vdGhlckxpbWl0UmVhY2hlZCgpXHJcbiAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UucmVzcG9uc2VUeXBlID09PSBWTE1DbGFpbVBvaW50LkNsYWltUmVzcG9uc2VUeXBlLkNMQUlNX0RFTklFRCAmJiB0aGlzLmN1c3RvbUZ1bmN0aW9ucz8uY2xhaW1EZW5pZWQpIHtcclxuICAgICAgICB0aGlzLmN1c3RvbUZ1bmN0aW9ucy5jbGFpbURlbmllZCgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGV4cG9ydCBjb25zdCBzZXRDbGFpbUZ1bmN0aW9uczogQ2FsbGFibGVGdW5jdGlvbiA9IChjdXN0b21JZDogc3RyaW5nLCBjbGFpbUZ1bmN0aW9uczogQ3VzdG9tRnVuY3Rpb25zLCBvcHRpb25zPzogeyBkaXNhYmxlRGVmYXVsdHM6IGJvb2xlYW4gfSkgPT4ge1xyXG4gICAgaWYgKGN1c3RvbUlkICYmIGNsYWltRnVuY3Rpb25zICYmIGNvbmZpZ3NbY3VzdG9tSWRdKSB7XHJcbiAgICAgIGNvbmZpZ3NbY3VzdG9tSWRdLmhhc0N1c3RvbUZ1bmN0aW9ucyA9IHRydWVcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbmZpZ3NbY3VzdG9tSWRdLmhhc0N1c3RvbUZ1bmN0aW9ucyA9IGZhbHNlXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbY3VzdG9tSWRdLFxyXG4gICAgICBvcmlnaW5hbENvbmZpZyA9IGNvbmZpZ3NbY29uZmlnLnNrXVxyXG5cclxuICAgIGNvbmZpZy5kaXNhYmxlRGVmYXVsdHMgPSAhIW9wdGlvbnM/LmRpc2FibGVEZWZhdWx0c1xyXG4gICAgY29uZmlnLmN1c3RvbUZ1bmN0aW9ucyA9IGNsYWltRnVuY3Rpb25zXHJcbiAgICBvcmlnaW5hbENvbmZpZy5jdXN0b21GdW5jdGlvbnMgPSBjbGFpbUZ1bmN0aW9uc1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGNsYXNzIEluc3RhbmNlIGV4dGVuZHMgVkxNQmFzZS5JbnN0YW5jZSB7XHJcbiAgICBraW9za0VudGl0aWVzOiB7XHJcbiAgICAgIHRvcEVudGl0eT86IEVudGl0eVxyXG4gICAgICBnbGFzc0VudGl0eT86IEVudGl0eVxyXG4gICAgICBiYXNlRW50aXR5PzogRW50aXR5XHJcbiAgICAgIGJhc2VUb3BFbnRpdHk/OiBFbnRpdHlcclxuICAgICAgYmFzZUJvdHRvbUVudGl0eT86IEVudGl0eVxyXG4gICAgICBidXR0b25FbnRpdHk/OiBFbnRpdHlcclxuICAgICAgYnV0dG9uSG91c2luZ0VudGl0eT86IEVudGl0eVxyXG4gICAgICBib290aExpZ2h0RW50aXR5PzogRW50aXR5XHJcbiAgICB9ID0ge31cclxuICAgIGNsYWltSXRlbUVudGl0eT86IEVudGl0eSA9IGVjcy5lbmdpbmUuYWRkRW50aXR5KClcclxuICAgIGVudGl0eTogRW50aXR5ID0gZWNzLmVuZ2luZS5hZGRFbnRpdHkoKVxyXG4gICAgcHJvcGVydGllczogQ2xhaW1Qb2ludFByb3BlcnRpZXMgPSB7IGhvdmVyVGV4dDogJycgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29uZmlnLCBpbnN0YW5jZUNvbmZpZzogVkxNSW5zdGFuY2VQcm9wZXJ0aWVzKSB7XHJcbiAgICAgIHN1cGVyKGNvbmZpZywgaW5zdGFuY2VDb25maWcpXHJcbiAgICAgIGlmICghdGhpcy5jdXN0b21SZW5kZXJpbmcpIHtcclxuICAgICAgICB0aGlzLmluaXQoY29uZmlnLCBpbnN0YW5jZUNvbmZpZylcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNldFN0b3JhZ2UoaW5zdGFuY2VDb25maWcpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTdG9yYWdlOiBDYWxsYWJsZUZ1bmN0aW9uID0gKGNvbmZpZzogVkxNQ29uZmlnKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBjb25maWcpXHJcblxyXG4gICAgICAgIGluc3RhbmNlc1t0aGlzLnNrXSA9IHRoaXNcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VzdG9tSWQpIHtcclxuICAgICAgICAgIGluc3RhbmNlc1t0aGlzLmN1c3RvbUlkXSA9IGluc3RhbmNlc1t0aGlzLnNrXVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIGluaXRcclxuICAgICAqIGluaXRpYWxpemVzIHRoZSBpbnN0YW5jZVxyXG4gICAgICogQHJldHVybnMgdm9pZFxyXG4gICAgICovXHJcbiAgICBpbml0OiBDYWxsYWJsZUZ1bmN0aW9uID0gKGNvbmZpZzogQ29uZmlnLCBpbnN0YW5jZUNvbmZpZzogSW5zdGFuY2UpID0+IHtcclxuICAgICAgdGhpcy5zZXRTdG9yYWdlKGluc3RhbmNlQ29uZmlnKVxyXG5cclxuICAgICAgaWYgKCF0aGlzLnByb3BlcnRpZXMpIHtcclxuICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSBjb25maWcucHJvcGVydGllcyB8fCB7IGhvdmVyVGV4dDogJycgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoY29uZmlnLmN1c3RvbVJlbmRlcmluZyB8fCAhY29uZmlnLmVuYWJsZWQgfHwgIXRoaXMuZW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlKClcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uZmlnPy5zZXJ2aWNlcz8udHJhbnNmb3JtPy5zZXQodGhpcy5lbnRpdHksIHtcclxuICAgICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICBzY2FsZTogdGhpcy5zY2FsZSxcclxuICAgICAgICByb3RhdGlvbjogdGhpcy5yb3RhdGlvbixcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuZ2VuZXJhdGVDbGFpbUl0ZW0oY29uZmlnKVxyXG5cclxuICAgICAgaWYgKHRoaXMucHJvcGVydGllcy5lbmFibGVLaW9zaykge1xyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVTdGFuZGFyZEJvb3RoKClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUtpb3NrKClcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMucHJvcGVydGllcy5lbmFibGVLaW9zayAmJiB0aGlzLnByb3BlcnRpZXMuZW5hYmxlU3Bpbikge1xyXG4gICAgICAgIHRoaXMuc3BpbkNsYWltSXRlbSgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyBhZGRcclxuICAgICAqIEFkZHMgdGhlIGluc3RhbmNlIHRvIHRoZSBlbmdpbmVcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqL1xyXG5cclxuICAgIGFkZDogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoaW5zdGFuY2VzW3RoaXMuc2tdKSB7XHJcbiAgICAgICAgICB0aGlzLmluaXQoY29uZmlnc1t0aGlzLmNvbmZpZ0lkXSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgdGhyb3cgZXJyb3JcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHB1YmxpYyByZW1vdmVcclxuICAgICAqICBSZW1vdmVzIHRoZSBpbnN0YW5jZSBmcm9tIHRoZSBlbmdpbmUsIGtlZXBzIHRoZSBjb25maWcgYW5kIGluc3RhbmNlIHJlY29yZHMgc28gd2UgY2FuIGJyaW5nIHN0dWZmIGJhY2tcclxuICAgICAqICBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZTogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBlY3MuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSlcclxuICAgICAgICBlY3MuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmNsYWltSXRlbUVudGl0eSlcclxuICAgICAgICB0aGlzLnJlbW92ZUtpb3NrKClcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIHJlbW92ZUtpb3NrXHJcbiAgICAgKiAgUmVtb3ZlcyB0aGUgaW5zdGFuY2UncyBraW9zayBmcm9tIHRoZSBlbmdpbmUsIGtlZXBzIHRoZSBjb25maWcgYW5kIGluc3RhbmNlIHJlY29yZHMgc28gd2UgY2FuIGJyaW5nIHN0dWZmIGJhY2tcclxuICAgICAqICBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUtpb3NrOiBDYWxsYWJsZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMua2lvc2tFbnRpdGllcykuZm9yRWFjaCgoW2tleSwgZW50aXR5XTogW3N0cmluZywgRW50aXR5XSkgPT4ge1xyXG4gICAgICAgICAgaWYgKGVjcy5lbmdpbmUuZ2V0RW50aXR5U3RhdGUoZW50aXR5KSA9PT0gRW50aXR5U3RhdGUuVXNlZEVudGl0eSkge1xyXG4gICAgICAgICAgICBlY3MuZW5naW5lLnJlbW92ZUVudGl0eShlbnRpdHkpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIGRlbGV0ZVxyXG4gICAgICogRGVsZXRlcyB0aGUgY29uZmlnJ3MgbWF0ZXJpYWwgcmVjb3JkIEFORCByZW1vdmVzIHRoZSBjb25maWcncyBpbnN0YW5jZXMgZnJvbSB0aGUgZW5naW5lXHJcbiAgICAgKiBAcmV0dXJucyB2b2lkXHJcbiAgICAgKi9cclxuICAgIGRlbGV0ZTogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGluc3RhbmNlc1t0aGlzLnNrXSkge1xyXG4gICAgICAgICAgZGVsZXRlIGluc3RhbmNlc1t0aGlzLnNrXVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2VuZXJhdGVDbGFpbUl0ZW06IENhbGxhYmxlRnVuY3Rpb24gPSAoY29uZmlnOiBDb25maWcpID0+IHtcclxuICAgICAgY29uc3Qgb2JqVGhpcyA9IHRoaXMsXHJcbiAgICAgICAgeyBob3ZlclRleHQgfSA9IHRoaXMucHJvcGVydGllc1xyXG5cclxuICAgICAgdGhpcy5jbGFpbUl0ZW1FbnRpdHkgPSB0aGlzLmNsYWltSXRlbUVudGl0eSB8fCBlY3MuZW5naW5lLmFkZEVudGl0eSgpXHJcblxyXG4gICAgICBpZiAoIWNvbmZpZz8uc2VydmljZXMpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBpZiAodGhpcy5wcm9wZXJ0aWVzLnR5cGUgPT0gQ2xhaW1Qb2ludFR5cGUuTU9ERUwgJiYgdGhpcy5wcm9wZXJ0aWVzLm1vZGVsU3JjKSB7XHJcbiAgICAgICAgY29uZmlnPy5zZXJ2aWNlcy50cmFuc2Zvcm0uc2V0KHRoaXMuY2xhaW1JdGVtRW50aXR5LCB7XHJcbiAgICAgICAgICBwb3NpdGlvbjogVmVjdG9yMy5aZXJvKCksXHJcbiAgICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgICB4OiAxLFxyXG4gICAgICAgICAgICB5OiAxLFxyXG4gICAgICAgICAgICB6OiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJvdGF0aW9uOiB7IHg6IDAsIHk6IDAsIHo6IDAgfSxcclxuICAgICAgICAgIHBhcmVudDogdGhpcy5lbnRpdHksXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25maWc/LnNlcnZpY2VzLm1lc2guc2V0KHRoaXMuY2xhaW1JdGVtRW50aXR5LCAnZ2x0ZicsIHtcclxuICAgICAgICAgIHNyYzogYCR7Z2V0TW9kZWxQYXRoKHRoaXMucHJvcGVydGllcy5tb2RlbFNyYyl9YCxcclxuICAgICAgICB9KVxyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcGVydGllcy50eXBlID09IENsYWltUG9pbnRUeXBlLkNVU1RPTV9JTUFHRSAmJiB0aGlzLnByb3BlcnRpZXMuaW1nU3JjKSB7XHJcbiAgICAgICAgY29uc3QgdGV4dHVyZSA9IE1hdGVyaWFsLlRleHR1cmUuQ29tbW9uKHsgc3JjOiB0aGlzLnByb3BlcnRpZXMuaW1nU3JjIH0pXHJcbiAgICAgICAgY29uZmlnLnNlcnZpY2VzLm1lc2guc2V0KHRoaXMuY2xhaW1JdGVtRW50aXR5LCAncGxhbmUnKVxyXG4gICAgICAgIGNvbmZpZy5zZXJ2aWNlcy5jb2xsaWRlci5zZXQodGhpcy5jbGFpbUl0ZW1FbnRpdHksICdwbGFuZScsIHRydWUsIHRydWUpXHJcbiAgICAgICAgY29uZmlnLnNlcnZpY2VzLm1hdGVyaWFsLnNldCh0aGlzLmNsYWltSXRlbUVudGl0eSwgJ2Jhc2ljJywge1xyXG4gICAgICAgICAgdGV4dHVyZTogdGV4dHVyZSxcclxuICAgICAgICAgIGVtaXNzaXZlVGV4dHVyZTogdGV4dHVyZSxcclxuICAgICAgICAgIGFsYmVkb0NvbG9yOiBDb2xvcjQuV2hpdGUoKSxcclxuICAgICAgICAgIGVtaXNzaXZlQ29sb3I6IENvbG9yNC5XaGl0ZSgpLFxyXG4gICAgICAgICAgZW1pc3NpdmVJbnRlbnNpdHk6IDIsXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0aGlzLnByb3BlcnRpZXMuZW5hYmxlS2lvc2sgJiYgdGhpcy5wcm9wZXJ0aWVzLnR5cGUgPT0gQ2xhaW1Qb2ludFR5cGUuQ1VTVE9NX0lNQUdFKSB7XHJcbiAgICAgICAgY29uZmlnLnNlcnZpY2VzLnRyYW5zZm9ybS5zZXQodGhpcy5jbGFpbUl0ZW1FbnRpdHksIHtcclxuICAgICAgICAgIHBvc2l0aW9uOiB7XHJcbiAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgIHk6IDEgKyAodGhpcy5wcm9wZXJ0aWVzLml0ZW1ZT2Zmc2V0IHx8IDApLFxyXG4gICAgICAgICAgICB6OiAwLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHNjYWxlOiB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMuc2NhbGUueCAqICh0aGlzLnByb3BlcnRpZXMuaXRlbVNjYWxlIHx8IDEpLFxyXG4gICAgICAgICAgICB5OiB0aGlzLnNjYWxlLnkgKiAodGhpcy5wcm9wZXJ0aWVzLml0ZW1TY2FsZSB8fCAxKSxcclxuICAgICAgICAgICAgejogdGhpcy5wcm9wZXJ0aWVzLnR5cGUgPT0gQ2xhaW1Qb2ludFR5cGUuQ1VTVE9NX0lNQUdFID8gMC4wMSA6IHRoaXMuc2NhbGUueiAqICh0aGlzLnByb3BlcnRpZXMuaXRlbVNjYWxlIHx8IDEpLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJvdGF0aW9uOiB7IHg6IDAsIHk6IDAsIHo6IDAgfSxcclxuICAgICAgICAgIHBhcmVudDogdGhpcy5lbnRpdHksXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0aGlzLnByb3BlcnRpZXMuZW5hYmxlS2lvc2sgfHwgIXRoaXMucHJvcGVydGllcy5lbmFibGVCdXR0b24pIHtcclxuICAgICAgICBjb25maWcuc2VydmljZXMuY2xpY2tFdmVudC5zZXRDdXN0b21Eb3duKHRoaXMuY2xhaW1JdGVtRW50aXR5LCB7IGhvdmVyVGV4dCB9LCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICBhd2FpdCBjb25maWcuY2xhaW0oKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uZmlnLnNlcnZpY2VzLmNsaWNrRXZlbnQuY2xlYXJBbGwodGhpcy5jbGFpbUl0ZW1FbnRpdHkpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzcGluQ2xhaW1JdGVtOiBDYWxsYWJsZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuY2xhaW1JdGVtRW50aXR5KSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgZWNzLlR3ZWVuLmNyZWF0ZU9yUmVwbGFjZSh0aGlzLmNsYWltSXRlbUVudGl0eSwge1xyXG4gICAgICAgIG1vZGU6IFR3ZWVuLk1vZGUuUm90YXRlKHtcclxuICAgICAgICAgIHN0YXJ0OiBRdWF0ZXJuaW9uLmZyb21FdWxlckRlZ3JlZXMoMCwgMCwgMCksXHJcbiAgICAgICAgICBlbmQ6IFF1YXRlcm5pb24uZnJvbUV1bGVyRGVncmVlcygwLCAxODAsIDApLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIGR1cmF0aW9uOiAzMDAwLFxyXG4gICAgICAgIGVhc2luZ0Z1bmN0aW9uOiBFYXNpbmdGdW5jdGlvbi5FRl9MSU5FQVIsXHJcbiAgICAgIH0pXHJcbiAgICAgIGVjcy5Ud2VlblNlcXVlbmNlLmNyZWF0ZU9yUmVwbGFjZSh0aGlzLmNsYWltSXRlbUVudGl0eSwge1xyXG4gICAgICAgIGxvb3A6IFR3ZWVuTG9vcC5UTF9SRVNUQVJULFxyXG4gICAgICAgIHNlcXVlbmNlOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGU6IFR3ZWVuLk1vZGUuUm90YXRlKHtcclxuICAgICAgICAgICAgICBzdGFydDogUXVhdGVybmlvbi5mcm9tRXVsZXJEZWdyZWVzKDAsIDE4MCwgMCksXHJcbiAgICAgICAgICAgICAgZW5kOiBRdWF0ZXJuaW9uLmZyb21FdWxlckRlZ3JlZXMoMCwgMzYwLCAwKSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAzMDAwLFxyXG4gICAgICAgICAgICBlYXNpbmdGdW5jdGlvbjogRWFzaW5nRnVuY3Rpb24uRUZfTElORUFSLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGdlbmVyYXRlU3RhbmRhcmRCb290aDogQ2FsbGFibGVGdW5jdGlvbiA9ICgpID0+IHtcclxuICAgICAgY29uc3Qgb2JqVGhpcyA9IHRoaXMsXHJcbiAgICAgICAgY29uZmlnID0gY29uZmlnc1t0aGlzLmNvbmZpZ0lkXVxyXG5cclxuICAgICAgY29uc3QgeyBjb2xvcjEsIGNvbG9yMiwgY29sb3IzLCBob3ZlclRleHQgfSA9IHRoaXMucHJvcGVydGllcyxcclxuICAgICAgICBwcmltYXJ5Q29sb3IgPSBjb2xvcjEgPyBDb2xvcjQuY3JlYXRlKGNvbG9yMS5yIC8gMjU1LCBjb2xvcjEuZyAvIDI1NSwgY29sb3IxLmIgLyAyNTUsIGNvbG9yMS5hKSA6IENvbG9yNC5XaGl0ZSgpLFxyXG4gICAgICAgIHNlY29uZGFyeUNvbG9yID0gY29sb3IyID8gQ29sb3I0LmNyZWF0ZShjb2xvcjIuciAvIDI1NSwgY29sb3IyLmcgLyAyNTUsIGNvbG9yMi5iIC8gMjU1LCBjb2xvcjIuYSkgOiBDb2xvcjQuV2hpdGUoKSxcclxuICAgICAgICBnbGFzc0NvbG9yID0gY29sb3IzID8gQ29sb3I0LmNyZWF0ZShjb2xvcjMuciAvIDI1NSwgY29sb3IzLmcgLyAyNTUsIGNvbG9yMy5iIC8gMjU1LCBjb2xvcjMuYSkgOiBDb2xvcjQuV2hpdGUoKVxyXG5cclxuICAgICAgdGhpcy5raW9za0VudGl0aWVzLmJhc2VFbnRpdHkgPSB0aGlzLmtpb3NrRW50aXRpZXMuYmFzZUVudGl0eSB8fCBlY3MuZW5naW5lLmFkZEVudGl0eSgpXHJcbiAgICAgIHRoaXMua2lvc2tFbnRpdGllcy50b3BFbnRpdHkgPSB0aGlzLmtpb3NrRW50aXRpZXMudG9wRW50aXR5IHx8IGVjcy5lbmdpbmUuYWRkRW50aXR5KClcclxuICAgICAgdGhpcy5raW9za0VudGl0aWVzLmJhc2VUb3BFbnRpdHkgPSB0aGlzLmtpb3NrRW50aXRpZXMuYmFzZVRvcEVudGl0eSB8fCBlY3MuZW5naW5lLmFkZEVudGl0eSgpXHJcbiAgICAgIHRoaXMua2lvc2tFbnRpdGllcy5iYXNlQm90dG9tRW50aXR5ID0gdGhpcy5raW9za0VudGl0aWVzLmJhc2VCb3R0b21FbnRpdHkgfHwgZWNzLmVuZ2luZS5hZGRFbnRpdHkoKVxyXG4gICAgICB0aGlzLmtpb3NrRW50aXRpZXMuZ2xhc3NFbnRpdHkgPSB0aGlzLmtpb3NrRW50aXRpZXMuZ2xhc3NFbnRpdHkgfHwgZWNzLmVuZ2luZS5hZGRFbnRpdHkoKVxyXG5cclxuICAgICAgaWYgKHRoaXMucHJvcGVydGllcy5lbmFibGVCdXR0b24pIHtcclxuICAgICAgICB0aGlzLmdlbmVyYXRlQ2xhaW1CdXR0b24oKVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnByb3BlcnRpZXMuZW5hYmxlTGlnaHQgfHwgdHJ1ZSkge1xyXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVCb290aExpZ2h0KClcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLm1lc2guc2V0KHRoaXMua2lvc2tFbnRpdGllcy5iYXNlRW50aXR5LCAnY3lsaW5kZXInKVxyXG4gICAgICBjb25maWcuc2VydmljZXMubWVzaC5zZXQodGhpcy5raW9za0VudGl0aWVzLnRvcEVudGl0eSwgJ2N5bGluZGVyJylcclxuICAgICAgY29uZmlnLnNlcnZpY2VzLm1lc2guc2V0KHRoaXMua2lvc2tFbnRpdGllcy5iYXNlVG9wRW50aXR5LCAnY3lsaW5kZXInKVxyXG4gICAgICBjb25maWcuc2VydmljZXMubWVzaC5zZXQodGhpcy5raW9za0VudGl0aWVzLmJhc2VCb3R0b21FbnRpdHksICdjeWxpbmRlcicpXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5tZXNoLnNldCh0aGlzLmtpb3NrRW50aXRpZXMuZ2xhc3NFbnRpdHksICdjeWxpbmRlcicpXHJcblxyXG4gICAgICBjb25maWcuc2VydmljZXMuY29sbGlkZXIuc2V0KHRoaXMua2lvc2tFbnRpdGllcy5iYXNlRW50aXR5LCAnY3lsaW5kZXInLCB0cnVlLCB0cnVlKVxyXG4gICAgICBjb25maWcuc2VydmljZXMuY29sbGlkZXIuc2V0KHRoaXMua2lvc2tFbnRpdGllcy50b3BFbnRpdHksICdjeWxpbmRlcicsIHRydWUsIHRydWUpXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5jb2xsaWRlci5zZXQodGhpcy5raW9za0VudGl0aWVzLmJhc2VUb3BFbnRpdHksICdjeWxpbmRlcicsIHRydWUsIHRydWUpXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5jb2xsaWRlci5zZXQodGhpcy5raW9za0VudGl0aWVzLmJhc2VCb3R0b21FbnRpdHksICdjeWxpbmRlcicsIHRydWUsIHRydWUpXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5jb2xsaWRlci5zZXQodGhpcy5raW9za0VudGl0aWVzLmdsYXNzRW50aXR5LCAnY3lsaW5kZXInLCB0cnVlLCB0cnVlKVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnRyYW5zZm9ybS5zZXQodGhpcy5raW9za0VudGl0aWVzLmJhc2VFbnRpdHksIHtcclxuICAgICAgICBwb3NpdGlvbjogVmVjdG9yMy5jcmVhdGUoMCwgMC41LCAwKSxcclxuICAgICAgICBzY2FsZTogVmVjdG9yMy5jcmVhdGUoLTAuODUsIDEsIDAuODUpLFxyXG4gICAgICAgIHJvdGF0aW9uOiB7IHg6IDAsIHk6IDkwLCB6OiAwIH0sXHJcbiAgICAgICAgcGFyZW50OiB0aGlzLmVudGl0eSxcclxuICAgICAgfSlcclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnRyYW5zZm9ybS5zZXQodGhpcy5raW9za0VudGl0aWVzLnRvcEVudGl0eSwge1xyXG4gICAgICAgIHBvc2l0aW9uOiBWZWN0b3IzLmNyZWF0ZSgwLCAyLjUsIDApLFxyXG4gICAgICAgIHNjYWxlOiBWZWN0b3IzLmNyZWF0ZSgxLCAwLjEsIDEpLFxyXG4gICAgICAgIHJvdGF0aW9uOiB7IHg6IDAsIHk6IDAsIHo6IDAgfSxcclxuICAgICAgICBwYXJlbnQ6IHRoaXMuZW50aXR5LFxyXG4gICAgICB9KVxyXG4gICAgICBjb25maWcuc2VydmljZXMudHJhbnNmb3JtLnNldCh0aGlzLmtpb3NrRW50aXRpZXMuYmFzZVRvcEVudGl0eSwge1xyXG4gICAgICAgIHBvc2l0aW9uOiBWZWN0b3IzLmNyZWF0ZSgwLCAxLCAwKSxcclxuICAgICAgICBzY2FsZTogVmVjdG9yMy5jcmVhdGUoMSwgMC4xLCAxKSxcclxuICAgICAgICByb3RhdGlvbjogeyB4OiAwLCB5OiAwLCB6OiAwIH0sXHJcbiAgICAgICAgcGFyZW50OiB0aGlzLmVudGl0eSxcclxuICAgICAgfSlcclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnRyYW5zZm9ybS5zZXQodGhpcy5raW9za0VudGl0aWVzLmJhc2VCb3R0b21FbnRpdHksIHtcclxuICAgICAgICBwb3NpdGlvbjogVmVjdG9yMy5jcmVhdGUoMCwgMCwgMCksXHJcbiAgICAgICAgc2NhbGU6IFZlY3RvcjMuY3JlYXRlKDEsIDAuMSwgMSksXHJcbiAgICAgICAgcm90YXRpb246IHsgeDogMCwgeTogMCwgejogMCB9LFxyXG4gICAgICAgIHBhcmVudDogdGhpcy5lbnRpdHksXHJcbiAgICAgIH0pXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy50cmFuc2Zvcm0uc2V0KHRoaXMua2lvc2tFbnRpdGllcy5nbGFzc0VudGl0eSwge1xyXG4gICAgICAgIHBvc2l0aW9uOiBWZWN0b3IzLmNyZWF0ZSgwLCAxLjc1LCAwKSxcclxuICAgICAgICBzY2FsZTogVmVjdG9yMy5jcmVhdGUoMC44NSwgMS41LCAwLjg1KSxcclxuICAgICAgICByb3RhdGlvbjogeyB4OiAwLCB5OiAwLCB6OiAwIH0sXHJcbiAgICAgICAgcGFyZW50OiB0aGlzLmVudGl0eSxcclxuICAgICAgfSlcclxuXHJcbiAgICAgIGNvbnN0IGJhc2VUZXh0dXJlID0gb2JqVGhpcy5wcm9wZXJ0aWVzPy5raW9za0ltZ1NyYyAmJiBNYXRlcmlhbC5UZXh0dXJlLkNvbW1vbih7IHNyYzogb2JqVGhpcy5wcm9wZXJ0aWVzLmtpb3NrSW1nU3JjIH0pXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5tYXRlcmlhbC5zZXQodGhpcy5raW9za0VudGl0aWVzLmJhc2VFbnRpdHksICdwYnInLCB7XHJcbiAgICAgICAgdGV4dHVyZTogYmFzZVRleHR1cmUsXHJcbiAgICAgICAgZW1pc3NpdmVUZXh0dXJlOiBiYXNlVGV4dHVyZSxcclxuICAgICAgICBlbWlzc2l2ZUNvbG9yOiBDb2xvcjMuY3JlYXRlKHByaW1hcnlDb2xvci5yLCBwcmltYXJ5Q29sb3IuZywgcHJpbWFyeUNvbG9yLmIpLFxyXG4gICAgICAgIGFsYmVkb0NvbG9yOiBwcmltYXJ5Q29sb3IsXHJcbiAgICAgICAgLy8gZW1pc3NpdmVJbnRlbnNpdHk6IDEuNzUsXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25maWcuc2VydmljZXMubWF0ZXJpYWwuc2V0KHRoaXMua2lvc2tFbnRpdGllcy50b3BFbnRpdHksICdwYnInLCB7XHJcbiAgICAgICAgYWxiZWRvQ29sb3I6IHNlY29uZGFyeUNvbG9yLFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLm1hdGVyaWFsLnNldCh0aGlzLmtpb3NrRW50aXRpZXMuYmFzZVRvcEVudGl0eSwgJ3BicicsIHtcclxuICAgICAgICBhbGJlZG9Db2xvcjogc2Vjb25kYXJ5Q29sb3IsXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25maWcuc2VydmljZXMubWF0ZXJpYWwuc2V0KHRoaXMua2lvc2tFbnRpdGllcy5iYXNlQm90dG9tRW50aXR5LCAncGJyJywge1xyXG4gICAgICAgIGFsYmVkb0NvbG9yOiBzZWNvbmRhcnlDb2xvcixcclxuICAgICAgfSlcclxuXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5tYXRlcmlhbC5zZXQodGhpcy5raW9za0VudGl0aWVzLmdsYXNzRW50aXR5LCAncGJyJywge1xyXG4gICAgICAgIGFsYmVkb0NvbG9yOiBnbGFzc0NvbG9yLFxyXG4gICAgICAgIGVtaXNzaXZlQ29sb3I6IENvbG9yMy5jcmVhdGUoZ2xhc3NDb2xvci5yLCBnbGFzc0NvbG9yLmcsIGdsYXNzQ29sb3IuYiksXHJcbiAgICAgICAgcmVmbGVjdGl2aXR5Q29sb3I6IENvbG9yMy5XaGl0ZSgpLFxyXG4gICAgICAgIHNwZWN1bGFySW50ZW5zaXR5OiAxMCxcclxuICAgICAgICBtZXRhbGxpYzogMSxcclxuICAgICAgICByb3VnaG5lc3M6IDAuMDUsXHJcbiAgICAgICAgZW1pc3NpdmVJbnRlbnNpdHk6IDAuMSxcclxuICAgICAgfSlcclxuXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy50cmFuc2Zvcm0uc2V0KHRoaXMuY2xhaW1JdGVtRW50aXR5LCB7XHJcbiAgICAgICAgcG9zaXRpb246IHtcclxuICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICB5OiAxICsgKHRoaXMucHJvcGVydGllcy5pdGVtWU9mZnNldCB8fCAwKSxcclxuICAgICAgICAgIHo6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzY2FsZToge1xyXG4gICAgICAgICAgeDogdGhpcy5zY2FsZS54ICogKHRoaXMucHJvcGVydGllcy5pdGVtU2NhbGUgfHwgMSksXHJcbiAgICAgICAgICB5OiB0aGlzLnNjYWxlLnkgKiAodGhpcy5wcm9wZXJ0aWVzLml0ZW1TY2FsZSB8fCAxKSxcclxuICAgICAgICAgIHo6IHRoaXMucHJvcGVydGllcy50eXBlID09IENsYWltUG9pbnRUeXBlLkNVU1RPTV9JTUFHRSA/IDAuMDEgOiB0aGlzLnNjYWxlLnogKiAodGhpcy5wcm9wZXJ0aWVzLml0ZW1TY2FsZSB8fCAxKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvdGF0aW9uOiB7IHg6IDAsIHk6IDAsIHo6IDAgfSxcclxuICAgICAgICBwYXJlbnQ6IHRoaXMuZW50aXR5LFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgaWYgKCF0aGlzLnByb3BlcnRpZXMuZW5hYmxlQnV0dG9uKSB7XHJcbiAgICAgICAgY29uZmlnLnNlcnZpY2VzLmNsaWNrRXZlbnQuc2V0Q3VzdG9tRG93bih0aGlzLmtpb3NrRW50aXRpZXMuYmFzZUVudGl0eSwgeyBob3ZlclRleHQgfSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgYXdhaXQgY29uZmlnLmNsYWltKClcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25maWcuc2VydmljZXMuY2xpY2tFdmVudC5zZXRDdXN0b21Eb3duKHRoaXMua2lvc2tFbnRpdGllcy5iYXNlVG9wRW50aXR5LCB7IGhvdmVyVGV4dCB9LCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICBhd2FpdCBjb25maWcuY2xhaW0oKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbmZpZy5zZXJ2aWNlcy5jbGlja0V2ZW50LnNldEN1c3RvbURvd24odGhpcy5raW9za0VudGl0aWVzLmdsYXNzRW50aXR5LCB7IGhvdmVyVGV4dCB9LCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICBhd2FpdCBjb25maWcuY2xhaW0oKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uZmlnLnNlcnZpY2VzLmNsaWNrRXZlbnQuY2xlYXJBbGwodGhpcy5jbGFpbUl0ZW1FbnRpdHkpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUNsYWltQnV0dG9uOiBDYWxsYWJsZUZ1bmN0aW9uID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBvYmpUaGlzID0gdGhpcyxcclxuICAgICAgICBjb25maWcgPSBjb25maWdzW3RoaXMuY29uZmlnSWRdLFxyXG4gICAgICAgIHsgY29sb3IyLCBjb2xvcjQsIGhvdmVyVGV4dCB9ID0gb2JqVGhpcy5wcm9wZXJ0aWVzLFxyXG4gICAgICAgIHNlY29uZGFyeUNvbG9yID0gY29sb3IyID8gQ29sb3I0LmNyZWF0ZShjb2xvcjIuciAvIDI1NSwgY29sb3IyLmcgLyAyNTUsIGNvbG9yMi5iIC8gMjU1LCBjb2xvcjIuYSkgOiBDb2xvcjQuV2hpdGUoKSxcclxuICAgICAgICBidXR0b25Db2xvciA9IGNvbG9yNCA/IENvbG9yNC5jcmVhdGUoY29sb3I0LnIgLyAyNTUsIGNvbG9yNC5nIC8gMjU1LCBjb2xvcjQuYiAvIDI1NSwgY29sb3I0LmEpIDogQ29sb3I0LlJlZCgpXHJcblxyXG4gICAgICB0aGlzLmtpb3NrRW50aXRpZXMuYnV0dG9uSG91c2luZ0VudGl0eSA9IHRoaXMua2lvc2tFbnRpdGllcy5idXR0b25Ib3VzaW5nRW50aXR5IHx8IGVjcy5lbmdpbmUuYWRkRW50aXR5KClcclxuICAgICAgdGhpcy5raW9za0VudGl0aWVzLmJ1dHRvbkVudGl0eSA9IHRoaXMua2lvc2tFbnRpdGllcy5idXR0b25FbnRpdHkgfHwgZWNzLmVuZ2luZS5hZGRFbnRpdHkoKVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLm1lc2guc2V0KHRoaXMua2lvc2tFbnRpdGllcy5idXR0b25Ib3VzaW5nRW50aXR5LCAnYm94JylcclxuICAgICAgY29uZmlnLnNlcnZpY2VzLm1lc2guc2V0KHRoaXMua2lvc2tFbnRpdGllcy5idXR0b25FbnRpdHksICdib3gnKVxyXG4gICAgICBjb25maWcuc2VydmljZXMuY29sbGlkZXIuc2V0KHRoaXMua2lvc2tFbnRpdGllcy5idXR0b25FbnRpdHksICdib3gnLCBmYWxzZSwgdHJ1ZSlcclxuXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy50cmFuc2Zvcm0uc2V0KHRoaXMua2lvc2tFbnRpdGllcy5idXR0b25Ib3VzaW5nRW50aXR5LCB7XHJcbiAgICAgICAgcG9zaXRpb246IFZlY3RvcjMuY3JlYXRlKDAsIDAuOTgsIC0wLjQzKSxcclxuICAgICAgICBzY2FsZTogVmVjdG9yMy5jcmVhdGUoMC4xNSwgMC4yNSwgMC4xNSksXHJcbiAgICAgICAgcm90YXRpb246IHsgeDogLTQ1LCB5OiAwLCB6OiAwIH0sXHJcbiAgICAgICAgcGFyZW50OiB0aGlzLmVudGl0eSxcclxuICAgICAgfSlcclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnRyYW5zZm9ybS5zZXQodGhpcy5raW9za0VudGl0aWVzLmJ1dHRvbkVudGl0eSwge1xyXG4gICAgICAgIHBvc2l0aW9uOiBWZWN0b3IzLmNyZWF0ZSgwLCAwLjk4LCAtMC40MyksXHJcbiAgICAgICAgc2NhbGU6IFZlY3RvcjMuY3JlYXRlKDAuMSwgMC4zLCAwLjEpLFxyXG4gICAgICAgIHJvdGF0aW9uOiB7IHg6IC00NSwgeTogMCwgejogMCB9LFxyXG4gICAgICAgIHBhcmVudDogdGhpcy5lbnRpdHksXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25maWcuc2VydmljZXMubWF0ZXJpYWwuc2V0KHRoaXMua2lvc2tFbnRpdGllcy5idXR0b25Ib3VzaW5nRW50aXR5LCAncGJyJywge1xyXG4gICAgICAgIGFsYmVkb0NvbG9yOiBzZWNvbmRhcnlDb2xvcixcclxuICAgICAgICByZWZsZWN0aXZpdHlDb2xvcjogQ29sb3IzLmNyZWF0ZShzZWNvbmRhcnlDb2xvci5yLCBzZWNvbmRhcnlDb2xvci5nLCBzZWNvbmRhcnlDb2xvci5iKSxcclxuICAgICAgICBzcGVjdWxhckludGVuc2l0eTogMCxcclxuICAgICAgICBlbWlzc2l2ZUludGVuc2l0eTogMCxcclxuICAgICAgfSlcclxuXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5tYXRlcmlhbC5zZXQodGhpcy5raW9za0VudGl0aWVzLmJ1dHRvbkVudGl0eSwgJ3BicicsIHtcclxuICAgICAgICBhbGJlZG9Db2xvcjogYnV0dG9uQ29sb3IsXHJcbiAgICAgICAgZW1pc3NpdmVDb2xvcjogQ29sb3IzLmNyZWF0ZShidXR0b25Db2xvci5yLCBidXR0b25Db2xvci5nLCBidXR0b25Db2xvci5iKSxcclxuICAgICAgICByZWZsZWN0aXZpdHlDb2xvcjogQ29sb3IzLmNyZWF0ZShidXR0b25Db2xvci5yLCBidXR0b25Db2xvci5nLCBidXR0b25Db2xvci5iKSxcclxuICAgICAgICBlbWlzc2l2ZUludGVuc2l0eTogMC41LFxyXG4gICAgICB9KVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLmNsaWNrRXZlbnQuc2V0Q3VzdG9tRG93bih0aGlzLmtpb3NrRW50aXRpZXMuYnV0dG9uRW50aXR5LCB7IGhvdmVyVGV4dCB9LCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgb2JqVGhpcy5wcmVzc0J1dHRvbigpXHJcbiAgICAgICAgYXdhaXQgY29uZmlnLmNsYWltKClcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBnZW5lcmF0ZUJvb3RoTGlnaHQ6IENhbGxhYmxlRnVuY3Rpb24gPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG9ialRoaXMgPSB0aGlzLFxyXG4gICAgICAgIGNvbmZpZyA9IGNvbmZpZ3NbdGhpcy5jb25maWdJZF0sXHJcbiAgICAgICAgeyBjb2xvcjIsIGNvbG9yNCwgY29sb3I1LCBob3ZlclRleHQgfSA9IG9ialRoaXMucHJvcGVydGllcyxcclxuICAgICAgICBzZWNvbmRhcnlDb2xvciA9IGNvbG9yMiA/IENvbG9yNC5jcmVhdGUoY29sb3IyLnIgLyAyNTUsIGNvbG9yMi5nIC8gMjU1LCBjb2xvcjIuYiAvIDI1NSwgY29sb3IyLmEpIDogQ29sb3I0LldoaXRlKCksXHJcbiAgICAgICAgYnV0dG9uQ29sb3IgPSBjb2xvcjQgPyBDb2xvcjQuY3JlYXRlKGNvbG9yNC5yIC8gMjU1LCBjb2xvcjQuZyAvIDI1NSwgY29sb3I0LmIgLyAyNTUsIGNvbG9yNC5hKSA6IENvbG9yNC5SZWQoKSxcclxuICAgICAgICBsaWdodENvbG9yID0gY29sb3I1ID8gQ29sb3I0LmNyZWF0ZShjb2xvcjUuciAvIDI1NSwgY29sb3I1LmcgLyAyNTUsIGNvbG9yNS5iIC8gMjU1LCBjb2xvcjUuYSkgOiBDb2xvcjQuY3JlYXRlKDEsIDEsIDEsIDAuMjUpXHJcblxyXG4gICAgICB0aGlzLmtpb3NrRW50aXRpZXMuYm9vdGhMaWdodEVudGl0eSA9IHRoaXMua2lvc2tFbnRpdGllcy5ib290aExpZ2h0RW50aXR5IHx8IGVjcy5lbmdpbmUuYWRkRW50aXR5KClcclxuXHJcbiAgICAgIGNvbmZpZy5zZXJ2aWNlcy5tZXNoLnNldCh0aGlzLmtpb3NrRW50aXRpZXMuYm9vdGhMaWdodEVudGl0eSwgJ2N5bGluZGVyJywgeyByYWRpdXNUb3A6IDAuMzUsIHJhZGl1c0JvdHRvbTogMC4xNSB9KVxyXG5cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnRyYW5zZm9ybS5zZXQodGhpcy5raW9za0VudGl0aWVzLmJvb3RoTGlnaHRFbnRpdHksIHtcclxuICAgICAgICBwb3NpdGlvbjogVmVjdG9yMy5jcmVhdGUoMCwgMS41LCAwKSxcclxuICAgICAgICBzY2FsZTogVmVjdG9yMy5jcmVhdGUoMSwgMiwgMSksXHJcbiAgICAgICAgcm90YXRpb246IHsgeDogMCwgeTogMCwgejogMCB9LFxyXG4gICAgICAgIHBhcmVudDogdGhpcy5lbnRpdHksXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25zdCBsaWdodFRleHR1cmUgPSBNYXRlcmlhbC5UZXh0dXJlLkNvbW1vbih7IHNyYzogYm9vdGhMaWdodEltYWdlQmFzZTY0IH0pXHJcblxyXG4gICAgICBjb25maWcuc2VydmljZXMubWF0ZXJpYWwuc2V0KHRoaXMua2lvc2tFbnRpdGllcy5ib290aExpZ2h0RW50aXR5LCAncGJyJywge1xyXG4gICAgICAgIHRleHR1cmU6IGxpZ2h0VGV4dHVyZSxcclxuICAgICAgICBlbWlzc2l2ZVRleHR1cmU6IGxpZ2h0VGV4dHVyZSxcclxuICAgICAgICBhbHBoYVRleHR1cmU6IGxpZ2h0VGV4dHVyZSxcclxuICAgICAgICB0cmFuc3BhcmVuY3lNb2RlOiBNYXRlcmlhbFRyYW5zcGFyZW5jeU1vZGUuTVRNX0FMUEhBX0JMRU5ELFxyXG4gICAgICAgIGFsYmVkb0NvbG9yOiBsaWdodENvbG9yLFxyXG4gICAgICAgIGVtaXNzaXZlQ29sb3I6IENvbG9yMy5jcmVhdGUobGlnaHRDb2xvci5yLCBsaWdodENvbG9yLmcsIGxpZ2h0Q29sb3IuYiksXHJcbiAgICAgICAgZW1pc3NpdmVJbnRlbnNpdHk6IDIsXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcHJlc3NCdXR0b246IENhbGxhYmxlRnVuY3Rpb24gPSAoKSA9PiB7XHJcbiAgICAgIGVjcy5Ud2Vlbi5jcmVhdGVPclJlcGxhY2UodGhpcy5raW9za0VudGl0aWVzLmJ1dHRvbkVudGl0eSwge1xyXG4gICAgICAgIG1vZGU6IFR3ZWVuLk1vZGUuU2NhbGUoe1xyXG4gICAgICAgICAgc3RhcnQ6IFZlY3RvcjMuY3JlYXRlKDAuMSwgMC4zLCAwLjEpLFxyXG4gICAgICAgICAgZW5kOiBWZWN0b3IzLmNyZWF0ZSgwLjEsIDAuMjU1LCAwLjEpLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIGR1cmF0aW9uOiAyMDAsXHJcbiAgICAgICAgZWFzaW5nRnVuY3Rpb246IEVhc2luZ0Z1bmN0aW9uLkVGX0xJTkVBUixcclxuICAgICAgfSlcclxuXHJcbiAgICAgIGVjcy5Ud2VlblNlcXVlbmNlLmNyZWF0ZU9yUmVwbGFjZSh0aGlzLmtpb3NrRW50aXRpZXMuYnV0dG9uRW50aXR5LCB7XHJcbiAgICAgICAgc2VxdWVuY2U6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZHVyYXRpb246IDIwMCxcclxuICAgICAgICAgICAgZWFzaW5nRnVuY3Rpb246IEVhc2luZ0Z1bmN0aW9uLkVGX0xJTkVBUixcclxuICAgICAgICAgICAgbW9kZTogVHdlZW4uTW9kZS5TY2FsZSh7XHJcbiAgICAgICAgICAgICAgc3RhcnQ6IFZlY3RvcjMuY3JlYXRlKDAuMSwgMC4yNTUsIDAuMSksXHJcbiAgICAgICAgICAgICAgZW5kOiBWZWN0b3IzLmNyZWF0ZSgwLjEsIDAuMywgMC4xKSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljIHVwZGF0ZVRyYW5zZm9ybVxyXG4gICAgICogVXBkYXRlcyB0aGUgaW5zdGFuY2UncyB0cmFuc2Zvcm1cclxuICAgICAqIEBwYXJhbSBwb3NpdGlvbiAtIHRoZSBwb3NpdGlvbiBvZiB0aGUgaW5zdGFuY2VcclxuICAgICAqIEBwYXJhbSBzY2FsZSAtIHRoZSBzY2FsZSBvZiB0aGUgaW5zdGFuY2VcclxuICAgICAqIEBwYXJhbSByb3RhdGlvbiAtIHRoZSByb3RhdGlvbiBvZiB0aGUgaW5zdGFuY2VcclxuICAgICAqIEByZXR1cm5zIHZvaWRcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIHVwZGF0ZVRyYW5zZm9ybTogQ2FsbGFibGVGdW5jdGlvbiA9IChwb3NpdGlvbj86IFZlY3RvcjMsIHNjYWxlPzogVmVjdG9yMywgcm90YXRpb24/OiBWZWN0b3IzKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbdGhpcy5jb25maWdJZF1cclxuICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uIHx8IHRoaXMucG9zaXRpb25cclxuICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlIHx8IHRoaXMuc2NhbGVcclxuICAgICAgdGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uIHx8IHRoaXMucm90YXRpb25cclxuICAgICAgY29uZmlnLnNlcnZpY2VzLnRyYW5zZm9ybS5zZXQodGhpcy5lbnRpdHksIHtcclxuICAgICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcclxuICAgICAgICBzY2FsZTogdGhpcy5zY2FsZSxcclxuICAgICAgICByb3RhdGlvbjogdGhpcy5yb3RhdGlvbixcclxuICAgICAgICBwYXJlbnQ6IHRoaXMucGFyZW50LFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGludGVyZmFjZSBDbGFpbVJlc3BvbnNlIHtcclxuICAgIHNrOiBzdHJpbmdcclxuICAgIGdpdmVhd2F5SWQ/OiBzdHJpbmdcclxuICAgIHJlc3BvbnNlVHlwZT86IENsYWltUmVzcG9uc2VUeXBlXHJcbiAgICByZWFzb24/OiBDbGFpbVJlamVjdGlvblxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGVudW0gQ2xhaW1TdGF0dXMge1xyXG4gICAgUEVORElORyA9ICdwZW5kaW5nJyxcclxuICAgIFFVRVVFRCA9ICdxdWV1ZWQnLFxyXG4gICAgSU5fUFJPR1JFU1MgPSAnaW5fcHJvZ3Jlc3MnLFxyXG4gICAgQ09NUExFVEUgPSAnY29tcGxldGUnLFxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGVudW0gQ2xhaW1SZWplY3Rpb24ge1xyXG4gICAgUEFVU0VEID0gJ3BhdXNlZCcsXHJcbiAgICBCRUZPUkVfRVZFTlRfU1RBUlQgPSAnYmVmb3JlX2V2ZW50X3N0YXJ0JyxcclxuICAgIEFGVEVSX0VWRU5UX0VORCA9ICdhZnRlcl9ldmVudF9lbmQnLFxyXG4gICAgRVhJU1RJTkdfV0FMTEVUX0NMQUlNID0gJ2V4aXN0aW5nX3dhbGxldF9jbGFpbScsXHJcbiAgICBDTEFJTV9DT01QTEVURSA9ICdjbGFpbV9jb21wbGV0ZScsXHJcbiAgICBTVVBQTFlfREVQTEVURUQgPSAnc3VwcGx5X2RlcGxldGVkJyxcclxuICAgIElOQVVUSEVOVElDID0gJ2luYXV0aGVudGljJyxcclxuICAgIFNVU1BJQ0lPVVMgPSAnc3VzcGljaW91cycsXHJcbiAgICBOT19MSU5LRURfRVZFTlRTID0gJ25vX2xpbmtlZF9ldmVudHMnLFxyXG4gICAgT1ZFUl9JUF9MSU1JVCA9ICdvdmVyX2lwX2xpbWl0JyxcclxuICAgIE9WRVJfREFJTFlfTElNSVQgPSAnb3Zlcl9kYWlseV9saW1pdCcsXHJcbiAgICBPVkVSX1dFRUtMWV9MSU1JVCA9ICdvdmVyX3dlZWtseV9saW1pdCcsXHJcbiAgICBPVkVSX01PTlRITFlfTElNSVQgPSAnb3Zlcl9tb250aGx5X2xpbWl0JyxcclxuICAgIE9WRVJfWUVBUkxZX0xJTUlUID0gJ292ZXJfeWVhcmx5X2xpbWl0JyxcclxuICAgIE9WRVJfTElNSVQgPSAnb3Zlcl9saW1pdCcsXHJcbiAgfVxyXG5cclxuICBleHBvcnQgZW51bSBDbGFpbVJlc3BvbnNlVHlwZSB7XHJcbiAgICBDTEFJTV9BQ0NFUFRFRCA9ICdjbGFpbV9hY2NlcHRlZCcsXHJcbiAgICBDTEFJTV9ERU5JRUQgPSAnY2xhaW1fZGVuaWVkJyxcclxuICAgIENMQUlNX0lOX1BST0dSRVNTID0gJ2NsYWltX2luX3Byb2dyZXNzJyxcclxuICAgIENMQUlNX1NFUlZFUl9FUlJPUiA9ICdjbGFpbV9zZXJ2ZXJfZXJyb3InLFxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGludGVyZmFjZSBDbGFpbVBvaW50UHJvcGVydGllcyB7XHJcbiAgICBlbmFibGVLaW9zaz86IGJvb2xlYW5cclxuICAgIGVuYWJsZVNwaW4/OiBib29sZWFuXHJcbiAgICBlbmFibGVCdXR0b24/OiBib29sZWFuXHJcbiAgICBlbmFibGVMaWdodD86IGJvb2xlYW5cclxuICAgIHR5cGU/OiBDbGFpbVBvaW50VHlwZVxyXG4gICAgaW1nU3JjPzogc3RyaW5nXHJcbiAgICBtb2RlbFNyYz86IHN0cmluZ1xyXG4gICAgbWFubmVxdWluVHlwZT86IE1hbm5lcXVpblR5cGVcclxuICAgIGhvdmVyVGV4dD86IHN0cmluZ1xyXG4gICAgY29sb3IxPzogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfVxyXG4gICAgY29sb3IyPzogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfVxyXG4gICAgY29sb3IzPzogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfVxyXG4gICAgY29sb3I0PzogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfVxyXG4gICAgY29sb3I1PzogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfVxyXG4gICAga2lvc2tJbWdTcmM/OiBzdHJpbmdcclxuICAgIGl0ZW1ZT2Zmc2V0PzogbnVtYmVyXHJcbiAgICBpdGVtU2NhbGU/OiBudW1iZXJcclxuICB9XHJcbiAgZXhwb3J0IGVudW0gQ2xhaW1Qb2ludFR5cGUge1xyXG4gICAgTUFSS0VUUExBQ0VfSU1BR0UsXHJcbiAgICBDVVNUT01fSU1BR0UsXHJcbiAgICBNT0RFTCxcclxuICAgIE1BTk5FUVVJTixcclxuICB9XHJcblxyXG4gIGV4cG9ydCBlbnVtIE1hbm5lcXVpblR5cGUge1xyXG4gICAgTUFMRSxcclxuICAgIEZFTUFMRSxcclxuICAgIE1BVENIX1BMQVlFUixcclxuICB9XHJcblxyXG4gIGV4cG9ydCB0eXBlIEN1c3RvbUZ1bmN0aW9ucyA9IHtcclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIHdoZW4gdGhlIHVzZXIgaGFzIG5vIHdhbGxldCBjb25uZWN0ZWRcclxuICAgIG5vV2FsbGV0OiBDYWxsYWJsZUZ1bmN0aW9uXHJcblxyXG4gICAgLy8gTWVzc2FnZSBkaXNwbGF5ZWQgd2hpbGUgdGhlIGNsYWltIGlzIGJlaW5nIHByb2Nlc3NlZDpcclxuICAgIGNsYWltU3VibWl0dGVkOiBDYWxsYWJsZUZ1bmN0aW9uXHJcblxyXG4gICAgLy8gTWVzc2FnZSBkaXNwbGF5ZWQgd2hpbGUgdGhlIGNsYWltIGlzIGJlaW5nIHByb2Nlc3NlZDpcclxuICAgIGNsYWltSW5Qcm9ncmVzczogQ2FsbGFibGVGdW5jdGlvblxyXG5cclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIGFmdGVyIGEgc3VjY2Vzc2Z1bCBjbGFpbTpcclxuICAgIHN1Y2Nlc3NmdWxDbGFpbTogQ2FsbGFibGVGdW5jdGlvblxyXG5cclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIGlmIHRoZSBjdXJyZW50IHRpbWUgaXMgYmVmb3JlIHRoZSBldmVudCBzdGFydHM6XHJcbiAgICBiZWZvcmVFdmVudFRpbWU6IENhbGxhYmxlRnVuY3Rpb25cclxuXHJcbiAgICAvLyBNZXNzYWdlIGRpc3BsYXllZCBpZiB0aGUgZXZlbnQgaGFzIGVuZGVkOlxyXG4gICAgYWZ0ZXJFdmVudFRpbWU6IENhbGxhYmxlRnVuY3Rpb25cclxuXHJcbiAgICAvLyBNZXNzYWdlIGRpc3BsYXllZCBpZiBzb21lb25lIHRyaWVzIHRvIGhpdCBjbGFpbSBhZ2FpbiBhZnRlciBhbHJlYWR5IG1ha2luZyBhIGNsYWltOlxyXG4gICAgZXhpc3RpbmdDbGFpbTogQ2FsbGFibGVGdW5jdGlvblxyXG5cclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIGlmIHNvbWVvbmUgdHJpZXMgdG8gaGl0IGNsYWltIGFnYWluIGFmdGVyIHRoZWlyIHdlYXJhYmxlIHdhcyBhbHJlYWR5IGRlbGl2ZXJlZDpcclxuICAgIGNsYWltQ29tcGxldGU6IENhbGxhYmxlRnVuY3Rpb25cclxuXHJcbiAgICAvLyBNZXNzYWdlIGRpc3BsYXllZCBpZiBhIGRhaWx5IGxpbWl0IGhhcyBiZWVuIHJlYWNoZWQ6XHJcbiAgICBkYWlseUxpbWl0UmVhY2hlZDogQ2FsbGFibGVGdW5jdGlvblxyXG5cclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIGlmIGEgZGFpbHkgbGltaXQgaGFzIGJlZW4gcmVhY2hlZDpcclxuICAgIG90aGVyTGltaXRSZWFjaGVkOiBDYWxsYWJsZUZ1bmN0aW9uXHJcblxyXG4gICAgLy8gTWVzc2FnZSBkaXNwbGF5ZWQgaWYgc29tZW9uZSBoYXMgcmVhY2hlZCB0aGUgbGltaXQgZm9yIGNsYWltcyBmcm9tIG9uZSBJUCBhZGRyZXNzOlxyXG4gICAgaXBMaW1pdFJlYWNoZWQ6IENhbGxhYmxlRnVuY3Rpb25cclxuXHJcbiAgICAvLyBNZXNzYWdlIGRpc3BsYXllZCBpZiBhbGwgaXRlbXMgaGF2ZSBiZWVuIGNsYWltZWQ6XHJcbiAgICBub1N1cHBseTogQ2FsbGFibGVGdW5jdGlvblxyXG5cclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIGlmIHRoZSBzZXJ2ZXIgZGV0ZWN0cyBhIFZQTiBjb25uZWN0aW9uIG9yIG90aGVyIHdheXMgdG8gY2lyY3VtdmVudCB0aGUgSVAgbGltaXQ6XHJcbiAgICBpbmF1dGhlbnRpY0Nvbm5lY3Rpb246IENhbGxhYmxlRnVuY3Rpb25cclxuXHJcbiAgICAvLyBNZXNzYWdlIGRpc3BsYXllZCBpZiB0aGUgc2VydmVyIGNhbm5vdCBmaW5kIGEgbGlua2VkIGV2ZW50IGZvciB0aGUgZ2l2ZWF3YXk6XHJcbiAgICBub0xpbmtlZEV2ZW50czogQ2FsbGFibGVGdW5jdGlvblxyXG5cclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIGlmIHRoZSBnaXZlYXdheSBpcyBwYXVzZWQ6XHJcbiAgICBwYXVzZWQ6IENhbGxhYmxlRnVuY3Rpb25cclxuXHJcbiAgICAvLyBHZW5lcmljIGRlZmF1bHQgbWVzc2FnZSBkaXNwbGF5ZWQgaWYgdGhlIHNlcnZlciByZWplY3RzIHRoZSBjbGFpbSBmb3Igc29tZSBvdGhlciByZWFzb246XHJcbiAgICBjbGFpbURlbmllZDogQ2FsbGFibGVGdW5jdGlvblxyXG5cclxuICAgIC8vIE1lc3NhZ2UgZGlzcGxheWVkIHdoZW4gc29tZSBzb3J0IG9mIGVycm9yIG9jY3VycyBvbiB0aGUgYmFjayBlbmQ6XHJcbiAgICBlcnJvck1lc3NhZ2U6IENhbGxhYmxlRnVuY3Rpb25cclxuICB9XHJcbn1cclxuIl19