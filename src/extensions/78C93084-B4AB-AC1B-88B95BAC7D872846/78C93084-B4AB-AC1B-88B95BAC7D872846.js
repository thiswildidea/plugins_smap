;
define(['dojo/_base/declare', 'esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/views/3d/externalRenderers', 'esri/geometry/support/webMercatorUtils', ], function (g, h, i, j, k) {
  'use strict';
  var l = window.THREERenderer;
  var m = g(null, {
    constructor: function (a, b, c, d, e, f) {
      this.view = a;
      this.center = b;
      this.radius = c;
      this.textureurl = e;
      this.height = d;
      this.scale = f 
      this.renderer = null, this.camera = null, this.scene = null
    },
    setup: function (b) {
      this.renderer = new l.WebGLRenderer({
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
      this.scene = new l.Scene();
      this.camera = new l.PerspectiveCamera();
      let transform = new l.Matrix4();
      let transformation = new Array(16);
      transform.fromArray(j.renderCoordinateTransformAt(this.view, [this.center[0], this.center[1], 0], this.view.spatialReference, transformation));
      const textureLoader = new l.TextureLoader();
      var d = textureLoader.load(this.textureurl);
      d.repeat.x = 2;
      var e = new l.BoxBufferGeometry(this.radius, this.radius, this.height);
      var f = new l.MeshBasicMaterial({
        color: 0xFFB400,
        map:d,
        opacity: 1,
      });
      e.rotateZ(Math.PI / 2);
      e.rotateY(-Math.PI / 2) 
      this.renderObject = this.transparentObject(e, f);
      this.renderObject.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
      this.scene.add(this.renderObject);
      b.resetWebGLState()
    },
    transparentObject: function (a, b) {
      var c = new l.Object3D();
      var d = new l.Mesh(a, b);
      d.material.side = l.BackSide;
      d.renderOrder = 0;
      c.add(d) 
      var d = new l.Mesh(a, b.clone());
      d.material.side = l.FrontSide;
      d.renderOrder = 1;
      c.add(d);
      return c
    },
    render: function (a) {
      const cam = a.camera;
      this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
      this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
      this.camera.lookAt(new l.Vector3(cam.center[0], cam.center[1], cam.center[2]));
      this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
      this.renderObject.scale.x = this.renderObject.scale.x + 0.01
       this.renderObject.scale.y = this.renderObject.scale.y + 0.01
      if (this.renderObject.scale.x > this.scale) {
        this.renderObject.scale.x = 1 
        this.renderObject.scale.y = 1
      }
      this.renderer.state.reset();
      this.renderer.render(this.scene, this.camera);
      j.requestRender(this.view);
      a.resetWebGLState()
    },
    dispose: function (a) {}
  });
  return m
});;