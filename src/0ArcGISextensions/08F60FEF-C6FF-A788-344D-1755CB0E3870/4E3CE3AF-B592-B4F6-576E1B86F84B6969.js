;
define(['dojo/_base/declare', 'esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/views/3d/externalRenderers', 'esri/geometry/support/webMercatorUtils', ], function (h, j, k, l, m) {
    'use strict';
    var n = window.THREERenderer;
    var o = h(null, {
        constructor: function (a, b, c) {
            this.view = a.view, this.points = a.points, this.markercontainerid = a.markercontainerid, this.callback = b;
            this.callbackPointermove = c;
            this.renderer = null, this.camera = null, this.scene = null
        },
        setup: function (b) {
            this.renderer = new n.WebGLRenderer({
                context: b.gl,
                premultipliedAlpha: false,
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setViewport(0, 0, this.view.width, this.view.height);
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearStencil = false;
            this.renderer.autoClearColor = false;
            const originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (a) {
                originalSetRenderTarget(a);
                if (a == null) {
                    b.bindRenderTarget()
                }
            };
            this.gifRenderer = new window.CSS2DRenderer();
            this.gifRenderer.setSize(this.view.width, this.view.height);
            this.gifRenderer.domElement.style.position = 'absolute';
            this.gifRenderer.domElement.style.top = '0px';
            this.gifRenderer.domElement.setAttribute('id', this.markercontainerid) 
            document.querySelector('.esri-view .esri-view-root .esri-view-surface').appendChild(this.gifRenderer.domElement);
            this.scene = new n.Scene();
            this.camera = new n.PerspectiveCamera();
            const axesHelper = new n.AxesHelper(10000000);
            this.scene.add(axesHelper);
            let transform = new n.Matrix4();
            let transformation = new Array(16);
            this.points.forEach((point) => {
                const z = point.z === undefined ? 0 : point.z
                 transform.fromArray(l.renderCoordinateTransformAt(this.view, [point.x, point.y, z], this.view.spatialReference, transformation));
                let vector3 = new n.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]);
                const div = document.createElement('div');
                div.setAttribute('id', point.markerid) 
                const width = point.width === undefined ? 40 : point.width
                const height = point.height === undefined ? 40 : point.height
                 div.innerHTML = '<div><img src="' + point.url + '" style="width:' + width + "px;height:" + height + 'px;" /></div>';
                const divObj = new window.CSS2DObject(div);
                divObj.position.set(vector3.x, vector3.y, vector3.z);
                this.scene.add(divObj)
            });
            b.resetWebGLState();
            this.initevent()
        },
        render: function (a) {
            const cam = a.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(new n.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            this.gifRenderer.render(this.scene, this.camera);
            l.requestRender(this.view);
            a.resetWebGLState()
        },
        initevent: function () {
            var g = this
            if (!g.view) {
                return
            }
            g.view.on("click", function (c) {
                if (!g.points.length) {
                    _return
                } else {
                    var d = g.points.map(function (a) {
                        let pointorigin = new j({
                            x: a.x,
                            y: a.y,
                            spatialReference: k.WebMercator
                        });
                        var b = g.view.toScreen(pointorigin);
                        return Math.sqrt((b.x - c.x) * (b.x - c.x) + (b.y - c.y) * (b.y - c.y))
                    }) 
                    var e = 0;
                    d.forEach(function (a, i) {
                        if (a < d[e]) {
                            e = i
                        }
                    });
                    var f = d[e];
                    if (f > 35) {} else {
                        g.callback(g.points[e])
                    }
                }
            });
            g.view.on("pointer-move", function (c) {
                if (!g.points.length) {} else {
                    var d = g.points.map(function (a) {
                        let pointorigin = new j({
                            x: a.x,
                            y: a.y,
                            spatialReference: k.WebMercator
                        });
                        var b = g.view.toScreen(pointorigin);
                        return Math.sqrt((b.x - c.x) * (b.x - c.x) + (b.y - c.y) * (b.y - c.y))
                    }) 
                    var e = 0;
                    d.forEach(function (a, i) {
                        if (a < d[e]) {
                            e = i
                        }
                    });
                    var f = d[e];
                    if (f > 35) {} else {
                        g.callbackPointermove(g.points[e])
                    }
                }
            })
        },
        dispose: function (a) {}
    });
    return o
});;