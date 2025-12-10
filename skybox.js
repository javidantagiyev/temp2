var skyboxVBO;
var skyboxViewLocation;
var skyboxProjLocation;
var skyboxCubemapLocation;

var aPosLocation;

function initSkyboxProgram(){
    skyboxViewLocation = gl.getUniformLocation(skyboxProgram, "uView");
    skyboxProjLocation = gl.getUniformLocation(skyboxProgram, "uProjection");
    skyboxCubemapLocation = gl.getUniformLocation(skyboxProgram, "uCubemap")
}

function initSkybox(skyboxVertices){
    skyboxVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVBO);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxVertices, gl.STATIC_DRAW);
}


function loadCubemap(gl) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    // Same parameters style as your example
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Load from existing <img> elements
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("px"));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("nx"));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("py"));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("ny"));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("pz"));
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("nz"));

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    return texture;
}

function renderSkybox(cubemap, camera) {
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(false);

    gl.useProgram(skyboxProgram);

    // remove translation
    // const viewNoTrans = mat4.clone(viewMatrix);
    // viewNoTrans[12] = viewNoTrans[13] = viewNoTrans[14] = 0;

    gl.uniformMatrix4fv(skyboxProjLocation, false, camera.proj);
    gl.uniformMatrix4fv(skyboxViewLocation, false, camera.view);

    // THE LINE YOU ARE MISSING:
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap);
    gl.uniform1i(skyboxCubemapLocation, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVBO);
    aPosLocation = gl.getAttribLocation(skyboxProgram, "position");
    gl.vertexAttribPointer(aPosLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosLocation);

    gl.drawArrays(gl.TRIANGLES, 0, 36);

    gl.depthMask(true);
}



var skyboxVertices = new Float32Array([
    // +X
    1, -1, -1,  1, -1,  1,  1,  1,  1,
    1, -1, -1,  1,  1,  1,  1,  1, -1,

    // -X
    -1, -1,  1, -1, -1, -1, -1,  1, -1,
    -1, -1,  1, -1,  1, -1, -1,  1,  1,

    // +Y
    -1,  1, -1,  1,  1, -1,  1,  1,  1,
    -1,  1, -1,  1,  1,  1, -1,  1,  1,

    // -Y
    -1, -1,  1,  1, -1,  1,  1, -1, -1,
    -1, -1,  1,  1, -1, -1, -1, -1, -1,

    // +Z
    -1, -1,  1, -1,  1,  1,  1,  1,  1,
    -1, -1,  1,  1,  1,  1,  1, -1,  1,

    // -Z
    1, -1, -1,  1,  1, -1, -1,  1, -1,
    1, -1, -1, -1,  1, -1, -1, -1, -1
]);


const cubeVertices = [
    // Front
     -1, -1,  1,
      1, -1,  1,
      1,  1,  1,

     -1, -1,  1,
      1,  1,  1,
     -1,  1,  1,

    // Back
      1, -1, -1,
     -1, -1, -1,
     -1,  1, -1,

      1, -1, -1,
     -1,  1, -1,
      1,  1, -1,

    // Left
     -1, -1, -1,
     -1, -1,  1,
     -1,  1,  1,

     -1, -1, -1,
     -1,  1,  1,
     -1,  1, -1,

    // Right
      1, -1,  1,
      1, -1, -1,
      1,  1, -1,

      1, -1,  1,
      1,  1, -1,
      1,  1,  1,

    // Top
     -1,  1,  1,
      1,  1,  1,
      1,  1, -1,

     -1,  1,  1,
      1,  1, -1,
     -1,  1, -1,

    // Bottom
     -1, -1, -1,
      1, -1, -1,
      1, -1,  1,

     -1, -1, -1,
      1, -1,  1,
     -1, -1,  1
];