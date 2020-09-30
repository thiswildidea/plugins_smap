;
define(['dojo/_base/declare', "esri/geometry/geometryEngine", "esri/geometry/Extent", "esri/views/3d/externalRenderers", "esri/geometry/Polygon", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils"], function (d, e, f, g, h, j, l) {
    var m = window.THREE;
    var n = d([], {
        constructor: function (a, b, c) {
            this.view = a;
            const OPTIONS = {
                width: 500,
                height: 500,
                altitude: 0,
                interactive: false
            }
            this.options = this.extend({}, OPTIONS, c, {
                point: b
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
            const texture = new m.TextureLoader().load(b.options.cloudurl);
            b.material = new m.MeshBasicMaterial({
                map: texture,
                opacity: 1
            });
            b.material.depthWrite = false;
            b.material.depthTest = false;
            b.material.transparent = true;
            const geometry = new m.PlaneBufferGeometry(b.options.width, b.options.height);
            b.object3d = new m.Mesh(geometry, b.material);
            const position = b.coordinateToVector3([b.options.point.x, b.options.point.y], b.options.point.altitude);
            b.object3d.position.copy(position);
            b.scene.add(b.object3d);
            const random = Math.random();
            const flag = random <= 0.3 ? "x" : random < 0.6 ? "y" : "z";
            b.positionflag = flag;
            const offset = Math.min(b.options.width, b.options.height);
            b.offset = offset;
            b._offset = 0;
            b._offsetAdd = random > 0.5;
            a.resetWebGLState()
        },
        setMaterialColor: function (a) {
            if (!this.cloudobject3ds.length) {
                return
            }
            this.cloudobject3ds.forEach((item) => {
                item.material.color.set(a)
            })
        },
        setwireframe: function () {
            if (!this.cloudobject3ds.length) {
                return
            }
            this.cloudobject3ds.forEach((item) => {
                item.material.wireframe = !item.material.wireframe
            })
        },
        setopacity: function (a) {
            if (!this.cloudobject3ds.length) {
                return
            }
            this.cloudobject3ds.forEach((item) => {
                item.material.opacity = a
            })
        },
        setaltitude: function (a) {
            if (!this.cloudobject3ds.length) {
                return
            }
            this.cloudobject3ds.forEach((item) => {
                item.position.z = a
            })
        },
        setscaleZ: function (a) {
            if (!this.cloudobject3ds.length) {
                return
            }
            this.cloudobject3ds.forEach((item) => {
                item.scale.z = a
            })
        },
        coordinateToVector3: function (a, b=0) {
            const p = a;
            let transform = new m.Matrix4();
            let transformation = new Array(16);
            transform.fromArray(g.renderCoordinateTransformAt(this.view, [p[0], p[1],b], this.view.spatialReference, transformation));
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
            const pitch = this.view.camera.tilt;
            const bearing = this.view.camera.heading;
            const offset = this.options.offset;
            if (this._offsetAdd) {
                this._offset += offset;
                this.object3d.position[this.positionflag] += offset;
                if (this._offset >= this.offset) {
                    this._offsetAdd = false
                }
            } else {
                this._offset -= offset;
                this.object3d.position[this.positionflag] -= offset;
                if (this._offset <= -this.offset) {
                    this._offsetAdd = true
                }
            }
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            g.requestRender(this.view);
            a.resetWebGLState()
        }
    });
    return n
});;