
///<reference path="math.ts" />
///<reference path="app.ts" />
///<reference path="entity.ts" />
///<reference path="player.ts" />
interface Node {
	neighbors;
}
class Enemy extends Entity3D {
    height = 5;
    state: Function;

    route: vec2[] = null;
    dest: vec2;

    aimFrame: number=0;
    target: Entity;

    lastSeen: vec2 = null;
	constructor(p: vec2) {
		super(p);
		this.angle = 0;
		this.nSide = 8;
        this.tex = getTex("LB_NPC03.png");
        this.r = 1.5;
        this.target = player;
        this.lastSeen = this.p;
        this.verticalTrans = .75;
	}
	update() {
		/*document.getElementById("lastseen").innerHTML = "" + raycast(this.p, player.p, this.z + this.height, player.z, this.s, player.s);
		if (key["G"])
			this.p = copyvec2(player.p);
		if (0)*/
		{
			if (this.state)
				this.state();
			else
			{
				if (this.canSeePlayer() == true)
				{
					this.goto(player.p);
					document.getElementById("debug").innerHTML += "<br>saw player, goto";
				}
				else if (this.p.dist(this.lastSeen) > 10)
				{
					//this.goto(this.lastSeen);
					//document.getElementById("debug").innerHTML += "<br>cant see player, going to last position";
				}
				this.aimFrame--;
			}
			if (key["G"])
			{
				//if (!this.route || this.route[this.route.length - 1].dist(player.p) > 50)
				{
					this.goto(player.p);
					//document.getElementById("debug").innerHTML += "<br>force player left dest, redest";
				}
			}
		}
		super.update();
		if (this.z - this.s.bottom < -.3)
			this.z += .3;
		else if (this.z < this.s.bottom)
			this.z = this.s.bottom;
    }
    aim()
    {//too far away or cant see player, reloaded
        if ((this.p.dist(this.target.p) > 80 || this.canSeePlayer()==false) && this.aimFrame<-50)
        {
            document.getElementById("debug").innerHTML += "<br>too far from target";
            this.goto(this.lastSeen);
        }
        this.aimFrame--;
        var tAngle = Math.atan2(this.target.p.y - this.p.y, this.target.p.x - this.p.x)*180/Math.PI;
        if (Math.abs(tAngle - this.angle) < 5)
            this.angle = tAngle;
        else if (tAngle > this.angle)
            this.angle += 5;
        else
            this.angle -= 5;
        if (this.aimFrame < -100 && Math.abs(tAngle - this.angle) < 20)
        {
            document.getElementById("debug").innerHTML += "<br>firing";
            this.aimFrame = 200;
            var yaw = this.angle + Math.random() * 1.5 - .75;
            var pitch = 35;
            var arrow = new Arrow(yaw, pitch, new vec2(Math.cos(this.angle * Math.PI / 180 - Math.PI / 2) * 2.5, Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * 2.5).plus(this.p), 1,.7);
            entities.push(arrow);
        }
    }
    navigate()
	{
		/*
       // if (key["G"])
        {//can see dest
            if (this.route.length > 0 && this.canSee(this.route[this.route.length - 1])==true)
			{
				//player is away from dest, can see them
				if (this.canSeePlayer() == true && this.route[this.route.length - 1].dist(player.p) > 50)
                {
                    this.goto(player.p);
                    document.getElementById("debug").innerHTML += "<br>player left dest, redest";
                }//cant see them, go to last place we did
                else if(this.p.dist(this.lastSeen)>5 && this.route[this.route.length-1].dist(this.lastSeen)>5)
                {
                    this.goto(this.lastSeen);
                    document.getElementById("debug").innerHTML += "<br>player left dest, redest to last seen";
                }
            }
        }*///arrived at dest, see player
        if (this.route.length == 0 || (this.p.dist(this.route[this.route.length - 1]) < 75 && this.canSeePlayer()==true))
        {
            this.route = null;
            this.state = null; document.getElementById("debug").innerHTML += "<br>reached dest";
           /* if (this.p.dist(player.p) < 77)
            {
                this.state = this.aim;
                document.getElementById("debug").innerHTML += "<br>aim";
            }*/
           }
        else
        {
            var ne = copyvec2(this.p);
            var n = this.route[0].minus(this.p);
            n.normalize();
            if (this.p.dist(this.route[0]) < .81)
                n = n.scale(this.p.dist(this.route[0]));
            else
                n = n.scale(.8);
            this.angle = Math.atan2(n.y, n.x)*180/Math.PI;
            ne = ne.plus(n);
            this.collideWithWalls(ne);
            var d = this.p.dist(this.route[0]);
            if (d < .1)
                this.route.splice(0, 1);
        }
    }
    canSee(pt:vec2): bool
	{
		var pts = getSector(pt);
		return raycast(this.p, pt, pts.bottom + 1, this.z + this.height, this.s, pts);
    }
	canSeePlayer(): bool {
		if (key["H"] || 1)
			return false;
        var r = raycast(this.p,player.p,this.z+this.height,player.z+1,this.s,player.s);
        if (r == true)
        {
            this.lastSeen = copyvec2(player.p);
            document.getElementById("lastseen").innerHTML = "" + this.lastSeen.x + ", " + this.lastSeen.y;
        }
        return r;
    }
	recursiveSearch(path, target) {
		var s = path[path.length - 1];
		for (var i = 0; i < s.neighbors.length; i++)
		{
			if (path.indexOf(s.neighbors[i]) != -1)
				continue;
			var newpath = path.slice(0);
			newpath.push(s.neighbors[i]);
			if (s.neighbors[i] == target)
				return newpath;
			var t = this.recursiveSearch(newpath, target);
			if (t != null)
				return t;
		}
		return null;
	}
	pathfindInSector(from:vec2,target: vec2, portal: Wall, s: Sector,lastSector:Sector,route:vec2[]) {
		var j;
		for (j = 0; j < s.walls.length; j++)
		{
			if (s.walls[j] == portal || (lastSector!=null && s.walls[j].portal == lastSector))
				continue;
			if (lineLine(from, target, s.walls[j].a, s.walls[j].b) == true)
				break;
		}
		if (j == s.walls.length)
			route.push(target);
		else
		{
			var startTri = null;
			var endTri = null;
			for (var i = 0; i < s.tris.length; i++)
			{
				if (s.tris[i].pointIsIn(from))
				{
					startTri = s.tris[i];
				}
				if (s.tris[i].pointIsIn(target))
					endTri = s.tris[i];
				if (startTri != null && endTri != null)
					break;
			}
			
			var tris = this.recursiveSearch([startTri], endTri);
			for (var i = 1; i < tris.length - 1; i++)
			{
				route.push(tris[i].center);
			}
			route.push(target);
		}
	}
	goto(p: vec2) {
		var route = new Array<vec2>();
		p = copyvec2(p);
		var closestWall = getClosestWall(p);
		var closestWallPoint = projectPoint(p, closestWall.a, closestWall.b);
		var tn = p.minus(this.p);
		tn.normalize();
		var perp = new vec2(tn.y, -tn.x);
		perp.scale(this.r);
		var closestPathPointToWallPoint = projectPoint(closestWallPoint, p, this.p);
		var distFromClosestPathPointToWallPointToClosestWallPoint = closestPathPointToWallPoint.dist(closestWallPoint);
		if (distFromClosestPathPointToWallPointToClosestWallPoint <= this.r)
		{
			var percent = distFromClosestPathPointToWallPointToClosestWallPoint / this.r;
			var shift = perp.scale(percent);
			p = p.plus(shift);
		}

        var targetSector = getSector(p);
        this.state = this.navigate;
		if (this.s == targetSector)
		{
			this.pathfindInSector(this.p, p, null, targetSector,null, route);
			this.route = route;
			return;
		}
		var sectors = this.recursiveSearch([this.s], targetSector);
		if (sectors == null)
			alert("no path!");
		else
		{
			var lastSector = null;
			var lastWaypoint = this.p;
			var lastPortal = null;
			for (var i = 0; i < sectors.length - 1; i++)
			{
				var s = sectors[i];
				var to = null;
				var portal = null;
				for (var j = 0; j < s.walls.length; j++)
				{
					if (s.walls[j].portal == sectors[i + 1])
					{
						to = s.walls[j].a.plus(s.walls[j].b.minus(s.walls[j].a).scale(Math.random() * .6 + .2));
						portal = s.walls[j];
						break;
					}
				}
				if (to == null)
					alert("boom!");
				else
				{
					to = to.plus(portal.n.scale(this.r));
					this.pathfindInSector(lastWaypoint, to, portal, s, lastSector, route);
				}
				lastSector = s;
				lastWaypoint = to.minus(portal.n.scale(this.r * 3));
				route.push(lastWaypoint);
				lastPortal = portal;
			}
			this.pathfindInSector(lastWaypoint, p, null, targetSector, lastSector, route);
			this.route = route;
		}
	}
}