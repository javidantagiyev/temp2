class Entity{
    constructor(model, radius){
        this.model = model;
        this.radius = radius || (model ? model.radius : 1.0);
        this.velocity = [0.0, 0.0, 0.0];
        this.score = 0;
        this.active = true;
    }
}