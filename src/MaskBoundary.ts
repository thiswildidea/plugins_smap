import Mapcofig from './config/Mapcofig';
import IMaskOptions from './interface/IMaskOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
export default class MaskBoundary extends EventEmitter {
    public displayedLayerid: any = "";
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }

    public add(maskOptions: IMaskOptions) {
        load(['esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Polygon', 'esri/geometry/geometryEngineAsync',
            'esri/geometry/SpatialReference', 'esri/Color'])
            // tslint:disable-next-line:variable-name
            .then(([Graphic, GraphicsLayer, ArcPolygon, geometryEngineAsync, SpatialReference, Color]) => {
                let boundaryLayer = null;
                if (maskOptions.boundaryType === "qx_boundary") {
                    boundaryLayer = this.view.map.findLayerById('qx_boundary');
                } else if (maskOptions.boundaryType === "jd_boundary") {
                    boundaryLayer = this.view.map.findLayerById('jd_boundary');
                } else if (maskOptions.boundaryType === "jwh_boundary") {
                    boundaryLayer = this.view.map.findLayerById('jwh_boundary');
                }
                let maskgraphiclayer = this.view.map.findLayerById(this.displayedLayerid);
                if (maskgraphiclayer == null) {
                    maskgraphiclayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: '遮罩层',
                        listMode: 'hide'
                    });
                    this.view.map.add(maskgraphiclayer);
                }
                maskgraphiclayer.removeAll();
                if (maskOptions.inputgeometry) {
                    boundaryLayer = this.view.map.findLayerById('qx_boundary');
                    if (boundaryLayer === null) { return; }
                    const pgon = new ArcPolygon({
                        rings: maskOptions.inputgeometry,
                        spatialReference: this.view.spatialReference
                    });
                    const fullgeometry = boundaryLayer.fullExtent;
                    fullgeometry.spatialReference = this.view.spatialReference;
                    const geomtry = pgon;
                    geomtry.spatialReference = this.view.spatialReference;
                    geometryEngineAsync.buffer(geomtry, maskOptions.boundarydistance, 'meters').
                        then((targetGeometry) => {
                            geometryEngineAsync.difference(fullgeometry, targetGeometry).then((outermask) => {
                                let masksymbol;
                                if (this.view.type === '3d') {
                                    if (maskOptions.symbol) {
                                        masksymbol = {
                                            type: 'polygon-3d',
                                            symbolLayers: [{
                                                type: 'extrude',
                                                material: { color: maskOptions.maskColor },
                                                size: maskOptions.symbol.size,
                                                edges: {
                                                    type: "solid",
                                                    color: maskOptions.maskColor
                                                }
                                            }]
                                        };
                                    } else {
                                        masksymbol = {
                                            type: 'polygon-3d',
                                            symbolLayers: [{
                                                type: 'fill',
                                                material: { color: maskOptions.maskColor },
                                                outline: {
                                                    color: 'white',
                                                    size: '0px'
                                                }
                                            }]
                                        };
                                    }
                                } else {
                                    masksymbol = {
                                        type: "simple-fill",
                                        color: maskOptions.maskColor,
                                        style: "solid",
                                        outline: {
                                            color: maskOptions.maskColor,
                                            width: 1
                                        }
                                    };
                                }
                                const outermaskGraphic = new Graphic({
                                    geometry: outermask,
                                    symbol: masksymbol
                                });
                                maskgraphiclayer.add(outermaskGraphic);
                                const length = maskOptions.bounarycount === undefined ? 30 : maskOptions.bounarycount;
                                const maskgcount = Math.ceil(maskOptions.boundarydistance / length);
                                const setingcolor = new Color(maskOptions.boundaryColor).toRgba();
                                for (let j = 1; j <= maskgcount; j++) {
                                    geometryEngineAsync.buffer(geomtry, j * length, 'meters').
                                        then((resgeometryouter) => {
                                            geometryEngineAsync.buffer(geomtry, (j - 1) * length, 'meters').
                                                then((resgeometryinner) => {
                                                    geometryEngineAsync.difference(resgeometryouter, resgeometryinner).
                                                        then((clipgeometry) => {
                                                            setingcolor[3] = (1 / maskgcount) * j;
                                                            let maskroundsymbol;
                                                            if (this.view.type === '3d') {
                                                                if (maskOptions.symbol) {
                                                                    maskroundsymbol = {
                                                                        type: 'polygon-3d',
                                                                        symbolLayers: [{
                                                                            type: 'extrude',
                                                                            material: { color: setingcolor },
                                                                            size: maskOptions.symbol.size,
                                                                            edges: {
                                                                                type: "solid",
                                                                                color: setingcolor
                                                                            }
                                                                        }]
                                                                    };
                                                                } else {
                                                                    maskroundsymbol = {
                                                                        type: 'polygon-3d',
                                                                        symbolLayers: [{
                                                                            type: 'fill',
                                                                            material: { color: setingcolor },
                                                                            outline: {
                                                                                color: 'white',
                                                                                size: '0px'
                                                                            }
                                                                        }]
                                                                    };
                                                                }
                                                            } else {
                                                                maskroundsymbol = {
                                                                    type: "simple-fill",
                                                                    color: setingcolor,
                                                                    style: "solid",
                                                                    outline: {
                                                                        color: setingcolor,
                                                                        width: 1
                                                                    }
                                                                };
                                                            }
                                                            const maskroundGraphic = new Graphic({
                                                                geometry: clipgeometry,
                                                                symbol: maskroundsymbol
                                                            });
                                                            maskgraphiclayer.add(maskroundGraphic);
                                                        });
                                                });
                                        });
                                }
                            });
                        });
                } else {
                    if (boundaryLayer === null) { return; }
                    const queryParams = boundaryLayer.createQuery();
                    queryParams.where = maskOptions.boundaryDefinition;
                    boundaryLayer.queryFeatures(queryParams).then((results) => {
                        if (!results.features.length) { return; }
                        const fullgeometry = boundaryLayer.fullExtent;
                        fullgeometry.spatialReference = this.view.spatialReference;
                        const geomtry = results.features[0].geometry;
                        geomtry.spatialReference = this.view.spatialReference;
                        geometryEngineAsync.buffer(geomtry, maskOptions.boundarydistance, 'meters').
                            then((targetGeometry) => {
                                geometryEngineAsync.difference(fullgeometry, targetGeometry).then((outermask) => {
                                    let masksymbol;
                                    if (this.view.type === '3d') {
                                        if (maskOptions.symbol) {
                                            masksymbol = {
                                                type: 'polygon-3d',
                                                symbolLayers: [{
                                                    type: 'extrude',
                                                    material: { color: maskOptions.maskColor },
                                                    size: maskOptions.symbol.size,
                                                    edges: {
                                                        type: "solid",
                                                        color: maskOptions.maskColor
                                                    }
                                                }]
                                            };
                                        } else {
                                            masksymbol = {
                                                type: 'polygon-3d',
                                                symbolLayers: [{
                                                    type: 'fill',
                                                    material: { color: maskOptions.maskColor },
                                                    outline: {
                                                        color: 'white',
                                                        size: '0px'
                                                    }
                                                }]
                                            };
                                        }
                                    } else {
                                        masksymbol = {
                                            type: "simple-fill",
                                            color: maskOptions.maskColor,
                                            style: "solid",
                                            outline: {
                                                color: maskOptions.maskColor,
                                                width: 1
                                            }
                                        };
                                    }
                                    const outermaskGraphic = new Graphic({
                                        geometry: outermask,
                                        symbol: masksymbol
                                    });
                                    maskgraphiclayer.add(outermaskGraphic);
                                    const length = maskOptions.bounarycount === undefined ? 30
                                     : maskOptions.bounarycount;
                                    const maskgcount = Math.ceil(maskOptions.boundarydistance / length);
                                    //  let calgeometry = geomtry;
                                    const setingcolor = new Color(maskOptions.boundaryColor).toRgba();
                                    for (let j = 1; j <= maskgcount; j++) {
                                        geometryEngineAsync.buffer(geomtry, j * length, 'meters').
                                            then((resgeometryouter) => {
                                                geometryEngineAsync.buffer(geomtry, (j - 1) * length, 'meters').
                                                    then((resgeometryinner) => {
                                                    geometryEngineAsync.difference(resgeometryouter, resgeometryinner).
                                                            then((clipgeometry) => {
                                                                setingcolor[3] = (1 / maskgcount) * j;
                                                                let maskroundsymbol;
                                                                if (this.view.type === '3d') {
                                                                    if (maskOptions.symbol) {
                                                                        maskroundsymbol = {
                                                                            type: 'polygon-3d',
                                                                            symbolLayers: [{
                                                                                type: 'extrude',
                                                                                material: { color: setingcolor },
                                                                                size: maskOptions.symbol.size,
                                                                                edges: {
                                                                                    type: "solid",
                                                                                    color: setingcolor
                                                                                }
                                                                            }]
                                                                        };
                                                                    } else {
                                                                        maskroundsymbol = {
                                                                            type: 'polygon-3d',
                                                                            symbolLayers: [{
                                                                                type: 'fill',
                                                                                material: { color: setingcolor },
                                                                                outline: {
                                                                                    color: 'white',
                                                                                    size: '0px'
                                                                                }
                                                                            }]
                                                                        };
                                                                    }
                                                                } else {
                                                                    maskroundsymbol = {
                                                                        type: "simple-fill",
                                                                        color: setingcolor,
                                                                        style: "solid",
                                                                        outline: {
                                                                            color: setingcolor,
                                                                            width: 1
                                                                        }
                                                                    };
                                                                }
                                                                const maskroundGraphic = new Graphic({
                                                                    geometry: clipgeometry,
                                                                    symbol: maskroundsymbol
                                                                });
                                                                maskgraphiclayer.add(maskroundGraphic);
                                                            });
                                                    });
                                            });
                                    }
                                });
                            });
                    });
                }
            });
    }
    public remove() {
        const boundaryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (boundaryResultLayer) {
            this.view.map.remove(boundaryResultLayer);
        }
    }
    public show() {
        const boundaryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (boundaryResultLayer) {
            boundaryResultLayer.visible = true;
        }
    }
    public hide() {
        const boundaryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (boundaryResultLayer) {
            boundaryResultLayer.visible = false;
        }
    }
    private async init(view: any) {
        this.displayedLayerid = new Guid().uuid;
        this.view = view;
    }
}
