import Mapcofig from './config/Mapcofig';
import IBoundaryOptions from './interface/IBoundaryOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
export default class Boundary extends EventEmitter {
    private view: any = null;
    private boundarylayerid: any = "";
    constructor(view: any) {
        super();
        this.init(view);
    }

    public add(boundaryOptions: IBoundaryOptions= {}) {
        load(["esri/layers/GraphicsLayer", "esri/Graphic"])
            // tslint:disable-next-line:variable-name
            .then(([GraphicsLayer, Graphic]) => {
                if (!boundaryOptions.boundaryType) {return; }
                if (!this.view) { return; }
                const layer = this.view.map.findLayerById(boundaryOptions.boundaryType);
                if (!layer) { return; }
                const boundaryqueryParams = layer.createQuery();
                boundaryqueryParams.where = boundaryOptions.boundaryDefinition;
                layer.queryFeatures(boundaryqueryParams).then((response) => {
                    if (response.features.length > 0) {
                        let boundaryLayer = this.view.map.findLayerById(this.boundarylayerid);
                        if (typeof (boundaryLayer) === 'undefined') {
                            boundaryLayer = new GraphicsLayer({
                                title: this.boundarylayerid,
                                id: this.boundarylayerid,
                                listMode: 'hide'
                            });
                            this.view.map.add(boundaryLayer);
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
                                symbol: polygonSymbol
                            });
                            boundaryLayer.add(animateGraphic);
                        });
                    }
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        const boundaryLayer = this.view.map.findLayerById(this.boundarylayerid);
        if (boundaryLayer) {
            this.view.map.remove(boundaryLayer);
        }
    }
    public show() {
        const boundaryLayer = this.view.map.findLayerById(this.boundarylayerid);
        if (boundaryLayer) {
            boundaryLayer.visible = true;
        }
    }
    public hide() {
        const boundaryLayer = this.view.map.findLayerById(this.boundarylayerid);
        if (boundaryLayer) {
            boundaryLayer.visible = false;
        }
    }
    private async init(view: any) {
        this.boundarylayerid = new Guid().uuid;
        this.view = view;
    }
}
