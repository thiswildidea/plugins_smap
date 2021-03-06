import Mapcofig from './config/Mapcofig';
import ISquareFence from './interface/ISquareFence';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class DynamicSquareFence extends EventEmitter {
    public dynamicSquarefenceRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(ssquareFenceOptions: ISquareFence= {}) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/789A68E1-657F-D870-37F9E6DF554E1C27", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([dynamicSquareFence, externalRenderers]) => {
                const auroraRenderer = new dynamicSquareFence(this.view, ssquareFenceOptions.center,
                    ssquareFenceOptions.radius, ssquareFenceOptions.height,
                    ssquareFenceOptions.textureurl, ssquareFenceOptions.scale);
                externalRenderers.add(this.view, auroraRenderer);
                this.dynamicSquarefenceRendererArray.push([new Guid().uuid, auroraRenderer]);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.dynamicSquarefenceRendererArray.map((meshLineRendereritem) => {
                    externalRenderers.remove(this.view, meshLineRendereritem[1]);
                });
                this.dynamicSquarefenceRendererArray = [];
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
