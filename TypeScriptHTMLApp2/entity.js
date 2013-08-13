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
            } else {
                this.p = n;
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
        gl.uniform2f(TranPosition, a2p, 0);
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
//@ sourceMappingURL=entity.js.map
