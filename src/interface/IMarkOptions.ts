import Icon from '../Overlays/Icon';
import IOverlayerOptions from './IOverlayerOptions';
export default interface IMarkOptions extends IOverlayerOptions {
    position: [number, number, number?];
    icon: Icon;
}
