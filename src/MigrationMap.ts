import Mapcofig from './config/Mapcofig';
import IMigrationMapOptions from './interface/IMigrationMapOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import utils from './utils/index';
export default class MigrationMap extends EventEmitter {
    private view: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(mgrationMapOptions: IMigrationMapOptions= {}) {
        load(['esri/layers/echartsLayer'])
            // tslint:disable-next-line:no-shadowed-variable
            .then(([echartsLayer]) => {
            //  this.loadAPIScript('echartsgl', Mapcofig.jsapi + '/extensions/echarts/echarts-gl.js').then(() => {
            //  this.loadAPIScript('echartsmin', Mapcofig.jsapi + '/extensions/echarts/echarts.min.js').then(() => {
                     const eseries = [];
                     mgrationMapOptions.datas.forEach((item, i) => {
                         eseries.push({
                             name: item[0] + ' Top10',
                             type: 'lines',
                             coordinateSystem: 'arcgis',
                             zlevel: 1,
                             effect: {
                                 show: true,
                                 period: 6,
                                 trailLength: 0.7,
                                 color: '#fff',
                                 symbolSize: 3
                             },
                             lineStyle: {
                                 normal: {
                                     color: mgrationMapOptions.color[i],
                                     width: 0,
                                     curveness: 0.2
                                 }
                             },
                             data: this.convertData(item[1], mgrationMapOptions.geoCoordMap)
                         }, {
                             name: item[0] + ' Top10',
                             type: 'lines',
                             coordinateSystem: 'arcgis',
                             zlevel: 2,
                             symbol: ['none', 'arrow'],
                             symbolSize: 10,
                             effect: {
                                 show: true,
                                 period: 6,
                                 trailLength: 0,
                                 symbol: mgrationMapOptions.planePath,
                                 symbolSize: 15
                             },
                             lineStyle: {
                                 normal: {
                                     color: mgrationMapOptions.color[i],
                                     width: 1,
                                     opacity: 0.6,
                                     curveness: 0.2
                                 }
                             },
                             data: this.convertData(item[1], mgrationMapOptions.geoCoordMap)
                         }, {
                             name: item[0] + ' Top10',
                             type: 'effectScatter',
                             coordinateSystem: 'arcgis',
                             zlevel: 2,
                             rippleEffect: {
                                 brushType: 'stroke'
                             },
                             legendHoverLink: true,
                             hoverAnimation: true,
                             symbol: mgrationMapOptions.symbol,
                             label: {
                                 normal: {
                                     show: true,
                                     position: 'right',
                                     formatter: '{b}'
                                 }
                             },
                             symbolSize: (val) => {
                                 return val[2] / 8;
                             },
                             itemStyle: {
                                 normal: {
                                     color: mgrationMapOptions.color[i],
                                     shadowBlur: 10,
                                     shadowColor: '#333'
                                 }
                             },
                             data: item[1].map((dataItem) => {
                                 return {
                                     name: dataItem[1].name,
                                     value: mgrationMapOptions.geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
                                 };
                             })
                         });
                     });
                     const chart = new echartsLayer(this.view, "", mgrationMapOptions.id);
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
                     chart.setChartOption(option);
             });
        //     });
        //   });
      }
    public remove(echartid: any) {
        const parent = document.getElementsByClassName("esri-view-surface")[0];
        const box = document.getElementById(echartid);
        if (box != null) {
            parent.removeChild(box);
        }
    }
    private convertData(data: any, geoCoordMap) {
    const res = [];
    for (const value of data) {
        const dataItem = value;
        const fromCoord = geoCoordMap[dataItem[0].name];
        const toCoord = geoCoordMap[dataItem[1].name];
        if (fromCoord && toCoord) {
            res.push({
                fromName: dataItem[0].name,
                toName: dataItem[1].name,
                coords: [fromCoord, toCoord],
                value: dataItem[1].value
            });
        }
    }
    return res;
}
    private getAPIScript(name: string) {
        return document.querySelector('script[' + name + ']') as HTMLScriptElement;
   }
    private loadAPIScript(name: string, url: string): Promise<HTMLScriptElement> {
        return new utils.Promise((resolve, reject) => {
            let script = this.getAPIScript(name);
            if (script) {
                const src = script.getAttribute('src');
                if (src !== url) {
                    reject(new Error(`The echartgl is already loaded (${src}).`));
                } else {
                    this.handleScriptLoad(script, resolve, reject);
                }
            } else {
                script = this.createScript(name, url);
                this.handleScriptLoad(script, () => {
                        script.setAttribute(name, 'loaded');
                        resolve(script);
                    }, reject);
                document.head.appendChild(script);
            }
        });
    }
    private createScript(name, url) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.setAttribute(name, 'loading');
      return script;
    }
    private handleScriptLoad(script, callback, errback?) {
      let onScriptError;
      if (errback) {
          onScriptError = this.handleScriptError(script, errback);
      }
      const onScriptLoad = () => {
          callback(script);
          script.removeEventListener('load', onScriptLoad, false);
          if (onScriptError) {
              script.removeEventListener('error', onScriptError, false);
          }
      };
      script.addEventListener('load', onScriptLoad, false);
   }
    private handleScriptError(script, callback) {
    const onScriptError = (e) => {
        callback(e.error || new Error(`There was an error attempting to load ${script.src}`));
        script.removeEventListener('error', onScriptError, false);
    };
    script.addEventListener('error', onScriptError, false);
    return onScriptError;
    }
    private async init(view: any) {
        this.view = view;
    }
}
