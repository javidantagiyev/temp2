function calcCTM(world, view, proj){
    var worldView = mult(view, world);
    var ctm = mult(proj, worldView);
    return ctm;
}

function draw(model, camera){
    var ctm = calcCTM(model.worldMatrix, camera.view, camera.proj);
    gl.uniformMatrix4fv(ctmMatrixLocation, false, flatten(ctm));

    // Model
    gl.uniformMatrix4fv(model.worldMatrixLocation, false, flatten(model.worldMatrix));
    gl.uniform3f(centerLocation, model.position[0], model.position[1], model.position[2]);

    // Texture
    const useTexture = !!model.texture;
    gl.uniform1i(useTextureLocation, useTexture);
    if(useTexture){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, model.texture);
        gl.uniform1i(textureLocation, 0);
    }

    // Light
    gl.uniform3f(ambientLocation, ambient[0], ambient[1], ambient[2]);
    // gl.uniform3f(lightPosLocation, lightPos[0], lightPos[1], lightPos[2]);
    // gl.uniform3f(lightColorLocation, lightColor[0], lightColor[1], lightColor[2]);
    gl.uniform3f(lightPosLocation, lightSource.position[0], lightSource.position[1], lightSource.position[2]);
    gl.uniform3f(lightColorLocation, lightSource.color[0], lightSource.color[1], lightSource.color[2]);
    gl.uniform1f(shininessLocation, shininess);
    gl.uniform3f(viewerLocation, camera.distantPosition[0], camera.distantPosition[1], camera.distantPosition[2]);

    model.bind();

    gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
}


function drawSkybox(skybox, camera){
    var ctm = calcCTM(skybox.worldMatrix, camera.view, camera.proj);
    gl.uniformMatrix4fv(skyboxCtmMatrixLocation, false, flatten(ctm));

    gl.uniformMatrix4fv(skybox.worldMatrixLocation, false, flatten(skybox.worldMatrix));
    gl.uniform3f(skyboxCenterLocation, skybox.position[0], skybox.position[1], skybox.position[2]);

    // Texture
    const useTexture = !!skybox.texture;
    gl.uniform1i(skyboxUseTextureLocation, useTexture);
    if(useTexture){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, skybox.texture);
        gl.uniform1i(skyboxTextureLocation, 0);
    }

    skybox.bind();

    gl.drawArrays(gl.TRIANGLES, 0, skybox.vertexCount);
}