import Mapcofig from './config/Mapcofig';
import IEsriRainRendereriOptions from './interface/IEsriRainRendereriOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class EsriSnowRenderer extends EventEmitter {

    public esriSnowRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(esriRendererOptions: IEsriRainRendereriOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/esriSnowRenderer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([esriSnowLayer, externalRenderers]) => {
                this.esriSnowRenderer = new esriSnowLayer(this.view, esriRendererOptions.options);
                this.esriSnowRenderer.add();
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.esriSnowRenderer) { return; }
                this.esriSnowRenderer.remove();
            });
    }

    private async init(view: any) {
        this.view = view;
    }
}
