(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint esversion: 6 */
const Palette = {
    Pink: 0xe64386,
    SkyBlue: 0x87CEEB,
    Orange: 0xFF9913,
    CetaceanBlue: 0x070b34
};

const Colors = {
    DayColor: Palette.LightBlue,
    DawnColor: Palette.Orange,
    DuskColor: Palette.Pink,
    NightColor: Palette.CetaceanBlue
};


exports.Colors = Colors;
},{}],2:[function(require,module,exports){
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
renderer.setClearColor(Colors.DayColor);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

var stats = new Stats();
stats.showPanel( 0 );
document.body.appendChild( stats.dom );

// var light = new THREE.DirectionalLight(Colors.LightColor, 1.3);
// light.position.set(camera.position.x, camera.position.y+500, camera.position.z+500).normalize();
// scene.add(light);

const sun = new THREE.SpotLight(0xFDB813);
sun.position.set(10, 450, 50);

sun.castShadow = true;

sun.shadow.mapSize.width = 1024;
sun.shadow.mapSize.height = 1024;

sun.shadow.camera.near = 500;
sun.shadow.camera.far = 4000;
sun.shadow.camera.fov = 30;
scene.add(sun);

const sHelper = new THREE.SpotLightHelper(sun);
scene.add(sHelper);

//creating the moon
const moon = new THREE.SpotLight(0xF6F1D5);
moon.position.set(-50,-50,-50);

moon.castShadow = true;

moon.shadow.mapSize.width = 1024;
moon.shadow.mapSize.height = 1024;

moon.shadow.camera.near = 500;
moon.shadow.camera.far = 4000;
moon.shadow.camera.fov = 30;

scene.add(moon);

const mHelper = new THREE.SpotLightHelper(moon);
scene.add(mHelper);

var flashlight = new THREE.SpotLight(0xFFFFFF, 2, 1000, Math.PI / 4, 1, 2);
flashlight.position.set(0, 50, 0); 
flashlight.target = new THREE.Object3D(); 
scene.add(flashlight);
flashlight.castShadow = true;


flashlight.shadow.mapSize.width = 1024;
flashlight.shadow.mapSize.height = 1024;
flashlight.shadow.camera.near = 500;
flashlight.shadow.camera.far = 4000;
flashlight.shadow.camera.fov = 30;


// creates a tree out of trunk and leaves, merges shapes together into one object
function createTree() {
    const trunkGeometry = new THREE.CylinderGeometry(1, 1, 8, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    const leavesGeometry = new THREE.ConeGeometry(4, 10, 8);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 7; // Position leaves above the trunk

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);

    tree.isTree = true; // Mark this as a tree for identification
    return tree;
}

// adds the trees to the terrain
function addTreesToTerrain(count) {
    const trees = [];
    for (let i = 0; i < count; i++) {
        const tree = createTree();

        // Randomly place the tree within the terrain bounds
        const x = (Math.random() - 0.5) * 2000; // Width of the terrain
        const z = (Math.random() - 0.5) * 2000; // Depth of the terrain

        // Use Perlin noise to adjust the tree's y-position to match the terrain
        const perlin = new Perlin();
        const smoothing = 300;
        const peak = 60;
        const y = peak * perlin.noise(x / smoothing, z / smoothing);


        tree.position.set(x, y, z);
        trees.push(tree);
        scene.add(tree);
    }
    return trees;
}
// updating position of trees as terrain moves
function updateTrees(delta) {
    scene.children.forEach((child) => {
        if (child.isTree) {
            child.position.z += movementSpeed * delta;

            // Reset tree position if it moves out of view
            if (child.position.z > camera.position.z + 1000) {
                child.position.z -= 2000; // Wrap around
            }
        }
    });
}

addTreesToTerrain(800);

function createTree2() {
    const trunkHeight = Math.random() * 10 + 5;  
    const trunkRadius = Math.random() * 0.5 + 0.5; 
    const branchCount = Math.floor(Math.random() * 4 + 2);  
    const branchAngle = Math.random() * 20 + 15;  

    // Create the trunk
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);


    // tree object
    const tree = new THREE.Group();
    tree.add(trunk);

    // Add branches
    for (let i = 0; i < branchCount; i++) {
        const branchLength = Math.random() * 10 + 10;  
        const branchAngleOffset = (Math.random() - 0.5) * branchAngle;
        
        // Create a branch geometry
        const branchGeometry = new THREE.CylinderGeometry(0.2, 0.5, branchLength, 6);
        const branchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const branch = new THREE.Mesh(branchGeometry, branchMaterial);

        // Randomize branch positioning and rotation
        branch.position.set(Math.random() * 2 - 1, trunkHeight * 0.75, Math.random() * 2 - 1);
        branch.rotation.set(branchAngleOffset, branchAngleOffset, 0);

        // Add branches to tree
        tree.add(branch);
    }

    tree.isTree = true; 
    return tree;
}

function addTrees2(count) {
    const trees = [];
    for (let i = 0; i < count; i++) {
        const tree = createTree2();

        // Randomly place the tree within the terrain bounds
        const x = (Math.random() - 0.5) * 2000; // Width of the terrain
        const z = (Math.random() - 0.5) * 2000; // Depth of the terrain

        // Use Perlin noise to adjust the tree's y-position to match the terrain surface
        const perlin = new Perlin();
        const smoothing = 300;
        const peak = 60;
        const y = peak * perlin.noise(x / smoothing, z / smoothing);

        tree.position.set(x, y, z);
        trees.push(tree);
        scene.add(tree);
    }
    return trees;
}

// Add stochastic trees to the terrain
addTrees2(1000);  

function createTree3() {
    const trunkHeight = Math.random() * 10 + 5;  
    const trunkRadius = Math.random() * 0.5 + 0.5; 
    const leafSize = Math.random() * 2 + 4;  
    const branchCount = Math.floor(Math.random() * 4 + 2);  
    const branchAngle = Math.random() * 20 + 15;  
    const leafColor = Math.random() * 0xFFFFFF;

    // Create the trunk
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    
    const leavesGeometry = new THREE.SphereGeometry(leafSize, leafSize * 2, 8);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: leafColor });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = trunkHeight * 0.75; 

    // Combine trunk and leaves into a tree object
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);


    tree.isTree = true; 
    return tree;
}

