import { inputSystem, InputAction, PointerEventType, CameraType, Transform, engine, CameraMode } from '@dcl/sdk/ecs'
import { VLMPathManager } from './VLMPath.logic';
import { VLMEventManager } from './VLMSystemEvents.logic';

export class VLMGlobalEvents {
  static playerMovement = () => {
    VLMPathManager.updateMovingState("w", inputSystem.isPressed(InputAction.IA_FORWARD));
    VLMPathManager.updateMovingState("s", inputSystem.isPressed(InputAction.IA_BACKWARD));
    VLMPathManager.updateMovingState("a", inputSystem.isPressed(InputAction.IA_LEFT));
    VLMPathManager.updateMovingState("d", inputSystem.isPressed(InputAction.IA_RIGHT));
    VLMPathManager.updateMovingState("shift", inputSystem.isPressed(InputAction.IA_WALK));

    if (inputSystem.isTriggered(InputAction.IA_JUMP, PointerEventType.PET_DOWN)) {
      VLMEventManager.events.emit('VLMSessionAction', "Player Jumped");
    }
  }

  static cameraState = () => {
    if (!Transform.has(engine.CameraEntity)) {
      VLMPathManager.pov = 0;
      return
    }

    let cameraEntity = CameraMode.get(engine.CameraEntity)

    if (cameraEntity.mode == CameraType.CT_THIRD_PERSON) {
      VLMPathManager.pov = 2;
    } else if (cameraEntity.mode == CameraType.CT_FIRST_PERSON) {
      VLMPathManager.pov = 1;
    } else {
      VLMPathManager.pov = 0; 
    }
  }
}