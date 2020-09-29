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
    var SpriteLineRenderer = declare([], {
        constructor: function (view, lineString, options) {
            this.view = view;
            const OPTIONS = {
                altitude: 0,
                speed: 0.01
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
            const { positions } = scope.getLinePosition(lineString, layer);
            const positions1 = scope._getLinePosition(lineString, layer).positions;

            const geometry = new THREE.Geometry();
            for (let i = 0; i < positions.length; i += 3) {
                geometry.vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
            }
            const meshLine = new MeshLine();
            meshLine.setGeometry(geometry);
            material.uniforms.resolution.value.set(width, height);

            const line = new THREE.Mesh(meshLine.geometry, material);
            scope.scene.add.add(line);
            const { altitude } = options;
            const center = lineString.getCenter();
            const v = scope.coordinateToVector3(center, z);
            scope.scene.add.position.copy(v);
            context.resetWebGLState();
        },

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
            this.options.offset.x -= this.options.speed * this.options.clock.getDelta();
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            externalRenderers.requestRender(this.view);
            context.resetWebGLState();
        }
    });
    return SpriteLineRenderer;
});