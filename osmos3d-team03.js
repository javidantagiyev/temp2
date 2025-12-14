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
var colorLocation;

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
var score = 0;
var timeRemaining = 0;
var initialEnemyCount = 12;
var baseTimePerEnemy = 8;
var baseTimeBuffer = 20;
var hudElements = {};

function init() {
    // Get reference to the context of the canvas
    canvas = document.getElementById("gl-canvas");
    
    // Initializing mouse controls
    initMouseControls();

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Initializing gl parameters and shaders
    initGL();

    // Creating a base sphere vertex array
    // This model will be used for all sphere objects
    // It is done to not generate a seperate vertex array every time
    baseSphereVertices = generateSphereVertices(0.5, 10);

    // Loading textures that will be used
    playerTexture = loadTexture(gl, "textures/player.png");
    enemyBigTexture = loadTexture(gl, "textures/enemybig.png");
    enemySmallTexture = loadTexture(gl, "textures/enemybig.png");
    skyboxTexture = loadTexture(gl, "textures/galaxy2.png");

    // Creating a player
    player = new Player([0.0, 0.0, 5.0], structuredClone(baseSphereVertices), 0.5, playerTexture, 100);
    // Spawning enemies
    initializeGameStats(initialEnemyCount);
    spawnEnemies(initialEnemyCount);
    setupHUD();

    // Creating a spherical skybox that bounds the scene
    const skyboxRadius = 120.0;
    const skyboxVertices = generateSphereVertices(1.0, 16);
    skybox = new Skybox([0, 0, 0], skyboxVertices, 1.0);
    skybox.setSize(skyboxRadius / skybox.baseRadius);
    skybox.texture = skyboxTexture;

    // Creating a light source
    // There is a single light source in the game
    lightSource = new LightSource([100, 100, 0], [0.5, 0.5, 0.0]);

    // Game loop
    prevFrameTime = new Date().getTime() / 1000;
    gameLoopHandle = window.setInterval(game, delay);
}

// Our gameplay will be here
function game(){
    // Delta time calculation
    crntFrameTime = new Date().getTime() / 1000;
    deltaTime = (crntFrameTime - prevFrameTime);
    prevFrameTime = crntFrameTime;

    timeRemaining = Math.max(0, timeRemaining - deltaTime);
    updateHUD();

    if (timeRemaining === 0){
        gameOver("You ran out of time! Score: " + score);
        return;
    }

    // Rotate light source around z axis of the scene 
    var npos = rotatePointZ(lightSource.position[0], lightSource.position[1], 0, 0, 0.3);
    lightSource.position[0] = npos[0];
    lightSource.position[1] = npos[1];

    player.update(deltaTime);
    player.resolveSkyboxCollision(skybox);
    // Handling collision between entities
    handleCollisions();
    render();
}

// Rendering function.
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Updating view matrix
    player.camera.updateView();

    // Rendering skybox
    gl.useProgram(skyboxProgram);
    skybox.update();
    renderSkybox(skybox, player.camera);

    // Updating entities' world matrices
    gl.useProgram(program);
    enemies.forEach(enemy => enemy.model.update());
    player.model.update();

    // Rendering entities
    enemies.forEach(enemy => renderModel(enemy.model, player.camera, player.mass, enemy.mass, false));
    renderModel(player.model, player.camera, 0, 0, true);
}


// Initializing some OpenGL parameters
function initGL(){
    // Creating shader program for entities
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    ctmMatrixLocation = gl.getUniformLocation(program, "uCTM");
    textureLocation = gl.getUniformLocation(program, "uTexture");
    useTextureLocation = gl.getUniformLocation(program, "uUseTexture");
    colorLocation = gl.getUniformLocation(program, "uColor");

    // Initializing lighting for entity objects
    initLighting();
    
    // Creating shader program for skybox
    createSkyboxProgram();
    
    // Just some webgl configurations
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
}

