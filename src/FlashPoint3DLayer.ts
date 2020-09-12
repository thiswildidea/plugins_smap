import Mapcofig from './config/Mapcofig';
import IFlashPointOptions from './interface/IFlashPointOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class FlashPoint3DLayer extends EventEmitter {
    private view: any = null;
    private falshpoint3DRenderer: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }

    public add(flashPointOptions: IFlashPointOptions) {
        load(['smiapi/utils/FlashPoint3DLayer', "esri/geometry/Point", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([flashPoint3DLayer, Point , externalRenderers]) => {
                this.falshpoint3DRenderer = new flashPoint3DLayer({
                    nring: flashPointOptions.nring,
                    spead: flashPointOptions.spead,
                    size: flashPointOptions.size,
                    color: flashPointOptions.color,
                    view: flashPointOptions.view,
                    points: flashPointOptions.points
                },  (result) => {
                    let geometryPoint = null;
                    if (result != null) {
                        geometryPoint = new Point({
                            x: result.x,
                            y: result.y,
                            spatialReference: {
                                wkid: 102100
                            }
                        });
                    }
                    this.emit(MapEvent.click, result, geometryPoint);
                }, (result) => {
                    let geometryPoint = null;
                    if (result != null) {
                        geometryPoint = new Point({
                            x: result.x,
                            y: result.y,
                            spatialReference: {
                                wkid: 102100
                            }
                        });
                    }
                    this.emit(MapEvent.pointermove, result, geometryPoint);
                });
                externalRenderers.add(this.view, this.falshpoint3DRenderer);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.falshpoint3DRenderer) { return; }
                externalRenderers.remove(this.view, this.falshpoint3DRenderer);
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
