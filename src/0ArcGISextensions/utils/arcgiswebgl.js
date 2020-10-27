define([
    'dojo/_base/declare',
    "esri/geometry/geometryEngine",
    "esri/geometry/Extent",
    "esri/views/3d/externalRenderers",
    "esri/geometry/Polygon",
    "esri/geometry/Point",
    "esri/geometry/support/webMercatorUtils"
], function (
    declare,
    geometryEngine,
    Extent,
    externalRenderers,
    Polygon,
    Point,
    webMercatorUtils
) {
    var ArcLineRenderer = declare([], {
        constructor: function (setup, render) {
            this.setup = setup;
            this.render = render;
        },
        setup: function (context) {
            this.setup(context);
        },
        render: function (context) {
            this.render(context);
        }
    });
    return ArcLineRenderer;
});