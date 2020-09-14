
define(['dojo/_base/declare', 'esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/views/3d/externalRenderers', 'esri/geometry/support/webMercatorUtils', ], function (d, e, f, g, h) {
    'use strict';
    var j = window.THREERenderer;
    var k = d(null, {
        constructor: function (a) {
            this.view = a.view, this.points = a.points,this.texturestart = a.texturestart, this.texturestarend = a.texturestarend, this.height = a.height, this.offset = a.offset, this.renderer = null, this.camera = null, this.scene = null
        },
        setup: function (b) {
            this.renderer = new j.WebGLRenderer({
                context: b.gl,
                premultipliedAlpha: false,
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setViewport(0, 0, this.view.width, this.view.height);
            this.renderer.autoClear = false;
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearColor = false;
            var c = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (a) {
                c(a);
                if (a == null) {
                    b.bindRenderTarget()
                }
            };
            this.scene = new j.Scene();
            this.camera = new j.PerspectiveCamera();
            const axesHelper = new j.AxesHelper(10000000);
            this.scene.add(axesHelper);
            let transform = new j.Matrix4();
            let transformation = new Array(16);
            let vector3List = [];
            let faceList = [];
            let faceVertexUvs = [];
            this.points.forEach((point) => {
                const z = point[2] === undefined ? 0 : point[2] 
                transform.fromArray(g.renderCoordinateTransformAt(this.view, [point[0], point[1], z], this.view.spatialReference, transformation));
                vector3List.push(new j.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]));
                transform.fromArray(g.renderCoordinateTransformAt(this.view, [point[0], point[1], this.height], this.view.spatialReference, transformation));
                vector3List.push(new j.Vector3(transform.elements[12], transform.elements[13], transform.elements[14]))
            });
            const t0 = new j.Vector2(0, 0);
            const t1 = new j.Vector2(1, 0);
            const t2 = new j.Vector2(1, 1);
            const t3 = new j.Vector2(0, 1);
            for (let i = 0; i < vector3List.length - 2; i++) {
                if (i % 2 === 0) {
                    faceList.push(new j.Face3(i, i + 2, i + 1));
                    faceVertexUvs.push([t0, t1, t3])
                } else {
                    faceList.push(new j.Face3(i, i + 1, i + 2));
                    faceVertexUvs.push([t3, t1, t2])
                }
            }
            const geometry = new j.Geometry();
            geometry.vertices = vector3List;
            geometry.faces = faceList;
            geometry.faceVertexUvs[0] = faceVertexUvs;
            const geometry2 = geometry.clone();
            this.alphaMap = new j.TextureLoader().load(this.texturestart);
            this.texture = new j.TextureLoader().load(this.texturestarend);
            this.texture.wrapS = j.RepeatWrapping;
            this.texture.wrapT = j.RepeatWrapping;
            this.texture.offset.set(0, 0.5);
            const material = new j.MeshBasicMaterial({
                color: 0x00FFFF,
                side: j.DoubleSide,
                transparent: true,
                depthWrite: false,
                alphaMap: this.alphaMap,
            });
            const mesh = new j.Mesh(geometry, material);
            const material2 = new j.MeshBasicMaterial({
                side: j.DoubleSide,
                transparent: true,
                depthWrite: false,
                map: this.texture,
            });
            const mesh2 = new j.Mesh(geometry2, material2);
            this.scene.add(mesh);
            this.scene.add(mesh2);
            b.resetWebGLState()
        },
        render: function (a) {
            const cam = a.camera;
            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(new j.Vector3(cam.center[0], cam.center[1], cam.center[2]));
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
            if (this.offset <= 0) {
                this.offset = 1
            } else {
                this.offset -= 0.01
            }
            if (this.texture) {
                this.texture.offset.set(0, this.offset)
            }
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            g.requestRender(this.view);
            a.resetWebGLState()
        },
        dispose: function (a) {}
    });
    return k
});;