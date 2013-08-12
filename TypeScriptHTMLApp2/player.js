var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="app.ts" />
///<reference path="input.ts" />
var player;
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(p) {
        _super.call(this, p);
        this.height = 5;
        this.vpa = new vec2(0, 0);
        this.vpb = new vec2(0, 0);
        player = this;
        this.z = 0;
        this.r = 1.5;
    }
    Player.prototype.update = function () {
        if (key["Q"])
            this.angle += 5;
        if (key["E"])
            this.angle -= 5;
        var n = copyvec2(this.p);
        if (key["W"]) {
            n.x += Math.cos(this.angle * Math.PI / 180);
            n.y += Math.sin(this.angle * Math.PI / 180);
        }
        if (key["S"]) {
            n.x -= Math.cos(this.angle * Math.PI / 180);
            n.y -= Math.sin(this.angle * Math.PI / 180);
        }
        if (key["A"]) {
            n.x += Math.cos(this.angle * Math.PI / 180 + Math.PI / 2);
            n.y += Math.sin(this.angle * Math.PI / 180 + Math.PI / 2);
        }
        if (key["D"]) {
            n.x += Math.cos(this.angle * Math.PI / 180 - Math.PI / 2);
            n.y += Math.sin(this.angle * Math.PI / 180 - Math.PI / 2);
        }
        if (key["C"]) {
            this.height = 3;
        } else {
            this.height = 5;
        }
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
        } else if (this.z - this.s.bottom < -.3)
            this.z += .3;
        _super.prototype.update.call(this);
        this.vpa.x = this.p.x + Math.cos(this.angle * Math.PI / 180 + Math.PI / 2) * 10000;
        this.vpa.y = this.p.y + Math.sin(this.angle * Math.PI / 180 + Math.PI / 2) * 10000;
        this.vpb.x = this.p.x + Math.cos(this.angle * Math.PI / 180 - Math.PI / 2) * 10000;
        this.vpb.y = this.p.y + Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * 10000;
    };
    return Player;
})(Entity3D);
//@ sourceMappingURL=player.js.map
