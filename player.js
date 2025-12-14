class Player extends Enemy{

    constructor(position, vertices, radius, texture, speed = 20){
        super(position, vertices, radius, texture);
        this.model.setPosition(position[0], position[1], position[2]);
        var cameraPos = position;
        var cameraTarget = add(cameraPos, [0.0, 0.0, -5.0]);
        this.fov = 90;
        this.camera = new Camera(cameraPos, cameraTarget, this.fov, 0.1, 1000);
        this.speed = speed;
        this.mass = Math.pow(this.model.getRadius(), 3);
        this.velocity = [0.0, 0.0, 0.0];
        this.drag = 4.0;
        this.acceleration = this.speed * 4.0;
        this.maxSpeed = this.speed * 1.5;
    }

    // Move player's position
    move(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.camera.moveTo(this.position[0], this.position[1], this.position[2]);
        this.model.setPosition(this.position[0], this.position[1], this.position[2]);
    }

    // Moving player in camera directions
    moveForward(delta){
        const direct = this.camera.direction;
        this.addImpulse(direct, delta);
    }

    moveBack(delta){
        const direct = this.camera.direction;
        this.addImpulse(scale(-1, direct), delta);
    }

    moveRight(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        this.addImpulse(right, delta);
    }

    moveLeft(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        this.addImpulse(scale(-1, right), delta);
    }

    grow(additionalMass){
        this.mass += additionalMass;
        const newRadius = Math.cbrt(this.mass);
        this.model.setSize(newRadius / this.model.baseRadius);
    }

    moveUp(){

    }

    addImpulse(direction, delta){
        const impulseStrength = this.acceleration * delta;
        this.velocity[0] += direction[0] * impulseStrength;
        this.velocity[1] += direction[1] * impulseStrength;
        this.velocity[2] += direction[2] * impulseStrength;
    }

    applyInertia(delta){
        const speed = length(this.velocity);
        if (this.speed > this.maxSpeed){
            const limited = normalize(this.velocity);
            this.velocity = scale(this.maxSpeed, limited);
        }

        this.move(this.velocity[0] * delta, this.velocity[1] * delta, this.velocity[2] * delta);

        const damping = Math.exp(-this.drag * delta);
        this.velocity[0] *= damping;
        this.velocity[1] *= damping;
        this.velocity[2] *= damping;
    }

    resolveSkyboxCollision(skybox){
        if (!skybox){
            return;
        }

        const offset = subtract(this.position, skybox.position);
        const distanceFromCenter = length(offset);
        const maxDistance = skybox.getRadius() - this.radius;

        if (distanceFromCenter > maxDistance){
            const direction = distanceFromCenter === 0 ? [1, 0, 0] : normalize(offset);
            const targetPosition = add(skybox.position, scale(maxDistance - 0.01, direction));
            const correction = subtract(targetPosition, this.position);
            this.move(correction[0], correction[1], correction[2]);

            const outwardSpeed = dot(this.velocity, direction);
            if (outwardSpeed > 0){
                const restitution = 0.8;
                const outward = scale((1 + restitution) * outwardSpeed, direction);
                this.velocity = subtract(this.velocity, outward);
            }
        }
    }

    update(delta){
        this.applyInertia(delta);
    }
}