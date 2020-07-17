import { load } from '../modules';

export async function init3DBaseMaplayers(layers: any[], maptoken: any): Promise<any> {
    const [
         // tslint:disable-next-line:variable-name
        TileLayer
        // // tslint:disable-next-line:variable-name
        // Extent, SHCTiledMapServiceLayer, SceneLayer, TileLayer, MapImageLayer,
        // // tslint:disable-next-line:variable-name
        // GroupLayer, SpatialReference
    ] =
        await load([
            // 'esri/geometry/Extent',
            // 'esri/layers/SHCTiledMapServiceLayer',
            // 'esri/layers/SceneLayer',
            'esri/layers/TileLayer'
            // 'esri/layers/MapImageLayer',
            // 'esri/layers/GroupLayer',
            // 'esri/geometry/SpatialReference'
        ]);
    const layerscollection: any[] = [];
    layers.forEach((item) => {
        switch (item.mapType) {
            // case 'SHCTiledMapServiceLayer':
            //     // eslint-disable-next-line no-case-declarations
            //     const fExtent = new Extent({
            //         xmin: -65000,
            //         ymin: -76000,
            //         xmax: 75000.00000000003,
            //         ymax: 72000.00000000003,
            //         spatialReference: SpatialReference.WebMercator
            //     });
            //     if (parseFloat(item.isToken) === 1) {
            //         return new SHCTiledMapServiceLayer({
            //             url: item.url,
            //             token: maptoken,
            //             fullExtent: fExtent,
            //             opacity: item.opacity,
            //             title: item.layerCName,
            //             id: item.layerEName,
            //             visible: parseFloat(item.isVisible)
            //         });
            //     } else {
            //         return new SHCTiledMapServiceLayer({
            //             url: item.url,
            //             fullExtent: fExtent,
            //             opacity: item.opacity,
            //             title: item.layerCName,
            //             id: item.layerEName,
            //             visible: parseFloat(item.isVisible)
            //         });
            //     }
            case 'TileLayer':
                layerscollection.push(new TileLayer(item.url, {
                        id: item.layerEName,
                        visible: parseFloat(item.isVisible),
                        opacity: item.opacity,
                        // listMode: item.listMode,
                        title: item.layerCName
                })) ;
        }
    });
    return layerscollection;
}
export async function init2DBaseMaplayers(layers: any[], maptoken: any): Promise<any> {
    const [
        // tslint:disable-next-line:variable-name
        TileLayer
        // // tslint:disable-next-line:variable-name
        // Extent, TileLayer, SceneLayer, MapImageLayer,
        // // tslint:disable-next-line:variable-name
        // GroupLayer, SpatialReference
    ] =
        await load([
            // 'esri/geometry/Extent',
            'esri/layers/TileLayer'
            // 'esri/layers/SceneLayer',
            // 'esri/layers/MapImageLayer',
            // 'esri/layers/GroupLayer',
            // 'esri/geometry/SpatialReference'
        ]);
    const layerscollection: any[] = [];
    layers.map((item) => {
        switch (item.mapType) {
            case 'SHCTiledMapServiceLayer':
            // case 'TileLayer':
                layerscollection.push(new TileLayer(item.url, {
                    id: item.layerEName,
                    visible: parseFloat(item.isVisible),
                    opacity: item.opacity,
                    listMode: item.listMode,
                    title: item.layerCName
                }));
        }
    });
    return layerscollection;
}

