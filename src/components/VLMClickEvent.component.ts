import { PositionType, movePlayerTo } from "@decentraland/RestrictedActions";
import { VLMBase } from "./VLMBaseConfig.component";
import { VLMSessionAction } from "./VLMSystemEvents.component";
import { VLMSessionManager } from "../logic/VLMSession.logic";

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

  export class DCLConfig {
    type: Actions;
    showFeedback: boolean;
    hoverText: string;
    externalLink?: string;
    sound?: string;
    moveTo?: { cameraTarget: PositionType; position: PositionType; setCameraTarget: boolean };
    teleportTo?: string;
    hasTracking?: boolean;
    trackingId?: string;
    synced?: boolean;
    pointerDownEvent: OnPointerDown = new OnPointerDown(() => {}, { hoverText: "", showFeedback: false });

    constructor(config: DCLConfig, clickable: VLMBase.Instance & IsClickable) {
      try {
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

        let id = clickable.sk,
          customId = clickable.customId,
          showFeedback = config.showFeedback,
          hoverText = config.hoverText;

        if (!clickEvent || !clickable) {
          return;
        }

        switch (clickEvent.type) {
          case Actions.NONE: //no click event
            if (clickable.getComponentOrNull(OnPointerDown)) {
              clickable.removeComponent(OnPointerDown);
            }
            return;
          case Actions.TRACKING_ONLY: //tracking clicks only
            this.pointerDownEvent = new OnPointerDown(
              () => {
                this.trackClickEvent(clickEvent, `click-event-${customId || id}`);
              },
              { showFeedback, hoverText }
            );
            break;
          case Actions.EXTERNAL: //external link
            this.pointerDownEvent = new OnPointerDown(
              () => {
                if (clickEvent.externalLink) {
                  openExternalURL(clickEvent.externalLink);
                  this.trackClickEvent(clickEvent, `click-event-(external-link)-${customId || id}`);
                }
              },
              { showFeedback, hoverText }
            );
            break;
          case Actions.SOUND: //play a sound
            // const clip = new AudioClip(clickEvent.sound || "");
            // const source = new AudioSource(clip);
            this.pointerDownEvent = new OnPointerDown(
              () => {
                // source.playOnce();
                this.trackClickEvent(clickEvent, `click-event-(sound)-${customId || id}`);
              },
              { showFeedback, hoverText }
            );
            break;
          case Actions.MOVE: // move player
            this.pointerDownEvent = new OnPointerDown(
              () => {
                if (clickEvent.moveTo) {
                  movePlayerTo(clickEvent.moveTo.position, clickEvent.moveTo.setCameraTarget ? clickEvent.moveTo.cameraTarget : undefined);
                  this.trackClickEvent(clickEvent, `click-event-(move-player)-${customId || id}`);
                }
              },
              { showFeedback, hoverText }
            );
            break;
          case Actions.TELEPORT: // teleport player
            this.pointerDownEvent = new OnPointerDown(
              () => {
                if (clickEvent.teleportTo) {
                  teleportTo(clickEvent.teleportTo);
                  this.trackClickEvent(clickEvent, `click-event-(teleport-player)-${customId || id}`);
                }
              },
              { showFeedback, hoverText }
            );
            break;
        }
      } catch (error) {
        throw error;
      }
    }

    trackClickEvent: CallableFunction = (clickEvent: DCLConfig, id: string) => {
      const trackingId = clickEvent.trackingId || id;

      if (clickEvent.hasTracking) {
        VLMSessionManager.events.fireEvent(new VLMSessionAction(trackingId));
      }
    };
  }

  export interface IsClickable {
    clickEvent?: VLMClickEvent.DCLConfig;
  }
}
