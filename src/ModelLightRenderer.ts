import Mapcofig from './config/Mapcofig';
import IRipplewallOptions from './interface/IRipplewallOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class ModelLightRenderer extends EventEmitter {
    public modelLightRenderer: any = null;
    private view: any = null;
    private modelrender: any = null;
    constructor(view: any) {
        super();
        this.init(view);
    }
    private init(view: any) {
        this.view = view;
        load(["esri/layers/FeatureLayer"])
            // tslint:disable-next-line:variable-name
            .then(([FeatureLayer]) => {
                const basemapid = this.view.map.basemap.id;
                const modelname = this.view.map.basemap.id === 'basemap_zw' ? 'model_white_zw' : 'model_white_as';
                const modellayer = this.view.map.findLayerById(modelname);
                if (modellayer) {
                    this.modelrender = modellayer.renderer;
                }
                this.view.on(MapEvent.click, (event) => {
                    this.view.hitTest(event).then(async (response) => {
                        if (response.results.length > 0) {
                            if (!response.results[0].graphic.layer) {
                                return;
                            }
                            const selectmodelid = response.results[0].graphic.attributes.objectid_12;
                            const modelQuery = response.results[0].graphic.layer.createQuery();
                            modelQuery.outFields = ['*'];
                            modelQuery.where = "objectid_12 =" + selectmodelid;
                            this.view.map.findLayerById(modelname).opacity = 0.3;
                            response.results[0].graphic.layer.queryFeatures(modelQuery).then((modelresult) => {
                                if (modelresult.features.length > 0) {
                                    // const filtermodellayer = this.view.map.findLayerById(modelname);
                                    // if (filtermodellayer) {
                                    //     filtermodellayer.definitionExpression =
                                    //      'guid not in' + modelresult.features[0];
                                    // }
                                    this.emit(MapEvent.click, modelresult.features[0], event);
                                    // const modelguid = modelresult.features[0].attributes;
                                    // const featurelayer = new FeatureLayer({
                                    //     id: new Guid().uuid,
                                    //     url: response.results[0].graphic.layer.url
                                    //         .substring(0, response.results[0].graphic.layer.url.
                                    //         indexOf('SceneServer')) + 'FeatureServer'
                                    // });
                                    // const lyerquery = featurelayer.createQuery();
                                    // lyerquery.where = "objectid_12 =" + selectmodelid;
                                    // featurelayer.queryFeatures(lyerquery).then((res) => {
                                    //     if (res.features.length > 0) {
                                    //         this.emit(MapEvent.click, modelresult.features[0], modelguid, event);
                                    //     }
                                    // });
                                }
                            });
                        } else {
                            const layer = this.view.map.findLayerById(modelname);
                            if (layer) {
                                layer.opacity = 1;
                                layer.renderer = this.modelrender;
                                // layer.definitionExpression = '1=1';
                            }
                            this.emit(MapEvent.click, null, event);
                        }
                    });
         });
        });
    }
}
