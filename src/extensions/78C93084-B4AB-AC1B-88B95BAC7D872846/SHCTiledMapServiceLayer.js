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
    function SHCTiledMapServiceLayer() {
      var _self = _super.call(this) || this;
      _self.url = null;
      _self.fullExtent = null;
      _self.token = null;
      _self.spatialReference = SpatialReference.WebMercator;
      _self.tileInfo =
        new TileInfo({
          "dpi": 96,
          "format": "png",
          "spatialReference": SpatialReference.WebMercator,
          "size": [512, 512],
          "size2": [512, 512],
          "origin": {
            "x": -66000,
            "y": 75000
          },
          "origin2": {
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
          "lods2": [{
            "level": 0,
            "resolution": 132.2919312505292,
            "scale": 500000
          }, {
            "level": 1,
            "resolution": 52.91677250021167,
            "scale": 200000
          }, {
            "level": 2,
            "resolution": 26.458386250105836,
            "scale": 100000
          }, {
            "level": 3,
            "resolution": 13.229193125052918,
            "scale": 50000
          }, {
            "level": 4,
            "resolution": 5.291677250021167,
            "scale": 20000
          }, {
            "level": 5,
            "resolution": 2.6458386250105836,
            "scale": 10000
          }, {
            "level": 6,
            "resolution": 1.3229193125052918,
            "scale": 5000
          }, {
            "level": 7,
            "resolution": 0.5291677250021167,
            "scale": 2000
          }, {
            "level": 8,
            "resolution": 0.26458386250105836,
            "scale": 1000
          }, {
            "level": 9,
            "resolution": 0.13229193125052918,
            "scale": 500
          }],
          "lodsLevelMapping": {
            "0": 0, //500000, //1024000
            "1": 0, //500000, //512000
            "2": 1, //200000, //256000
            "3": 2, //100000, //128000
            "4": 3, //50000, //64000
            "5": 4, //20000, //32000
            "6": 5, //10000, //16000
            "7": 5, //10000, //8000
            "8": 6, //5000, //4000
            "9": 7, //2000, //2000
            "10": 8, //1000//1000
            "11": 9 //500//500
          }
        });
      return _self;
    };
    __extends(SHCTiledMapServiceLayer, _super);

    SHCTiledMapServiceLayer.prototype._getTile = function(level, row, col, options) {

      var lt_x = this.tileInfo.origin.x + col * this.tileInfo.lods[level].resolution * this.tileInfo.size[0];
      var lt_y = this.tileInfo.origin.y - (row * this.tileInfo.lods[level].resolution * this.tileInfo.size[1]);
      var rb_x = this.tileInfo.origin.x + (col + 1) * this.tileInfo.lods[level].resolution * this.tileInfo.size[0];
      var rb_y = this.tileInfo.origin.y - ((row + 1) * this.tileInfo.lods[level].resolution * this.tileInfo.size[1]);

      var _level = this.tileInfo.lodsLevelMapping[level.toString()];
      var mapdistance = this.tileInfo.lods2[_level].resolution * this.tileInfo.size2[0];
      var scaleRatio = this.tileInfo.lods[level].scale / this.tileInfo.lods2[_level].scale;
      var fromCol = Math.floor((lt_x - this.tileInfo.origin2.x) / mapdistance);
      var fromRow = Math.floor((this.tileInfo.origin2.y - lt_y) / mapdistance);
      var toCol = Math.floor((rb_x - this.tileInfo.origin2.x) / mapdistance);
      var toRow = Math.floor((this.tileInfo.origin2.y - rb_y) / mapdistance);

      var cols = (toCol - fromCol + 1);
      var rows = (toRow - fromRow + 1);
      var bigCanvas = document.createElement("canvas");
      var bigContext = bigCanvas.getContext("2d");
      bigCanvas.width = this.tileInfo.size[0] * cols;;
      bigCanvas.height = this.tileInfo.size[0] * rows;

      var imageSize = this.tileInfo.size[0];

      var fetchTileImageDef = function(url, row, col, options) {
        if (level < 2) {
          return esriRequest(url, {
            responseType: "image",
            signal: options && options.signal,
            //allowImageDataAccess: true,
            //useProxy: true
          }).then(function(response) {
            var tileImage = response.data;
            bigContext.drawImage(tileImage, col * imageSize, row * imageSize, imageSize, imageSize);
          }, function(error) {
            return null;
          });
        } else {
          return esriRequest(url, {
            responseType: "image",
            signal: options && options.signal,
            //allowImageDataAccess: true,
            //useProxy: true
          }).then(function(response) {
            var tileImage = response.data;
            bigContext.drawImage(tileImage, col * imageSize, row * imageSize, imageSize, imageSize);
          }, function (error) {
            return null;
          });
        }
      }

      var tileUrls = [];
      var fetchTileImageDefs = [];
      for (var jRow = fromRow; jRow <= toRow; jRow++) {
        tileUrls[jRow - fromRow] = [];
        for (var iCol = fromCol; iCol <= toCol; iCol++) {
          var _url = this.url + "/tile/" + _level + "/" + jRow + "/" + iCol;
         
          if (this.token != null)
		        _url += "?token=" + this.token;
          tileUrls[jRow - fromRow][iCol - fromCol] = _url
          fetchTileImageDefs.push(fetchTileImageDef(_url, jRow - fromRow, iCol - fromCol, options));
        }
      }

      return all(fetchTileImageDefs).then(function(results) {
        var _xRatio = (lt_x - this.tileInfo.origin2.x) / mapdistance - Math.floor((lt_x - this.tileInfo.origin2.x) / mapdistance);
        var _yRatio = (this.tileInfo.origin2.y - lt_y) / mapdistance - Math.floor((this.tileInfo.origin2.y - lt_y) / mapdistance);
        var _x = Math.round(_xRatio * this.tileInfo.size[0]);
        var _y = Math.round(_yRatio * this.tileInfo.size[0]);
        var smallCanvas = document.createElement("canvas");
        var smallContext = smallCanvas.getContext("2d");
        smallCanvas.width = this.tileInfo.size[0];
        smallCanvas.height = this.tileInfo.size[0];
        var _imageSize = Math.round(imageSize * scaleRatio);
        smallContext.drawImage(bigCanvas, _x, _y, _imageSize, _imageSize, 0, 0, imageSize, imageSize);
        return smallCanvas;
      }.bind(this));
    };

    SHCTiledMapServiceLayer.prototype.fetchTile = function(level, row, col, options) {
      if (level <= 11) {
        return this._getTile(level, row, col, options);
      }
    };

    // Object.defineProperty(SHCTiledMapServiceLayer.prototype, "copyright", {
    //   get: function() {
    //     return "";
    //   },
    //   enumerable: false,
    //   configurable: false
    // });

    // __decorate([decorators.property({
    //   type: String,
    //   readOnly: true,
    //   json: {
    //     read: true,
    //     write: true
    //   }
    // })], SHCTiledMapServiceLayer.prototype, "copyright", null);

    return SHCTiledMapServiceLayer = __decorate([decorators.subclass("SHCTiledMapServiceLayer")], SHCTiledMapServiceLayer);

  }(decorators.declared(BaseTileLayer));
});