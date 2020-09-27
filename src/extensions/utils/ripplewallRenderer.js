define([
    'dojo/_base/declare',
    "esri/geometry/geometryEngine",
    "esri/geometry/Extent",
    "esri/views/3d/externalRenderers",
    "esri/geometry/Polygon",
    "esri/geometry/Point",
    "esri/geometry/support/webMercatorUtils"
], function (
    declare,
    geometryEngine,
    Extent,
    externalRenderers,
    Polygon,
    Point,
    webMercatorUtils
) {
    var THREE = window.THREE;
    var ripplewallRenderer = declare([], {
        constructor: function (view, polygon, options) {
            this.view = view;
            this.radius = 6378137;
            const OPTIONS = {
                altitude: 0,
                speed: 0.015,
                height: 10
            }
            this.options = this.extend({}, OPTIONS, options, {
                polygon: polygon
            });

            this.vertexs = {
                normal_vertex: "\n  precision lowp float;\n  precision lowp int;\n  ".concat(THREE.ShaderChunk.fog_pars_vertex, "\n  varying vec2 vUv;\n  void main() {\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    ").concat(THREE.ShaderChunk.fog_vertex, "\n  }\n"),
            }
            this.fragments = {
                rippleWall_fragment: "\n  precision lowp float;\n  precision lowp int;\n  uniform float time;\n  uniform float opacity;\n  uniform vec3 color;\n  uniform float num;\n  uniform float hiz;\n\n  varying vec2 vUv;\n\n  void main() {\n    vec4 fragColor = vec4(0.);\n    float sin = sin((vUv.y - time * hiz) * 10. * num);\n    float high = 0.92;\n    float medium = 0.4;\n    if (sin > high) {\n      fragColor = vec4(mix(vec3(.8, 1., 1.), color, (1. - sin) / (1. - high)), 1.);\n    } else if(sin > medium) {\n      fragColor = vec4(color, mix(1., 0., 1.-(sin - medium) / (high - medium)));\n    } else {\n      fragColor = vec4(color, 0.);\n    }\n\n    vec3 fade = mix(color, vec3(0., 0., 0.), vUv.y);\n    fragColor = mix(fragColor, vec4(fade, 1.), 0.85);\n    gl_FragColor = vec4(fragColor.rgb, fragColor.a * opacity * (1. - vUv.y));\n  }\n",
            }
            this._resolutions = [270.93387520108377, 135.46693760054188, 67.73346880027094, 33.86673440013547, 16.933367200067735,
                8.466683600033868, 4.233341800016934, 2.116670900008467, 1.0583354500042335, 0.5291677250021167, 0.26458386250105836, 0.13229193125052918
            ]
        },

        setup: function (context) {
            this.renderer = new THREE.WebGLRenderer({
                context: context.gl, // 可用于将渲染器附加到已有的渲染环境(RenderingContext)中
                premultipliedAlpha: false, // renderer是否假设颜色有 premultiplied alpha. 默认为true
            });
            this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
            this.renderer.setViewport(0, 0, this.view.width, this.view.height); // 视口大小设置

            // Make sure it does not clear anything before rendering
            this.renderer.autoClear = false;
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearColor = false;
            this.renderer.autoClearStencil = false;

            // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
            // We have to inject this bit of code into the three.js runtime in order for it to bind those
            // buffers instead of the default ones.
            var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (target) {
                originalSetRenderTarget(target);
                if (target == null) {
                    context.bindRenderTarget();
                }
            };
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera();

            const axesHelper = new THREE.AxesHelper(0);
            this.scene.add(axesHelper);
            this._setupScene(context);


        },
        _setupScene: function (context) {
            var scope = this;
            scope.material = new THREE.ShaderMaterial({
                uniforms: {
                    time: {
                        type: "pv2",
                        value: 0
                    },
                    color: {
                        type: "uvs",
                        value: new THREE.Color(scope.options.color)
                    },
                    opacity: {
                        type: "pv2",
                        value: 0.3
                    },
                    num: {
                        type: "pv2",
                        value: 5
                    },
                    hiz: {
                        type: "pv2",
                        value: 0.15
                    }
                },
                vertexShader: scope.vertexs.normal_vertex,
                fragmentShader: scope.fragments.rippleWall_fragment,
                blending: THREE.AdditiveBlending,
                transparent: !0,
                depthWrite: !1,
                depthTest: !0,
                wireframe: scope.options.wireframe === undefined ? false : scope.options.wireframe,
                side: THREE.DoubleSide
            });


            const polygon = new Polygon({
                hasZ: true,
                hasM: true,
                rings: [scope.options.polygon],
                spatialReference: {
                    wkid: 102100
                }
            });
            const center = polygon.extent.center;

            // const height = scope.distanceToVector3(scope.options.height, scope.options.height).x;
            const height = scope.options.height;
            const centerPt = scope.coordinateToVector3([center[0], center[1]]);
            // const wall = scope.options.polygon.splice(0, scope.options.polygon.length - 1)
            const wall = scope.options.polygon;
            const positionsV = [];
            let joinLonLat = [];
            wall.forEach(xy => {
                const polyPice = scope.coordinateToVector3([xy[0], xy[1]]).sub(centerPt);
                positionsV.push(polyPice);
                joinLonLat.push(polyPice.x);
                joinLonLat.push(polyPice.y);
            });
            for (var a = joinLonLat, polySub = [], o = 0, s = 0; o < a.length - 2; o += 2, s++)
                0 === o ?
                polySub[0] = Math.sqrt((a[2] - a[0]) * (a[2] - a[0]) + (a[3] - a[1]) * (a[3] - a[1])) :
                polySub[s] = polySub[s - 1] + Math.sqrt((a[o + 2] - a[o]) * (a[o + 2] - a[o]) + (a[o + 3] - a[o + 1]) * (a[o + 3] - a[o + 1]));
            let pos = [],
                uvs = [];
            let polylenth = polySub[polySub.length - 1];
            for (let d = 0, u = pos.length, p = uvs.length; d < positionsV.length - 1; d++) {
                let pv1 = positionsV[d],
                    pv2 = positionsV[d + 1],
                    polyPice = polySub[d];
                pos[u++] = pv1.x,
                    pos[u++] = pv1.y,
                    pos[u++] = 0,
                    uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth,
                    uvs[p++] = 0,
                    pos[u++] = pv2.x,
                    pos[u++] = pv2.y,
                    pos[u++] = 0,
                    uvs[p++] = polyPice / polylenth,
                    uvs[p++] = 0,
                    pos[u++] = pv1.x,
                    pos[u++] = pv1.y,
                    pos[u++] = height,
                    uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth,
                    uvs[p++] = 1,
                    pos[u++] = pv1.x,
                    pos[u++] = pv1.y,
                    pos[u++] = height,
                    uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth,
                    uvs[p++] = 1,
                    pos[u++] = pv2.x,
                    pos[u++] = pv2.y,
                    pos[u++] = 0,
                    uvs[p++] = polyPice / polylenth,
                    uvs[p++] = 0,
                    pos[u++] = pv2.x,
                    pos[u++] = pv2.y,
                    pos[u++] = height,
                    uvs[p++] = polyPice / polylenth,
                    uvs[p++] = 1
            }
            var geometry = new THREE.BufferGeometry;
            geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
            geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
            scope.object3d = new THREE.Mesh(geometry, scope.material);

            scope.scene.add(scope.object3d);

            // const z = scope.distanceToVector3(scope.options.altitude, scope.options.altitude).x;
            const position = scope.coordinateToVector3([center.x, center.y], scope.options.altitude);
            scope.object3d.position.copy(position);
            context.resetWebGLState();
        },

        setMaterialColor: function (rgb) {
            if (!this.object3d) { return }
            this.object3d.material.uniforms.color.value=rgb;
        },
        setwireframe: function () {
            if (!this.object3d) { return }
            this.object3d.material.wireframe = !this.object3d.material.wireframe;
        },
        setopacity: function (opacity) {
            if (!this.object3d) { return }
            this.object3d.material.opacity = opacity;
        },
        setaltitude: function (altitude) {
            if (!this.object3d) { return }
            this.object3d.position.z = altitude;
        },

        setscaleZ: function (scaleZ) {
            if (!this.object3d) { return }
            this.object3d.scale.z = scaleZ;
        },

        distanceToVector3: function (w, h, coord) {
            const zoom = 6;
            const centerlonlat = webMercatorUtils.xyToLngLat(this.view.center.x, this.view.center.y);
            const target = this._locate(centerlonlat, w, h);
            const p0 = this.coordinateToPoint(centerlonlat, zoom),
                p1 = this.coordinateToPoint(target, zoom);
            const x = Math.abs(p1.x - p0.x) * this.sign(w);
            const y = Math.abs(p1.y - p0.y) * this.sign(h);
            return new THREE.Vector3(x, y, 0);

        },
        toRadian: function (d) {
            const pi = Math.PI / 180;
            return d * pi;
        },
        coordinateToPoint: function (center, zoom, out) {
            const COORD = new Point({
                x: 0,
                y: 0,
                spatialReference: {
                    wkid: 4326
                }
            });
            const prjCoord = this.project(center, COORD);
            return this._prjToPoint(prjCoord, zoom, out);
        },

        _prjToPoint: function (pCoord, zoom, out) {

            return this.transform(pCoord, this._getResolution(zoom), out);
        },

        _getResolution: function (zoom) {
            if ((zoom === undefined || zoom === this.view.zoom) && this.view.resolution !== undefined) {
                return this.view.resolution;
            } else if (zoom === 6 && this.view.resolution !== undefined) {
                return this.view.resolution;
            }
            if (isNil(zoom)) {
                zoom = this.view.zoom;
            }
            return this.getResolution(zoom);
        },

        getResolution(zoom) {
            let z = (zoom | 0);
            if (z < 0) {
                z = 0;
            } else if (z > this._resolutions.length - 1) {
                z = this._resolutions.length - 1;
            }
            const res = this._resolutions[z];
            if (z !== zoom && zoom > 0 && z < this._resolutions.length - 1) {
                const next = this._resolutions[z + 1];
                return res + (next - res) * (zoom - z);
            }
            return res;
        },

        transform: function (coordinates, scale, out) {
            const x = this.matrix[0] * (coordinates.x - this.matrix[2]) / scale;
            const y = -this.matrix[1] * (coordinates.y - this.matrix[3]) / scale;
            if (out) {
                out.x = x;
                out.y = y;
                return out;
            }
            return new Point({
                x: x,
                y: y,
                spatialReference: {
                    wkid: 102100
                }
            });
        },
        project: function (lnglat, out) {
            const rad = this.rad,
                metersPerDegree = this.metersPerDegree,
                max = this.maxLatitude;
            const lng = lnglat.x,
                lat = Math.max(Math.min(max, lnglat.y), -max);
            let c;
            if (lat === 0) {
                c = 0;
            } else {
                c = Math.log(Math.tan((90 + lat) * rad / 2)) / rad;
            }
            const x = lng * metersPerDegree;
            const y = c * metersPerDegree;
            if (out) {
                out.x = x;
                out.y = y;
                return out;
            }
            return new Point({
                x: x,
                y: y,
                spatialReference: {
                    wkid: 102100
                }
            });
        },
        wrap: function (n, min, max) {
            if (n === max || n === min) {
                return n;
            }
            const d = max - min;
            const w = ((n - min) % d + d) % d + min;
            return w;
        },
        _locate: function (c, xDist, yDist) {
            var scope = this;
            if (!c) {
                return null;
            }
            if (!xDist) {
                xDist = 0;
            }
            if (!yDist) {
                yDist = 0;
            }
            if (!xDist && !yDist) {
                return c;
            }
            let x, y;
            let ry = scope.toRadian(c.y);
            if (yDist !== 0) {
                const dy = Math.abs(yDist);
                const sy = Math.sin(dy / (2 * scope.radius)) * 2;
                ry = ry + sy * (yDist > 0 ? 1 : -1);
                y = scope.wrap(ry * 180 / Math.PI, -90, 90);
            } else {
                y = c.y;
            }
            if (xDist !== 0) {
                // distance per degree
                const dx = Math.abs(xDist);
                let rx = scope.toRadian(c.x);
                const sx = 2 * Math.sqrt(Math.pow(Math.sin(dx / (2 * scope.radius)), 2) / Math.pow(Math.cos(ry), 2));
                rx = rx + sx * (xDist > 0 ? 1 : -1);
                x = scope.wrap(rx * 180 / Math.PI, -180, 180);
            } else {
                x = c.x;
            }
            c.x = x;
            c.y = y;
            return c;
        },

        sign: function (x) {
            if (Math.sign) {
                return Math.sign(x);
            }
            x = +x; // convert to a number
            if (x === 0 || isNaN(x)) {
                return Number(x);
            }
            return x > 0 ? 1 : -1;
        },


        addAttribute: function (bufferGeomertry, key, value) {
            bufferGeomertry.setAttribute(key, value);
            return bufferGeomertry;
        },
        coordinateToVector3: function (coord, z=0) {

            const p = coord;
            let transform = new THREE.Matrix4();
            let transformation = new Array(16);
            // const z = point.z === undefined ? 0 : point.z
            transform.fromArray(
                externalRenderers.renderCoordinateTransformAt(
                    this.view,
                    [p[0], p[1], z],
                    this.view.spatialReference,
                    transformation
                )
            );
            let vector3 = new THREE.Vector3(
                transform.elements[12],
                transform.elements[13],
                transform.elements[14]
            );
            return vector3;
        },
        extend: function (dest) { // (Object[, Object, ...]) ->
            for (let i = 1; i < arguments.length; i++) {
                const src = arguments[i];
                for (const k in src) {
                    dest[k] = src[k];
                }
            }
            return dest;
        },

        render: function (context) {

            const cam = context.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(
                new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
            );

            this.object3d.material.uniforms.time.value += this.options.speed;
            // this.material.uniforms.opacity.value+=0.05
            // this.material.uniforms.hiz.value += 0.05
            // this.material.uniforms.time.value = 4000
            // this.material.uniforms.num.value += 10
            
            // if (this.material.uniforms.opacity.value>=1){
            //     this.material.uniforms.opacity.value=0
            // }
            // if (this.material.uniforms.hiz.value >= 1) {
            //     this.material.uniforms.hiz.value = 0
            // }
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            externalRenderers.requestRender(this.view);
            context.resetWebGLState();
        }
    });
    return ripplewallRenderer;
});