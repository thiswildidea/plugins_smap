import Mapcofig from './config/Mapcofig';
import ILayerSkyRendererOptions from './interface/ILayerSkyRendererOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class LayerSkyRenderer extends EventEmitter {

    public cloudRendererRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(layerSkyRendererOptions: ILayerSkyRendererOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/LayerSkyRenderer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([layerSkyRenderer, externalRenderers]) => {
                this.cloudRendererRenderer = new layerSkyRenderer(this.view,
                    layerSkyRendererOptions.url, layerSkyRendererOptions.options);
                externalRenderers.add(this.view, this.cloudRendererRenderer);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.cloudRendererRenderer) { return; }
                externalRenderers.remove(this.view, this.cloudRendererRenderer);
            });
    }

    private async init(view: any) {
        this.view = view;
    }
}
