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

  var flashgiflayer = declare(null, {
    constructor: function (options, callback, callbackPointermove) {
      this.view = options.view,
      this.points = options.points,
      this.markercontainerid = options.markercontainerid,
      this.callback = callback;
      this.callbackPointermove = callbackPointermove;
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

      // 防止Three.js清除ArcGIS JS API提供的缓冲区。
      this.renderer.autoClearDepth = false; // 定义renderer是否清除深度缓存
      this.renderer.autoClearStencil = false; // 定义renderer是否清除模板缓存
      this.renderer.autoClearColor = false; // 定义renderer是否清除颜色缓存
      // this.renderer.autoClearStencil = false;

      // ArcGIS JS API渲染自定义离屏缓冲区，而不是默认的帧缓冲区。
      // 我们必须将这段代码注入到three.js运行时中，以便绑定这些缓冲区而不是默认的缓冲区。
      const originalSetRenderTarget = this.renderer.setRenderTarget.bind(
        this.renderer
      );
      this.renderer.setRenderTarget = function (target) {
        originalSetRenderTarget(target);
        if (target == null) {
          // 绑定外部渲染器应该渲染到的颜色和深度缓冲区
          context.bindRenderTarget();
        }
      };

      this.gifRenderer = new window.CSS2DRenderer();
      this.gifRenderer.setSize(this.view.width, this.view.height);
      this.gifRenderer.domElement.style.position = 'absolute';
      this.gifRenderer.domElement.style.top = '0px';
      this.gifRenderer.domElement.setAttribute('id', this.markercontainerid)
      document.querySelector('.esri-view .esri-view-root .esri-view-surface')
        .appendChild(this.gifRenderer.domElement);
      this.scene = new THREERenderer.Scene(); // 场景
      this.camera = new THREERenderer.PerspectiveCamera(); // 相机

      // 添加坐标轴辅助工具
      const axesHelper = new THREERenderer.AxesHelper(10000000);
      this.scene.add(axesHelper);

      // 计算顶点
      let transform = new THREERenderer.Matrix4(); // 变换矩阵
      let transformation = new Array(16);

      // 转换顶点坐标
      this.points.forEach((point) => {
        // 将经纬度坐标转换为xy值z
        // let pointXY = webMercatorUtils.lngLatToXY(point[0], point[1]);
        // 先转换高度为0的点
        const z = point.z === undefined ? 0 : point.z
        transform.fromArray(
          externalRenderers.renderCoordinateTransformAt(
            this.view,
            [point.x, point.y, z], // 坐标在地面上的点[x值, y值, 高度值]
            this.view.spatialReference,
            transformation
          )
        );
        let vector3 = new THREERenderer.Vector3(
          transform.elements[12],
          transform.elements[13],
          transform.elements[14]
        );

        const div = document.createElement('div');
        div.setAttribute('id', point.markerid)
        const width = point.width === undefined ? 40 : point.width
        const height = point.height === undefined ? 40 : point.height
        div.innerHTML = '<div><img src="' + point.url + '" style="width:'+width+"px;height:" +height+'px;" /></div>';
        const divObj = new window.CSS2DObject(div);
        divObj.position.set(vector3.x, vector3.y, vector3.z);
        this.scene.add(divObj);
      });
      context.resetWebGLState();
      this.initevent();
    },
    render: function (context) {
      // console.log(context);
      // 更新相机参数
      const cam = context.camera;
      this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
      this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
      this.camera.lookAt(
        new THREERenderer.Vector3(cam.center[0], cam.center[1], cam.center[2])
      );
      this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
      this.renderer.state.reset();
      this.renderer.render(this.scene, this.camera);
      this.gifRenderer.render(this.scene, this.camera);
      // 请求重绘视图。
      externalRenderers.requestRender(this.view);
      // cleanup
      context.resetWebGLState();
    },
    initevent: function () {
      var _self = this
      if (!_self.view) {
        return
      }
      _self.view.on("click", function (event) {
        if (!_self.points.length) {
          _return;
        } else {
          var distances = _self.points.map(function (point) {
            let pointorigin = new Point({
              x: point.x,
              y: point.y,
              spatialReference: SpatialReference.WebMercator
            });
            var graphicPoint = _self.view.toScreen(pointorigin);
            return Math.sqrt(
              (graphicPoint.x - event.x) * (graphicPoint.x - event.x) +
              (graphicPoint.y - event.y) * (graphicPoint.y - event.y)
            );
          })

          var minIndex = 0;
          distances.forEach(function (distance, i) {
            if (distance < distances[minIndex]) {
              minIndex = i;
            }
          });
          var minDistance = distances[minIndex];
          if (minDistance > 35) {
            // _self.callback(null)
          } else {
            _self.callback(_self.points[minIndex])
          }
        }
      });

      _self.view.on("pointer-move", function (event) {
        if (!_self.points.length) {
          // _self.callback(null)
        } else {
          var distances = _self.points.map(function (point) {
            let pointorigin = new Point({
              x: point.x,
              y: point.y,
              spatialReference: SpatialReference.WebMercator
            });
            var graphicPoint = _self.view.toScreen(pointorigin);
            return Math.sqrt(
              (graphicPoint.x - event.x) * (graphicPoint.x - event.x) +
              (graphicPoint.y - event.y) * (graphicPoint.y - event.y)
            );
          })

          var minIndex = 0;
          distances.forEach(function (distance, i) {
            if (distance < distances[minIndex]) {
              minIndex = i;
            }
          });
          var minDistance = distances[minIndex];
          if (minDistance > 35) {
            // _self.callbackPointermove(null)
          } else {
            _self.callbackPointermove(_self.points[minIndex])
          }
        }
      });
    },

    dispose: function (content) {}
  });
  return flashgiflayer
});