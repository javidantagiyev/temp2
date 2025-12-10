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

    // Light
    gl.uniform3f(ambientLocation, ambient[0], ambient[1], ambient[2]);
    gl.uniform3f(lightPosLocation, lightPos[0], lightPos[1], lightPos[2]);
    gl.uniform3f(lightColorLocation, lightColor[0], lightColor[1], lightColor[2]);
    gl.uniform1f(shininessLocation, shininess);
    gl.uniform3f(viewerLocation, camera.distantPosition[0], camera.distantPosition[1], camera.distantPosition[2]);

    model.bind();

    gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
}