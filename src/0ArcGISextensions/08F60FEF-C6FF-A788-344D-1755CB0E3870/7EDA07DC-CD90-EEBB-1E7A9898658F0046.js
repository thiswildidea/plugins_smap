;
define(['dojo/_base/declare', 'esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/views/3d/externalRenderers', 'esri/geometry/support/webMercatorUtils', ], function (k, m, n, o, p) {
    'use strict';
    var q = window.THREE;
    var r = k(null, {
        constructor: function (a, b) {
            this.view = a, this.datas = b.datas;
            this.absoluteheight = b.absoluteheight || 1 
            this.width = b.width || 0;
            this.height = b.height || 0;
            this.indexwidth = b.indexwidth || 0;
            this.indexheight = b.indexheight || 0;
            this.select3D = b.select3D === undefined ? false : b.select3D;
            this.zdata = null;
            this.timedata = [];
            this.wireframe = b.wireframe || true, this.xmin = b.xmin;
            this.ymin = b.ymin;
            this.xmax = b.xmax;
            this.ymax = b.ymax;
            this.minValue = b.minValue;
            this.maxValue = b.maxValue;
            this.dataArr = [];
            this.nowNum = 0;
            this.pixelSizeX = 0.01;
            this.pixelSizeY = 0.01
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
            const axesHelper = new q.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            this.scene.add(axesHelper);
            this.ambient = new q.AmbientLight(0xffffff, 0.5);
            this.scene.add(this.ambient);
            this.sun = new q.DirectionalLight(0xffffff, 0.5);
            this.sun.position.set(-600, 300, 60000);
            this.scene.add(this.sun);
            var e = this.changeCoordinate(this.datas);
            var f = this.produceCanvas(this.datas);
            var g = new q.Mesh(e, new q.MeshPhongMaterial({
                map: new q.CanvasTexture(f),
                wireframe: this.wireframe,
                opacity: 0.5,
                transparent: true
            }))
             this.scene.add(g);
            b.resetWebGLState()
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
        produceColor: function (a) {
            var b = [];
            for (var i = 0; i < a.length; i++) {
                b[i] = [];
                for (var j = 0; j < a[i].length; j++) {
                    if ((a[i][j] - this.minValue) <= (this.maxValue - this.minValue) / 2) {
                        b[i][j] = [(a[i][j] - this.minValue) * 255 / ((this.maxValue - this.minValue) / 2), 255, 0]
                    } else {
                        b[i][j] = [255, (this.maxValue - a[i][j]) * 255 / ((this.maxValue - this.minValue) / 2), 0]
                    }
                }
            }
            return b
        },
        produceCanvas: function (a) {
            var b = this.produceColor(a);
            var c = document.createElement("canvas");
            c.width = a[0].length;
            c.height = a.length;
            var d = c.getContext("2d");
            var e = d.getImageData(0, 0, c.width, c.height);
            var f = e.data;
            for (var i = 0; i < a.length; i++) {
                for (var j = 0; j < a[i].length; j++) {
                    if (a[i][j] > 0) {
                        f[(i * a[i].length + j) * 4] = b[i][j][0];
                        f[(i * a[i].length + j) * 4 + 1] = b[i][j][1];
                        f[(i * a[i].length + j) * 4 + 2] = b[i][j][2];
                        f[(i * a[i].length + j) * 4 + 3] = 255
                    }
                }
            }
            d.putImageData(e, 0, 0);
            return c
        },
        changeCoordinate: function (a) {
            this.width = a[0].length;
            this.height = a.length;
            var b = this.width * this.height * 3
            var c = new Array(b);
            var d = new Array(b);
            var e = [];
            var f;
            for (var i = 0; i < this.width * this.height; i++) {
                d[i * 3] = this.xmin + (i % this.width) * ((this.xmax - this.xmin) / this.width);
                d[i * 3 + 1] = this.ymax - (Math.floor(i / this.width)) * ((this.ymax - this.ymin) / this.height);
                if (this.select3D) {
                    f = (((a[Math.floor(i / this.width)][i % this.width]) * 500 + 10000 * (this.indexheight + 1))) / 10;
                    d[i * 3 + 2] = f - (1000 - 10);
                    e.push(f)
                } else {
                    d[i * 3 + 2] = 0
                }
            }
            e.sort();
            o.toRenderCoordinates(this.view, d, 0, null, c, 0, this.width * this.height);
            var g = new q.PlaneGeometry(100, 100, this.width - 1, this.height - 1);
            var h = [];
            for (var i = 0; i < g.vertices.length; i++) {
                var j = g.vertices[i];
                j.x = c[i * 3];
                j.y = c[i * 3 + 1];
                j.z = c[i * 3 + 2];
                if (Math.abs(c[i * 3 + 2]) < 100000000) {
                    h.push(c[i * 3 + 2])
                }
            }
            g.computeFaceNormals();
            g.computeVertexNormals();
            this.changeLine(a);
            return g
        },
        changeLine: function (a) {
            var b = [];
            for (var i = 0; i < a.length; i++) {
                for (var j = 0; j < a[i].length; j++) {
                    b.push(a[i][j])
                }
            }
        },
        dispose: function (a) {}
    });
    return r
});;