import Mapcofig from './config/Mapcofig';
import IFlashGifOptions from './interface/IFlashGifOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class FlashGifLayer extends EventEmitter {
    public markpointsRendererArray: Array<[string, any]> = []; // 渲染苏州
    private markpoints: any = null; // 撒点
    private view: any = null;
    private flashGifLayer: any = null; // gif 渲染
    private markpointscontainerid: any = null; // gif的容器id
    constructor(view: any) {
        super();
        this.init(view);
    }

    public add(flashPointOptions: IFlashGifOptions) {
        load(['smiapi/utils/flashgiflayer', "esri/geometry/Point", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([flashgiflayer, Point , externalRenderers]) => {
                if (!flashPointOptions.points) {return; }
                this.markpoints = flashPointOptions.points.map((item) => {
                    item.markerid = new Guid().uuid;
                    return item;
                });
                // gif 的容器id
                this.markpointscontainerid = new Guid().uuid;
                this.flashGifLayer = new flashgiflayer({
                    points: this.markpoints,
                    view: this.view,
                    markercontainerid: this.markpointscontainerid
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
                externalRenderers.add(this.view, this.flashGifLayer);
                this.markpointsRendererArray.push([new Guid().uuid, this.flashGifLayer]);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                this.markpointsRendererArray.map((meshLineRendereritem) => {
                    externalRenderers.remove(this.view, meshLineRendereritem[1]);
                });
                this.markpointsRendererArray = [];
                this.markpoints.forEach((item) => {
                    const parent = document.getElementById(this.markpointscontainerid);
                    const box = document.getElementById(item.markerid);
                    if (box !== null) {
                        parent.removeChild(box);
                    }
                });
            });
    }
    private async init(view: any) {
        this.view = view;
    }
}
