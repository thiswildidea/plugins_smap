import Mapcofig from './config/Mapcofig';
import IBoundaryOptions from './interface/IBoundaryOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class Boundary extends EventEmitter {
    public displayedLayerid: any = "";
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }

    public add(boundaryOptions: IBoundaryOptions= {}) {
        load(["esri/layers/GraphicsLayer", "esri/Graphic", "esri/layers/FeatureLayer"])
            // tslint:disable-next-line:variable-name
            .then(([GraphicsLayer, Graphic, FeatureLayer]) => {
                if (!this.view) { return; }
                let layer = null;
                if (boundaryOptions.boundaryType) {
                      layer = this.view.map.findLayerById(boundaryOptions.boundaryType);
                }
                if (!layer) {
                    if (boundaryOptions.url) {
                        layer = new FeatureLayer({
                            url: boundaryOptions.url,
                            id: boundaryOptions.boundaryType,
                            title: boundaryOptions.boundaryType,
                            visible: false
                        });
                        this.view.map.add(layer);
                    }
                }
                if (!layer) { return; }
                const boundaryqueryParams = layer.createQuery();
                boundaryqueryParams.where = boundaryOptions.boundaryDefinition;
                layer.queryFeatures(boundaryqueryParams).then((response) => {
                    if (response.features.length > 0) {
                        let boundaryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
                        if (typeof (boundaryResultLayer) === 'undefined') {
                            boundaryResultLayer = new GraphicsLayer({
                                title: this.displayedLayerid + '边界',
                                id: this.displayedLayerid,
                                listMode: 'hide'
                            });
                            this.view.map.add(boundaryResultLayer);
                        }
                        let polygonSymbol;
                        if (boundaryOptions.symbol !== undefined) {
                            polygonSymbol = boundaryOptions.symbol;
                        } else {
                            polygonSymbol = {
                                type: "simple-fill",
                                color: [255, 255, 255, 0],
                                outline: {
                                    color: [255, 255, 0, 1],
                                    width: "5px"
                                }
                            };
                        }
                        response.features.map((feature) => {
                            const animateGraphic = new Graphic({
                                geometry: feature.geometry,
                                symbol: polygonSymbol,
                                attributes: feature.attributes
                            });
                            boundaryResultLayer.add(animateGraphic);
                        });
                    }
                });
            })
            .catch((err) => {
                console.error(err);
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
        this.view.on(MapEvent.click,  (event) => {
            this.view.hitTest(event).then(async  (response) => {
                if (response.results.length > 0) {
                    const layerid = response.results[0].graphic.layer.id;
                    if (layerid === this.displayedLayerid) {
                        this.emit(MapEvent.click, response.results[0].graphic, event.mapPoint);
                    }
                }
            });
     });

        this.view.on(MapEvent.pointermove, (event) => {
            this.view.hitTest(event).then(async (response) => {
                if (response.results.length > 0) {
                    const layerid = response.results[0].graphic.layer.id;
                    if (layerid === this.displayedLayerid) {
                        this.emit(MapEvent.pointermove, response.results[0].graphic, event.mapPoint);
                    }
                }
            });
        });
    }
}
