import Mapcofig from './config/Mapcofig';
import IFireRendereriOptions from './interface/IFireRendereriOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class FireRenderer extends EventEmitter {

    public fireRendererRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(fireRendererOptions: IFireRendereriOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/FireRenderer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([fireRenderer, externalRenderers]) => {
                fireRendererOptions.points.forEach((pointitem) => {
                    const fireccRenderer = new fireRenderer(this.view,
                        pointitem, fireRendererOptions.options);
                    externalRenderers.add(this.view, fireccRenderer);
                    this.fireRendererRendererArray.push([new Guid().uuid, fireccRenderer]);
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.fireRendererRendererArray.map((fireRendereritem) => {
                    externalRenderers.remove(this.view, fireRendereritem[1]);
                });
            });
    }

    private async init(view: any) {
        this.view = view;
    }
}
