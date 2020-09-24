define([
  'dojo/_base/declare',
  'esri/geometry/Point',
  'esri/geometry/SpatialReference',
  'esri/views/3d/externalRenderers',
  'esri/geometry/support/webMercatorUtils',
], function (declare, Point, SpatialReference, externalRenderers, webMercatorUtils) {
  // Enforce strict mode
  'use strict';

  // Constants
  var THREERenderer = window.THREERenderer;

    var dynamicFire = declare(null, {
    constructor: function (view, center, radius, height,scale) {
      this.view = view;
      this.center = center;
      this.radius = radius;
      this.height = height;
      this.scale = scale
      this.renderer = null,
      this.camera = null,
      this.scene = null
    },
    setup: function (context) {
      this.renderer = new THREERenderer.WebGLRenderer({
        context: context.gl, // 可用于将渲染器附加到已有的渲染环境(RenderingContext)中
        premultipliedAlpha: false, // renderer是否假设颜色有 premultiplied alpha. 默认为true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      this.renderer.setViewport(0, 0, this.view.width, this.view.height); // 视口大小设置

      // Make sure it does not clear anything before rendering
      this.renderer.autoClear = false;
      this.renderer.autoClearDepth = false;
      this.renderer.autoClearColor = false;
      // this.renderer.autoClearStencil = false;

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

      this.scene = new THREERenderer.Scene();
      // setup the camera
      this.camera = new THREERenderer.PerspectiveCamera();


      // 添加坐标轴辅助工具
      // const axesHelper = new THREERenderer.AxesHelper(10000000);
      //this.scene.add(axesHelper);

      let transform = new THREERenderer.Matrix4(); // 变换矩阵
      let transformation = new Array(16);

      transform.fromArray(
        externalRenderers.renderCoordinateTransformAt(
          this.view,
          [this.center[0], this.center[1], 0], // 坐标在地面上的点[x值, y值, 高度值]
          this.view.spatialReference,
          transformation
        )
      );

      const textureLoader = new THREERenderer.TextureLoader();
      var map = textureLoader.load(this.textureurl);
      map.repeat.x = 2;
      var geo = new THREERenderer.PlaneBufferGeometry(
        this.radius,
        this.radius
      );
      this.fire = new Fire(plane, {
        textureWidth: 512,
        textureHeight: 512,
        debug: false
      });
      this.fire.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
      geo.rotateZ(Math.PI / 2);
      geo.rotateY(-Math.PI / 2)
    
      this.scene.add(this.fire);
      context.resetWebGLState();
    },
    render: function (context) {
      const cam = context.camera;
      this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
      this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
      this.camera.lookAt(
        new THREERenderer.Vector3(cam.center[0], cam.center[1], cam.center[2])
      );
      this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

      this.renderObject.scale.x = this.renderObject.scale.x + 0.01
      this.renderObject.scale.y = this.renderObject.scale.y + 0.01
      if (this.renderObject.scale.x > this.scale) {
        this.renderObject.scale.x = 1
        this.renderObject.scale.y = 1
      }
      // 绘制场景
      this.renderer.state.reset();
      this.renderer.render(this.scene, this.camera);
      // 请求重绘视图。
      externalRenderers.requestRender(this.view);
      // cleanup
      context.resetWebGLState();
    },
    dispose: function (content) { }
  });
    return dynamicFire
});