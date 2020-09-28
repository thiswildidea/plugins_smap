import Mapcofig from './config/Mapcofig';
import ICloudRendereriOptions from './interface/ICloudRendereriOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class CloudRenderer extends EventEmitter {

    public cloudRendererRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(cloudRendererOptions: ICloudRendereriOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/2F6637EA-8119-A957-B8685F98373F16C0", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([cloudRenderer, externalRenderers]) => {
                cloudRendererOptions.points.forEach((pointitem) => {
                    const cloudRendererRenderer = new cloudRenderer(this.view,
                        pointitem, cloudRendererOptions.options);
                    externalRenderers.add(this.view, cloudRendererRenderer);
                    this.cloudRendererRendererArray.push([new Guid().uuid, cloudRendererRenderer]);
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
                this.cloudRendererRendererArray.map((cloudRendereritem) => {
                    externalRenderers.remove(this.view, cloudRendereritem[1]);
                });
            });
    }

    private async init(view: any) {
        this.view = view;
    }
}
