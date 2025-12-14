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

// Texturing
var skybox;
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
var enemyBigTexture;
var enemySmallTexture;
var gameLoopHandle;
var lightSource;

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
    canvas.addEventListener("mousemove", function (e) {
        mouseControls(e);
    }, false);

    canvas.addEventListener("wheel", function (e) {
        mouseWheelControls(e);
    }, false);

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Objects
    initGL();

    baseSphereVertices = generateSphereVertices(0.5, 10);

    playerTexture = loadTexture(gl, "textures/player2.png");
    enemyBigTexture = loadTexture(gl, "textures/enemybig.png");
    enemySmallTexture = loadTexture(gl, "textures/enemysmall.png");
    skyboxTexture = loadTexture(gl, "textures/galaxy2.png"); //NOT WORKING PROPERLY


    player = new Player([0.0, 0.0, 5.0], structuredClone(baseSphereVertices), 0.5, playerTexture, 10);
    spawnEnemies(12);

    skybox = new Skybox([
        player.camera.distantPosition[0],
        player.camera.distantPosition[1],
        player.camera.distantPosition[2]
    ], structuredClone(baseSphereVertices), 1.0);
    // Keep the skybox large enough that it always surrounds the player camera
    // without clipping against the near/far planes.
    skybox.scaleFactor = player.camera.far * 0.5;
    skybox.texture = skyboxTexture;

    lightSource = new LightSource([100, 100, 0], [0.5, 0.5, 0.0]);

    gameLoopHandle = window.setInterval(game, delay);
}

// Our gameplay will be here
function game() {
    // Delta
    crntFrameTime = new Date().getTime() / 1000;
    deltaTime = (crntFrameTime - prevFrameTime);
    prevFrameTime = crntFrameTime;

    var npos = rotatePointZ(lightSource.position[0], lightSource.position[1], 0, 0, 0.3);
    lightSource.position[0] = npos[0];
    lightSource.position[1] = npos[1];

    player.update(deltaTime);
    player.resolveSkyboxCollision(skybox);
    handleCollisions();
    render();
}

// Rendering function. IT IS NOT THE GAME LOOP
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    player.camera.updateView();
    gl.useProgram(skyboxProgram);


    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    skybox.setPosition(
        player.camera.distantPosition[0],
        player.camera.distantPosition[1],
        player.camera.distantPosition[2]
    );
    skybox.update();
    drawSkybox(skybox, player.camera);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.useProgram(program);

    enemies.forEach(enemy => enemy.model.update());
    player.model.update();

    enemies.forEach(enemy => draw(enemy.model, player.camera));
    draw(player.model, player.camera);
}


// Initializing some OpenGL parameters
function initGL() {
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // createMoteProgram();
    ctmMatrixLocation = gl.getUniformLocation(program, "uCTM");
    textureLocation = gl.getUniformLocation(program, "uTexture");
    useTextureLocation = gl.getUniformLocation(program, "uUseTexture");
    initLighting();

    // Skybox
    createSkyboxProgram();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);


    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // Just backface-culling, hidden surface removal and e.g.
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
}

function spawnEnemies(count) {
    enemies = [];
    for (let i = 0; i < count; i++) {
        const radius = randomRange(0.2, 2.0);
        const position = randomPosition(radius + 5.0);
        const enemyMass = Math.pow(radius, 3);
        const texture = getEnemyTextureForMass(enemyMass);
        const enemy = new Enemy(position, structuredClone(baseSphereVertices), radius, texture);
        enemies.push(enemy);
    }
}

function randomPosition(minDistance) {
    let pos;
    do {
        pos = [randomRange(-30, 30), randomRange(-10, 10), randomRange(-30, 30)];
    } while (distance(pos, player.position) < minDistance);
    return pos;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
}

function handleCollisions() {
    enemies.forEach(enemy => {
        const dist = distance(enemy.model.position, player.position);
        if (dist <= enemy.radius + player.radius) {
            if (player.mass >= enemy.mass) {
                player.grow(enemy.mass);

                // Optinally respawn enemy or remove it

                // respawnEnemy(enemy);
                removeEnemy(enemy);
                updateEnemyTextures();
            } else {
                clearInterval(gameLoopHandle);
                alert("Game Over! The enemy was too big to absorb.");
                gameOver();
            }
        }
    });
}

function respawnEnemy(enemy) {
    const newRadius = randomRange(0.2, 2.0);
    const newPosition = randomPosition(newRadius + player.radius + 2.0);
    const newMass = Math.pow(newRadius, 3);
    const texture = getEnemyTextureForMass(newMass);
    enemy.respawn(newPosition, newRadius, texture);
}

function removeEnemy(enemy) {
    const index = enemies.indexOf(enemy);

    if (index !== -1) {
        enemies.splice(index, 1);
    }
}


function getEnemyTextureForMass(enemyMass) {
    if (enemyMass > player.mass) {
        return enemyBigTexture;
    }

    return enemySmallTexture;
}

function updateEnemyTextures() {
    enemies.forEach(enemy => {
        const texture = getEnemyTextureForMass(enemy.mass);
        enemy.setTexture(texture);
    });
}
