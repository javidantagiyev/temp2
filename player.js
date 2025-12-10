class Player{
    // Player's params
    position;
    speed;
    velocity;
    drag;

    // Video settings
    fov;

    // Player's body(Player also is a sphere)
    sphereModel;
    model;
    camera;

    alive = true;

    constructor(position, model, speed = 10){
        this.model = model;
        this.position = position;
        model.setPosition(position[0], position[1], position[2]);
        // var cameraPos = add(position, [0.0, 1.0, 2.0]);
        var cameraPos = add(position, [0.0, 1.5, 6.0]);
        var cameraTarget = add(position, [0.0, -1.0, -5.0]);
        this.fov = 90;
        this.camera = new Camera(cameraPos, cameraTarget, this.fov, 0.1, 1000);
        this.speed = speed;
        this.velocity = [0.0, 0.0, 0.0];
        this.drag = 0.92;
    }

    // Move player's position
    move(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.camera.moveTo(this.position[0], this.position[1], this.position[2]);
        this.model.setPosition(this.position[0], this.position[1], this.position[2]);
    }

    accelerateForward(delta){
        const direct = this.camera.direction;
        this.velocity[0] += (direct[0] * this.speed * delta);
        this.velocity[1] += (direct[1] * this.speed * delta);
        this.velocity[2] += (direct[2] * this.speed * delta);
    }

    accelerateBack(delta){
        const direct = this.camera.direction;
        this.velocity[0] -= (direct[0] * this.speed * delta);
        this.velocity[1] -= (direct[1] * this.speed * delta);
        this.velocity[2] -= (direct[2] * this.speed * delta);
    }

    accelerateRight(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        this.velocity[0] += (right[0] * this.speed * delta);
        this.velocity[1] += (right[1] * this.speed * delta);
        this.velocity[2] += (right[2] * this.speed * delta);
    }

    accelerateLeft(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        this.velocity[0] -= (right[0] * this.speed * delta);
        this.velocity[1] -= (right[1] * this.speed * delta);
        this.velocity[2] -= (right[2] * this.speed * delta);
    }

    accelerateVertical(delta){
        this.velocity[1] += this.speed * delta;
    }

    decelerateVertical(delta){
        this.velocity[1] -= this.speed * delta;
    }

    update(delta, boundaryRadius){
        this.move(this.velocity[0] * delta, this.velocity[1] * delta, this.velocity[2] * delta);
        this.velocity[0] *= this.drag;
        this.velocity[1] *= this.drag;
        this.velocity[2] *= this.drag;
        this.bounceFromBoundary(boundaryRadius);
    }

    bounceFromBoundary(boundaryRadius){
        var dist = length(subtract(this.position, [0.0, 0.0, 0.0]));
        if(dist + this.model.radius > boundaryRadius){
            var normal = normalize(this.position);
            var overlap = (dist + this.model.radius) - boundaryRadius;
            this.position = subtract(this.position, scale(overlap, normal));
            var dotVal = dot(this.velocity, normal);
            this.velocity = subtract(this.velocity, scale(2 * dotVal, normal));
            this.move(0, 0, 0);
        }
    }
}