;
define(['dojo/_base/declare', 'esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/views/3d/externalRenderers', 'esri/geometry/support/webMercatorUtils', ], function (k, m, n, o, p) {
    'use strict';
    var q = window.THREE;
    var r = k(null, {
        constructor: function (a, b) {
            this.view = a, this.datas = b.datas;
            this.select3D = b.select3D === undefined ? false : b.select3D;
            this.xmin = b.xmin;
            this.ymin = b.ymin;
            this.xmax = b.xmax;
            this.ymax = b.ymax;
            this.groundZ = b.groundZ || 200;
            this.pixelValueZ = b.pixelValueZ || 1300
        },
        setup: function (b) {
            this.renderer = new q.WebGLRenderer({
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
            this.scene = new q.Scene();
            var d = b.camera;
            this.camera = new q.PerspectiveCamera(d.fovY, d.aspect, d.near, d.far);
            const axesHelper = new q.AxesHelper(0);
            this.scene.add(axesHelper);
            this.ambient = new q.AmbientLight(0xffffff, 0.5);
            this.scene.add(this.ambient);
            this.sun = new q.DirectionalLight(0xffffff, 0.5);
            this.sun.position.set(-600, 300, 60000);
            this.scene.add(this.sun);
            var e = this.datas;
            var f = this.getPixelValueBoundary(e, e);
            var g = this.changeCoordinate(e, f);
            var h = this.produceCanvas(e, f);
            var i = new q.Mesh(g, new q.MeshPhongMaterial({
                map: new q.CanvasTexture(h),
                opacity: 0.5,
                wireframe: true,
                transparent: true,
                side: q.DoubleSide
            }));
            this.scene.add(i)
        },
        render: function (a) {
            var b = a.camera;
            this.camera.position.set(b.eye[0], b.eye[1], b.eye[2]);
            this.camera.up.set(b.up[0], b.up[1], b.up[2]);
            this.camera.lookAt(new q.Vector3(b.center[0], b.center[1], b.center[2]));
            this.camera.projectionMatrix.fromArray(b.projectionMatrix);
            var l = a.sunLight;
            this.sun.position.set(l.direction[0], l.direction[1], l.direction[2]);
            this.sun.intensity = l.diffuse.intensity;
            this.sun.color = new q.Color(l.diffuse.color[0], l.diffuse.color[1], l.diffuse.color[2]);
            this.ambient.intensity = l.ambient.intensity;
            this.ambient.color = new q.Color(l.ambient.color[0], l.ambient.color[1], l.ambient.color[2]);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            o.requestRender(this.view);
            a.resetWebGLState()
        },
        produceColor: function (a, b) {
            var c = [];
            var d = a[0].length;
            var e = a.length;
            var f = b.minPixelValue;
            var g = b.maxPixelValue;
            var h = (g - f) / 2;
            for (var i = 0; i < a.length; i++) {
                c[i] = [];
                for (var j = 0; j < a[i].length; j++) {
                    if (a[i][j] <= h) {
                        c[i][j] = ([(a[i][j] - f) * 255 / h, 255, 0])
                    } else {
                        c[i][j] = ([255, (g - a[i][j]) * 255 / h, 0])
                    }
                }
            }
            return c
        },
        produceCanvas(data, pixelValueObj) {
            var s = this.produceColor(data, pixelValueObj);
            var t = document.createElement("canvas");
            t.width = data[0].length;
            t.height = data.length;
            var u = t.getContext("2d");
            var v = u.getImageData(0, 0, t.width, t.height);
            var x = v.data;
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].length; j++) {
                    if (data[i][j] > 0) {
                        x[(i * data[i].length + j) * 4] = s[i][j][0];
                        x[(i * data[i].length + j) * 4 + 1] = s[i][j][1];
                        x[(i * data[i].length + j) * 4 + 2] = s[i][j][2];
                        x[(i * data[i].length + j) * 4 + 3] = 255
                    }
                }
            }
            u.putImageData(v, 0, 0);
            return t
        },
        getPixelValueBoundary(dataArray) {
            var y = {};
            var z = [];
            var A = dataArray.length;
            var B;
            var C;
            for (let i = 0; i < A; i += 1) {
                C = dataArray[i];
                B = C.length;
                for (let j = 0; j < B; j += 1) {
                    if (C[j] !== 0) {
                        z.push(C[j])
                    }
                }
            }
            z.sort(this.sortNumber);
            console.log('像素值最小值：' + z[0] + ',像素值最大值：' + z[z.length - 1]);
            y.minPixelValue = z[0];
            y.maxPixelValue = z[z.length - 1];
            return y
        },
        changeCoordinate(data, pixelValueObj) {
            var D = pixelValueObj.minPixelValue;
            var E = pixelValueObj.maxPixelValue;
            var F = (E - D) / 2;
            var G = this.pixelValueZ / E;
            this.width4raster = data[0].length;
            this.height4raster = data.length;
            var H = this.width4raster * this.height4raster * 3;
            var I = new Array(H);
            var J = [];
            var K = [];
            var L;
            var M;
            var N;
            var O = (this.xmax - this.xmin) / this.width4raster;
            var P = (this.ymax - this.ymin) / this.height4raster;
            if (this.select3D) {
                for (let h = 0; h < this.height4raster; h += 1) {
                    M = this.ymax - h * P;
                    for (let w = 0; w < this.width4raster; w += 1) {
                        L = this.xmin + w * O;
                        J.push(L);
                        J.push(M);
                        N = data[h][w] * G + this.groundZ;
                        J.push(N);
                        K.push(N)
                    }
                }
            } else {}
            K.sort(this.sortNumber);
            console.log('z值最小值：' + K[0] + ',z值最大值：' + K[K.length - 1]);
            o.toRenderCoordinates(view, J, 0, null, I, 0, this.width4raster * this.height4raster);
            var Q = new q.PlaneGeometry(100, 100, this.width4raster - 1, this.height4raster - 1);
            for (var i = 0; i < Q.vertices.length; i++) {
                var R = Q.vertices[i];
                R.x = I[i * 3];
                R.y = I[i * 3 + 1];
                R.z = I[i * 3 + 2]
            }
            Q.computeFaceNormals();
            Q.computeVertexNormals();
            return Q
        },
        sortNumber(a, b) {
            return a - b
        },
        dispose: function (a) {}
    });
    return r
});;