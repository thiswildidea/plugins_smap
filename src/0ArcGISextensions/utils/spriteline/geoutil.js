define([
        'dojo/_base/declare',
        "dojo/Deferred",
        "dojo/request/xhr",
        "dojo/request",
        "dojo/domReady!"
    ],
    function (declare, Deferred, xhr, request) {
        var geoutil = declare(null, {
            constructor: function () {},

            _getLinePosition: function (lineString, layer) {
                const positions = [];
                const positionsV = [];
                if (Array.isArray(lineString) && lineString[0] instanceof THREE.Vector3) {
                    for (let i = 0, len = lineString.length; i < len; i++) {
                        const v = lineString[i];
                        positions.push(v.x, v.y, v.z);
                        positionsV.push(v);
                    }
                } else {
                    if (Array.isArray(lineString)) lineString = new maptalks.LineString(lineString);
                    if (!lineString || !(lineString instanceof maptalks.LineString)) return;
                    const z = 0;
                    const coordinates = lineString.getCoordinates();
                    for (let i = 0, len = coordinates.length; i < len; i++) {
                        let coordinate = coordinates[i];
                        if (Array.isArray(coordinate))
                            coordinate = new maptalks.Coordinate(coordinate);
                        const v = layer.coordinateToVector3(coordinate, z);
                        positions.push(v.x, v.y, v.z);
                        positionsV.push(v);
                    }
                }
                return {
                    positions: positions,
                    positionsV: positionsV
                }
            },
            _getChunkLinesPosition: function (chunkLines, layer) {
                const positions = [],
                    positionsV = [],
                    lnglats = [];
                for (let i = 0, len = chunkLines.length; i < len; i++) {
                    const line = chunkLines[i];
                    for (let j = 0, len1 = line.length; j < len1; j++) {
                        const lnglat = line[j];
                        if (lnglats.length > 0) {
                            const key = lnglat.join(',').toString();
                            const key1 = lnglats[lnglats.length - 1].join(',').toString();
                            if (key !== key1) {
                                lnglats.push(lnglat);
                            }
                        } else {
                            lnglats.push(lnglat);
                        }
                    }
                }
                let z = 0;
                lnglats.forEach(lnglat => {
                    const h = lnglat[2];
                    if (h) {
                        z = layer.distanceToVector3(h, h).x;
                    }
                    const v = layer.coordinateToVector3(lnglat, z);
                    positionsV.push(v);
                    positions.push(v.x, v.y, v.z);
                });
                return {
                    positions: positions,
                    positionsV: positionsV,
                    lnglats: lnglats
                };
            }
        });
        return new geoutil();
    });