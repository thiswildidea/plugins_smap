import Mapcofig from './config/Mapcofig';
import IEsriHeatMap3dLayerOptions from './interface/IEsriHeatMap3dLayerOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class EsriHeatMap3dLayer extends EventEmitter {
    public esriheatMap3dLayerRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(esriHeatMap3dLayerOptions: IEsriHeatMap3dLayerOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/esriHeatmap3dLayer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([esriHeatmap3dLayer, externalRenderers]) => {
                this.esriheatMap3dLayerRenderer = new esriHeatmap3dLayer(this.view,
                    esriHeatMap3dLayerOptions.options);
                externalRenderers.add(this.view, this.esriheatMap3dLayerRenderer);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.esriheatMap3dLayerRenderer) { return; }
                externalRenderers.remove(this.view, this.esriheatMap3dLayerRenderer);
            });
    }
    public setMaterialColor(color: any) {
        if (!this.esriheatMap3dLayerRenderer) { return; }
        this.esriheatMap3dLayerRenderer.setMaterialColor(color);
    }
    public setwireframe() {
        if (!this.esriheatMap3dLayerRenderer) { return; }
        this.esriheatMap3dLayerRenderer.setwireframe();
    }
    public setaltitude(altitude: any) {
        if (!this.esriheatMap3dLayerRenderer) { return; }
        this.esriheatMap3dLayerRenderer.setaltitude(altitude);
    }

    public setscaleZ(scaleZ: any) {
        if (!this.esriheatMap3dLayerRenderer) { return; }
        this.esriheatMap3dLayerRenderer.setscaleZ(scaleZ);
    }
    public setopacity(opacity: any) {
        if (!this.esriheatMap3dLayerRenderer) { return; }
        this.esriheatMap3dLayerRenderer.setopacity(opacity);
    }
    private async init(view: any) {
        this.view = view;
    }
}
