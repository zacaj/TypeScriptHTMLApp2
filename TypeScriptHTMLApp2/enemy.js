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
        this.route = null;
        this.height = 5;
        this.angle = 0;
        this.nSide = 8;
        this.tex = getTex("LB_SS_NPC01.png");
        this.r = 1.5;
    }
    Enemy.prototype.update = function () {
        if (this.route) {
            if (this.route.length == 0)
                this.route = null; else {
                var ne = copyvec2(this.p);
                var n = this.route[0].minus(this.p);
                n.normalize();
                if (this.p.dist(this.route[0]) < .81)
                    n = n.scale(this.p.dist(this.route[0])); else
                    n = n.scale(.8);
                this.angle = Math.atan2(n.y, n.x);
                ne = ne.plus(n);
                this.collideWithWalls(ne);
                document.getElementById("debug").innerHTML = "" + this.p.x + ", " + this.p.y;
                var d = this.p.dist(this.route[0]);
                if (d < .1)
                    this.route.splice(0, 1);
            }
        }
        _super.prototype.update.call(this);
        if (this.z - this.s.bottom < -.3)
            this.z += .3;
        if (keypressed["G"])
            this.goto(player.p);
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
