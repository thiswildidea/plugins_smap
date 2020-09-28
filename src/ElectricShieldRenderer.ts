import Mapcofig from './config/Mapcofig';
import IElectricShieldOptions from './interface/IElectricShieldOptions';
import EventEmitter from './mod';
import {
    load
} from './modules';
import Guid from './utils/Guid';
import MapEvent from './utils/MapEvent';
export default class ElectricShieldRenderer extends EventEmitter {
    public electricShieldOptionsRenderer: any = null;
    private view: any = null;
    private fragmentShaderSource: any = `
                #if __VERSION__ == 100
                 #extension GL_OES_standard_derivatives : enable
                #endif
                uniform vec3 color;
                uniform float opacity;
                uniform float time;
                varying vec2 vUv;
                #define pi 3.1415926535
                #define PI2RAD 0.01745329252
                #define TWO_PI (2. * PI)
                float rands(float p){
                    return fract(sin(p) * 10000.0);
                }
                float noise(vec2 p){
                    float t = time / 20000.0;
                    if(t > 1.0) t -= floor(t);
                    return rands(p.x * 14. + p.y * sin(t) * 0.5);
                }
                vec2 sw(vec2 p){
                    return vec2(floor(p.x), floor(p.y));
                }
                vec2 se(vec2 p){
                    return vec2(ceil(p.x), floor(p.y));
                }
                vec2 nw(vec2 p){
                    return vec2(floor(p.x), ceil(p.y));
                }
                vec2 ne(vec2 p){
                    return vec2(ceil(p.x), ceil(p.y));
                }
                float smoothNoise(vec2 p){
                    vec2 inter = smoothstep(0.0, 1.0, fract(p));
                    float s = mix(noise(sw(p)), noise(se(p)), inter.x);
                    float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
                    return mix(s, n, inter.y);
                }
                float fbm(vec2 p){
                    float z = 2.0;
                    float rz = 0.0;
                    vec2 bp = p;
                    for(float i = 1.0; i < 6.0; i++){
                    rz += abs((smoothNoise(p) - 0.5)* 2.0) / z;
                    z *= 2.0;
                    p *= 2.0;
                    }
                    return rz;
                }
                void main() {
                    vec2 uv = vUv;
                    vec2 uv2 = vUv;
                    if (uv.y < 0.5) {
                    discard;
                    }
                    uv *= 4.;
                    float rz = fbm(uv);
                    uv /= exp(mod(time * 2.0, pi));
                    rz *= pow(15., 0.9);
                    gl_FragColor = mix(vec4(color, opacity) / rz, vec4(color, 0.1), 0.2);
                    if (uv2.x < 0.05) {
                    gl_FragColor = mix(vec4(color, 0.1), gl_FragColor, uv2.x / 0.05);
                    }
                    if (uv2.x > 0.95){
                    gl_FragColor = mix(gl_FragColor, vec4(color, 0.1), (uv2.x - 0.95) / 0.05);
                    }
                }`;
    constructor(view: any) {
        super();
        this.init(view);
    }
    public add(electricShieldOptions: IElectricShieldOptions) {
        load(["82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/FC5376C9-9F1D-905F-3BCD66C6DF4ED973", "esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([electricShieldRenderer, externalRenderers]) => {
                electricShieldOptions.options.fragmentShaderSource = this.fragmentShaderSource;
                this.electricShieldOptionsRenderer = new electricShieldRenderer(this.view,
                    electricShieldOptions.points, electricShieldOptions.options);
                externalRenderers.add(this.view, this.electricShieldOptionsRenderer);
            })
            .catch((err) => {
                console.error(err);
            });
    }
    public remove() {
        load(["esri/views/3d/externalRenderers"])
            // tslint:disable-next-line:variable-name
            .then(([externalRenderers]) => {
                if (!this.electricShieldOptionsRenderer) { return; }
                externalRenderers.remove(this.view, this.electricShieldOptionsRenderer);
            });
    }

    public setMaterialColor(color: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setMaterialColor(color);
    }
    public setwireframe() {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setwireframe();
    }
    public setaltitude(altitude: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setaltitude(altitude);
    }

    public setscaleZ(scaleZ: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setscaleZ(scaleZ);
    }
    public setopacity(opacity: any) {
        if (!this.electricShieldOptionsRenderer) { return; }
        this.electricShieldOptionsRenderer.setopacity(opacity);
    }
    private async init(view: any) {
        this.view = view;
    }
}
