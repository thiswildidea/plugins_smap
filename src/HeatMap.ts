import Mapcofig from './config/Mapcofig';
import IHeatmapOptions from './interface/IHeatmapOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
export default class HeatMap extends EventEmitter {
    public displayedLayerid: any = "";
    private view: any = null;
    private heatmaplayer: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }

    public add(heatmapOptions: IHeatmapOptions) {
        load(['82B44794-5CE0-A64A-9047F07CAF08BD2C/78C93084-B4AB-AC1B-88B95BAC7D872846/734A3D86-CF65-FC97-E8B7B8A0197A043B'])
            // tslint:disable-next-line:variable-name
            .then(([HeatMapLayer]) => {
                const config = {
                    container: document.getElementById(heatmapOptions.container),
                    radius: heatmapOptions.radius || 30,
                    maxOpacity: heatmapOptions.maxOpacity || 0.8,
                    minOpacity: heatmapOptions.minOpacity || 0,
                    blur: heatmapOptions.blur || .7,
                    gradient: heatmapOptions.gradient || {
                        0: "rgb(0,0,0)",
                        0.3: "rgb(0,0,255)",
                        0.8: "rgb(0,255,0)",
                        0.98: "rgb(255,255,0)",
                        1: "rgb(255,0,0)"
                    }
                };
                this.heatmaplayer = new HeatMapLayer(
                    this.view,
                    config,
                    heatmapOptions.datas,
                    heatmapOptions.h337,
                    heatmapOptions.id
                );
                this.heatmaplayer.addData();
            });
    }
    public remove(heatmapid: string) {
        const parent = document.getElementsByClassName("esri-view-surface")[0];
        const box = document.getElementById(heatmapid);
        if (box != null) {
            parent.removeChild(box);
        }
    }
    public refreshdata(datas: any) {
        this.heatmaplayer.setVisible(true);
        this.heatmaplayer.freshenLayerData(datas);

    }
    public show() {
        this.heatmaplayer.setVisible(true);
    }
    public hide() {
        this.heatmaplayer.setVisible(false);
    }
    private async init(view: any) {
        this.displayedLayerid = new Guid().uuid;
        this.view = view;
    }
}
