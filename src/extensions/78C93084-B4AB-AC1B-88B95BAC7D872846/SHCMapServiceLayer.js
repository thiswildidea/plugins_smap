var __extends = (this && this.__extends) || (function() {
  var extendStatics = Object.setPrototypeOf ||
    ({
        __proto__: []
      }
      instanceof Array && function(d, b) {
        d.__proto__ = b;
      }) ||
    function(d, b) {
      for (var p in b)
        if (b.hasOwnProperty(p)) d[p] = b[p];
    };
  return function(d, b) {
    extendStatics(d, b);

    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();

var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

define([
  "require",
  "exports",
  "esri/core/tsSupport/declareExtendsHelper",
  "esri/core/tsSupport/decorateHelper",
  "esri/core/accessorSupport/decorators",
  "esri/geometry/Extent",
  "esri/layers/BaseTileLayer",
  "esri/layers/support/TileInfo",
  "esri/geometry/SpatialReference",
  "dojo/promise/all",
  "esri/request"
], function(require, exports, __extends, __decorate, decorators, Extent, BaseTileLayer, TileInfo, SpatialReference, all, esriRequest) {
  "use strict";
  return function(_super) {
    function SHCMapServiceLayer() {
      var _self = _super.call(this) || this;
      _self.token = null;
      _self.tileInfo =
        new TileInfo({
          "dpi": 96,
          "format": "png",
          "spatialReference": SpatialReference.WebMercator,
          "size": [512, 512],
          "origin": {
            "x": -66000,
            "y": 75000
          },
          "lods": [{
            "level": 0,
            "resolution": 270.93387520108377,
            "scale": 1024000
          }, {
            "level": 1,
            "resolution": 135.46693760054188,
            "scale": 512000
          }, {
            "level": 2,
            "resolution": 67.73346880027094,
            "scale": 256000
          }, {
            "level": 3,
            "resolution": 33.86673440013547,
            "scale": 128000
          }, {
            "level": 4,
            "resolution": 16.933367200067735,
            "scale": 64000
          }, {
            "level": 5,
            "resolution": 8.466683600033868,
            "scale": 32000
          }, {
            "level": 6,
            "resolution": 4.233341800016934,
            "scale": 16000
          }, {
            "level": 7,
            "resolution": 2.116670900008467,
            "scale": 8000
          }, {
            "level": 8,
            "resolution": 1.0583354500042335,
            "scale": 4000
          }, {
            "level": 9,
            "resolution": 0.5291677250021167,
            "scale": 2000
          }, {
            "level": 10,
            "resolution": 0.26458386250105836,
            "scale": 1000
          }, {
            "level": 11,
            "resolution": 0.13229193125052918,
            "scale": 500
          }],
          
        });
      return _self;
    };
    __extends(SHCMapServiceLayer, _super);

    SHCMapServiceLayer.prototype._getTileUrl = function(level, row, col) {
      var lt_x = this.tileInfo.origin.x + col * this.tileInfo.lods[level].resolution * this.tileInfo.size[0];
      var lt_y = this.tileInfo.origin.y - (row * this.tileInfo.lods[level].resolution * this.tileInfo.size[1]);
      var rb_x = this.tileInfo.origin.x + (col + 1) * this.tileInfo.lods[level].resolution * this.tileInfo.size[0];
      var rb_y = this.tileInfo.origin.y - ((row + 1) * this.tileInfo.lods[level].resolution * this.tileInfo.size[1]);
      var bbox = lt_x + "," + rb_y + "," + rb_x + "," + lt_y
      var _url = this.url + "/export?bbox=" + bbox + "&size=" + this.tileInfo.size[0] + "," + this.tileInfo.size[1] +
        "&bboxSR=" + "" + "&imageSR=" + "" +
        "&dpi=96&format=png&transparent=true&layerDefs=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&f=image";
       if (this.token != null)
         _url += "&token=" + this.token;
      return _url
    };

    SHCMapServiceLayer.prototype.fetchTile = function(level, row, col) {
      var url = this._getTileUrl(level, row, col);
      return esriRequest(url, {
        responseType: "image",
        allowImageDataAccess: true
      })
      .then(function(response) {
        var image = response.data;
        var width = this.tileInfo.size[0];
        var height = this.tileInfo.size[0];
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        return canvas;
      }.bind(this));
    };

    return SHCMapServiceLayer = __decorate([decorators.subclass("SHCMapServiceLayer")], SHCMapServiceLayer);
  }(decorators.declared(BaseTileLayer));
});