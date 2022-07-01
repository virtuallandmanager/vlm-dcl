import { NPC } from "@dcl/npc-scene-utils";

export const initDialogs = (dialogs: Array<any>) => {
  dialogs.forEach(async (dialog: any) => {
    if (dialog.enabled) {
      dialog.messages = dialog.messages.map((message: string) => ({ text: message }));
      await createDialog(dialog);
    }
  });
};

export async function createDialog(dialog: any) {
  log("creating welcome dialog");
  dialog.messages[dialog.messages.length - 1]["isEndOfDialog"] = true;

  let dialogNPC = new NPC(
    { position: new Vector3(0, 0, 0) },
    "",
    () => {
      dialogNPC.talk(dialog.messages, 0);
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
  engine.addEntity(dialogNPC);
  dialogNPC.activate();
}

export const updateDialog = (dialogs: Array<any>, property: string, id: string) => {};

export const removeDialog = (dialogs: Array<any>, property: string, id: string) => {};

export async function createWelcomeDialog(welcomeDialog: any) {
  log("creating welcome dialog");
  createDialog(welcomeDialog)
}
