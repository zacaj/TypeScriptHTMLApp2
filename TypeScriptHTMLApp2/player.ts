///<reference path="app.ts" />
///<reference path="input.ts" />
var player: Player;
class Player extends Entity3D {
    update() {
        if (key["A"])
            this.angle += 5;
        if (key["D"])
            this.angle -= 5;
        if (key["W"])
        {
            this.p.x += Math.cos(this.angle * Math.PI / 180);
            this.p.y += Math.sin(this.angle * Math.PI / 180);
            //this.p.x += 1;
        }
        if (key["S"])
        {
            this.p.x -= Math.cos(this.angle * Math.PI / 180);
            this.p.y -= Math.sin(this.angle * Math.PI / 180);
            //this.p.y += 1;
        }
    }
    constructor(p:vec2) {
        super(p);
        player = this;
        this.z = 5;
    }
}