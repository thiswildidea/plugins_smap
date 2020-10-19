;
define(['dojo/_base/declare', 'dojo/_base/lang', ], function (c, d) {
    'use strict';
    var e = c(null, {
        constructor: function (a, b) {
            b = b || {};
            this.view = a;
            this.canvas1 = null;
            this.canvas2 = null;
            this.canvas3 = null;
            this.ctx1 = null;
            this.ctx2 = null;
            this.ctx3 = null;
            this.rainthroughnum = b.rainthroughnum || 500;
            this.speedRainTrough = b.speedRainTrough || 10;
            this.RainTrough = [];
            this.rainnum = b.rainnum || 500;
            this.rain = [];
            this.lightning = [];
            this.lightTimeCurrent = 0;
            this.lightTimeTotal = 0;
            this.w = 0;
            this.h = 0;
            this.timer = null;
            this.resizeEvent = null
        },
        animloop: function () {
            this.animateRainTrough();
            this.animateRain();
            this.animateLightning();
            this.timer = requestAnimationFrame(d.hitch(this, this.animloop))
        },
        add: function () {
            var a = this;
            this.createCanvas();
            this.createRainTrough();
            this.createRain();
            window.addEventListener('resize', d.hitch(this, this.createRainTrough));
            this.animloop()
        },
        remove: function () {
            const divs = this.view.container.querySelector("#rain") 
            divs && this.view.container.removeChild(divs);
            cancelAnimationFrame(this.timer);
            this.resizeEvent && this.resizeEvent.remove();
            this.resizeEvent = null
        },
        createCanvas: function () {
            const divs = this.view.container.querySelector("#rain") 
            divs && this.remove();
            var a = document.createElement('div');
            this.canvas1 = document.createElement('canvas');
            this.canvas2 = document.createElement('canvas');
            this.canvas3 = document.createElement('canvas');
            this.canvas1.id = 'canvas1';
            this.canvas2.id = 'canvas2';
            this.canvas3.id = 'canvas3';
            this.canvas1.style = 'position: fixed;z-index: 106';
            this.canvas2.style = 'position: fixed;z-index: 107';
            this.canvas3.style = 'position: fixed;z-index: 108';
            a.appendChild(this.canvas1);
            a.appendChild(this.canvas2);
            a.appendChild(this.canvas3);
            a.id = 'rain';
            a.setAttribute('class', 'rain') 
            a.style = 'pointer-events: none;position: absolute;z-index: 200;top:0px;left: 0px;background-color: rgba(0, 0, 0, 0.125);';
            a.style.width = this.view.width;
            a.style.height = this.view.height;
            this.view.container.appendChild(a);
            this.ctx1 = this.canvas1.getContext('2d');
            this.ctx2 = this.canvas2.getContext('2d');
            this.ctx3 = this.canvas3.getContext('2d');
            this.w = this.canvas1.width = this.canvas2.width = this.canvas3.width = this.view.width;
            this.h = this.canvas1.height = this.canvas2.height = this.canvas3.height = this.view.height;
            this.resizeEvent = this.view.watch('resize', d.hitch(this, function () {
                if (this.view.width != this.w || this.view.width != this.h) {
                    this.w = this.view.width;
                    this.h = this.view.height;
                    this.createRainTrough();
                    this.createRain();
                    this.animateRainTrough();
                    this.animateRain();
                    this.animateLightning()
                }
            }))
        },
        random: function (a, b) {
            return Math.random() * (b - a + 1) + a
        },
        clearcanvas1: function () {
            this.ctx1.clearRect(0, 0, this.w, this.h)
        },
        clearcanvas2: function () {
            this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height)
        },
        clearCanvas3: function () {
            this.ctx3.globalCompositeOperation = 'destination-out';
            this.ctx3.fillStyle = 'rgba(0,0,0,' + this.random(1, 30) / 100 + ')';
            this.ctx3.fillRect(0, 0, this.w, this.h);
            this.ctx3.globalCompositeOperation = 'source-over'
        },
        createRainTrough: function () {
            for (var i = 0; i < this.rainthroughnum; i++) {
                this.RainTrough[i] = {
                    x: this.random(0, this.w),
                    y: this.random(0, this.h),
                    length: Math.floor(this.random(1, 100)),
                    opacity: Math.random() * 1,
                    xs: this.random(-2, 2),
                    ys: this.random(10, 20),
                }
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
                }
            }
        },
        createLightning: function () {
            var x = this.random(100, this.w - 100);
            var y = this.random(0, this.h / 4);
            var a = this.random(7, 10);
            for (var i = 0; i < a; i++) {
                var b = {
                    x: x,
                    y: y,
                    xRange: this.random(5, 30),
                    yRange: this.random(10, 25),
                    path: [{
                        x: x,
                        y: y,
                    }, ],
                    pathLimit: this.random(30, 45),
                };
                this.lightning.push(b)
            }
        },
        drawRainTrough: function (i) {
            this.ctx1.beginPath();
            var a = this.ctx1.createLinearGradient(0, this.RainTrough[i].y, 0, this.RainTrough[i].y + this.RainTrough[i].length, );
            a.addColorStop(0, 'rgba(255,255,255,0)');
            a.addColorStop(1, 'rgba(255,255,255,' + this.RainTrough[i].opacity + ')', );
            this.ctx1.fillStyle = a;
            this.ctx1.fillRect(this.RainTrough[i].x, this.RainTrough[i].y, 1, this.RainTrough[i].length, );
            this.ctx1.fill()
        },
        drawRain: function (i) {
            this.ctx2.beginPath();
            this.ctx2.moveTo(this.rain[i].x, this.rain[i].y);
            this.ctx2.lineTo(this.rain[i].x + this.rain[i].l * this.rain[i].xs, this.rain[i].y + this.rain[i].l * this.rain[i].ys, );
            this.ctx2.strokeStyle = 'rgba(174,194,224,0.5)';
            this.ctx2.lineWidth = 3;
            this.ctx2.lineCap = 'round';
            this.ctx2.stroke()
        },
        drawLightning: function () {
            for (var i = 0; i < this.lightning.length; i++) {
                var a = this.lightning[i];
                a.path.push({
                    x: a.path[a.path.length - 1].x + (this.random(0, a.xRange) - a.xRange / 2),
                    y: a.path[a.path.length - 1].y + this.random(0, a.yRange),
                });
                if (a.path.length > a.pathLimit) {
                    this.lightning.splice(i, 1)
                }
                this.ctx3.strokeStyle = 'rgba(255, 255, 255, .7)';
                this.ctx3.lineWidth = 3;
                if (this.random(0, 15) === 0) {
                    this.ctx3.lineWidth = 6
                }
                if (this.random(0, 30) === 0) {
                    this.ctx3.lineWidth = 8
                }
                this.ctx3.beginPath();
                this.ctx3.moveTo(a.x, a.y);
                for (var b = 0; b < a.path.length; b++) {
                    this.ctx3.lineTo(a.path[b].x, a.path[b].y)
                }
                if (Math.floor(this.random(0, 30)) === 1) {
                    this.ctx3.fillStyle = 'rgba(255, 255, 255, ' + this.random(1, 3) / 100 + ')';
                    this.ctx3.fillRect(0, 0, this.w, this.h)
                }
                this.ctx3.lineJoin = 'miter';
                this.ctx3.stroke()
            }
        },
        animateRainTrough: function () {
            this.clearcanvas1();
            for (var i = 0; i < this.rainthroughnum; i++) {
                if (this.RainTrough[i].y >= this.h) {
                    this.RainTrough[i].y = this.h - this.RainTrough[i].y - this.RainTrough[i].length * 5
                } else {
                    this.RainTrough[i].y += this.speedRainTrough
                }
                this.drawRainTrough(i)
            }
        },
        animateRain: function () {
            this.clearcanvas2();
            for (var i = 0; i < this.rainnum; i++) {
                this.rain[i].x += this.rain[i].xs;
                this.rain[i].y += this.rain[i].ys;
                if (this.rain[i].x > this.w || this.rain[i].y > this.h) {
                    this.rain[i].x = Math.random() * this.w;
                    this.rain[i].y = -20
                }
                this.drawRain(i)
            }
        },
        animateLightning: function () {
            this.clearCanvas3();
            this.lightTimeCurrent++;
            if (this.lightTimeCurrent >= this.lightTimeTotal) {
                this.createLightning();
                this.lightTimeCurrent = 0;
                this.lightTimeTotal = 200
            }
            this.drawLightning()
        },
        dispose: function (a) {},
    });
    return e
});;