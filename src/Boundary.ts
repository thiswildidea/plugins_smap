import Mapcofig from './config/Mapcofig';
import IBoundaryOptions from './interface/IBoundaryOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
export default class Boundary extends EventEmitter {
    private view: any = null;
    private displayedLayerid: any = "";
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
                                symbol: polygonSymbol
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
    }
}
