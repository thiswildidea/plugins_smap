import Mapcofig from './config/Mapcofig';
import GeoJSON from './geometry/GeoJSON';
import ISpriteLineOptions from './interface/ISpriteLineOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class SpriteLineRenderer extends EventEmitter {
    public spriteLineRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(spritesLineOptions: ISpriteLineOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/SpriteLineRenderer", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([SpriteLine, externalRenderers]) => {

                const multiLineStrings = GeoJSON.toGeometry(spritesLineOptions.geojson);
                for (const multiLineString of multiLineStrings) {
                   multiLineString._geometries.map((lineString) => {
                       const spriteLineRenderer = new SpriteLine(this.view, lineString, spritesLineOptions.options);
                       this.spriteLineRendererArray.push([new Guid().uuid, spriteLineRenderer]);
                       externalRenderers.add(this.view, spriteLineRenderer);
                    });
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.spriteLineRendererArray.map((spriteLineRendereritem) => {
                    externalRenderers.remove(this.view, spriteLineRendereritem[1]);
                });
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
