import Mapcofig from './config/Mapcofig';
import IMeshLine from './interface/IMeshLine';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class MeshLine extends EventEmitter {
    public meshLineRendererArray: Array<[string, any]> = [];
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(meshLineOptions: IMeshLine= {}) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/B622344F-BB19-15F1-3920E863621B4D9B", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([MeshLines, externalRenderers]) => {
                if (!meshLineOptions.paths) { return; }
                const meshLineRenderer = new MeshLines(this.view, meshLineOptions.paths,
                    meshLineOptions.width, meshLineOptions.color, meshLineOptions.opacity,
                    meshLineOptions.dash, meshLineOptions.rest, meshLineOptions.linesegment,
                    meshLineOptions.linesegmentfade
                    );
                externalRenderers.add(this.view, meshLineRenderer);
                this.meshLineRendererArray.push([new Guid().uuid, meshLineRenderer]);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.meshLineRendererArray.map((meshLineRendereritem) => {
                    externalRenderers.remove(this.view, meshLineRendereritem[1]);
                });
                this.meshLineRendererArray = [];
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
