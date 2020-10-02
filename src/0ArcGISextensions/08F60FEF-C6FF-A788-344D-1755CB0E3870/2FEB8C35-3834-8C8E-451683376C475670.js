;
define(['dojo/_base/declare', "esri/geometry/geometryEngine", "esri/geometry/Extent", "esri/views/3d/externalRenderers", "esri/geometry/Polygon", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils"], function (d, e, f, g, h, j, l) {
    var m = window.THREE;
    var n = d([], {
        constructor: function (a, b, c) {
            this.view = a;
            const OPTIONS = {
                altitude: 0,
                speed: 0.1
            }
            this.options = this.extend({}, OPTIONS, c, {
                lineString: b
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
            let texture = new m.TextureLoader().load(b.options.textureURL);
            texture.anisotropy = 16;
            texture.wrapS = m.RepeatWrapping;
            texture.wrapT = m.RepeatWrapping;
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
            b.options.clock = new m.Clock();
            const {
                positions
            } = b.getLinePosition(b.options.lineString);
            const positions1 = b._getLinePosition(b.options.lineString).positions;
            const geometry = new m.Geometry();
            for (let i = 0; i < positions.length; i += 3) {
                geometry.vertices.push(new m.Vector3(positions[i], positions[i + 1], positions[i + 2]))
            }
            const meshLine = new MeshLine();
            meshLine.setGeometry(geometry);
            material.uniforms.resolution.value.set(b.view.size[0], b.view.size[1]);
            b.object3d = new m.Mesh(meshLine.geometry, material);
            b.scene.add(b.object3d);
            const {
                altitude
            } = b.options;
            const center = b.options.lineString.getCenter();
            const v = b.coordinateToVector3(center, 0);
            b.object3d.position.copy(v);
            a.resetWebGLState()
        },
        getLinePosition: function (a, b) {
            const positions = [];
            const positionsV = [];
            if (Array.isArray(a) && a[0] instanceof m.Vector3) {
                for (let i = 0, len = a.length; i < len; i++) {
                    const v = a[i];
                    positions.push(v.x, v.y, v.z);
                    positionsV.push(v)
                }
            } else {
                if (Array.isArray(a)) a = new mapking.LineString(a);
                if (!a || !(a instanceof mapking.LineString)) return;
                const z = 0;
                const coordinates = a.getCoordinates();
                const centerPt = this.coordinateToVector3(b || a.getCenter());
                for (let i = 0, len = coordinates.length; i < len; i++) {
                    let coordinate = coordinates[i];
                    if (Array.isArray(coordinate)) {
                        coordinate = new mapking.Coordinate(coordinate)
                    }
                    const v = this.coordinateToVector3(coordinate, z).sub(centerPt);
                    positions.push(v.x, v.y, v.z);
                    positionsV.push(v)
                }
            }
            return {
                positions: positions,
                positionsV: positionsV
            }
        },
        _getLinePosition: function (a, b) {
            const positions = [];
            const positionsV = [];
            if (Array.isArray(a) && a[0] instanceof m.Vector3) {
                for (let i = 0, len = a.length; i < len; i++) {
                    const v = a[i];
                    positions.push(v.x, v.y, v.z);
                    positionsV.push(v)
                }
            } else {
                if (Array.isArray(a)) a = new mapking.LineString(a);
                if (!a || !(a instanceof mapking.LineString)) return;
                const z = 0;
                const coordinates = a.getCoordinates();
                for (let i = 0, len = coordinates.length; i < len; i++) {
                    let coordinate = coordinates[i];
                    if (Array.isArray(coordinate)) coordinate = new mapking.Coordinate(coordinate);
                    const v = this.coordinateToVector3(coordinate, z);
                    positions.push(v.x, v.y, v.z);
                    positionsV.push(v)
                }
            }
            return {
                positions: positions,
                positionsV: positionsV
            }
        },
        coordinateToVector3: function (a, b=0) {
            const p = a;
            let transform = new m.Matrix4();
            let transformation = new Array(16);
            transform.fromArray(g.renderCoordinateTransformAt(this.view, [p.x, p.y, b], this.view.spatialReference, transformation));
            let vector3 = new m.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]);
            console.log(vector3) 
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
            this.options.offset.x -= this.options.speed * this.options.clock.getDelta();
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            g.requestRender(this.view);
            a.resetWebGLState()
        }
    });
    return n
});;