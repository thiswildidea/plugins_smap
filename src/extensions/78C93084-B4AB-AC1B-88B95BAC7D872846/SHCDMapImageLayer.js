/*! lichengren  2019-09-19  */

define([
  'require',
  'exports',
  'esri/core/tsSupport/declareExtendsHelper',
  'esri/core/tsSupport/decorateHelper',
  'esri/core/accessorSupport/decorators',
  'esri/core/tsSupport/awaiterHelper',
  'esri/core/tsSupport/generatorHelper',
  'esri/core/promiseUtils',
  'esri/core/Collection',
  'esri/core/watchUtils',
  'esri/core/Error',
  'esri/geometry/Extent',
  'esri/layers/BaseTileLayer',
  'esri/layers/support/TileInfo',
  'esri/geometry/SpatialReference',
  'dojo/promise/all',
  'esri/request',
  'esri/tasks/IdentifyTask',
  'esri/tasks/support/IdentifyParameters',
  'esri/layers/MapImageLayer',
  'esri/layers/support/Sublayer',
  'esri/views/2d/layers/TileLayerView2D'
], function (e, i, t, s, r, l, a, n, o, u, f, c, y, p, h, d, v, m, b, g, _, x) {
  'use strict'
  var dLayer;
  var I = g.createSubclass({
    createExportImageParameters: function (e, i, t, s) {
      t = this.fullExtent
      return (
        (e = new c({
          xmin: t.xmax + 2e4,
          ymin: t.ymax + 2e4,
          xmax: t.xmax + 20001,
          ymax: t.ymax + 20001,
          spatialReference: e.spatialReference
        })),
        (t = 2),
        (s.pixelRatio = 1e-7),
        this.inherited(this.createExportImageParameters, [e, 2, t, s])
      )
    },
    getImageUrl: function (e, i, t, s) {
      t = this.fullExtent
      return (
        (e = new c({
          xmin: t.xmax + 2e4,
          ymin: t.ymax + 2e4,
          xmax: t.xmax + 20001,
          ymax: t.ymax + 20001,
          spatialReference: e.spatialReference
        })),
        (t = 2),
        (s.pixelRatio = 1e-7),
        this.inherited(this.getImageUrl, [e, 2, t, s])
      )
    },
    addTo: function (e) {
      return e.findLayerById(this.id) || e.add(this), this
    }
  })
  return y.createSubclass({
    constructor: function (e) {
      var i = this
      // by lichengren
      dLayer = e.dLayer;
      return (
        (i._tolerance = e.tolerance || 10),
        (i.url = e.url),
        (i.tileUrl = e.tileUrl || '../Assets/data/tileJson.json'),
        (i._service = {
          visiblelayers: [],
          visiblelayerDefs: [],
          grouplayers: []
        }),
        (i._visiblelayers = []),
        (i._visiblelayerDefs = {}),
        (i._grouplayers = []),
        (i._queryMaxCount = 5),
        (i._sublayerchange = !0),
        (i._sublayers = new o()),
        (i.sublayers = e.sublayers),
        (i.identifyTask = new m(i.url)),
        (i.identifyparams = new b()),
        (i.identifyparams.layerOption = 'visible'),
        (i.identifyparams.returnGeometry = !0),
        (i.Legendlayer = e.dLayer),
        (i.Legendlayer.popupEnabled = !1),
        (i.Legendlayer.id = e.id + '_legend'),
        (i._loadinfostatus = 'not-load'),
        (i._findExtent = e.findExtent),
        i
      )
    },
    load: function (e) {
      var i = this
      return (
        this.addResolvingPromise(
          this.loadFromPortal(
            { supportedTypes: ['Image Service', 'Map Service'] },
            e
          ).then(
            function () {
              return i._fetchService(null)
            },
            function () {
              return i._fetchService(null)
            }
          )
        ),
        this.when()
      )
    },
    loadFromPortal: function (e, i) {
      var t = this,
        s = this.url + '?f=pjson'
      return n.create(function (i, e) {
        if (t.layerInfos) i()
        else {
          if ('loading' == t._loadinfostatus) return void e('alway loading')
            ; (t._loadinfostatus = 'loading'),
              v(s, { responseType: 'json' }).then(function (e) {
                ; (t._loadinfostatus = 'loaded'), (t.layerInfos = e.data), i()
              })
        }
      })
    },
    _fetchService: function (t) {
      var l = this
      return n
        .create(function (e, i) {
          l.resourceInfo
            ? e({ data: l.resourceInfo })
            : v(l.tileUrl, {
              query: { f: 'json' },
              responseType: 'json',
              signal: t
            }).then(e, i)
        })
        .then(function (e) {
          for (
            var i = e.data,
            t = e.data.tileInfo,
            s = t.lods[t.lods.length - 1],
            r = 1;
            r < 1;
            r++
          )
            t.lods.push({
              level: s.level + r,
              resolution: s.resolution / Math.pow(2, r),
              scale: s.scale / Math.pow(2, r)
            })
          return (
            (l.fullExtent = i.fullExtent),
            (l.spatialReference = i.fullExtent.spatialReference),
            (l.tileInfo = p.fromJSON(t)),
            l
          )
        })
    },
    _getLayerinfo: function () {
      var t = this.url + '?f=pjson',
        s = this
      return n.create(function (i, e) {
        if (s.layerInfos) i()
        else {
          if ('loading' == s._loadinfostatus) return void e('alway loading')
            ; (s._loadinfostatus = 'loading'),
              v(t, { responseType: 'json' }).then(function (e) {
                ; (s._loadinfostatus = 'loaded'), (s.layerInfos = e.data), i()
              })
        }
      })
    },
    properties: {
      url: null,
      spatialReference: h.WebMercator,
      fullExtent: null,
      token: null,
      sublayers: {
        set: function (e) {
          var r = this
          e &&
            (e instanceof o || e instanceof Array) &&
            (this._sublayers.removeAll(),
              e.forEach(function (e) {
                e instanceof _ || (e = new _(e)),
                  r._sublayers.add(e),
                  u.watch(e, 'visible', function (e, i, t, s) {
                    dojo.hitch(r, r._changevisibleLayer(s, e))
                  })
              })),
            r.when().then(dojo.hitch(r, r.preparelayers))
        },
        get: function () {
          return this._sublayers
        }
      },
      _service: { visiblelayers: [], visiblelayerDefs: [], grouplayers: [] },
      _visiblelayers: [],
      _visiblelayerDefs: {},
      _grouplayers: [],
      tileInfo: null
    },
    _changevisibleLayer: function (e, i) {
      this.when().then(
        dojo.hitch(this, this._debounce(this.preparelayers), 100)
      )
    },
    getServiceSubLayer: function (e, i) {
      for (var t = this, s = 0; s < e.length; s++) {
        var r = e[s]
        i[r].subLayerIds && null != i[r].subLayerIds
          ? (-1 == t._service.grouplayers.indexOf(parseInt(r)) &&
            t._service.grouplayers.push(parseInt(r)),
            t.getServiceSubLayer(i[r].subLayerIds, i))
          : -1 == t._service.visiblelayers.indexOf(parseInt(r)) &&
          t._service.visiblelayers.push(parseInt(r))
      }
    },
    _debounce: function (i, t) {
      var s = null,
        r = this
      return (function () {
        var e = arguments
        s && clearTimeout(s),
          (s = setTimeout(function () {
            i.apply(r, e)
          }, t))
      })()
    },
    getSubLayer: function () {
      var t = this
        ; (t._visiblelayers = []),
          this.sublayers.forEach(function (i) {
            t.getServiceSubLayer([i.id], t.layerInfos.layers),
              i.visible
                ? ((t._visiblelayers = t._visiblelayers.concat(
                  t._service.visiblelayers
                )),
                  i.definitionExpression &&
                  t._service.visiblelayers.forEach(function (e) {
                    t._visiblelayerDefs[e] = i.definitionExpression
                  }),
                  (i.subLayerIds = t._service.visiblelayers))
                : t._service.visiblelayers.forEach(function (e) {
                  var i = t._visiblelayers.indexOf(e)
                  0 <= i && (t._visiblelayers = t._visiblelayers.splice(i, 1)),
                    delete t._visiblelayerDefs[e]
                }),
              (t._service.visiblelayers = []),
              (t._service.grouplayers = [])
          })
    },
    preparelayers: function () {
      var i = this
      0 < this.sublayers.length &&
        (this.getSubLayer(this.sublayers, this.layerInfos.layers),
          (i._filterlayers = []),
          i._visiblelayers.forEach(function (e) {
            ; -1 == i._filterlayers.indexOf(e) && i._filterlayers.push(e)
          }),
          (i.visiblelayers = 'show:' + i._filterlayers),
          (i.layerDefs = JSON.stringify(i._visiblelayerDefs)),
          i.refresh())
      var t = []
      i.Legendlayer.sublayers.remove(),
        this.sublayers.forEach(function (e) {
          var i = {
            id: e.id,
            legendEnabled: e.legendEnabled,
            visible: e.visible,
            popupEnabled: !1
          }
          t.push(i)
        }),
        (i.Legendlayer.sublayers = t),
        i.Legendlayer.refresh()
    },
    getTemplate: function (i) {
      if (0 < this.sublayers.length)
        return this.sublayers.find(function (e) {
          return e.id == i || (e.subLayerIds && 0 <= e.subLayerIds.indexOf(i))
        })
    },
    _createTileInfo: function () {
      var s = this,
        e = n.create(function (i, e) {
          if (
            s.view.basemapView.baseLayerViews &&
            s.view.basemapView.baseLayerViews.items[0]
          ) {
            var t = s.view.basemapView.baseLayerViews.items[0]
              ; (s.fullExtent = t.fullExtent.clone()),
                (s.spatialReference = t.fullExtent.spatialReference),
                i(t.tileInfo.toJSON())
          } else {
            if (s.tileUrl)
              return v(s.tileUrl, { query: query, responseType: 'json' }).then(
                function (e) {
                  ; (s.fullExtent = e.fullExtent),
                    (s.spatialReference = e.fullExtent.spatialReference),
                    i(e.tileInfo.toJSON())
                }
              )
                ; (s.fullExtent = {
                  xmin: -13176.965410868555,
                  ymin: -2733.38131873682,
                  xmax: 9201.22841446087,
                  ymax: 10322.996434633345,
                  spatialReference: { wkid: 102100, latestWkid: 3857 }
                }),
                  (s.spatialReference = { wkid: 102100, latestWkid: 3857 }),
                  i({
                    rows: 512,
                    cols: 512,
                    dpi: 96,
                    format: 'PNG32',
                    compressionQuality: 0,
                    origin: { x: -66e3, y: 75e3 },
                    spatialReference: { wkid: 102100, latestWkid: 3857 },
                    lods: [
                      { level: 0, resolution: 270.93387520108377, scale: 1024e3 },
                      { level: 1, resolution: 135.46693760054188, scale: 512e3 },
                      { level: 2, resolution: 67.73346880027094, scale: 256e3 },
                      { level: 3, resolution: 33.86673440013547, scale: 128e3 },
                      { level: 4, resolution: 16.933367200067735, scale: 64e3 },
                      { level: 5, resolution: 8.466683600033868, scale: 32e3 },
                      { level: 6, resolution: 4.233341800016934, scale: 16e3 },
                      { level: 7, resolution: 2.116670900008467, scale: 8e3 },
                      { level: 8, resolution: 1.0583354500042335, scale: 4e3 },
                      { level: 9, resolution: 0.5291677250021167, scale: 2e3 },
                      { level: 10, resolution: 0.26458386250105836, scale: 1e3 },
                      { level: 11, resolution: 0.13229193125052918, scale: 500 }
                    ]
                  })
          }
        })
      return (
        e.then(function (e) {
          for (var i = e.lods[e.lods.length - 1], t = 1; t < 6; t++)
            e.lods.push({
              level: i.level + t,
              resolution: i.resolution / Math.pow(2, t),
              scale: i.scale / Math.pow(2, t)
            })
          s.tileInfo = p.fromJSON(e)
        }),
        e
      )
    },
    importLayerViewModule: function (i) {
      var t = this
      this.view = i
      var e = this.inherited(this.importLayerViewModule, arguments)
      return (
        e.then(function (e) {
          return (
            t._idck && t._idck.remove(),
            (t._idck = i.on('click', dojo.hitch(t, t._executeIdentifyTask, i))),
            e
          )
        }),
        e
      )
    },
    destroyLayerView: function (e) {
      this._idck && this._idck.remove(),
        this.inherited(this.destroyLayerView, arguments)
    },
    _convertgeotype: function (e) {
      var i = e.geometry.type
      if (!e.popupTemplate) return 4
      switch (i) {
        case 'point':
          return 0
        case 'polyline':
          return 1
        case 'polygon':
          return 2
      }
    },

    // by lichengren 0923   多属性 待尝试
    _executeIdentifyTask: function (e, a) {
      var n = e.popup
      // if (
      //   // this._filterlayers &&
      //   // 0 != this._filterlayers.length &&
      //   // (!this._findExtent || this._findExtent.contains(a.mapPoint))
      //   window['SANDIAO'].visible === true||window['GH_CZBJ'].visible === true
      // ) {
      if (true) {
        var o = [],
          u = {}
          ; (this.identifyparams.tolerance = this._tolerance),
            // (this.identifyparams.layerIds = this._filterlayers),
            (this.identifyparams.width = e.width),
            (this.identifyparams.height = e.height),
            (this.identifyparams.geometry = a.mapPoint),
            (this.identifyparams.mapExtent = e.extent)
        var f = this
          ; (this.identifyparams.layerDefinitions = this.layerDefs),
            this.identifyTask.execute(this.identifyparams).then(
              function (e) {
                if (e && e.results) {
                  for (
                    var i = e.results, t = !0, s = 0;
                    s < i.length && !(s > f._queryMaxCount);
                    s++
                  ) {
                    // i.map(function(result){
                    //   var feature=result.feature;
                    //   // feature.popupTemplate=window['SANDIAO_DMAP'].allSublayers.items[0].popupTemplate
                    //   feature.popupTemplate={
                    //     title:"123",
                    //     content:"<b>地类名称：</b>123"
                    //   }

                    // }).then(
                    //   window['CSJ_SCENE_VIEW'].popup.open({
                    //     // title: '属性查询',
                    //     location: a.mapPoint,
                    //     features: i
                    //   })
                    // )

                    if (i.length > 0) {
                      var contentObj = i[0];
                      //var popupTable=document.createElement('table');
                      if ((window['SANDIAO'].visible === true||window['SANDIAO_MERGE'].visible === true) && contentObj.feature.attributes['DLMC']) {
                        window['CSJ_SCENE_VIEW'].popup.open({
                          title: '三调数据',
                          location: a.mapPoint,
                          content: '地类名称：' + contentObj.feature.attributes['DLMC']
                        })
                      }
                      else if ((window['GH_CZBJ'].visible === true) && contentObj.feature.attributes['CZMC']) {
                        window['CSJ_SCENE_VIEW'].popup.open({
                          title: '城镇边界',
                          location: a.mapPoint,
                          content: '<table><tr><td>村庄名称：</td><td>' + contentObj.feature.attributes['CZMC'] + '</td></tr>'
                            + '<tr><td>村庄类型：</td><td>' + contentObj.feature.attributes['CZLXMC'] + '</td></tr></table>'
                        })
                      } else if ((window['GH_JCDL'].visible === true) && contentObj.feature.attributes['GHJSFLMC']) {
                        window['CSJ_SCENE_VIEW'].popup.open({
                          title: '基础地类',
                          location: a.mapPoint,
                          content: '<table><tr><td>规划分类名称：</td><td>' + contentObj.feature.attributes['GHJSFLMC'] + '</td></tr></table>'
                        })
                      } else if ((window['GH_JSYD'].visible === true) && contentObj.feature.attributes['GZQLXMC']) {
                        window['CSJ_SCENE_VIEW'].popup.open({
                          title: '用地管制区',
                          location: a.mapPoint,
                          content: '<table><tr><td>管制区类型名称：</td><td>' + contentObj.feature.attributes['GZQLXMC'] + '</td></tr></table>'
                        })
                      }
                    }
                    // var r = i[s],
                    //   l = f.getTemplate(r.layerId)
                    // switch (
                    //   (l.popupEnabled && null != l.popupTemplate
                    //     ? (r.feature.popupTemplate = l.popupTemplate)
                    //     : ((r.feature.popupTemplate = void 0), (t = !1)),
                    //   r.feature.geometry.type)
                    // ) {
                    //   case 'point':
                    //     r.feature.symbol = {
                    //       type: 'simple-marker',
                    //       style: 'circle',
                    //       color: 'red',
                    //       size: '4px'
                    //     }
                    //     break
                    //   case 'polyline':
                    //     r.feature.symbol = {
                    //       type: 'simple-line',
                    //       color: 'red',
                    //       width: '2px',
                    //       style: 'solid'
                    //     }
                    //     break
                    //   case 'polygon':
                    //     r.feature.symbol = {
                    //       type: 'simple-fill',
                    //       color: [255, 255, 255, 0],
                    //       style: 'solid',
                    //       outline: { color: 'red', width: 2 }
                    //     }
                    // }
                    // u[l.title]
                    //   ? u[l.title].push(r.feature.attributes)
                    //   : (u[l.title] = [r.feature.attributes]),
                    //   o.push(r.feature)
                  }
                  // 0 < o.length &&
                  //   (o.sort(function(e, i) {
                  //     var t = f._convertgeotype(e),
                  //       s = f._convertgeotype(i)
                  //     return t < s ? -1 : s < t ? 1 : 0
                  //   }),
                  //   f.emit('click', {
                  //     mapPoint: a.mapPoint,
                  //     graphics: u,
                  //     arcData: i
                  //   }),
                  //   t && n.open({ location: a.mapPoint, features: o }))
                } 
                // else
                //  n.clear()
              },
              function () {
                n.clear()
              }
            )
      }
    },
    _getTileUrl: function (e, i, t) {
      return this.url + '/export'
    },
    fetchTile: function (e, i, t) {
      var s = this._getTileUrl(e, i, t),
        r =
          this.tileInfo.origin.x +
          t * this.tileInfo.lods[e].resolution * this.tileInfo.size[0],
        l =
          this.tileInfo.origin.y -
          i * this.tileInfo.lods[e].resolution * this.tileInfo.size[1],
        a =
          this.tileInfo.origin.x +
          (t + 1) * this.tileInfo.lods[e].resolution * this.tileInfo.size[0],
        n =
          r +
          ',' +
          (this.tileInfo.origin.y -
            (i + 1) *
            this.tileInfo.lods[e].resolution *
            this.tileInfo.size[1]) +
          ',' +
          a +
          ',' +
          l,
        o = JSON.stringify(this.spatialReference.toJSON()),
        u = (this.tileInfo.size[0],
          this.tileInfo.size[1],
          this.visiblelayers,
          this.layerDefs,
          new Object())
      return (
        (u.bbox = n),
        (u.size = this.tileInfo.size[0] + ',' + this.tileInfo.size[1]),
        (u.bboxSR = o),
        (u.imageSR = o),
        (u.dpi = 96),
        (u.format = 'png32'),
        (u.transparent = !0),
        (u.layers = this.visiblelayers),
        (u.layerDefs = this.layerDefs),
        (u.time = ''),
        (u.layerTimeOptions = ''),
        (u.dynamicLayers = ''),
        (u.gdbVersion = ''),
        (u.mapScale = ''),
        (u.f = 'image'),
        v(s, {
          query: u,
          responseType: 'image',
          allowImageDataAccess: !0
        }).then(
          function (e) {
            var i = e.data,
              t = this.tileInfo.size[0],
              s = this.tileInfo.size[0],
              r = document.createElement('canvas'),
              l = r.getContext('2d')
            return (r.width = t), (r.height = s), l.drawImage(i, 0, 0, t, s), r
          }.bind(this)
        )
      )
    }
  })
})
