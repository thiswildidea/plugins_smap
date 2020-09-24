import Mapcofig from './config/Mapcofig';
import IDynamicCloud from './interface/IDynamicCloud';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class DynamicCloud extends EventEmitter {
    public dynamicCylinderfenceRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(cylinderFenceOptions: IDynamicCloud= {}) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/dynamicCloud", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([dynamicCloud, externalRenderers]) => {
                const auroraRenderer = new dynamicCloud(this.view, cylinderFenceOptions.center,
                    cylinderFenceOptions.radius, cylinderFenceOptions.noiseurl, cylinderFenceOptions.cloudurl);
                externalRenderers.add(this.view, auroraRenderer);
                this.dynamicCylinderfenceRendererArray.push([new Guid().uuid, auroraRenderer]);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.dynamicCylinderfenceRendererArray.map((meshLineRendereritem) => {
                    externalRenderers.remove(this.view, meshLineRendereritem[1]);
                });
                this.dynamicCylinderfenceRendererArray = [];
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
