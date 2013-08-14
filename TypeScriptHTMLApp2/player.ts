///<reference path="app.ts" />
///<reference path="input.ts" />
///<reference path="entity.ts" />
var player: Player;
class Player extends Entity3D {
	height = 5;
	vpa: vec2=new vec2(0,0);//view plane
	vpb: vec2=new vec2(0,0);
	update() {
		if (aiming == false)
		{
			if (key["Q"])
				this.angle += 5;
			if (key["E"])
				this.angle -= 5;
		}
		var n = copyvec2(this.p);
		var aimScale = 1;
		if (aiming == true)
			aimScale = .03;
        if (key["W"])
        {
            n.x += Math.cos(this.angle * Math.PI / 180)*aimScale;
			n.y += Math.sin(this.angle * Math.PI / 180) * aimScale;
        }
        if (key["S"])
        {
			n.x -= Math.cos(this.angle * Math.PI / 180) * aimScale;
			n.y -= Math.sin(this.angle * Math.PI / 180) * aimScale;
		}
		if (key["A"])
		{
			n.x += Math.cos(this.angle * Math.PI / 180 + Math.PI / 2) * aimScale;
			n.y += Math.sin(this.angle * Math.PI / 180 + Math.PI / 2) * aimScale;
		}
		if (key["D"])
		{
			n.x += Math.cos(this.angle * Math.PI / 180 - Math.PI / 2) * aimScale;
			n.y += Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * aimScale;
		}
		if (key["C"])
		{
			this.height = 3;
		}
		else
		{
			this.height = 5;
		}
		if (key["X"])
			this.p = n;
		else
		this.collideWithWalls(n);
		if (this.z - this.s.bottom < -.3)
			this.z += .3;
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
    }
}