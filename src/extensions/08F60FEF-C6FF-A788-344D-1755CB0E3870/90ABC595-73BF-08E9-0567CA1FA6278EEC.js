;
define(['dojo/_base/declare', "esri/geometry/geometryEngine", "esri/geometry/Extent", "esri/geometry/Point", "esri/Graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/views/3d/externalRenderers", "esri/geometry/support/webMercatorUtils", "82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/1154708B-CB1B-818F-1F1EAE27ACDD88EB"], function (q, s, t, u, A, B, C, D, E, F) {
    var G = window.THREE;
    var H = 2048;
    var I = q([], {
        constructor: function (a, b, c) {
            this.view = a;
            if (!Array.isArray(b)) {
                this.data = [b]
            } else {
                this.data = b
            }
            const OPTIONS = {
                interactive: false,
                min: 0,
                max: 100,
                size: 13,
                gradient: {
                    0.25: 'rgb(0,0,255)',
                    0.55: 'rgb(0,255,0)',
                    0.85: 'yellow',
                    1.0: 'rgb(255,0,0)'
                },
                gridScale: 0.5
            }
            this.options = this.extend({}, OPTIONS, c, {
                points: this.data
            })
        },
        setup: function (b) {
            this.renderer = new G.WebGLRenderer({
                context: b.gl,
                premultipliedAlpha: false,
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setViewport(0, 0, this.view.width, this.view.height);
            this.renderer.autoClear = false;
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearColor = false;
            var c = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (a) {
                c(a);
                if (a == null) {
                    b.bindRenderTarget()
                }
            };
            this.scene = new G.Scene();
            this.camera = new G.PerspectiveCamera();

            const axesHelper = new G.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            this.scene.add(axesHelper);
            
            this._setupScene(b)
        },
        transparentObject: function (a, b) {
            var c = new G.Object3D();
            var d = new G.Mesh(a, b);
            d.material.side = G.BackSide;
            d.renderOrder = 0;
            c.add(d)
            var d = new G.Mesh(a, b.clone());
            d.material.side = G.FrontSide;
            d.renderOrder = 1;
            c.add(d);
            return c
        },
        _setupScene: function (d) {
            var e = this;
            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
            const vs = [];
            for (let i = 0, len = e.data.length; i < len; i++) {
                const {
                    coordinate,
                    lnglat,
                    xy
                } = e.data[i];
                const coord = coordinate || lnglat || xy;
                if (!coord) {
                    console.warn('not find coordinate');
                    continue
                }
                const v = e.coordinateToVector3(coord);
                vs.push(v);
                const {
                    x,
                    y
                } = v;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y)
            }
            let {
                gridScale,
                altitude
            } = e.options;
            const offsetX = Math.abs(maxX - minX),
                offsetY = Math.abs(maxY - minY);
            const maxOffset = Math.max((offsetX * gridScale), (offsetY * gridScale));
            if (maxOffset > H) {
                console.warn(`gridScale:${gridScale}it's too big. I hope it's a smaller value,canvas max size is ${H}*${H}`);
                const offset = maxOffset / gridScale;
                gridScale = H / offset
            }
            const canvasWidth = Math.ceil(offsetX * gridScale),
                canvasHeight = Math.ceil(offsetY * gridScale);
            const scaleX = canvasWidth / offsetX,
                scaleY = canvasHeight / offsetY;
            const pixels = [];
            for (let i = 0, len = vs.length; i < len; i++) {
                const v = vs[i];
                v.x -= minX;
                v.y -= minY;
                v.x *= scaleX;
                v.y *= scaleY;
                v.y = canvasHeight - v.y;
                pixels.push({
                    coordinate: [v.x, v.y],
                    count: e.data[i].count
                })
            }
            let shadowCanvas = this.Canvas(canvasWidth, canvasHeight);
            let shadowContext = shadowCanvas.getContext('2d');
            e.drawGray(shadowContext, pixels, e.options);
            const colored = shadowContext.getImageData(0, 0, shadowContext.canvas.width, shadowContext.canvas.height);
            let maxAlpha = -Infinity;
            const blackps = {},
                alphas = [];
            for (let i = 3, len = colored.data.length, j = 0; i < len; i += 4) {
                const alpha = colored.data[i];
                maxAlpha = Math.max(maxAlpha, alpha);
                alphas.push(alpha);
                if (alpha <= 0) {
                    blackps[j] = 1
                }
                j++
            }
            const intensity = new F({
                gradient: e.options.gradient
            });
            e.colorize(colored.data, intensity.getImageData(), e.options);
            shadowCanvas = null;
            shadowContext = null;
            const geometry = new G.PlaneBufferGeometry(offsetX, offsetY, canvasWidth - 1, canvasHeight - 1);
            const index = geometry.getIndex().array;
            const position = geometry.attributes.position.array;
            const filterIndex = [];
            const colors = [];
            const color = new G.Color();
            for (let i = 0, len = position.length, j = 0, len1 = index.length, m = 0, len2 = colored.data.length, n = 0; i < Math.max(len, len1, len2); i += 3) {
                if (i < len) {
                    const alpha = alphas[n];
                    if (alpha > 0) {
                        position[i + 2] = alpha / maxAlpha
                    }
                }
                if (j < len1) {
                    const a = index[j],
                        b = index[j + 1],
                        c = index[j + 2];
                    if ((!blackps[a]) || (!blackps[b]) || (!blackps[c])) {
                        filterIndex.push(a, b, c)
                    }
                }
                if (m < len2) {
                    const r = colored.data[m],
                        g = colored.data[m + 1],
                        b = colored.data[m + 2];
                    const rgb = `rgb(${r},${g},${b})`;
                    color.setStyle(rgb);
                    colors.push(color.r, color.g, color.b)
                }
                j += 3;
                m += 4;
                n++
            }
            var f = new G.MeshBasicMaterial({
                transparent: true,
                wireframe: e.options.wireframe === undefined ? false : e.options.wireframe,
                opacity: e.options.opacity || 1,
                color: e.options.color || "#ac3d3d"
            });
            geometry.setIndex(new G.Uint32BufferAttribute(filterIndex, 1));
            e.addAttribute(geometry, 'color', new G.Float32BufferAttribute(colors, 3, true));
            f.vertexColors = G.VertexColors;
            e.object3d = new G.Mesh(geometry, f);
            var z = e.options.altitude === undefined ? 0 : e.options.altitude;
            e.object3d.position.copy(new G.Vector3((minX + maxX) / 2, (minY + maxY) / 2, z));
            e.object3d.scale.z = e.options.scaleZ == undefined ? 1 : e.options.scaleZ;
            e.scene.add(e.object3d);
            // console.log(e.object3d) 
            d.resetWebGLState()
        },
        setMaterialColor: function (a) {
            if (!this.object3d) {
                return
            }
            this.object3d.material.color.set(a)
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
        addAttribute: function (a, b, c) {
            a.setAttribute(b, c);
            return a
        },
        coordinateToVector3: function (a, b = 0) {
            const p = a;
            let transform = new G.Matrix4();
            let transformation = new Array(16);
            transform.fromArray(D.renderCoordinateTransformAt(this.view, [p[0], p[1], b], this.view.spatialReference, transformation));
            let vector3 = new G.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]);
            return vector3
        },
        distanceToVector3: function (w, h, a) {
            const zoom = this.view.zoom;
            let center = a || this.view.center; b
            const target = this._locate(center, w, h);
            const p0 = map.coordinateToPoint(center, zoom),
                p1 = map.coordinateToPoint(target, zoom);
            const x = Math.abs(p1.x - p0.x) * maptalks.Util.sign(w);
            const y = Math.abs(p1.y - p0.y) * maptalks.Util.sign(h);
            return new G.Vector3(x, y, 0)
        },
        _locate: function (c, a, b) {
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
            let ry = toRadian(c.y);
            if (b !== 0) {
                const dy = Math.abs(b);
                const sy = Math.sin(dy / (2 * this.radius)) * 2;
                ry = ry + sy * (b > 0 ? 1 : -1);
                y = wrap(ry * 180 / Math.PI, -90, 90)
            } else {
                y = c.y
            }
            if (a !== 0) {
                const dx = Math.abs(a);
                let rx = toRadian(c.x);
                const sx = 2 * Math.sqrt(Math.pow(Math.sin(dx / (2 * this.radius)), 2) / Math.pow(Math.cos(ry), 2));
                rx = rx + sx * (a > 0 ? 1 : -1);
                x = wrap(rx * 180 / Math.PI, -180, 180)
            } else {
                x = c.x
            }
            c.x = x;
            c.y = y;
            return c
        },
        drawGray: function (d, e, f) {
            var g = this.getMax(f);
            var h = f._size || f.size || 13;
            var j = this.createCircle(h);
            var k = j.width / 2;
            var l = j.height / 2;
            var m = e;
            var n = {};
            m.forEach(function (a) {
                var b = a.count === undefined ? 1 : a.count;
                var c = Math.min(1, b / g).toFixed(2);
                n[c] = n[c] || [];
                n[c].push(a)
            });
            for (var i in n) {
                if (isNaN(i)) continue;
                var o = n[i];
                d.beginPath();
                if (!f.withoutAlpha) {
                    d.globalAlpha = i
                }
                o.forEach(function (a) {
                    var b = a.coordinate;
                    var c = a.count === undefined ? 1 : a.count;
                    d.globalAlpha = c / g;
                    d.drawImage(j, b[0] - k, b[1] - l)
                })
            }
        },
        createCircle: function (a) {
            var b = a / 2;
            var c = a + b;
            var d = 10000;
            var e = this.Canvas(c * 2, c * 2);
            var f = e.getContext('2d');
            f.shadowBlur = b;
            f.shadowColor = 'black';
            f.shadowOffsetX = f.shadowOffsetY = d;
            f.beginPath();
            f.arc(c - d, c - d, a, 0, Math.PI * 2, true);
            f.closePath();
            f.fill();
            return e
        },
        colorize: function (a, b, c) {
            var d = this.getMax(c);
            var e = this.getMin(c);
            var f = d - e;
            var g = c.range || null;
            var h = 0;
            var k = 1024;
            if (g && g.length === 2) {
                h = (g[0] - e) / f * 1024
            }
            if (g && g.length === 2) {
                k = (g[1] - e) / f * 1024
            }
            var l = c.maxOpacity || 0.8;
            var m = c.minOpacity || 0;
            for (var i = 3, len = a.length, j; i < len; i += 4) {
                j = a[i] * 4;
                if (a[i] / 256 > l) {
                    a[i] = 256 * l
                }
                if (a[i] / 256 < m) {
                    a[i] = 256 * m
                }
                if (j && j >= h && j <= k) {
                    a[i - 3] = b[j];
                    a[i - 2] = b[j + 1];
                    a[i - 1] = b[j + 2]
                } else {
                    a[i] = 0
                }
            }
        },
        getMax: function (a) {
            var b = a.max || 100;
            return b
        },
        getMin: function (a) {
            var b = a.min || 0;
            return b
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
        Canvas: function (a = 1, b = 1) {
            let canvas;
            if (typeof document === 'undefined') { } else {
                canvas = document.createElement('canvas');
                if (a) {
                    canvas.width = a;
                }
                if (b) {
                    canvas.height = b;
                }
            }
            return canvas
        },
        render: function (a) {
            const cam = a.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(new G.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            D.requestRender(this.view);
            a.resetWebGLState()
        }
    });
    return I
});;