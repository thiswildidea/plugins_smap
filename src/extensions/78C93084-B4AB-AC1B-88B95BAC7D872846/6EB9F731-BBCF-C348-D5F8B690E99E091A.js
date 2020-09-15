;
define(['esri/Camera', 'dojo/_base/declare', 'esri/views/3d/externalRenderers', "esri/geometry/support/webMercatorUtils"], function (f, g, h, i) {
    'use strict';
    var j = window.THREE;
    var k = 6378137;
    var l = 1216000;
    return g([], {
        constructor: function (a, b, c, d, e) {
            this.view = a;
            this.center = b;
            this.radius = c;
            this.textureurl = e;
            this.height = d
        },
        setup: function (b) {
            this.renderer = new j.WebGLRenderer({
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
            this.scene = new j.Scene();
            this.camera = new j.PerspectiveCamera();
            this._createLights();
            this._createObjects();
            this._updateObjects()
        },
        render: function (a) {
            this.renderer.resetGLState();
            this._updateCamera(a);
            this._updateLights(a);
            this._updateObjects(a);
            this.renderer.render(this.scene, this.camera)
        },
        dispose: function (a) { },
        _createLights: function () {
            this.scene.add(new j.AmbientLight(0x404040, 1));
            var a = new j.DirectionalLight(0xffffff, 0.5);
            a.position.set(1, 0, 0);
            this.scene.add(a)
        },
        _createObjects: function () {
            var a = this;
            var b = new j.MeshBasicMaterial({
                side: j.DoubleSide,
                transparent: true,
                map: new j.TextureLoader().load(a.textureurl)
            });
            var c = a.height;
            var d = new j.ConeBufferGeometry(a.radius, c, 100, 1, true);
            d.translate(this.center[1], 0, this.center[0]);
            d.rotateZ(Math.PI / 2);
            d.rotateY(-Math.PI / 2)
            const point = i.xyToLngLat(a.center[0], a.center[1])
            this.scene.add(new j.Mesh(d, b))
        },
        _updateCamera: function (a) {
            var c = a.camera;
            this.camera.projectionMatrix.fromArray(c.projectionMatrix);
            this.camera.position.set(c.eye[0], c.eye[1], c.eye[2]);
            this.camera.up.set(c.up[0], c.up[1], c.up[2]);
            this.camera.lookAt(new j.Vector3(c.center[0], c.center[1], c.center[2]))
        },
        _updateLights: function (a) { },
        _updateObjects: function (a) { }
    })
});;