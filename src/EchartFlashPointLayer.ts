import Mapcofig from './config/Mapcofig';
import IEchartFlashPointOptions from './interface/IEchartFlashPointOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import utils from './utils/index';
import MapEvent from './utils/MapEvent';
export default class EchartFlashPointLayer extends EventEmitter {
    public displayedLayerid: any = "";
    private view: any = null;
    private datas: any[] = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(echartFlashPointOptions: IEchartFlashPointOptions) {
        load(["smiapi/utils/599EFB79-18C9-DC0A-E2C9FC2F2316C660"])
            // tslint:disable-next-line:no-shadowed-variable
            .then(([echartsLayer]) => {
                const parent = document.getElementsByClassName("esri-view-surface")[0];
                const box = document.getElementById(this.displayedLayerid);
                if (box !== null) {
                    parent.removeChild(box);
                }
                const eseries = [];
                this.datas = echartFlashPointOptions.datas;
                echartFlashPointOptions.datas.forEach((item, i) => {
                    eseries.push({
                        name: 'Top10',
                        type: 'effectScatter',
                        coordinateSystem: 'arcgis',
                        zlevel: 2,
                        showEffectOn: 'render',
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        legendHoverLink: true,
                        hoverAnimation: true,
                        symbol: item.symbol == null || item.symbol === undefined ? 'diamond' : item.symbol,
                        cursor: "pointer",
                        label: {
                            normal: {
                                show: true,
                                position: item.labelposition == null || item.labelposition === undefined
                                 ? 'right' : item.labelposition,
                                formatter: '{b}'
                            }
                        },
                        tooltip: {
                            padding: 10,
                            backgroundColor: '#222',
                            borderColor: '#777',
                            borderWidth: 1
                        },
                        symbolSize:  (val) => {
                            return val[2] / 8;
                        },
                        itemStyle: {
                            normal: {
                                color: item.color,
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: item.name,
                            value: [item.x, item.y].concat([item.value])
                        }]

                    });
                });

                const option = {
                    title: {
                        text: '',
                        subtext: '',
                        left: 'center',
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: eseries
                };
                const chart = new echartsLayer(this.view, "", this.displayedLayerid);
                chart.setChartOption(option);
         });

      }
    public update(echartFlashPointOptions: IEchartFlashPointOptions) {
        load(["smiapi/utils/599EFB79-18C9-DC0A-E2C9FC2F2316C660"])
            // tslint:disable-next-line:no-shadowed-variable
            .then(([echartsLayer]) => {
                const parent = document.getElementsByClassName("esri-view-surface")[0];
                const box = document.getElementById(this.displayedLayerid);
                if (box !== null) {
                    parent.removeChild(box);
                }
                const eseries = [];
                this.datas = echartFlashPointOptions.datas;
                echartFlashPointOptions.datas.forEach((item, i) => {
                    eseries.push({
                        name: 'Top10',
                        type: 'effectScatter',
                        coordinateSystem: 'arcgis',
                        zlevel: 2,
                        showEffectOn: 'render',
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        legendHoverLink: true,
                        hoverAnimation: true,
                        symbol: item.symbol == null || item.symbol === undefined ? 'diamond' : item.symbol,
                        cursor: "pointer",
                        label: {
                            normal: {
                                show: true,
                                position: item.labelposition == null || item.labelposition === undefined
                                    ? 'right' : item.labelposition,
                                formatter: '{b}'
                            }
                        },
                        tooltip: {
                            padding: 10,
                            backgroundColor: '#222',
                            borderColor: '#777',
                            borderWidth: 1
                        },
                        symbolSize: (val) => {
                            return val[2] / 8;
                        },
                        itemStyle: {
                            normal: {
                                color: item.color,
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: [{
                            name: item.name,
                            value: [item.x, item.y].concat([item.value])
                        }]

                    });
                });

                const option = {
                    title: {
                        text: '',
                        subtext: '',
                        left: 'center',
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: eseries
                };
                const chart = new echartsLayer(this.view, "", this.displayedLayerid);
                chart.setChartOption(option);
            });

    }
    public delete() {
        const parent = document.getElementsByClassName("esri-view-surface")[0];
        const box = document.getElementById(this.displayedLayerid);
        if (box !== null) {
            parent.removeChild(box);
        }
    }
    private async init(view: any) {
        this.view = view;
        this.displayedLayerid = new Guid().uuid;
        load(['esri/geometry/Point', "esri/geometry/SpatialReference", "esri/geometry/support/webMercatorUtils"])
            // tslint:disable-next-line:no-shadowed-variable
            // tslint:disable-next-line:variable-name
            .then(([Point, SpatialReference, webMercatorUtils]) => {
                this.view.on(MapEvent.click, (event) => {
                    if (!this.datas.length) {
                        return;
                    } else {
                        const distances = this.datas.map((point) => {
                            const pointorigin = new Point({
                                x: point.x,
                                y: point.y,
                                spatialReference: SpatialReference.WebMercator
                            });
                            const graphicPoint = this.view.toScreen(pointorigin);
                            return Math.sqrt(
                                (graphicPoint.x - event.x) * (graphicPoint.x - event.x) +
                                (graphicPoint.y - event.y) * (graphicPoint.y - event.y)
                            );
                        });

                        let minIndex = 0;
                        distances.forEach((distance, i) => {
                            if (distance < distances[minIndex]) {
                                minIndex = i;
                            }
                        });
                        const minDistance = distances[minIndex];
                        if (minDistance > 35) {
                            return;
                        } else {
                            this.emit(MapEvent.click, this.datas[minIndex], event.mapPoint);
                        }
                    }
                });
                this.view.on(MapEvent.doubleclick, (event) => {
                    if (!this.datas.length) {
                        return;
                    } else {
                        const distances = this.datas.map((point) => {
                            const pointorigin = new Point({
                                x: point.x,
                                y: point.y,
                                spatialReference: SpatialReference.WebMercator
                            });
                            const graphicPoint = this.view.toScreen(pointorigin);
                            return Math.sqrt(
                                (graphicPoint.x - event.x) * (graphicPoint.x - event.x) +
                                (graphicPoint.y - event.y) * (graphicPoint.y - event.y)
                            );
                        });

                        let minIndex = 0;
                        distances.forEach((distance, i) => {
                            if (distance < distances[minIndex]) {
                                minIndex = i;
                            }
                        });
                        const minDistance = distances[minIndex];
                        if (minDistance > 35) {
                            return;
                        } else {
                            this.emit(MapEvent.doubleclick, this.datas[minIndex], event.mapPoint);
                        }
                    }
                });
                this.view.on(MapEvent.pointermove, (event) => {
                    this.view.hitTest(event).then(async (response) => {
                        if (response.results.length > 0) {
                            const layerid = response.results[0].graphic.layer.id;
                            if (layerid === this.displayedLayerid) {
                                if (!this.datas.length) {
                                    return;
                                } else {
                                    const distances = this.datas.map((point) => {
                                        const pointorigin = new Point({
                                            x: point.x,
                                            y: point.y,
                                            spatialReference: SpatialReference.WebMercator
                                        });
                                        const graphicPoint = this.view.toScreen(pointorigin);
                                        return Math.sqrt(
                                            (graphicPoint.x - event.x) * (graphicPoint.x - event.x) +
                                            (graphicPoint.y - event.y) * (graphicPoint.y - event.y)
                                        );
                                    });

                                    let minIndex = 0;
                                    distances.forEach((distance, i) => {
                                        if (distance < distances[minIndex]) {
                                            minIndex = i;
                                        }
                                    });
                                    const minDistance = distances[minIndex];
                                    if (minDistance > 35) {
                                        return;
                                    } else {
                                        this.emit(MapEvent.pointermove, this.datas[minIndex], this.view.toMap({
                                            x: event.x,
                                            y: event.y
                                        }));
                                    }
                                }

                            }
                        }
                    });
                });
            });

    }
}
