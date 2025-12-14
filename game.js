let gameEnded = false;

function gameOver(message){
    if (gameEnded){
        return;
    }

    gameEnded = true;
    clearInterval(gameLoopHandle);
    alert(message || "Game Over!");
    window.location.reload();
}