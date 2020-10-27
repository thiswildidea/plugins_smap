import Mapcofig from './config/Mapcofig';
import IRipplewallOptions from './interface/IRipplewallOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class RipplewallRenderer extends EventEmitter {
    public ripplewallRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(ripplewallOptions: IRipplewallOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/A3918F4D-C4F3-2F18-68573969137963CE", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([ripplewallRenderer, externalRenderers]) => {
              const rwRenderer = new ripplewallRenderer(this.view,
                    ripplewallOptions.points, ripplewallOptions.options);
              externalRenderers.add(this.view, rwRenderer);
              this.ripplewallRendererArray.push([new Guid().uuid, rwRenderer]);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.ripplewallRendererArray.length) { return; }
                this.ripplewallRendererArray.map((rwRendereritem) => {
                    externalRenderers.remove(this.view, rwRendereritem[1]);
                });
            });
    }
    public setMaterialColor(color: any) {
        if (!this.ripplewallRendererArray.length) { return; }
        this.ripplewallRendererArray.map((rwRendereritem) => {
            rwRendereritem[1].setMaterialColor(color);
        });
    }
    public setwireframe() {
        if (!this.ripplewallRendererArray.length) { return; }
        this.ripplewallRendererArray.map((rwRendereritem) => {
            rwRendereritem[1].setwireframe();
        });
    }
    public setaltitude(altitude: any) {
        if (!this.ripplewallRendererArray.length) { return; }
        this.ripplewallRendererArray.map((rwRendereritem) => {
            rwRendereritem[1].setaltitude(altitude);
        });
    }

    public setscaleZ(scaleZ: any) {
        if (!this.ripplewallRendererArray.length) { return; }
        this.ripplewallRendererArray.map((rwRendereritem) => {
            rwRendereritem[1].setscaleZ(scaleZ);
        });
    }
    public setopacity(opacity: any) {
        if (!this.ripplewallRendererArray.length) { return; }
        this.ripplewallRendererArray.map((rwRendereritem) => {
            rwRendereritem[1].setopacity(opacity);
        });
    }
    private async init(view: any) {
        this.view = view;
    }
}
