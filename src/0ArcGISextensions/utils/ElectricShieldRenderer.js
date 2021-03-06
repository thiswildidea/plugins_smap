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
    var THREE = window.THREE;
    var ElectricShieldRenderer = declare([], {
        constructor: function (view, points, options) {
            this.view = view;
            this.ElectricShieldobject3d = [];
            const OPTIONS = {
                speed: 0.02,
                radius: 1,
                altitude: 0,
            }
            this.options = this.extend({}, OPTIONS, options, {
                points: points
            });
        },

        setup: function (context) {
            this.renderer = new THREE.WebGLRenderer({
                context: context.gl, // 可用于将渲染器附加到已有的渲染环境(RenderingContext)中
                premultipliedAlpha: false, // renderer是否假设颜色有 premultiplied alpha. 默认为true
            });
            this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
            this.renderer.setViewport(0, 0, this.view.width, this.view.height); // 视口大小设置

            // Make sure it does not clear anything before rendering
            this.renderer.autoClear = false;
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearColor = false;
            this.renderer.autoClearStencil = false;

            // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
            // We have to inject this bit of code into the three.js runtime in order for it to bind those
            // buffers instead of the default ones.
            var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (target) {
                originalSetRenderTarget(target);
                if (target == null) {
                    context.bindRenderTarget();
                }
            };
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera();

            const axesHelper = new THREE.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            this.scene.add(axesHelper);
            
            this._setupScene(context);


        },
        _setupScene: function (context) {
            var scope = this;
            scope.material = scope.getMaterial()
            const {
                altitude,
                radius
            } = scope.options;
            scope.options.points.forEach((point) => {
                const geometry = new THREE.SphereBufferGeometry(point.radius, 50, 50, 0, Math.PI * 2);
                const object3d = new THREE.Mesh(geometry, scope.material);
                const position = scope.coordinateToVector3([point.x, point.y], point.altitude);
                object3d.position.copy(position);
                object3d.rotation.x = Math.PI / 2;
                scope.scene.add(object3d);
                scope.ElectricShieldobject3d.push(object3d)
            })
            context.resetWebGLState();
        },
        getMaterial: function () {
            var scope = this;
            var ElectricShield = {
                uniforms: {
                    time: {
                        type: "f",
                        value: 0
                    },
                    color: {
                        type: "c",
                        value: new THREE.Color(scope.options.color)
                    },
                    opacity: {
                        type: "f",
                        value: 1
                    }
                },
                vertexShaderSource: "\n  precision lowp float;\n  precision lowp int;\n  "
                    .concat(
                        THREE.ShaderChunk.fog_pars_vertex,
                        "\n  varying vec2 vUv;\n  void main() {\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    "
                    )
                    .concat(THREE.ShaderChunk.fog_vertex, "\n  }\n"),
                fragmentShaderSource: scope.options.fragmentShaderSource,
            };
            let material = new THREE.ShaderMaterial({
                uniforms: ElectricShield.uniforms,
                defaultAttributeValues: {},
                vertexShader: ElectricShield.vertexShaderSource,
                fragmentShader: ElectricShield.fragmentShaderSource,
                blending: THREE.AdditiveBlending,
                depthWrite: !1,
                shading: THREE.FlatShading,
                opacity: 0.1,
                depthTest: !0,
                side: THREE.DoubleSide,
                transparent: !0,
                wireframe: scope.options.wireframe === undefined ? false : scope.options.wireframe,
            });
            return material;
        },
        setMaterialColor: function (rgb) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.material.color.set(rgb);
            })
        },
        setwireframe: function () {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.material.wireframe = !item.material.wireframe;
            })
        },
        setopacity: function (opacity) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.material.opacity = opacity;
            })
        },
        setaltitude: function (altitude) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.position.z = altitude;
            })
        },

        setscaleZ: function (scaleZ) {
            if (!this.ElectricShieldobject3d.length) {
                return
            }
            this.ElectricShieldobject3d.forEach((item) => {
                item.scale.z = scaleZ;
            })
        },

        coordinateToVector3: function (coord, z = 0) {

            const p = coord;
            let transform = new THREE.Matrix4();
            let transformation = new Array(16);
            // const z = point.z === undefined ? 0 : point.z
            transform.fromArray(
                externalRenderers.renderCoordinateTransformAt(
                    this.view,
                    [p[0], p[1], z],
                    this.view.spatialReference,
                    transformation
                )
            );
            let vector3 = new THREE.Vector3(
                transform.elements[12],
                transform.elements[13],
                transform.elements[14]
            );
            return vector3;
        },
        extend: function (dest) { // (Object[, Object, ...]) ->
            for (let i = 1; i < arguments.length; i++) {
                const src = arguments[i];
                for (const k in src) {
                    dest[k] = src[k];
                }
            }
            return dest;
        },

        render: function (context) {

            const cam = context.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(
                new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2])
            );

            this.ElectricShieldobject3d.map((item) => {

                item.material.uniforms.time.value += this.options.speed;
            })
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            externalRenderers.requestRender(this.view);
            context.resetWebGLState();
        }
    });
    return ElectricShieldRenderer;
});