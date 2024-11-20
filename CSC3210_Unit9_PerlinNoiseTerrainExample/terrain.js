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
sun.position.set(100, 1000, 100);

sun.castShadow = true;

// sun.shadow.mapSize.width = 1024;
// sun.shadow.mapSize.height = 1024;

// sun.shadow.camera.near = 500;
// sun.shadow.camera.far = 4000;
// sun.shadow.camera.fov = 30;
scene.add(sun);

//creating the moon
const moon = new THREE.SpotLight(0xF6F1D5);
moon.position.set(-50,-50,-50);

moon.castShadow = true;

// moon.shadow.mapSize.width = 1024;
// moon.shadow.mapSize.height = 1024;

// moon.shadow.camera.near = 500;
// moon.shadow.camera.far = 4000;
// moon.shadow.camera.fov = 30;

scene.add(moon);


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

addTreesToTerrain(1000);

// Setup the terrain
var geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 256, 256 );
var material = new THREE.MeshLambertMaterial({color: Colors.TerrainColor});
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

var clock = new THREE.Clock();
var movementSpeed = 60;
function update() {
    var delta = clock.getDelta();
    terrain.position.z += movementSpeed * delta;
    camera.position.z += movementSpeed * delta;
    refreshVertices();

    updateTrees(delta);
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
