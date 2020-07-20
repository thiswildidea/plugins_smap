import Mapcofig from './config/Mapcofig';
import ITrajectoryOptions from './interface/ITrajectoryOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
export default class Trajectory extends EventEmitter {
    private map: any = null;
    private routepalybackinternal: any = null;
    private routelayerid: any = "";
    private track: any = null;
    constructor(map: any) {
        super();
        this.init(map);
    }

    public play(playbackoption: ITrajectoryOptions= {}) {
        load(['geolocate', "esri/widgets/Track", 'esri/geometry/support/webMercatorUtils'])
            // tslint:disable-next-line:no-shadowed-variable
            .then(([geolocate, track, webMercatorUtils]) => {
                if (playbackoption.coords === undefined) {  return;  }
                let trajectorycount = 0;
                this.track = new track({
                    view: this.map,
                    goToLocationEnabled: false
                });
                // this.map.ui.add(this.track , "bottom-left");
                let currentCoordIndex = 0;
                geolocate.use();
                if (typeof (this.routepalybackinternal) !== 'undefined') {
                    clearInterval(this.routepalybackinternal);
                }
                this.routepalybackinternal = setInterval(() => {
                    const lngLatArr = webMercatorUtils.xyToLngLat(playbackoption.coords[currentCoordIndex].x,
                        playbackoption.coords[currentCoordIndex].y);
                    const lngLatObj = {
                        lng: lngLatArr[0],
                        lat: lngLatArr[1]
                    };
                    geolocate.change(lngLatObj);
                    currentCoordIndex = (currentCoordIndex + 1) % playbackoption.coords.length;
                    ++trajectorycount;
                    if (trajectorycount === playbackoption.coords.length) {
                        clearInterval(this.routepalybackinternal);
                    }
                }, 2500);
                this.map.when(() => {
                let prevLocation = this.map.center;
                this.track.on("track", () => {
                    if (playbackoption.mobilesymbol) {
                        this.track.graphic.symbol = playbackoption.mobilesymbol;
                    }
                    const location = this.track.graphic.geometry;
                    if (trajectorycount > 1) {
                        if (playbackoption.showtrail) {
                        this.createAnimateRoute(location, prevLocation, playbackoption.trailsymbol);
                        }
                    }
                    this.map.goTo({
                            center: location,
                            tilt: 70,
                            scale: 2500,
                            heading: 360 - this.getHeading(location, prevLocation), // only applies to SceneView
                            rotation: 360 - this.getHeading(location, prevLocation) // only applies to MapView
                        })
                        .catch((error) => {
                            if (error.name !== "AbortError") {
                                console.error(error);
                            }
                        });
                    prevLocation = location.clone();
                });
                this.track.start();
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        if (typeof (this.routepalybackinternal) !== undefined) {
            clearInterval(this.routepalybackinternal);
            this.track.destroy();
            const animateRouteLayer = this.map.map.findLayerById(this.routelayerid);
            if (animateRouteLayer) {
                this.map.map.remove(animateRouteLayer);
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
                        [oldPoint.longitude, oldPoint.latitude],
                        [point.longitude, point.latitude]
                    ]
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
                let animateRouteLayer = this.map.map.findLayerById(this.routelayerid);
                if (typeof (animateRouteLayer) === 'undefined') {
                    animateRouteLayer = new GraphicsLayer({
                        title: '路径轨迹播放',
                        id: this.routelayerid,
                        listMode: 'hide'
                    });
                    this.map.map.add(animateRouteLayer);
                }
                animateRouteLayer.add(animateGraphic);
        });
    }
    private async init(map: any) {
        this.routelayerid = new Guid().uuid;
        this.map = map;
    }
}
