import FeatureReduction from '../Overlays/FeatureReduction';
import Label from '../Overlays/Label';

export default interface IOverLayerGroupOption {

    // 覆盖物类型
    overlaytype?: string;
    // 覆盖物字段
    datafiled?: any;

    // 覆盖物样式
    style: any;

    // 标注
    label: Label;

    // renderer
    renderer?: any; // new

    // elevationInfo
    elevationInfo?: any;

    // 聚集
    frreduction?: FeatureReduction;
}
