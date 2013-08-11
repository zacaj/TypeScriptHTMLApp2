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
        player = this;
        this.z = 5;
    }
    Player.prototype.update = function () {
        if (key["A"])
            this.angle += 5;
        if (key["D"])
            this.angle -= 5;
        if (key["W"]) {
            this.p.x += Math.cos(this.angle * Math.PI / 180);
            this.p.y += Math.sin(this.angle * Math.PI / 180);
        }
        if (key["S"]) {
            this.p.x -= Math.cos(this.angle * Math.PI / 180);
            this.p.y -= Math.sin(this.angle * Math.PI / 180);
        }
    };
    return Player;
})(Entity3D);
//@ sourceMappingURL=player.js.map
