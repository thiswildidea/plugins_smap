import IOverlayerOptions from '../interface/IOverlayerOptions';
import Label from '../Overlays/Label';
import Guid from '../utils/Guid';
export default class Overlayerbase {
    public overlaytype: string;
    public uuid: string;
    public type;
    public label: Label;
    public attributes: any;
    public renderer: any;
    public symbol: any;
    public elevationInfo: any;
    constructor(overlayeroption: IOverlayerOptions) {
        this.uuid = new Guid().uuid;
        this.label = overlayeroption.label;
        this.attributes = overlayeroption.attributes === undefined ? {} : overlayeroption.attributes;
        this.renderer = overlayeroption.renderer;
        this.type = "element";
        this.elevationInfo = overlayeroption.elevationInfo;
        this.symbol = overlayeroption.symbol;
    }
}
