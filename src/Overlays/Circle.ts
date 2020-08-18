import LngLat from '../common/LngLat';
import IPolygonOption from '../interface/IPolygonOption';
import Polygon from './Polygon';
export default class Circle extends Polygon {
    // public paths: LngLat[];
    // public symboltype: string;
    // public fillColor: string;
    // public strokeColor: string;
    // public style: string;
    // public strokeWeight: number;
    // public url: string;
    // public picwidth: number;
    // public picheight: number;
    // public strokestyle: string;
    public center: LngLat;
    public radius: number;
    public radiusUnit: string;
    constructor(ploption: IPolygonOption) {
        super(ploption);
        this.overlaytype = 'circle';
        this.center = ploption.center;
        this.radius = ploption.radius;
        this.radiusUnit = ploption.radiusUnit === undefined ? 'meters' : ploption.radiusUnit;
        // this.paths = ploption.paths;
        // this.symboltype = ploption.symboltype === undefined ? 'simple' : ploption.symboltype;
        // this.fillColor = ploption.fillColor === undefined ? 'white' : ploption.fillColor;
        // this.style = ploption.style === undefined ? 'solid' : ploption.style;
        // this.strokeColor = ploption.strokeColor === undefined ? 'red' : ploption.strokeColor;
        // this.strokestyle = ploption.strokestyle === undefined ? 'solid' : ploption.strokestyle;
        // this.strokeWeight = ploption.strokeWeight === undefined ? 2 : ploption.strokeWeight;
        // this.url = ploption.url === undefined ? '' : ploption.url;
        // this.picwidth = ploption.picwidth === undefined ? 20 : ploption.picwidth;
        // this.picheight = ploption.picheight === undefined ? 20 : ploption.picheight;
    }
}
