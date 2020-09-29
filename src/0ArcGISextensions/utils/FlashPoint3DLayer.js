/* 
Created by yangyiwen 2020/02/02  base on mapview or sceneveiwer
*/
define([
        'dojo/_base/declare',
        'dojo/on',
        "esri/views/3d/externalRenderers",
         "esri/geometry/SpatialReference",
         "esri/geometry/Point",
         "esri/geometry/support/webMercatorUtils",
         "http://10.201.37.225:8080/smiapi/arcgis/extensions/utils/gl-matrix.js",
        'dojo/domReady!'
    ],
    function (declare, on, externalRenderers, SpatialReference, Point, webMercatorUtils,glMatrix) {
        var FlashPoint3DLayer = declare(null, {
            constructor: function (options, callback ,callbackPointermove) {
                this.view = options.view,
                this.nring = options.nring = undefined ? 1.0 : options.nring
                this.spead = options.spead = undefined ? 1.0 : options.spead
                this.symbolsize = options.size = undefined ? 15.0 : options.size
                this.color = options.color;
                this.points = options.points,
                this.needsUpdate = false;
                this.numPoints = null,
                this.callback = callback;
                this.callbackPointermove = callbackPointermove;
                // Local origin
                this.localOrigin =  null,
                this.localOriginRender =  null,

                // Vertex and index buffers
                this.vboBasePositions =  null,
                this.vboBaseNormals = null,
                this.vboBaseOffset =  null,
                this. iboBase =  null,

                // Vertex and index data
                this. pointBasePositions =  null,
                this.pointBaseNormals =  null,
                this.pointBaseIndices =  null,
                this. pointBaseOffsets =  null,

                // Shader
                this.program =  null,

                // Shader attribute and uniform locations
                this.programAttribVertexPosition =  null,
                this.programAttribVertexNormal = null,
                this. programAttribOffset =  null,
                this.programUniformProjectionMatrix =  null,
                this.programUniformModelViewMatrix =  null,
                this.programUniformNormalMatrix =  null,
                this. programUniformAmbientColor =  null,
                this. programUniformLightingDirection =  null,
                this.programUniformDirectionalColor =  null,

                // Per-instance data
                this.pointInstanceInputToRender = null,

                // Temporary matrices and vectors,
                // used to avoid allocating objects in each frame.
                this.tempMatrix4 =  new Float32Array(16),
                this.tempMatrix3 =  new Float32Array(9),
                this.tempVec3 =  new Float32Array(3),
                this.fshader = 
                "precision highp float;" +
                "uniform float u_current_time;" +
                "varying vec2 v_offset;" +
                "const float PI = 3.14159;" +
                "const float N_RINGS =" + parseFloat(this.nring).toFixed(1) + ";" +
                "const vec3 COLOR = vec3(" + this.color[0]+"," + this.color[1] + "," + this.color[2]+");" +
                "const float FREQ = " + parseFloat(this.spead).toFixed(1) + ";" +
                "void main() {" +
                "  float l = length(v_offset);" +
                "  float intensity = clamp(cos(l * PI), 0.0, 1.0) * clamp(cos(2.0 * PI * (l * 2.0 * N_RINGS - FREQ * u_current_time)), 0.0, 1.0);" +
                "  gl_FragColor = vec4(COLOR * intensity, intensity);" +
                " }";
                this.vshader = 
                "precision highp float;" +
                "attribute vec3 aVertexPosition;" +
                "attribute vec3 aVertexNormal;" +
                "uniform mat4 uModelViewMatrix;" +
                "uniform mat4 uProjectionMatrix;" +
                "uniform mat3 uNormalMatrix;" +
                "uniform vec3 uAmbientColor;" +
                "uniform vec3 uLightingDirection;" +
                "uniform vec3 uDirectionalColor;" +
                "uniform mat3 u_transform;" +
                "uniform mat3 u_display;" +
                "attribute vec2 a_offset;" +
                "varying vec2 v_offset;" +
                "const float SIZE = 70.0;" +
                "void main() {" +
                "    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);" +
                "    vec3 transformedNormal = normalize(uNormalMatrix * aVertexNormal);"+
                "    float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);" +
                "    gl_PointSize = 10.0;"+
                "   v_offset = a_offset;"+
                "}"
                _this = this;
            },

            setup: function (context) {
                this.initShaders(context);
                // init datadddddddddddd
                this.initData(context, this.points);

                // cleanup
                context.resetWebGLState();
                
                this.initevent()
            },

            render: function (context) {
                var gl = context.gl;

                // Set some global WebGL state
                // State will be reset between each render() call
                gl.enable(gl.DEPTH_TEST);
                gl.disable(gl.CULL_FACE);
                gl.disable(gl.BLEND);

                // Enable our shader
                gl.useProgram(this.program);
                this.setCommonUniforms(context);

                this.bindPointBase(context);
                glMatrix.mat4.identity(this.tempMatrix4);

                // Apply local origin by translation the view matrix by the local origin, this will
                // put the view origin (0, 0, 0) at the local origin
                glMatrix.mat4.translate(
                    this.tempMatrix4,
                    this.tempMatrix4,
                    this.localOriginRender
                );
                glMatrix.mat4.multiply(
                    this.tempMatrix4,
                    context.camera.viewMatrix,
                    this.tempMatrix4
                );
                gl.uniformMatrix4fv(
                    this.programUniformModelViewMatrix,
                    false,
                    this.tempMatrix4
                );

                // Normals are in world coordinates, normal transformation is therefore identity
                glMatrix.mat3.identity(this.tempMatrix3);
                gl.uniformMatrix3fv(
                    this.programUniformNormalMatrix,
                    false,
                    this.tempMatrix3
                );

                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                gl.drawElements(
                    gl.TRIANGLES,
                    // gl.POINTS,
                    this.pointBaseIndices.length,
                    gl.UNSIGNED_SHORT,
                    0
                );
                // gl.drawArrays(gl.TRIANGLES, 0, 3);

                // Draw continuously
                externalRenderers.requestRender(this.view);

                // cleanup
                context.resetWebGLState();
            },

            /**
             * Loads a shader from a <script> html tag
             */
            getShader: function (gl, id) {
                // var shaderScript = document.getElementById(id);
                // if (!shaderScript) {
                //     return null;
                // }
                var shadestr =null;
                if (id ==='fshader'){
                  shadestr =this.fshader;
                }else {
                 shadestr = this.vshader;
                }

                var str = shadestr;
                // var k = shaderScript.firstChild;
                // var k = shadestr;
                // while (k) {
                //     if (k.nodeType == 3) {
                //         str += k.textContent;
                //     }
                //     k = k.nextSibling;
                // }

                var shader;
                if (id === 'fshader') {
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                } else if (id ==='vshader') {
                    shader = gl.createShader(gl.VERTEX_SHADER);
                } else {
                    return null;
                }

                gl.shaderSource(shader, str);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                   // alert(gl.getShaderInfoLog(shader));
                    return null;
                }

                return shader;
            },

            /**
             * Links vertex and fragment shaders into a GLSL program
             */
            linkProgram: function (gl, fragmentShader, vertexShader) {
                var shaderProgram = gl.createProgram();

                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                    return null;
                }

                return shaderProgram;
            },

            /**
             * Initializes all shaders requried by the application
             */
            initShaders: function (context) {
                var gl = context.gl;

                var fragmentShader = this.getShader(gl, "fshader");
                var vertexShader = this.getShader(gl, "vshader");
                this.program = this.linkProgram(gl, fragmentShader, vertexShader);
                if (!this.program) {
                   // alert("Could not initialise shaders");
                }

                gl.useProgram(this.program);

                // Program attributes
                this.programAttribVertexPosition = gl.getAttribLocation(
                    this.program,
                    "aVertexPosition"
                );
                gl.enableVertexAttribArray(this.programAttribVertexPosition);

                this.programAttribVertexNormal = gl.getAttribLocation(
                    this.program,
                    "aVertexNormal"
                );
                gl.enableVertexAttribArray(this.programAttribVertexNormal);

                this.programAttribOffset = gl.getAttribLocation(
                    this.program,
                    "a_offset"
                );
                gl.enableVertexAttribArray(this.programAttribOffset);

                // Program uniforms
                this.programUniformProjectionMatrix = gl.getUniformLocation(
                    this.program,
                    "uProjectionMatrix"
                );
                this.programUniformModelViewMatrix = gl.getUniformLocation(
                    this.program,
                    "uModelViewMatrix"
                );
                this.programUniformNormalMatrix = gl.getUniformLocation(
                    this.program,
                    "uNormalMatrix"
                );
                this.programUniformAmbientColor = gl.getUniformLocation(
                    this.program,
                    "uAmbientColor"
                );
                this.programUniformLightingDirection = gl.getUniformLocation(
                    this.program,
                    "uLightingDirection"
                );
                this.programUniformDirectionalColor = gl.getUniformLocation(
                    this.program,
                    "uDirectionalColor"
                );
                this.uDisplay = gl.getUniformLocation(this.program, "u_display");
                this.uCurrentTime = gl.getUniformLocation(
                    this.program,
                    "u_current_time"
                );
            },

            initData: function (context, data) {
                var gl = context.gl;
                this.numPoints = data.length; // 2

                // Choose a local origin.
                // In our case, we simply use the map center.
                // For global scenes, you'll need multiple local origins.
                var localOriginSR = this.view.extent.center.spatialReference;
                this.localOrigin = [this.view.extent.center.x, this.view.extent.center.y, 0];

                // Calculate local origin in render coordinates with 32bit precision
                this.localOriginRender = externalRenderers.toRenderCoordinates(
                    this.view,
                    this.localOrigin,
                    0,
                    localOriginSR,
                    new Float32Array(3),
                    0,
                    1
                );

                // Extract station data into flat arrays. speed & rpm .etc
                this.pointInstanceInputToRender = new Array(this.numPoints);

                for (var i = 0; i < this.numPoints; ++i) {
                    var pointf = data[i];
                    var point = webMercatorUtils.xyToLngLat(pointf.x, pointf.y)
                    var inputSR = new SpatialReference({
                        wkid: 4326
                    });
                    var inputPoint = [point[0], point[1], 0];
                    var inputToRender = externalRenderers.renderCoordinateTransformAt(
                        this.view,
                        inputPoint,
                        inputSR,
                        new Float64Array(16)
                    );
                    this.pointInstanceInputToRender[i] = inputToRender;
                }

                this.pointBasePositions = new Float64Array(this.numPoints * 3 * 4);
                this.pointBaseNormals = new Float64Array(this.numPoints * 3 * 4);
                this.pointBaseIndices = new Uint16Array(this.numPoints * 6);
                this.pointBaseOffsets = new Float64Array(this.numPoints * 2 * 4);

                for (var i = 0; i < this.numPoints; i++) {
                    // Transformation of positions from local to render coordinates
                    var positionMatrix = new Float64Array(16);
                    glMatrix.mat4.identity(positionMatrix);
                    glMatrix.mat4.multiply(
                        positionMatrix,
                        this.pointInstanceInputToRender[i],
                        positionMatrix
                    );

                    // Transformation of normals from local to render coordinates
                    var normalMatrix = new Float64Array(9);
                    glMatrix.mat3.normalFromMat4(normalMatrix, positionMatrix);

                    // Append vertex and index data
                    var numCoordinates = 4 * 3;
                    var numVertices = numCoordinates / 3;
                    // for (var j = 0; j < numCoordinates; ++j) {
                    // this.pointBasePositions[i * numCoordinates + j] = 0;
                    // this.pointBaseNormals[i * numCoordinates + j] = 0;

                    this.pointBaseOffsets[i * 8 + 0] = -0.5;
                    this.pointBaseOffsets[i * 8 + 1] = -0.5;
                    this.pointBaseOffsets[i * 8 + 2] = 0.5;
                    this.pointBaseOffsets[i * 8 + 3] = -0.5;
                    this.pointBaseOffsets[i * 8 + 4] = -0.5;
                    this.pointBaseOffsets[i * 8 + 5] = 0.5;
                    this.pointBaseOffsets[i * 8 + 6] = 0.5;
                    this.pointBaseOffsets[i * 8 + 7] = 0.5;

                    var size = 70 / 2;
                    var scale = size; // / view.resolution;

                    var x = positionMatrix[12];
                    var y = positionMatrix[13];
                    this.pointBasePositions[i * numCoordinates + 0] = -1*this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 1] = -1 * this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 2] = data[i].z !== undefined ? data[i].z:1;
                    this.pointBasePositions[i * numCoordinates + 3] = 1 * this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 4] = -1 * this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 5] = data[i].z !== undefined ? data[i].z : 1;
                    this.pointBasePositions[i * numCoordinates + 6] = -1 * this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 7] = 1 * this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 8] = data[i].z !== undefined ? data[i].z : 1;
                    this.pointBasePositions[i * numCoordinates + 9] = 1 * this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 10] = 1 * this.symbolsize;
                    this.pointBasePositions[i * numCoordinates + 11] = data[i].z !== undefined ? data[i].z : 1;
                    // }

                    // Transform vertices into render coordinates
                    glMatrix.vec3.forEach(
                        this.pointBasePositions,
                        0,
                        i * numCoordinates,
                        numVertices,
                        glMatrix.vec3.transformMat4,
                        positionMatrix
                    );

                    // Subtract local origin coordinates
                    glMatrix.vec3.forEach(
                        this.pointBasePositions,
                        0,
                        i * numCoordinates,
                        numVertices,
                        glMatrix.vec3.subtract,
                        this.localOriginRender
                    );

                    // Transform normals into render coordinates
                    glMatrix.vec3.forEach(
                        this.pointBaseNormals,
                        0,
                        i * numCoordinates,
                        numVertices,
                        glMatrix.vec3.transformMat3,
                        normalMatrix
                    );

                    // Re-normalize normals
                    glMatrix.vec3.forEach(
                        this.pointBaseNormals,
                        0,
                        i * numCoordinates,
                        numVertices,
                        glMatrix.vec3.normalize
                    );

                    // Append index data
                    var numIndices = 6;
                    // for (var j = 0; j < numIndices; ++j) {
                    // this.pointBaseIndices[i * numIndices + j] = 0 + i * numVertices;
                    // }
                    this.pointBaseIndices[i * numIndices + 0] = 0 + i * 4;
                    this.pointBaseIndices[i * numIndices + 1] = 1 + i * 4;
                    this.pointBaseIndices[i * numIndices + 2] = 2 + i * 4;
                    this.pointBaseIndices[i * numIndices + 3] = 1 + i * 4;
                    this.pointBaseIndices[i * numIndices + 4] = 3 + i * 4;
                    this.pointBaseIndices[i * numIndices + 5] = 2 + i * 4;
                }

                // Upload our data to WebGL
                this.vboBasePositions = this.createVertexBuffer(
                    gl,
                    this.pointBasePositions
                );
                this.vboBaseNormals = this.createVertexBuffer(
                    gl,
                    this.pointBaseNormals
                );
                this.vboBaseOffset = this.createVertexBuffer(
                    gl,
                    this.pointBaseOffsets
                );
                this.iboBase = this.createIndexBuffer(gl, this.pointBaseIndices);
            },
            initevent:function(){
                var _self =this
                if (!_self.view){ return }
                _self.view.on("click", function (event) {
                    if (!_self.points.length){
                        _self.callback(null)
                    }else{
                      var distances= _self.points.map(function(point) {
                           let pointorigin = new Point({
                               x: point.x,
                               y: point.y,
                               spatialReference: SpatialReference.WebMercator
                           });
                          var graphicPoint = _self.view.toScreen(pointorigin);
                           return Math.sqrt(
                               (graphicPoint.x - event.x) * (graphicPoint.x - event.x) +
                               (graphicPoint.y - event.y) * (graphicPoint.y - event.y)
                           );
                       })
                    
                        var minIndex = 0;
                        distances.forEach(function (distance, i) {
                            if (distance < distances[minIndex]) {
                                minIndex = i;
                            }
                        });
                        var minDistance = distances[minIndex];
                        if (minDistance > 35) {
                            // _self.callback(null)
                        }else{
                            _self.callback(_self.points[minIndex])
                        }
                    }
                });

                _self.view.on("pointer-move", function (event) {
                    if (!_self.points.length) {
                        // _self.callback(null)
                    } else {
                        var distances = _self.points.map(function (point) {
                            let pointorigin = new Point({
                                x: point.x,
                                y: point.y,
                                spatialReference: SpatialReference.WebMercator
                            });
                            var graphicPoint = _self.view.toScreen(pointorigin);
                            return Math.sqrt(
                                (graphicPoint.x - event.x) * (graphicPoint.x - event.x) +
                                (graphicPoint.y - event.y) * (graphicPoint.y - event.y)
                            );
                        })

                        var minIndex = 0;
                        distances.forEach(function (distance, i) {
                            if (distance < distances[minIndex]) {
                                minIndex = i;
                            }
                        });
                        var minDistance = distances[minIndex];
                        if (minDistance > 35) {
                            // _self.callbackPointermove(null)
                        } else {
                            _self.callbackPointermove(_self.points[minIndex])
                        }
                    }
                });
            },

            /**
             * Creates a vertex buffer from the given data.
             */
            createVertexBuffer: function (gl, data) {
                var buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

                // We have filled vertex buffers in 64bit precision,
                // convert to a format compatible with WebGL
                var float32Data = new Float32Array(data);

                gl.bufferData(gl.ARRAY_BUFFER, float32Data, gl.STATIC_DRAW);
                return buffer;
            },

            /**
             * Creates an index buffer from the given data.
             */
            createIndexBuffer: function (gl, data) {
                var buffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
                return buffer;
            },

            /**
             * Activates vertex attributes for the drawing of the windmill base.
             */
            bindPointBase: function (context) {
                var gl = context.gl;

                gl.bindBuffer(gl.ARRAY_BUFFER, this.vboBasePositions);
                gl.enableVertexAttribArray(this.programAttribVertexPosition);
                gl.vertexAttribPointer(
                    this.programAttribVertexPosition,
                    3,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.bindBuffer(gl.ARRAY_BUFFER, this.vboBaseNormals);
                gl.enableVertexAttribArray(this.programAttribVertexNormal);
                gl.vertexAttribPointer(
                    this.programAttribVertexNormal,
                    3,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.bindBuffer(gl.ARRAY_BUFFER, this.vboBaseOffset);
                gl.enableVertexAttribArray(this.programAttribOffset);
                gl.vertexAttribPointer(
                    this.programAttribOffset,
                    2,
                    gl.FLOAT,
                    false,
                    0,
                    0
                );

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iboBase);
            },

            /**
             * Returns a color vector from a {color, intensity} object.
             */
            getFlatColor: function (src, output) {
                output[0] = src.color[0] * src.intensity;
                output[1] = src.color[1] * src.intensity;
                output[2] = src.color[2] * src.intensity;
                return output;
            },
            setCommonUniforms: function (context) {
                var gl = context.gl;
                var camera = context.camera;

                gl.uniform1f(this.uCurrentTime, performance.now() / 1000.0);

                gl.uniform3fv(
                    this.programUniformDirectionalColor,
                    this.getFlatColor(context.sunLight.diffuse, this.tempVec3)
                );
                gl.uniform3fv(
                    this.programUniformAmbientColor,
                    this.getFlatColor(context.sunLight.ambient, this.tempVec3)
                );
                gl.uniform3fv(
                    this.programUniformLightingDirection,
                    context.sunLight.direction
                );

                gl.uniformMatrix4fv(
                    this.programUniformProjectionMatrix,
                    false,
                    context.camera.projectionMatrix
                );
            }

        })
        return FlashPoint3DLayer;
    });