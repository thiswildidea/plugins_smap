import Mapcofig from './config/Mapcofig';
import IEsriRainRendereriOptions from './interface/IEsriRainRendereriOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class EsriWeatherEffectsRenderer extends EventEmitter {

    public weatherEffectsRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(esriRendererOptions: IEsriRainRendereriOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/weatherEffects", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([weatherEffects, externalRenderers]) => {
                this.weatherEffectsRenderer = new weatherEffects(this.view, esriRendererOptions.options);
                this.weatherEffectsRenderer.add(esriRendererOptions.options.weather);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.weatherEffectsRenderer) { return; }
                this.weatherEffectsRenderer.remove();
            });
    }

    private async init(view: any) {
        this.view = view;
    }
}