export async function initiallayers(addlayer: any, layers: any[], maptoken: any, viewMode: any) {
    const [
        // tslint:disable-next-line:variable-name
        Extent, SHCTiledMapServiceLayer, SceneLayer, TileLayer, GraphicsLayer, MapImageLayer,
        // tslint:disable-next-line:variable-name
        GeoJSONLayer, GroupLayer, FeatureLayer, SpatialReference
    ] =
     await load([
         'esri/geometry/Extent',
         'esri/layers/SHCTiledMapServiceLayer',
         'esri/layers/SceneLayer',
         'esri/layers/TileLayer',
         'esri/layers/GraphicsLayer',
         'esri/layers/MapImageLayer',
         'esri/layers/GeoJSONLayer',
         'esri/layers/GroupLayer',
         'esri/layers/FeatureLayer',
         'esri/geometry/SpatialReference'
     ]);
    layers.map((item) => {
        if (item.mapType.trim() === 'GroupLayer') {
            if (viewMode === "3D") {
                const grouplayer = new GroupLayer({
                    id: item.layerEName,
                    title: item.layerCName,
                    visible: parseFloat(item.isVisible),
                    opacity: parseFloat(item.opacity)
                });
                addlayer.add(grouplayer);
                if (item.hasChildren) {
                    initiallayers(grouplayer, item.children, maptoken, viewMode);
                }
            } else {
                if (parseFloat(item.modeType) === 1) {
                    const grouplayer = new GroupLayer({
                        id: item.layerEName,
                        title: item.layerCName,
                        visible: parseFloat(item.isVisible),
                        opacity: parseFloat(item.opacity)
                    });
                    addlayer.add(grouplayer);
                    if (item.hasChildren) {
                        initiallayers(grouplayer, item.children, maptoken, viewMode);
                    }
                }
            }
        } else {
            switch (item.mapType.trim()) {
                case 'SHCTiledMapServiceLayer':
                    if (viewMode === '3D') {
                        // eslint-disable-next-line no-case-declarations
                        const fExtent = new Extent({
                            xmin: -65000,
                            ymin: -76000,
                            xmax: 75000.00000000003,
                            ymax: 72000.00000000003,
                            spatialReference: SpatialReference.WebMercator
                        });
                        if (!parseFloat(item.isToken) === true) {
                            addlayer.add(SHCTiledMapServiceLayer({
                                url: item.url,
                                fullExtent: fExtent,
                                opacity: parseFloat(item.opacity),
                                title: item.layerCName,
                                id: item.layerEName,
                                visible: parseFloat(item.isVisible)
                            }));
                        } else {
                            addlayer.add(SHCTiledMapServiceLayer({
                                url: item.url,
                                token: maptoken,
                                fullExtent: fExtent,
                                opacity: parseFloat(item.opacity),
                                title: item.layerCName,
                                id: item.layerEName,
                                visible: parseFloat(item.isVisible)
                            }));
                        }
                    } else {
                        addlayer.add(TileLayer({
                            url: item.url,
                            id: item.layerEName,
                            visible: parseFloat(item.isVisible),
                            opacity: parseFloat(item.opacity),
                            listMode: item.listMode,
                            title: item.layerCName
                        }));
                    }
                    break;
                case 'MapImageLayer':
                    // eslint-disable-next-line no-case-declarations
                    addlayer.add(new MapImageLayer({
                        url: item.url,
                        opacity: parseFloat(item.opacity),
                        title: item.layerCName,
                        id: item.layerEName,
                        visible: parseFloat(item.isVisible)
                    }));
                    break;
                case 'SceneLayer':
                    // eslint-disable-next-line no-case-declarations
                    const scenelayer = new SceneLayer({
                        url: item.url,
                        opacity: parseFloat(item.opacity),
                        title: item.layerCName,
                        id: item.layerEName,
                        visible: parseFloat(item.isVisible)
                    });
                    if (item.renderer) {
                        const srender = JSON.parse(item.renderer);
                        scenelayer.renderer = srender;
                    }
                    if (item.popuptemplate) {
                        const popuptemplate = JSON.parse(item.popuptemplate);
                        scenelayer.popupTemplate = popuptemplate;
                    }
                    if (item.definitionExpress) {
                        scenelayer.definitionExpression = item.definitionExpress;
                    }
                    if (item.elevationInfo) {
                        const eInfo = JSON.parse(item.elevationInfo);
                        scenelayer.elevationInfo = eInfo;
                    }
                    if (item.maxScale) {
                        scenelayer.maxScale = item.maxScale;
                    }
                    if (item.minScale) {
                        scenelayer.minScale = item.minScale;
                    }
                    addlayer.add(scenelayer);
                    break;
                case 'GraphicsLayer':
                    // eslint-disable-next-line no-case-declarations
                    const graphicsLayer = new GraphicsLayer({
                        opacity: parseFloat(item.opacity),
                        title: item.layerCName,
                        id: item.layerEName,
                        visible: parseFloat(item.isVisible)
                    });
                    addlayer.add(graphicsLayer);
                    break;
                case 'GeoJSONLayer':
                    // eslint-disable-next-line no-case-declarations
                    const geogJSONLayer = new GeoJSONLayer({
                        url: item.url,
                        opacity: parseFloat(item.opacity),
                        title: item.layerCName,
                        id: item.layerEName,
                        visible: parseFloat(item.isVisible)
                    });
                    addlayer.add(geogJSONLayer);
                    break;
                case 'FeatureLayer':
                    // eslint-disable-next-line no-case-declarations
                    const featureLayer = new FeatureLayer({
                        url: item.url,
                        opacity: parseFloat(item.opacity),
                        title: item.layerCName,
                        id: item.layerEName,
                        visible: parseFloat(item.isVisible)
                    });
                    if (item.renderer) {
                        const srender = JSON.parse(item.renderer);
                        featureLayer.renderer = srender;
                    }
                    if (item.popuptemplate) {
                        const popuptemplate = JSON.parse(item.popuptemplate);
                        featureLayer.popupTemplate = popuptemplate;
                    }
                    if (item.definitionExpress) {
                        featureLayer.definitionExpression = item.definitionExpress;
                    }
                    if (item.elevationInfo) {
                        featureLayer.elevationInfo = JSON.parse(item.elevationInfo);
                    }
                    if (item.maxScale) {
                        featureLayer.maxScale = item.maxScale;
                    }
                    if (item.maxScale) {
                        featureLayer.minScale = item.minScale;
                    }
                    addlayer.add(featureLayer);
                    break;
             }
        }
    });
}
