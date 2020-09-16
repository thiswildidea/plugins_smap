import Mapcofig from './config/Mapcofig';
import IAuroraOptions from './interface/IAuroraOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class Aurora extends EventEmitter {
    public auroraRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(auroraOptions: IAuroraOptions= {}) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/6EB9F731-BBCF-C348-D5F8B690E99E091A", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([aurora, externalRenderers]) => {
                const auroraRenderer = new aurora(this.view, auroraOptions.center,
                    auroraOptions.radius, auroraOptions.height, auroraOptions.textureurl);
                externalRenderers.add(this.view, auroraRenderer);
                this.auroraRendererArray.push([new Guid().uuid, auroraRenderer]);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.auroraRendererArray.map((meshLineRendereritem) => {
                    externalRenderers.remove(this.view, meshLineRendereritem[1]);
                });
                this.auroraRendererArray = [];
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
