import LngLat from '../common/LngLat';
import Icon from '../Overlays/Icon';
import Label from '../Overlays/Label';
import IOverlayerOptions from './IOverlayerOptions';
export default interface IPolylineOption extends IOverlayerOptions {
    path: LngLat[];
    cap: string;
    strokeColor: string;
    style: string;
    lineJoin: string;
    width: number;
}
