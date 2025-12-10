class Renderer{

}

const SMALL_COLOR = [0.2, 0.7, 1.0];
const LARGE_COLOR = [1.0, 0.35, 0.2];

function calcCTM(world, view, proj){
    var worldView = mult(view, world);
    var ctm = mult(proj, worldView);
    return ctm;
}

function draw(model, camera, playerRadius){
    var ctm = calcCTM(model.worldMatrix, camera.view, camera.proj);
    gl.uniformMatrix4fv(ctmMatrixLocation, false, flatten(ctm));

    // Model
    gl.uniformMatrix4fv(model.worldMatrixLocation, false, flatten(model.worldMatrix));
    gl.uniform3f(centerLocation, model.position[0], model.position[1], model.position[2]);

    gl.uniform3f(smallColorLocation, SMALL_COLOR[0], SMALL_COLOR[1], SMALL_COLOR[2]);
    gl.uniform3f(largeColorLocation, LARGE_COLOR[0], LARGE_COLOR[1], LARGE_COLOR[2]);
    gl.uniform1f(playerRadiusLocation, playerRadius || 1.0);
    gl.uniform1f(moteRadiusLocation, model.radius || 1.0);
    gl.uniform1f(alphaLocation, model.alpha || 1.0);

    // Light
    gl.uniform3f(ambientLocation, ambient[0], ambient[1], ambient[2]);
    gl.uniform3f(lightPosLocation, lightPos[0], lightPos[1], lightPos[2]);
    gl.uniform3f(lightColorLocation, lightColor[0], lightColor[1], lightColor[2]);
    gl.uniform1f(shininessLocation, shininess);
    gl.uniform3f(viewerLocation, camera.distantPosition[0], camera.distantPosition[1], camera.distantPosition[2]);

    if(model.texture){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, model.texture);
        gl.uniform1i(textureLocation, 0);
        gl.uniform1i(useTextureLocation, 1);
    } else {
        gl.uniform1i(useTextureLocation, 0);
    }

    if(model.isSkybox){
        gl.cullFace(gl.FRONT);
    } else {
        gl.cullFace(gl.BACK);
    }

    model.bind();

    gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
}