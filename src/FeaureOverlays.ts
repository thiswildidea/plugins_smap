import Mapcofig from './config/Mapcofig';
import IFlashPointOptions from './interface/IFlashPointOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
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
        load(['esri/layers/FeatureLayer', 'esri/layers/support/LabelClass', 'esri/Graphic', 'esri/geometry/Point', 'esri/symbols/PictureMarkerSymbol'
            ])
            // tslint:disable-next-line:variable-name
            .then(([FeatureLayer, LabelClass, Graphic, Point, PictureMarkerSymbol]) => {
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
                                if (this.view.type === '3d') {
                                    symbolrenderer.uniqueValueInfos.push({
                                        value: styleelement.style,
                                        label: styleelement.style,
                                        symbol: {
                                            type: "point-3d",
                                            symbolLayers: [{
                                                type: "icon",
                                                size: styleelement.size.height,
                                                resource: {
                                                    href: styleelement.url
                                                }
                                            }]
                                        }
                                    });
                                } else {
                                    symbolrenderer.uniqueValueInfos.push({
                                        value: styleelement.style,
                                        label: styleelement.style,
                                        symbol: {
                                            type: "picture-marker",
                                            url: styleelement.url,
                                            width: styleelement.size.height,
                                            height: styleelement.size.height
                                        }
                                    });
                                }
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
                                    attributes: (overelement as Overlayerbase).attributes
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
                    }
                } else if (overlayers.type === 'element') {
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
                    }
                }
            });
    }
    public addfeature(overlayers: Overlayerbase | Overlayerbase[]): void {
        load(['esri/layers/FeatureLayer', 'esri/layers/support/LabelClass', 'esri/Graphic', 'esri/geometry/Point', 'esri/symbols/PictureMarkerSymbol'
        ])
            // tslint:disable-next-line:variable-name
            .then(([FeatureLayer, LabelClass, Graphic, Point, PictureMarkerSymbol]) => {
                const clientoperateLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!clientoperateLayer) { return; }
                if (overlayers instanceof Array) {
                const addfeatures = [];
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
                    clientoperateLayer.applyEdits({
                        addFeatures: [graphic]
                            // tslint:disable-next-line:no-empty
                        }).then((editsResult) => { 
                            // tslint:disable-next-line:no-empty
                            // clientoperateLayer.queryFeatures().then((results) => { });
                        });
                    this.mapoverlayersflayer.push([(overlayers as Marker).uuid, (overlayers as Marker).uuid,
                         graphic]);
                    }
            }
     });
    }
    public updatefeature(overlayers: Overlayerbase | Overlayerbase[] | OverlayGroup) {
        load(['esri/layers/FeatureLayer', 'esri/layers/support/LabelClass', 'esri/Graphic', 'esri/geometry/Point', 'esri/symbols/PictureMarkerSymbol',
            "esri/geometry/Polyline", "esri/geometry/Polygon"])
            // tslint:disable-next-line:variable-name
            .then(([FeatureLayer, LabelClass, Graphic, Point, PictureMarkerSymbol, ArcGISPolyline, ArcGISPolygon]) => {
                const clientoperateLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (!clientoperateLayer) { return; }
                if (overlayers instanceof Array) {
                    const upFeatures = [];
                    overlayers.forEach((overelement) => {
                        const graphiclist = this.mapoverlayersflayer.filter((item) => {
                            return item[1] === overelement.uuid;
                        });
                        if (graphiclist.length === 1) {
                            // const dataattributes = (overelement as Overlayerbase).attributes;
                            // dataattributes['uuid'] = (overelement as Marker).uuid;
                            const point = new Point({
                                x: (overelement as Marker).position[0],
                                y: (overelement as Marker).position[1],
                                z: (overelement as Marker).position[2] === undefined ? 0 :
                                    (overelement as Marker).position[2],
                                spatialReference: this.view.spatialReference
                            });
                            graphiclist[0][2].geometry = point;
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
                    const upFeatures = [];
                    (overlayers as OverlayGroup).overlayers.forEach((overelement) => {
                        const graphiclist = this.mapoverlayersflayer.filter((item) => {
                            return item[1] === overelement.uuid;
                        });
                        if (graphiclist.length === 1) {
                            // const dataattributes = (overelement as Overlayerbase).attributes;
                            // dataattributes['uuid'] = (overelement as Marker).uuid;
                            const point = new Point({
                                x: (overelement as Marker).position[0],
                                y: (overelement as Marker).position[1],
                                z: (overelement as Marker).position[2] === undefined ? 0 :
                                    (overelement as Marker).position[2],
                                spatialReference: this.view.spatialReference
                            });
                            graphiclist[0][2].geometry = point;
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
                        const upFeatures = [];
                        const dataattributes = (overlayers as Overlayerbase).attributes;
                        dataattributes['uuid'] = (overlayers as Marker).uuid;
                        const point = new Point({
                            x: (overlayers as Marker).position[0],
                            y: (overlayers as Marker).position[1],
                            z: (overlayers as Marker).position[2] === undefined ? 0 :
                                (overlayers as Marker).position[2],
                            spatialReference: this.view.spatialReference
                        });
                        item[2].geometry = point;
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
    private async init(view: any) {
        this.displayedLayerid = new Guid().uuid;
        this.view = view;
        this.view.on(MapEvent.click, (event) => {
            this.view.hitTest(event).then(async (response) => {
                if (response.results.length > 0) {
                    const layerid = response.results[0].graphic.layer.id;
                    if (layerid === this.displayedLayerid) {
                       const  objectid = response.results[0].graphic.attributes.objectId;
                       const query = response.results[0].graphic.layer.createQuery();
                       query.where = "objectId =" + objectid;
                       response.results[0].graphic.layer.queryFeatures(query).then((result) => {
                           if (result.features.length > 0) {
                                this.emit(MapEvent.click, result.features, event.mapPoint);
                            }
                        });
                    }
                }
            });
        });

        this.view.on(MapEvent.pointermove, (event) => {
            this.view.hitTest(event).then(async (response) => {
                if (response.results.length > 0) {
                    const layerid = response.results[0].graphic.layer.id;
                    if (layerid === this.displayedLayerid) {
                        const objectid = response.results[0].graphic.attributes.objectId;
                        const query = response.results[0].graphic.layer.createQuery();
                        query.where = "objectId =" + objectid;
                        response.results[0].graphic.layer.queryFeatures(query).then((result) => {
                            if (result.features.length > 0) {
                                this.emit(MapEvent.pointermove, result.features, this.view.toMap({
                                    x: event.x,
                                    y: event.y
                                }));
                            }
                        });
                    }
                }
            });
        });
    }
}