function addTrees3(count) {
    const trees = [];
    for (let i = 0; i < count; i++) {
        const tree = createTree3();

        // Randomly place the tree within the terrain bounds
        const x = (Math.random() - 0.5) * 2000; // Width of the terrain
        const z = (Math.random() - 0.5) * 2000; // Depth of the terrain

        // Use Perlin noise to adjust the tree's y-position to match the terrain surface
        const perlin = new Perlin();
        const smoothing = 300;
        const peak = 60;
        const y = peak * perlin.noise(x / smoothing, z / smoothing);

        tree.position.set(x, y, z);
        trees.push(tree);
        scene.add(tree);
    }
    return trees;
}

// Add stochastic trees to the terrain
addTrees3(1000);  

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('grass.jpg');

// Setup the terrain
var geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 256, 256 );
var material = new THREE.MeshBasicMaterial({ map: texture });
var terrain = new THREE.Mesh( geometry, material );
terrain.rotation.x = -Math.PI / 2;
scene.add( terrain );

var perlin = new Perlin();
var peak = 20;
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

// Variables to track camera movement
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var flashlightOn = false;

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
    else if (event.key === 'f' || event.key === 'F') {
        flashlightOn = !flashlightOn;
        flashlight.visible = flashlightOn; 
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


// Variables to track mouse position
let mouseX = 0;
let mouseY = 0;

// Sensitivity of the camera movement
const sensitivity = 0.05;

// Event listener for mouse movement
document.addEventListener('mousemove', (event) => {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    // Normalize mouse position to a range of -1 to 1
    mouseX = (event.clientX - halfWidth) / halfWidth;
    mouseY = (event.clientY - halfHeight) / halfHeight;
});

// Update camera rotation based on mouse movement
function updateCameraRotation() {
    camera.rotation.y = mouseX * Math.PI * sensitivity; // Horizontal rotation
    camera.rotation.x = -mouseY * Math.PI * sensitivity; // Vertical rotation
}

var bobbing = false;  
var bobbingAmplitude = 2; 
var bobbingFrequency = 10; 
var bobbingTimer = 0;  

// Update camera position and bobbing effect
function updateCameraPosition(delta) {
    if (moveForward || moveBackward || moveLeft || moveRight) {
        bobbing = true;
        bobbingTimer += delta * bobbingFrequency;

        var bobbingY = Math.sin(bobbingTimer) * bobbingAmplitude;
        camera.position.y = 70 + bobbingY; 
    } else {
        bobbing = false;
    }

    // Handle forward/backward 
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

function updateFlashlight() {
    flashlight.position.set(camera.position.x, camera.position.y + 50, camera.position.z); // Position flashlight relative to camera
    flashlight.target.position.set(camera.position.x, camera.position.y, camera.position.z); // Spotlight's target also follows the camera
}

// central dot 
const dot = document.createElement('div');
dot.style.position = 'absolute';
dot.style.width = '8px';
dot.style.height = '8px';
dot.style.backgroundColor = 'white';
dot.style.borderRadius = '50%';
dot.style.left = '50%';
dot.style.top = '50%';
dot.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(dot);

var clock = new THREE.Clock();
var movementSpeed = 60;

let timeOfDay = 0; // 0 to 1, where 0 is night and 1 is day

function updateSkyColor() {
    timeOfDay = (sun.position.x + 500) / 1000; 

    timeOfDay = Math.min(Math.max(timeOfDay, 0), 1);

    let skyColor;

    if (timeOfDay < 0.25) { 
        skyColor = new THREE.Color(Colors.DawnColor);
    } else if (timeOfDay < 0.75) { 
        skyColor = new THREE.Color(Colors.DayColor);
    } else if (timeOfDay < 1) {
        skyColor = new THREE.Color(Colors.DuskColor);
    } else { // Night
        skyColor = new THREE.Color(Colors.NightColor);
    }

    // set the sky color based on the time of day
    renderer.setClearColor(skyColor);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function update() {
    var delta = clock.getDelta();
    refreshVertices();

    //handles sun cycle
    sun.position.x += delta * -10;
    if(sun.position.x <= -500){
        sun.position.y += delta * -10;
        moon.position.x = 1000;
        moon.position.y = 450;
     
    }

    //changes the sun color during the cycle (freezes everything when uncommented)
    // if(sun.position.x = -500 || sun.position.x = 400){
    //     sun.Colors = Pink;
    // }else{
    //     sun.Colors = Orange;
    // }

    //handles moon cycle
    moon.position.x += delta * -10;
    if(moon.position.x <= -510){
        moon.position.y += delta * -10;
        sun.position.x = 1000;
        sun.position.y = 450;
    }

    updateSkyColor();


    //updateTrees(delta);
    updateCameraPosition(delta);
    updateFlashlight();
    updateCameraRotation();
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
},{"./colors.js":1,"./perlin.js":3}],3:[function(require,module,exports){
/*jshint esversion: 6 */
//credit: https://gist.github.com/banksean/304522#file-perlin-noise-simplex-js

class Perlin {
    constructor() {
        this.grad3 =    
            [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
        this.p = [];
        for (var i=0; i<256; i++) {
            this.p[i] = Math.floor(Math.random()*256);
        }
        
        // To remove the need for index wrapping, double the permutation table length 
        this.perm = []; 
        for(i=0; i<512; i++) {
            this.perm[i]=this.p[i & 255];
        } 

        // A lookup table to traverse the simplex around a given point in 4D. 
        // Details can be found where this table is used, in the 4D noise method. 
        this.simplex = [ 
            [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
            [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
            [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
            [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
            [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
            [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
            [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
            [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
    }

    dot(g, x, y) { 
        return g[0]*x + g[1]*y;
    }

    noise(xin, yin) { 
        var n0, n1, n2; // Noise contributions from the three corners 
        // Skew the input space to determine which simplex cell we're in 
        var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
        var s = (xin+yin)*F2; // Hairy factor for 2D 
        var i = Math.floor(xin+s); 
        var j = Math.floor(yin+s); 
        var G2 = (3.0-Math.sqrt(3.0))/6.0; 
        var t = (i+j)*G2; 
        var X0 = i-t; // Unskew the cell origin back to (x,y) space 
        var Y0 = j-t; 
        var x0 = xin-X0; // The x,y distances from the cell origin 
        var y0 = yin-Y0; 
        // For the 2D case, the simplex shape is an equilateral triangle. 
        // Determine which simplex we are in. 
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
        if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
        else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
        // c = (3-sqrt(3))/6 
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
        var y1 = y0 - j1 + G2; 
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
        var y2 = y0 - 1.0 + 2.0 * G2; 
        // Work out the hashed gradient indices of the three simplex corners 
        var ii = i & 255; 
        var jj = j & 255; 
        var gi0 = this.perm[ii+this.perm[jj]] % 12; 
        var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
        var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
        // Calculate the contribution from the three corners 
        var t0 = 0.5 - x0*x0-y0*y0; 
        if(t0<0) n0 = 0.0; 
        else { 
            t0 *= t0; 
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
        } 
        var t1 = 0.5 - x1*x1-y1*y1; 
        if(t1<0) n1 = 0.0; 
        else { 
            t1 *= t1; 
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
        }
        var t2 = 0.5 - x2*x2-y2*y2; 
        if(t2<0) n2 = 0.0; 
        else { 
            t2 *= t2; 
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
        } 
        // Add contributions from each corner to get the final noise value. 
        // The result is scaled to return values in the interval [-1,1]. 
        return 70.0 * (n0 + n1 + n2); 
    }
}

exports.Perlin = Perlin;
},{}]},{},[2]);
