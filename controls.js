function keyContols(e){
    if(e.key == 'w'){
        player.moveForward(deltaTime);
    }
    if(e.key == 'a'){
        player.moveLeft(deltaTime);
    }
    if(e.key == 's'){
        player.moveBack(deltaTime);
    }
    if(e.key == 'd'){
        player.moveRight(deltaTime);
    }
    if(e.key == ' '){ // It is space button
        player.addImpulse([0.0, 1.0, 0.0], deltaTime);
    }
    if(e.key == 'Shift'){
        player.addImpulse([0.0, -1.0, 0.0], deltaTime);
    }
}


function mouseControls(e){
    // Only rotate when locked
    if (document.pointerLockElement !== canvas) return;

    const dx = e.movementX;
    const dy = e.movementY;

    player.camera.yaw(dx/5);
    player.camera.pitch(-dy/5);
}

function mouseWheelControls(e){
    if(e.deltaY > 0){
        player.camera.increaseDistance();
    } else {
        player.camera.decreaseDistance();
    }
}