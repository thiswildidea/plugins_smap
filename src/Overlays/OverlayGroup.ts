import ILabelOption from '../interface/ILabelOption';
import IOverLayerGroupOption from '../interface/IOverLayerGroupOption';
import Label from '../Overlays/Label';
import Guid from '../utils/Guid';
import FeatureReduction from './FeatureReduction';
import Overlayerbase from './Overlayerbase';
export default class OverlayGroup {
    public uuid: string;
    public type;
    public overlayers: Overlayerbase[];
    public overlaytype: string;
    public datafiled: any;
    public style: any;
    public label: Label;
    public renderer: any;
    public elevationInfo: any;
    public frreduction: FeatureReduction;
    constructor(olayers: Overlayerbase[], overLayerGroupOption: IOverLayerGroupOption) {
        this.uuid = new Guid().uuid;
        this.overlayers = olayers;
        this.type = "group";
        this.overlaytype = overLayerGroupOption.overlaytype === undefined ? 'marker' : overLayerGroupOption.overlaytype;
        this.datafiled = overLayerGroupOption.datafiled === undefined ? [] : overLayerGroupOption.datafiled;
        this.style = overLayerGroupOption.style === undefined ? [] : overLayerGroupOption.style;
        this.label = overLayerGroupOption.label === undefined ?
        new Label({visible: false}) : overLayerGroupOption.label;
        this.frreduction = overLayerGroupOption.frreduction === undefined ? null : overLayerGroupOption.frreduction;
        this.renderer = overLayerGroupOption.renderer === undefined ? null : overLayerGroupOption.renderer;
        this.elevationInfo = overLayerGroupOption.elevationInfo;
    }
}
