define(["dojo/_base/declare","esri/geometry/Point","esri/geometry/SpatialReference","esri/views/3d/externalRenderers","esri/geometry/support/webMercatorUtils"],function(e,t,i,r,n){"use strict"
function s(e){return e.replace("#","0x")}var a=window.THREE
return e([],{constructor:function(e,t,i,r,n,s,a,o,h){this.view=e,this.tracks=t,this.index=0,this.max=0,this.linesegment=void 0===o?60:o,this.linesegmentfade=void 0===h?10:h,this.REST=void 0===a?75:a,this.width=void 0===i?15:i,this.color=void 0===r?"#00FF00":r,this.opacity=void 0===n?0:n,this.dashArray=void 0===s?0:s,this.meshLines=[],this.refresh=Date.now()},setup:function(e){this.renderer=new a.WebGLRenderer({context:e.gl,premultipliedAlpha:!1}),this.renderer.setPixelRatio(window.devicePixelRatio),this.renderer.setViewport(0,0,this.view.width,this.view.height),this.renderer.autoClear=!1,this.renderer.autoClearDepth=!1,this.renderer.autoClearColor=!1,this.renderer.autoClearStencil=!1
var t=this.renderer.setRenderTarget.bind(this.renderer)
this.renderer.setRenderTarget=function(i){t(i),null==i&&e.bindRenderTarget()},this.scene=new a.Scene,this.camera=new a.PerspectiveCamera,this._createLights(),this._createObjects(),this._updateObjects(),e.resetWebGLState()},render:function(e){this.renderer.resetGLState(),this._updateCamera(e),this._updateLights(e),this._updateObjects(e),this.renderer.render(this.scene,this.camera),r.requestRender(this.view),e.resetWebGLState()},dispose:function(e){},_createObjects:function(){var e=this,o=new a.Matrix4
e.tracks.forEach(function(h){var c=new a.CatmullRomCurve3(h.map(function(e){const t=n.xyToLngLat(e[0],e[1]),i=void 0===e[2]?.1:e[2]
return new a.Vector3(t[0],t[1],i)})),d=c.getSpacedPoints(e.linesegment),l=d.map(function(s){const h=n.geographicToWebMercator(new t({x:s.x,y:s.y,z:s.z}))
return o.fromArray(r.renderCoordinateTransformAt(e.view,[h.x,h.y,h.z],i.WebMercator,Array(16))),new a.Vector3(o.elements[12],o.elements[13],o.elements[14])})
e.max=Math.max(e.max,l.length)
for(var u=Math.floor(Math.random()*(l.length-1)),m=+s(e.color),f=new a.Vector2(window.innerWidth,window.innerHeight),w=0;w<l.length-1;w++){var p=new a.Geometry
p.vertices=[l[w],l[w+1]]
var v=new MeshLine
v.setGeometry(p)
var g=new window.THREE.Mesh(v.geometry,new MeshLineMaterial({useMap:!1,color:new a.Color(m),opacity:e.opacity,transparent:!0,dashArray:e.dashArray,resolution:f,sizeAttenuation:!1,lineWidth:e.width,near:e.camera.near,far:e.camera.far}))
g.visible=!1,g.flag=w,g.offset=u,e.scene.add(g),e.meshLines.push(g)}}),this.tracks=null},_createLights:function(){this.ambient=new a.AmbientLight(16777215,.5),this.scene.add(this.ambient),this.sun=new a.DirectionalLight(16777215,.5),this.scene.add(this.sun)},_updateCamera:function(e){var t=e.camera
this.camera.position.set(t.eye[0],t.eye[1],t.eye[2]),this.camera.up.set(t.up[0],t.up[1],t.up[2]),this.camera.lookAt(new a.Vector3(t.center[0],t.center[1],t.center[2])),this.camera.projectionMatrix.fromArray(t.projectionMatrix)},_updateLights:function(e){var t=e.sunLight
this.sun.position.set(t.direction[0],t.direction[1],t.direction[2]),this.sun.intensity=t.diffuse.intensity,this.sun.color=new a.Color(t.diffuse.color[0],t.diffuse.color[1],t.diffuse.color[2]),this.ambient.intensity=t.ambient.intensity,this.ambient.color=new a.Color(t.ambient.color[0],t.ambient.color[1],t.ambient.color[2])},_updateObjects:function(e){var t=this,i=Date.now()
i-this.refresh<t.REST||(this.refresh=i,this.meshLines.forEach(function(e){var i=t.index+e.offset
if(i>t.max&&(i-=t.max),e.flag-i>=0&&e.flag-i<=t.linesegmentfade){var r=1
switch(i){case 0:r=.1
break
case 1:r=.2
break
case 2:r=.5}e.material.opacity=r*(e.flag-i)/10,e.visible=!0}else e.visible=!1,e.material.opacity=0}),this.index++,this.index>=this.max&&(this.index=0))}})})
