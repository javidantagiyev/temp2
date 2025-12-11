/*
CSCI 2408 Computer Graphics Fall 2025
(c)2025 by Name Surname
Submitted in partial fulfillment of the requirements of the course.
*/

// Inits
var canvas;
var gl;
window.onload = init;
window.onkeydown = keyContols;

var mousex;
var mousey;

// Program flow
var delay = 0;

// Time
var deltaTime = 0;
var crntFrameTime = 0;
var prevFrameTime = 0;

// Shaders
var program;
var skyboxProgram;

// Texturing
var cubemap;
var textureLocation;
var useTextureLocation;

var posAttribLocation;
var colorAttribLocation;
var textureAttribLocation;
var normalAttribLocation;
// Transformation
var ctmMatrixLocation;
// Dont touch it. It is for lighting
var worldNormalMatrixLocation;


// Game
var player;
var enemies = [];
var playerTexture;
var enemyTexture;
var gameLoopHandle;

function init() {
    // Get reference to the context of the canvas
    canvas = document.getElementById("gl-canvas");
    // Mouse cursor lock (for 3d movement)
    // For Firefox
    canvas.onclick = () => {
        canvas.requestPointerLock(true);
    }

    // For Chromium based browsers
    canvas.addEventListener("click", async () => {

        // Must run inside the click handler
        const { state } = await navigator.permissions.query({ name: "pointer-lock" });

        if (state === "granted" || state === "prompt") {
            // Request pointer lock NOW (direct user gesture)
            canvas.requestPointerLock({ unadjustedMovement: true });
        } else {
            console.log("Pointer Lock denied.");
        }
    });

    // Listens mouse movement event
    canvas.addEventListener("mousemove", function(e){
        mouseControls(e);
    }, false);

    canvas.addEventListener("wheel", function(e){
        mouseWheelControls(e);
    }, false);

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    initGL();
    ctmMatrixLocation = gl.getUniformLocation(program, "uCTM");
    textureLocation = gl.getUniformLocation(program, "uTexture");
    useTextureLocation = gl.getUniformLocation(program, "uUseTexture");
    initLighting();

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    playerTexture = loadTexture(gl, "textures/player.png");
    enemyTexture = loadTexture(gl, "textures/enemy.png");

    const playerModel = new Model([0.0, 0.0, 5.0], generateSphereVertices(0.5, 10), 0.5);
    playerModel.texture = playerTexture;
    player = new Player([0.0, 0.0, 5.0], playerModel);
    player.camera.updateView();

    spawnEnemies(12);

    gameLoopHandle = window.setInterval(game, delay);
}

// Our gameplay will be here
function game(){
    // Delta
    crntFrameTime = new Date().getTime() / 1000;
    deltaTime = (crntFrameTime - prevFrameTime);
    prevFrameTime = crntFrameTime;

    handleCollisions();
    render();
}

// Rendering function. IT IS NOT THE GAME LOOP
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    player.camera.updateView();
    renderSkybox(cubemap, player.camera);

    gl.useProgram(program);

    enemies.forEach(enemy => enemy.model.update());
    player.model.update();

    enemies.forEach(enemy => draw(enemy.model, player.camera));
    draw(player.model, player.camera);
}


// Initializing some OpenGL parameters
function initGL(){
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    skyboxProgram = initShaders(gl, "skybox-vertex-shader", "skybox-fragment-shader");
    initSkyboxProgram();
    initSkybox(skyboxVertices);
    cubemap = loadCubemap(gl);

    // Just backface-culling, hidden surface removal and e.g.
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
}

function spawnEnemies(count){
    enemies = [];
    for(let i = 0; i < count; i++){
        const radius = randomRange(0.2, 2.0);
        const position = randomPosition(radius + 5.0);
        const enemy = new Enemy(position, radius, enemyTexture);
        enemies.push(enemy);
    }
}

function randomPosition(minDistance){
    let pos;
    do{
        pos = [randomRange(-30, 30), randomRange(-10, 10), randomRange(-30, 30)];
    } while(distance(pos, player.position) < minDistance);
    return pos;
}

function randomRange(min, max){
    return Math.random() * (max - min) + min;
}

function distance(a, b){
    return Math.sqrt(Math.pow(a[0]-b[0],2) + Math.pow(a[1]-b[1],2) + Math.pow(a[2]-b[2],2));
}

function handleCollisions(){
    enemies.forEach(enemy => {
        const dist = distance(enemy.model.position, player.position);
        if(dist <= enemy.radius + player.radius){
            if(player.mass >= enemy.mass){
                player.grow(enemy.mass);
                respawnEnemy(enemy);
            } else {
                clearInterval(gameLoopHandle);
                alert("Game Over! The enemy was too big to absorb.");
            }
        }
    });
}

function respawnEnemy(enemy){
    const newRadius = randomRange(0.2, 2.0);
    const newPosition = randomPosition(newRadius + player.radius + 2.0);
    enemy.baseRadius = newRadius;
    enemy.mass = Math.pow(newRadius, 3);
    enemy.model = new Model(newPosition, generateSphereVertices(newRadius, 10), newRadius);
    enemy.model.texture = enemyTexture;
    enemy.model.setPosition(newPosition[0], newPosition[1], newPosition[2]);
}
