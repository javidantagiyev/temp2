class Player extends Enemy{

    constructor(position, vertices, radius, texture, speed = 40){
        super(position, vertices, radius, texture);
        this.model.setPosition(position[0], position[1], position[2]);
        var cameraPos = position;
        var cameraTarget = add(cameraPos, [0.0, 0.0, -5.0]);
        this.fov = 90;
        this.camera = new Camera(cameraPos, cameraTarget, this.fov, 0.1, 1000);
        this.speed = speed;
        this.mass = Math.pow(this.model.getRadius(), 3);
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
        const x = (direct[0] * this.speed * delta);
        const y = (direct[1] * this.speed * delta);
        const z = (direct[2] * this.speed * delta);
        this.move(x, y, z);
    }

    moveBack(delta){
        const direct = this.camera.direction;
        const x = -(direct[0] * this.speed * delta);
        const y = -(direct[1] * this.speed * delta);
        const z = -(direct[2] * this.speed * delta);
        this.move(x, y, z);
    }

    moveRight(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        const x = (right[0] * this.speed * delta);
        const y = (right[1] * this.speed * delta);
        const z = (right[2] * this.speed * delta);
        this.move(x, y, z);
    }

    moveLeft(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        const x = -(right[0] * this.speed * delta);
        const y = -(right[1] * this.speed * delta);
        const z = -(right[2] * this.speed * delta);
        this.move(x, y, z);
    }

    grow(additionalMass){
        this.mass += additionalMass;
        const newRadius = Math.cbrt(this.mass);
        this.model.setSize(newRadius / this.model.baseRadius);
    }

    moveUp(){

    }
}
