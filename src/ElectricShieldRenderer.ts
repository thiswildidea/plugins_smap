import Mapcofig from './config/Mapcofig';
import IElectricShieldOptions from './interface/IElectricShieldOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class ElectricShieldRenderer extends EventEmitter {
    public electricShieldOptionsRenderer: any = null;
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(electricShieldOptions: IElectricShieldOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/ElectricShieldRenderer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([electricShieldRenderer, externalRenderers]) => {
                this.electricShieldOptionsRenderer = new electricShieldRenderer(this.view,
                    electricShieldOptions.points, electricShieldOptions.options);
                externalRenderers.add(this.view, this.electricShieldOptionsRenderer);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.electricShieldOptionsRenderer) { return; }
                externalRenderers.remove(this.view, this.electricShieldOptionsRenderer);
            });
    }

    public setMaterialColor(color: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setMaterialColor(color);
    }
    public setwireframe() {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setwireframe();
    }
    public setaltitude(altitude: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setaltitude(altitude);
    }

    public setscaleZ(scaleZ: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setscaleZ(scaleZ);
    }
    public setopacity(opacity: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setopacity(opacity);
    }
    private async init(view: any) {
        this.view = view;
    }
}
