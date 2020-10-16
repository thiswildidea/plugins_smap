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
  var THREE = window.THREE;

  var esriHeatmap3dLayer = declare(null, {
    constructor: function (view, options) {
      this.view = view,
        this.datas = options.datas;
      this.absoluteheight = options.absoluteheight || 1
      this.width = options.width || 0;
      this.height = options.height || 0;
      this.indexwidth = options.indexwidth || 0;
      this.indexheight = options.indexheight || 0;
      this.select3D = options.select3D === undefined ? false : options.select3D;
      this.zdata = null;
      this.timedata = [];
      this.wireframe= options.wireframe || true,
      this.xmin = options.xmin;
      this.ymin = options.ymin;
      this.xmax = options.xmax;
      this.ymax = options.ymax;
      this.minValue = options.minValue;
      this.maxValue = options.maxValue;
      this.dataArr = [];
      this.nowNum = 0;
      this.pixelSizeX = 0.01;
      this.pixelSizeY = 0.01;
    },
    setup: function (context) {
      this.renderer = new THREE.WebGLRenderer({
        context: context.gl, // 可用于将渲染器附加到已有的渲染环境(RenderingContext)中
        premultipliedAlpha: false, // renderer是否假设颜色有 premultiplied alpha. 默认为true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
      this.renderer.setViewport(0, 0, this.view.width, this.view.height); // 视口大小设置
      // this.renderer.setSize(context.camera.fullWidth, context.camera.fullHeight);

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

      this.scene = new THREE.Scene();
      // setup the camera
      var cam = context.camera;
      this.camera = new THREE.PerspectiveCamera(cam.fovY, cam.aspect, cam.near, cam.far);


      // 添加坐标轴辅助工具
      const axesHelper = new THREE.AxesHelper(1);
      axesHelper.position.copy(1000000, 100000, 100000);
      this.scene.add(axesHelper);

      // setup scene lighting
      this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(this.ambient);
      this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
      this.sun.position.set(-600, 300, 60000);
      this.scene.add(this.sun);
      var geometry = this.changeCoordinate(this.datas);
      var canvas = this.produceCanvas(this.datas);
      var ground = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        map: new THREE.CanvasTexture(canvas),
        // 透明度设置 0921
        wireframe: this.wireframe,
        opacity: 0.5,
        transparent: true
      }))
      this.scene.add(ground);
      context.resetWebGLState();
    },
    render: function (context) {
      var cam = context.camera;
      //需要调整相机的视角
      this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
      this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
      this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));
      // Projection matrix can be copied directly
      this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
      // update lighting
      /////////////////////////////////////////////////////////////////////////////////////////////////////
      // view.environment.lighting.date = Date.now();
      var l = context.sunLight;
      this.sun.position.set(
        l.direction[0],
        l.direction[1],
        l.direction[2]
      );
      this.sun.intensity = l.diffuse.intensity;
      this.sun.color = new THREE.Color(l.diffuse.color[0], l.diffuse.color[1], l.diffuse.color[2]);
      this.ambient.intensity = l.ambient.intensity;
      this.ambient.color = new THREE.Color(l.ambient.color[0], l.ambient.color[1], l.ambient.color[2]);
      // draw the scene
      /////////////////////////////////////////////////////////////////////////////////////////////////////
      // this.renderer.resetGLState();
      this.renderer.state.reset();
      this.renderer.render(this.scene, this.camera);
      // as we want to smoothly animate the ISS movement, immediately request a re-render
      externalRenderers.requestRender(this.view);
      // cleanup
      context.resetWebGLState();
    },
    produceColor: function (data) {
      var colorArr = [];
      for (var i = 0; i < data.length; i++) {
        colorArr[i] = [];
        for (var j = 0; j < data[i].length; j++) {
          if ((data[i][j] - this.minValue) <= (this.maxValue - this.minValue) / 2) {
            colorArr[i][j] = [(data[i][j] - this.minValue) * 255 / ((this.maxValue - this.minValue) / 2), 255, 0]
          } else {
            colorArr[i][j] = [255, (this.maxValue - data[i][j]) * 255 / ((this.maxValue - this.minValue) / 2), 0]
          }
        }
      }
      return colorArr
    },

    produceCanvas: function (data) {
      var colorArr = this.produceColor(data);
      var canvas = document.createElement("canvas");
      canvas.width = data[0].length;
      canvas.height = data.length;
      var context = canvas.getContext("2d");
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      var pixels = imageData.data;
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
          if (data[i][j] > 0) {
            pixels[(i * data[i].length + j) * 4] = colorArr[i][j][0];
            pixels[(i * data[i].length + j) * 4 + 1] = colorArr[i][j][1];
            pixels[(i * data[i].length + j) * 4 + 2] = colorArr[i][j][2];
            pixels[(i * data[i].length + j) * 4 + 3] = 255;
          }
        }
      }
      context.putImageData(imageData, 0, 0);
      return canvas;
    },
    changeCoordinate: function (data) {
      this.width = data[0].length;
      this.height = data.length;
      var allnum = this.width * this.height * 3
      var arr = new Array(allnum);
      var begin = new Array(allnum);
      var tempArray = [];
      var tempZ;

      for (var i = 0; i < this.width * this.height; i++) {
        begin[i * 3] = this.xmin + (i % this.width) * ((this.xmax - this.xmin) / this.width);
        begin[i * 3 + 1] = this.ymax - (Math.floor(i / this.width)) * ((this.ymax - this.ymin) / this.height);
        if (this.select3D) {
          // begin[i * 3 + 2] = (data[Math.floor(i / width)][i % width]) * 500000 + 10000 * (indexheight + 1) ;
          // begin[i * 3 + 2] = ((data[Math.floor(i / width)][i % width]) * 500 + 10000 * (indexheight + 1));
          tempZ = (((data[Math.floor(i / this.width)][i % this.width]) * 500 + 10000 * (this.indexheight + 1))) / 10;
          // tempZ = (((data[Math.floor(i / width)][i % width]) * 500 + 10000 * (indexheight + 1)));
          begin[i * 3 + 2] = tempZ - (1000 - 10);
          tempArray.push(tempZ);
        } else {
          // begin[i * 3 + 2] = 10000 * (indexheight + 1);
          begin[i * 3 + 2] = 100;
        }
        // begin[i*3+2]=250;
      }
      tempArray.sort();
      externalRenderers.toRenderCoordinates(this.view, begin, 0, null, arr, 0, this.width * this.height);
      var ground_geometry = new THREE.PlaneGeometry(100, 100, this.width - 1, this.height - 1);
      var arrarr = [];
      for (var i = 0; i < ground_geometry.vertices.length; i++) {
        var vertex = ground_geometry.vertices[i];
        vertex.x = arr[i * 3];
        vertex.y = arr[i * 3 + 1];
        vertex.z = arr[i * 3 + 2];
        if (Math.abs(arr[i * 3 + 2]) < 100000000) {
          arrarr.push(arr[i * 3 + 2])
        }
      }
      ground_geometry.computeFaceNormals();
      ground_geometry.computeVertexNormals();
      this.changeLine(data);
      return ground_geometry;
    },
    changeLine: function (data) {
      var dataMinMax = [];
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
          dataMinMax.push(data[i][j]);
        }
      }

    },

    dispose: function (content) {}
  });
    return esriHeatmap3dLayer
});