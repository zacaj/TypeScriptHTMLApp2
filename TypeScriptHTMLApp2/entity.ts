
///<reference path="math.ts" />
///<reference path="app.ts" />
class Entity {
    s: Sector;
    p: vec2;
	z: number;
	r: number = 1;
	gravity = .3;
	update() {
		if (this.z - this.s.bottom > this.gravity)
			this.z -= this.gravity;
	}
    constructor(p: vec2) {
        this.z = 0;
        this.p = (p);
        this.s = getSector(this.p);
	}
	draw() { }
	collideWithWalls(n:vec2):bool {
		var dp = new vec2(n.x - this.p.x, n.y - this.p.y);
		var md = dp.dist(new vec2(0, 0));
		if (md > .00000000001)
		{
			var sd = 999999;
			var w: Wall;
			for (var i = 0; i < this.s.extendedWalls.length; i++)
			{
				var d = distToSegmentSquared(n, this.s.extendedWalls[i].a, this.s.extendedWalls[i].b);
				if (d < sd)
				{
					sd = d;
					w = this.s.extendedWalls[i];
				}
			}

			if (sd <= this.r * this.r && ((w.isPortal == true && w.portal.bottom - this.z > 2.1) || w.isPortal == false))
			{
				sd = Math.sqrt(sd);
				var dp = new vec2(n.x - this.p.x, n.y - this.p.y);
				var wp = projectPoint(n, w.a, w.b);
				this.p = wp.plus(w.n.scale(this.r));
				return true;
			}
			else
			{
				this.p = n;
				return false;
			}
		}
	}
}
var entities: Entity[] = new Array<Entity>();
class Entity3D extends Entity {
	angle: number;
	tex: Texture;
	nSide: number;
	d: vec2 = new vec2(10, 10);
	constructor(p: vec2) {
		super(p);
        this.angle = 0;
	}
	draw() {
		var n = this.p.minus(projectPoint(this.p, player.vpa, player.vpb));
		n.normalize();
		n = n.scale(this.d.x / 2);
		var a = new vec2(n.y, -n.x).plus(this.p);
		var b = new vec2(-n.y, n.x).plus(this.p);
		n = this.p.minus(player.p);
		n.normalize();
		var a2p = Math.atan2(n.y, n.x); 
        a2p+=this.angle*Math.PI/180;
		a2p += Math.PI * 2 / this.nSide / 2;
		if (a2p < 0)
			a2p += Math.PI * 2;
		if (a2p >= Math.PI * 2)
			a2p -= Math.PI * 2;
		a2p /= Math.PI * 2;
		a2p *= this.nSide;
		a2p = Math.floor(a2p);
		a2p /= this.nSide;
		gl.uniform2f(TranPosition, a2p, 0);
		quad(b, a, this.z, this.z + this.d.y, this.tex);
		gl.uniform2f(TranPosition, 0, 0);
	}
	update() {
	}
}
class BillboardEntity extends Entity {
	tex: Texture;
	d: vec2 = new vec2(1, 1);
	constructor(p: vec2, tex: Texture) {
		super(p);
		this.tex = tex;
	}
	draw() {
		var n = this.p.minus(projectPoint(this.p,player.vpa,player.vpb));
		n.normalize();
		n =n.scale(this.d.x / 1);
		var a = new vec2(n.y, -n.x).plus(this.p);
		var b = new vec2(-n.y, n.x).plus(this.p);
		quad(b, a, this.z, this.z + this.d.y, this.tex);
	}
}
class Arrow extends Entity3D {
	v: vec2;
	vz: number;
	stuck = false;
	constructor(yaw: number, pitch: number, p: vec2,z:number) {
		super(p);
		this.angle = -yaw;
		yaw = yaw * Math.PI / 180;
		pitch = pitch * Math.PI / 180;
		this.gravity = 0;
		var x = Math.cos(pitch);
		this.vz = Math.sin(pitch);
		var y = 0;
		this.v = new vec2(0, 0);
		this.v.x = x * Math.cos(yaw) - y * Math.sin(yaw);
		this.v.y = x * Math.sin(yaw) + y * Math.cos(yaw);
		this.tex=getTex("arrowlevel.png");
		this.nSide = 16;
		this.z = z;
		this.v.scale(.06);
		this.vz *= .8;
	}
	update() {
		if (this.stuck == false)
		{
			this.z += this.vz;
			this.vz += -.024;
			var n = this.p.plus(this.v);
			if (this.collideWithWalls(n) == true)
				this.stuck = true;
			if (this.z + this.d.y * .125+ this.d.y * .875 / 2 < this.s.bottom)
			{
				this.z = this.s.bottom  - this.d.y * .875 / 2;
				this.stuck = true;
			}
			if (this.z - this.d.y * .875 / 2 > this.s.top)
			{
				this.z = this.s.top  + this.d.y * .875 / 2;
				this.stuck = true;
			}
		}
	}
}