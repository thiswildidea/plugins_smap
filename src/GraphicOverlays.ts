import Mapcofig from './config/Mapcofig';
import IFlashPointOptions from './interface/IFlashPointOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Circle from './Overlays/Circle';
import Label from './Overlays/Label';
import Marker from './Overlays/Marker';
import Overlayerbase from './Overlays/Overlayerbase';
import OverlayGroup from './Overlays/OverlayGroup';
import Polygon from './Overlays/Polygon';
import Polyline from './Overlays/Polyline';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class GraphicOverlays extends EventEmitter {
    public displayedLayerid: any = "";
    private view: any = null;
    private mapoverlayers: Array<[string, string, any]> = [];
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void {
        load(['esri/Graphic', 'esri/geometry/Point', 'esri/layers/GraphicsLayer', 'esri/symbols/PictureMarkerSymbol',
            "esri/geometry/Polyline", "esri/geometry/Polygon", 'esri/geometry/Circle'])
            // tslint:disable-next-line:variable-name
            .then(([Graphic, Point, GraphicsLayer, PictureMarkerSymbol, ArcGISPolyline, ArcGISPolygon, esriCircle]) => {
                let clientGraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!clientGraphicLayer) {
                    clientGraphicLayer = new GraphicsLayer({
                        id: this.displayedLayerid,
                        title: this.displayedLayerid
                    });
                    this.view.map.add(clientGraphicLayer);
                }
                if (overlayers instanceof Array) {
                    overlayers.forEach((overelement) => {
                        if (overelement.overlaytype.toLowerCase() === 'marker') {
                            let psymbol;
                            if (!overelement.symbol) {
                            if (this.view.type === '2d') {
                                psymbol = {
                                    type: "picture-marker",
                                    url: (overelement as Marker).icon.image,
                                    width: (overelement as Marker).icon.size.width,
                                    height: (overelement as Marker).icon.size.height
                                };
                            } else {
                                psymbol = {
                                    type: "point-3d",
                                    symbolLayers: [{
                                        type: "icon",
                                        size: (overelement as Marker).icon.size.width,
                                        resource: {
                                            href: (overelement as Marker).icon.image
                                        }
                                    }]
                                };
                             }
                            } else {
                                psymbol = (overelement as Marker).symbol;
                            }
                            const markerattributes = overelement.attributes;
                            markerattributes['uuid'] = (overelement as Marker).uuid;
                            const graphic = new Graphic({
                                geometry: new Point({
                                    x: (overelement as Marker).position[0],
                                    y: (overelement as Marker).position[1],
                                    z: (overelement as Marker).position[2] === undefined ? 0 :
                                        (overelement as Marker).position[2],
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: psymbol,
                                attributes: markerattributes
                            });
                            this.mapoverlayers.push(['smap-default', (overelement as Marker).uuid, graphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(graphic);
                            }
                            if ((overelement as Marker).label.visible) {
                                let marklabel = null;
                                if (!(overelement as Marker).label.labelingInfo) {
                                    marklabel = {
                                        type: (overelement as Marker).label.type,
                                        text: (overelement as Marker).label.text,
                                        color: (overelement as Marker).label.color,
                                        angle: (overelement as Marker).label.angle,
                                        backgroundColor: (overelement as Marker).label.backgroundColor,
                                        borderLineColor: (overelement as Marker).label.borderLineColor,
                                        borderLineSize: (overelement as Marker).label.borderLineSize,
                                        kerning: (overelement as Marker).label.kerning,
                                        lineHeight: (overelement as Marker).label.lineHeight,
                                        lineWidth: (overelement as Marker).label.lineWidth,
                                        rotated: (overelement as Marker).label.rotated,
                                        haloColor: (overelement as Marker).label.haloColor,
                                        haloSize: (overelement as Marker).label.haloSize,
                                        xoffset: (overelement as Marker).label.xoffset,
                                        yoffset: (overelement as Marker).label.yoffset,
                                        verticalAlignment: (overelement as Marker).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Marker).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Marker).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Marker).label.weight
                                        }
                                    };
                                } else {
                                    marklabel = (overelement as Marker).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: new Point({
                                        x: this.view.type === '3d' ? (overelement as Marker).position[0]
                                        + (overelement as Marker).label.xoffset : (overelement as Marker).position[0],
                                        y: this.view.type === '3d' ? (overelement as Marker).position[1]
                                        + (overelement as Marker).label.yoffset : (overelement as Marker).position[1],
                                        z: this.view.type === '3d' ? (overelement as Marker).position[2]
                                        + (overelement as Marker).label.zoffset : (overelement as Marker).position[2],
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: marklabel,
                                    attributes: markerattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default', (overelement as Marker).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polyline') {
                            let lineSymbol = null;
                            if (!overelement.symbol) {
                                 lineSymbol = {
                                    type: "simple-line",
                                    color: (overelement as Polyline).strokeColor,
                                    style: (overelement as Polyline).style,
                                    width: (overelement as Polyline).width,
                                    cap: (overelement as Polyline).cap,
                                    join: (overelement as Polyline).lineJoin
                                };
                            } else {
                                lineSymbol = overelement.symbol;
                            }

                            const path = [];
                            (overelement as Polyline).path.forEach((item) => {
                                path.push([item.X, item.Y, item.Z]);
                            });
                            const polyline = new ArcGISPolyline({
                                hasZ: false,
                                hasM: false,
                                paths: path,
                                spatialReference: this.view.spatialReference
                            });
                            const polylineattributes = overelement.attributes;
                            polylineattributes['uuid'] = (overelement as Polyline).uuid;
                            const polylineGraphic = new Graphic({
                                geometry: polyline,
                                symbol: lineSymbol,
                                attributes: polylineattributes
                            });
                            this.mapoverlayers.push(['smap-default', (overelement as Polyline).uuid, polylineGraphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(polylineGraphic);
                            }

                            if ((overelement as Polyline).label.visible) {
                                let  polylinelabel = null;
                                if (!(overelement as Polyline).label.labelingInfo) {
                                    polylinelabel = {
                                        type: (overelement as Polyline).label.type,
                                        text: (overelement as Polyline).label.text,
                                        color: (overelement as Polyline).label.color,
                                        angle: (overelement as Polyline).label.angle,
                                        backgroundColor: (overelement as Polyline).label.backgroundColor,
                                        borderLineColor: (overelement as Polyline).label.borderLineColor,
                                        borderLineSize: (overelement as Polyline).label.borderLineSize,
                                        kerning: (overelement as Polyline).label.kerning,
                                        lineHeight: (overelement as Polyline).label.lineHeight,
                                        lineWidth: (overelement as Polyline).label.lineWidth,
                                        rotated: (overelement as Polyline).label.rotated,
                                        haloColor: (overelement as Polyline).label.haloColor,
                                        haloSize: (overelement as Polyline).label.haloSize,
                                        xoffset: (overelement as Polyline).label.xoffset,
                                        yoffset: (overelement as Polyline).label.yoffset,
                                        verticalAlignment: (overelement as Polyline).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Polyline).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Polyline).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Polyline).label.weight
                                        }
                                    };
                                } else {
                                    polylinelabel = (overelement as Polyline).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polylineGraphic.geometry.extent.center,
                                    symbol: polylinelabel,
                                    attributes: polylineattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default', (overelement as Polyline).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polygon') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                            if ((overelement as Polygon).symboltype === 'simple') {
                                fillSymbol = {
                                    type: "simple-fill",
                                    color: (overelement as Polygon).fillColor,
                                    style: (overelement as Polygon).style,
                                    outline: {
                                        color: (overelement as Polygon).strokeColor,
                                        width: (overelement as Polygon).strokeWeight,
                                        style: (overelement as Polygon).strokestyle
                                    }
                                };
                            } else {
                                fillSymbol = {
                                    type: "picture-fill",
                                    url: (overelement as Polygon).url,
                                    width: (overelement as Polygon).picwidth,
                                    height: (overelement as Polygon).picheight,
                                    outline: {
                                        style: (overelement as Polygon).strokestyle,
                                        color: (overelement as Polygon).strokeColor,
                                        width: (overelement as Polygon).strokeWeight
                                    }
                                };
                            }
                            } else {
                                fillSymbol = overelement.symbol;
                            }

                            const rs = [];
                            (overelement as Polygon).paths.forEach((item) => {
                                rs.push([item.X, item.Y, item.Z]);
                            });
                            const polygon = new ArcGISPolygon({
                                hasZ: true,
                                hasM: true,
                                rings: rs,
                                spatialReference: this.view.spatialReference
                            });
                            const polygoneattributes = overelement.attributes;
                            polygoneattributes['uuid'] = (overelement as Polygon).uuid;
                            const polygonGraphic = new Graphic({
                                geometry: polygon,
                                symbol: fillSymbol,
                                attributes: polygoneattributes
                            });
                            this.mapoverlayers.push(['smap-default', (overelement as Polygon).uuid, polygonGraphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(polygonGraphic);
                            }

                            if ((overelement as Polygon).label.visible) {
                                let polygonlabel = null;
                                if (!(overelement as Polygon).label.labelingInfo) {
                                    polygonlabel = {
                                        type: (overelement as Polygon).label.type,
                                        text: (overelement as Polygon).label.text,
                                        color: (overelement as Polygon).label.color,
                                        angle: (overelement as Polygon).label.angle,
                                        backgroundColor: (overelement as Polygon).label.backgroundColor,
                                        borderLineColor: (overelement as Polygon).label.borderLineColor,
                                        borderLineSize: (overelement as Polygon).label.borderLineSize,
                                        kerning: (overelement as Polygon).label.kerning,
                                        lineHeight: (overelement as Polygon).label.lineHeight,
                                        lineWidth: (overelement as Polygon).label.lineWidth,
                                        rotated: (overelement as Polygon).label.rotated,
                                        haloColor: (overelement as Polygon).label.haloColor,
                                        haloSize: (overelement as Polygon).label.haloSize,
                                        xoffset: (overelement as Polygon).label.xoffset,
                                        yoffset: (overelement as Polygon).label.yoffset,
                                        verticalAlignment: (overelement as Polygon).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Polygon).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Polygon).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Polygon).label.weight
                                        }
                                    };
                                } else {
                                    polygonlabel = (overelement as Polygon).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polygonGraphic.geometry.extent.center,
                                    symbol: polygonlabel,
                                    attributes: polygoneattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default', (overelement as Polygon).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'circle') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                                if ((overelement as Circle).symboltype === 'simple') {
                                    fillSymbol = {
                                        type: "simple-fill",
                                        color: (overelement as Circle).fillColor,
                                        style: (overelement as Circle).style,
                                        outline: {
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight,
                                            style: (overelement as Circle).strokestyle
                                        }
                                    };
                                } else {
                                    fillSymbol = {
                                        type: "picture-fill",
                                        url: (overelement as Circle).url,
                                        width: (overelement as Circle).picwidth,
                                        height: (overelement as Circle).picheight,
                                        outline: {
                                            style: (overelement as Circle).strokestyle,
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight
                                        }
                                    };
                                }
                            } else {
                                fillSymbol = overelement.symbol;
                            }
                            if ((overelement as Overlayerbase).attributes && (overelement as Circle).center
                                && (overelement as Circle).radius) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Circle).uuid;
                                const circlegraphic = new Graphic({
                                    geometry: new esriCircle({
                                        center: new Point({
                                            x: (overelement as Circle).center.X,
                                            y: (overelement as Circle).center.Y,
                                            z: (overelement as Circle).center.Z,
                                            spatialReference: this.view.spatialReference
                                        }),
                                        radius: (overelement as Circle).radius,
                                        radiusUnit: (overelement as Circle).radiusUnit,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: fillSymbol,
                                    attributes: dataattributes
                                });
                                this.mapoverlayers.push(['smap-default', (overelement as Circle).uuid, circlegraphic]);
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(circlegraphic);
                                }
                                if ((overelement as Circle).label.visible) {
                                    let polygonlabel = null;
                                    if (!(overelement as Circle).label.labelingInfo) {
                                        polygonlabel = {
                                            type: (overelement as Circle).label.type,
                                            text: (overelement as Circle).label.text,
                                            color: (overelement as Circle).label.color,
                                            angle: (overelement as Circle).label.angle,
                                            backgroundColor: (overelement as Circle).label.backgroundColor,
                                            borderLineColor: (overelement as Circle).label.borderLineColor,
                                            borderLineSize: (overelement as Circle).label.borderLineSize,
                                            kerning: (overelement as Circle).label.kerning,
                                            lineHeight: (overelement as Circle).label.lineHeight,
                                            lineWidth: (overelement as Circle).label.lineWidth,
                                            rotated: (overelement as Circle).label.rotated,
                                            haloColor: (overelement as Circle).label.haloColor,
                                            haloSize: (overelement as Circle).label.haloSize,
                                            xoffset: (overelement as Circle).label.xoffset,
                                            yoffset: (overelement as Circle).label.yoffset,
                                            verticalAlignment: (overelement as Circle).label.verticalAlignment,
                                            horizontalAlignment: (overelement as Circle).label.horizontalAlignment,
                                            font: {
                                                size: (overelement as Circle).label.size,
                                                family: "Josefin Slab",
                                                weight: (overelement as Circle).label.weight
                                            }
                                        };
                                    } else {
                                        polygonlabel = (overelement as Circle).label.labelingInfo;
                                    }
                                    const graphictext = new Graphic({
                                        geometry: circlegraphic.geometry.extent.center,
                                        symbol: polygonlabel,
                                        attributes: dataattributes
                                    });
                                    const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                    if (cgraphicLayer) {
                                        cgraphicLayer.add(graphictext);
                                    }
                                    this.mapoverlayers.push(['smap-default',
                                    (overelement as Circle).uuid, graphictext]);
                                }
                          }

                        }
                    });
                } else if (overlayers.type === 'group') {
                    (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                        if (overelement.overlaytype.toLowerCase() === 'marker') {
                            let psymbol;
                            if (!overelement.symbol) {
                            if (this.view.type === '2d') {
                                psymbol = {
                                    type: "picture-marker",
                                    url: (overelement as Marker).icon.image,
                                    width: (overelement as Marker).icon.size.width,
                                    height: (overelement as Marker).icon.size.height
                                };
                            } else {
                                psymbol = {
                                    type: "point-3d",
                                    symbolLayers: [{
                                        type: "icon",
                                        size: (overelement as Marker).icon.size.width,
                                        resource: {
                                            href: (overelement as Marker).icon.image
                                        }
                                    }]
                                };
                              }
                            } else {
                                psymbol = (overelement as Marker).symbol;
                            }
                            const markerattributes = overelement.attributes;
                            markerattributes['uuid'] = (overelement as Marker).uuid;
                            const graphic = new Graphic({
                                geometry: new Point({
                                    x: (overelement as Marker).position[0],
                                    y: (overelement as Marker).position[1],
                                    z: (overelement as Marker).position[2] === undefined ? 0 :
                                        (overelement as Marker).position[2],
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: psymbol,
                                attributes: markerattributes
                            });
                            this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                            (overelement as Marker).uuid, graphic]);
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(graphic);
                            }
                            if ((overelement as Marker).label.visible) {
                                let marklabel = null;
                                if (!(overelement as Marker).label.labelingInfo) {
                                    marklabel = {
                                        type: (overelement as Marker).label.type,
                                        text: (overelement as Marker).label.text,
                                        color: (overelement as Marker).label.color,
                                        angle: (overelement as Marker).label.angle,
                                        backgroundColor: (overelement as Marker).label.backgroundColor,
                                        borderLineColor: (overelement as Marker).label.borderLineColor,
                                        borderLineSize: (overelement as Marker).label.borderLineSize,
                                        kerning: (overelement as Marker).label.kerning,
                                        lineHeight: (overelement as Marker).label.lineHeight,
                                        lineWidth: (overelement as Marker).label.lineWidth,
                                        rotated: (overelement as Marker).label.rotated,
                                        haloColor: (overelement as Marker).label.haloColor,
                                        haloSize: (overelement as Marker).label.haloSize,
                                        xoffset: (overelement as Marker).label.xoffset,
                                        yoffset: (overelement as Marker).label.yoffset,
                                        verticalAlignment: (overelement as Marker).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Marker).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Marker).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Marker).label.weight
                                        }
                                    };
                                } else {
                                    marklabel = (overelement as Marker).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: new Point({
                                        x: this.view.type === '3d' ? (overelement as Marker).position[0]
                                            + (overelement as Marker).label.xoffset :
                                            (overelement as Marker).position[0],
                                        y: this.view.type === '3d' ? (overelement as Marker).position[1]
                                            + (overelement as Marker).label.yoffset :
                                            (overelement as Marker).position[1],
                                        z: this.view.type === '3d' ? (overelement as Marker).position[2]
                                            + (overelement as Marker).label.zoffset :
                                            (overelement as Marker).position[2],
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: marklabel,
                                    attributes: markerattributes
                                });
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push([(overlayers as OverlayGroup).uuid
                                    , (overelement as Marker).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polyline') {
                            let lineSymbol = null;
                            if (!overelement.symbol) {
                                lineSymbol = {
                                    type: "simple-line",
                                    color: (overelement as Polyline).strokeColor,
                                    style: (overelement as Polyline).style,
                                    width: (overelement as Polyline).width,
                                    cap: (overelement as Polyline).cap,
                                    join: (overelement as Polyline).lineJoin
                                };
                            } else {
                                lineSymbol = overelement.symbol;
                            }
                            const path = [];
                            (overelement as Polyline).path.forEach((item) => {
                                path.push([item.X, item.Y, item.Z]);
                            });
                            const polyline = new ArcGISPolyline({
                                hasZ: false,
                                hasM: false,
                                paths: path,
                                spatialReference: this.view.spatialReference
                            });
                            const polylineattributes = overelement.attributes;
                            polylineattributes['uuid'] = (overelement as Polyline).uuid;
                            const polylineGraphic = new Graphic({
                                geometry: polyline,
                                symbol: lineSymbol,
                                attributes: polylineattributes
                            });
                            this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                            (overelement as Polyline).uuid, polylineGraphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(polylineGraphic);
                            }

                            if ((overelement as Polyline).label.visible) {
                                let polylinelabel = null;
                                if (!(overelement as Polyline).label.labelingInfo) {
                                    polylinelabel = {
                                        type: (overelement as Polyline).label.type,
                                        text: (overelement as Polyline).label.text,
                                        color: (overelement as Polyline).label.color,
                                        angle: (overelement as Polyline).label.angle,
                                        backgroundColor: (overelement as Polyline).label.backgroundColor,
                                        borderLineColor: (overelement as Polyline).label.borderLineColor,
                                        borderLineSize: (overelement as Polyline).label.borderLineSize,
                                        kerning: (overelement as Polyline).label.kerning,
                                        lineHeight: (overelement as Polyline).label.lineHeight,
                                        lineWidth: (overelement as Polyline).label.lineWidth,
                                        rotated: (overelement as Polyline).label.rotated,
                                        haloColor: (overelement as Polyline).label.haloColor,
                                        haloSize: (overelement as Polyline).label.haloSize,
                                        xoffset: (overelement as Polyline).label.xoffset,
                                        yoffset: (overelement as Polyline).label.yoffset,
                                        verticalAlignment: (overelement as Polyline).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Polyline).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Polyline).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Polyline).label.weight
                                        }
                                    };
                                } else {
                                    polylinelabel = (overelement as Polyline).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polylineGraphic.geometry.extent.center,
                                    symbol: polylinelabel,
                                    attributes: polylineattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                                (overelement as Polyline).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polygon') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                                if ((overelement as Polygon).symboltype === 'simple') {
                                    fillSymbol = {
                                        type: "simple-fill",
                                        color: (overelement as Polygon).fillColor,
                                        style: (overelement as Polygon).style,
                                        outline: {
                                            color: (overelement as Polygon).strokeColor,
                                            width: (overelement as Polygon).strokeWeight,
                                            style: (overelement as Polygon).strokestyle
                                        }
                                    };
                                } else {
                                    fillSymbol = {
                                        type: "picture-fill",
                                        url: (overelement as Polygon).url,
                                        width: (overelement as Polygon).picwidth,
                                        height: (overelement as Polygon).picheight,
                                        outline: {
                                            style: (overelement as Polygon).strokestyle,
                                            color: (overelement as Polygon).strokeColor,
                                            width: (overelement as Polygon).strokeWeight
                                        }
                                    };
                                }
                            } else {
                                fillSymbol = overelement.symbol;
                            }
                            const rs = [];
                            (overelement as Polygon).paths.forEach((item) => {
                                rs.push([item.X, item.Y, item.Z]);
                            });

                            const polygoneattributes = overelement.attributes;
                            polygoneattributes['uuid'] = (overelement as Polygon).uuid;
                            const polygon = new ArcGISPolygon({
                                hasZ: true,
                                hasM: true,
                                rings: rs,
                                spatialReference: this.view.spatialReference
                            });
                            const polygonGraphic = new Graphic({
                                geometry: polygon,
                                symbol: fillSymbol,
                                attributes: polygoneattributes
                            });
                            this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                            (overelement as Polygon).uuid, polygonGraphic]);
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(polygonGraphic);
                            }

                            if ((overelement as Polygon).label.visible) {
                                let polygonlabel = null;
                                if (!(overelement as Polygon).label.labelingInfo) {
                                    polygonlabel = {
                                        type: (overelement as Polygon).label.type,
                                        text: (overelement as Polygon).label.text,
                                        color: (overelement as Polygon).label.color,
                                        angle: (overelement as Polygon).label.angle,
                                        backgroundColor: (overelement as Polygon).label.backgroundColor,
                                        borderLineColor: (overelement as Polygon).label.borderLineColor,
                                        borderLineSize: (overelement as Polygon).label.borderLineSize,
                                        kerning: (overelement as Polygon).label.kerning,
                                        lineHeight: (overelement as Polygon).label.lineHeight,
                                        lineWidth: (overelement as Polygon).label.lineWidth,
                                        rotated: (overelement as Polygon).label.rotated,
                                        haloColor: (overelement as Polygon).label.haloColor,
                                        haloSize: (overelement as Polygon).label.haloSize,
                                        xoffset: (overelement as Polygon).label.xoffset,
                                        yoffset: (overelement as Polygon).label.yoffset,
                                        verticalAlignment: (overelement as Polygon).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Polygon).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Polygon).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Polygon).label.weight
                                        }
                                    };
                                } else {
                                    polygonlabel = (overelement as Polygon).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polygonGraphic.geometry.extent.center,
                                    symbol: polygonlabel,
                                    attributes: polygoneattributes
                                });
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                                (overelement as Polygon).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'circle') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                                if ((overelement as Circle).symboltype === 'simple') {
                                    fillSymbol = {
                                        type: "simple-fill",
                                        color: (overelement as Circle).fillColor,
                                        style: (overelement as Circle).style,
                                        outline: {
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight,
                                            style: (overelement as Circle).strokestyle
                                        }
                                    };
                                } else {
                                    fillSymbol = {
                                        type: "picture-fill",
                                        url: (overelement as Circle).url,
                                        width: (overelement as Circle).picwidth,
                                        height: (overelement as Circle).picheight,
                                        outline: {
                                            style: (overelement as Circle).strokestyle,
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight
                                        }
                                    };
                                }
                            } else {
                                fillSymbol = overelement.symbol;
                            }
                            if ((overelement as Overlayerbase).attributes && (overelement as Circle).center
                                && (overelement as Circle).radius) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Circle).uuid;
                                const circlegraphic = new Graphic({
                                    geometry: new esriCircle({
                                        center: new Point({
                                            x: (overelement as Circle).center.X,
                                            y: (overelement as Circle).center.Y,
                                            z: (overelement as Circle).center.Z,
                                            spatialReference: this.view.spatialReference
                                        }),
                                        radius: (overelement as Circle).radius,
                                        radiusUnit: (overelement as Circle).radiusUnit,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: fillSymbol,
                                    attributes: dataattributes
                                });
                                this.mapoverlayers.push(['smap-default', (overelement as Circle).uuid, circlegraphic]);
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(circlegraphic);
                                }
                                if ((overelement as Circle).label.visible) {
                                    let polygonlabel = null;
                                    if (!(overelement as Circle).label.labelingInfo) {
                                        polygonlabel = {
                                            type: (overelement as Circle).label.type,
                                            text: (overelement as Circle).label.text,
                                            color: (overelement as Circle).label.color,
                                            angle: (overelement as Circle).label.angle,
                                            backgroundColor: (overelement as Circle).label.backgroundColor,
                                            borderLineColor: (overelement as Circle).label.borderLineColor,
                                            borderLineSize: (overelement as Circle).label.borderLineSize,
                                            kerning: (overelement as Circle).label.kerning,
                                            lineHeight: (overelement as Circle).label.lineHeight,
                                            lineWidth: (overelement as Circle).label.lineWidth,
                                            rotated: (overelement as Circle).label.rotated,
                                            haloColor: (overelement as Circle).label.haloColor,
                                            haloSize: (overelement as Circle).label.haloSize,
                                            xoffset: (overelement as Circle).label.xoffset,
                                            yoffset: (overelement as Circle).label.yoffset,
                                            verticalAlignment: (overelement as Circle).label.verticalAlignment,
                                            horizontalAlignment: (overelement as Circle).label.horizontalAlignment,
                                            font: {
                                                size: (overelement as Circle).label.size,
                                                family: "Josefin Slab",
                                                weight: (overelement as Circle).label.weight
                                            }
                                        };
                                    } else {
                                        polygonlabel = (overelement as Circle).label.labelingInfo;
                                    }
                                    const graphictext = new Graphic({
                                        geometry: circlegraphic.geometry.extent.center,
                                        symbol: polygonlabel,
                                        attributes: dataattributes
                                    });
                                    const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                    if (cgraphicLayer) {
                                        cgraphicLayer.add(graphictext);
                                    }
                                    this.mapoverlayers.push(['smap-default',
                                        (overelement as Circle).uuid, graphictext]);
                                }
                            }
                        }
                    });
                } else if (overlayers.type === 'element') {
                    if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'marker') {
                        let psymbol;
                        if (!(overlayers as Overlayerbase).symbol) {
                        if (this.view.type === '2d') {
                            psymbol = {
                                type: "picture-marker",
                                url: (overlayers as Marker).icon.image,
                                width: (overlayers as Marker).icon.size.width,
                                height: (overlayers as Marker).icon.size.height
                            };
                        } else {
                            psymbol = {
                                type: "point-3d",
                                symbolLayers: [{
                                    type: "icon",
                                    size: (overlayers as Marker).icon.size.width,
                                    resource: {
                                        href: (overlayers as Marker).icon.image
                                    }
                                }]
                            };
                        }
                      } else {
                            psymbol = (overlayers as Overlayerbase).symbol;
                      }
                        const markeattributes = (overlayers as Overlayerbase).attributes;
                        markeattributes['uuid'] = (overlayers as Marker).uuid;
                        const graphic = new Graphic({
                            geometry: new Point({
                                x: (overlayers as Marker).position[0],
                                y: (overlayers as Marker).position[1],
                                z: (overlayers as Marker).position[2] === undefined ? 0 :
                                    (overlayers as Marker).position[2],
                                spatialReference: this.view.spatialReference
                            }),
                            symbol: psymbol,
                            attributes: markeattributes
                        });
                        this.mapoverlayers.push(['smap-default', (overlayers as Marker).uuid, graphic]);
                        const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (graphicLayer) {
                            graphicLayer.add(graphic);
                        }
                        if ((overlayers as Marker).label.visible) {
                            let marklabel = null;
                            if (!(overlayers as Marker).label.labelingInfo) {
                                marklabel = {
                                    type: (overlayers as Marker).label.type,
                                    text: (overlayers as Marker).label.text,
                                    color: (overlayers as Marker).label.color,
                                    angle: (overlayers as Marker).label.angle,
                                    backgroundColor: (overlayers as Marker).label.backgroundColor,
                                    borderLineColor: (overlayers as Marker).label.borderLineColor,
                                    borderLineSize: (overlayers as Marker).label.borderLineSize,
                                    kerning: (overlayers as Marker).label.kerning,
                                    lineHeight: (overlayers as Marker).label.lineHeight,
                                    lineWidth: (overlayers as Marker).label.lineWidth,
                                    rotated: (overlayers as Marker).label.rotated,
                                    haloColor: (overlayers as Marker).label.haloColor,
                                    haloSize: (overlayers as Marker).label.haloSize,
                                    xoffset: (overlayers as Marker).label.xoffset,
                                    yoffset: (overlayers as Marker).label.yoffset,
                                    verticalAlignment: (overlayers as Marker).label.verticalAlignment,
                                    horizontalAlignment: (overlayers as Marker).label.horizontalAlignment,
                                    font: {
                                        size: (overlayers as Marker).label.size,
                                        family: "Josefin Slab",
                                        weight: (overlayers as Marker).label.weight
                                    }
                                };
                            } else {
                                marklabel = (overlayers as Marker).label.labelingInfo;
                            }
                            const graphictext = new Graphic({
                                geometry: new Point({
                                    x: this.view.type === '3d' ? (overlayers as Marker).position[0]
                                        + (overlayers as Marker).label.xoffset : (overlayers as Marker).position[0],
                                    y: this.view.type === '3d' ? (overlayers as Marker).position[1]
                                        + (overlayers as Marker).label.yoffset : (overlayers as Marker).position[1],
                                    z: this.view.type === '3d' ? (overlayers as Marker).position[2]
                                        + (overlayers as Marker).label.zoffset : (overlayers as Marker).position[2],
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: marklabel,
                                attributes: markeattributes
                            });
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(graphictext);
                            }
                            this.mapoverlayers.push(['smap-default', (overlayers as Marker).uuid, graphictext]);
                        }
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polyline') {
                        let lineSymbol = null;
                        if (!(overlayers as Overlayerbase).symbol) {
                         lineSymbol = {
                            type: "simple-line",
                            color: (overlayers as Polyline).strokeColor,
                            style: (overlayers as Polyline).style,
                            width: (overlayers as Polyline).width,
                            cap: (overlayers as Polyline).cap,
                            join: (overlayers as Polyline).lineJoin
                        };
                    } else {
                            lineSymbol = (overlayers as Overlayerbase).symbol;
                     }
                        const path = [];
                        (overlayers as Polyline).path.forEach((item) => {
                            path.push([item.X, item.Y, item.Z]);
                        });

                        const polyline = new ArcGISPolyline({
                            hasZ: false,
                            hasM: false,
                            paths: path,
                            spatialReference: this.view.spatialReference
                        });
                        const polylineattributes = (overlayers as Overlayerbase).attributes;
                        polylineattributes['uuid'] = (overlayers as Polyline).uuid;
                        const polylineGraphic = new Graphic({
                            geometry: polyline,
                            symbol: lineSymbol,
                            attributes: polylineattributes
                        });
                        this.mapoverlayers.push(['smap-default',
                            (overlayers as Polyline).uuid, polylineGraphic]);
                        const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (cgraphicLayer) {
                            cgraphicLayer.add(polylineGraphic);
                        }

                        if ((overlayers as Polyline).label.visible) {
                            let polylabel = null;
                            if (!(overlayers as Polyline).label.labelingInfo) {
                                polylabel =  {
                                    type: (overlayers as Polyline).label.type,
                                    text: (overlayers as Polyline).label.text,
                                    color: (overlayers as Polyline).label.color,
                                    angle: (overlayers as Polyline).label.angle,
                                    backgroundColor: (overlayers as Polyline).label.backgroundColor,
                                    borderLineColor: (overlayers as Polyline).label.borderLineColor,
                                    borderLineSize: (overlayers as Polyline).label.borderLineSize,
                                    kerning: (overlayers as Polyline).label.kerning,
                                    lineHeight: (overlayers as Polyline).label.lineHeight,
                                    lineWidth: (overlayers as Polyline).label.lineWidth,
                                    rotated: (overlayers as Polyline).label.rotated,
                                    haloColor: (overlayers as Polyline).label.haloColor,
                                    haloSize: (overlayers as Polyline).label.haloSize,
                                    xoffset: (overlayers as Polyline).label.xoffset,
                                    yoffset: (overlayers as Polyline).label.yoffset,
                                    verticalAlignment: (overlayers as Polyline).label.verticalAlignment,
                                    horizontalAlignment: (overlayers as Polyline).label.horizontalAlignment,
                                    font: {
                                        size: (overlayers as Polyline).label.size,
                                        family: "Josefin Slab",
                                        weight: (overlayers as Polyline).label.weight
                                    }
                                };
                            } else {
                                polylabel = (overlayers as Polyline).label.labelingInfo;
                            }
                            const graphictext = new Graphic({
                                geometry: polylineGraphic.geometry.extent.center,
                                symbol: polylabel,
                                attributes: polylineattributes
                            });
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(graphictext);
                            }
                            this.mapoverlayers.push(['smap-default',
                                (overlayers as Polyline).uuid, graphictext]);
                        }
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polygon') {
                        let fillSymbol;
                        if (!(overlayers as Overlayerbase).symbol) {
                        if ((overlayers as Polygon).symboltype === 'simple') {
                            fillSymbol = {
                                type: "simple-fill",
                                color: (overlayers as Polygon).fillColor,
                                style: (overlayers as Polygon).style,
                                outline: {
                                    color: (overlayers as Polygon).strokeColor,
                                    width: (overlayers as Polygon).strokeWeight,
                                    style: (overlayers as Polygon).strokestyle
                                }
                            };
                        } else {
                            fillSymbol = {
                                type: "picture-fill",
                                url: (overlayers as Polygon).url,
                                width: (overlayers as Polygon).picwidth,
                                height: (overlayers as Polygon).picheight,
                                outline: {
                                    style: (overlayers as Polygon).strokestyle,
                                    color: (overlayers as Polygon).strokeColor,
                                    width: (overlayers as Polygon).strokeWeight
                                }
                            };
                        }
                        } else {
                            fillSymbol = (overlayers as Overlayerbase).symbol;
                        }

                        const rs = [];
                        (overlayers as Polygon).paths.forEach((item) => {
                            rs.push([item.X, item.Y, item.Z]);
                        });
                        const polygonattributes = (overlayers as Overlayerbase).attributes;
                        polygonattributes['uuid'] = (overlayers as Polygon).uuid;
                        const polygon = new ArcGISPolygon({
                            hasZ: true,
                            hasM: true,
                            rings: rs,
                            spatialReference: this.view.spatialReference
                        });
                        const polygonGraphic = new Graphic({
                            geometry: polygon,
                            symbol: fillSymbol,
                            attributes: polygonattributes
                        });
                        this.mapoverlayers.push(['smap-default',
                            (overlayers as Polygon).uuid, polygonGraphic]);
                        const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (graphicLayer) {
                            graphicLayer.add(polygonGraphic);
                        }
                        if ((overlayers as Polygon).label.visible) {
                            let polylabel = null;
                            if (!(overlayers as Polygon).label.labelingInfo) {
                                polylabel = {
                                    type: (overlayers as Polygon).label.type,
                                    text: (overlayers as Polygon).label.text,
                                    color: (overlayers as Polygon).label.color,
                                    angle: (overlayers as Polygon).label.angle,
                                    backgroundColor: (overlayers as Polygon).label.backgroundColor,
                                    borderLineColor: (overlayers as Polygon).label.borderLineColor,
                                    borderLineSize: (overlayers as Polygon).label.borderLineSize,
                                    kerning: (overlayers as Polygon).label.kerning,
                                    lineHeight: (overlayers as Polygon).label.lineHeight,
                                    lineWidth: (overlayers as Polygon).label.lineWidth,
                                    rotated: (overlayers as Polygon).label.rotated,
                                    haloColor: (overlayers as Polygon).label.haloColor,
                                    haloSize: (overlayers as Polygon).label.haloSize,
                                    xoffset: (overlayers as Polygon).label.xoffset,
                                    yoffset: (overlayers as Polygon).label.yoffset,
                                    verticalAlignment: (overlayers as Polygon).label.verticalAlignment,
                                    horizontalAlignment: (overlayers as Polygon).label.horizontalAlignment,
                                    font: {
                                        size: (overlayers as Polygon).label.size,
                                        family: "Josefin Slab",
                                        weight: (overlayers as Polygon).label.weight
                                    }
                                };
                            } else {
                                polylabel = (overlayers as Polygon).label.labelingInfo;
                            }
                            const graphictext = new Graphic({
                                geometry: polygonGraphic.geometry.extent.center,
                                symbol: polylabel,
                                attributes: polygonattributes
                            });
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(graphictext);
                            }
                            this.mapoverlayers.push(['smap-default',
                                (overlayers as Polygon).uuid, graphictext]);
                        }
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'circle') {
                        let fillSymbol;
                        if (!(overlayers as Overlayerbase).symbol) {
                            if ((overlayers as Circle).symboltype === 'simple') {
                                fillSymbol = {
                                    type: "simple-fill",
                                    color: (overlayers as Circle).fillColor,
                                    style: (overlayers as Circle).style,
                                    outline: {
                                        color: (overlayers as Circle).strokeColor,
                                        width: (overlayers as Circle).strokeWeight,
                                        style: (overlayers as Circle).strokestyle
                                    }
                                };
                            } else {
                                fillSymbol = {
                                    type: "picture-fill",
                                    url: (overlayers as Circle).url,
                                    width: (overlayers as Circle).picwidth,
                                    height: (overlayers as Circle).picheight,
                                    outline: {
                                        style: (overlayers as Circle).strokestyle,
                                        color: (overlayers as Circle).strokeColor,
                                        width: (overlayers as Circle).strokeWeight
                                    }
                                };
                            }
                        } else {
                            fillSymbol = (overlayers as Overlayerbase).symbol;
                        }
                        if ((overlayers as Overlayerbase).attributes
                            && (overlayers as Circle).center
                            && (overlayers as Circle).radius) {
                            const dataattributes = (overlayers as Overlayerbase).attributes;
                            dataattributes['uuid'] = (overlayers as Circle).uuid;
                            const circlegraphic = new Graphic({
                                geometry: new esriCircle({
                                    center: new Point({
                                        x: (overlayers as Circle).center.X,
                                        y: (overlayers as Circle).center.Y,
                                        z: (overlayers as Circle).center.Z,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    radius: (overlayers as Circle).radius,
                                    radiusUnit: (overlayers as Circle).radiusUnit,
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: fillSymbol,
                                attributes: dataattributes
                            });
                            this.mapoverlayers.push(['smap-default',
                             ((overlayers as Overlayerbase) as Circle).uuid, circlegraphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(circlegraphic);
                            }
                            if (((overlayers as Overlayerbase) as Circle).label.visible) {
                                let polygonlabel = null;
                                if (!((overlayers as Overlayerbase) as Circle).label.labelingInfo) {
                                    polygonlabel = {
                                        type: (overlayers as Circle).label.type,
                                        text: (overlayers as Circle).label.text,
                                        color: (overlayers as Circle).label.color,
                                        angle: (overlayers as Circle).label.angle,
                                        backgroundColor: (overlayers as Circle).label.backgroundColor,
                                        borderLineColor: (overlayers as Circle).label.borderLineColor,
                                        borderLineSize: (overlayers as Circle).label.borderLineSize,
                                        kerning: (overlayers as Circle).label.kerning,
                                        lineHeight: (overlayers as Circle).label.lineHeight,
                                        lineWidth: (overlayers as Circle).label.lineWidth,
                                        rotated: (overlayers as Circle).label.rotated,
                                        haloColor: (overlayers as Circle).label.haloColor,
                                        haloSize: (overlayers as Circle).label.haloSize,
                                        xoffset: (overlayers as Circle).label.xoffset,
                                        yoffset: (overlayers as Circle).label.yoffset,
                                        verticalAlignment: (overlayers as Circle).label.verticalAlignment,
                                        horizontalAlignment: (overlayers as Circle).label.horizontalAlignment,
                                        font: {
                                            size: (overlayers as Circle).label.size,
                                            family: "Josefin Slab",
                                            weight: (overlayers as Circle).label.weight
                                        }
                                    };
                                } else {
                                    polygonlabel = (overlayers as Circle).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: circlegraphic.geometry.extent.center,
                                    symbol: polygonlabel,
                                    attributes: dataattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default',
                                    (overlayers as Circle).uuid, graphictext]);
                            }
                        }
                    }
                }
            }).catch((err) => { console.error(err); });
    }
    public remove(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void {
        if (overlayers instanceof Array) {
            overlayers.forEach((overelemnt) => {
                const graphiclist = this.mapoverlayers.filter((item) => {
                    return item[1] === overelemnt.uuid;
                });
                graphiclist.forEach((item) => {
                    const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                    if (graphicLayer) {
                        graphicLayer.remove(item[2]);
                    }
                });
                this.mapoverlayers = this.mapoverlayers.filter((item) => item[1] !==
                    overelemnt.uuid);
            });
        } else if (overlayers.type === 'group') {
            const graphiclist = this.mapoverlayers.filter((item) => item[0] ===
                (overlayers as OverlayGroup).uuid);
            graphiclist.forEach((item) => {
                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (graphicLayer) {
                    graphicLayer.remove(item[2]);
                }
            });
            this.mapoverlayers = this.mapoverlayers.filter((item) => item[0] !==
                (overlayers as OverlayGroup).uuid);
        } else if (overlayers.type === 'element') {
            const graphiclist = this.mapoverlayers.filter((item) => {
                return item[1] === overlayers.uuid;
            });
            graphiclist.forEach((item) => {
                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (graphicLayer) {
                    graphicLayer.remove(item[2]);
                }
            });
            this.mapoverlayers = this.mapoverlayers.filter((item) => item[1] !== overlayers.uuid);
        }
    }
    public update(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void {
        load(['esri/Graphic', 'esri/geometry/Point', 'esri/symbols/PictureMarkerSymbol', "esri/geometry/Polyline", "esri/geometry/Polygon", 'esri/geometry/Circle'])
            // tslint:disable-next-line:variable-name
            .then(([Graphic, Point, PictureMarkerSymbol, ArcGISPolyline, ArcGISPolygon, esriCircle]) => {
                if (overlayers instanceof Array) {
                    overlayers.forEach((overelement) => {
                        const graphiclist = this.mapoverlayers.filter((item) => {
                            return item[1] === overelement.uuid;
                        });
                        graphiclist.forEach((item) => {
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.remove(item[2]);
                            }
                        });
                        this.mapoverlayers = this.mapoverlayers.filter((item) => item[1] !== overelement.uuid);
                        if (overelement.overlaytype.toLowerCase() === 'marker') {
                            let psymbol;
                            if (!overelement.symbol) {
                            if (this.view.type === '2d') {
                                psymbol = {
                                    type: "picture-marker",
                                    url: (overelement as Marker).icon.image,
                                    width: (overelement as Marker).icon.size.width,
                                    height: (overelement as Marker).icon.size.height
                                };
                            } else {
                                psymbol = {
                                    type: "point-3d",
                                    symbolLayers: [{
                                        type: "icon",
                                        size: (overelement as Marker).icon.size.width,
                                        resource: {
                                            href: (overelement as Marker).icon.image
                                        }
                                    }]
                                };
                            }
                            } else {
                                psymbol = (overelement as Marker).symbol;
                            }
                            const markerattributes = (overelement as Overlayerbase).attributes;
                            markerattributes['uuid'] = (overelement as Marker).uuid;
                            const graphic = new Graphic({
                                geometry: new Point({
                                    x: (overelement as Marker).position[0],
                                    y: (overelement as Marker).position[1],
                                    z: (overelement as Marker).position[2] === undefined ? 0 :
                                        (overelement as Marker).position[2],
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: psymbol,
                                attributes: markerattributes
                            });
                            this.mapoverlayers.push(['smap-default', (overelement as Marker).uuid, graphic]);
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(graphic);
                            }
                            if ((overelement as Marker).label.visible) {
                                let marklabel = null;
                                if (!(overelement as Marker).label.labelingInfo) {
                                    marklabel = {
                                        type: (overelement as Marker).label.type,
                                        text: (overelement as Marker).label.text,
                                        color: (overelement as Marker).label.color,
                                        angle: (overelement as Marker).label.angle,
                                        backgroundColor: (overelement as Marker).label.backgroundColor,
                                        borderLineColor: (overelement as Marker).label.borderLineColor,
                                        borderLineSize: (overelement as Marker).label.borderLineSize,
                                        kerning: (overelement as Marker).label.kerning,
                                        lineHeight: (overelement as Marker).label.lineHeight,
                                        lineWidth: (overelement as Marker).label.lineWidth,
                                        rotated: (overelement as Marker).label.rotated,
                                        haloColor: (overelement as Marker).label.haloColor,
                                        haloSize: (overelement as Marker).label.haloSize,
                                        xoffset: (overelement as Marker).label.xoffset,
                                        yoffset: (overelement as Marker).label.yoffset,
                                        verticalAlignment: (overelement as Marker).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Marker).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Marker).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Marker).label.weight
                                        }
                                    };
                                } else {
                                    marklabel = (overelement as Marker).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: new Point({
                                        x: this.view.type === '3d' ? (overelement as Marker).position[0]
                                            // tslint:disable-next-line:max-line-length
                                            + (overelement as Marker).label.xoffset : (overelement as Marker).position[0],
                                        y: this.view.type === '3d' ? (overelement as Marker).position[1]
                                        + (overelement as Marker).label.yoffset : (overelement as Marker).position[1],
                                        z: this.view.type === '3d' ? (overelement as Marker).position[2]
                                        + (overelement as Marker).label.zoffset : (overelement as Marker).position[2],
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: marklabel,
                                    attributes: markerattributes
                                });
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default', (overelement as Marker).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polyline') {
                            let lineSymbol = null;
                            if (!overelement.symbol) {
                             lineSymbol = {
                                type: "simple-line",
                                color: (overelement as Polyline).strokeColor,
                                style: (overelement as Polyline).style,
                                width: (overelement as Polyline).width,
                                cap: (overelement as Polyline).cap,
                                join: (overelement as Polyline).lineJoin
                            };
                          } else {
                                lineSymbol = overelement.symbol;
                            }
                            const path = [];
                            (overelement as Polyline).path.forEach((item) => {
                                path.push([item.X, item.Y, item.Z]);
                            });
                            const polyline = new ArcGISPolyline({
                                hasZ: false,
                                hasM: false,
                                paths: path,
                                spatialReference: this.view.spatialReference
                            });
                            const polylineattributes = (overelement as Overlayerbase).attributes;
                            polylineattributes['uuid'] = (overelement as Polyline).uuid;
                            const polylineGraphic = new Graphic({
                                geometry: polyline,
                                symbol: lineSymbol,
                                attributes: polylineattributes
                            });
                            this.mapoverlayers.push(['smap-default', (overelement as Polyline).uuid, polylineGraphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(polylineGraphic);
                            }

                            if ((overelement as Polyline).label.visible) {
                                let polylinelabel = null;
                                if (!(overelement as Polyline).label.labelingInfo) {
                                    polylinelabel = {
                                        type: (overelement as Polyline).label.type,
                                        text: (overelement as Polyline).label.text,
                                        color: (overelement as Polyline).label.color,
                                        angle: (overelement as Polyline).label.angle,
                                        backgroundColor: (overelement as Polyline).label.backgroundColor,
                                        borderLineColor: (overelement as Polyline).label.borderLineColor,
                                        borderLineSize: (overelement as Polyline).label.borderLineSize,
                                        kerning: (overelement as Polyline).label.kerning,
                                        lineHeight: (overelement as Polyline).label.lineHeight,
                                        lineWidth: (overelement as Polyline).label.lineWidth,
                                        rotated: (overelement as Polyline).label.rotated,
                                        haloColor: (overelement as Polyline).label.haloColor,
                                        haloSize: (overelement as Polyline).label.haloSize,
                                        xoffset: (overelement as Polyline).label.xoffset,
                                        yoffset: (overelement as Polyline).label.yoffset,
                                        verticalAlignment: (overelement as Polyline).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Polyline).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Polyline).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Polyline).label.weight
                                        }
                                    };
                                } else {
                                    polylinelabel = (overelement as Polyline).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polylineGraphic.geometry.extent.center,
                                    symbol: polylinelabel,
                                    attributes: polylineattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default', (overelement as Polyline).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polygon') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                            if ((overelement as Polygon).symboltype === 'simple') {
                                fillSymbol = {
                                    type: "simple-fill",
                                    color: (overelement as Polygon).fillColor,
                                    style: (overelement as Polygon).style,
                                    outline: {
                                        color: (overelement as Polygon).strokeColor,
                                        width: (overelement as Polygon).strokeWeight,
                                        style: (overelement as Polygon).strokestyle
                                    }
                                };
                            } else {
                                fillSymbol = {
                                    type: "picture-fill",
                                    url: (overelement as Polygon).url,
                                    width: (overelement as Polygon).picwidth,
                                    height: (overelement as Polygon).picheight,
                                    outline: {
                                        style: (overelement as Polygon).strokestyle,
                                        color: (overelement as Polygon).strokeColor,
                                        width: (overelement as Polygon).strokeWeight
                                    }
                                };
                            }
                            } else {
                                fillSymbol = overelement.symbol;
                            }

                            const rs = [];
                            (overelement as Polygon).paths.forEach((item) => {
                                rs.push([item.X, item.Y, item.Z]);
                            });
                            const polygon = new ArcGISPolygon({
                                hasZ: true,
                                hasM: true,
                                rings: rs,
                                spatialReference: this.view.spatialReference
                            });
                            const polygonattributes = (overelement as Overlayerbase).attributes;
                            polygonattributes['uuid'] = (overelement as Polygon).uuid;
                            const polygonGraphic = new Graphic({
                                geometry: polygon,
                                symbol: fillSymbol,
                                attributes: polygonattributes
                            });
                            this.mapoverlayers.push(['smap-default',
                                (overelement as Polygon).uuid, polygonGraphic]);
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(polygonGraphic);
                            }

                            if ((overelement as Polygon).label.visible) {
                                let polygonlabel = null;
                                if (!(overelement as Polygon).label.labelingInfo) {
                                    polygonlabel = {
                                        type: (overelement as Polygon).label.type,
                                        text: (overelement as Polygon).label.text,
                                        color: (overelement as Polygon).label.color,
                                        angle: (overelement as Polygon).label.angle,
                                        backgroundColor: (overelement as Polygon).label.backgroundColor,
                                        borderLineColor: (overelement as Polygon).label.borderLineColor,
                                        borderLineSize: (overelement as Polygon).label.borderLineSize,
                                        kerning: (overelement as Polygon).label.kerning,
                                        lineHeight: (overelement as Polygon).label.lineHeight,
                                        lineWidth: (overelement as Polygon).label.lineWidth,
                                        rotated: (overelement as Polygon).label.rotated,
                                        haloColor: (overelement as Polygon).label.haloColor,
                                        haloSize: (overelement as Polygon).label.haloSize,
                                        xoffset: (overelement as Polygon).label.xoffset,
                                        yoffset: (overelement as Polygon).label.yoffset,
                                        verticalAlignment: (overelement as Polygon).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Polygon).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Polygon).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Polygon).label.weight
                                        }
                                    };
                                } else {
                                    polygonlabel = (overelement as Polygon).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polygonGraphic.geometry.extent.center,
                                    symbol: polygonlabel,
                                    attributes: polygonattributes
                                });
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default',
                                    (overelement as Polygon).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'circle') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                                if ((overelement as Circle).symboltype === 'simple') {
                                    fillSymbol = {
                                        type: "simple-fill",
                                        color: (overelement as Circle).fillColor,
                                        style: (overelement as Circle).style,
                                        outline: {
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight,
                                            style: (overelement as Circle).strokestyle
                                        }
                                    };
                                } else {
                                    fillSymbol = {
                                        type: "picture-fill",
                                        url: (overelement as Circle).url,
                                        width: (overelement as Circle).picwidth,
                                        height: (overelement as Circle).picheight,
                                        outline: {
                                            style: (overelement as Circle).strokestyle,
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight
                                        }
                                    };
                                }
                            } else {
                                fillSymbol = overelement.symbol;
                            }

                            if ((overelement as Overlayerbase).attributes
                                && (overelement as Circle).center
                                && (overelement as Circle).radius) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Circle).uuid;
                                const circlegraphic = new Graphic({
                                    geometry: new esriCircle({
                                        center: new Point({
                                            x: (overelement as Circle).center.X,
                                            y: (overelement as Circle).center.Y,
                                            z: (overelement as Circle).center.Z,
                                            spatialReference: this.view.spatialReference
                                        }),
                                        radius: (overelement as Circle).radius,
                                        radiusUnit: (overelement as Circle).radiusUnit,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: fillSymbol,
                                    attributes: dataattributes
                                });
                                this.mapoverlayers.push(['smap-default',
                                    (overelement as Circle).uuid, circlegraphic]);
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(circlegraphic);
                                }
                                if (((overelement as Overlayerbase) as Circle).label.visible) {
                                    let polygonlabel = null;
                                    if (!((overelement as Overlayerbase) as Circle).label.labelingInfo) {
                                        polygonlabel = {
                                            type: (overelement as Circle).label.type,
                                            text: (overelement as Circle).label.text,
                                            color: (overelement as Circle).label.color,
                                            angle: (overelement as Circle).label.angle,
                                            backgroundColor: (overelement as Circle).label.backgroundColor,
                                            borderLineColor: (overelement as Circle).label.borderLineColor,
                                            borderLineSize: (overelement as Circle).label.borderLineSize,
                                            kerning: (overelement as Circle).label.kerning,
                                            lineHeight: (overelement as Circle).label.lineHeight,
                                            lineWidth: (overelement as Circle).label.lineWidth,
                                            rotated: (overelement as Circle).label.rotated,
                                            haloColor: (overelement as Circle).label.haloColor,
                                            haloSize: (overelement as Circle).label.haloSize,
                                            xoffset: (overelement as Circle).label.xoffset,
                                            yoffset: (overelement as Circle).label.yoffset,
                                            verticalAlignment: (overelement as Circle).label.verticalAlignment,
                                            horizontalAlignment: (overelement as Circle).label.horizontalAlignment,
                                            font: {
                                                size: (overelement as Circle).label.size,
                                                family: "Josefin Slab",
                                                weight: (overelement as Circle).label.weight
                                            }
                                        };
                                    } else {
                                        polygonlabel = (overelement as Circle).label.labelingInfo;
                                    }
                                    const graphictext = new Graphic({
                                        geometry: circlegraphic.geometry.extent.center,
                                        symbol: polygonlabel,
                                        attributes: dataattributes
                                    });
                                    const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                    if (cgraphicLayer) {
                                        cgraphicLayer.add(graphictext);
                                    }
                                    this.mapoverlayers.push(['smap-default',
                                        (overelement as Circle).uuid, graphictext]);
                                }
                            }
                        }
                    });
                } else if (overlayers.type === 'group') {
                    const graphiclist = this.mapoverlayers.filter((item) => {
                        return item[0] === overlayers.uuid;
                    });
                    graphiclist.forEach((item) => {
                        const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (graphicLayer) {
                            graphicLayer.remove(item[2]);
                        }
                    });
                    this.mapoverlayers = this.mapoverlayers.filter((item) => item[0] !== overlayers.uuid);
                    (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                        if (overelement.overlaytype.toLowerCase() === 'marker') {
                            let psymbol;
                            if (!overelement.symbol) {
                            if (this.view.type === '2d') {
                                psymbol = {
                                    type: "picture-marker",
                                    url: (overelement as Marker).icon.image,
                                    width: (overelement as Marker).icon.size.width,
                                    height: (overelement as Marker).icon.size.height
                                };
                            } else {
                                psymbol = {
                                    type: "point-3d",
                                    symbolLayers: [{
                                        type: "icon",
                                        size: (overelement as Marker).icon.size.width,
                                        resource: {
                                            href: (overelement as Marker).icon.image
                                        }
                                    }]
                                };
                              }
                            } else {
                                psymbol = (overelement as Marker).symbol;
                            }
                            const markerattributes = (overelement as Overlayerbase).attributes;
                            markerattributes['uuid'] = (overelement as Marker).uuid;
                            const graphic = new Graphic({
                                geometry: new Point({
                                    x: (overelement as Marker).position[0],
                                    y: (overelement as Marker).position[1],
                                    z: (overelement as Marker).position[2] === undefined ? 0 :
                                        (overelement as Marker).position[2],
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: psymbol,
                                attributes: markerattributes
                            });
                            this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                            (overelement as Marker).uuid, graphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(graphic);
                            }
                            if ((overelement as Marker).label.visible) {
                                let marklabel = null;
                                if (!(overelement as Marker).label.labelingInfo) {
                                    marklabel = {
                                        type: (overelement as Marker).label.type,
                                        text: (overelement as Marker).label.text,
                                        color: (overelement as Marker).label.color,
                                        angle: (overelement as Marker).label.angle,
                                        backgroundColor: (overelement as Marker).label.backgroundColor,
                                        borderLineColor: (overelement as Marker).label.borderLineColor,
                                        borderLineSize: (overelement as Marker).label.borderLineSize,
                                        kerning: (overelement as Marker).label.kerning,
                                        lineHeight: (overelement as Marker).label.lineHeight,
                                        lineWidth: (overelement as Marker).label.lineWidth,
                                        rotated: (overelement as Marker).label.rotated,
                                        haloColor: (overelement as Marker).label.haloColor,
                                        haloSize: (overelement as Marker).label.haloSize,
                                        xoffset: (overelement as Marker).label.xoffset,
                                        yoffset: (overelement as Marker).label.yoffset,
                                        verticalAlignment: (overelement as Marker).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Marker).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Marker).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Marker).label.weight
                                        }
                                    };
                                } else {
                                    marklabel = (overelement as Marker).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: new Point({
                                        x: this.view.type === '3d' ? (overelement as Marker).position[0]
                                            + (overelement as Marker).label.xoffset :
                                            (overelement as Marker).position[0],
                                        y: this.view.type === '3d' ? (overelement as Marker).position[1]
                                            + (overelement as Marker).label.yoffset :
                                            (overelement as Marker).position[1],
                                        z: this.view.type === '3d' ? (overelement as Marker).position[2]
                                            + (overelement as Marker).label.zoffset :
                                            (overelement as Marker).position[2],
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: marklabel,
                                    attributes: markerattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push([(overlayers as OverlayGroup).uuid
                                    , (overelement as Marker).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polyline') {
                            let lineSymbol = null;
                            if (!overelement.symbol) {
                              lineSymbol = {
                                type: "simple-line",
                                color: (overelement as Polyline).strokeColor,
                                style: (overelement as Polyline).style,
                                width: (overelement as Polyline).width,
                                cap: (overelement as Polyline).cap,
                                join: (overelement as Polyline).lineJoin
                            };
                            } else {
                                lineSymbol = overelement.symbol;
                            }
                            const path = [];
                            (overelement as Polyline).path.forEach((item) => {
                                path.push([item.X, item.Y, item.Z]);
                            });
                            const polyline = new ArcGISPolyline({
                                hasZ: false,
                                hasM: false,
                                paths: path,
                                spatialReference: this.view.spatialReference
                            });
                            const polylineattributes = (overelement as Overlayerbase).attributes;
                            polylineattributes['uuid'] = (overelement as Polyline).uuid;
                            const polylineGraphic = new Graphic({
                                geometry: polyline,
                                symbol: lineSymbol,
                                attributes: polylineattributes
                            });
                            this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                            (overelement as Polyline).uuid, polylineGraphic]);
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(polylineGraphic);
                            }

                            if ((overelement as Polyline).label.visible) {
                                let polylinelabel = null;
                                if (!(overelement as Polyline).label.labelingInfo) {
                                    polylinelabel = {
                                        type: (overelement as Polyline).label.type,
                                        text: (overelement as Polyline).label.text,
                                        color: (overelement as Polyline).label.color,
                                        angle: (overelement as Polyline).label.angle,
                                        backgroundColor: (overelement as Polyline).label.backgroundColor,
                                        borderLineColor: (overelement as Polyline).label.borderLineColor,
                                        borderLineSize: (overelement as Polyline).label.borderLineSize,
                                        kerning: (overelement as Polyline).label.kerning,
                                        lineHeight: (overelement as Polyline).label.lineHeight,
                                        lineWidth: (overelement as Polyline).label.lineWidth,
                                        rotated: (overelement as Polyline).label.rotated,
                                        haloColor: (overelement as Polyline).label.haloColor,
                                        haloSize: (overelement as Polyline).label.haloSize,
                                        xoffset: (overelement as Polyline).label.xoffset,
                                        yoffset: (overelement as Polyline).label.yoffset,
                                        verticalAlignment: (overelement as Polyline).label.verticalAlignment,
                                        horizontalAlignment: (overelement as Polyline).label.horizontalAlignment,
                                        font: {
                                            size: (overelement as Polyline).label.size,
                                            family: "Josefin Slab",
                                            weight: (overelement as Polyline).label.weight
                                        }
                                    };
                                } else {
                                    polylinelabel = (overelement as Polyline).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polylineGraphic.geometry.extent.center,
                                    symbol: polylinelabel,
                                    attributes: polylineattributes
                                });
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push([(overlayers as OverlayGroup).uuid,
                                (overelement as Polyline).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'polygon') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                            if ((overlayers as Polygon).symboltype === 'simple') {
                                fillSymbol = {
                                    type: "simple-fill",
                                    color: (overlayers as Polygon).fillColor,
                                    style: (overlayers as Polygon).style,
                                    outline: {
                                        color: (overlayers as Polygon).strokeColor,
                                        width: (overlayers as Polygon).strokeWeight,
                                        style: (overlayers as Polygon).strokestyle
                                    }
                                };
                            } else {
                                fillSymbol = {
                                    type: "picture-fill",
                                    url: (overlayers as Polygon).url,
                                    width: (overlayers as Polygon).picwidth,
                                    height: (overlayers as Polygon).picheight,
                                    outline: {
                                        style: (overlayers as Polygon).strokestyle,
                                        color: (overlayers as Polygon).strokeColor,
                                        width: (overlayers as Polygon).strokeWeight
                                    }
                                };
                             }
                            } else {
                                fillSymbol = overelement.symbol;
                            }

                            const rs = [];
                            (overlayers as Polygon).paths.forEach((item) => {
                                rs.push([item.X, item.Y, item.Z]);
                            });
                            const polygonattributes = (overelement as Overlayerbase).attributes;
                            polygonattributes['uuid'] = (overelement as Polygon).uuid;
                            const polygon = new ArcGISPolygon({
                                hasZ: true,
                                hasM: true,
                                rings: rs,
                                spatialReference: this.view.spatialReference
                            });
                            const polygonGraphic = new Graphic({
                                geometry: polygon,
                                symbol: fillSymbol,
                                attributes: polygonattributes
                            });
                            this.mapoverlayers.push(['smap-default',
                                (overlayers as Polygon).uuid, polygonGraphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(polygonGraphic);
                            }

                            if ((overlayers as Polygon).label.visible) {
                                let polygonlabel = null;
                                if (!(overelement as Polygon).label.labelingInfo) {
                                    polygonlabel = {
                                        type: (overlayers as Polygon).label.type,
                                        text: (overlayers as Polygon).label.text,
                                        color: (overlayers as Polygon).label.color,
                                        angle: (overlayers as Polygon).label.angle,
                                        backgroundColor: (overlayers as Polygon).label.backgroundColor,
                                        borderLineColor: (overlayers as Polygon).label.borderLineColor,
                                        borderLineSize: (overlayers as Polygon).label.borderLineSize,
                                        kerning: (overlayers as Polygon).label.kerning,
                                        lineHeight: (overlayers as Polygon).label.lineHeight,
                                        lineWidth: (overlayers as Polygon).label.lineWidth,
                                        rotated: (overlayers as Polygon).label.rotated,
                                        haloColor: (overlayers as Polygon).label.haloColor,
                                        haloSize: (overlayers as Polygon).label.haloSize,
                                        xoffset: (overlayers as Polygon).label.xoffset,
                                        yoffset: (overlayers as Polygon).label.yoffset,
                                        verticalAlignment: (overlayers as Polygon).label.verticalAlignment,
                                        horizontalAlignment: (overlayers as Polygon).label.horizontalAlignment,
                                        font: {
                                            size: (overlayers as Polygon).label.size,
                                            family: "Josefin Slab",
                                            weight: (overlayers as Polygon).label.weight
                                        }
                                    };
                                } else {
                                    polygonlabel = (overelement as Polygon).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: polygonGraphic.geometry.extent.center,
                                    symbol: polygonlabel,
                                    attributes: polygonattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default',
                                    (overlayers as Polygon).uuid, graphictext]);
                            }
                        } else if (overelement.overlaytype.toLowerCase() === 'circle') {
                            let fillSymbol;
                            if (!overelement.symbol) {
                                if ((overelement as Circle).symboltype === 'simple') {
                                    fillSymbol = {
                                        type: "simple-fill",
                                        color: (overelement as Circle).fillColor,
                                        style: (overelement as Circle).style,
                                        outline: {
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight,
                                            style: (overelement as Circle).strokestyle
                                        }
                                    };
                                } else {
                                    fillSymbol = {
                                        type: "picture-fill",
                                        url: (overelement as Circle).url,
                                        width: (overelement as Circle).picwidth,
                                        height: (overelement as Circle).picheight,
                                        outline: {
                                            style: (overelement as Circle).strokestyle,
                                            color: (overelement as Circle).strokeColor,
                                            width: (overelement as Circle).strokeWeight
                                        }
                                    };
                                }
                            } else {
                                fillSymbol = overelement.symbol;
                            }

                            if ((overelement as Overlayerbase).attributes
                                && (overelement as Circle).center
                                && (overelement as Circle).radius) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Circle).uuid;
                                const circlegraphic = new Graphic({
                                    geometry: new esriCircle({
                                        center: new Point({
                                            x: (overelement as Circle).center.X,
                                            y: (overelement as Circle).center.Y,
                                            z: (overelement as Circle).center.Z,
                                            spatialReference: this.view.spatialReference
                                        }),
                                        radius: (overelement as Circle).radius,
                                        radiusUnit: (overelement as Circle).radiusUnit,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    symbol: fillSymbol,
                                    attributes: dataattributes
                                });
                                this.mapoverlayers.push(['smap-default',
                                    (overelement as Circle).uuid, circlegraphic]);
                                const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (graphicLayer) {
                                    graphicLayer.add(circlegraphic);
                                }
                                if (((overelement as Overlayerbase) as Circle).label.visible) {
                                    let polygonlabel = null;
                                    if (!((overelement as Overlayerbase) as Circle).label.labelingInfo) {
                                        polygonlabel = {
                                            type: (overelement as Circle).label.type,
                                            text: (overelement as Circle).label.text,
                                            color: (overelement as Circle).label.color,
                                            angle: (overelement as Circle).label.angle,
                                            backgroundColor: (overelement as Circle).label.backgroundColor,
                                            borderLineColor: (overelement as Circle).label.borderLineColor,
                                            borderLineSize: (overelement as Circle).label.borderLineSize,
                                            kerning: (overelement as Circle).label.kerning,
                                            lineHeight: (overelement as Circle).label.lineHeight,
                                            lineWidth: (overelement as Circle).label.lineWidth,
                                            rotated: (overelement as Circle).label.rotated,
                                            haloColor: (overelement as Circle).label.haloColor,
                                            haloSize: (overelement as Circle).label.haloSize,
                                            xoffset: (overelement as Circle).label.xoffset,
                                            yoffset: (overelement as Circle).label.yoffset,
                                            verticalAlignment: (overelement as Circle).label.verticalAlignment,
                                            horizontalAlignment: (overelement as Circle).label.horizontalAlignment,
                                            font: {
                                                size: (overelement as Circle).label.size,
                                                family: "Josefin Slab",
                                                weight: (overelement as Circle).label.weight
                                            }
                                        };
                                    } else {
                                        polygonlabel = (overelement as Circle).label.labelingInfo;
                                    }
                                    const graphictext = new Graphic({
                                        geometry: circlegraphic.geometry.extent.center,
                                        symbol: polygonlabel,
                                        attributes: dataattributes
                                    });
                                    const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                    if (cgraphicLayer) {
                                        cgraphicLayer.add(graphictext);
                                    }
                                    this.mapoverlayers.push(['smap-default',
                                        (overelement as Circle).uuid, graphictext]);
                                }
                            }
                        }
                    });
                } else if (overlayers.type === 'element') {
                    const graphiclist = this.mapoverlayers.filter((item) => {
                        return item[1] === overlayers.uuid;
                    });
                    graphiclist.forEach((item) => {
                        const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (graphicLayer) {
                            graphicLayer.remove(item[2]);
                        }
                    });
                    this.mapoverlayers = this.mapoverlayers.filter((item) => item[1] !== overlayers.uuid);
                    if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'marker') {
                        let psymbol;
                        if (!(overlayers as Overlayerbase).symbol) {
                        if (this.view.type === '2d') {
                            psymbol = {
                                type: "picture-marker",
                                url: (overlayers as Marker).icon.image,
                                width: (overlayers as Marker).icon.size.width,
                                height: (overlayers as Marker).icon.size.height
                            };
                        } else {
                            psymbol = {
                                type: "point-3d",
                                symbolLayers: [{
                                    type: "icon",
                                    size: (overlayers as Marker).icon.size.width,
                                    resource: {
                                        href: (overlayers as Marker).icon.image
                                    }
                                }]
                            };
                        }
                        } else {
                            psymbol = (overlayers as Overlayerbase).symbol;
                        }
                        const markerattributes = (overlayers as Overlayerbase).attributes;
                        markerattributes['uuid'] = (overlayers as Marker).uuid;
                        const graphic = new Graphic({
                            geometry: new Point({
                                x: (overlayers as Marker).position[0],
                                y: (overlayers as Marker).position[1],
                                z: (overlayers as Marker).position[2] === undefined ? 0 :
                                    (overlayers as Marker).position[2],
                                spatialReference: this.view.spatialReference
                            }),
                            symbol: psymbol,
                            attributes: markerattributes
                        });
                        this.mapoverlayers.push(['smap-default', (overlayers as Marker).uuid, graphic]);
                        const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (cgraphicLayer) {
                            cgraphicLayer.add(graphic);
                        }
                        if ((overlayers as Marker).label.visible) {
                            let marklabel = null;
                            if (!(overlayers as Marker).label.labelingInfo) {
                                marklabel = {
                                    type: (overlayers as Marker).label.type,
                                    text: (overlayers as Marker).label.text,
                                    color: (overlayers as Marker).label.color,
                                    angle: (overlayers as Marker).label.angle,
                                    backgroundColor: (overlayers as Marker).label.backgroundColor,
                                    borderLineColor: (overlayers as Marker).label.borderLineColor,
                                    borderLineSize: (overlayers as Marker).label.borderLineSize,
                                    kerning: (overlayers as Marker).label.kerning,
                                    lineHeight: (overlayers as Marker).label.lineHeight,
                                    lineWidth: (overlayers as Marker).label.lineWidth,
                                    rotated: (overlayers as Marker).label.rotated,
                                    haloColor: (overlayers as Marker).label.haloColor,
                                    haloSize: (overlayers as Marker).label.haloSize,
                                    xoffset: (overlayers as Marker).label.xoffset,
                                    yoffset: (overlayers as Marker).label.yoffset,
                                    verticalAlignment: (overlayers as Marker).label.verticalAlignment,
                                    horizontalAlignment: (overlayers as Marker).label.horizontalAlignment,
                                    font: {
                                        size: (overlayers as Marker).label.size,
                                        family: "Josefin Slab",
                                        weight: (overlayers as Marker).label.weight
                                    }
                                };
                            } else {
                                marklabel = (overlayers as Marker).label.labelingInfo;
                            }
                            const graphictext = new Graphic({
                                geometry: new Point({
                                    x: this.view.type === '3d' ? (overlayers as Marker).position[0]
                                        + (overlayers as Marker).label.xoffset : (overlayers as Marker).position[0],
                                    y: this.view.type === '3d' ? (overlayers as Marker).position[1]
                                        + (overlayers as Marker).label.yoffset : (overlayers as Marker).position[1],
                                    z: this.view.type === '3d' ? (overlayers as Marker).position[2]
                                        + (overlayers as Marker).label.zoffset : (overlayers as Marker).position[2],
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: marklabel,
                                attributes: markerattributes
                            });
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(graphictext);
                            }
                            this.mapoverlayers.push(['smap-default', (overlayers as Marker).uuid, graphictext]);
                        }
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polyline') {
                        let lineSymbol = null;
                        if (!(overlayers as Overlayerbase).symbol) {
                            lineSymbol = {
                                type: "simple-line",
                                color: (overlayers as Polyline).strokeColor,
                                style: (overlayers as Polyline).style,
                                width: (overlayers as Polyline).width,
                                cap: (overlayers as Polyline).cap,
                                join: (overlayers as Polyline).lineJoin
                            };
                        } else {
                            lineSymbol = (overlayers as Overlayerbase).symbol;
                        }
                        const path = [];
                        (overlayers as Polyline).path.forEach((item) => {
                            path.push([item.X, item.Y, item.Z]);
                        });
                        const polyline = new ArcGISPolyline({
                            hasZ: false,
                            hasM: false,
                            paths: path,
                            spatialReference: this.view.spatialReference
                        });
                        const polylineattributes = (overlayers as Overlayerbase).attributes;
                        polylineattributes['uuid'] = (overlayers as Polyline).uuid;
                        const polylineGraphic = new Graphic({
                            geometry: polyline,
                            symbol: lineSymbol,
                            attributes: polylineattributes
                        });
                        this.mapoverlayers.push(['smap-default',
                            (overlayers as Polyline).uuid, polylineGraphic]);
                        const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (graphicLayer) {
                            graphicLayer.add(polylineGraphic);
                        }

                        if ((overlayers as Polyline).label.visible) {
                            let polylabel = null;
                            if (!(overlayers as Polyline).label.labelingInfo) {
                                polylabel = {
                                    type: (overlayers as Polyline).label.type,
                                    text: (overlayers as Polyline).label.text,
                                    color: (overlayers as Polyline).label.color,
                                    angle: (overlayers as Polyline).label.angle,
                                    backgroundColor: (overlayers as Polyline).label.backgroundColor,
                                    borderLineColor: (overlayers as Polyline).label.borderLineColor,
                                    borderLineSize: (overlayers as Polyline).label.borderLineSize,
                                    kerning: (overlayers as Polyline).label.kerning,
                                    lineHeight: (overlayers as Polyline).label.lineHeight,
                                    lineWidth: (overlayers as Polyline).label.lineWidth,
                                    rotated: (overlayers as Polyline).label.rotated,
                                    haloColor: (overlayers as Polyline).label.haloColor,
                                    haloSize: (overlayers as Polyline).label.haloSize,
                                    xoffset: (overlayers as Polyline).label.xoffset,
                                    yoffset: (overlayers as Polyline).label.yoffset,
                                    verticalAlignment: (overlayers as Polyline).label.verticalAlignment,
                                    horizontalAlignment: (overlayers as Polyline).label.horizontalAlignment,
                                    font: {
                                        size: (overlayers as Polyline).label.size,
                                        family: "Josefin Slab",
                                        weight: (overlayers as Polyline).label.weight
                                    }
                                };
                            } else {
                                polylabel = (overlayers as Polyline).label.labelingInfo;
                            }
                            const graphictext = new Graphic({
                                geometry: polylineGraphic.geometry.extent.center,
                                symbol: polylabel,
                                attributes: polylineattributes
                            });
                            const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (cgraphicLayer) {
                                cgraphicLayer.add(graphictext);
                            }

                            this.mapoverlayers.push(['smap-default',
                                (overlayers as Polyline).uuid, graphictext]);
                        }
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polygon') {
                        let fillSymbol;
                        if (!(overlayers as Overlayerbase).symbol) {
                            if ((overlayers as Polygon).symboltype === 'simple') {
                                fillSymbol = {
                                    type: "simple-fill",
                                    color: (overlayers as Polygon).fillColor,
                                    style: (overlayers as Polygon).style,
                                    outline: {
                                        color: (overlayers as Polygon).strokeColor,
                                        width: (overlayers as Polygon).strokeWeight,
                                        style: (overlayers as Polygon).strokestyle
                                    }
                                };
                            } else {
                                fillSymbol = {
                                    type: "picture-fill",
                                    url: (overlayers as Polygon).url,
                                    width: (overlayers as Polygon).picwidth,
                                    height: (overlayers as Polygon).picheight,
                                    outline: {
                                        style: (overlayers as Polygon).strokestyle,
                                        color: (overlayers as Polygon).strokeColor,
                                        width: (overlayers as Polygon).strokeWeight
                                    }
                                };
                            }
                        } else {
                            fillSymbol = (overlayers as Overlayerbase).symbol;
                        }
                        const rs = [];
                        (overlayers as Polygon).paths.forEach((item) => {
                            rs.push([item.X, item.Y, item.Z]);
                        });
                        const polygon = new ArcGISPolygon({
                            hasZ: true,
                            hasM: true,
                            rings: rs,
                            spatialReference: this.view.spatialReference
                        });
                        const polygonattributes = (overlayers as Overlayerbase).attributes;
                        polygonattributes['uuid'] = (overlayers as Polygon).uuid;
                        const polygonGraphic = new Graphic({
                            geometry: polygon,
                            symbol: fillSymbol,
                            attributes: polygonattributes
                        });
                        this.mapoverlayers.push(['smap-default',
                            (overlayers as Polygon).uuid, polygonGraphic]);
                        const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (cgraphicLayer) {
                            cgraphicLayer.add(polygonGraphic);
                        }
                        if ((overlayers as Polygon).label.visible) {
                            let polylabel = null;
                            if (!(overlayers as Polygon).label.labelingInfo) {
                                polylabel = {
                                    type: (overlayers as Polygon).label.type,
                                    text: (overlayers as Polygon).label.text,
                                    color: (overlayers as Polygon).label.color,
                                    angle: (overlayers as Polygon).label.angle,
                                    backgroundColor: (overlayers as Polygon).label.backgroundColor,
                                    borderLineColor: (overlayers as Polygon).label.borderLineColor,
                                    borderLineSize: (overlayers as Polygon).label.borderLineSize,
                                    kerning: (overlayers as Polygon).label.kerning,
                                    lineHeight: (overlayers as Polygon).label.lineHeight,
                                    lineWidth: (overlayers as Polygon).label.lineWidth,
                                    rotated: (overlayers as Polygon).label.rotated,
                                    haloColor: (overlayers as Polygon).label.haloColor,
                                    haloSize: (overlayers as Polygon).label.haloSize,
                                    xoffset: (overlayers as Polygon).label.xoffset,
                                    yoffset: (overlayers as Polygon).label.yoffset,
                                    verticalAlignment: (overlayers as Polygon).label.verticalAlignment,
                                    horizontalAlignment: (overlayers as Polygon).label.horizontalAlignment,
                                    font: {
                                        size: (overlayers as Polygon).label.size,
                                        family: "Josefin Slab",
                                        weight: (overlayers as Polygon).label.weight
                                    }
                                };
                            } else {
                                polylabel = (overlayers as Polygon).label.labelingInfo;
                            }
                            const graphictext = new Graphic({
                                geometry: polygonGraphic.geometry.extent.center,
                                symbol: polylabel,
                                attributes: polygonattributes
                            });
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(graphictext);
                            }
                            this.mapoverlayers.push(['smap-default',
                                (overlayers as Polygon).uuid, graphictext]);
                        }
                    } else if (overlayers.overlaytype.toLowerCase() === 'circle') {
                        let fillSymbol;
                        if (!(overlayers as Overlayerbase).symbol) {
                            if ((overlayers as Circle).symboltype === 'simple') {
                                fillSymbol = {
                                    type: "simple-fill",
                                    color: (overlayers as Circle).fillColor,
                                    style: (overlayers as Circle).style,
                                    outline: {
                                        color: (overlayers as Circle).strokeColor,
                                        width: (overlayers as Circle).strokeWeight,
                                        style: (overlayers as Circle).strokestyle
                                    }
                                };
                            } else {
                                fillSymbol = {
                                    type: "picture-fill",
                                    url: (overlayers as Circle).url,
                                    width: (overlayers as Circle).picwidth,
                                    height: (overlayers as Circle).picheight,
                                    outline: {
                                        style: (overlayers as Circle).strokestyle,
                                        color: (overlayers as Circle).strokeColor,
                                        width: (overlayers as Circle).strokeWeight
                                    }
                                };
                            }
                        } else {
                            fillSymbol = (overlayers as Overlayerbase).symbol;
                        }

                        if ((overlayers as Overlayerbase).attributes
                            && (overlayers as Circle).center
                            && (overlayers as Circle).radius) {
                            const dataattributes = (overlayers as Overlayerbase).attributes;
                            dataattributes['uuid'] = (overlayers as Circle).uuid;
                            const circlegraphic = new Graphic({
                                geometry: new esriCircle({
                                    center: new Point({
                                        x: (overlayers as Circle).center.X,
                                        y: (overlayers as Circle).center.Y,
                                        z: (overlayers as Circle).center.Z,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    radius: (overlayers as Circle).radius,
                                    radiusUnit: (overlayers as Circle).radiusUnit,
                                    spatialReference: this.view.spatialReference
                                }),
                                symbol: fillSymbol,
                                attributes: dataattributes
                            });
                            this.mapoverlayers.push(['smap-default',
                                (overlayers as Circle).uuid, circlegraphic]);
                            const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                            if (graphicLayer) {
                                graphicLayer.add(circlegraphic);
                            }
                            if (((overlayers as Overlayerbase) as Circle).label.visible) {
                                let polygonlabel = null;
                                if (!((overlayers as Overlayerbase) as Circle).label.labelingInfo) {
                                    polygonlabel = {
                                        type: (overlayers as Circle).label.type,
                                        text: (overlayers as Circle).label.text,
                                        color: (overlayers as Circle).label.color,
                                        angle: (overlayers as Circle).label.angle,
                                        backgroundColor: (overlayers as Circle).label.backgroundColor,
                                        borderLineColor: (overlayers as Circle).label.borderLineColor,
                                        borderLineSize: (overlayers as Circle).label.borderLineSize,
                                        kerning: (overlayers as Circle).label.kerning,
                                        lineHeight: (overlayers as Circle).label.lineHeight,
                                        lineWidth: (overlayers as Circle).label.lineWidth,
                                        rotated: (overlayers as Circle).label.rotated,
                                        haloColor: (overlayers as Circle).label.haloColor,
                                        haloSize: (overlayers as Circle).label.haloSize,
                                        xoffset: (overlayers as Circle).label.xoffset,
                                        yoffset: (overlayers as Circle).label.yoffset,
                                        verticalAlignment: (overlayers as Circle).label.verticalAlignment,
                                        horizontalAlignment: (overlayers as Circle).label.horizontalAlignment,
                                        font: {
                                            size: (overlayers as Circle).label.size,
                                            family: "Josefin Slab",
                                            weight: (overlayers as Circle).label.weight
                                        }
                                    };
                                } else {
                                    polygonlabel = (overlayers as Circle).label.labelingInfo;
                                }
                                const graphictext = new Graphic({
                                    geometry: circlegraphic.geometry.extent.center,
                                    symbol: polygonlabel,
                                    attributes: dataattributes
                                });
                                const cgraphicLayer = this.view.map.findLayerById(this.displayedLayerid);
                                if (cgraphicLayer) {
                                    cgraphicLayer.add(graphictext);
                                }
                                this.mapoverlayers.push(['smap-default',
                                    (overlayers as Circle).uuid, graphictext]);
                            }
                        }
                    }
                }
            });
    }
    public removeAll() {
        const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (graphicLayer) {
            graphicLayer.removeAll();
            this.mapoverlayers = [];
        }
    }
    public delete() {
        const graphicLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (graphicLayer) {
            this.view.map.remove(graphicLayer);
            this.mapoverlayers = [];
        }
    }

    public show() {
        const gLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (gLayer) {
            gLayer.visible = true;
        }
    }
    public hide() {
        const gLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (gLayer) {
            gLayer.visible = false;
        }
    }
    private async init(view: any) {
        this.displayedLayerid = new Guid().uuid;
        this.view = view;
        this.view.on(MapEvent.click, (event) => {
            this.view.hitTest(event).then(async (response) => {
                if (response.results.length > 0) {
                    if (!response.results[0].graphic.layer) {
                        return;
                    }
                    const layerid = response.results[0].graphic.layer.id;
                    if (!layerid) { return; }
                    if (layerid === this.displayedLayerid) {
                        this.emit(MapEvent.click, response, event.mapPoint);
                    }
                }
            });
        });

        this.view.on(MapEvent.pointermove, (event) => {
            this.view.hitTest(event).then(async (response) => {
                if (response.results.length > 0) {
                    if (!response.results[0].graphic.layer) {
                        return;
                    }
                    const layerid = response.results[0].graphic.layer.id;
                    if (!layerid) { return; }
                    if (layerid === this.displayedLayerid) {
                        this.emit(MapEvent.pointermove, response, this.view.toMap({
                            x: event.x,
                            y: event.y
                        }));
                    }
                }
            });
        });
    }
}
