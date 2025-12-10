function detectCollision(a, b){
    return length(subtract(a.model.position, b.model.position)) < (a.model.radius + b.model.radius);
}

function absorb(larger, smaller){
    const combinedVolume = Math.pow(larger.model.radius, 3) + Math.pow(smaller.model.radius, 3);
    const newRadius = Math.cbrt(combinedVolume);
    larger.model.setSize(newRadius);
    larger.radius = newRadius;
    smaller.active = false;
}

function resolveWorldCollisions(player, motes, worldRadius){
    for(const mote of motes){
        if(!mote.active){
            continue;
        }
        if(detectCollision(player, mote)){
            if(player.model.radius >= mote.model.radius){
                absorb(player, mote);
            } else {
                player.alive = false;
                return;
            }
        }
    }

    // Mote vs mote collisions
    for(let i = 0; i < motes.length; i++){
        for(let j = i + 1; j < motes.length; j++){
            const m1 = motes[i];
            const m2 = motes[j];
            if(!m1.active || !m2.active){
                continue;
            }
            if(detectCollision(m1, m2)){
                if(m1.model.radius >= m2.model.radius){
                    absorb(m1, m2);
                } else {
                    absorb(m2, m1);
                }
            }
        }
    }
}
