import { movePlayerTo } from "@decentraland/RestrictedActions";
import { getId } from "./entity";

export const setClickEvent = (object: any, image: any, instance: any) => {
    if (!image.clickEvent) {
      return;
    }
  
    let pointerDownEvent,
      showFeedback = image.clickEvent.showFeedback,
      hoverText = image.clickEvent.hoverText,
      imageId = getId(image),
      instanceId = getId(instance);
  
    switch (image.clickEvent.type) {
      case 0: //no click event
        object[imageId][instanceId].removeComponent(OnPointerDown);
        return;
      case 1: //external link
        pointerDownEvent = new OnPointerDown(
          () => {
            openExternalURL(image.clickEvent.externalLink);
          },
          { showFeedback, hoverText }
        );
        break;
      case 2: //play a sound
        const clip = new AudioClip(image.clickEvent.soundClip);
        const source = new AudioSource(clip);
        pointerDownEvent = new OnPointerDown(
          () => {
            source.playOnce();
          },
          { showFeedback, hoverText }
        );
        break;
      case 3: // move player
        pointerDownEvent = new OnPointerDown(
          () => {
            movePlayerTo(image.clickEvent.moveTo.position, image.clickEvent.moveTo.cameraTarget);
          },
          { showFeedback, hoverText }
        );
        break;
      case 4: // teleport player
        pointerDownEvent = new OnPointerDown(
          () => {
            teleportTo(image.clickEvent.teleportTo);
          },
          { showFeedback, hoverText }
        );
        break;
    }
    object[imageId][instanceId].addComponentOrReplace(pointerDownEvent);
  };