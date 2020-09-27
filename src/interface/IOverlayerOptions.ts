import Icon from '../Overlays/Icon';
import Label from '../Overlays/Label';
export default interface IOverlayerOptions {
    label: Label;
    // renderer
    renderer?: any;
    symbol?: any;
    elevationInfo?: any;
    attributes: any;
    visible?: boolean;
    maxScale?: number;
    minScale?: number;
}
