import Mapcofig from './config/Mapcofig';
import ITrajectoryPlusOptions from './interface/ITrajectoryPlusOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
export default class TrajectoryPlus extends EventEmitter {
    private view: any = null;
    private mapRoamplayinternal: any = null;
    private routelayerid: any = "";
    private mobilelayerid: any = "";
    constructor(view: any) {
        super();
        this.init(view);
    }

    public play(playbackoption: ITrajectoryPlusOptions= {}) {
        load(['esri/geometry/Point', 'esri/Graphic', "esri/layers/GraphicsLayer", 'esri/geometry/support/webMercatorUtils'])
            // tslint:disable-next-line:no-shadowed-variable
            .then(([point, graphic, graphicsLayer, webMercatorUtils]) => {
                if (playbackoption.coords === undefined) {  return;  }
                let trajectorycount = 0;
                let currentCoordIndex = 0;
                let prevLocation = this.view.center;
                if (typeof (this.mapRoamplayinternal) !== 'undefined') {
                    clearInterval(this.mapRoamplayinternal);
                }
                const timespan = playbackoption.duration !== undefined ? playbackoption.duration : 2000;
                const speed = playbackoption.speedFactor !== undefined ? playbackoption.speedFactor : 1;
                this.mapRoamplayinternal = setInterval(() => {
                    const xyz = {
                        x: playbackoption.coords[currentCoordIndex].x,
                        y: playbackoption.coords[currentCoordIndex].y,
                        z: playbackoption.coords[currentCoordIndex].z !== undefined ?
                         playbackoption.coords[currentCoordIndex].z : 0
                    };
                    currentCoordIndex = (currentCoordIndex + 1) % playbackoption.coords.length;
                    ++trajectorycount;
                    const location = new point({
                        x: xyz.x,
                        y: xyz.y,
                        z: xyz.z,
                        spatialReference: this.view.spatialReference
                    });
                    let mobileLayer = this.view.map.findLayerById(this.mobilelayerid);
                    if (typeof (mobileLayer) === 'undefined') {
                        mobileLayer = new graphicsLayer({
                            title: '漫游路径' + this.mobilelayerid,
                            id: this.mobilelayerid,
                            listMode: 'hide'
                        });
                        this.view.map.add(mobileLayer);
                    }
                    mobileLayer.removeAll();
                    const animateGraphic = new graphic({
                        geometry: location,
                        symbol: playbackoption.mobilesymbol
                    });
                    mobileLayer.add(animateGraphic);
                    if (trajectorycount > 1) {
                        if (playbackoption.showtrail) {
                            this.createAnimateRoute(location, prevLocation, playbackoption.trailsymbol);
                        }
                    }
                    this.view.goTo({
                        center: location,
                        tilt: 70,
                        scale: 2500,
                        heading: 360 - this.getHeading(location, prevLocation), // only applies to SceneView
                        rotation: 360 - this.getHeading(location, prevLocation) // only applies to MapView
                    }, {
                        speedFactor: speed,
                        duration: timespan - timespan * 0.2,
                        maxDuration: timespan - timespan * 0.2,
                        easing: "in-out-coast-quadratic"
                    }).then()
                    .catch((error) => {
                        if (error.name !== "AbortError") {
                            console.error(error);
                        }
                    });
                    prevLocation = location.clone();
                    if (trajectorycount === playbackoption.coords.length) {
                        clearInterval(this.mapRoamplayinternal);
                    }
                }, timespan);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        if (typeof (this.mapRoamplayinternal) !== undefined) {
            clearInterval(this.mapRoamplayinternal);
            const animateRouteLayer = this.view.map.findLayerById(this.routelayerid);
            if (animateRouteLayer) {
                this.view.map.remove(animateRouteLayer);
            }
            const mobilelayer = this.view.map.findLayerById(this.mobilelayerid);
            if (mobilelayer) {
                this.view.map.remove(mobilelayer);
            }
        }
    }
    private getHeading(point, oldPoint) {
    const angleInDegrees =
        (Math.atan2(point.y - oldPoint.y, point.x - oldPoint.x) * 180) /
        Math.PI;
    return -90 + angleInDegrees;
    }
    private createAnimateRoute(point, oldPoint, trailsymbol) {
        load(['esri/Graphic', "esri/layers/GraphicsLayer"])
            // tslint:disable-next-line:no-shadowed-variable
            // tslint:disable-next-line:variable-name
            .then(([Graphic, GraphicsLayer]) => {
                const animateLine = {
                    type: 'polyline',
                    paths: [
                        [oldPoint.x, oldPoint.y, oldPoint.z],
                        [point.x, point.y, point.z]
                    ],
                    spatialReference: this.view.spatialReference
                };
                let polylineSymbol;
                if (trailsymbol !== undefined) {
                    polylineSymbol = trailsymbol;
                } else {
                    polylineSymbol = {
                        type: 'simple-line',
                        color: [156, 39, 176],
                        width: 10
                    };
                }
                const animateGraphic = new Graphic({
                    geometry: animateLine,
                    symbol: polylineSymbol
                });
                let animateRouteLayer = this.view.map.findLayerById(this.routelayerid);
                if (typeof (animateRouteLayer) === 'undefined') {
                    animateRouteLayer = new GraphicsLayer({
                        title: '漫游路径' + this.routelayerid,
                        id: this.routelayerid,
                        listMode: 'hide'
                    });
                    this.view.map.add(animateRouteLayer);
                }
                animateRouteLayer.add(animateGraphic);
        });
    }
    private async init(view: any) {
        this.routelayerid = new Guid().uuid;
        this.mobilelayerid = new Guid().uuid;
        this.view = view;
    }
}
