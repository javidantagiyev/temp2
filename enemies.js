class Enemy {
    constructor(position, radius, texture) {
        this.baseRadius = radius;
        this.mass = Math.pow(radius, 3);
        this.texture = texture;
        this.model = new Model(position, generateSphereVertices(radius, 10), radius);
        this.model.setPosition(position[0], position[1], position[2]);
        this.model.texture = texture;
    }

    get radius() {
        return this.model.getRadius();
    }

    respawn(newPosition, newRadius) {
        this.baseRadius = newRadius;
        this.mass = Math.pow(newRadius, 3);
        this.model = new Model(newPosition, generateSphereVertices(newRadius, 10), newRadius);
        this.model.setPosition(newPosition[0], newPosition[1], newPosition[2]);
        this.model.texture = this.texture;
    }
}
