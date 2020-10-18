define([
  'dojo/_base/declare',
  'dojo/_base/lang',
], function (declare, lang) {
  // Enforce strict mode
  'use strict';
  var RainLayer = declare(null, {
    constructor: function (view, options) {
      options = options || {};
      this.view = view;
      this.canvas1 = null;
      this.canvas2 = null;
      this.canvas3 = null;
      this.ctx1 = null;
      this.ctx2 = null;
      this.ctx3 = null;
      this.rainthroughnum = options.rainthroughnum || 500;//密度
      this.speedRainTrough = options.speedRainTrough || 10;//雨速
      this.RainTrough = [];
      this.rainnum = options.rainnum || 500;
      this.rain = [];
      this.lightning = [];
      this.lightTimeCurrent = 0;
      this.lightTimeTotal = 0;
      this.w = 0;
      this.h = 0;
      this.timer = null;
      this.resizeEvent = null;
    },
    animloop: function () {
      this.animateRainTrough();
      this.animateRain();
      this.animateLightning();
      this.timer = requestAnimationFrame(lang.hitch(this, this.animloop));
    },
    add: function () {
      var _this = this;
      this.createCanvas();
      this.createRainTrough();
      this.createRain();
      window.addEventListener('resize', lang.hitch(this, this.createRainTrough));
      this.animloop();
    },
    remove: function () {
		const divs =this.view.container.querySelector("#rain")
		if(divs){
           this.view.container.removeChild(divs);
		}
      cancelAnimationFrame(this.timer);
      this.resizeEvent.remove();
      this.resizeEvent=null;
    },
    createCanvas: function () {
		
      if (this.view.container.getElementsByClassName('rain')[0]) {
        this.remove();
      }
      var rainDiv = document.createElement('div');
      this.canvas1 = document.createElement('canvas');
      this.canvas2 = document.createElement('canvas');
      this.canvas3 = document.createElement('canvas');
      this.canvas1.id = 'canvas1';
      this.canvas2.id = 'canvas2';
      this.canvas3.id = 'canvas3';
      this.canvas1.style = 'position: fixed;z-index: 106';
      this.canvas2.style = 'position: fixed;z-index: 107';
      this.canvas3.style = 'position: fixed;z-index: 108';
      rainDiv.appendChild(this.canvas1);
      rainDiv.appendChild(this.canvas2);
      rainDiv.appendChild(this.canvas3);
      rainDiv.id = 'rain';
	  rainDiv.setAttribute('class', 'rain')
      rainDiv.style = 'pointer-events: none;position: absolute;z-index: 200;left: 0px;background-color: rgba(0, 0, 0, 0.125);';
      rainDiv.style.width = this.view.width;
      rainDiv.style.height = this.view.height;
      this.view.container.appendChild(rainDiv);
      this.ctx1 = this.canvas1.getContext('2d');
      this.ctx2 = this.canvas2.getContext('2d');
      this.ctx3 = this.canvas3.getContext('2d');
      this.w = this.canvas1.width = this.canvas2.width = this.canvas3.width = this.view.width;
      this.h = this.canvas1.height = this.canvas2.height = this.canvas3.height = this.view.height;
      this.resizeEvent=this.view.watch('resize', lang.hitch(this, function () {
        if (this.view.width != this.w || this.view.width != this.h) {
          this.w = this.view.width;
          this.h = this.view.height;
          this.createRainTrough();
          this.createRain();
          this.animateRainTrough();
          this.animateRain();
          this.animateLightning();
        }
      }));
    },
    random: function (min, max) {
      return Math.random() * (max - min + 1) + min;
    },
    clearcanvas1: function () {
      this.ctx1.clearRect(0, 0, this.w, this.h);
    },
    clearcanvas2: function () {
      this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
    },
    clearCanvas3: function () {
      this.ctx3.globalCompositeOperation = 'destination-out';
      this.ctx3.fillStyle = 'rgba(0,0,0,' + this.random(1, 30) / 100 + ')';
      this.ctx3.fillRect(0, 0, this.w, this.h);
      this.ctx3.globalCompositeOperation = 'source-over';
    },
    createRainTrough: function () {
      for (var i = 0; i < this.rainthroughnum; i++) {
        this.RainTrough[i] = {
          x: this.random(0, this.w),
          y: this.random(0, this.h),
          // length: Math.floor(random(1, 830)), // 雨滴长度
          length: Math.floor(this.random(1, 100)),
          // opacity: Math.random() * 0.2, // 雨滴透明度
          opacity: Math.random() * 1,
          xs: this.random(-2, 2),
          ys: this.random(10, 20),
        };
      }
    },
    createRain: function () {
      for (var i = 0; i < this.rainnum; i++) {
        this.rain[i] = {
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          l: Math.random() * 1,
          xs: -4 + Math.random() * 4 + 2,
          ys: Math.random() * 10 + 10,
        };
      }
    },
    // 创建闪电
    createLightning: function () {
      var x = this.random(100, this.w - 100);
      var y = this.random(0, this.h / 4);

      // var createCount = random(1, 3);
      var createCount = this.random(7, 10);
      for (var i = 0; i < createCount; i++) {
        var single = {
          x: x,
          y: y,
          xRange: this.random(5, 30),
          yRange: this.random(10, 25),
          path: [
            {
              x: x,
              y: y,
            },
          ],
          // pathLimit: random(40, 55) //闪电长度
          pathLimit: this.random(30, 45),
        };
        this.lightning.push(single);
      }
    },
    drawRainTrough: function (i) {
      this.ctx1.beginPath();
      var grd = this.ctx1.createLinearGradient(
        0,
        this.RainTrough[i].y,
        0,
        this.RainTrough[i].y + this.RainTrough[i].length,
      );
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(
        1,
        'rgba(255,255,255,' + this.RainTrough[i].opacity + ')',
      );

      this.ctx1.fillStyle = grd;
      this.ctx1.fillRect(
        this.RainTrough[i].x,
        this.RainTrough[i].y,
        1,
        this.RainTrough[i].length,
      );
      this.ctx1.fill();
    },
    drawRain: function (i) {
      this.ctx2.beginPath();
      this.ctx2.moveTo(this.rain[i].x, this.rain[i].y);
      this.ctx2.lineTo(
        this.rain[i].x + this.rain[i].l * this.rain[i].xs,
        this.rain[i].y + this.rain[i].l * this.rain[i].ys,
      );
      this.ctx2.strokeStyle = 'rgba(174,194,224,0.5)';
      // ctx2.lineWidth = 1; // 雨滴宽度
      this.ctx2.lineWidth = 3;
      this.ctx2.lineCap = 'round';
      this.ctx2.stroke();
    },
    // 绘制闪电
    drawLightning: function () {
      for (var i = 0; i < this.lightning.length; i++) {
        var light = this.lightning[i];

        light.path.push({
          x:
            light.path[light.path.length - 1].x +
            (this.random(0, light.xRange) - light.xRange / 2),
          y:
            light.path[light.path.length - 1].y +
            this.random(0, light.yRange),
        });

        if (light.path.length > light.pathLimit) {
          this.lightning.splice(i, 1);
        }

        // ctx3.strokeStyle = 'rgba(255, 255, 255, .1)'; // 闪电透明度
        this.ctx3.strokeStyle = 'rgba(255, 255, 255, .7)';
        this.ctx3.lineWidth = 3;
        if (this.random(0, 15) === 0) {
          this.ctx3.lineWidth = 6;
        }
        if (this.random(0, 30) === 0) {
          this.ctx3.lineWidth = 8;
        }
        this.ctx3.beginPath();
        this.ctx3.moveTo(light.x, light.y);
        for (var pc = 0; pc < light.path.length; pc++) {
          this.ctx3.lineTo(light.path[pc].x, light.path[pc].y);
        }
        if (Math.floor(this.random(0, 30)) === 1) {
          //to fos apo piso
          this.ctx3.fillStyle =
            'rgba(255, 255, 255, ' + this.random(1, 3) / 100 + ')';
          this.ctx3.fillRect(0, 0, this.w, this.h);
        }
        this.ctx3.lineJoin = 'miter';
        this.ctx3.stroke();
      }
    },
    animateRainTrough: function () {
      this.clearcanvas1();
      for (var i = 0; i < this.rainthroughnum; i++) {
        if (this.RainTrough[i].y >= this.h) {
          this.RainTrough[i].y =
            this.h - this.RainTrough[i].y - this.RainTrough[i].length * 5;
        } else {
          this.RainTrough[i].y += this.speedRainTrough;
        }
        this.drawRainTrough(i);
      }
    },
    animateRain: function () {
      this.clearcanvas2();
      for (var i = 0; i < this.rainnum; i++) {
        this.rain[i].x += this.rain[i].xs;
        this.rain[i].y += this.rain[i].ys;
        if (this.rain[i].x > this.w || this.rain[i].y > this.h) {
          this.rain[i].x = Math.random() * this.w;
          this.rain[i].y = -20;
        }
        this.drawRain(i);
      }
    },
    animateLightning: function () {
      this.clearCanvas3();
      this.lightTimeCurrent++;
      if (this.lightTimeCurrent >= this.lightTimeTotal) {
        this.createLightning();
        this.lightTimeCurrent = 0;
        this.lightTimeTotal = 200; //rand(100, 200)
      }
      this.drawLightning();
    },
    dispose: function (content) { },
  });
  return RainLayer
});