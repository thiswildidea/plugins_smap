/*    
    Copyright 2016 Esri

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

define([
    'esri/Camera',
    'dojo/_base/declare',
    'esri/views/3d/externalRenderers',
    "esri/geometry/support/webMercatorUtils"
], function (
    Camera,
    declare,
    externalRenderers,
    webMercatorUtils
) {
    // Enforce strict mode
    'use strict';

    // Constants
    var THREE = window.THREE;
    var RADIUS = 6378137;
    var CORE = 1216000;

    return declare([], {
        constructor: function (view, center, radius, height, textureurl) {
            this.view = view;
            this.center = center;
            this.radius = radius;
            this.textureurl = textureurl;
            this.height = height;
        },
        setup: function (context) {
            // Create the THREE.js webgl renderer
            this.renderer = new THREE.WebGLRenderer({
                context: context.gl,
                premultipliedAlpha: false,
            });

            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setViewport(0, 0, this.view.width, this.view.height);

            // Make sure it does not clear anything before rendering
            this.renderer.autoClear = false;
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearColor = false;
            this.renderer.autoClearStencil = false;

            var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (target) {
                originalSetRenderTarget(target);
                if (target == null) {
                    context.bindRenderTarget();
                }
            };
            //
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera();

            

            // Create lights that will resemble the sun light lighting that we do internally
            this._createLights();

            // Create objects and add them to the scene
            this._createObjects();

            // Set starting geometries
            this._updateObjects();
        },
        render: function (context) {
            // Make sure to reset the internal THREE.js state
            this.renderer.resetGLState();

            // Update the THREE.js camera so it's synchronized to our camera
            this._updateCamera(context);

            // Update the THREE.js lights so it's synchronized to our light
            this._updateLights(context);

            // Advance current geometry
            this._updateObjects(context);

            // Render the scene
            this.renderer.render(this.scene, this.camera);
        },
        dispose: function (content) { },
        _createLights: function () {
            // Add ambient light
            this.scene.add(new THREE.AmbientLight(0x404040, 1));

            // Add directional light
            var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(1, 0, 0);
            this.scene.add(directionalLight);
        },
        _createObjects: function () {
            var scope = this;
            // Aurora - material
            var m3 = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                map: new THREE.TextureLoader().load(scope.textureurl)
            });
            var height = scope.height;
            var g3 = new THREE.ConeBufferGeometry(
                scope.radius,  // radius
                height,      // height
                100,         // radius segments
                1,           // height segments
                true         // open ended
            );
            g3.translate(this.center[1], 0, this.center[0]); 
            g3.rotateZ(Math.PI / 2);  // Move to 0�,0�
            g3.rotateY(-Math.PI / 2)
        

            const point = webMercatorUtils.xyToLngLat(scope.center[0], scope.center[1])
            // var north1 = g3.clone();
            // north1.rotateY(point[0] * Math.PI / -90); 
            // north1.rotateZ(-point[1] * Math.PI / -90);
            this.scene.add(new THREE.Mesh(g3, m3));
        },
        _updateCamera: function (context) {
            // Get Esri's camera
            var c = context.camera;

            // Update three.js camera
            this.camera.projectionMatrix.fromArray(c.projectionMatrix);
            this.camera.position.set(c.eye[0], c.eye[1], c.eye[2]);
            this.camera.up.set(c.up[0], c.up[1], c.up[2]);
            this.camera.lookAt(new THREE.Vector3(c.center[0], c.center[1], c.center[2]));
        },
        _updateLights: function (context) { },
        _updateObjects: function (context) { }
    });
});