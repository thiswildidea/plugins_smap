import Overlayerbase from '../Overlays/Overlayerbase';
import OverlayGroup from '../Overlays/OverlayGroup';
export default interface IOverlayers {
     add(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void;
     remove(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void;
     update(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void;
     // 添加覆盖物以featurelayer 为构建 具有标注可控，按比例显示等特征
     addfeature(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void;
     updatefeature(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void;
     removefeature(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void;
}
