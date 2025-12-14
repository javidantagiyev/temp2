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
    // Keep the skybox stationary relative to the camera by removing the
    // translation component from the view matrix. This prevents any parallax
    // from the camera position while still allowing it to rotate with the view.
    var viewWithoutTranslation = structuredClone(camera.view);
    viewWithoutTranslation[0][3] = 0;
    viewWithoutTranslation[1][3] = 0;
    viewWithoutTranslation[2][3] = 0;

    var ctm = calcCTM(skybox.worldMatrix, viewWithoutTranslation, camera.proj);
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

    // Ensure the skybox always renders behind the scene but without clearing
    // previously written depth information.
    gl.depthMask(false);
    gl.drawArrays(gl.TRIANGLES, 0, skybox.vertexCount);
    gl.depthMask(true);
}