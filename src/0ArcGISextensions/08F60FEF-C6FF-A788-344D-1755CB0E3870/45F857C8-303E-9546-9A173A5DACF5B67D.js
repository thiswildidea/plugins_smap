;
define(['dojo/_base/declare', "esri/geometry/geometryEngine", "esri/geometry/Extent", "esri/views/3d/externalRenderers", "esri/geometry/Polygon", "esri/geometry/Point", "esri/geometry/support/webMercatorUtils"], function (e, f, g, h, j, l, m) {
    var n = window.THREE;
    var o = e([], {
        constructor: function (a, b, c) {
            this.view = a;
            this.object3ds = [];
            var d = {
                height: 0,
                altitude: 0
            };
            this.options = this.extend({}, d, c, {
                lineStrings: b
            })
        },
        setup: function (b) {
            this.renderer = new n.WebGLRenderer({
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
            this.scene = new n.Scene();
            this.camera = new n.PerspectiveCamera();
            const axesHelper = new n.AxesHelper(1);
            axesHelper.position.copy(1000000, 100000, 100000);
            this.scene.add(axesHelper);
            this._setupScene(b)
        },
        _setupScene: function (a) {
            var b = this;
            const {
                altitude,
                height
            } = b.options;
            var c = new n.LineBasicMaterial({
                linewidth: 10,
                color: b.options.color || 'rgb(13,141,255)',
                opacity: 1,
                transparent: true,
                blending: n.AdditiveBlending
            });
            const offset = Infinity;
            b.options.lineStrings.slice(0, offset).map((d) => {
                const points = b.getArcPoints(d.lineString, d.len);
                const positions = b.getLinePosition(points).positions;
                const geometry = new n.BufferGeometry();
                geometry.addAttribute('position', new n.Float32BufferAttribute(positions, 3));
                const object3d = new n.Line(geometry, c);
                object3d.computeLineDistances();
                b.scene.add(object3d);
                b.object3ds.push(object3d)
            }) 
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
        getLinePosition: function (a, b) {
            const positions = [];
            const positionsV = [];
            if (Array.isArray(a) && a[0] instanceof n.Vector3) {
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
        getArcPoints: function (a, b) {
            const lnglats = [];
            if (Array.isArray(a)) {
                lnglats.push(a[0], a[a.length - 1])
            } else if (a instanceof mapking.LineString) {
                const coordinates = a.getCoordinates();
                lnglats.push(coordinates[0], coordinates[coordinates.length - 1])
            }
            const [first, last] = lnglats;
            let center;
            if (Array.isArray(first)) {
                center = [first[0] / 2 + last[0] / 2, first[1] / 2 + last[1] / 2]
            } else if (first instanceof mapking.Coordinate) {
                center = [first.x / 2 + last.x / 2, first.y / 2 + last.y / 2]
            }
            const v = this.coordinateToVector3(first);
            const v1 = this.coordinateToVector3(last);
            const vh = this.coordinateToVector3(a.getCenter(), b);
            const ellipse = new n.CatmullRomCurve3([v, vh, v1], false, 'catmullrom');
            const points = ellipse.getPoints(40);
            return points
        },
        coordinateToVector3: function (a, b=0) {
            const p = a;
            let transform = new n.Matrix4();
            let transformation = new Array(16);
            transform.fromArray(h.renderCoordinateTransformAt(this.view, [p.x, p.y, b], this.view.spatialReference, transformation));
            let vector3 = new n.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]);
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
            this.camera.lookAt(new n.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            h.requestRender(this.view);
            a.resetWebGLState()
        }
    });
    return o
});;