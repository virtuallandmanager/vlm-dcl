import { VLM } from "./app";
import { VLMVideo, VLMImage, VLMNFT, VLMSound, VLMWidget } from "./components/index";

class VideoConfig extends VLMVideo.VLMConfig { }
class VideoInstanceConfig extends VLMVideo.VLMInstanceConfig { };
class ImageConfig extends VLMImage.VLMConfig { };
class ImageInstanceConfig extends VLMImage.VLMInstanceConfig { };
class NFTConfig extends VLMNFT.VLMConfig { };
class NFTInstanceConfig extends VLMNFT.VLMInstanceConfig { };
class SoundConfig extends VLMSound.VLMConfig { };
class SoundInstanceConfig extends VLMSound.VLMInstanceConfig { };
class WidgetConfig extends VLMWidget.VLMConfig { };

export default VLM;
export { VideoConfig, VideoInstanceConfig, ImageConfig, ImageInstanceConfig, NFTConfig, NFTInstanceConfig, SoundConfig, SoundInstanceConfig, WidgetConfig }