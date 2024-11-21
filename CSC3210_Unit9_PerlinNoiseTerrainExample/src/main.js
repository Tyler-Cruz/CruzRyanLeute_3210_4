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

// Variables to track camera movement
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

// Setup keyboard event listeners
document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        moveForward = true;
    } else if (event.key === 's') {
        moveBackward = true;
    } else if (event.key === 'a') {
        moveLeft = true;
    } else if (event.key === 'd') {
        moveRight = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w') {
        moveForward = false;
    } else if (event.key === 's') {
        moveBackward = false;
    } else if (event.key === 'a') {
        moveLeft = false;
    } else if (event.key === 'd') {
        moveRight = false;
    }
});

// Update camera position based on movement
var movementSpeed = 10;  // Adjust speed as needed
function updateCameraPosition(delta) {
    if (moveForward) {
        camera.position.z -= movementSpeed * delta;
    }
    if (moveBackward) {
        camera.position.z += movementSpeed * delta;
    }
    if (moveLeft) {
        camera.position.x -= movementSpeed * delta;
    }
    if (moveRight) {
        camera.position.x += movementSpeed * delta;
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
    updateCameraPosition(delta);
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