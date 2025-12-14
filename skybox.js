// let skyboxProgram;
// let skyboxPositionLocation;
// let skyboxLocation;
// let viewDirectionProjectionInverseLocation;
// let skyboxPositionBuffer;
// // let skyboxTexture;


// // Init skybox
// function initSkyboxProgram() {
//     skyboxProgram = initShaders(gl, "skybox-vertex-shader", "skybox-fragment-shader");

//     skyboxPositionLocation = gl.getAttribLocation(skyboxProgram, "a_position");

//     skyboxLocation = gl.getUniformLocation(skyboxProgram, "u_skybox");
//     viewDirectionProjectionInverseLocation = gl.getUniformLocation(
//         skyboxProgram,
//         "u_viewDirectionProjectionInverse"
//     );

//     skyboxPositionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
//     setSkyboxQuad(gl);

//     skyboxTexture = gl.createTexture();
//     gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

//     const faces = [
//         { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: "textures/cosmos4-1.png" },
//         { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: "textures/cosmos4-5.png" },
//         { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: "textures/cosmos4-2.png" },
//         { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: "textures/cosmos4-6.png" },
//         { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: "textures/cosmos4-3.png" },
//         { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: "textures/cosmos4-4.png" },
//     ];

//     const level = 0;
//     const internalFormat = gl.RGBA;
//     const format = gl.RGBA;
//     const type = gl.UNSIGNED_BYTE;

//     // Placeholder 1x1 pixel for all faces
//     faces.forEach(f => {
//         gl.texImage2D(f.target, level, internalFormat, 1, 1, 0, format, type, null);
//     });

//     let loaded = 0;
//     faces.forEach(face => {
//         const img = new Image();
//         img.crossOrigin = "anonymous";
//         img.src = face.url;
//         img.onload = () => {
//             gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
//             gl.texImage2D(face.target, level, internalFormat, format, type, img);

//             loaded++;
//             if (loaded === 6) {
//                 const size = img.width;
//                 const isPOT = (size & (size - 1)) === 0;
//                 if (isPOT) {
//                     gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
//                     gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
//                 } else {
//                     gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//                 }
//                 gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//                 gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//                 gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//             }
//         };
//     });
// }


// function setSkyboxQuad(gl) {
//     // x, y, z, w
//     const positions = new Float32Array([
//         -1, -1, -1, 1,
//          1, -1, -1, 1,
//         -1,  1, -1, 1,
//         -1,  1, -1, 1,
//          1, -1, -1, 1,
//          1,  1, -1, 1
//     ]);
//     gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
// }

// function drawSphereSkybox(gl, camera){
//     gl.useProgram(skyboxProgram);

//     gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
//     gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(aPosLoc);

//     // Use your cubemap texture
//     gl.activeTexture(gl.TEXTURE0);
//     gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
//     gl.uniform1i(uCubemapLoc, 0);

//     // Pass projection and view (without translation)
//     var viewRot = copy4(camera.view);
//     viewRot[0][3] = 0;
//     viewRot[1][3] = 0;
//     viewRot[2][3] = 0;
//     gl.uniformMatrix4fv(uProjectionLoc, false, flattenColumnMajor(camera.proj));
//     gl.uniformMatrix4fv(uViewLoc, false, flattenColumnMajor(viewRot));

//     // Draw the sphere
//     gl.drawArrays(gl.TRIANGLES, 0, sphereVertices.length / 3);
// }


// // Draw Skybox
// function drawSkybox(gl, camera) {
//     gl.useProgram(skyboxProgram);

//     gl.bindBuffer(gl.ARRAY_BUFFER, skyboxPositionBuffer);
//     gl.enableVertexAttribArray(skyboxPositionLocation);
//     gl.vertexAttribPointer(skyboxPositionLocation, 4, gl.FLOAT, false, 0, 0);

//     var viewMatrix = inverse4(camera.view);

//     viewMatrix[0][3] = 0;
//     viewMatrix[1][3] = 0;
//     viewMatrix[2][3] = 0;

