import Mapcofig from './config/Mapcofig';
import IdynamicPolygonOptions from './interface/IDynamicPolygonOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class DynamicPolygon extends EventEmitter {
    public dynamicPolygonRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(dynamicPolygonOptions: IdynamicPolygonOptions= {}) {
        load(["smiapi/utils/dynamicPolygon", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([dynamicPolygon, externalRenderers]) => {
                if (!dynamicPolygonOptions.points) { return; }
                if (!dynamicPolygonOptions.texturestart) { return; }
                if (!dynamicPolygonOptions.texturestarend) { return; }
                if (!dynamicPolygonOptions.height) { return; }
                // if (!dynamicPolygonOptions.offset) { return; }
                dynamicPolygonOptions.view = this.view;
                const dynamicPolygonRenderer = new dynamicPolygon(dynamicPolygonOptions);
                externalRenderers.add(this.view, dynamicPolygonRenderer);
                this.dynamicPolygonRendererArray.push([new Guid().uuid, dynamicPolygonRenderer]);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.dynamicPolygonRendererArray.map((meshLineRendereritem) => {
                    externalRenderers.remove(this.view, meshLineRendereritem[1]);
                });
                this.dynamicPolygonRendererArray = [];
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
