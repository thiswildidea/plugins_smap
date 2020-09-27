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
    public visible: boolean;
    public minScale: number;
    public maxScale: number;
    constructor(overlayeroption: IOverlayerOptions) {
        this.uuid = new Guid().uuid;
        this.label = overlayeroption.label !== undefined ? overlayeroption.label : new Label({ visible: false});
        this.attributes = overlayeroption.attributes === undefined ? {} : overlayeroption.attributes;
        this.renderer = overlayeroption.renderer;
        this.type = "element";
        this.elevationInfo = overlayeroption.elevationInfo;
        this.symbol = overlayeroption.symbol;
        this.visible = overlayeroption.visible === undefined ? true : overlayeroption.visible;
        this.maxScale = overlayeroption.maxScale || 0;
        this.minScale = overlayeroption.minScale || 0;
    }
}
