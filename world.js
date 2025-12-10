class Mote extends Entity{
    constructor(position, radius, texture, options = {}){
        const detail = options.detail || 10;
        const model = new Model(position, generateSphereVertices(radius, detail), radius, { texture: texture, alpha: 0.95 });
        super(model, radius);
        const speed = options.speed || 2;
        this.velocity = [
            (Math.random() - 0.5) * speed,
            (Math.random() - 0.5) * speed,
            (Math.random() - 0.5) * speed
        ];
        this.drag = options.drag || 0.98;
    }

    update(delta, boundaryRadius){
        this.model.setPosition(
            this.model.position[0] + this.velocity[0] * delta,
            this.model.position[1] + this.velocity[1] * delta,
            this.model.position[2] + this.velocity[2] * delta
        );
        this.velocity = this.velocity.map(v => v * this.drag);
        bounceInsideSphere(this, boundaryRadius);
        this.model.update();
    }
}

function bounceInsideSphere(entity, boundaryRadius){
    var dist = length(subtract(entity.model.position, [0.0, 0.0, 0.0]));
    if(dist + entity.model.radius > boundaryRadius){
        var normal = normalize(entity.model.position);
        var overlap = (dist + entity.model.radius) - boundaryRadius;
        entity.model.setPosition(
            entity.model.position[0] - normal[0] * overlap,
            entity.model.position[1] - normal[1] * overlap,
            entity.model.position[2] - normal[2] * overlap
        );
        var dotVal = dot(entity.velocity, normal);
        entity.velocity = subtract(entity.velocity, scale(2 * dotVal, normal));
    }
}

function randomPosition(radius, worldRadius){
    const r = (worldRadius - radius - 1) * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    return [x, y, z];
}

function spheresIntersect(p1, r1, p2, r2){
    return length(subtract(p1, p2)) < (r1 + r2 + 0.1);
}

function createMoteField(count, worldRadius, playerRadius, texture, playerPosition, radiusRange = [0.4, 1.6], options = {}){
    const motes = [];
    const minRadius = radiusRange[0];
    const maxRadius = radiusRange[1];
    let attempts = 0;
    while(motes.length < count && attempts < count * 100){
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const position = randomPosition(radius, worldRadius - 2);
        if(playerPosition && spheresIntersect(position, radius, playerPosition, playerRadius)){
            attempts++;
            continue;
        }
        let ok = true;
        for(const m of motes){
            if(spheresIntersect(position, radius, m.model.position, m.model.radius)){
                ok = false;
                break;
            }
        }
        if(ok){
            motes.push(new Mote(position, radius, texture, options));
        }
        attempts++;
    }
    return motes;
}

function createSkybox(radius, texture){
    return new Model([0.0, 0.0, 0.0], generateSphereVertices(radius, 18), radius, { texture: texture, alpha: 0.85, isSkybox: true });
}
