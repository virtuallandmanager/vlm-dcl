import { InputAction, PointerEventType, CameraType, CameraMode } from '@dcl/sdk/ecs'
import { VLMPathManager } from './VLMPath.logic';
import { VLMEventManager } from './VLMSystemEvents.logic';
import { ecs } from '../environment';

export class VLMGlobalEvents {
  static playerMovement = () => {
    VLMPathManager.updateMovingState("w", ecs.inputSystem.isPressed(InputAction.IA_FORWARD));
    VLMPathManager.updateMovingState("s", ecs.inputSystem.isPressed(InputAction.IA_BACKWARD));
    VLMPathManager.updateMovingState("a", ecs.inputSystem.isPressed(InputAction.IA_LEFT));
    VLMPathManager.updateMovingState("d", ecs.inputSystem.isPressed(InputAction.IA_RIGHT));
    VLMPathManager.updateMovingState("shift", ecs.inputSystem.isPressed(InputAction.IA_WALK));

    if (ecs.inputSystem.isTriggered(InputAction.IA_JUMP, PointerEventType.PET_DOWN)) {
      console.log("Player Jumped");
      VLMEventManager.events.emit('VLMSessionAction', "Player Jumped");
    }
  }

  static cameraState = () => {
    if (!ecs.Transform.has(ecs.engine.CameraEntity)) {
      VLMPathManager.pov = 0;
      return
    }

    let cameraEntity = CameraMode.get(ecs.engine.CameraEntity)

    if (cameraEntity.mode == CameraType.CT_THIRD_PERSON) {
      VLMPathManager.pov = 2;
    } else if (cameraEntity.mode == CameraType.CT_FIRST_PERSON) {
      VLMPathManager.pov = 1;
    } else {
      VLMPathManager.pov = 0; 
    }
  }
}