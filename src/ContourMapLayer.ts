import Mapcofig from './config/Mapcofig';
import IContourMapOptions from './interface/IContourMapOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';

// 未使用
export default class ContourMapLayer extends EventEmitter {
    public contourMapLayerRendererArray: Array<[string, any]> = []; // 渲染
    private contourMapLayerRenderer: any = null; // 渲染
    private mode: any = "mesh";
    private slice: number = 0;
    private stack: number = 0;
    private config: {};
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }

    public add(heatmapOptions: IContourMapOptions) {
        load(['82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/Mesh',
            '82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/Extrusion', "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([Mesh, Extrusion, externalRenderers]) => {
                const cconfig = heatmapOptions.config;
                cconfig.data = heatmapOptions.datas;
                this.mode = heatmapOptions.mode;
                cconfig.mode = this.mode;
                cconfig.slice = this.slice;
                cconfig.stack = this.stack;

                if (this.mode === 'mesh') {
                    cconfig.height = 1E3;
                    this.contourMapLayerRenderer = new Mesh(this.view, cconfig);
                } else {
                    cconfig.height = 3E3;
                    this.contourMapLayerRenderer = new Extrusion(this.view, cconfig);
                }
                externalRenderers.add(this.view, this.contourMapLayerRenderer);
        });
    }
    public remove(heatmapid: string) {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                externalRenderers.remove(this.view, this.contourMapLayerRenderer);
            });
    }
    private  init(view: any) {
        this.view = view;
    }
}
