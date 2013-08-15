var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(p) {
        _super.call(this, p);
        this.height = 5;
        this.route = null;
        this.aimFrame = 0;
        this.lastSeen = null;
        this.angle = 0;
        this.nSide = 8;
        this.tex = getTex("LB_NPC03.png");
        this.r = 1.5;
        this.target = player;
        this.lastSeen = this.p;
        this.verticalTrans = .75;
    }
    Enemy.prototype.update = function () {
        if (this.state)
            this.state(); else {
            if (this.canSeePlayerFrom(this.p) == true) {
                this.goto(player.p);
                document.getElementById("debug").innerHTML += "<br>saw player, goto";
            } else if (this.p.dist(this.lastSeen) > 10) {
                this.goto(this.lastSeen);
                document.getElementById("debug").innerHTML += "<br>cant see player, going to last position";
            }
            this.aimFrame--;
        }
        if (key["G"]) {
            if (!this.route || this.route[this.route.length - 1].dist(player.p) > 50) {
                this.goto(player.p);
                document.getElementById("debug").innerHTML += "<br>force player left dest, redest";
            }
        }
        _super.prototype.update.call(this);
        if (this.z - this.s.bottom < -.3)
            this.z += .3;
    };
    Enemy.prototype.aim = function () {
        if ((this.p.dist(this.target.p) > 80 || this.canSeePlayerFrom(this.p) == false) && this.aimFrame < -50) {
            document.getElementById("debug").innerHTML += "<br>too far from target";
            this.goto(this.lastSeen);
        }
        this.aimFrame--;
        var tAngle = Math.atan2(this.target.p.y - this.p.y, this.target.p.x - this.p.x) * 180 / Math.PI;
        if (Math.abs(tAngle - this.angle) < 5)
            this.angle = tAngle; else if (tAngle > this.angle)
            this.angle += 5; else
            this.angle -= 5;
        if (this.aimFrame < -100 && Math.abs(tAngle - this.angle) < 20) {
            document.getElementById("debug").innerHTML += "<br>firing";
            this.aimFrame = 200;
            var yaw = this.angle + Math.random() * 1.5 - .75;
            var pitch = 30;
            var arrow = new Arrow(yaw, pitch, new vec2(Math.cos(this.angle * Math.PI / 180 - Math.PI / 2) * 2.5, Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * 2.5).plus(this.p), 1, .6);
            entities.push(arrow);
        }
    };
    Enemy.prototype.navigate = function () {
         {
            if (this.route[this.route.length - 1].dist(player.p) > 50) {
                this.goto(player.p);
                document.getElementById("debug").innerHTML += "<br>player left dest, redest";
            }
        }
        if (this.route.length == 0 || (this.p.dist(this.route[this.route.length - 1]) < 75 && this.canSeePlayerFrom(this.p) == true)) {
            this.route = null;
            this.state = null;
            document.getElementById("debug").innerHTML += "<br>reached dest";
            if (this.p.dist(player.p) < 77) {
                this.state = this.aim;
                document.getElementById("debug").innerHTML += "<br>aim";
            }
        } else {
            var ne = copyvec2(this.p);
            var n = this.route[0].minus(this.p);
            n.normalize();
            if (this.p.dist(this.route[0]) < .81)
                n = n.scale(this.p.dist(this.route[0])); else
                n = n.scale(.8);
            this.angle = Math.atan2(n.y, n.x);
            ne = ne.plus(n);
            this.collideWithWalls(ne);

            //document.getElementById("debug").innerHTML = "" + this.p.x + ", " + this.p.y;
            var d = this.p.dist(this.route[0]);
            if (d < .1)
                this.route.splice(0, 1);
        }
    };
    Enemy.prototype.canSeePlayerFrom = function (p) {
        var r = getSector(p) == player.s;
        if (r == true)
            this.lastSeen = copyvec2(player.p);
        return r;
    };
    Enemy.prototype.recursiveSearch = function (path, target) {
        var s = path[path.length - 1];
        for (var i = 0; i < s.neighbors.length; i++) {
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
    };
    Enemy.prototype.pathfindInSector = function (from, target, portal, s, lastSector, route) {
        var j;
        for (j = 0; j < s.walls.length; j++) {
            if (s.walls[j] == portal || (lastSector != null && s.walls[j].portal == lastSector))
                continue;
            if (lineLine(from, target, s.walls[j].a, s.walls[j].b) == true)
                break;
        }
        if (j == s.walls.length)
            route.push(target); else {
            var startTri = null;
            var endTri = null;
            for (var i = 0; i < s.tris.length; i++) {
                if (s.tris[i].pointIsIn(from)) {
                    startTri = s.tris[i];
                }
                if (s.tris[i].pointIsIn(target))
                    endTri = s.tris[i];
                if (startTri != null && endTri != null)
                    break;
            }

            var tris = this.recursiveSearch([startTri], endTri);
            for (var i = 1; i < tris.length - 1; i++) {
                route.push(tris[i].center);
            }
            route.push(target);
        }
    };
    Enemy.prototype.goto = function (p) {
        var route = new Array();
        p = copyvec2(p);
        var targetSector = getSector(p);
        this.state = this.navigate;
        if (this.s == targetSector) {
            this.pathfindInSector(this.p, p, null, targetSector, null, route);
            this.route = route;
            return;
        }
        var sectors = this.recursiveSearch([this.s], targetSector);
        if (sectors == null)
            alert("no path!"); else {
            var lastSector = null;
            var lastWaypoint = this.p;
            var lastPortal = null;
            for (var i = 0; i < sectors.length - 1; i++) {
                var s = sectors[i];
                var to = null;
                var portal = null;
                for (var j = 0; j < s.walls.length; j++) {
                    if (s.walls[j].portal == sectors[i + 1]) {
                        to = s.walls[j].a.plus(s.walls[j].b.minus(s.walls[j].a).scale(Math.random() * .6 + .2));
                        portal = s.walls[j];
                        break;
                    }
                }
                if (to == null)
                    alert("boom!"); else {
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
    };
    return Enemy;
})(Entity3D);
//@ sourceMappingURL=enemy.js.map
