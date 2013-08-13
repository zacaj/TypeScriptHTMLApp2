var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="app.ts" />
///<reference path="input.ts" />
///<reference path="entity.ts" />
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
        if (aiming == false) {
            if (key["Q"])
                this.angle += 5;
            if (key["E"])
                this.angle -= 5;
        }
        var n = copyvec2(this.p);
        var aimScale = 1;
        if (aiming == true)
            aimScale = .03;
        if (key["W"]) {
            n.x += Math.cos(this.angle * Math.PI / 180) * aimScale;
            n.y += Math.sin(this.angle * Math.PI / 180) * aimScale;
        }
        if (key["S"]) {
            n.x -= Math.cos(this.angle * Math.PI / 180) * aimScale;
            n.y -= Math.sin(this.angle * Math.PI / 180) * aimScale;
        }
        if (key["A"]) {
            n.x += Math.cos(this.angle * Math.PI / 180 + Math.PI / 2) * aimScale;
            n.y += Math.sin(this.angle * Math.PI / 180 + Math.PI / 2) * aimScale;
        }
        if (key["D"]) {
            n.x += Math.cos(this.angle * Math.PI / 180 - Math.PI / 2) * aimScale;
            n.y += Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * aimScale;
        }
        if (key["C"]) {
            this.height = 3;
            n.x += 1;
        } else {
            this.height = 5;
        }
        this.collideWithWalls(n);
        if (this.z - this.s.bottom < -.3)
            this.z += .3;
        _super.prototype.update.call(this);
        this.vpa.x = this.p.x + Math.cos(this.angle * Math.PI / 180 + Math.PI / 2) * 10000;
        this.vpa.y = this.p.y + Math.sin(this.angle * Math.PI / 180 + Math.PI / 2) * 10000;
        this.vpb.x = this.p.x + Math.cos(this.angle * Math.PI / 180 - Math.PI / 2) * 10000;
        this.vpb.y = this.p.y + Math.sin(this.angle * Math.PI / 180 - Math.PI / 2) * 10000;
    };
    Player.prototype.draw = function () {
    };
    return Player;
})(Entity3D);
//@ sourceMappingURL=player.js.map
