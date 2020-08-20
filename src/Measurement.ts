import Mapcofig from './config/Mapcofig';
import IBoundaryOptions from './interface/IBoundaryOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class Measurement extends EventEmitter {
    public marksymbol = null;
    public polylinesymbol = null;
    public polygonsymbol = null;
    public textsymbol = null;
    public displayedLayerid: any = "";
    private view: any = null;
    private drawtool: any = null;
    private drawlayerscollection: Array<[string, string, any]> = [];
    constructor(view: any) {
        super();
        this.init(view);
    }
    public circle() {
        load(['esri/views/draw/Draw', 'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', 'esri/geometry/geometryEngine'])
            // tslint:disable-next-line:variable-name
            .then(([draw, Graphic, GraphicsLayer, Point, geometryEngine]) => {
                this.drawtool = new draw({
                    view: this.view
                });
                this.drawtool.reset();
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (drawresultlayer == null) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawcircleLayerid = new Guid().uuid;
                let drawcircleresultlayer = this.view.map.findLayerById(drawcircleLayerid);
                if (!drawcircleresultlayer) {
                    drawcircleresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量圆实时追踪显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawcircleresultlayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = this.drawtool.create("circle", { mode: "click" });
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

                        const radiusgraphic = new Graphic({
                            geometry: {
                                type: "polyline",
                                paths: [[event.vertices[0], event.vertices[1]]],
                                spatialReference: this.view.spatialReference
                            },
                            symbol: this.polylinesymbol
                        });
                        const distance = geometryEngine.geodesicLength(radiusgraphic.geometry, 'meters');
                        const geommetry = geometryEngine.buffer(point1, distance, 'meters');
                        const area = geometryEngine.geodesicArea(geommetry, 'square-meters');
                        const circlegraphic = new Graphic({
                            geometry: geommetry,
                            symbol: this.polygonsymbol
                        });
                        const radiusdistancelabelsymbol = this.textsymbol;
                        const radiusdistancelabelstring = distance > 1000 ? "半径:" + (distance / 1000).toFixed(3) + "千米"
                            : "半径:" + parseFloat(distance).toFixed(3) + "米";
                        radiusdistancelabelsymbol.text = radiusdistancelabelstring;
                        const radiusdistancelabelgraphic = new Graphic({
                            geometry: point2,
                            symbol: radiusdistancelabelsymbol
                        });
                        const arealabelsymbol = this.textsymbol;
                        const arealabelstring = area > 100000 ? "面积:" + (area / 1000000).toFixed(3) + "平千方米"
                            : "面积:" + parseFloat(area).toFixed(3) + "平方米";
                        arealabelsymbol.text = arealabelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: point1,
                            symbol: arealabelsymbol
                        });

                        drawcircleresultlayer.add(circlegraphic);
                        drawcircleresultlayer.add(radiusgraphic);
                        drawcircleresultlayer.add(radiusdistancelabelgraphic);
                        drawcircleresultlayer.add(arealabelgraphic);
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
                        const radiusgraphic = new Graphic({
                            geometry: {
                                type: "polyline",
                                paths: [[event.vertices[0], event.vertices[1]]],
                                spatialReference: this.view.spatialReference
                            },
                            symbol: this.polylinesymbol
                        });

                        const distance = geometryEngine.geodesicLength(radiusgraphic.geometry, 'meters');
                        const geommetry = geometryEngine.buffer(point1, distance, 'meters');
                        const area = geometryEngine.geodesicArea(geommetry, 'square-meters');
                        const circlegraphic = new Graphic({
                            geometry: geommetry,
                            symbol: this.polygonsymbol
                        });

                        const radiusdistancelabelsymbol = this.textsymbol;
                        const radiusdistancelabelstring = distance > 1000 ? "半径:" + (distance / 1000).toFixed(3) + "千米"
                            : "半径:" + parseFloat(distance).toFixed(3) + "米";
                        radiusdistancelabelsymbol.text = radiusdistancelabelstring;
                        const radiusdistancelabelgraphic = new Graphic({
                            geometry: point2,
                            symbol: radiusdistancelabelsymbol
                        });
                        const arealabelsymbol = this.textsymbol;
                        const arealabelstring = area > 100000 ? "面积:" + (area / 1000000).toFixed(3) + "平千方米"
                            : "面积:" + parseFloat(area).toFixed(3) + "平方米";
                        arealabelsymbol.text = arealabelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: point1,
                            symbol: arealabelsymbol
                        });
                        drawcircleresultlayer.add(circlegraphic);
                        drawcircleresultlayer.add(radiusgraphic);
                        drawcircleresultlayer.add(radiusdistancelabelgraphic);
                        drawcircleresultlayer.add(arealabelgraphic);
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

                        const radiusgraphic = new Graphic({
                            geometry: {
                                type: "polyline",
                                paths: [[event.vertices[0], event.vertices[1]]],
                                spatialReference: this.view.spatialReference
                            },
                            symbol: this.polylinesymbol
                        });

                        const distance = geometryEngine.geodesicLength(radiusgraphic.geometry, 'meters');
                        const geommetry = geometryEngine.buffer(point1, distance, 'meters');
                        const area = geometryEngine.geodesicArea(geommetry, 'square-meters');
                        const circlegraphic = new Graphic({
                            geometry: geommetry,
                            symbol: this.polygonsymbol
                        });

                        const radiusdistancelabelsymbol = this.textsymbol;
                        const radiusdistancelabelstring = distance > 1000 ? "半径:" + (distance / 1000).toFixed(3) + "千米"
                            : "半径:" + parseFloat(distance).toFixed(3) + "米";
                        radiusdistancelabelsymbol.text = radiusdistancelabelstring;
                        const radiusdistancelabelgraphic = new Graphic({
                            geometry: point2,
                            symbol: radiusdistancelabelsymbol
                        });
                        const arealabelsymbol = this.textsymbol;
                        const arealabelstring = area > 100000 ? "面积:" + (area / 1000000).toFixed(3) + "平千方米"
                        : "面积:" + parseFloat(area).toFixed(3) + "平方米";
                        arealabelsymbol.text = arealabelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: point1,
                            symbol: arealabelsymbol
                        });

                        this.view.map.remove(drawcircleresultlayer);
                        drawresultlayer.add(circlegraphic);
                        drawresultlayer.add(radiusgraphic);
                        drawresultlayer.add(radiusdistancelabelgraphic);
                        drawresultlayer.add(arealabelgraphic);
                        const result = {
                         radiusdistance: distance,
                         circlearea: area
                        };
                        this.emit('measurementcomplete', circlegraphic, result, 'circle');
                    }
                  }
                );
        });
    }

    public rectangle() {
        load(['esri/views/draw/Draw', 'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', "esri/geometry/Polygon", 'esri/geometry/geometryEngine'])
            // tslint:disable-next-line:variable-name
            .then(([draw, Graphic, GraphicsLayer, Point, Polygon, geometryEngine]) => {
                this.drawtool = new draw({
                    view: this.view
                });
                this.drawtool.reset();
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!drawresultlayer) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawrectangleLayerid = new Guid().uuid;
                let drawrectangleresultlayer = this.view.map.findLayerById(drawrectangleLayerid);
                if (drawrectangleresultlayer == null) {
                    drawrectangleresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量矩形实时追踪显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawrectangleresultlayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = this.drawtool.create("rectangle", { mode: "click" });
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

                        const rlengthGeometry = new Point({
                            x: xmin + (xmax - xmin) / 2,
                            y: ymin ,
                            spatialReference: this.view.spatialReference
                        });
                        const rlengthbegin = new Point({
                            x: xmin,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rlengthend = new Point({
                            x: xmax,
                            y: xmin,
                            spatialReference: this.view.spatialReference
                        });
                        const length = geometryEngine.distance(rlengthbegin, rlengthend, 'meters');
                        const rlengthlabelsymbol = this.textsymbol;
                        const rlengthlabelstring = length > 1000 ? "长度:" + (length / 1000).toFixed(3) + "千米"
                            : "长度:" + length.toFixed(3) + "米";
                        rlengthlabelsymbol.text = rlengthlabelstring;
                        const rlengthlabelgraphic = new Graphic({
                            geometry: rlengthGeometry,
                            symbol: rlengthlabelsymbol
                        });

                        const rwidthGeometry = new Point({
                            x: xmax ,
                            y: ymin + (ymax - ymin) / 2,
                            spatialReference: this.view.spatialReference
                        });
                        const rwidthbegin = new Point({
                            x: xmax,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rwidthend = new Point({
                            x: xmax,
                            y: ymax,
                            spatialReference: this.view.spatialReference
                        });
                        const width = geometryEngine.distance(rwidthbegin, rwidthend, 'meters');
                        const rwidthlabelsymbol = this.textsymbol;
                        const rwidthlabelstring = width > 1000 ? "宽度:" + (width / 1000).toFixed(3) + "千米"
                            : "宽度:" + width.toFixed(3) + "米";
                        rwidthlabelsymbol.text = rwidthlabelstring;
                        const rlwidthlabelgraphic = new Graphic({
                            geometry: rwidthGeometry,
                            symbol: rwidthlabelsymbol
                        });

                        const centergeometry = new Point({
                            x: xmin + (xmax - xmin) / 2,
                            y: ymin + (ymax - ymin) / 2,
                            spatialReference: this.view.spatialReference
                        });
                        const arealabelsymbol = this.textsymbol;
                        const area = length * width;
                        const arealabelstring = area > 100000 ? "面积:" + (area / 1000000).toFixed(3) + "平方千米"
                            : "面积:" + area.toFixed(3) + "平方米";
                        arealabelsymbol.text = arealabelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: centergeometry,
                            symbol: arealabelsymbol
                        });

                        drawrectangleresultlayer.add(rlengthlabelgraphic);
                        drawrectangleresultlayer.add(rlwidthlabelgraphic);
                        drawrectangleresultlayer.add(arealabelgraphic);
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
                        const rlengthGeometry = new Point({
                            x: xmin + (xmax - xmin) / 2,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rlengthbegin = new Point({
                            x: xmin,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rlengthend = new Point({
                            x: xmax,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const length = geometryEngine.distance(rlengthbegin, rlengthend, 'meters');
                        const rlengthlabelsymbol = this.textsymbol;
                        const rlengthlabelstring = length > 1000 ? "长度:" + (length / 1000).toFixed(3) + "千米"
                            : "长度:" + length.toFixed(3) + "米";
                        rlengthlabelsymbol.text = rlengthlabelstring;
                        const rlengthlabelgraphic = new Graphic({
                            geometry: rlengthGeometry,
                            symbol: rlengthlabelsymbol
                        });

                        const rwidthGeometry = new Point({
                            x: xmax,
                            y: ymin + (ymax - ymin) / 2,
                            spatialReference: this.view.spatialReference
                        });
                        const rwidthbegin = new Point({
                            x: xmax,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rwidthend = new Point({
                            x: xmax,
                            y: ymax,
                            spatialReference: this.view.spatialReference
                        });
                        const width = geometryEngine.distance(rwidthbegin, rwidthend, 'meters');
                        const rwidthlabelsymbol = this.textsymbol;
                        const rwidthlabelstring = width > 1000 ? "宽度:" + (width / 1000).toFixed(3) + "千米"
                            : "宽度:" + width.toFixed(3) + "米";
                        rwidthlabelsymbol.text = rwidthlabelstring;
                        const rlwidthlabelgraphic = new Graphic({
                            geometry: rwidthGeometry,
                            symbol: rwidthlabelsymbol
                        });

                        const centergeometry = new Point({
                            x: xmin + (xmax - xmin) / 2,
                            y: ymin + (ymax - ymin) / 2,
                            spatialReference: this.view.spatialReference
                        });
                        const arealabelsymbol = this.textsymbol;
                        const area = length * width;
                        const arealabelstring = area > 100000 ? "面积:" + (area / 1000000).toFixed(3) + "平方千米"
                            : "面积:" + area.toFixed(3) + "平方米";
                        arealabelsymbol.text = arealabelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: centergeometry,
                            symbol: arealabelsymbol
                        });

                        drawrectangleresultlayer.add(rlengthlabelgraphic);
                        drawrectangleresultlayer.add(rlwidthlabelgraphic);
                        drawrectangleresultlayer.add(arealabelgraphic);
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

                        const rlengthGeometry = new Point({
                            x: xmin + (xmax - xmin) / 2,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rlengthbegin = new Point({
                            x: xmin,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rlengthend = new Point({
                            x: xmax,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rlength = geometryEngine.distance(rlengthbegin, rlengthend, 'meters');
                        const rlengthlabelsymbol = this.textsymbol;
                        const rlengthlabelstring = rlength > 1000 ? "长度:" + (rlength / 1000).toFixed(3) + "千米"
                            : "长度:" + rlength.toFixed(3) + "米";
                        rlengthlabelsymbol.text = rlengthlabelstring;
                        const rlengthlabelgraphic = new Graphic({
                            geometry: rlengthGeometry,
                            symbol: rlengthlabelsymbol
                        });

                        const rwidthGeometry = new Point({
                            x: xmax,
                            y: ymin + (ymax - ymin) / 2,
                            spatialReference: this.view.spatialReference
                        });
                        const rwidthbegin = new Point({
                            x: xmax,
                            y: ymin,
                            spatialReference: this.view.spatialReference
                        });
                        const rwidthend = new Point({
                            x: xmax,
                            y: ymax,
                            spatialReference: this.view.spatialReference
                        });
                        const rwidth = geometryEngine.distance(rwidthbegin, rwidthend, 'meters');
                        const rwidthlabelsymbol = this.textsymbol;
                        const rwidthlabelstring = rwidth > 1000 ? "宽度:" + (rwidth / 1000).toFixed(3) + "千米"
                            : "宽度:" + rwidth.toFixed(3) + "米";
                        rwidthlabelsymbol.text = rwidthlabelstring;
                        const rlwidthlabelgraphic = new Graphic({
                            geometry: rwidthGeometry,
                            symbol: rwidthlabelsymbol
                        });

                        const centergeometry = new Point({
                            x: xmin + (xmax - xmin) / 2,
                            y: ymin + (ymax - ymin) / 2,
                            spatialReference: this.view.spatialReference
                        });
                        const arealabelsymbol = this.textsymbol;
                        const rarea = rlength * rwidth;
                        const arealabelstring = rarea > 100000 ? "面积:" + (rarea / 1000000).toFixed(3) + "平方千米"
                            : "面积:" + rarea.toFixed(3) + "平方米";
                        arealabelsymbol.text = arealabelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: centergeometry,
                            symbol: arealabelsymbol
                        });
                        this.view.map.remove(drawrectangleresultlayer);
                        drawresultlayer.add(rlengthlabelgraphic);
                        drawresultlayer.add(rlwidthlabelgraphic);
                        drawresultlayer.add(arealabelgraphic);
                        drawresultlayer.add(graphic);
                        this.emit('measurementcomplete', graphic, {
                           length: rlength,
                           width: rwidth,
                           area: rwidth * rlength
                        }, 'rectangle');
                    }
                }
              );
            });
    }

    public Point() {
        load(['esri/views/draw/Draw', 'esri/Graphic', 'esri/layers/GraphicsLayer'])
            // tslint:disable-next-line:variable-name
            .then(([draw, Graphic, GraphicsLayer]) => {
                this.drawtool = new draw({
                    view: this.view
                });
                this.drawtool.reset();
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!drawresultlayer) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawPointLayerid = new Guid().uuid;
                let drawPointresultlayer = this.view.map.findLayerById(drawPointLayerid);
                if (drawPointresultlayer == null) {
                    drawPointresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量点移动实时追踪显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawPointresultlayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = this.drawtool.create("point", { mode: "click" });
                this.view.focus();
                action.on("vertex-add", (event) => { console.log(event); });
                action.on("vertex-remove", (event) => { console.log(event); });
                action.on("cursor-update", (event) => {
                    drawPointresultlayer.removeAll();
                    const point = {
                        type: "point",
                        x: event.vertices[0][0],
                        y: event.vertices[0][1],
                        spatialReference: this.view.spatialReference
                    };
                    const graphic = new Graphic({
                       geometry: point,
                       symbol: this.marksymbol
                   });
                    drawPointresultlayer.add(graphic);
                    const labelsymbol = this.textsymbol;
                    labelsymbol.text = "(" + parseFloat(event.vertices[0][0]).toFixed(3)
                        + "," + parseFloat(event.vertices[0][1]).toFixed(3) + ")";
                    const labelgraphic = new Graphic({
                        geometry: point,
                        symbol: labelsymbol
                    });
                    drawPointresultlayer.add(labelgraphic);
                }
                );
                action.on("redo", (event) => { console.log(event); });
                action.on("undo", (event) => { console.log(event); });
                action.on("draw-complete", (event) => {
                    const point = {
                        type: "point",
                        x: event.vertices[0][0],
                        y: event.vertices[0][1],
                        spatialReference: this.view.spatialReference
                    };
                    const graphic = new Graphic({
                        geometry: point,
                        symbol: this.marksymbol
                    });
                    const labelsymbol = this.textsymbol;
                    labelsymbol.text = "(" + parseFloat(event.vertices[0][0]).toFixed(3)
                        + "," + parseFloat(event.vertices[0][1]).toFixed(3) + ")";
                    const labelgraphic = new Graphic({
                        geometry: point,
                        symbol: labelsymbol
                    });
                    this.view.map.remove(drawPointresultlayer);
                    drawresultlayer.add(labelgraphic);
                    drawresultlayer.add(graphic);
                    const coordinates = "(" + parseFloat(event.vertices[0][0]).toFixed(3)
                        + "," + parseFloat(event.vertices[0][0]).toFixed(3) + ")";
                    this.emit('measurementcomplete', graphic, coordinates, 'point');
                 }
                );
            });
    }

    public Multipoint() {
        load(['esri/views/draw/Draw', 'esri/views/draw/PointDrawAction', 'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Polygon', 'esri/geometry/geometryEngine'])
            // tslint:disable-next-line:variable-name
            .then(([draw, PointDrawAction, Graphic, GraphicsLayer, Polygon, geometryEngine]) => {
                this.drawtool = new draw({
                    view: this.view
                });
                this.drawtool.reset();
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!drawresultlayer) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawmultipointLayerid = new Guid().uuid;
                let drawmultipointresultlayer = this.view.map.findLayerById(drawmultipointLayerid);
                if (drawmultipointresultlayer == null) {
                    drawmultipointresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量多点临时显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawmultipointresultlayer);
                }

                const drawmultipointMoveLayerid = new Guid().uuid;
                let drawmultipointMovelayer = this.view.map.findLayerById(drawmultipointMoveLayerid);
                if (drawmultipointMovelayer == null) {
                    drawmultipointMovelayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量多点移动追踪显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawmultipointMovelayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = this.drawtool.create("multipoint", { mode: "click" });
                this.view.focus();
                action.on("vertex-add", (event) => {
                    drawmultipointresultlayer.removeAll();
                    event.vertices.map((addpoint) => {
                        const point = {
                            type: "point",
                            x: addpoint[0],
                            y: addpoint[1],
                            spatialReference: this.view.spatialReference
                        };
                        const graphic = new Graphic({
                            geometry: point,
                            symbol: this.marksymbol
                        });
                        const labelsymbol = this.textsymbol;
                        labelsymbol.text = "(" + parseFloat(addpoint[0]).toFixed(3)
                            + "," + parseFloat(addpoint[1]).toFixed(3) + ")";
                        const labelgraphic = new Graphic({
                            geometry: point,
                            symbol: labelsymbol
                        });
                        drawmultipointresultlayer.add(labelgraphic);
                        drawmultipointresultlayer.add(graphic);
                    });
                });
                action.on("vertex-remove", (event) => { console.log(event); });
                action.on("cursor-update", (event) => {
                    drawmultipointMovelayer.removeAll();
                    event.vertices.map((addpoint) => {
                        const point = {
                            type: "point",
                            x: addpoint[0],
                            y: addpoint[1],
                            spatialReference: this.view.spatialReference
                        };
                        const graphic = new Graphic({
                            geometry: point,
                            symbol: this.marksymbol
                        });
                        const labelsymbol = this.textsymbol;
                        labelsymbol.text = "(" + parseFloat(addpoint[0]).toFixed(3)
                            + "," + parseFloat(addpoint[1]).toFixed(3) + ")";
                        const labelgraphic = new Graphic({
                            geometry: point,
                            symbol: labelsymbol
                        });
                        drawmultipointMovelayer.add(labelgraphic);
                        drawmultipointMovelayer.add(graphic);
                    });
                  }
                );
                action.on("redo", (event) => { console.log(event); });
                action.on("undo", (event) => { console.log(event); });
                action.on("draw-complete", (event) => {
                    this.view.map.remove(drawmultipointresultlayer);
                    this.view.map.remove(drawmultipointMovelayer);
                    const graphicsmutipointlist = [];
                    const pointarraylist = [];
                    event.vertices.map((addpoint) => {
                        const point = {
                            type: "point",
                            x: addpoint[0],
                            y: addpoint[1],
                            spatialReference: this.view.spatialReference
                        };
                        const graphic = new Graphic({
                            geometry: point,
                            symbol: this.marksymbol
                        });
                        const labelsymbol = this.textsymbol;
                        labelsymbol.text = "(" + parseFloat(addpoint[0]).toFixed(3)
                            + "," + parseFloat(addpoint[1]).toFixed(3) + ")";
                        const labelgraphic = new Graphic({
                            geometry: point,
                            symbol: labelsymbol
                        });
                        drawresultlayer.add(graphic);
                        drawresultlayer.add(labelgraphic);
                        graphicsmutipointlist.push(graphic);
                        pointarraylist.push(addpoint);
                    });
                    this.emit('measurementcomplete', graphicsmutipointlist, pointarraylist, 'multipoint');
                 }
                );
            });
    }

    public drawPolyline() {
        load(['esri/views/draw/Draw', 'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/geometryEngine'])
            // tslint:disable-next-line:variable-name
            .then(([draw, Graphic, GraphicsLayer, geometryEngine]) => {
                this.drawtool = new draw({
                    view: this.view
                });
                this.drawtool.reset();
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!drawresultlayer) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawPolylineid = new Guid().uuid;
                let drawPolylinelayer = this.view.map.findLayerById(drawPolylineid);
                if (drawPolylinelayer == null) {
                    drawPolylinelayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量多边线实时追踪显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawPolylinelayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = this.drawtool.create("polyline");
                this.view.focus();

                action.on([
                    "vertex-add",
                    "vertex-remove",
                    "cursor-update",
                    "redo",
                    "undo"
                 ], (event) => {
                        if (event.vertices.length > 1) {
                            const vertices = event.vertices;
                            drawPolylinelayer.removeAll();
                            const graphic = new Graphic({
                                geometry: {
                                    type: "polyline",
                                    paths: vertices,
                                    spatialReference: this.view.spatialReference
                                },
                                symbol: this.polylinesymbol
                            });
                            const getLastSegment = (polyline) => {
                                const line = polyline.clone();
                                const lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
                                const existingLineFinalPoint = line.getPoint(0, line.paths[0].length - 1);
                                return {
                                    type: "polyline",
                                    spatialReference: this.view.spatialReference,
                                    hasZ: false,
                                    paths: [[
                                        [existingLineFinalPoint.x, existingLineFinalPoint.y],
                                        [lastXYPoint.x, lastXYPoint.y]
                                    ]]
                                };
                            };

                            const isSelfIntersecting = (polylineIn) => {
                                if (polylineIn.paths[0].length < 3) {
                                    return false;
                                }
                                const line = polylineIn.clone();
                                const lastSegment = getLastSegment(polylineIn);
                                line.removePoint(0, line.paths[0].length - 1);
                                return geometryEngine.crosses(lastSegment, line);
                            };

                            if (isSelfIntersecting(graphic.geometry)) {
                                const pyline = new Graphic({
                                    geometry: getLastSegment(graphic.geometry),
                                    symbol: this.polylinesymbol
                                });
                                if (pyline) {
                                    drawPolylinelayer.addMany([graphic, pyline]);
                                }
                                if (pyline) {
                                    event.preventDefault();
                                }
                             } else {
                                drawPolylinelayer.add(graphic);
                             }
                            const labelsymbol = this.textsymbol;
                            const lengthdistance = geometryEngine.geodesicLength(graphic.geometry, 'meters');
                            const labelstring =  lengthdistance > 1000 ? "长度:" + (lengthdistance / 1000).toFixed(3) + "千米"
                                : "长度:" + lengthdistance.toFixed(3) + "米";
                            labelsymbol.text = labelstring;
                            const pline = graphic.geometry.clone();
                            const plastXYPoint = pline.removePoint(0, pline.paths[0].length - 1);
                            const labelgraphic = new Graphic({
                                geometry: plastXYPoint ,
                                symbol: labelsymbol
                            });
                            drawPolylinelayer.add(labelgraphic);
                        }
                  });
                action.on("draw-complete", (event) => {
                    if (event.vertices.length > 1) {
                        const vertices = event.vertices;
                        drawPolylinelayer.removeAll();
                        const graphic = new Graphic({
                            geometry: {
                                type: "polyline",
                                paths: vertices,
                                spatialReference: this.view.spatialReference
                            },
                            symbol: this.polylinesymbol
                        });
                        const getLastSegment = (polyline) => {
                            const line = polyline.clone();
                            const lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
                            const existingLineFinalPoint = line.getPoint(0, line.paths[0].length - 1);
                            return {
                                type: "polyline",
                                spatialReference: this.view.spatialReference,
                                hasZ: false,
                                paths: [[
                                    [existingLineFinalPoint.x, existingLineFinalPoint.y],
                                    [lastXYPoint.x, lastXYPoint.y]
                                ]]
                            };
                        };

                        const isSelfIntersecting = (polylineIn) => {
                            if (polylineIn.paths[0].length < 3) {
                                return false;
                            }
                            const line = polylineIn.clone();
                            const lastSegment = getLastSegment(polylineIn);
                            line.removePoint(0, line.paths[0].length - 1);
                            return geometryEngine.crosses(lastSegment, line);
                        };
                        let polyLine = null;
                        if (isSelfIntersecting(graphic.geometry)) {
                            const pyline = new Graphic({
                                geometry: getLastSegment(graphic.geometry),
                                symbol: this.polylinesymbol
                            });
                            if (pyline) {
                                drawresultlayer.addMany([graphic, pyline]);
                                polyLine = new Graphic({
                                    geometry: geometryEngine.union(graphic.geometry, pyline.geometry) ,
                                    symbol: this.polylinesymbol
                                });
                            }
                            if (pyline) {
                                event.preventDefault();
                            }
                        } else {
                            polyLine = graphic;
                            drawresultlayer.add(graphic);
                        }
                        const labelsymbol = this.textsymbol;
                        const lengthdistance = geometryEngine.geodesicLength(graphic.geometry, 'meters');
                        const labelstring = lengthdistance > 1000 ? "长度:" + (lengthdistance / 1000).toFixed(3) + "千米"
                            : "长度:" + lengthdistance.toFixed(3) + "米";
                        labelsymbol.text = labelstring;
                        const pline = graphic.geometry.clone();
                        const plastXYPoint = pline.removePoint(0, pline.paths[0].length - 1);
                        const labelgraphic = new Graphic({
                            geometry: plastXYPoint,
                            symbol: labelsymbol
                        });
                        drawresultlayer.add(labelgraphic);
                        this.view.map.remove(drawPolylinelayer);
                        this.emit('measurementcomplete', polyLine, {
                            distance: lengthdistance
                        } , 'polyline');
                    }
                });
            });
    }

    public drawPolygon() {
        load(['esri/views/draw/Draw', 'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/geometryEngine'])
            // tslint:disable-next-line:variable-name
            .then(([draw, Graphic, GraphicsLayer, geometryEngine]) => {
                this.drawtool = new draw({
                    view: this.view
                });
                this.drawtool.reset();
                let drawresultlayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!drawresultlayer) {
                    drawresultlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量结果显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawresultlayer);
                }

                const drawPolygonid = new Guid().uuid;
                let drawPolygonlayer = this.view.map.findLayerById(drawPolygonid);
                if (drawPolygonlayer == null) {
                    drawPolygonlayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '测量多边形实时追踪显示层',
                        listMode: 'hide'
                    });
                    this.view.map.add(drawPolygonlayer);
                }
                // this.drawlayerscollection.push(['drwacircle', drwacircleLayerid, drwacircleresultlayer]);
                const action = this.drawtool.create("polygon");
                this.view.focus();

                action.on([
                    "vertex-add",
                    "vertex-remove",
                    "cursor-update",
                    "redo",
                    "undo"
                ], (event) => {
                        const vertices = event.vertices;
                        drawPolygonlayer.removeAll();
                        const polygon = {
                            type: "polygon", // autocasts as Polygon
                            rings: vertices,
                            spatialReference: this.view.spatialReference
                        };
                        const graphic = new Graphic({
                            geometry: polygon,
                            symbol: this.polygonsymbol
                        });
                        if (event.vertices.length > 3) {
                        const area = geometryEngine.geodesicArea(graphic.geometry, "square-meters");
                        const arealabelsymbol = this.textsymbol;

                        const labelstring = Math.abs(area) > 100000 ? "面积:" + (Math.abs(area) / 1000000).toFixed(3) + "平方千米"
                            : "面积:" + Math.abs(area).toFixed(3) + "平方米";
                        arealabelsymbol.text = labelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: graphic.geometry.extent.center,
                            symbol: arealabelsymbol
                        });
                        drawPolygonlayer.add(arealabelgraphic);

                        }
                        drawPolygonlayer.add(graphic);
                });
                action.on("draw-complete", (event) => {
                        const vertices = event.vertices;
                        drawPolygonlayer.removeAll();

                        const polygon = {
                            type: "polygon", // autocasts as Polygon
                            rings: vertices,
                            spatialReference: this.view.spatialReference
                        };
                        const graphic = new Graphic({
                            geometry: polygon,
                            symbol: this.polygonsymbol
                        });
                        const polygonarea = geometryEngine.geodesicArea(graphic.geometry, "square-meters");
                        const arealabelsymbol = this.textsymbol;
                        const labelstring = Math.abs(polygonarea) > 100000 ? "面积:" +
                        (Math.abs(polygonarea) / 1000000).toFixed(3) + "平方千米"
                            : "面积:" + Math.abs(polygonarea).toFixed(3) + "平方米";
                        arealabelsymbol.text = labelstring;
                        const arealabelgraphic = new Graphic({
                            geometry: graphic.geometry.extent.center,
                            symbol: arealabelsymbol
                        });
                        this.view.map.remove(drawPolygonlayer);
                        drawresultlayer.add(arealabelgraphic);
                        drawresultlayer.add(graphic);
                        this.emit('measurementcomplete', graphic, { area: polygonarea }, 'polygon');
                });
            });
    }
    public reset() {
        if (this.drawtool) {
            this.drawtool.reset();
        }
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
        if (this.view.type === '2d') {
            this.polygonsymbol = {
                type: "simple-fill",
                color: [255, 255, 255, 0.6],
                style: "solid",
                outline: {
                    color: [255, 255, 0, 0.8],
                    width: 2
                }
            };
            this.polylinesymbol = {
                type: "simple-line",
                color: [255, 255, 255, 0.6],
                width: "4px",
                style: "solid"
            };
            this.marksymbol = {
                type: "simple-marker",
                style: "circle",
                color: [255, 255, 0, 0.6],
                size: "24px",
                outline: {
                    color: [255, 255, 0, 0.8],
                    width: 2
                }
            };
            this.textsymbol = {
                type: "text",
                color: "white",
                angle: 0,
                text: "",
                xoffset: 60,
                yoffset: 10,
                horizontalAlignment: 'right',
                verticalAlignment: 'bottom',
                font: {
                    size: 12,
                    family: "Josefin Slab",
                    weight: "bold"
                }
            };
        } else {
            this.polygonsymbol = {
                type: "polygon-3d",
                symbolLayers: [{
                    type: "extrude",
                    castShadows: false,
                    size: 10,
                    material: { color: [255, 255, 255, 0.4] },
                    edges: {
                        type: "solid",
                        color: [50, 50, 50, 0.5]
                    }
                }]
            };
            this.polylinesymbol = {
                type: "line-3d",
                symbolLayers: [{
                    type: "path",
                    anchor: "center",
                    Values: "center",
                    profile: "quad",
                    width: 2,
                    height: 10,
                    material: { color: [255, 255, 255, 0.4] },
                    cap: "square",
                    join: "miter",
                    castShadows: false,
                    profileRotation: "heading"
                }]
            };
            this.marksymbol = {
                type: "point-3d",
                symbolLayers: [{
                    type: "object",
                    width: 20,
                    height: 20,
                    depth: 20,
                    resource: { primitive: "sphere" },
                    material: { color: [0, 0, 255, 0.8] }
                }],
                verticalOffset: {
                    screenLength: 60,
                    maxWorldLength: 1000,
                    minWorldLength: 20
                },
                callout: {
                    type: "line",
                    size: 1.5,
                    color: "white",
                    border: {
                        color: "black"
                    }
                }
            };
            this.textsymbol = {
                type: "text",
                color: "white",
                angle: 0,
                text: "",
                xoffset: 60,
                yoffset: 10,
                horizontalAlignment: 'right',
                verticalAlignment: 'bottom',
                font: {
                    size: 12,
                    family: "Josefin Slab",
                    weight: "bold"
                }
            };
        }
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
