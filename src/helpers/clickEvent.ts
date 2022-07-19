import { movePlayerTo } from "@decentraland/RestrictedActions";
import { EClickEventType } from "../types/ClickEvent";
import { TEntity, TEntityInstance } from "../types/Entity";
import { TEntityStorage } from "../types/Storage";
import { getId } from "./entity";

export const setClickEvent = (storage: TEntityStorage, entity: TEntity, instance: TEntityInstance) => {
    if (!entity.clickEvent) {
      return;
    }
  
    let pointerDownEvent,
      showFeedback = entity.clickEvent.showFeedback,
      hoverText = entity.clickEvent.hoverText,
      imageId = getId(entity),
      instanceId = getId(instance);
  
    switch (entity.clickEvent.type) {
      case EClickEventType.NONE: //no click event
      storage[imageId][instanceId].removeComponent(OnPointerDown);
        return;
      case EClickEventType.EXTERNAL: //external link
        pointerDownEvent = new OnPointerDown(
          () => {
            openExternalURL(entity.clickEvent.externalLink);
          },
          { showFeedback, hoverText }
        );
        break;
      case EClickEventType.SOUND: //play a sound
        const clip = new AudioClip(entity.clickEvent.sound);
        const source = new AudioSource(clip);
        pointerDownEvent = new OnPointerDown(
          () => {
            source.playOnce();
          },
          { showFeedback, hoverText }
        );
        break;
      case EClickEventType.MOVE: // move player
        pointerDownEvent = new OnPointerDown(
          () => {
            movePlayerTo(entity.clickEvent.moveTo.position, entity.clickEvent.moveTo.cameraTarget);
          },
          { showFeedback, hoverText }
        );
        break;
      case EClickEventType.TELEPORT: // teleport player
        pointerDownEvent = new OnPointerDown(
          () => {
            teleportTo(entity.clickEvent.teleportTo.join(','));
          },
          { showFeedback, hoverText }
        );
        break;
    }
    storage[imageId][instanceId].addComponentOrReplace(pointerDownEvent);
  };