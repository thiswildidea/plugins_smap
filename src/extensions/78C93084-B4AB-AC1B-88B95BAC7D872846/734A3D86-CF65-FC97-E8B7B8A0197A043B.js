;
define(["dojo/_base/declare", "dojo/_base/lang", "esri/geometry/Point", "esri/geometry/SpatialReference"], function (f, g, h, j) {
    return f("HeatMapLayer", null, {
        name: "HeatMapLayer",
        view: null,
        box: null,
        heatmap: null,
        config: null,
        visible: true,
        data: null,
        id: null,
        constructor: function (a, b, c, d, e) {
            this.init(a, b, c, d, e)
        },
        init: function (a, b, c, d, e) {
            this.setBaseMap(a);
            this.createDIV(e);
            this.defaultConfig();
            if (b) {
                this.setConfig(b)
            }
            this.createLayer(d);
            this.setData(c) 
            this.startMapEventListeners()
        },
        setBaseMap: function (a) {
            this.view = a
        },
        defaultConfig: function () {
            this.config = {
                container: this.box,
                radius: 40,
                debug: false,
                visible: true,
                useLocalMaximum: false,
                gradient: {
                    0.45: "rgb(000,000,255)",
                    0.55: "rgb(000,255,255)",
                    0.65: "rgb(000,255,000)",
                    0.95: "rgb(255,255,000)",
                    1.00: "rgb(255,000,000)"
                }
            }
        },
        setConfig: function (a) {
            this.config = {
                container: this.box,
                radius: a.radius,
                maxOpacity: a.maxOpacity,
                minOpacity: a.minOpacity,
                debug: false,
                visible: true,
                useLocalMaximum: false,
                gradient: a.gradient
            }
        },
        setData: function (a) {
            this.data = a
        },
        setVisible: function (a) {
            if (!this.box || this.visible === a) return;
            this.box.hidden = !a;
            this.visible = a;
            a === true
        },
        refreshBegin: function () {
            this.box.hidden = true
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
        createDIV: function (a) {
            this.id = a 
            this.box = document.createElement("div");
            this.box.setAttribute("id", this.id);
            this.box.style.width = this.view.width + 'px';
            this.box.style.height = this.view.height + 'px';
            this.box.style.position = "absolute";
            this.box.style.top = 0;
            this.box.style.left = 0;
            let parent = this.view.container.getElementsByClassName("esri-view-surface")[0];
            parent.appendChild(this.box)
        },
        createLayer: function (a) {
            this.heatmap = a.create(this.config)
        },
        convertHeatmapData: function (a) {
            var b = {
                max: this.MaxValue(a),
                data: []
            };
            if (a[1].length == 2) {
                for (var i = 0; i < a.length; i++) {
                    var c = this.view.toScreen(new h({
                        x: a[i][0],
                        y: a[i][1],
                        spatialReference: {
                            wkid: 3857
                        },
                    }));
                    b.data.push({
                        x: Math.round(c.x),
                        y: Math.round(c.y),
                        value: 1
                    })
                }
            } else {
                for (var i = 0; i < a.length; i++) {
                    var c = this.view.toScreen(new h({
                        x: a[i][0],
                        y: a[i][1],
                        spatialReference: {
                            wkid: 3857
                        },
                    }));
                    b.data.push({
                        x: Math.round(c.x),
                        y: Math.round(c.y),
                        value: a[i][2]
                    })
                }
            }
            return b
        },
        MaxValue: function (a) {
            var b = 2.5;
            if (a) {
                if (a[1].length == 3) {
                    for (var i = 0; i < a.length; i++) {
                        if (b <= a[i][2]) {
                            b = a[i][2]
                        }
                    }
                } else {}
            }
            return b
        },
        addData: function () {
            let data = this.convertHeatmapData(this.data)
             this.heatmap.setData(data);
            this.box.style.position = "absolute"
        },
        freshenLayerData: function (a) {
            let data = this.convertHeatmapData(a) 
            this.heatmap.setData({
                max: 1,
                data: []
            });
            this.heatmap.setData(data);
            this.box.style.position = "absolute"
        },
        freshenLayer: function () {
            this.heatmap.setData({
                max: 1,
                data: []
            });
            this.addData()
        },
        clearData: function () {
            this.heatmap.clear();
            var a = [];
            this.heatmap.setData(a)
        },
        removeLayer: function () {
            this.clearData();
            this.box.outerHTML = "";
            this.view = null;
            this.box = null;
            this.config = null;
            this.data = null;
            this.map_DragStart_Listener.remove();
            this.map_DragEnd_Listener.remove();
            this.map_ZoomStart_Listener.remove();
            this.map_ZoomEnd_Listener.remove();
            this.map_ExtentChange_Listener.remove()
        },
        startMapEventListeners: function () {
            let view = this.view;
            view.watch("extent", g.hitch(this, function () {
                if (!this.visible) return;
                this.freshenLayer();
                this.box.hidden = false
            }));
            view.watch("camera", g.hitch(this, function () {
                if (!this.visible) return;
                this.freshenLayer();
                this.box.hidden = false
            }))
        }
    })
});