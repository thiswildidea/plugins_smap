
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

    var dynamicPolygon = declare(null, {
    constructor: function (options) {
      this.view = options.view,
      this.points = options.points
      this.texturestart = options.texturestart,
      this.texturestarend = options. texturestarend,
      this.height = options.height,
      this.offset = options.offset
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
      const axesHelper = new THREERenderer.AxesHelper(10000000);
      this.scene.add(axesHelper);

      // 计算顶点
      let transform = new THREERenderer.Matrix4(); // 变换矩阵
      let transformation = new Array(16);
      let vector3List = []; // 顶点数组
      let faceList = []; // 三角面数组
      let faceVertexUvs = []; // 面的 UV 层的队列，该队列用于将纹理和几何信息进行映射
      // 转换顶点坐标
      this.points.forEach((point) => {
        // 将经纬度坐标转换为xy值\
        // let pointXY = webMercatorUtils.lngLatToXY(point[0], point[1]);
        const z = point[2] === undefined ? 0 : point[2]
        // 先转换高度为0的点
        transform.fromArray(
          externalRenderers.renderCoordinateTransformAt(
            this.view,
            [point[0], point[1], z], // 坐标在地面上的点[x值, y值, 高度值]
            this.view.spatialReference,
            transformation
          )
        );
        vector3List.push(
          new THREERenderer.Vector3(
            transform.elements[12],
            transform.elements[13],
            transform.elements[14]
          )
        );
        // 再转换距离地面高度为height的点
        transform.fromArray(
          externalRenderers.renderCoordinateTransformAt(
            this.view,
            [point[0], point[1], this.height], // 坐标在空中的点[x值, y值, 高度值]
            this.view.spatialReference,
            transformation
          )
        );
        vector3List.push(
          new THREERenderer.Vector3(
            transform.elements[12],
            transform.elements[13],
            transform.elements[14]
          )
        );
      });

      // 纹理坐标
      const t0 = new THREERenderer.Vector2(0, 0); // 图片左下角
      const t1 = new THREERenderer.Vector2(1, 0); // 图片右下角
      const t2 = new THREERenderer.Vector2(1, 1); // 图片右上角
      const t3 = new THREERenderer.Vector2(0, 1); // 图片左上角
      // 生成几何体三角面
      for (let i = 0; i < vector3List.length - 2; i++) {
        if (i % 2 === 0) {
          faceList.push(new THREERenderer.Face3(i, i + 2, i + 1));
          faceVertexUvs.push([t0, t1, t3]);
        } else {
          faceList.push(new THREERenderer.Face3(i, i + 1, i + 2));
          faceVertexUvs.push([t3, t1, t2]);
        }
      }
      // 几何体
      const geometry = new THREERenderer.Geometry();
      geometry.vertices = vector3List;
      geometry.faces = faceList;
      geometry.faceVertexUvs[0] = faceVertexUvs;
      const geometry2 = geometry.clone();
      // 纹理
      this.alphaMap = new THREERenderer.TextureLoader().load(
        this.texturestart
      );
      this.texture = new THREERenderer.TextureLoader().load(
        this.texturestarend
      );
      this.texture.wrapS = THREERenderer.RepeatWrapping;
      this.texture.wrapT = THREERenderer.RepeatWrapping;
      this.texture.offset.set(0, 0.5);
      const material = new THREERenderer.MeshBasicMaterial({
        color: 0x00FFFF,
        side: THREERenderer.DoubleSide,
        transparent: true, // 必须设置为true,alphaMap才有效果
        depthWrite: false, // 渲染此材质是否对深度缓冲区有任何影响
        alphaMap: this.alphaMap,
      });
      const mesh = new THREERenderer.Mesh(geometry, material);
      const material2 = new THREERenderer.MeshBasicMaterial({
        side: THREERenderer.DoubleSide,
        transparent: true,
        depthWrite: false, // 渲染此材质是否对深度缓冲区有任何影响
        map: this.texture,
      });
      const mesh2 = new THREERenderer.Mesh(geometry2, material2);
      this.scene.add(mesh);
      this.scene.add(mesh2);
      context.resetWebGLState();
    },
    render: function (context) {
      // 更新相机参数
      const cam = context.camera;
      this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
      this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
      this.camera.lookAt(
        new THREERenderer.Vector3(cam.center[0], cam.center[1], cam.center[2])
      );
      // 投影矩阵可以直接复制
      this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
      // 更新
      if (this.offset <= 0) {
        this.offset = 1;
      } else {
        this.offset -= 0.01;
      }
      if (this.texture) {
        this.texture.offset.set(0, this.offset);
      }
      // 绘制场景
      this.renderer.state.reset();
      this.renderer.render(this.scene, this.camera);
      // 请求重绘视图。
      externalRenderers.requestRender(this.view);
      // cleanup
      context.resetWebGLState();
    },
    dispose: function (content) {}
  });
    return dynamicPolygon
});