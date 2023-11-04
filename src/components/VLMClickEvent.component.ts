import { VLMSessionAction } from "./VLMSystemEvents.component";
import { VLMSessionManager } from "../logic/VLMSession.logic";
import { SimpleTransform } from "../shared/interfaces";
import { Entity, InputAction, pointerEventsSystem, PBVector3 } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";
import { TeleportToRequest, openExternalUrl, teleportTo, movePlayerTo } from "~system/RestrictedActions"

export namespace VLMClickEvent {
  export enum Actions {
    NONE,
    EXTERNAL,
    TRACKING_ONLY,
    SOUND,
    STREAM,
    MOVE,
    TELEPORT,
  }

  export class Config {
    entity: Entity;
    type: Actions;
    showFeedback: boolean;
    hoverText: string;
    externalLink?: string;
    sound?: string;
    moveTo?: { cameraTarget: SimpleTransform; position: SimpleTransform; setCameraTarget: boolean };
    teleportTo?: string | TeleportToRequest;
    hasTracking?: boolean;
    trackingId?: string;
    synced?: boolean;
    function: CallableFunction = () => { };

    constructor(config: Config) {
      try {
        this.entity = config.entity;
        this.type = config.type || Actions.NONE;
        this.showFeedback = config.showFeedback;
        this.hoverText = config.hoverText;
        this.externalLink = config.externalLink;
        this.sound = config.sound;
        this.moveTo = config.moveTo;
        this.teleportTo = config.teleportTo;
        this.hasTracking = config.hasTracking;
        this.trackingId = config.trackingId;
        this.synced = config.synced;

        const clickEvent = config;

        if (!clickEvent) {
          return;
        }

        switch (clickEvent.type) {

          case Actions.TRACKING_ONLY: //tracking clicks only
            this.function = () => {
              this.trackClickEvent(clickEvent, clickEvent.trackingId);
            };
            break;
          case Actions.EXTERNAL: //external link
            this.function = () => {
              if (!this.externalLink) {
                return;
              }
              this.trackClickEvent(clickEvent, clickEvent.trackingId);
              openExternalUrl({ url: this.externalLink })
            };
            break;
          case Actions.SOUND: //play a sound
            break;
          case Actions.MOVE: // move player
            if (!this.moveTo) {
              return;
            }
            const { position, cameraTarget, setCameraTarget } = this.moveTo;

            if (setCameraTarget) {
              movePlayerTo({
                newRelativePosition: Vector3.create(position.x, position.y, position.z),
                cameraTarget: Vector3.create(cameraTarget.x, cameraTarget.y, cameraTarget.z),
              })
            } else {
              movePlayerTo({
                newRelativePosition: Vector3.create(position.x, position.y, position.z),
              })
            }
            break;
          case Actions.TELEPORT: // teleport player
            this.function = () => {
              if (!this.teleportTo) {
                return;
              } else if (typeof this.teleportTo === "string") {
                const coords = this.teleportTo.split(","),
                  x = Number(coords[0]),
                  y = Number(coords[1]),
                  worldCoordinates = { x, y };

                teleportTo({ worldCoordinates });
              } else if (typeof this.teleportTo === "object") {
                teleportTo(this.teleportTo);
              }
            };
            break;
        }

        this.trackClickEvent(clickEvent, clickEvent.trackingId);

        pointerEventsSystem.onPointerDown(
          {
            entity: this.entity,
            opts: { button: InputAction.IA_PRIMARY, hoverText: this.hoverText, showFeedback: this.showFeedback },
          },
          () => this.function()
        )
      } catch (error) {
        throw error;
      }
    }

    trackClickEvent: CallableFunction = (clickEvent: Config, id: string) => {
      const trackingId = clickEvent.trackingId || id;

      if (clickEvent.hasTracking) {
        VLMSessionManager.events.fireEvent(new VLMSessionAction(trackingId));
      }
    };
  }
}
