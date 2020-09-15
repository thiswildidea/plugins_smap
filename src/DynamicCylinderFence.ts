import Mapcofig from './config/Mapcofig';
import ICylinderFence from './interface/ICylinderFence';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class DynamicCylinderFence extends EventEmitter {
    public dynamicCylinderfenceRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(cylinderFenceOptions: ICylinderFence= {}) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/78C93084-B4AB-AC1B-88B95BAC7D872846/82B44794-5CE0-A64A-9047F07CAF08BD2C", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([dynamicCylinderFence, externalRenderers]) => {
                const auroraRenderer = new dynamicCylinderFence(this.view, cylinderFenceOptions.center,
                    cylinderFenceOptions.radius, cylinderFenceOptions.height,
                    cylinderFenceOptions.textureurl, cylinderFenceOptions.scale);
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
