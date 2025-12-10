var activeKeys = new Set();

function keyContols(e){
    activeKeys.add(e.key);
}

function releaseControls(e){
    activeKeys.delete(e.key);
}

function updateControls(delta){
    if(activeKeys.has('w')){
        player.accelerateForward(delta);
    }
    if(activeKeys.has('a')){
        player.accelerateLeft(delta);
    }
    if(activeKeys.has('s')){
        player.accelerateBack(delta);
    }
    if(activeKeys.has('d')){
        player.accelerateRight(delta);
    }
    if(activeKeys.has(' ')){ // It is space button
        player.accelerateVertical(delta);
    }
    if(activeKeys.has('Shift')){
        player.decelerateVertical(delta);
    }
}


function mouseControls(e){
    // Only rotate when locked
    if (document.pointerLockElement !== canvas) return;

    const dx = e.movementX;
    const dy = e.movementY;

    player.camera.yaw(dx);
    player.camera.pitch(-dy);
}

function mouseWheelControls(e){
    if(e.deltaY > 0){
        player.camera.increaseDistance();
    } else {
        player.camera.decreaseDistance();
    }
}