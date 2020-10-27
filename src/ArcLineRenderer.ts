import Mapcofig from './config/Mapcofig';
import IArcLineOptions from './interface/IArcLineOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class ArcLineRenderer extends EventEmitter {
    public arcLineRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(arcLineOptions: IArcLineOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/45F857C8-303E-9546-9A173A5DACF5B67D", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([arcLineRenderer, externalRenderers]) => {

                // const offset = Infinity;
                // arcLineOptions.lineStrings.slice(0, offset).map((d) => {
                // const options = {
                //     height: d.len
                // };
                // const arcLine = new arcLineRenderer(this.view, d.lineString, options);
                // this.arcLineRendererArray.push([new Guid().uuid, arcLine]);
                // externalRenderers.add(this.view, arcLine);
                // });
                const arcLine = new arcLineRenderer(arcLineOptions.lineStrings, arcLineOptions.options);
                this.arcLineRendererArray.push([new Guid().uuid, arcLine]);
                externalRenderers.add(this.view, arcLine);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.arcLineRendererArray.map((arcLineRendereritem) => {
                    externalRenderers.remove(this.view, arcLineRendereritem[1]);
                });
            });
    }

    public setaltitude(altitude: any) {
        if (!this.arcLineRendererArray) { return; }
        this.arcLineRendererArray.map((arcLineRendereritem) => {
            arcLineRendereritem[1].setaltitude(altitude);
        });
    }
    private async init(view: any) {
        this.view = view;
    }
}
