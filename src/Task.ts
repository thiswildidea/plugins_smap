import Mapcofig from './config/Mapcofig';
import IQueryOptions from './interface/IQueryOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import utils from './utils/index';
export default class Task extends EventEmitter {
    private view: any = null;
    private displayedLayerid: any = "";
    constructor(view: any) {
        super();
        this.init(view);
    }

    public  async query<T extends any = any>(boundaryOptions: IQueryOptions = {}): Promise<T> {
        // tslint:disable-next-line:variable-name
        // const [GraphicsLayer, Graphic] = await load([
        //     'esri/Graphic',
        //     'esri/layers/GraphicsLayer'
        // ]);
        let result = null;
        await load(["esri/layers/GraphicsLayer", "esri/Graphic"])
            // tslint:disable-next-line:variable-name
            .then(async ([GraphicsLayer, Graphic]) => {
        if (!boundaryOptions.LayerID) { return; }
        if (!this.view) { return; }
        const layer = this.view.map.findLayerById(boundaryOptions.LayerID);
        if (!layer) { return; }
        const boundaryqueryParams = layer.createQuery();
        boundaryqueryParams.where = boundaryOptions.queryDefinition;
        await layer.queryFeatures(boundaryqueryParams).then((response) => {
            if (response.features.length > 0) {
                let boundaryLayer = this.view.map.findLayerById(this.displayedLayerid);
                if (typeof (boundaryLayer) === 'undefined') {
                    boundaryLayer = new GraphicsLayer({
                        title: this.displayedLayerid + '查询结果',
                        id: this.displayedLayerid,
                        listMode: 'hide'
                    });
                    this.view.map.add(boundaryLayer);
                }
                if (!boundaryOptions.displayed) {
                let polygonSymbol;
                if (boundaryOptions.symbol) {
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
                result = response;
            }
        });
      });
        return new utils.Promise((resolve, reject) => {
            resolve(result as T);
        });
    }
    public remove() {
        const queryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (queryResultLayer) {
            this.view.map.remove(queryResultLayer);
        }
    }

    public show() {
        const queryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (queryResultLayer) {
            queryResultLayer.visible = true;
        }
    }
    public hide() {
        const queryResultLayer = this.view.map.findLayerById(this.displayedLayerid);
        if (queryResultLayer) {
            queryResultLayer.visible = false;
        }
    }
    private async init(view: any) {
        this.displayedLayerid = new Guid().uuid;
        this.view = view;
    }
}