function initMouseControls(){
    // Mouse cursor lock (for 3d movement)
    // Pointer lock for Firefox
    canvas.onclick = () => {
        canvas.requestPointerLock(true);
    }

    // Pointer lock for Chromium based browsers
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

    // Mouse wheel control
    canvas.addEventListener("wheel", function(e){
        mouseWheelControls(e);
    }, false);
}


// Spawining enemies in the game
function spawnEnemies(count){
    enemies = [];

    // Keep a running mass budget to guarantee there is always a growth path
    // for the player. Each new enemy is generated so that, after the player
    // eats the previously generated ones, its mass will be large enough to
    // absorb the next enemy. This prevents impossible seeds where every enemy
    // is larger than the player on reload.
    const minRadius = 0.2;
    const maxRadius = 2.0;
    const minMass = Math.pow(minRadius, 3);
    const maxMass = Math.pow(maxRadius, 3);

    let projectedPlayerMass = player.mass;

    for(let i = 0; i < count; i++){
        // Allow slight difficulty ramp while keeping the enemy absorbable
        // after the player grows from previous enemies.
        const maxEnemyMass = Math.min(maxMass, projectedPlayerMass * 1.2);
        const enemyMass = randomRange(minMass, Math.max(minMass, maxEnemyMass));
        const radius = Math.cbrt(enemyMass);
        const position = randomPosition(radius + 5.0);
        const texture = getEnemyTextureForMass(enemyMass);
        const enemy = new Enemy(position, structuredClone(baseSphereVertices), radius, texture);
        enemies.push(enemy);

        projectedPlayerMass += enemyMass;
    }

    updateEnemyTextures();
}

// Function for getting random positions
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

// Calculating distance between 2 objects
function distance(a, b){
    return Math.sqrt(Math.pow(a[0]-b[0],2) + Math.pow(a[1]-b[1],2) + Math.pow(a[2]-b[2],2));
}


// Handling collision between entites
function handleCollisions(){
    enemies.forEach(enemy => {
        const dist = distance(enemy.model.position, player.position);
        if(dist <= enemy.radius + player.radius){
            if(player.mass >= enemy.mass){
                player.grow(enemy.mass);
                score += Math.round(enemy.mass * 100);

                // Optinally respawn enemy or remove it

                // respawnEnemy(enemy);
                removeEnemy(enemy);
                updateEnemyTextures();

                if (enemies.length === 0) {
                    setTimeout(() => {
                        gameOver("You absorbed them all! Final score: " + score);
                    }, 500); // delay in ms (500 = 0.5s)
                }

            } else {
                gameOver("Game Over! The enemy was too big to absorb.");
            }
        }
    });
}

// Respawning an enemy
function respawnEnemy(enemy){
    const newRadius = randomRange(0.2, 2.0);
    const newPosition = randomPosition(newRadius + player.radius + 2.0);
    const newMass = Math.pow(newRadius, 3);
    const texture = getEnemyTextureForMass(newMass);
    enemy.respawn(newPosition, newRadius, texture);
}

function removeEnemy(enemy){
    const index = enemies.indexOf(enemy);

    if(index !== -1){
        enemies.splice(index, 1);
    }
}


function getEnemyTextureForMass(enemyMass){
    if(enemyMass > player.mass){
        return enemyBigTexture;
    }

    return enemySmallTexture;
}

function updateEnemyTextures(){
    enemies.forEach(enemy => {
        const texture = getEnemyTextureForMass(enemy.mass);
        enemy.setTexture(texture);
    });
}

function initializeGameStats(enemyCount){
    score = 0;
    initialEnemyCount = enemyCount;
    timeRemaining = baseTimeBuffer + enemyCount * baseTimePerEnemy;
}

function setupHUD(){
    hudElements.score = document.getElementById("score-value");
    hudElements.timer = document.getElementById("timer-value");
    hudElements.enemies = document.getElementById("enemies-value");

    updateHUD();
}

function updateHUD(){
    if (!hudElements.score){
        return;
    }

    hudElements.score.textContent = score;
    hudElements.timer.textContent = formatTime(timeRemaining);
    hudElements.enemies.textContent = enemies.length;
}

function formatTime(seconds){
    const remaining = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
