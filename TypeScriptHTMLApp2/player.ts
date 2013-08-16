///<reference path="app.ts" />
///<reference path="input.ts" />
///<reference path="entity.ts" />
var player: Player;
class Player extends Entity3D {
	height = 5;
	vpa: vec2=new vec2(0,0);//view plane
	vpb: vec2 = new vec2(0, 0);
	hp = 3;
	update() {
		if (aiming == false)
		{
			if (key["Q"])
				this.angle -= 5;
			if (key["E"])
				this.angle += 5;
		}
		var n = copyvec2(this.p);
		var aimScale = 1;
		var moveSpeed = 1;
		if (aiming == true)
			aimScale = .03;
		if (key["C"])
		{
			this.height = 3;
			moveSpeed = .5;
		}
		else
		{
			this.height = 5;
		}
		if (key["shift"])
			moveSpeed = 1.4;
		
        if (key["W"])
        {
            n.x += Math.cos(this.angle * Math.PI / 180)*aimScale*moveSpeed;
			n.y += Math.sin(this.angle * Math.PI / 180) * aimScale * moveSpeed;
        }
        if (key["S"])
        {
			n.x -= Math.cos(this.angle * Math.PI / 180) * aimScale * moveSpeed;
			n.y -= Math.sin(this.angle * Math.PI / 180) * aimScale * moveSpeed;
		}
		if (key["A"])
		{
			n.x += Math.cos(this.angle * Math.PI / 180 - Math.PI / 2) * aimScale * moveSpeed;
			n.y += Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * aimScale * moveSpeed;
		}
		if (key["D"])
		{
			n.x += Math.cos(this.angle * Math.PI / 180 + Math.PI / 2) * aimScale * moveSpeed;
			n.y += Math.sin(this.angle * Math.PI / 180 + Math.PI / 2) * aimScale * moveSpeed;
		}
		if (key["X"])
			this.p = n;
		else
		this.collideWithWalls(n);
		if (this.z - this.s.bottom < -.3)
			this.z += .3;
		else if (this.z < this.s.bottom)
			this.z = this.s.bottom;
		super.update();
		this.vpa.x=this.p.x+Math.cos(this.angle * Math.PI / 180 + Math.PI / 2)*10000;
		this.vpa.y = this.p.y+Math.sin(this.angle * Math.PI / 180 + Math.PI / 2)*10000;
		this.vpb.x=this.p.x+Math.cos(this.angle * Math.PI / 180 - Math.PI / 2)*10000;
		this.vpb.y = this.p.y + Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * 10000;
	}
	draw() {
	}
    constructor(p:vec2) {
        super(p);
        player = this;
		this.z = 0;
		this.r = 1.5;
		guis.push(new HPMeter());
	}
	shot(by) {
		this.hp--;
		if (this.hp <= 0)
		{
			this.hp = 0;
		}
	}
}

class HPMeter extends GUI {
	constructor() {
		super();
		this.p = new vec2(30, 738);
		this.tex = getTex("LB_Health.png");
		this.d = new vec2(30, 24);
	}
	draw() {
		for (var i = 0; i < player.hp; i++)
		{
			super.draw();
			this.p.x += 45;
		}
		this.p.x = 30;
	}
}
