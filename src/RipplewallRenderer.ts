import Mapcofig from './config/Mapcofig';
import IRipplewallOptions from './interface/IRipplewallOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class RipplewallRenderer extends EventEmitter {
    public ripplewallRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(ripplewallOptions: IRipplewallOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/ripplewall", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([ripplewall, externalRenderers]) => {
                this.ripplewallRenderer = new ripplewall(this.view,
                    ripplewallOptions.polygon, ripplewallOptions.options);
                externalRenderers.add(this.view, this.ripplewallRenderer);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.ripplewallRenderer) { return; }
                externalRenderers.remove(this.view, this.ripplewallRenderer);
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
