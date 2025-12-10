// Lighting
// Ambient
var ambient;
var ambientLocation;
// Diffusion
var lightPos;
var lightColor;
var lightPosLocation;
var lightColorLocation;
// Specular
var shininess;
var shininessLocation;
var viewerLocation;

var centerLocation;

var lightOrbitRadius = 40.0;
var lightOrbitSpeed = 0.5;

function initLighting(){
    ambient = new Float32Array([0.1, 0.1, 0.1]);
    ambientLocation = gl.getUniformLocation(program, "uAmbient");
    centerLocation = gl.getUniformLocation(program, "uCenter");

    lightPos = new Float32Array([0.0, 2.0, -10.0]);
    lightColor = new Float32Array([0.9, 0.9, 0.8]);
    lightPosLocation = gl.getUniformLocation(program, "uLightPosition");
    lightColorLocation = gl.getUniformLocation(program, "uLightColor");

    shininess = 50.0;
    shininessLocation = gl.getUniformLocation(program, "uShininess");
    viewerLocation = gl.getUniformLocation(program, "uViewerPosition");
}

function updateLightOrbit(delta){
    lightOrbitAngle += lightOrbitSpeed * delta;
    lightPos[0] = Math.cos(lightOrbitAngle) * lightOrbitRadius;
    lightPos[2] = Math.sin(lightOrbitAngle) * lightOrbitRadius;
}


class LightSource{
    position;
    color;
    model;

    constructor(position, color, model){
        this.position = position;
        this.color = color;
        this.model = model;
    }

    move(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.model.move(x, y, z);
    }

    setPosition(x, y, z){
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.model.setPosition(x, y, z);
    }
}