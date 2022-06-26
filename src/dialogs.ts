import { NPC } from "@dcl/npc-scene-utils";

export const initDialogs = (dialogs: Array<any>) => {
  dialogs.forEach(async (dialog: any) => {
    if (dialog.dialogType == 0 && dialog.enabled) {
      dialog.messages = dialog.messages.map((message: string) => ({ text: message }));
      await createWelcomeDialog(dialog);
    }
  });
};

export const createDialog = (dialogs: Array<any>) => {};

export const updateDialog = (dialogs: Array<any>, property: string) => {};

export const removeDialog = (dialogs: Array<any>, property: string) => {};

export async function createWelcomeDialog(welcomeDialog: any) {
  log("creating welcome dialog");
  welcomeDialog.messages[welcomeDialog.messages.length - 1]["isEndOfDialog"] = true;

  let welecomeNPC = new NPC(
    { position: new Vector3(0, 0, 0) },
    "",
    () => {
      welecomeNPC.talk(welcomeDialog.messages, 0);
    },
    {
      faceUser: true,
      darkUI: true,
      coolDownDuration: 3,
      onlyExternalTrigger: true,
      reactDistance: 4,
      continueOnWalkAway: true
    }
  );
  engine.addEntity(welecomeNPC);
  welecomeNPC.activate();
}
