import { VLM } from "./app";
import { VLMVideo, VLMImage, VLMNFT, VLMSound, VLMWidget } from "./components";


class VideoConfig extends VLMVideo.VLMConfig { }
class VideoInstanceConfig extends VLMVideo.VLMInstanceConfig { };
class ImageConfig extends VLMImage.VLMConfig { };
class ImageInstanceConfig extends VLMImage.VLMInstanceConfig { };
class NFTConfig extends VLMNFT.VLMConfig { };
class NFTInstanceConfig extends VLMNFT.VLMInstanceConfig { };
class SoundConfig extends VLMSound.VLMConfig { };
class SoundInstanceConfig extends VLMSound.VLMInstanceConfig { };
class WidgetConfig extends VLMWidget.VLMConfig { };
class VLMStorage {
    videos = {
        configs: VLMVideo.configs,
        instances: VLMVideo.instances,
        systems: VLMVideo.systems
    };
    images = {
        configs: VLMImage.configs,
        instances: VLMImage.instances
    };
    nfts = {
        configs: VLMNFT.configs,
        instances: VLMNFT.instances
    };
    sounds = {
        configs: VLMSound.configs,
        instances: VLMSound.instances,
        systems: VLMSound.systems
    };
    widgets = {
        configs: VLMWidget.configs
    }
}
export default VLM;
export { VLMStorage, VideoConfig, VideoInstanceConfig, ImageConfig, ImageInstanceConfig, NFTConfig, NFTInstanceConfig, SoundConfig, SoundInstanceConfig, WidgetConfig }