//     const vp = mult(camera.proj, inverse4(viewMatrix));

//     const vpInv = inverse4(vp);
//     const vpInvFlat = flatten(vpInv);

//     gl.uniformMatrix4fv(
//         viewDirectionProjectionInverseLocation,
//         false,
//         vpInvFlat
//     );

//     gl.activeTexture(gl.TEXTURE0);
//     gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
//     gl.uniform1i(skyboxLocation, 0);

//     gl.disable(gl.DEPTH_TEST);
//     gl.drawArrays(gl.TRIANGLES, 0, 6);
//     gl.enable(gl.DEPTH_TEST);
// }



class Skybox{
    vertexBuffer;
    vertexCount;

    // Transformation params
    worldMatrix;
    worldMatrixLocation;
    position;
    posAttribLocation;
    scaleFactor;
    rotateX;
    rotateY;
    rotateZ;
    baseRadius;
    texture;

    constructor(position, vertices, baseRadius = 1.0){
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.posAttribLocation = gl.getAttribLocation(skyboxProgram, "aPosition");
        gl.enableVertexAttribArray(this.posAttribLocation);

        this.worldMatrixLocation = gl.getUniformLocation(skyboxProgram, "uWorld");

        this.worldMatrix = mat4();
        this.vertexCount = vertices.length / 3;
        this.position = position;
        this.scaleFactor = 1.0;
        this.rotateX = 0.0;
        this.rotateY = 0.0;
        this.rotateZ = 0.0;
        this.baseRadius = baseRadius;
        this.texture = null;
    }

    bind(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.posAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(this.posAttribLocation);
    }


    update(){
        this.worldMatrix = mat4();

        this.worldMatrix = mult(scalem(this.scaleFactor, this.scaleFactor, this.scaleFactor), this.worldMatrix);
        this.worldMatrix = mult(rotateX(this.rotateX), this.worldMatrix);
        this.worldMatrix = mult(rotateY(this.rotateY), this.worldMatrix);
        this.worldMatrix = mult(rotateZ(this.rotateZ), this.worldMatrix);
        this.worldMatrix = mult(translate(this.position[0], this.position[1], this.position[2]), this.worldMatrix);
    }


    rotate(x, y, z){
        this.rotateX = (this.rotateX + x) % 360;
        this.rotateY = (this.rotateY + y) % 360;
        this.rotateZ = (this.rotateZ + z) % 360;
    }

    setPosition(x, y, z){
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
    }

    getRadius(){
        return this.baseRadius * this.scaleFactor;
    }

    setSize(scale){
        this.scaleFactor = scale;
    }
}

var skyboxProgram;
var skyboxCenterLocation;
var skyboxCtmMatrixLocation;
var skyboxTextureLocation;
var skyboxUseTextureLocation;

var skyboxProgram2
var skyboxTextureLocation2;
var skyboxUseTextureLocation2;


function createSkyboxProgram(){
    skyboxProgram = initShaders(gl, "skybox-vertex-shader", "skybox-fragment-shader");
    gl.useProgram(skyboxProgram);

    skyboxCenterLocation = gl.getUniformLocation(skyboxProgram, "uCenter");
    skyboxCtmMatrixLocation = gl.getUniformLocation(skyboxProgram, "uCTM");
    skyboxTextureLocation = gl.getUniformLocation(skyboxProgram, "uTexture");
    skyboxUseTextureLocation = gl.getUniformLocation(skyboxProgram, "uUseTexture");

}

// function createSkybox2Program(){
//     skyboxProgram2 = initShaders(gl, "skybox2-vertex-shader", "skybox2-fragment-shader");
//     gl.useProgram(skyboxProgram2);

//     skyboxTextureLocation2 = gl.getUniformLocation(skyboxProgram2, "uTexture");
//     skyboxUseTextureLocation2 = gl.getUniformLocation(skyboxProgram2, "uUseTexture");
// }

