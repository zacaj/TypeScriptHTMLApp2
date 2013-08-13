var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="math.ts" />
///<reference path="app.ts" />
var Entity = (function () {
    function Entity(p) {
        this.r = 1;
        this.gravity = .3;
        this.z = 0;
        this.p = (p);
        this.s = getSector(this.p);
    }
    Entity.prototype.update = function () {
        if (this.z - this.s.bottom > this.gravity)
            this.z -= this.gravity;
    };

    Entity.prototype.draw = function () {
    };
    Entity.prototype.collideWithWalls = function (n) {
        var dp = new vec2(n.x - this.p.x, n.y - this.p.y);
        var md = dp.dist(new vec2(0, 0));
        if (md > .00000000001) {
            var sd = 999999;
            var w;
            for (var i = 0; i < this.s.extendedWalls.length; i++) {
                var d = distToSegmentSquared(n, this.s.extendedWalls[i].a, this.s.extendedWalls[i].b);
                if (d < sd) {
                    sd = d;
                    w = this.s.extendedWalls[i];
                }
            }

            if (sd <= this.r * this.r && ((w.isPortal == true && w.portal.bottom - this.z > 2.1) || w.isPortal == false)) {
                sd = Math.sqrt(sd);
                var dp = new vec2(n.x - this.p.x, n.y - this.p.y);
                var wp = projectPoint(n, w.a, w.b);
                this.p = wp.plus(w.n.scale(this.r));
                return true;
            } else {
                this.p = n;
                return false;
            }
        }
    };
    return Entity;
})();
var entities = new Array();
var Entity3D = (function (_super) {
    __extends(Entity3D, _super);
    function Entity3D(p) {
        _super.call(this, p);
        this.verticalTrans = 0;
        this.d = new vec2(10, 10);
        this.angle = 0;
    }
    Entity3D.prototype.draw = function () {
        var n = this.p.minus(projectPoint(this.p, player.vpa, player.vpb));
        n.normalize();
        n = n.scale(this.d.x / 2);
        var a = new vec2(n.y, -n.x).plus(this.p);
        var b = new vec2(-n.y, n.x).plus(this.p);
        n = this.p.minus(player.p);
        n.normalize();
        var a2p = Math.atan2(n.y, n.x);
        a2p += this.angle * Math.PI / 180;
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
    };
    Entity3D.prototype.update = function () {
    };
    return Entity3D;
})(Entity);
var BillboardEntity = (function (_super) {
    __extends(BillboardEntity, _super);
    function BillboardEntity(p, tex) {
        _super.call(this, p);
        this.d = new vec2(1, 1);
        this.tex = tex;
    }
    BillboardEntity.prototype.draw = function () {
        var n = this.p.minus(projectPoint(this.p, player.vpa, player.vpb));
        n.normalize();
        n = n.scale(this.d.x / 1);
        var a = new vec2(n.y, -n.x).plus(this.p);
        var b = new vec2(-n.y, n.x).plus(this.p);
        quad(b, a, this.z, this.z + this.d.y, this.tex);
    };
    return BillboardEntity;
})(Entity);
var Arrow = (function (_super) {
    __extends(Arrow, _super);
    function Arrow(yaw, pitch, p, z) {
        _super.call(this, p);
        this.stuck = false;
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
        this.tex = getTex("arrows.png");
        this.nSide = 16;
        this.z = z;
        this.v.scale(.06);
        this.vz *= .8;
    }
    Arrow.prototype.update = function () {
        if (this.stuck == false) {
            this.z += this.vz;
            this.vz += -.024;

            var p = Math.abs(this.vz) / Math.sqrt(this.v.x * this.v.x + this.v.y * this.v.y + this.vz * this.vz);
            var i;
            if (p > .99)
                i = 0; else if (p > .8)
                i = 1; else if (p > .45)
                i = 2; else
                i = 3;
            if (this.vz >= 0)
                i = 6 - i;
            this.verticalTrans = i * .125;

            var n = this.p.plus(this.v);
            if (this.collideWithWalls(n) == true)
                this.stuck = true;
            if (this.z + this.d.y * .125 + this.d.y * .875 / 2 < this.s.bottom) {
                this.z = this.s.bottom - this.d.y * .875 / 2;
                this.stuck = true;
            }
            if (this.z - this.d.y * .875 / 2 > this.s.top) {
                this.z = this.s.top + this.d.y * .875 / 2;
                this.stuck = true;
            }
        }
    };
    return Arrow;
})(Entity3D);
//@ sourceMappingURL=entity.js.map
