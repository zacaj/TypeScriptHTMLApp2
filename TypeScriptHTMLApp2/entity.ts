
///<reference path="math.ts" />
///<reference path="app.ts" />
class Entity {
    s: Sector;
    p: vec2;
	z: number;
	r: number = 1;
	gravity = .3;
	remove = false;
	update() {
		if(this.s)
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
	verticalTrans: number = 0;
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
        a2p-=this.angle*Math.PI/180;
		a2p += Math.PI * 2 / this.nSide / 2;
		if (a2p < 0)
			a2p += Math.PI * 2;
		if (a2p >= Math.PI * 2)
			a2p -= Math.PI * 2;
		a2p /= Math.PI * 2;
		a2p *= this.nSide;
		a2p = Math.floor(a2p);
		a2p /= this.nSide;
		gl.uniform2f(TranPosition, a2p, this.verticalTrans);
		quad(b, a, this.z, this.z + this.d.y, this.tex);
		gl.uniform2f(TranPosition, 0, 0);
	}
	update() {
		super.update();
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
		n =n.scale(this.d.x / 2);
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
		this.angle =yaw;
		yaw = yaw * Math.PI / 180;
		pitch = pitch * Math.PI / 180;
		this.gravity = 0;
		var x = Math.cos(pitch);
		this.vz = Math.sin(pitch);
		var y = 0;
		this.v = new vec2(0, 0);
		this.v.x = x * Math.cos(yaw) - y * Math.sin(yaw);
		this.v.y = x * Math.sin(yaw) + y * Math.cos(yaw);
		this.tex=getTex("arrows.png");
		this.nSide = 16;
		this.z = z;
		this.v.scale(.08);
		this.vz *= .8;
	}
	update() {
		if (this.stuck == false)
		{
			this.z += this.vz;
			this.vz += -.01;
			
			var p = Math.abs(this.vz) / Math.sqrt(this.v.x * this.v.x + this.v.y * this.v.y + this.vz * this.vz);
			var i;
			if (p > .99)
				i = 0;
			else if (p > .8)
				i = 1;
			else if (p > .45)
				i = 2;
			else i = 3;
			if (this.vz>=0)
				i = 6 - i;
			this.verticalTrans = i * .125;

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
			if (this.stuck == true)
			{
				for (var i = 0; i < entities.length; i++)
				{
					if ((<any>entities[i]).hit == false)
					{
						if (this.p.dist(entities[i].p) < entities[i].r && Math.abs(this.z+this.d.y/2 - entities[i].z) < entities[i].r)
						{
							(<any>entities[i]).hit = true;
							(<any>entities[i]).func();
						}
					}
				}
			}
		}
	}
}

class Decal extends Entity {
	tex: Texture;
	a: vec2;
	b: vec2;
	height: number;
	constructor(wall: Wall, z: number, w: number, h:number,tex: Texture) {
		super(wall.a.plus(wall.b).scale(.5).plus(wall.n.scale(.1)));
		this.z = z;
		this.r = w / 2;
		this.height = h;
		this.tex = tex;
		this.a = wall.a.minus(this.p);
		this.a.normalize();
		this.a = this.a.scale(this.r).plus(this.p);
		this.b = wall.b.minus(this.p);
		this.b.normalize();
		this.b = this.b.scale(this.r).plus(this.p);
		this.gravity = 0;
	}
	draw() {
		quad(this.a, this.b, this.z - this.height / 2, this.z + this.height / 2, this.tex);
	}
}
class Target extends Decal {
	hit = false;
	func: Function;
	constructor(wall: Wall, z: number, func: Function= function () { },r=3.7) {
		super(wall, z, r * 2,r*2, getTex("LB_Target.png"));
		this.func = func;
	}
}

class Button extends Decal {
	onFor = 0;
	func: Function;
	constructor(wall: Wall, func: Function) {
		super(wall, 5, 3.5, 3.5, getTex("LB_Button01Off.png"));
		this.func=func;
	}
	update() {
		if (this.onFor > 0)
		{
			this.onFor--;
			if (this.onFor > 0)
				this.tex = getTex("LB_Button01On.png");
			else
				this.tex = getTex("LB_Button01Off.png");
		}
		else
			if (key["F"])
			{
				var a = Math.abs(Math.atan2(this.p.y - player.p.y, this.p.x - player.p.x))*180/Math.PI;
				if (Math.abs(a + player.angle) < 40)
					if (this.p.dist(player.p)<8)
				{
					this.onFor = 30;
					this.func();
				}
			}
	}
}	

function addGrass(p: vec2) {
	var g = new BillboardEntity(p, getTex("LB_Grass0" + (Math.random() >= .5 ? "1" : "2") + ".png"));
	g.d = new vec2(2*.8, 3*.8);
	g.z = g.s.bottom;
	entities.push(g);
}
class DoorDoer extends Entity {
	s: Sector;
	dir: bool;
	constructor(s: Sector,dir:bool) {
		super(new vec2(0, 0));
		this.s = s;
		this.dir = dir;
	}
	update() {
		if (this.s == player.s)
			return;
		if (this.dir == true)
		{
			this.s.top -= .3;
			//this.s.top -= .03;
			if (this.s.bottom > this.s.top)
			{
				this.remove = true;
				this.s.top = this.s.bottom;
			}
		}
		else
		{
			this.s.top += .3;
			if (this.s.top > this.s.oTop)
			{
				this.remove = true;
				this.s.top = this.s.oTop;
			}
		}
	}
}
function doDoor(s:Sector) {
	if (s.top - s.bottom > .1)
		entities.push(new DoorDoer(s, true));
	else
		entities.push(new DoorDoer(s, false));
}