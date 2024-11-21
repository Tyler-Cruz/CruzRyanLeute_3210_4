import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const { textureLoad } = require('three/webgpu');

/*jshint esversion: 6 */
const Colors = require('./colors.js').Colors;
const Perlin = require('./perlin.js').Perlin;

var width = window.innerWidth;
var height = window.innerHeight;

// Setup the scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
var cameraTarget = {x:0, y:0, z:0};
camera.position.y = 70;
camera.position.z = 1000;
camera.rotation.x = -15 * Math.PI / 180;

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(Colors.SkyColor);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

var stats = new Stats();
stats.showPanel( 0 );
document.body.appendChild( stats.dom );

this.controls = new OrbitControls(this.sceneManager.camera, this.renderer.renderer.domElement);
window.addEventListener('keydown', (event) => this.keydown(event), false);
this.animate();

keydown(event) {
    switch (event.key.toLowerCase()) {
        case "a":
            amera.position.x -= 15
            break;
        case "d":
            camera.position.x += 15
            break;
        case "s":
            camera.position.z += 15;
            break;
        case "w":
            camera.position.z -= 15;
            break;
    }
}


// Setup the terrain
var geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 256, 256 );
var material = new THREE.MeshLambertMaterial({color: Colors.TerrainColor});
var terrain = new THREE.Mesh( geometry, material );
terrain.rotation.x = -Math.PI / 2;
scene.add( terrain );

var perlin = new Perlin();
var peak = 60;
var smoothing = 300;
function refreshVertices() {
    var vertices = terrain.geometry.attributes.position.array;
    for (var i = 0; i <= vertices.length; i += 3) {
        vertices[i+2] = peak * perlin.noise(
            (terrain.position.x + vertices[i])/smoothing, 
            (terrain.position.z + vertices[i+1])/smoothing
        );
    }
    terrain.geometry.attributes.position.needsUpdate = true;
    terrain.geometry.computeVertexNormals();
}

var clock = new THREE.Clock();
var movementSpeed = 60;
var currTime = 0; //time of the cycle
function update() {
    var delta = clock.getDelta();
    //moves sun and mood via delta time
    //sun.position.
    currTime = currTime + delta;
    sun.position.x = currTime;
    sun.position.y = currTime;


    refreshVertices();
}

function render() {
    renderer.render( scene, camera );
}

function loop() {
    stats.begin();
    update();
    render();
    stats.end();
    requestAnimationFrame(loop);
}

loop();