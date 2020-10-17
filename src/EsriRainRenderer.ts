import Mapcofig from './config/Mapcofig';
import IEsriRainRendereriOptions from './interface/IEsriRainRendereriOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class EsriRainRenderer extends EventEmitter {

    public rainRendererRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(esriRendererOptions: IEsriRainRendereriOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/esriRainRenderer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([esriRainRenderer, externalRenderers]) => {
                this.rainRendererRenderer = new esriRainRenderer(this.view, esriRendererOptions.options);
                this.rainRendererRenderer.add();
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.rainRendererRenderer) { return; }
                this.rainRendererRenderer.remove();
            });
    }

    private async init(view: any) {
        this.view = view;
    }
}
