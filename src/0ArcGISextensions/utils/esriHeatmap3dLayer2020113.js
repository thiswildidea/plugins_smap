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

  var Heatmap3dLayer = declare(null, {
    constructor: function (view, options) {
      this.view = view,
      this.datas = options.datas;
      this.select3D = options.select3D === undefined ? false : options.select3D;
      this.xmin = options.xmin;
      this.ymin = options.ymin;
      this.xmax = options.xmax;
      this.ymax = options.ymax;
      this.groundZ = options.groundZ || 200;
      this.pixelValueZ = options.pixelValueZ || 1300;
      this.noDataValue = options.noDataValue || -3.4028234663852886e+38;
      this.extent4rasterTif = null;
      this.extentData = options.extentData || { xmin: this.xmin, ymin: this.ymin, xmax: this.xmax, ymax: this.ymax };
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
      const axesHelper = new THREE.AxesHelper(0);
      this.scene.add(axesHelper);

      // setup scene lighting
      this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(this.ambient);
      this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
      this.sun.position.set(-600, 300, 60000);
      this.scene.add(this.sun);
      var pixelValueArray = this.datas.data;
      //this.extentData = this.datas.extent;
      this.extent4rasterTif = {
        type: "extent", // autocasts as new Extent()
        xmin: this.extentData.xmin,
        ymin: this.extentData.ymin,
        xmax: this.extentData.xmax,
        ymax: this.extentData.ymax,
        spatialReference: this.view.spatialReference
      };
      // 计算像素值的最大值最小值及归一化系数 start 20201026
      // 像素值最大值固定归一到255,方便设置颜色：红色 255,0,0  绿色 0,255,0 黄色 255,255,0
      // 计算像素值的最大值最小值及归一化系数 end 20201026
      var pixelValueObj = this.getPixelValueBoundary(pixelValueArray);
      if (pixelValueObj.dataUpdated) {
        pixelValueArray = pixelValueObj.dataNew; // 更新数据 20201029
      }
      var geometry = this.changeCoordinate(pixelValueArray, pixelValueObj);
      var canvas = this.produceCanvas(pixelValueArray, pixelValueObj);
      var ground = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        map: new THREE.CanvasTexture(canvas),
        // color: 0x800080,
        // 透明度设置 0921
        opacity: 0.5,
        wireframe: true, // 20201016 设置wireframe属性，显示网格顶点,
        transparent: true,
        side: THREE.DoubleSide
      }));

      this.scene.add(ground);
      console.log("使用数据绘制三维热力图end,当前时间：" + new Date());
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
    produceColor: function (data, pixelValueObj) {
      var colorArr = [];
      var width4color = data[0].length;
      var height4color = data.length;
      var minPixelValue = pixelValueObj.minPixelValue;
      var maxPixelValue = pixelValueObj.maxPixelValue;
      var middlePixelValue = (maxPixelValue - minPixelValue) / 2;
      // 渐变思路： 20201026
      //    数值均分两份，
      //     数值小的一份由绿到黄渐变, 0,255,0 -> 255,255,0 r分量逐渐变大
      //     数值大的一份由黄到红渐变, 255,255,0 -> 255,0,0 g分量逐渐变小
      for (var i = 0; i < data.length; i++) {
        colorArr[i] = [];
        for (var j = 0; j < data[i].length; j++) {
          if (data[i][j] <= middlePixelValue) { // 如果像素值小于中间值,则由绿到黄渐变 r分量逐渐变大
            colorArr[i][j] = ([(data[i][j] - minPixelValue) * 255 / middlePixelValue, 255, 0]);
          } else { // 如果像素值大于中间值,则由黄到红渐变 g分量逐渐变小
            colorArr[i][j] = ([255, (maxPixelValue - data[i][j]) * 255 / middlePixelValue, 0]);
          }
        }
      }
      return colorArr;
    },
    produceCanvas(data, pixelValueObj) {
      var colorArr = this.produceColor(data, pixelValueObj);
      var canvas = document.createElement("canvas");
      canvas.width = data[0].length;
      canvas.height = data.length;
      var context = canvas.getContext("2d");
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      var pixels = imageData.data;
      for (var h = 0; h < data.length; h++) { // 对于栅格的每一行像素来说,h=0 第一行;h=1 第二行
        for (var w = 0; w < data[h].length; w++) { // 对于栅格的每一行像素中的各个像素来说, w=0 第h行第1列 ; w=1 第h行第2列
          if (data[h][w] * 1 != this.noDataValue) {
            pixels[(h * data[h].length + w) * 4] = colorArr[h][w][0];
            pixels[(h * data[h].length + w) * 4 + 1] = colorArr[h][w][1];
            pixels[(h * data[h].length + w) * 4 + 2] = colorArr[h][w][2];
            pixels[(h * data[h].length + w) * 4 + 3] = 255;
          }
        }
      }
      context.putImageData(imageData, 0, 0);
      return canvas;
    },
    getPixelValueBoundary(dataArray) {
      var obj = {
        dataUpdated: false
      };
      var temp = [];
      var length1 = dataArray.length;
      var length2;
      var dataArray2;
      for (let i = 0; i < length1; i += 1) {
        dataArray2 = dataArray[i];
        length2 = dataArray2.length;
        for (let j = 0; j < length2; j += 1) {
          if (dataArray2[j] * 1 !== this.noDataValue) {
            temp.push(dataArray2[j]);
          }
        }
      }
      temp.sort(this.sortNumber); // 按数字排序 20201023  像素值最小值：200,像素值最大值：1596.9633483886719
      var pmin = temp[0];
      var pmax = temp[temp.length - 1];
      console.log('像素值最小值：' + pmin + ',像素值最大值：' + pmax);
      obj.minPixelValue = pmin;
      obj.maxPixelValue = pmax;
      // 处理像素值为负值的情况 20201029 start
      if (pmin < 0) {
        var dataArrayNew = [];
        var dataArrayNewTemp2;
        for (let i2 = 0; i2 < length1; i2 += 1) {
          dataArrayNewTemp2 = [];
          dataArray2 = dataArray[i2];
          length2 = dataArray2.length;
          for (let j2 = 0; j2 < length2; j2 += 1) {
            dataArrayNewTemp2.push(dataArray2[j2] * 1 + pmin * (-1));
          }
          dataArrayNew.push(dataArrayNewTemp2);
        }
        obj.dataUpdated = true;
        obj.dataNew = dataArrayNew;
        // 重新计算 像素最小值与最大值 start
        temp = [];
        for (let i3 = 0; i3 < length1; i3 += 1) {
          dataArray2 = dataArrayNew[i3];
          length2 = dataArray2.length;
          for (let j3 = 0; j3 < length2; j3 += 1) {
            temp.push(dataArray2[j3]);
          }
        }
        temp.sort(this.sortNumber); // 按数字排序 20201023  像素值最小值：200,像素值最大值：1596.9633483886719
        var pmin2 = temp[0];
        var pmax2 = temp[temp.length - 1];
        console.log('像素值最小值2：' + pmin2 + ',像素值最大值2：' + pmax2);
        obj.minPixelValue = pmin2;
        obj.maxPixelValue = pmax2;
        // 重新计算 像素最小值与最大值 end
      }
      // 处理像素值为负值的情况 20201029 end
      return obj;
    },
    changeCoordinate: function (data, pixelValueObj) {
      // 二维数组  [[0,1,2],[0,1,2],[0,1,2],[0,1,2],[0,1,2]] 5行3列。 height=5, width=3
      // var minPixelValue = 18;
      // var maxPixelValue = 100;
      var minPixelValue = pixelValueObj.minPixelValue;
      var maxPixelValue = pixelValueObj.maxPixelValue;
      var middlePixelValue = (maxPixelValue - minPixelValue) / 2;
      // z值的区间在[0,1300]之间 效果更好看 区间可以调整
      var pixelValueCoefficient = this.pixelValueZ / maxPixelValue; // 此处的1300可以调整
      var groundZ = this.groundZ; //统一加 200高程 高于地面,此处的200可以调整
      this.width4raster = data[0].length;
      this.height4raster = data.length;
      var allnum = this.width4raster * this.height4raster * 3; //每一个像素点都有3个坐标值： x,y,z
      var arr = new Array(allnum);
      var begin = [];
      var zArrayTemp = [];
      // 重新编写 每一个像素的坐标计算的 算法 20201023 wangfh start
      // 436行 height = 436  , 252列 width = 252
      // |————————————————|
      // |————————————————|
      // |————————————————|
      // |————————————————|
      // |————————————————|
      // |————————————————|
      // |————————————————|
      // |————————————————|
      // |————————————————|
      // var width4raster = 436; // 行
      // var width4raster = 252; // 列
      // 从上往下逐行计算,从左向右逐列计算
      var xTemp;
      var yTemp;
      var zTemp;
      var interval4x = (this.extent4rasterTif.xmax - this.extent4rasterTif.xmin) / this.width4raster; //每一个像素点的坐标在x方向的坐标值
      var interval4y = (this.extent4rasterTif.ymax - this.extent4rasterTif.ymin) / this.height4raster; //每一个像素点的坐标在y方向的坐标值
      if (this.select3D) { // 三维热力图
        for (let h = 0; h < this.height4raster; h += 1) { // 对于栅格的每一行像素来说,h=0 第一行;h=1 第二行
          yTemp = this.extent4rasterTif.ymax - h * interval4y;
          for (let w = 0; w < this.width4raster; w += 1) { // 对于栅格的每一行像素中的各个像素来说, w=0 第h行第1列 ; w=1 第h行第2列
            xTemp = this.extent4rasterTif.xmin + w * interval4x;
            begin.push(xTemp); // 设置x坐标
            begin.push(yTemp); // 设置y坐标 ,每一行的y坐标都是一样的
            zTemp = data[h][w] * pixelValueCoefficient + groundZ;
            begin.push(zTemp);
            zArrayTemp.push(zTemp);
          }
        }
      } else { // 二维热力图

      }
      zArrayTemp.sort(this.sortNumber); // 按数字排序 20201023  z值最小值：200,z值最大值：1596.9633483886719
      console.log('z值最小值：' + zArrayTemp[0] + ',z值最大值：' + zArrayTemp[zArrayTemp.length - 1]);
      externalRenderers.toRenderCoordinates(this.view, begin, 0, null, arr, 0, this.width4raster * this.height4raster);

      var ground_geometry = new THREE.PlaneGeometry(100, 100, this.width4raster - 1, this.height4raster - 1);
      for (var i = 0; i < ground_geometry.vertices.length; i++) {
        var vertex = ground_geometry.vertices[i];
        vertex.x = arr[i * 3];
        vertex.y = arr[i * 3 + 1];
        vertex.z = arr[i * 3 + 2];
      }
      ground_geometry.computeFaceNormals();
      ground_geometry.computeVertexNormals();
      return ground_geometry;
    },
    sortNumber(a, b) {
      return a - b;
    },
    dispose: function (content) { }
  });
  return Heatmap3dLayer
});