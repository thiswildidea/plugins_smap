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
    var CurveLineRenderer = declare([], {
        constructor: function (view, lineString, options) {
            this.view = view;
            const OPTIONS = {
                height: 0,
                altitude: 0,
                speed: 0.1
            }
            this.options = this.extend({}, OPTIONS, options, {
                lineString: lineString
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
            let texture = new THREE.TextureLoader().load(scope.options.textureURL);
            texture.anisotropy = 16;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            let material = new MeshLineMaterial({
                map: texture,
                useMap: true,
                lineWidth: scope.options.lineWidth,
                sizeAttenuation: false,
                transparent: true,
                near: scope.camera.near,
                far: scope.camera.far
            });

            scope.options.offset = material.uniforms.offset.value;
            scope.options.clock = new THREE.Clock();

            const {
                altitude
            } = scope.options;
            const points = scope.getArcPoints(scope.options.lineString);
            const geometry = new THREE.Geometry();
            geometry.vertices = points;
            const meshLine = new MeshLine();
            meshLine.setGeometry(geometry);

            material.uniforms.resolution.value.set(scope.view.size[0], scope.view.size[1]);

            scope.object3d = new THREE.Mesh(meshLine.geometry, material);
            scope.scene.add(scope.object3d);
            // const center = scope.options.lineString.getCenter();
            // const v = scope.coordinateToVector3(center, altitude);
            // const coordinates = scope.options.lineString.getCoordinates();
            const v = scope.coordinateToVector3(scope.options.lineString[0]);
            scope.object3d.position.copy(v);
            context.resetWebGLState();
        },

        getArcPoints: function (lineString) {
            const pois = [];
            lineString.map((line) => {
                const v = this.coordinateToVector3(line);
                pois.push(v)
            })
            const ellipse = new THREE.CatmullRomCurve3(pois, false, 'catmullrom');
            const points = ellipse.getPoints(40);
            return points;
        },
        coordinateToVector3: function (coord, z = 0) {
            const p = coord;
            let transform = new THREE.Matrix4();
            let transformation = new Array(16);
            const h = p[2] === undefined ? 0 : p[2]
            transform.fromArray(
                externalRenderers.renderCoordinateTransformAt(
                    this.view,
                    [p[0], p[1], h],
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
            this.options.offset.x -= this.options.speed * this.options.clock.getDelta();
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            externalRenderers.requestRender(this.view);
            context.resetWebGLState();
        }
    });
    return CurveLineRenderer;
});