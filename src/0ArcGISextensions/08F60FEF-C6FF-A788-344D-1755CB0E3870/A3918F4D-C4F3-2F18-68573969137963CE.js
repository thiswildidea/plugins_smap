;
define(['dojo/_base/declare', "esri/geometry/geometryEngine", "esri/geometry/Extent", "esri/views/3d/externalRenderers", "esri/geometry/Polygon", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils"], function (f, g, j, l, m, q, r) {
    var t = window.THREE;
    var v = f([], {
        constructor: function (a, b, c) {
            this.view = a;
            this.radius = 6378137;
            const OPTIONS = {
                altitude: 0,
                speed: 0.015,
                height: 10
            }
            this.options = this.extend({}, OPTIONS, c, {
                points: b
            });
            this.vertexs = {
                normal_vertex: "\n  precision lowp float;\n  precision lowp int;\n  ".concat(t.ShaderChunk.fog_pars_vertex, "\n  varying vec2 vUv;\n  void main() {\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    ").concat(t.ShaderChunk.fog_vertex, "\n  }\n"),
            }
            this.fragments = {
                rippleWall_fragment: "\n  precision lowp float;\n  precision lowp int;\n  uniform float time;\n  uniform float opacity;\n  uniform vec3 color;\n  uniform float num;\n  uniform float hiz;\n\n  varying vec2 vUv;\n\n  void main() {\n    vec4 fragColor = vec4(0.);\n    float sin = sin((vUv.y - time * hiz) * 10. * num);\n    float high = 0.92;\n    float medium = 0.4;\n    if (sin > high) {\n      fragColor = vec4(mix(vec3(.8, 1., 1.), color, (1. - sin) / (1. - high)), 1.);\n    } else if(sin > medium) {\n      fragColor = vec4(color, mix(1., 0., 1.-(sin - medium) / (high - medium)));\n    } else {\n      fragColor = vec4(color, 0.);\n    }\n\n    vec3 fade = mix(color, vec3(0., 0., 0.), vUv.y);\n    fragColor = mix(fragColor, vec4(fade, 1.), 0.85);\n    gl_FragColor = vec4(fragColor.rgb, fragColor.a * opacity * (1. - vUv.y));\n  }\n",
            }
            this._resolutions = [270.93387520108377, 135.46693760054188, 67.73346880027094, 33.86673440013547, 16.933367200067735, 8.466683600033868, 4.233341800016934, 2.116670900008467, 1.0583354500042335, 0.5291677250021167, 0.26458386250105836, 0.13229193125052918]
        },
        setup: function (b) {
            this.renderer = new t.WebGLRenderer({
                context: b.gl,
                premultipliedAlpha: false,
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setViewport(0, 0, this.view.width, this.view.height);
            this.renderer.autoClear = false;
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearColor = false;
            this.renderer.autoClearStencil = false;
            var c = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (a) {
                c(a);
                if (a == null) {
                    b.bindRenderTarget()
                }
            };
            this.scene = new t.Scene();
            this.camera = new t.PerspectiveCamera();
            const axesHelper = new t.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            this.scene.add(axesHelper);
            this._setupScene(b)
        },
        _setupScene: function (b) {
            var c = this;
            c.material = new t.ShaderMaterial({
                uniforms: {
                    time: {
                        type: "pv2",
                        value: 0
                    },
                    color: {
                        type: "uvs",
                        value: new t.Color(c.options.color)
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
                vertexShader: c.vertexs.normal_vertex,
                fragmentShader: c.fragments.rippleWall_fragment,
                blending: t.AdditiveBlending,
                transparent: !0,
                depthWrite: !1,
                depthTest: !0,
                wireframe: c.options.wireframe === undefined ? false : c.options.wireframe,
                side: t.DoubleSide
            });
            const height = c.options.height;
            const wall = c.options.points;
            const positionsV = [];
            let joinLonLat = [];
            wall.forEach(xy => {
                const polyPice = c.coordinateToVector3([xy[0], xy[1]]);
                positionsV.push(polyPice);
                joinLonLat.push(polyPice.x);
                joinLonLat.push(polyPice.y)
            });
            for (var a = joinLonLat, polySub = [], o = 0, s = 0; o < a.length - 2; o += 2, s++) 0 === o ? polySub[0] = Math.sqrt((a[2] - a[0]) * (a[2] - a[0]) + (a[3] - a[1]) * (a[3] - a[1])) : polySub[s] = polySub[s - 1] + Math.sqrt((a[o + 2] - a[o]) * (a[o + 2] - a[o]) + (a[o + 3] - a[o + 1]) * (a[o + 3] - a[o + 1]));
            let pos = [],
                uvs = [];
            let polylenth = polySub[polySub.length - 1];
            for (let d = 0, u = pos.length, p = uvs.length; d < positionsV.length - 1; d++) {
                let pv1 = positionsV[d],
                    pv2 = positionsV[d + 1],
                    polyPice = polySub[d];
                pos[u++] = pv1.x, pos[u++] = pv1.y, pos[u++] = 0, uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth, uvs[p++] = 0, pos[u++] = pv2.x, pos[u++] = pv2.y, pos[u++] = 0, uvs[p++] = polyPice / polylenth, uvs[p++] = 0, pos[u++] = pv1.x, pos[u++] = pv1.y, pos[u++] = height, uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth, uvs[p++] = 1, pos[u++] = pv1.x, pos[u++] = pv1.y, pos[u++] = height, uvs[p++] = 0 === d ? 0 : polySub[d - 1] / polylenth, uvs[p++] = 1, pos[u++] = pv2.x, pos[u++] = pv2.y, pos[u++] = 0, uvs[p++] = polyPice / polylenth, uvs[p++] = 0, pos[u++] = pv2.x, pos[u++] = pv2.y, pos[u++] = height, uvs[p++] = polyPice / polylenth, uvs[p++] = 1
            }
            var e = new t.BufferGeometry;
            e.setAttribute("position", new t.BufferAttribute(new Float32Array(pos), 3));
            e.setAttribute("uv", new t.BufferAttribute(new Float32Array(uvs), 2));
            c.object3d = new t.Mesh(e, c.material);
            c.scene.add(c.object3d);
            const position = c.coordinateToVector3([center.x, center.y], c.options.altitude);
            c.object3d.position.copy(position);
            b.resetWebGLState()
        },
        setMaterialColor: function (a) {
            if (!this.object3d) {
                return
            }
            this.object3d.material.uniforms.color.value = a
        },
        setwireframe: function () {
            if (!this.object3d) {
                return
            }
            this.object3d.material.wireframe = !this.object3d.material.wireframe
        },
        setopacity: function (a) {
            if (!this.object3d) {
                return
            }
            this.object3d.material.opacity = a
        },
        setaltitude: function (a) {
            if (!this.object3d) {
                return
            }
            this.object3d.position.z = a
        },
        setscaleZ: function (a) {
            if (!this.object3d) {
                return
            }
            this.object3d.scale.z = a
        },
        distanceToVector3: function (w, h, a) {
            const zoom = 6;
            const centerlonlat = r.xyToLngLat(this.view.center.x, this.view.center.y);
            const target = this._locate(centerlonlat, w, h);
            const p0 = this.coordinateToPoint(centerlonlat, zoom),
                p1 = this.coordinateToPoint(target, zoom);
            const x = Math.abs(p1.x - p0.x) * this.sign(w);
            const y = Math.abs(p1.y - p0.y) * this.sign(h);
            return new t.Vector3(x, y, 0)
        },
        toRadian: function (d) {
            const pi = Math.PI / 180;
            return d * pi
        },
        coordinateToPoint: function (a, b, c) {
            const COORD = new q({
                x: 0,
                y: 0,
                spatialReference: {
                    wkid: 4326
                }
            });
            const prjCoord = this.project(a, COORD);
            return this._prjToPoint(prjCoord, b, c)
        },
        _prjToPoint: function (a, b, c) {
            return this.transform(a, this._getResolution(b), c)
        },
        _getResolution: function (a) {
            if ((a === undefined || a === this.view.zoom) && this.view.resolution !== undefined) {
                return this.view.resolution
            } else if (a === 6 && this.view.resolution !== undefined) {
                return this.view.resolution
            }
            if (isNil(a)) {
                a = this.view.zoom
            }
            return this.getResolution(a)
        },
        getResolution(zoom) {
            let z = (zoom | 0);
            if (z < 0) {
                z = 0
            } else if (z > this._resolutions.length - 1) {
                z = this._resolutions.length - 1
            }
            const res = this._resolutions[z];
            if (z !== zoom && zoom > 0 && z < this._resolutions.length - 1) {
                const next = this._resolutions[z + 1];
                return res + (next - res) * (zoom - z)
            }
            return res
        },
        transform: function (a, b, c) {
            const x = this.matrix[0] * (a.x - this.matrix[2]) / b;
            const y = -this.matrix[1] * (a.y - this.matrix[3]) / b;
            if (c) {
                c.x = x;
                c.y = y;
                return c
            }
            return new q({
                x: x,
                y: y,
                spatialReference: {
                    wkid: 102100
                }
            })
        },
        project: function (a, b) {
            const rad = this.rad,
                metersPerDegree = this.metersPerDegree,
                max = this.maxLatitude;
            const lng = a.x,
                lat = Math.max(Math.min(max, a.y), -max);
            let c;
            if (lat === 0) {
                c = 0
            } else {
                c = Math.log(Math.tan((90 + lat) * rad / 2)) / rad
            }
            const x = lng * metersPerDegree;
            const y = c * metersPerDegree;
            if (b) {
                b.x = x;
                b.y = y;
                return b
            }
            return new q({
                x: x,
                y: y,
                spatialReference: {
                    wkid: 102100
                }
            })
        },
        wrap: function (n, a, b) {
            if (n === b || n === a) {
                return n
            }
            const d = b - a;
            const w = ((n - a) % d + d) % d + a;
            return w
        },
        _locate: function (c, a, b) {
            var d = this;
            if (!c) {
                return null
            }
            if (!a) {
                a = 0
            }
            if (!b) {
                b = 0
            }
            if (!a && !b) {
                return c
            }
            let x, y;
            let ry = d.toRadian(c.y);
            if (b !== 0) {
                const dy = Math.abs(b);
                const sy = Math.sin(dy / (2 * d.radius)) * 2;
                ry = ry + sy * (b > 0 ? 1 : -1);
                y = d.wrap(ry * 180 / Math.PI, -90, 90)
            } else {
                y = c.y
            }
            if (a !== 0) {
                const dx = Math.abs(a);
                let rx = d.toRadian(c.x);
                const sx = 2 * Math.sqrt(Math.pow(Math.sin(dx / (2 * d.radius)), 2) / Math.pow(Math.cos(ry), 2));
                rx = rx + sx * (a > 0 ? 1 : -1);
                x = d.wrap(rx * 180 / Math.PI, -180, 180)
            } else {
                x = c.x
            }
            c.x = x;
            c.y = y;
            return c
        },
        sign: function (x) {
            if (Math.sign) {
                return Math.sign(x)
            }
            x = +x;
            if (x === 0 || isNaN(x)) {
                return Number(x)
            }
            return x > 0 ? 1 : -1
        },
        addAttribute: function (a, b, c) {
            a.setAttribute(b, c);
            return a
        },
        coordinateToVector3: function (a, b=0) {
            const p = a;
            let transform = new t.Matrix4();
            let transformation = new Array(16);
            transform.fromArray(l.renderCoordinateTransformAt(this.view, [p[0], p[1], b], this.view.spatialReference, transformation));
            let vector3 = new t.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]);
            return vector3
        },
        extend: function (a) {
            for (let i = 1; i < arguments.length; i++) {
                const src = arguments[i];
                for (const k in src) {
                    a[k] = src[k]
                }
            }
            return a
        },
        render: function (a) {
            const cam = a.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(new t.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.object3d.material.uniforms.time.value += this.options.speed;
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            l.requestRender(this.view);
            a.resetWebGLState()
        }
    });
    return v
});;