import Mapcofig from './config/Mapcofig';
import IBoundaryOptions from './interface/IBoundaryOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class Draw extends EventEmitter {
    public marksymbol = null;
    public polylinesymbol = null;
    public polygonsymbol = null;
    public displayedLayerid: any = "";
    private view: any = null;
    private drawlayerscollection: Array<[string, string, any]> = [];
    constructor(view: any) {
        super();
        this.init(view);
        this.polygonsymbol = {
            type: "simple-fill",
            color: [255, 255, 255, 0.6],
            style: "solid",
            outline: {
                color: [255, 255, 0, 0.8],
                width: 2
            }
        };
        this.polylinesymbol  = {
            type: "simple-line",
            color: [255, 255, 255, 0.6],
            width: "2px",
            style: "short-dot"
        };
        this.marksymbol  = {
            type: "simple-marker",
            style: "circle",
            color: [255, 255, 255, 0.6],
            size: "8px",
            outline: {
                color: [255, 255, 0, 0.8],
                width: 1
            }
        };
    }
    public drawcircle() {
        load(['esri/views/draw/Draw', 'esri/views/draw/PointDrawAction', 'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', 'esri/geometry/geometryEngine'])
            // tslint:disable-next-line:variable-name
            .then(([draw, PointDrawAction, Graphic, GraphicsLayer, Point, geometryEngine]) => {
                const drawcircle = new draw({
                    view: this.view
                });
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (drawresultlayer == null) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '绘制结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawcircleLayerid = new Guid().uuid;
                let drawcircleresultlayer = this.view.map.findLayerById(drawcircleLayerid);
                if (!drawcircleresultlayer) {
                    drawcircleresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '画圆显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawcircleresultlayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = drawcircle.create("circle", { mode: "click" });
                this.view.focus();
                action.on("vertex-add", (event) => {
                    if (event.vertices.length === 2) {
                        drawcircleresultlayer.removeAll();
                        const point1 = new Point({
                            x: event.vertices[0][0],
                            y: event.vertices[0][1],
                            spatialReference: this.view.spatialReference
                        });
                        const point2 = new Point({
                            x: event.vertices[1][0],
                            y: event.vertices[1][1],
                            spatialReference: this.view.spatialReference
                        });

                        const distance = geometryEngine.distance(point1, point2, 'meters');
                        const geommetry = geometryEngine.buffer(point1, distance, 'meters');
                        const graphic = new Graphic({
                            geometry: geommetry,
                            symbol: this.polygonsymbol
                        });
                        drawcircleresultlayer.add(graphic);
                    }
                }
                );
                action.on("vertex-remove", (event) => { console.log(event); });
                action.on("cursor-update", (event) => {
                    if (event.vertices.length === 2) {
                        drawcircleresultlayer.removeAll();
                        const point1 = new Point({
                            x: event.vertices[0][0],
                            y: event.vertices[0][1],
                            spatialReference: this.view.spatialReference
                        });
                        const point2 = new Point({
                            x: event.vertices[1][0],
                            y: event.vertices[1][1],
                            spatialReference: this.view.spatialReference
                        });
                        const distance = geometryEngine.distance(point1, point2, 'meters');
                        const geommetry = geometryEngine.buffer(point1, distance, 'meters');

                        const graphic = new Graphic({
                            geometry: geommetry,
                            symbol: this.polygonsymbol
                        });
                        drawcircleresultlayer.add(graphic);
                    }
                }
                );
                action.on("redo", (event) => { console.log(event); });
                action.on("undo", (event) => { console.log(event); });
                action.on("draw-complete", (event) => {
                    if (event.vertices.length === 2) {
                        const point1 = new Point({
                            x: event.vertices[0][0],
                            y: event.vertices[0][1],
                            spatialReference: this.view.spatialReference
                        });
                        const point2 = new Point({
                            x: event.vertices[1][0],
                            y: event.vertices[1][1],
                            spatialReference: this.view.spatialReference
                        });

                        const distance = geometryEngine.distance(point1, point2, 'meters');
                        const geommetry = geometryEngine.buffer(point1, distance, 'meters');
                        const graphic = new Graphic({
                            geometry: geommetry,
                            symbol: {
                                type: "simple-fill",
                                color: [255, 255, 255, 0.6],
                                style: "solid",
                                outline: {
                                    color: "yellow",
                                    width: 2
                                }
                            }
                        });
                        this.view.map.remove(drawcircleresultlayer);
                        drawresultlayer.add(graphic);
                        this.emit('drawcomplete', graphic, 'circle');
                    }
                  }
                );
        });
    }

    public drawrectangle() {
        load(['esri/views/draw/Draw', 'esri/views/draw/PointDrawAction', 'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Polygon', 'esri/geometry/geometryEngine'])
            // tslint:disable-next-line:variable-name
            .then(([draw, PointDrawAction, Graphic, GraphicsLayer, Polygon, geometryEngine]) => {
                const drawcircle = new draw({
                    view: this.view
                });
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!drawresultlayer) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '绘制结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawrectangleLayerid = new Guid().uuid;
                let drawrectangleresultlayer = this.view.map.findLayerById(drawrectangleLayerid);
                if (drawrectangleresultlayer == null) {
                    drawrectangleresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '画圆显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawrectangleresultlayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = drawcircle.create("rectangle", { mode: "click" });
                this.view.focus();
                action.on("vertex-add", (event) => {
                    if (event.vertices.length === 2) {
                        drawrectangleresultlayer.removeAll();
                        const xmin = event.vertices[0][0] > event.vertices[1][0] ?
                         event.vertices[1][0] : event.vertices[0][0];
                        const ymin = event.vertices[0][1] > event.vertices[1][1] ?
                         event.vertices[1][1] : event.vertices[0][1];
                        const xmax = event.vertices[0][0] > event.vertices[1][0] ?
                            event.vertices[0][0] : event.vertices[1][0];
                        const ymax = event.vertices[0][1] > event.vertices[1][1] ?
                            event.vertices[0][1] : event.vertices[1][1];
                        const ringsss = [[[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]];
                        const pgon = new Polygon({
                            hasZ: true,
                            hasM: true,
                            rings: ringsss,
                            spatialReference: this.view.spatialReference
                        });
                        const graphic = new Graphic({
                            geometry: pgon,
                            symbol: this.polygonsymbol
                        });
                        drawrectangleresultlayer.add(graphic);
                    }
                }
                );
                action.on("vertex-remove", (event) => { console.log(event); });
                action.on("cursor-update", (event) => {
                    if (event.vertices.length === 2) {
                        drawrectangleresultlayer.removeAll();
                        const xmin = event.vertices[0][0] > event.vertices[1][0] ?
                            event.vertices[1][0] : event.vertices[0][0];
                        const ymin = event.vertices[0][1] > event.vertices[1][1] ?
                            event.vertices[1][1] : event.vertices[0][1];
                        const xmax = event.vertices[0][0] > event.vertices[1][0] ?
                            event.vertices[0][0] : event.vertices[1][0];
                        const ymax = event.vertices[0][1] > event.vertices[1][1] ?
                            event.vertices[0][1] : event.vertices[1][1];
                        const ringsss = [[[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]];
                        const pgon = new Polygon({
                            hasZ: true,
                            hasM: true,
                            rings: ringsss,
                            spatialReference: this.view.spatialReference
                        });
                        const graphic = new Graphic({
                            geometry: pgon,
                            symbol: this.polygonsymbol
                        });
                        drawrectangleresultlayer.add(graphic);
                    }
                }
                );
                action.on("redo", (event) => { console.log(event); });
                action.on("undo", (event) => { console.log(event); });
                action.on("draw-complete", (event) => {
                    if (event.vertices.length === 2) {
                        const xmin = event.vertices[0][0] > event.vertices[1][0] ?
                            event.vertices[1][0] : event.vertices[0][0];
                        const ymin = event.vertices[0][1] > event.vertices[1][1] ?
                            event.vertices[1][1] : event.vertices[0][1];
                        const xmax = event.vertices[0][0] > event.vertices[1][0] ?
                            event.vertices[0][0] : event.vertices[1][0];
                        const ymax = event.vertices[0][1] > event.vertices[1][1] ?
                            event.vertices[0][1] : event.vertices[1][1];
                        const ringsss = [[[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]];
                        const pgon = new Polygon({
                            hasZ: true,
                            hasM: true,
                            rings: ringsss,
                            spatialReference: this.view.spatialReference
                        });
                        const graphic = new Graphic({
                            geometry: pgon,
                            symbol: this.polygonsymbol
                        });
                        this.view.map.remove(drawrectangleresultlayer);
                        drawresultlayer.add(graphic);
                        this.emit('drawcomplete', graphic, 'rectangle');
                    }
                }
              );
            });
    }
    public clean() {
        const drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
        if (drawresultlayer) {
            this.view.map.remove(drawresultlayer);
        }
    }
    public show() {
        const drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
        if (drawresultlayer) {
            drawresultlayer.visible = true;
        }
    }
    public hide() {
        const drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
        if (drawresultlayer) {
            drawresultlayer.visible = false;
        }
    }
    private async init(view: any) {
        this.displayedLayerid = new Guid().uuid;
        this.view = view;
        this.view.on(MapEvent.click,  (event) => {
            this.view.hitTest(event).then(async  (response) => {
                // if (response.results.length > 0) {
                //     const layerid = response.results[0].graphic.layer.id;
                //     if (layerid === this.displayedLayerid) {
                //         // this.emit(MapEvent.click, response.results[0].graphic, event.mapPoint);
                //     }
                // }
            });
     });

        this.view.on(MapEvent.pointermove, (event) => {
            this.view.hitTest(event).then(async (response) => {
                // if (response.results.length > 0) {
                //     const layerid = response.results[0].graphic.layer.id;
                //     if (layerid === this.displayedLayerid) {
                //         this.emit(MapEvent.pointermove, response.results[0].graphic, event.mapPoint);
                //     }
                // }
            });
        });
    }
}
