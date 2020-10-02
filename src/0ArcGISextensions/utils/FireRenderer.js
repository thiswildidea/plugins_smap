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
        var Fire = window.fire;
    var FireRenderer = declare([], {
        constructor: function (view, point, options) {
            this.view = view;
            const OPTIONS = {
                width: 500,
                height: 500,
                altitude: 0,
                interactive: false
            }
            this.options = this.extend({}, OPTIONS, options, {
                point: point
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

            var plane = new THREE.PlaneBufferGeometry(scope.options.width, scope.options.height);
            scope.fire = new Fire(plane, {
                textureWidth: 512,
                textureHeight: 512,
                debug: false
            });
            const position = scope.coordinateToVector3([scope.options.point.x, scope.options.point.y], scope.options.point.altitude);
            scope.fire.position.copy(position);
            scope.scene.add(scope.fire);
            context.resetWebGLState();
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
        extend: function (dest) {
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
            const pitch = this.view.camera.tilt;
            const bearing = this.view.camera.heading;
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            externalRenderers.requestRender(this.view);
            context.resetWebGLState();
        }
    });
    return FireRenderer;
});