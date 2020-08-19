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
export default class FeaureOverlays extends EventEmitter {
    public displayedLayerid: any = "";
    private view: any = null;
    private mapoverlayersflayer: Array<[string, string, any]> = [];
    private  eventResult: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public createFeatureGroup(overlayers: Overlayerbase | OverlayGroup): void {
        const boundaryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (boundaryResultLayer) {
            this.view.map.remove(boundaryResultLayer);
            this.mapoverlayersflayer = [];
        }
        load(['esri/layers/FeatureLayer', 'esri/layers/support/LabelClass', 'esri/Graphic', 'esri/geometry/Point',
            'esri/geometry/Circle', 'esri/symbols/PictureMarkerSymbol', "esri/geometry/Polyline", "esri/geometry/Polygon"
            ])
            // tslint:disable-next-line:variable-name
            .then(([FeatureLayer, LabelClass, Graphic, Point, esriCircle,
                // tslint:disable-next-line:variable-name
                PictureMarkerSymbol, ArcGISPolyline, ArcGISPolygon]) => {
                 if (overlayers.type === 'group') {
                    const datafiled = [{
                        name: 'objectId',
                        alias: 'objectId',
                        type: 'oid'
                    }, {
                        name: 'uuid',
                        alias: '唯一标识',
                        type: 'string'
                    }];
                    datafiled.push({
                        name: 'style',
                        alias: '样式',
                        type: 'string'
                    });
                    (overlayers as OverlayGroup).datafiled.forEach((element: any) => {
                        datafiled.push(element);
                    });
                    let symbolrenderer;
                    if ((overlayers as OverlayGroup).overlaytype.toLowerCase() === 'marker') {
                        if (!(overlayers as OverlayGroup).renderer) {
                            symbolrenderer = {
                                type: 'unique-value',
                                field: 'style',
                                uniqueValueInfos: []
                            };
                            (overlayers as OverlayGroup).style.forEach((styleelement) => {
                                symbolrenderer.uniqueValueInfos.push({
                                    value: styleelement.style,
                                    label: styleelement.style,
                                    symbol: styleelement.symbol
                                });
                                // if (this.view.type === '3d') {
                                //     symbolrenderer.uniqueValueInfos.push({
                                //         value: styleelement.style,
                                //         label: styleelement.style,
                                //         symbol: {
                                //             type: "point-3d",
                                //             symbolLayers: [{
                                //                 type: "icon",
                                //                 size: styleelement.size.height,
                                //                 resource: {
                                //                     href: styleelement.url
                                //                 }
                                //             }]
                                //         }
                                //     });
                                // } else {
                                //     symbolrenderer.uniqueValueInfos.push({
                                //         value: styleelement.style,
                                //         label: styleelement.style,
                                //         symbol: {
                                //             type: "picture-marker",
                                //             url: styleelement.url,
                                //             width: styleelement.size.width,
                                //             height: styleelement.size.height
                                //         }
                                //     });
                                // }
                            });
                        } else {
                            symbolrenderer = (overlayers as OverlayGroup).renderer;
                        }
                        const clientoperateLayer = new FeatureLayer({
                            id: this.displayedLayerid,
                            title: this.displayedLayerid,
                            objectIdField: 'objectId',
                            geometryType: 'point',
                            renderer: symbolrenderer,
                            screenSizePerspectiveEnabled: this.view.type === '3d',
                            popupEnabled: false,
                            popupTemplate: false,
                            // elevationInfo: (overlayers as OverlayGroup).elevationInfo,
                            fields: datafiled,
                            source: [],
                            spatialReference: this.view.spatialReference
                        });
                        if ((overlayers as Overlayerbase).elevationInfo) {
                            clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                        }
                        this.view.map.add(clientoperateLayer);
                        (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                            if ((overelement as Overlayerbase).attributes && (overelement as Marker).position) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Marker).uuid;
                                const graphic = new Graphic({
                                    geometry: new Point({
                                        x: (overelement as Marker).position[0],
                                        y: (overelement as Marker).position[1],
                                        z: (overelement as Marker).position[2] === undefined ? 0 :
                                            (overelement as Marker).position[2],
                                        spatialReference: this.view.spatialReference
                                    }),
                                    attributes: dataattributes
                                });
                                clientoperateLayer.source.add(graphic);
                                this.mapoverlayersflayer.push([(overlayers as OverlayGroup).uuid,
                                (overelement as Marker).uuid,
                                    graphic]);
                            }
                        });
                        if (clientoperateLayer.source.items.length > 100) {
                            if ((overlayers as OverlayGroup).frreduction != null) {
                                clientoperateLayer.featureReduction = {
                                    type: (overlayers as OverlayGroup).frreduction.type,
                                    clusterRadius: (overlayers as OverlayGroup).frreduction.clusterRadius
                                };
                            }
                        }
                        if ((overlayers as OverlayGroup).label.visible) {
                            let labelsymbol;
                            if (!(overlayers as OverlayGroup).label.labelingInfo) {
                                if (this.view.type === '2d') {
                                    labelsymbol = {
                                        type: (overlayers as OverlayGroup).label.type,
                                        text: (overlayers as OverlayGroup).label.text,
                                        color: (overlayers as OverlayGroup).label.color,
                                        angle: (overlayers as OverlayGroup).label.angle,
                                        backgroundColor: (overlayers as OverlayGroup).label.backgroundColor,
                                        borderLineColor: (overlayers as OverlayGroup).label.borderLineColor,
                                        borderLineSize: (overlayers as OverlayGroup).label.borderLineSize,
                                        kerning: (overlayers as OverlayGroup).label.kerning,
                                        lineHeight: (overlayers as OverlayGroup).label.lineHeight,
                                        lineWidth: (overlayers as OverlayGroup).label.lineWidth,
                                        rotated: (overlayers as OverlayGroup).label.rotated,
                                        haloColor: (overlayers as OverlayGroup).label.haloColor,
                                        haloSize: (overlayers as OverlayGroup).label.haloSize,
                                        xoffset: (overlayers as OverlayGroup).label.xoffset,
                                        yoffset: (overlayers as OverlayGroup).label.yoffset,
                                        verticalAlignment: (overlayers as OverlayGroup).label.verticalAlignment,
                                        horizontalAlignment: (overlayers as OverlayGroup).label.horizontalAlignment,
                                        font: {
                                            size: (overlayers as OverlayGroup).label.size,
                                            family: "Josefin Slab",
                                            weight: (overlayers as OverlayGroup).label.weight
                                        }
                                    };
                                } else {
                                    labelsymbol = {
                                        type: "label-3d",
                                        symbolLayers: [{
                                            type: "text",
                                            material: { color: (overlayers as OverlayGroup).label.color },
                                            size: (overlayers as OverlayGroup).label.size,
                                            halo: {
                                                color: (overlayers as OverlayGroup).label.haloColor,
                                                size: (overlayers as OverlayGroup).label.haloSize
                                            }
                                        }]
                                    };
                                }
                                const statesLabelClass = new LabelClass({
                                    labelExpressionInfo: {
                                        expression: '$feature.NAME'
                                    },
                                    symbol: labelsymbol,
                                    labelPlacement: (overlayers as OverlayGroup).label.placement,
                                    minScale: (overlayers as OverlayGroup).label.minScale,
                                    maxScale: (overlayers as OverlayGroup).label.maxScale
                                });
                                clientoperateLayer.labelingInfo = [statesLabelClass];
                           } else {
                                labelsymbol = (overlayers as OverlayGroup).label.labelingInfo;
                                clientoperateLayer.labelingInfo = labelsymbol;
                           }
                        }
                    } else if ((overlayers as OverlayGroup).overlaytype.toLowerCase() === 'circle') {
                        if (!(overlayers as OverlayGroup).renderer) {
                            symbolrenderer = {
                                type: 'unique-value',
                                field: 'style',
                                uniqueValueInfos: []
                            };
                            (overlayers as OverlayGroup).style.forEach((styleelement) => {
                                symbolrenderer.uniqueValueInfos.push({
                                    value: styleelement.style,
                                    label: styleelement.style,
                                    symbol: styleelement.symbol
                                });
                            });
                        } else {
                            symbolrenderer = (overlayers as OverlayGroup).renderer;
                        }
                        const clientoperateLayer = new FeatureLayer({
                            id: this.displayedLayerid,
                            title: this.displayedLayerid,
                            objectIdField: 'objectId',
                            geometryType: 'polygon',
                            renderer: symbolrenderer,
                            screenSizePerspectiveEnabled: this.view.type === '3d',
                            popupEnabled: false,
                            popupTemplate: false,
                            fields: datafiled,
                            source: [],
                            spatialReference: this.view.spatialReference
                        });
                        if ((overlayers as Overlayerbase).elevationInfo) {
                            clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                        }
                        this.view.map.add(clientoperateLayer);
                        (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                            if ((overelement as Overlayerbase).attributes && (overelement as Circle).center
                             && (overelement as Circle).radius) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Circle).uuid;
                                const graphic = new Graphic({
                                    geometry: new esriCircle({
                                        center: new Point({x: (overelement as Circle).center.X,
                                                           y: (overelement as Circle).center.Y,
                                                           z: (overelement as Circle).center.Z,
                                                           spatialReference: this.view.spatialReference
                                        }),
                                        radius: (overelement as Circle).radius,
                                        radiusUnit: (overelement as Circle).radiusUnit,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    attributes: dataattributes
                                });
                                clientoperateLayer.source.add(graphic);
                                this.mapoverlayersflayer.push([(overlayers as OverlayGroup).uuid,
                                    (overelement as Circle).uuid,
                                    graphic]);
                            }
                        });
                        if ((overlayers as OverlayGroup).label.visible) {
                            let labelsymbol;
                            if (!(overlayers as OverlayGroup).label.labelingInfo) {
                                if (this.view.type === '2d') {
                                    labelsymbol = {
                                        type: (overlayers as OverlayGroup).label.type,
                                        text: (overlayers as OverlayGroup).label.text,
                                        color: (overlayers as OverlayGroup).label.color,
                                        angle: (overlayers as OverlayGroup).label.angle,
                                        backgroundColor: (overlayers as OverlayGroup).label.backgroundColor,
                                        borderLineColor: (overlayers as OverlayGroup).label.borderLineColor,
                                        borderLineSize: (overlayers as OverlayGroup).label.borderLineSize,
                                        kerning: (overlayers as OverlayGroup).label.kerning,
                                        lineHeight: (overlayers as OverlayGroup).label.lineHeight,
                                        lineWidth: (overlayers as OverlayGroup).label.lineWidth,
                                        rotated: (overlayers as OverlayGroup).label.rotated,
                                        haloColor: (overlayers as OverlayGroup).label.haloColor,
                                        haloSize: (overlayers as OverlayGroup).label.haloSize,
                                        xoffset: (overlayers as OverlayGroup).label.xoffset,
                                        yoffset: (overlayers as OverlayGroup).label.yoffset,
                                        verticalAlignment: (overlayers as OverlayGroup).label.verticalAlignment,
                                        horizontalAlignment: (overlayers as OverlayGroup).label.horizontalAlignment,
                                        font: {
                                            size: (overlayers as OverlayGroup).label.size,
                                            family: "Josefin Slab",
                                            weight: (overlayers as OverlayGroup).label.weight
                                        }
                                    };
                                } else {
                                    labelsymbol = {
                                        type: "label-3d",
                                        symbolLayers: [{
                                            type: "text",
                                            material: { color: (overlayers as OverlayGroup).label.color },
                                            size: (overlayers as OverlayGroup).label.size,
                                            halo: {
                                                color: (overlayers as OverlayGroup).label.haloColor,
                                                size: (overlayers as OverlayGroup).label.haloSize
                                            }
                                        }]
                                    };
                                }
                                const statesLabelClass = new LabelClass({
                                    labelExpressionInfo: {
                                        expression: '$feature.NAME'
                                    },
                                    symbol: labelsymbol,
                                    labelPlacement: (overlayers as OverlayGroup).label.placement,
                                    minScale: (overlayers as OverlayGroup).label.minScale,
                                    maxScale: (overlayers as OverlayGroup).label.maxScale
                                });
                                clientoperateLayer.labelingInfo = [statesLabelClass];
                            } else {
                                labelsymbol = (overlayers as OverlayGroup).label.labelingInfo;
                                clientoperateLayer.labelingInfo = labelsymbol;
                            }
                        }
                    } else if ((overlayers as OverlayGroup).overlaytype.toLowerCase() === 'polyline') {
                        if (!(overlayers as OverlayGroup).renderer) {
                            symbolrenderer = {
                                type: 'unique-value',
                                field: 'style',
                                uniqueValueInfos: []
                            };
                            (overlayers as OverlayGroup).style.forEach((styleelement) => {
                                symbolrenderer.uniqueValueInfos.push({
                                    value: styleelement.style,
                                    label: styleelement.style,
                                    symbol: styleelement.symbol
                                });
                            });
                        } else {
                            symbolrenderer = (overlayers as OverlayGroup).renderer;
                        }
                        const clientoperateLayer = new FeatureLayer({
                            id: this.displayedLayerid,
                            title: this.displayedLayerid,
                            objectIdField: 'objectId',
                            geometryType: 'polyline',
                            renderer: symbolrenderer,
                            // screenSizePerspectiveEnabled: this.view.type === '3d',
                            popupEnabled: false,
                            popupTemplate: false,
                            fields: datafiled,
                            source: [],
                            spatialReference: this.view.spatialReference
                        });
                        if ((overlayers as Overlayerbase).elevationInfo) {
                            clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                        }
                        this.view.map.add(clientoperateLayer);
                        (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                            if ((overelement as Overlayerbase).attributes && (overelement as Polyline).path) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Polyline).uuid;
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
                                const graphic = new Graphic({
                                    geometry: polyline,
                                    attributes: dataattributes
                                });
                                clientoperateLayer.source.add(graphic);
                                this.mapoverlayersflayer.push([(overlayers as OverlayGroup).uuid,
                                    (overelement as Polyline).uuid,
                                    graphic]);
                            }
                        });
                        if ((overlayers as OverlayGroup).label.visible) {
                            let labelsymbol;
                            if (!(overlayers as OverlayGroup).label.labelingInfo) {
                                if (this.view.type === '2d') {
                                    labelsymbol = {
                                        type: (overlayers as OverlayGroup).label.type,
                                        text: (overlayers as OverlayGroup).label.text,
                                        color: (overlayers as OverlayGroup).label.color,
                                        angle: (overlayers as OverlayGroup).label.angle,
                                        backgroundColor: (overlayers as OverlayGroup).label.backgroundColor,
                                        borderLineColor: (overlayers as OverlayGroup).label.borderLineColor,
                                        borderLineSize: (overlayers as OverlayGroup).label.borderLineSize,
                                        kerning: (overlayers as OverlayGroup).label.kerning,
                                        lineHeight: (overlayers as OverlayGroup).label.lineHeight,
                                        lineWidth: (overlayers as OverlayGroup).label.lineWidth,
                                        rotated: (overlayers as OverlayGroup).label.rotated,
                                        haloColor: (overlayers as OverlayGroup).label.haloColor,
                                        haloSize: (overlayers as OverlayGroup).label.haloSize,
                                        xoffset: (overlayers as OverlayGroup).label.xoffset,
                                        yoffset: (overlayers as OverlayGroup).label.yoffset,
                                        verticalAlignment: (overlayers as OverlayGroup).label.verticalAlignment,
                                        horizontalAlignment: (overlayers as OverlayGroup).label.horizontalAlignment,
                                        font: {
                                            size: (overlayers as OverlayGroup).label.size,
                                            family: "Josefin Slab",
                                            weight: (overlayers as OverlayGroup).label.weight
                                        }
                                    };
                                } else {
                                    labelsymbol = {
                                        type: "label-3d",
                                        symbolLayers: [{
                                            type: "text",
                                            material: { color: (overlayers as OverlayGroup).label.color },
                                            size: (overlayers as OverlayGroup).label.size,
                                            halo: {
                                                color: (overlayers as OverlayGroup).label.haloColor,
                                                size: (overlayers as OverlayGroup).label.haloSize
                                            }
                                        }]
                                    };
                                }
                                const statesLabelClass = new LabelClass({
                                    labelExpressionInfo: {
                                        expression: '$feature.NAME'
                                    },
                                    symbol: labelsymbol,
                                    labelPlacement: (overlayers as OverlayGroup).label.placement,
                                    minScale: (overlayers as OverlayGroup).label.minScale,
                                    maxScale: (overlayers as OverlayGroup).label.maxScale
                                });
                                clientoperateLayer.labelingInfo = [statesLabelClass];
                            } else {
                                labelsymbol = (overlayers as OverlayGroup).label.labelingInfo;
                                clientoperateLayer.labelingInfo = labelsymbol;
                            }
                        }
                    } else if ((overlayers as OverlayGroup).overlaytype.toLowerCase() === 'polygon') {
                        if (!(overlayers as OverlayGroup).renderer) {
                            symbolrenderer = {
                                type: 'unique-value',
                                field: 'style',
                                uniqueValueInfos: []
                            };
                            (overlayers as OverlayGroup).style.forEach((styleelement) => {
                                symbolrenderer.uniqueValueInfos.push({
                                    value: styleelement.style,
                                    label: styleelement.style,
                                    symbol: styleelement.symbol
                                });
                            });
                        } else {
                            symbolrenderer = (overlayers as OverlayGroup).renderer;
                        }
                        const clientoperateLayer = new FeatureLayer({
                            id: this.displayedLayerid,
                            title: this.displayedLayerid,
                            objectIdField: 'objectId',
                            geometryType: 'polygon',
                            renderer: symbolrenderer,
                            // screenSizePerspectiveEnabled: this.view.type === '3d',
                            popupEnabled: false,
                            popupTemplate: false,
                            fields: datafiled,
                            source: [],
                            spatialReference: this.view.spatialReference
                        });
                        if ((overlayers as Overlayerbase).elevationInfo) {
                            clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                        }
                        this.view.map.add(clientoperateLayer);
                        (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                            if ((overelement as Overlayerbase).attributes && (overelement as Polygon).paths) {
                                const dataattributes = (overelement as Overlayerbase).attributes;
                                dataattributes['uuid'] = (overelement as Polygon).uuid;
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
                                const graphic = new Graphic({
                                    geometry: polygon,
                                    attributes: dataattributes
                                });
                                clientoperateLayer.source.add(graphic);
                                this.mapoverlayersflayer.push([(overlayers as OverlayGroup).uuid,
                                    (overelement as Polygon).uuid,
                                    graphic]);
                             }
                        });
                        if ((overlayers as OverlayGroup).label.visible) {
                            let labelsymbol;
                            if (!(overlayers as OverlayGroup).label.labelingInfo) {
                                if (this.view.type === '2d') {
                                    labelsymbol = {
                                        type: (overlayers as OverlayGroup).label.type,
                                        text: (overlayers as OverlayGroup).label.text,
                                        color: (overlayers as OverlayGroup).label.color,
                                        angle: (overlayers as OverlayGroup).label.angle,
                                        backgroundColor: (overlayers as OverlayGroup).label.backgroundColor,
                                        borderLineColor: (overlayers as OverlayGroup).label.borderLineColor,
                                        borderLineSize: (overlayers as OverlayGroup).label.borderLineSize,
                                        kerning: (overlayers as OverlayGroup).label.kerning,
                                        lineHeight: (overlayers as OverlayGroup).label.lineHeight,
                                        lineWidth: (overlayers as OverlayGroup).label.lineWidth,
                                        rotated: (overlayers as OverlayGroup).label.rotated,
                                        haloColor: (overlayers as OverlayGroup).label.haloColor,
                                        haloSize: (overlayers as OverlayGroup).label.haloSize,
                                        xoffset: (overlayers as OverlayGroup).label.xoffset,
                                        yoffset: (overlayers as OverlayGroup).label.yoffset,
                                        verticalAlignment: (overlayers as OverlayGroup).label.verticalAlignment,
                                        horizontalAlignment: (overlayers as OverlayGroup).label.horizontalAlignment,
                                        font: {
                                            size: (overlayers as OverlayGroup).label.size,
                                            family: "Josefin Slab",
                                            weight: (overlayers as OverlayGroup).label.weight
                                        }
                                    };
                                } else {
                                    labelsymbol = {
                                        type: "label-3d",
                                        symbolLayers: [{
                                            type: "text",
                                            material: { color: (overlayers as OverlayGroup).label.color },
                                            size: (overlayers as OverlayGroup).label.size,
                                            halo: {
                                                color: (overlayers as OverlayGroup).label.haloColor,
                                                size: (overlayers as OverlayGroup).label.haloSize
                                            }
                                        }]
                                    };
                                }
                                const statesLabelClass = new LabelClass({
                                    labelExpressionInfo: {
                                        expression: '$feature.NAME'
                                    },
                                    symbol: labelsymbol,
                                    labelPlacement: (overlayers as OverlayGroup).label.placement,
                                    minScale: (overlayers as OverlayGroup).label.minScale,
                                    maxScale: (overlayers as OverlayGroup).label.maxScale
                                });
                                clientoperateLayer.labelingInfo = [statesLabelClass];
                            } else {
                                labelsymbol = (overlayers as OverlayGroup).label.labelingInfo;
                                clientoperateLayer.labelingInfo = labelsymbol;
                            }
                        }
                    }
                } else if (overlayers.type === 'element') {
                     const datafiled = [{
                         name: 'objectId',
                         alias: 'objectId',
                         type: 'oid'
                     }, {
                         name: 'uuid',
                         alias: '唯一标识',
                         type: 'string'
                     }];
                     Object.keys((overlayers as Marker).attributes).forEach((element) => {
                         datafiled.push({
                             name: element,
                             alias: element,
                             type: "string"
                         });
                     });
                     if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'marker') {
                        let markrenderer;
                        if (!(overlayers as Overlayerbase).renderer) {
                            if (this.view.type === '3d') {
                                markrenderer = {
                                    type: "simple",
                                    symbol: {
                                        type: "point-3d",
                                        symbolLayers: [{
                                            type: "icon",
                                            size: (overlayers as Marker).icon.size.width,
                                            resource: {
                                                href: (overlayers as Marker).icon.image
                                            }
                                        }]
                                    }
                                };
                            } else {
                                markrenderer = {
                                    type: "simple",
                                    symbol: {
                                        type: "picture-marker",
                                        url: (overlayers as Marker).icon.image,
                                        width: (overlayers as Marker).icon.size.width,
                                        height: (overlayers as Marker).icon.size.height
                                    }
                                };
                            }
                        } else {
                            markrenderer = (overlayers as Overlayerbase).renderer;
                        }
                        const clientoperateLayer = new FeatureLayer({
                            id: this.displayedLayerid,
                            title: this.displayedLayerid,
                            objectIdField: 'objectId',
                            geometryType: 'point',
                            renderer: markrenderer,
                            screenSizePerspectiveEnabled: true,
                            popupEnabled: false,
                            popupTemplate: false,
                            // elevationInfo: (overlayers as Overlayerbase).elevationInfo,
                            fields: datafiled,
                            source: [],
                            spatialReference: this.view.spatialReference
                        });
                        if ((overlayers as Overlayerbase).elevationInfo) {
                            clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                        }
                        if ((overlayers as Marker).position && (overlayers as Overlayerbase).attributes) {
                           const dataattributes = (overlayers as Overlayerbase).attributes;
                           dataattributes['uuid'] = (overlayers as Marker).uuid;
                           const graphic = new Graphic({
                               geometry: new Point({
                                   x: (overlayers as Marker).position[0],
                                   y: (overlayers as Marker).position[1],
                                   z: (overlayers as Marker).position[2] === undefined ? 0 :
                                       (overlayers as Marker).position[2],
                                   spatialReference: this.view.spatialReference
                               }),
                               attributes: dataattributes
                           });
                           clientoperateLayer.source.add(graphic);
                           this.mapoverlayersflayer.push([(overlayers as Marker).uuid, (overlayers as Marker).uuid,
                               graphic]);
                       }

                        this.view.map.add(clientoperateLayer);
                        if ((overlayers as Marker).label.visible) {
                            let labelsymbol;
                            if (!(overlayers as Marker).label.labelingInfo) {
                                if (this.view.type === '2d') {
                                    labelsymbol = {
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
                                    labelsymbol = {
                                        type: "label-3d",
                                        symbolLayers: [{
                                            type: "text",
                                            material: { color: (overlayers as Marker).label.color },
                                            size: (overlayers as Marker).label.size,
                                            halo: {
                                                color: (overlayers as Marker).label.haloColor,
                                                size: (overlayers as Marker).label.haloSize
                                            }
                                        }]
                                    };
                                }
                                const statesLabelClass = new LabelClass({
                                    labelExpressionInfo: {
                                        expression: '$feature.NAME'
                                    },
                                    symbol: labelsymbol,
                                    labelPlacement: (overlayers as Marker).label.placement,
                                    minScale: (overlayers as Marker).label.minScale,
                                    maxScale: (overlayers as Marker).label.maxScale
                                });
                                clientoperateLayer.labelingInfo = [statesLabelClass];
                            } else {
                                labelsymbol = (overlayers as Marker).label.labelingInfo;
                                clientoperateLayer.labelingInfo = labelsymbol;
                            }
                        }
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'circle') {
                        let circlerenderer;
                        if (!(overlayers as Overlayerbase).renderer) {
                            if ((overlayers as Circle).symboltype === 'simple') {
                                circlerenderer = {
                                    type: "simple",
                                    symbol: {
                                        type: "simple-fill",
                                        color: (overlayers as Circle).fillColor,
                                        style: (overlayers as Circle).style,
                                        outline: {
                                            color: (overlayers as Circle).strokeColor,
                                            width: (overlayers as Circle).strokeWeight,
                                            style: (overlayers as Circle).strokestyle
                                        }
                                    }
                                };
                            } else {
                                circlerenderer = {
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
                            circlerenderer = (overlayers as Overlayerbase).renderer;
                        }
                        const clientoperateLayer = new FeatureLayer({
                             id: this.displayedLayerid,
                             title: this.displayedLayerid,
                             objectIdField: 'objectId',
                             geometryType: 'polygon',
                             renderer: circlerenderer,
                             screenSizePerspectiveEnabled: true,
                             popupEnabled: false,
                             popupTemplate: false,
                             // elevationInfo: (overlayers as Overlayerbase).elevationInfo,
                             fields: datafiled,
                             source: [],
                             spatialReference: this.view.spatialReference
                         });
                        if ((overlayers as Overlayerbase).elevationInfo) {
                             clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                         }
                        if ((overlayers as Circle).center && (overlayers as Circle).radius &&
                          (overlayers as Overlayerbase).attributes) {
                             const dataattributes = (overlayers as Overlayerbase).attributes;
                             dataattributes['uuid'] = (overlayers as Circle).uuid;
                             const graphic = new Graphic({
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
                                attributes: dataattributes
                            });
                             clientoperateLayer.source.add(graphic);
                             this.mapoverlayersflayer.push([(overlayers as Circle).uuid, (overlayers as Circle).uuid,
                                 graphic]);
                         }
                        this.view.map.add(clientoperateLayer);
                        if ((overlayers as Circle).label.visible) {
                             let labelsymbol;
                             if (!(overlayers as Circle).label.labelingInfo) {
                                 if (this.view.type === '2d') {
                                     labelsymbol = {
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
                                     labelsymbol = {
                                         type: "label-3d",
                                         symbolLayers: [{
                                             type: "text",
                                             material: { color: (overlayers as Circle).label.color },
                                             size: (overlayers as Circle).label.size,
                                             halo: {
                                                 color: (overlayers as Circle).label.haloColor,
                                                 size: (overlayers as Circle).label.haloSize
                                             }
                                         }]
                                     };
                                 }
                                 const statesLabelClass = new LabelClass({
                                     labelExpressionInfo: {
                                         expression: '$feature.NAME'
                                     },
                                     symbol: labelsymbol,
                                     labelPlacement: (overlayers as Circle).label.placement,
                                     minScale: (overlayers as Circle).label.minScale,
                                     maxScale: (overlayers as Circle).label.maxScale
                                 });
                                 clientoperateLayer.labelingInfo = [statesLabelClass];
                             } else {
                                 labelsymbol = (overlayers as Circle).label.labelingInfo;
                                 clientoperateLayer.labelingInfo = labelsymbol;
                             }
                         }
                     } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polyline') {
                         let polylinerenderer;
                         if (!(overlayers as Overlayerbase).renderer) {
                             if ((overlayers as Circle).symboltype === 'simple') {
                                 polylinerenderer = {
                                     type: "simple",
                                     symbol: {
                                         type: "simple-line",
                                         color: (overlayers as Polyline).strokeColor,
                                         style: (overlayers as Polyline).style,
                                         width: (overlayers as Polyline).width,
                                         cap: (overlayers as Polyline).cap,
                                         join: (overlayers as Polyline).lineJoin
                                     }
                                 };
                         } else {
                                 polylinerenderer = (overlayers as Overlayerbase).renderer;
                          }
                             const clientoperateLayer = new FeatureLayer({
                                    id: this.displayedLayerid,
                                    title: this.displayedLayerid,
                                    objectIdField: 'objectId',
                                    geometryType: 'polyline',
                                    renderer: polylinerenderer,
                                    screenSizePerspectiveEnabled: true,
                                    popupEnabled: false,
                                    popupTemplate: false,
                                    // elevationInfo: (overlayers as Overlayerbase).elevationInfo,
                                    fields: datafiled,
                                    source: [],
                                    spatialReference: this.view.spatialReference
                         });
                             if ((overlayers as Overlayerbase).elevationInfo) {
                             clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                         }
                             if ((overlayers as Polyline).path &&
                             (overlayers as Overlayerbase).attributes) {
                             const dataattributes = (overlayers as Overlayerbase).attributes;
                             dataattributes['uuid'] = (overlayers as Polyline).uuid;
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
                             const graphic = new Graphic({
                                 geometry: polyline,
                                 attributes: dataattributes
                             });
                             clientoperateLayer.source.add(graphic);
                             this.mapoverlayersflayer.push([(overlayers as Polyline).uuid,
                                (overlayers as Polyline).uuid, graphic]);
                            }
                             this.view.map.add(clientoperateLayer);
                             if ((overlayers as Polyline).label.visible) {
                             let labelsymbol;
                             if (!(overlayers as Polyline).label.labelingInfo) {
                                 if (this.view.type === '2d') {
                                     labelsymbol = {
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
                                     labelsymbol = {
                                         type: "label-3d",
                                         symbolLayers: [{
                                             type: "text",
                                             material: { color: (overlayers as Polyline).label.color },
                                             size: (overlayers as Polyline).label.size,
                                             halo: {
                                                 color: (overlayers as Polyline).label.haloColor,
                                                 size: (overlayers as Polyline).label.haloSize
                                             }
                                         }]
                                     };
                                 }
                                 const statesLabelClass = new LabelClass({
                                     labelExpressionInfo: {
                                         expression: '$feature.NAME'
                                     },
                                     symbol: labelsymbol,
                                     labelPlacement: (overlayers as Polyline).label.placement,
                                     minScale: (overlayers as Polyline).label.minScale,
                                     maxScale: (overlayers as Polyline).label.maxScale
                                 });
                                 clientoperateLayer.labelingInfo = [statesLabelClass];
                             } else {
                                 labelsymbol = (overlayers as Polyline).label.labelingInfo;
                                 clientoperateLayer.labelingInfo = labelsymbol;
                             }
                         }
                     }
                     } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polygon') {
                         let polygonrenderer;
                         if (!(overlayers as Overlayerbase).renderer) {
                             if ((overlayers as Polygon).symboltype === 'simple') {
                                 polygonrenderer = {
                                     type: "simple",
                                     symbol: {
                                         type: "simple-fill",
                                         color: (overlayers as Polygon).fillColor,
                                         style: (overlayers as Polygon).style,
                                         outline: {
                                             color: (overlayers as Polygon).strokeColor,
                                             width: (overlayers as Polygon).strokeWeight,
                                             style: (overlayers as Polygon).strokestyle
                                         }
                                     }
                                 };
                             } else {
                                 polygonrenderer = {
                                     type: "simple",
                                     symbol: {
                                         type: "picture-fill",
                                         url: (overlayers as Polygon).url,
                                         width: (overlayers as Polygon).picwidth,
                                         height: (overlayers as Polygon).picheight,
                                         outline: {
                                             style: (overlayers as Polygon).strokestyle,
                                             color: (overlayers as Polygon).strokeColor,
                                             width: (overlayers as Polygon).strokeWeight
                                         }
                                     }
                                 };
                             }
                         } else {
                             polygonrenderer = (overlayers as Overlayerbase).symbol;
                         }
                         const clientoperateLayer = new FeatureLayer({
                             id: this.displayedLayerid,
                             title: this.displayedLayerid,
                             objectIdField: 'objectId',
                             geometryType: 'polygon',
                             renderer: polygonrenderer,
                             screenSizePerspectiveEnabled: true,
                             popupEnabled: false,
                             popupTemplate: false,
                             // elevationInfo: (overlayers as Overlayerbase).elevationInfo,
                             fields: datafiled,
                             source: [],
                             spatialReference: this.view.spatialReference
                         });
                         if ((overlayers as Overlayerbase).elevationInfo) {
                             clientoperateLayer.elevationInfo = (overlayers as Overlayerbase).elevationInfo;
                         }
                         if ((overlayers as Polygon).paths &&
                             (overlayers as Overlayerbase).attributes) {
                             const dataattributes = (overlayers as Overlayerbase).attributes;
                             dataattributes['uuid'] = (overlayers as Polygon).uuid;
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
                             const graphic = new Graphic({
                                 geometry: polygon,
                                 attributes: dataattributes
                             });
                             clientoperateLayer.source.add(graphic);
                             this.mapoverlayersflayer.push([(overlayers as Polygon).uuid,
                                 (overlayers as Polygon).uuid, graphic]);
                         }
                         this.view.map.add(clientoperateLayer);
                         if ((overlayers as Polygon).label.visible) {
                             let labelsymbol;
                             if (!(overlayers as Polygon).label.labelingInfo) {
                                 if (this.view.type === '2d') {
                                     labelsymbol = {
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
                                     labelsymbol = {
                                         type: "label-3d",
                                         symbolLayers: [{
                                             type: "text",
                                             material: { color: (overlayers as Polygon).label.color },
                                             size: (overlayers as Polygon).label.size,
                                             halo: {
                                                 color: (overlayers as Polygon).label.haloColor,
                                                 size: (overlayers as Polygon).label.haloSize
                                             }
                                         }]
                                     };
                                 }
                                 const statesLabelClass = new LabelClass({
                                     labelExpressionInfo: {
                                         expression: '$feature.NAME'
                                     },
                                     symbol: labelsymbol,
                                     labelPlacement: (overlayers as Polygon).label.placement,
                                     minScale: (overlayers as Polygon).label.minScale,
                                     maxScale: (overlayers as Polygon).label.maxScale
                                 });
                                 clientoperateLayer.labelingInfo = [statesLabelClass];
                             } else {
                                 labelsymbol = (overlayers as Polygon).label.labelingInfo;
                                 clientoperateLayer.labelingInfo = labelsymbol;
                             }
                         }
                     }
              }
            });
    }
    public addfeature(overlayers: Overlayerbase | Overlayerbase[]): void {
        load(['esri/layers/FeatureLayer', 'esri/layers/support/LabelClass', 'esri/Graphic', 'esri/geometry/Point',
            'esri/geometry/Circle', 'esri/symbols/PictureMarkerSymbol', "esri/geometry/Polyline", "esri/geometry/Polygon"
        ])
            // tslint:disable-next-line:variable-name
            .then(([FeatureLayer, LabelClass, Graphic, Point, esriCircle, PictureMarkerSymbol,
                 // tslint:disable-next-line:variable-name
                 ArcGISPolyline, ArcGISPolygon]) => {
                const clientoperateLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!clientoperateLayer) { return; }
                const addfeatures = [];
                if (overlayers instanceof Array) {
                overlayers.forEach((overelement) => {
                    if (overelement.overlaytype.toLowerCase() === 'marker') {
                    const dataattributes = (overelement as Overlayerbase).attributes;
                    dataattributes['uuid'] = (overelement as Overlayerbase).uuid;
                    const graphic = new Graphic({
                        geometry: new Point({
                            x: (overelement as Marker).position[0],
                            y: (overelement as Marker).position[1],
                            z: (overelement as Marker).position[2] === undefined ? 0 :
                                (overelement as Marker).position[2],
                            spatialReference: this.view.spatialReference
                        }),
                        attributes: dataattributes
                    });
                    addfeatures.push(graphic);
                    this.mapoverlayersflayer.push([(overelement as Marker).uuid, (overelement as Marker).uuid,
                        graphic]);
                    } else if (overelement.overlaytype.toLowerCase() === 'circle') {
                        const dataattributes = (overelement as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overelement as Overlayerbase).uuid;
                        const graphic = new Graphic({
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
                            attributes: dataattributes
                        });
                        addfeatures.push(graphic);
                        this.mapoverlayersflayer.push([(overelement as Circle).uuid, (overelement as Circle).uuid,
                            graphic]);
                    } else if (overelement.overlaytype.toLowerCase() === 'polyline') {
                        const dataattributes = (overelement as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overelement as Overlayerbase).uuid;
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
                        const graphic = new Graphic({
                            geometry: polyline,
                            attributes: dataattributes
                        });
                        addfeatures.push(graphic);
                        this.mapoverlayersflayer.push([(overelement as Polyline).uuid, (overelement as Polyline).uuid,
                            graphic]);
                    } else if (overelement.overlaytype.toLowerCase() === 'polygon') {
                        const dataattributes = (overelement as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overelement as Overlayerbase).uuid;
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
                        const graphic = new Graphic({
                            geometry: polygon,
                            attributes: dataattributes
                        });
                        addfeatures.push(graphic);
                        this.mapoverlayersflayer.push([(overelement as Polygon).uuid, (overelement as Polygon).uuid,
                            graphic]);
                    }
                });
                clientoperateLayer.applyEdits({
                     addFeatures: addfeatures
                            // tslint:disable-next-line:no-empty
                        }).then((editsResult) => {
                            // tslint:disable-next-line:no-empty
                            // clientoperateLayer.queryFeatures().then((results) => { });
                        });
            } else {
                    if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'marker') {
                    const dataattributes = (overlayers as Overlayerbase).attributes;
                    dataattributes['uuid'] = (overlayers as Marker).uuid;
                    const graphic = new Graphic({
                        geometry: new Point({
                            x: (overlayers as Marker).position[0],
                            y: (overlayers as Marker).position[1],
                            z: (overlayers as Marker).position[2] === undefined ? 0 :
                                (overlayers as Marker).position[2],
                            spatialReference: this.view.spatialReference
                        }),
                        attributes: dataattributes
                    });
                    addfeatures.push(graphic);
                    this.mapoverlayersflayer.push([(overlayers as Marker).uuid, (overlayers as Marker).uuid,
                         graphic]);
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase()  === 'circle') {
                        const dataattributes = (overlayers as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overlayers as Overlayerbase).uuid;
                        const graphic = new Graphic({
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
                            attributes: dataattributes
                        });
                        addfeatures.push(graphic);
                        this.mapoverlayersflayer.push([(overlayers as Circle).uuid, (overlayers as Circle).uuid,
                            graphic]);
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polyline') {
                        const dataattributes = (overlayers as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overlayers as Overlayerbase).uuid;
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
                        const graphic = new Graphic({
                            geometry: polyline,
                            attributes: dataattributes
                        });
                        addfeatures.push(graphic);
                        this.mapoverlayersflayer.push([(overlayers as Polyline).uuid, (overlayers as Polyline).uuid,
                            graphic]);
                    } else if ((overlayers as Overlayerbase).overlaytype.toLowerCase() === 'polygon') {
                        const dataattributes = (overlayers as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overlayers as Overlayerbase).uuid;
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
                        const graphic = new Graphic({
                            geometry: polygon,
                            attributes: dataattributes
                        });
                        addfeatures.push(graphic);
                        this.mapoverlayersflayer.push([(overlayers as Polygon).uuid, (overlayers as Polygon).uuid,
                            graphic]);
                    }
                    clientoperateLayer.applyEdits({
                        addFeatures: addfeatures
                        // tslint:disable-next-line:no-empty
                    }).then((editsResult) => {
                        // tslint:disable-next-line:no-empty
                        // clientoperateLayer.queryFeatures().then((results) => { });
                    });
            }
     });
    }
    public updatefeature(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup) {
        load(['esri/layers/FeatureLayer', 'esri/layers/support/LabelClass', 'esri/Graphic', 'esri/geometry/Point', 'esri/geometry/Circle', 'esri/symbols/PictureMarkerSymbol',
            "esri/geometry/Polyline", "esri/geometry/Polygon"])
            // tslint:disable-next-line:variable-name
            .then(([FeatureLayer, LabelClass, Graphic, Point, esriCircle, PictureMarkerSymbol,
                 // tslint:disable-next-line:variable-name
                 ArcGISPolyline, ArcGISPolygon]) => {
                const clientoperateLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!clientoperateLayer) { return; }
                const upFeatures = [];
                if (overlayers instanceof Array) {
                    overlayers.forEach((overelement) => {
                        const graphiclist = this.mapoverlayersflayer.filter((item) => {
                            return item[1] === overelement.uuid;
                        });
                        if (graphiclist.length === 1) {
                            // const dataattributes = (overelement as Overlayerbase).attributes;
                            // dataattributes['uuid'] = (overelement as Marker).uuid;
                            if (overelement.overlaytype.toLowerCase() === 'marker') {
                                const point = new Point({
                                    x: (overelement as Marker).position[0],
                                    y: (overelement as Marker).position[1],
                                    z: (overelement as Marker).position[2] === undefined ? 0 :
                                        (overelement as Marker).position[2],
                                    spatialReference: this.view.spatialReference
                                });
                                graphiclist[0][2].geometry = point;
                            } else if (overelement.overlaytype.toLowerCase() === 'circle') {
                                const point = new esriCircle({
                                    center: new Point({
                                        x: (overelement as Circle).center.X,
                                        y: (overelement as Circle).center.Y,
                                        z: (overelement as Circle).center.Z,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    radius: (overelement as Circle).radius,
                                    radiusUnit: (overelement as Circle).radiusUnit,
                                    spatialReference: this.view.spatialReference
                                });
                                graphiclist[0][2].geometry = point;
                            } else if (overelement.overlaytype.toLowerCase() === 'polyline') {
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
                                graphiclist[0][2].geometry = polyline;
                            } else if (overelement.overlaytype.toLowerCase() === 'polygon') {
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
                                graphiclist[0][2].geometry = polygon;
                            }

                            const keys = Object.keys((overelement as Marker).attributes);
                            keys.map((attributeitem) => {
                                if (attributeitem !== 'objectId') {
                                    graphiclist[0][2].setAttribute(attributeitem,
                                        (overelement as Marker).attributes[attributeitem]);
                                }
                            });
                            upFeatures.push(graphiclist[0][2]);
                        }
                    });
                    const flayer = this.view.map.findLayerById(this.displayedLayerid);
                    if (flayer && upFeatures.length) {
                        flayer.applyEdits({
                            updateFeatures: upFeatures
                            // tslint:disable-next-line:no-empty
                        }).then((editsResult) => {
                            // tslint:disable-next-line:no-empty
                            // clientoperateLayer.queryFeatures().then((results) => { });
                            // clientoperateLayer.refresh();
                        }
                        );
                  }
                } else if (overlayers.type === 'group') {
                    (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                        const graphiclist = this.mapoverlayersflayer.filter((item) => {
                            return item[1] === overelement.uuid;
                        });
                        if (graphiclist.length === 1) {
                            // const dataattributes = (overelement as Overlayerbase).attributes;
                            // dataattributes['uuid'] = (overelement as Marker).uuid;
                            if (overelement.overlaytype.toLowerCase() === 'marker') {
                            const point = new Point({
                                x: (overelement as Marker).position[0],
                                y: (overelement as Marker).position[1],
                                z: (overelement as Marker).position[2] === undefined ? 0 :
                                    (overelement as Marker).position[2],
                                spatialReference: this.view.spatialReference
                            });
                            graphiclist[0][2].geometry = point;
                            } else if (overelement.overlaytype.toLowerCase() === 'circle') {
                                const point = new esriCircle({
                                    center: new Point({
                                        x: (overelement as Circle).center.X,
                                        y: (overelement as Circle).center.Y,
                                        z: (overelement as Circle).center.Z,
                                        spatialReference: this.view.spatialReference
                                    }),
                                    radius: (overelement as Circle).radius,
                                    radiusUnit: (overelement as Circle).radiusUnit,
                                    spatialReference: this.view.spatialReference
                                });
                                graphiclist[0][2].geometry = point;
                            } else if (overelement.overlaytype.toLowerCase() === 'polyline') {
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
                                graphiclist[0][2].geometry = polyline;
                            } else if (overelement.overlaytype.toLowerCase() === 'polygon') {
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
                                graphiclist[0][2].geometry = polygon;
                            }
                            const keys = Object.keys((overelement as Marker).attributes);
                            keys.map((attributeitem) => {
                                if (attributeitem !== 'objectId') {
                                    graphiclist[0][2].setAttribute(attributeitem,
                                        (overelement as Marker).attributes[attributeitem]);
                                }
                            });
                            upFeatures.push(graphiclist[0][2]);
                        }
                    });
                    const flayer = this.view.map.findLayerById(this.displayedLayerid);
                    if (flayer && upFeatures.length) {
                        flayer.applyEdits({
                            updateFeatures: upFeatures
                            // tslint:disable-next-line:no-empty
                        }).then((editsResult) => {
                            // tslint:disable-next-line:no-empty
                            // clientoperateLayer.queryFeatures().then((results) => { });
                            // clientoperateLayer.refresh();
                        });
                    }
                } else if (overlayers.type === 'element') {
                    const graphiclist = this.mapoverlayersflayer.filter((item) => {
                        return item[1] === overlayers.uuid;
                    });
                    graphiclist.forEach((item) => {
                        const dataattributes = (overlayers as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overlayers as Marker).uuid;
                        if (overlayers.overlaytype.toLowerCase() === 'marker') {
                        const point = new Point({
                            x: (overlayers as Marker).position[0],
                            y: (overlayers as Marker).position[1],
                            z: (overlayers as Marker).position[2] === undefined ? 0 :
                                (overlayers as Marker).position[2],
                            spatialReference: this.view.spatialReference
                        });
                        item[2].geometry = point;
                        } else if (overlayers.overlaytype.toLowerCase() === 'circle') {
                            const point = new esriCircle({
                                center: new Point({
                                    x: (overlayers as Circle).center.X,
                                    y: (overlayers as Circle).center.Y,
                                    z: (overlayers as Circle).center.Z,
                                    spatialReference: this.view.spatialReference
                                }),
                                radius: (overlayers as Circle).radius,
                                radiusUnit: (overlayers as Circle).radiusUnit,
                                spatialReference: this.view.spatialReference
                            });
                            graphiclist[0][2].geometry = point;
                        } else if (overlayers.overlaytype.toLowerCase() === 'polyline') {
                            const path = [];
                            (overlayers as Polyline).path.forEach((point) => {
                                path.push([point.X, point.Y, point.Z]);
                            });
                            const polyline = new ArcGISPolyline({
                                hasZ: false,
                                hasM: false,
                                paths: path,
                                spatialReference: this.view.spatialReference
                            });
                            graphiclist[0][2].geometry = polyline;
                        } else if (overlayers.overlaytype.toLowerCase() === 'polygon') {
                            const rs = [];
                            (overlayers as Polygon).paths.forEach((point) => {
                                rs.push([point.X, point.Y, point.Z]);
                            });
                            const polygon = new ArcGISPolygon({
                                hasZ: true,
                                hasM: true,
                                rings: rs,
                                spatialReference: this.view.spatialReference
                            });
                            graphiclist[0][2].geometry = polygon;
                        }
                        const keys = Object.keys((overlayers as Marker).attributes);
                        keys.map((attributeitem) => {
                            if (attributeitem !== 'objectId') {
                                item[2].setAttribute(attributeitem, (overlayers as Marker).attributes[attributeitem]);
                            }
                        });
                        upFeatures.push(item[2]);
                        const flayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (flayer && upFeatures.length) {
                            flayer.applyEdits({
                                updateFeatures: upFeatures
                                // tslint:disable-next-line:no-empty
                            }).then((editsResult) => {
                                // tslint:disable-next-line:no-empty
                                // clientoperateLayer.queryFeatures().then((results) => { });
                                // clientoperateLayer.refresh();
                            });
                        }
                    });
                }
            });
    }
    public removefeature(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup): void {
        const clientoperateLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (!clientoperateLayer) { return; }
        if (overlayers instanceof Array) {
            const deletefeatures = [];
            overlayers.forEach((overelemnt) => {
                const graphiclist = this.mapoverlayersflayer.filter((item) => {
                    return item[1] === overelemnt.uuid;
                });
                graphiclist.forEach((item) => {
                    deletefeatures.push(item[2]);
                });
                this.mapoverlayersflayer = this.mapoverlayersflayer.filter((item) => item[1] !==
                    overelemnt.uuid);
            });
            const flayer = this.view.map.findLayerById(this.displayedLayerid);
            if (flayer && deletefeatures.length) {
                flayer.applyEdits({
                    deleteFeatures: deletefeatures
                }).then((editsResult) => {
                    // tslint:disable-next-line:no-empty
                    // flayer.queryFeatures().then((results) => { });
                });
            }
         } else if (overlayers.type === 'group') {
              const graphiclist = this.mapoverlayersflayer.filter((item) => {
                  return item[0] === (overlayers as OverlayGroup).uuid;
              });
              const deletefeatures = [];
              graphiclist.forEach((item) => {
                  deletefeatures.push(item[2]);
              });
              const flayer = this.view.map.findLayerById(this.displayedLayerid);
              if (flayer && deletefeatures.length) {
               flayer.applyEdits({
                    deleteFeatures: deletefeatures
                }).then((editsResult) => {
                    // tslint:disable-next-line:no-empty
                    // flayer.queryFeatures().then((results) => {});
                });
            }
              this.mapoverlayersflayer = this.mapoverlayersflayer.filter((item) => item[0] !== overlayers.uuid);
         } else if (overlayers.type === 'element') {
            const graphiclist = this.mapoverlayersflayer.filter((item) => {
                return item[1] === overlayers.uuid;
            });
            const deletefeatures = [];
            graphiclist.forEach((item) => {
                deletefeatures.push(item[2]);
            });
            const flayer = this.view.map.findLayerById(this.displayedLayerid);
            if (flayer && deletefeatures.length) {
                flayer.applyEdits({
                    deleteFeatures: deletefeatures
                }).then((editsResult) => {
                    // tslint:disable-next-line:no-empty
                    // flayer.queryFeatures().then((results) => { });
                });
            }
            this.mapoverlayersflayer = this.mapoverlayersflayer.filter((item) => item[1] !== overlayers.uuid);
        }
    }
    public removeAll() {
        const rsultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (rsultLayer) {
            const deletefeatures = [];
            this.mapoverlayersflayer.forEach((item) => {
                deletefeatures.push(item[2]);
            });
            rsultLayer.applyEdits ({
                deleteFeatures: deletefeatures
                // tslint:disable-next-line:no-empty
            }).then((editsResult) => {
                // flayer.queryFeatures().then((results) => { });
                 this.mapoverlayersflayer = [];
                 });
        }
    }
    public delete() {
        const boundaryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (boundaryResultLayer) {
            this.view.map.remove(boundaryResultLayer);
            this.mapoverlayersflayer = [];
        }
    }
    public addcluster(clusterConfig: any) {
        const fLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (fLayer) {
            fLayer.featureReduction = clusterConfig;
        }
    }
    public deletecluster() {
        const fLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (fLayer) {
            fLayer.featureReduction = null;
        }
    }
    public show() {
        const fLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (fLayer) {
            fLayer.visible = true;
        }
    }
    public hide() {
        const fLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (fLayer) {
            fLayer.visible = false;
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
                       const  objectid = response.results[0].graphic.attributes.objectId;
                       const query = response.results[0].graphic.layer.createQuery();
                       query.where = "objectId =" + objectid;
                       response.results[0].graphic.layer.queryFeatures(query).then((result) => {
                           if (result.features.length > 0) {
                               this.emit(MapEvent.click, result.features, event, event.mapPoint);
                            }
                        });
                    }
                }
            });
        });

        this.view.on(MapEvent.pointermove, (event) => {
            this.view.hitTest(event).then(async (response) => {
                if (response.results.length > 0) {
                    if (!response.results[0].graphic.layer) {
                        return ;
                    }
                    const layerid = response.results[0].graphic.layer.id;
                    if (!layerid) {return; }
                    if (layerid === this.displayedLayerid) {
                        const objectid = response.results[0].graphic.attributes.objectId;
                        const query = response.results[0].graphic.layer.createQuery();
                        query.where = "objectId =" + objectid;
                        response.results[0].graphic.layer.queryFeatures(query).then((result) => {
                            if (result.features.length > 0) {
                                this.eventResult = result.features;
                                this.emit(MapEvent.pointermove, result.features, event, this.view.toMap({
                                    x: event.x,
                                    y: event.y
                                }));
                            }
                        });
                    }
                } else {
                    if (this.eventResult === null) {
                      return;
                    } else {
                        const result = this.eventResult;
                        this.eventResult = null;
                        this.emit(MapEvent.pointerleave, result, event, this.view.toMap({
                            x: event.x,
                            y: event.y
                        }));
                    }
                }
            });
        });
    }
}
