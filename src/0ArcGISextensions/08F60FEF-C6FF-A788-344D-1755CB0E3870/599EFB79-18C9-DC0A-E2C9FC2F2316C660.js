;
define(["dojo/_base/declare", "dojo/_base/lang", "esri/geometry/Point", "esri/geometry/SpatialReference"], function (h, i, n, j) {
    return h("EchartsglLayer", null, {
        name: "EchartsglLayer",
        view: null,
        box: null,
        chart: null,
        chartOption: null,
        echartlayerid: null,
        visible: true,
        constructor: function (a, b, c) {
            echarts.registerCoordinateSystem('arcgis', this.getE3CoordinateSystem(a));
            this.init(a, b, c)
        },
        init: function (a, b, c) {
            this.echartlayerid = c;
            this.setBaseMap(a);
            this.createLayer()
        },
        setBaseMap: function (a) {
            this.view = a
        },
        setChartOption: function (a) {
            this.chartOption = a;
            this.setCharts()
        },
        setVisible: function (a) {
            if (!this.box || this.visible === a) return;
            this.box.hidden = !a;
            this.visible = a;
            a === true && setCharts()
        },
        refreshBegin: function () {
            this.box.hidden = true
        },
        refreshing: function () {
            setCharts()
        },
        refreshEnd: function () {
            this.box.hidden = false
        },
        on: function (a, b, c) {
            this.chart.on(a, b, c)
        },
        off: function (a, b, c) {
            this.chart.off(a, b, c)
        },
        map_DragStart_Listener: null,
        map_DragEnd_Listener: null,
        map_ZoomStart_Listener: null,
        map_ZoomEnd_Listener: null,
        map_ExtentChange_Listener: null,
        map_click_Listener: null,
        setCharts: function () {
            if (!this.visible) return;
            if (this.chartOption == null || this.chartOption == 'undefined') return;
            let baseExtent = this.view.extent;
            this.chartOption.xAxis = {
                show: false,
                min: baseExtent.xmin,
                max: baseExtent.xmax
            };
            this.chartOption.yAxis = {
                show: false,
                min: baseExtent.ymin,
                max: baseExtent.ymax
            };
            this.chart.setOption(this.chartOption);
            this.chartOption.animation = true
        },
        createLayer: function () {
            let box = this.box = document.createElement("div");
            box.setAttribute("id", this.echartlayerid) 
            box.setAttribute("name", this.echartlayerid) 
            box.style.width = this.view.width + 'px';
            box.style.height = this.view.height + 'px';
            box.style.position = "absolute";
            box.style.top = 0;
            box.style.left = 0;
            let parent = document.getElementsByClassName("esri-view-surface")[0];
            parent.appendChild(box);
            this.chart = echarts.init(box);
            this.startMapEventListeners()
        },
        removeLayer: function () {
            this.box.outerHTML = "";
            this.view = null;
            this.box = null;
            this.originLyr = null;
            this.features = null;
            this.screenData = [];
            this.chart = null;
            this.chartOption = null;
            this.map_DragStart_Listener.remove();
            this.map_DragEnd_Listener.remove();
            this.map_ZoomStart_Listener.remove();
            this.map_ZoomEnd_Listener.remove();
            this.map_ExtentChange_Listener.remove()
        },
        startMapEventListeners: function () {
            let view = this.view;
            view.watch("extent", i.hitch(this, function () {
                if (!this.visible) return;
                this.setCharts();
                this.chart.resize();
                this.box.hidden = false
            }));
            view.watch("rotation", i.hitch(this, function () {
                if (!this.visible) return;
                this.setCharts();
                this.chart.resize();
                this.box.hidden = false
            }))
        },
        getE3CoordinateSystem: function (f) {
            var g = function g(a) {
                this.map = a;
                this._mapOffset = [0, 0]
            };
            g.create = function (b) {
                b.eachSeries(function (a) {
                    if (a.get('coordinateSystem') === 'arcgis') {
                        a.coordinateSystem = new g(f)
                    }
                })
            };
            g.getDimensionsInfo = function () {
                return ['x', 'y']
            };
            g.dimensions = ['x', 'y'];
            g.prototype.dimensions = ['x', 'y'];
            g.prototype.setMapOffset = function setMapOffset(a) {
                this._mapOffset = a
            }
            g.prototype.dataToPoint = function dataToPoint(a) {
                var b;
                if (f.spatialReference.wkt === null) {
                    b = new j(102100)
                } else {
                    b = new j({
                        wkt: f.spatialReference.wkt
                    })
                }
                var c = {
                    type: "point",
                    x: a[0],
                    y: a[1],
                    spatialReference: b
                };
                var d = f.toScreen(c);
                var e = this._mapOffset;
                return [d.x - e[0], d.y - e[1]]
            }
            g.prototype.pointToData = function pointToData(a) {
                var b = this._mapOffset;
                var c = {
                    x: a[0] + b[0],
                    y: a[1] + b[1]
                };
                var d = f.toMap(c);
                return [d.x, d.y]
            };
            g.prototype.getViewRect = function getViewRect() {
                return new graphic.BoundingRect(0, 0, this.map.width, this.map.height)
            };
            g.prototype.getRoamTransform = function getRoamTransform() {
                return matrix.create()
            };
            return g
        }
    })
});