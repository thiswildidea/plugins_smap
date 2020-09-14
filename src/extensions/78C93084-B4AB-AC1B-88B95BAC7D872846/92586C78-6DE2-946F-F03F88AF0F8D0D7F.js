;
define(['dojo/_base/declare', 'dojo/on', "esri/views/3d/externalRenderers", "esri/geometry/SpatialReference", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils", "http://10.201.37.225:8080/smiapi/arcgis/extensions/78C93084-B4AB-AC1B-88B95BAC7D872846/gl-matrix.js", 'dojo/domReady!'], function (r, s, t, u, v, w, z) {
    var A = r(null, {
        constructor: function (a, b, c) {
            this.view = a.view, this.nring = a.nring = undefined ? 1.0 : a.nring
             this.spead = a.spead = undefined ? 1.0 : a.spead 
             this.symbolsize = a.size = undefined ? 15.0 : a.size 
             this.color = a.color;
            this.points = a.points, this.needsUpdate = false;
            this.numPoints = null, this.callback = b;
            this.callbackPointermove = c;
            this.localOrigin = null, this.localOriginRender = null, this.vboBasePositions = null, this.vboBaseNormals = null, this.vboBaseOffset = null, this.iboBase = null, this.pointBasePositions = null, this.pointBaseNormals = null, this.pointBaseIndices = null, this.pointBaseOffsets = null, this.program = null, this.programAttribVertexPosition = null, this.programAttribVertexNormal = null, this.programAttribOffset = null, this.programUniformProjectionMatrix = null, this.programUniformModelViewMatrix = null, this.programUniformNormalMatrix = null, this.programUniformAmbientColor = null, this.programUniformLightingDirection = null, this.programUniformDirectionalColor = null, this.pointInstanceInputToRender = null, this.tempMatrix4 = new Float32Array(16), this.tempMatrix3 = new Float32Array(9), this.tempVec3 = new Float32Array(3), this.fshader = "precision highp float;" + "uniform float u_current_time;" + "varying vec2 v_offset;" + "const float PI = 3.14159;" + "const float N_RINGS =" + parseFloat(this.nring).toFixed(1) + ";" + "const vec3 COLOR = vec3(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + ");" + "const float FREQ = " + parseFloat(this.spead).toFixed(1) + ";" + "void main() {" + "  float l = length(v_offset);" + "  float intensity = clamp(cos(l * PI), 0.0, 1.0) * clamp(cos(2.0 * PI * (l * 2.0 * N_RINGS - FREQ * u_current_time)), 0.0, 1.0);" + "  gl_FragColor = vec4(COLOR * intensity, intensity);" + " }";
            this.vshader = "precision highp float;" + "attribute vec3 aVertexPosition;" + "attribute vec3 aVertexNormal;" + "uniform mat4 uModelViewMatrix;" + "uniform mat4 uProjectionMatrix;" + "uniform mat3 uNormalMatrix;" + "uniform vec3 uAmbientColor;" + "uniform vec3 uLightingDirection;" + "uniform vec3 uDirectionalColor;" + "uniform mat3 u_transform;" + "uniform mat3 u_display;" + "attribute vec2 a_offset;" + "varying vec2 v_offset;" + "const float SIZE = 70.0;" + "void main() {" + "    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);" + "    vec3 transformedNormal = normalize(uNormalMatrix * aVertexNormal);" + "    float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);" + "    gl_PointSize = 10.0;" + "   v_offset = a_offset;" + "}"
            _this = this
        },
        setup: function (a) {
            this.initShaders(a);
            this.initData(a, this.points);
            a.resetWebGLState();
            this.initevent()
        },
        render: function (a) {
            var b = a.gl;
            b.enable(b.DEPTH_TEST);
            b.disable(b.CULL_FACE);
            b.disable(b.BLEND);
            b.useProgram(this.program);
            this.setCommonUniforms(a);
            this.bindPointBase(a);
            z.mat4.identity(this.tempMatrix4);
            z.mat4.translate(this.tempMatrix4, this.tempMatrix4, this.localOriginRender);
            z.mat4.multiply(this.tempMatrix4, a.camera.viewMatrix, this.tempMatrix4);
            b.uniformMatrix4fv(this.programUniformModelViewMatrix, false, this.tempMatrix4);
            z.mat3.identity(this.tempMatrix3);
            b.uniformMatrix3fv(this.programUniformNormalMatrix, false, this.tempMatrix3);
            b.enable(b.BLEND);
            b.blendFunc(b.ONE, b.ONE_MINUS_SRC_ALPHA);
            b.drawElements(b.TRIANGLES, this.pointBaseIndices.length, b.UNSIGNED_SHORT, 0);
            t.requestRender(this.view);
            a.resetWebGLState()
        },
        getShader: function (a, b) {
            var c = null;
            if (b === 'fshader') {
                c = this.fshader
            } else {
                c = this.vshader
            }
            var d = c;
            var e;
            if (b === 'fshader') {
                e = a.createShader(a.FRAGMENT_SHADER)
            } else if (b === 'vshader') {
                e = a.createShader(a.VERTEX_SHADER)
            } else {
                return null
            }
            a.shaderSource(e, d);
            a.compileShader(e);
            if (!a.getShaderParameter(e, a.COMPILE_STATUS)) {
                return null
            }
            return e
        },
        linkProgram: function (a, b, c) {
            var d = a.createProgram();
            a.attachShader(d, c);
            a.attachShader(d, b);
            a.linkProgram(d);
            if (!a.getProgramParameter(d, a.LINK_STATUS)) {
                return null
            }
            return d
        },
        initShaders: function (a) {
            var b = a.gl;
            var c = this.getShader(b, "fshader");
            var d = this.getShader(b, "vshader");
            this.program = this.linkProgram(b, c, d);
            if (!this.program) {}
            b.useProgram(this.program);
            this.programAttribVertexPosition = b.getAttribLocation(this.program, "aVertexPosition");
            b.enableVertexAttribArray(this.programAttribVertexPosition);
            this.programAttribVertexNormal = b.getAttribLocation(this.program, "aVertexNormal");
            b.enableVertexAttribArray(this.programAttribVertexNormal);
            this.programAttribOffset = b.getAttribLocation(this.program, "a_offset");
            b.enableVertexAttribArray(this.programAttribOffset);
            this.programUniformProjectionMatrix = b.getUniformLocation(this.program, "uProjectionMatrix");
            this.programUniformModelViewMatrix = b.getUniformLocation(this.program, "uModelViewMatrix");
            this.programUniformNormalMatrix = b.getUniformLocation(this.program, "uNormalMatrix");
            this.programUniformAmbientColor = b.getUniformLocation(this.program, "uAmbientColor");
            this.programUniformLightingDirection = b.getUniformLocation(this.program, "uLightingDirection");
            this.programUniformDirectionalColor = b.getUniformLocation(this.program, "uDirectionalColor");
            this.uDisplay = b.getUniformLocation(this.program, "u_display");
            this.uCurrentTime = b.getUniformLocation(this.program, "u_current_time")
        },
        initData: function (a, b) {
            var c = a.gl;
            this.numPoints = b.length;
            var d = this.view.extent.center.spatialReference;
            this.localOrigin = [this.view.extent.center.x, this.view.extent.center.y, 0];
            this.localOriginRender = t.toRenderCoordinates(this.view, this.localOrigin, 0, d, new Float32Array(3), 0, 1);
            this.pointInstanceInputToRender = new Array(this.numPoints);
            for (var i = 0; i < this.numPoints; ++i) {
                var e = b[i];
                var f = w.xyToLngLat(e.x, e.y)
                 var g = new u({
                    wkid: 4326
                });
                var h = [f[0], f[1], 0];
                var j = t.renderCoordinateTransformAt(this.view, h, g, new Float64Array(16));
                this.pointInstanceInputToRender[i] = j
            }
            this.pointBasePositions = new Float64Array(this.numPoints * 3 * 4);
            this.pointBaseNormals = new Float64Array(this.numPoints * 3 * 4);
            this.pointBaseIndices = new Uint16Array(this.numPoints * 6);
            this.pointBaseOffsets = new Float64Array(this.numPoints * 2 * 4);
            for (var i = 0; i < this.numPoints; i++) {
                var k = new Float64Array(16);
                z.mat4.identity(k);
                z.mat4.multiply(k, this.pointInstanceInputToRender[i], k);
                var l = new Float64Array(9);
                z.mat3.normalFromMat4(l, k);
                var m = 4 * 3;
                var n = m / 3;
                this.pointBaseOffsets[i * 8 + 0] = -0.5;
                this.pointBaseOffsets[i * 8 + 1] = -0.5;
                this.pointBaseOffsets[i * 8 + 2] = 0.5;
                this.pointBaseOffsets[i * 8 + 3] = -0.5;
                this.pointBaseOffsets[i * 8 + 4] = -0.5;
                this.pointBaseOffsets[i * 8 + 5] = 0.5;
                this.pointBaseOffsets[i * 8 + 6] = 0.5;
                this.pointBaseOffsets[i * 8 + 7] = 0.5;
                var o = 70 / 2;
                var p = o;
                var x = k[12];
                var y = k[13];
                this.pointBasePositions[i * m + 0] = -1 * this.symbolsize;
                this.pointBasePositions[i * m + 1] = -1 * this.symbolsize;
                this.pointBasePositions[i * m + 2] = b[i].z !== undefined ? b[i].z : 1;
                this.pointBasePositions[i * m + 3] = 1 * this.symbolsize;
                this.pointBasePositions[i * m + 4] = -1 * this.symbolsize;
                this.pointBasePositions[i * m + 5] = b[i].z !== undefined ? b[i].z : 1;
                this.pointBasePositions[i * m + 6] = -1 * this.symbolsize;
                this.pointBasePositions[i * m + 7] = 1 * this.symbolsize;
                this.pointBasePositions[i * m + 8] = b[i].z !== undefined ? b[i].z : 1;
                this.pointBasePositions[i * m + 9] = 1 * this.symbolsize;
                this.pointBasePositions[i * m + 10] = 1 * this.symbolsize;
                this.pointBasePositions[i * m + 11] = b[i].z !== undefined ? b[i].z : 1;
                z.vec3.forEach(this.pointBasePositions, 0, i * m, n, z.vec3.transformMat4, k);
                z.vec3.forEach(this.pointBasePositions, 0, i * m, n, z.vec3.subtract, this.localOriginRender);
                z.vec3.forEach(this.pointBaseNormals, 0, i * m, n, z.vec3.transformMat3, l);
                z.vec3.forEach(this.pointBaseNormals, 0, i * m, n, z.vec3.normalize);
                var q = 6;
                this.pointBaseIndices[i * q + 0] = 0 + i * 4;
                this.pointBaseIndices[i * q + 1] = 1 + i * 4;
                this.pointBaseIndices[i * q + 2] = 2 + i * 4;
                this.pointBaseIndices[i * q + 3] = 1 + i * 4;
                this.pointBaseIndices[i * q + 4] = 3 + i * 4;
                this.pointBaseIndices[i * q + 5] = 2 + i * 4
            }
            this.vboBasePositions = this.createVertexBuffer(c, this.pointBasePositions);
            this.vboBaseNormals = this.createVertexBuffer(c, this.pointBaseNormals);
            this.vboBaseOffset = this.createVertexBuffer(c, this.pointBaseOffsets);
            this.iboBase = this.createIndexBuffer(c, this.pointBaseIndices)
        },
        initevent: function () {
            var g = this
            if (!g.view) {
                return
            }
            g.view.on("click", function (c) {
                if (!g.points.length) {
                    g.callback(null)
                } else {
                    var d = g.points.map(function (a) {
                        let pointorigin = new v({
                            x: a.x,
                            y: a.y,
                            spatialReference: u.WebMercator
                        });
                        var b = g.view.toScreen(pointorigin);
                        return Math.sqrt((b.x - c.x) * (b.x - c.x) + (b.y - c.y) * (b.y - c.y))
                    }) 
                    var e = 0;
                    d.forEach(function (a, i) {
                        if (a < d[e]) {
                            e = i
                        }
                    });
                    var f = d[e];
                    if (f > 35) {} else {
                        g.callback(g.points[e])
                    }
                }
            });
            g.view.on("pointer-move", function (c) {
                if (!g.points.length) {} else {
                    var d = g.points.map(function (a) {
                        let pointorigin = new v({
                            x: a.x,
                            y: a.y,
                            spatialReference: u.WebMercator
                        });
                        var b = g.view.toScreen(pointorigin);
                        return Math.sqrt((b.x - c.x) * (b.x - c.x) + (b.y - c.y) * (b.y - c.y))
                    }) 
                    var e = 0;
                    d.forEach(function (a, i) {
                        if (a < d[e]) {
                            e = i
                        }
                    });
                    var f = d[e];
                    if (f > 35) {} else {
                        g.callbackPointermove(g.points[e])
                    }
                }
            })
        },
        createVertexBuffer: function (a, b) {
            var c = a.createBuffer();
            a.bindBuffer(a.ARRAY_BUFFER, c);
            var d = new Float32Array(b);
            a.bufferData(a.ARRAY_BUFFER, d, a.STATIC_DRAW);
            return c
        },
        createIndexBuffer: function (a, b) {
            var c = a.createBuffer();
            a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, c);
            a.bufferData(a.ELEMENT_ARRAY_BUFFER, b, a.STATIC_DRAW);
            return c
        },
        bindPointBase: function (a) {
            var b = a.gl;
            b.bindBuffer(b.ARRAY_BUFFER, this.vboBasePositions);
            b.enableVertexAttribArray(this.programAttribVertexPosition);
            b.vertexAttribPointer(this.programAttribVertexPosition, 3, b.FLOAT, false, 0, 0);
            b.bindBuffer(b.ARRAY_BUFFER, this.vboBaseNormals);
            b.enableVertexAttribArray(this.programAttribVertexNormal);
            b.vertexAttribPointer(this.programAttribVertexNormal, 3, b.FLOAT, false, 0, 0);
            b.bindBuffer(b.ARRAY_BUFFER, this.vboBaseOffset);
            b.enableVertexAttribArray(this.programAttribOffset);
            b.vertexAttribPointer(this.programAttribOffset, 2, b.FLOAT, false, 0, 0);
            b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, this.iboBase)
        },
        getFlatColor: function (a, b) {
            b[0] = a.color[0] * a.intensity;
            b[1] = a.color[1] * a.intensity;
            b[2] = a.color[2] * a.intensity;
            return b
        },
        setCommonUniforms: function (a) {
            var b = a.gl;
            var c = a.camera;
            b.uniform1f(this.uCurrentTime, performance.now() / 1000.0);
            b.uniform3fv(this.programUniformDirectionalColor, this.getFlatColor(a.sunLight.diffuse, this.tempVec3));
            b.uniform3fv(this.programUniformAmbientColor, this.getFlatColor(a.sunLight.ambient, this.tempVec3));
            b.uniform3fv(this.programUniformLightingDirection, a.sunLight.direction);
            b.uniformMatrix4fv(this.programUniformProjectionMatrix, false, a.camera.projectionMatrix)
        }
    }) 
    return A
});;