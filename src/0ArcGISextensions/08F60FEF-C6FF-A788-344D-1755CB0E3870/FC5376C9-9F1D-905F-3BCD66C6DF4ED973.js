;
define(['dojo/_base/declare', "esri/geometry/geometryEngine", "esri/geometry/Extent", "esri/views/3d/externalRenderers", "esri/geometry/Polygon", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils"], function (d, e, f, g, h, j, l) {
    var m = window.THREE;
    var o = d([], {
        constructor: function (a, b, c) {
            this.view = a;
            this.ElectricShieldobject3d = [];
            const OPTIONS = {
                speed: 0.02,
                radius: 1,
                altitude: 0,
            }
            this.options = this.extend({}, OPTIONS, c, {
                points: b
            })
        },
        setup: function (b) {
            this.renderer = new m.WebGLRenderer({
                context: b.gl,
                premultipliedAlpha: false,
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setViewport(0, 0, this.view.width, this.view.height);
            this.renderer.autoClear = false;
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearColor = false;
            this.renderer.autoClearStencil = false;
            var c = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (a) {
                c(a);
                if (a == null) {
                    b.bindRenderTarget()
                }
            };
            this.scene = new m.Scene();
            this.camera = new m.PerspectiveCamera();
            const axesHelper = new m.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            this.scene.add(axesHelper);
            this._setupScene(b)
        },
        _setupScene: function (a) {
            var b = this;
            b.material = b.getMaterial() 
            const {
                altitude,
                radius
            } = b.options;
            b.options.points.forEach((point) => {
                const geometry = new m.SphereBufferGeometry(point.radius, 50, 50, 0, Math.PI * 2);
                const object3d = new m.Mesh(geometry, b.material);
                const position = b.coordinateToVector3([point.x, point.y], point.altitude);
                object3d.position.copy(position);
                object3d.rotation.x = Math.PI / 2;
                b.scene.add(object3d);
                b.ElectricShieldobject3d.push(object3d)
            }) 
            a.resetWebGLState()
        },
        getMaterial: function () {
            var a = this;
            var b = {
                uniforms: {
                    time: {
                        type: "f",
                        value: 0
                    },
                    color: {
                        type: "c",
                        value: new m.Color(a.options.color)
                    },
                    opacity: {
                        type: "f",
                        value: 1
                    }
                },
                vertexShaderSource: "\n  precision lowp float;\n  precision lowp int;\n  ".concat(m.ShaderChunk.fog_pars_vertex, "\n  varying vec2 vUv;\n  void main() {\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    ").concat(m.ShaderChunk.fog_vertex, "\n  }\n"),
                fragmentShaderSource: a.options.fragmentShaderSource,
            };
            let material = new m.ShaderMaterial({
                uniforms: b.uniforms,
                defaultAttributeValues: {},
                vertexShader: b.vertexShaderSource,
                fragmentShader: b.fragmentShaderSource,
                blending: m.AdditiveBlending,
                depthWrite: !1,
                shading: m.FlatShading,
                opacity: 0.1,
                depthTest: !0,
                side: m.DoubleSide,
                transparent: !0,
                wireframe: a.options.wireframe === undefined ? false : a.options.wireframe,
            });
            return material
        },
        setMaterialColor: function (a) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.material.color.set(a)
            })
        },
        setwireframe: function () {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.material.wireframe = !item.material.wireframe
            })
        },
        setopacity: function (a) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.material.opacity = a
            })
        },
        setaltitude: function (a) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.position.z = a
            })
        },
        setscaleZ: function (a) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.scale.z = a
            })
        },
        coordinateToVector3: function (a, b=0) {
            const p = a;
            let transform = new m.Matrix4();
            let transformation = new Array(16);
            transform.fromArray(g.renderCoordinateTransformAt(this.view, [p[0], p[1], b], this.view.spatialReference, transformation));
            let vector3 = new m.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]);
            return vector3
        },
        extend: function (a) {
            for (let i = 1; i < arguments.length; i++) {
                const src = arguments[i];
                for (const k in src) {
                    a[k] = src[k]
                }
            }
            return a
        },
        render: function (a) {
            const cam = a.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(new m.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.ElectricShieldobject3d.map((item) => {
                item.material.uniforms.time.value += this.options.speed
            }) 
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            g.requestRender(this.view);
            a.resetWebGLState()
        }
    });
    return o
});;