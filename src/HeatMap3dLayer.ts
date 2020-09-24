import Mapcofig from './config/Mapcofig';
import IHeatMap3dLayerOptions from './interface/IHeatMap3dLayerOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class HeatMap3dLayer extends EventEmitter {
    public heatMap3dLayerRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(heatMap3dLayerOptions: IHeatMap3dLayerOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/Heatmap3dRenderer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([heatmap3dRenderer, externalRenderers]) => {
                this.heatMap3dLayerRenderer = new heatmap3dRenderer(this.view,
                    heatMap3dLayerOptions.data, heatMap3dLayerOptions.options);
                externalRenderers.add(this.view, this.heatMap3dLayerRenderer);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.heatMap3dLayerRenderer) { return; }
                externalRenderers.remove(this.view, this.heatMap3dLayerRenderer);
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
