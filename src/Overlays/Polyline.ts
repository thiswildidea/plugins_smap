import LngLat from '../common/LngLat';
import IPolylineOption from '../interface/IPolylineOption';
import Overlayerbase from './Overlayerbase';
export default class Polyline extends Overlayerbase {
    public path: LngLat[];
    public cap: string;
    public strokeColor: string;
    public style: string;
    public lineJoin: string;
    public width: number;
    constructor(ploption: IPolylineOption) {
        super(ploption);
        this.overlaytype = 'Polyline';
        this.path = ploption.path;
        this.cap = ploption.cap === undefined ? 'square' : ploption.cap;
        this.strokeColor = ploption.strokeColor === undefined ? 'red' : ploption.strokeColor;
        this.style = ploption.style === undefined ? 'solid' : ploption.style;
        this.lineJoin = ploption.lineJoin === undefined ? 'round' : ploption.lineJoin;
        this.width = ploption.width === undefined ? 5 : ploption.width;
    }
}
