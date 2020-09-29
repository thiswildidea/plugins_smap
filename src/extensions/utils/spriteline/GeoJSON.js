/**
 * Created by yangyiwen 2020/09/29
 */
define([
    'dojo/_base/declare',
    "dojo/Deferred",
    "dojo/request/xhr",
    "dojo/request",
    "82B44794-5CE0-A64A-9047F07CAF08BD2C/08F60FEF-C6FF-A788-344D-1755CB0E3870/utils",
    "dojo/domReady!"
],
    function (declare, Deferred, xhr, request, utils) {
        var GeoJSON = declare(null, {
            constructor: function () { },
            toGeometry: function (geoJSON, foreachFn) {
                scope = this;
                if (isString(geoJSON)) {
                    geoJSON = utils.parseJSON(geoJSON);
                }
                if (Array.isArray(geoJSON)) {
                    const resultGeos = [];
                    for (let i = 0, len = geoJSON.length; i < len; i++) {
                        const geo = scope._convert(geoJSON[i], foreachFn);
                        if (Array.isArray(geo)) {
                            pushIn(resultGeos, geo);
                        } else {
                            resultGeos.push(geo);
                        }
                    }
                    return resultGeos;
                } else {
                    const resultGeo = scope._convert(geoJSON, foreachFn);
                    return resultGeo;
                }
            },
            _convert: function (json, foreachFn) {
                scope = this;
                if (!json || isNil(json['type'])) {
                    return null;
                }

                const type = json['type'];
                if (type === 'Feature') {
                    const g = json['geometry'];
                    const geometry = scope._convert(g);
                    if (!geometry) {
                        return null;
                    }
                    geometry.setId(json['id']);
                    geometry.setProperties(json['properties']);
                    if (foreachFn) {
                        foreachFn(geometry);
                    }
                    return geometry;
                } else if (type === 'FeatureCollection') {
                    const features = json['features'];
                    if (!features) {
                        return null;
                    }
                    return GeoJSON.toGeometry(features, foreachFn);
                } else if (['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'].indexOf(type) >= 0) {
                    const clazz = (type === 'Point' ? 'Marker' : type);
                    const result = new types[clazz](json['coordinates']);
                    if (foreachFn) {
                        foreachFn(result);
                    }
                    return result;
                } else if (type === 'GeometryCollection') {
                    const geometries = json['geometries'];
                    if (!isArrayHasData(geometries)) {
                        const result = new GeometryCollection();
                        if (foreachFn) {
                            foreachFn(result);
                        }
                        return result;
                    }
                    const mGeos = [];
                    const size = geometries.length;
                    for (let i = 0; i < size; i++) {
                        mGeos.push(GeoJSON._convert(geometries[i]));
                    }
                    const result = new GeometryCollection(mGeos);
                    if (foreachFn) {
                        foreachFn(result);
                    }
                    return result;
                }
                return null;
            }
        });
        return new GeoJSON();
    });