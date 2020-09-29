;
define(['dojo/_base/declare',], function (i,) {
    var j = i([], {
        constructor: function (a) {
            a = a || {};
            this.gradient = a.gradient || {
                0.25: 'rgba(0, 0, 255, 1)',
                0.55: 'rgba(0, 255, 0, 1)',
                0.85: 'rgba(255, 255, 0, 1)',
                1.0: 'rgba(255, 0, 0, 1)'
            };
            this.maxSize = a.maxSize || 35;
            this.minSize = a.minSize || 0;
            this.max = a.max || 100;
            this.min = a.min || 0;
            this.initPalette()
        },
        setMax: function (a) {
            this.max = a || 100
        },
        setMin: function (a) {
            this.min = a || 0
        },
        setMaxSize: function (a) {
            this.maxSize = a || 35
        },
        setMinSize: function (a) {
            this.minSize = a || 0
        },
        initPalette: function () {
            var a = this.gradient;
            var b = this.Canvas(256, 1);
            var c = this.paletteCtx = b.getContext('2d');
            var d = c.createLinearGradient(0, 0, 256, 1);
            for (var e in a) {
                d.addColorStop(parseFloat(e), a[e])
            }
            c.fillStyle = d;
            c.fillRect(0, 0, 256, 1)
        },
        getColor: function (a) {
            var b = this.getImageData(a);
            return 'rgba(' + b[0] + ', ' + b[1] + ', ' + b[2] + ', ' + b[3] / 256 + ')'
        },
        getImageData: function (a) {
            var b = this.paletteCtx.getImageData(0, 0, 256, 1).data;
            if (a === undefined) {
                return b
            }
            var c = this.max;
            var d = this.min;
            if (a > c) {
                a = c
            }
            if (a < d) {
                a = d
            }
            var e = Math.floor((a - d) / (c - d) * (256 - 1)) * 4;
            return [b[e], b[e + 1], b[e + 2], b[e + 3]]
        },
        getSize: function (a) {
            var b = 0;
            var c = this.max;
            var d = this.min;
            var e = this.maxSize;
            var f = this.minSize;
            if (a > c) {
                a = c
            }
            if (a < d) {
                a = d
            }
            if (c > d) {
                b = f + (a - d) / (c - d) * (e - f)
            } else {
                return e
            }
            return b
        },
        getLegend: function (a) {
            var b = this.gradient;
            var c = a.width || 20;
            var d = a.height || 180;
            var e = this.Canvas(c, d);
            var f = e.getContext('2d');
            var g = f.createLinearGradient(0, d, 0, 0);
            for (var h in b) {
                g.addColorStop(parseFloat(h), b[h])
            }
            f.fillStyle = g;
            f.fillRect(0, 0, c, d);
            return e
        },
        Canvas: function (a = 1, b = 1) {
            let canvas;
            if (typeof document === 'undefined') { } else {
                canvas = document.createElement('canvas');
                if (a) {
                    canvas.width = a
                }
                if (b) {
                    canvas.height = b
                }
            }
            return canvas
        }
    })
    return j
});;