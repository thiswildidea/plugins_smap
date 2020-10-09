;
define(['dojo/_base/declare', "esri/geometry/geometryEngine", "esri/geometry/Extent", "esri/views/3d/externalRenderers", "esri/geometry/Polygon", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils"], function (e, f, g, j, l, m, n) {
    var o = window.THREE;
    var q = e([], {
        constructor: function (a, b, c) {
            this.view = a;
            this.object3ds = [];
            const OPTIONS = {
                height: 0,
                altitude: 0,
                speed: 0.1
            }
            this.options = this.extend({}, OPTIONS, c, {
                lineStrings: b
            })
        },
        setup: function (b) {
            this.renderer = new o.WebGLRenderer({
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
            this.scene = new o.Scene();
            this.camera = new o.PerspectiveCamera();
            const axesHelper = new o.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            this.scene.add(axesHelper);
            this._setupScene(b)
        },
        _setupScene: function (a) {
            var b = this;
            let texture = new o.TextureLoader().load(b.options.textureURL);
            texture.anisotropy = 16;
            texture.wrapS = o.RepeatWrapping;
            texture.wrapT = o.RepeatWrapping;
            let material = new MeshLineMaterial({
                map: texture,
                useMap: true,
                lineWidth: b.options.lineWidth,
                sizeAttenuation: false,
                transparent: true,
                near: b.camera.near,
                far: b.camera.far
            });
            b.options.offset = material.uniforms.offset.value;
            b.options.clock = new o.Clock();
            const {
                altitude
            } = b.options;
            const offset = Infinity;
            b.options.lineStrings.slice(0, offset).map((d) => {
                const points = b.getArcPoints(d);
                const geometry = new o.Geometry();
                geometry.vertices = points;
                const meshLine = new MeshLine();
                meshLine.setGeometry(geometry);
                material.uniforms.resolution.value.set(b.view.size[0], b.view.size[1]);
                const object3d = new o.Mesh(meshLine.geometry, material);
                b.scene.add(object3d);
                b.object3ds.push(object3d)
            });
            a.resetWebGLState()
        },
        setaltitude: function (a) {
            if (!this.object3ds.length) {
                return
            }
            this.object3ds.forEach((item) => {
                item.position.z = a
            })
        },
        getArcPoints: function (a) {
            const pois = [];
            a.map((line) => {
                const v = this.coordinateToVector3(line);
                pois.push(v)
            }) 
            const ellipse = new o.CatmullRomCurve3(pois, false, 'catmullrom');
            const points = ellipse.getPoints(40);
            return points
        },
        coordinateToVector3: function (a, b=0) {
            const p = a;
            let transform = new o.Matrix4();
            let transformation = new Array(16);
            const h = p[2] === undefined ? 0 : p[2] 
            transform.fromArray(j.renderCoordinateTransformAt(this.view, [p[0], p[1], h], this.view.spatialReference, transformation));
            let vector3 = new o.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]);
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
            this.camera.lookAt(new o.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.options.offset.x -= this.options.speed * this.options.clock.getDelta();
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            j.requestRender(this.view);
            a.resetWebGLState()
        }
    });
    return q
});;