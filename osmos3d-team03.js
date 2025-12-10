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
window.onkeyup = releaseControls;

var mousex;
var mousey;

// Program flow
var delay = 0;

// Time
var delta = 0;
var deltaTime = 0;
var crntFrameTime = 0;
var prevFrameTime = 0;

// Shaders
var program;

var posAttribLocation;
var colorAttribLocation;
var textureAttribLocation;
var normalAttribLocation;
// Transformation
var ctmMatrixLocation;
// Dont touch it. It is for lighting
var worldNormalMatrixLocation;
var textureLocation;
var useTextureLocation;
var smallColorLocation;
var largeColorLocation;
var moteRadiusLocation;
var playerRadiusLocation;
var alphaLocation;


// Game
var box;
var triangle;
var triangle1;
var sphereModel;
var camera;
var player;
var sphere;
var cube;
var motes = [];
var skybox;
var enemyTexture;
var playerTexture;
var cosmosTexture;
var worldRadius = 25;
var lightOrbitAngle = 0;
var GAME_OVER = false;

// Triangle
var triangleVertices = 
[
    0.0, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5
];

var triangleColors =
[
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
];

function initMaterialUniforms(){
    textureLocation = gl.getUniformLocation(program, "uTexture");
    useTextureLocation = gl.getUniformLocation(program, "uUseTexture");
    smallColorLocation = gl.getUniformLocation(program, "uSmallColor");
    largeColorLocation = gl.getUniformLocation(program, "uLargeColor");
    moteRadiusLocation = gl.getUniformLocation(program, "uMoteRadius");
    playerRadiusLocation = gl.getUniformLocation(program, "uPlayerRadius");
    alphaLocation = gl.getUniformLocation(program, "uAlpha");
}


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

    // initPointerLock();
    // tryPointerLock();

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
    initLighting();
    initMaterialUniforms();

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    playerTexture = loadTexture(gl, "player.png");
    enemyTexture = loadTexture(gl, "enemies.png");
    cosmosTexture = loadTexture(gl, "cosmos.png");

    sphere = new Model([0.0, 0.0, 10.0], generateSphereVertices(1, 10), 1.0, { texture: enemyTexture });
    const playerRadius = 0.8;
    player = new Player([0.0, -2.0, 5.0], new Model([0.0, -2.0, 5.0], generateSphereVertices(playerRadius, 14), playerRadius, { texture: playerTexture, alpha: 0.9, isPlayer: true }));

    skybox = createSkybox(worldRadius + 2.0, cosmosTexture);
    motes = createMoteField(15, worldRadius, player.model.radius, enemyTexture, player.model.position);

    window.requestAnimationFrame(game);
}

// Our gameplay will be here
function game(){
    // Delta
    crntFrameTime = new Date().getTime() / 1000;
    deltaTime = (crntFrameTime - prevFrameTime);
    prevFrameTime = crntFrameTime;

    if(GAME_OVER){
        return;
    }

    updateControls(deltaTime);
    updateLightOrbit(deltaTime);
    player.update(deltaTime, worldRadius);
    motes.forEach(m => {
        if(m.active){
            m.update(deltaTime, worldRadius);
        }
    });
    resolveWorldCollisions(player, motes, worldRadius);

    if(player.alive === false){
        GAME_OVER = true;
        alert("You were absorbed by a larger mote. Game Over!");
        return;
    }

    render();
    window.requestAnimationFrame(game);
}

// Rendering function. IT IS NOT THE GAME LOOP
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    skybox.update();
    player.model.update();
    player.camera.updateView();

    gl.depthMask(false);
    draw(skybox, player.camera, player.model.radius);
    gl.depthMask(true);

    motes.forEach(m => {
        if(!m.active){
            return;
        }
        m.model.update();
        draw(m.model, player.camera, player.model.radius);
    });

    draw(player.model, player.camera, player.model.radius);
}


// Initializing some OpenGL parameters
function initGL(){
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Just backface-culling, hidden surface removal and e.g.
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}
