import { TCustomizationConfig } from "./Customization";
import { TEntityInstanceConfig, TEntityMaterialConfig } from "./Entity";
import { TImageInstanceConfig, TImageMaterialConfig } from "./Image";
import { TNFTConfig, TNFTInstanceConfig } from "./NFT";
import { TSceneData } from "./SceneData";
import { TVideoInstanceConfig, TVideoMaterialConfig } from "./VideoScreen";

export type TWebSocketMessage = {
  action: string;
  sceneData: TSceneData;
  features?: { [id: string]: boolean };
  entityData?: TEntityMaterialConfig | TVideoMaterialConfig | TImageMaterialConfig | TNFTConfig;
  instanceData?: TEntityInstanceConfig | TVideoInstanceConfig | TImageInstanceConfig | TNFTInstanceConfig;
  customizationData?: TCustomizationConfig;
  id?: string;
};
