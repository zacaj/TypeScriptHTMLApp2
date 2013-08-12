var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="WebGL.d.ts" />
///<reference path="player.ts" />
///<reference path="math.ts" />
var gl;
var ShaderProgramTex, ShaderProgramColor, VertexPositionTex, VertexTexture, MultPosition, ColorPosition;
var vertBuffer, uvBuffer;
var perspectivePT, transformPT;
var perspectivePC, transformPC;

var Entity = (function () {
    function Entity(p) {
        this.r = 1;
        this.z = 0;
        this.p = (p);
        this.s = getSector(this.p);
    }
    Entity.prototype.update = function () {
    };
    return Entity;
})();
var entities = new Array();
var Entity3D = (function (_super) {
    __extends(Entity3D, _super);
    function Entity3D(p) {
        this.angle = 0;
        _super.call(this, p);
    }
    return Entity3D;
})(Entity);
var Wall = (function () {
    function Wall() {
        this.s = null;
        this.textureName = "";
        this.portal = null;
        this.isPortal = false;
        this.left = null;
        this.right = null;
    }
    return Wall;
})();
var walls = new Array();
var Sector = (function () {
    function Sector() {
        this.sectors = new Array();
        this.extendedWalls = new Array();
    }
    Sector.prototype.pointIsIn = function (p) {
        return pointInPolygon(p, this.pts);
    };
    Sector.prototype.draw = function () {
        gl.uniform1f(MultPosition, 1);
        gl.uniform3f(ColorPosition, 0, 0, 0);
        for (var i = 0; i < this.walls.length; i++) {
            var wall = this.walls[i];
            if (wall.isPortal) {
                var s = wall.portal;
                if (s.bottom > this.bottom)
                    quad(wall.a, wall.b, this.bottom, s.bottom, getTex(wall.textureName));
                if (s.top < this.top)
                    quad(wall.a, wall.b, s.top, this.top, getTex(wall.textureName));
            } else
                quad(wall.a, wall.b, this.bottom, this.top, getTex(wall.textureName));
        }
        gl.uniform1f(MultPosition, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorBuffer);
        gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(VertexTexture, 2, gl.FLOAT, false, 0, 0);
        gl.uniform3f(ColorPosition, this.floorColor.r, this.floorColor.g, this.floorColor.b);
        gl.drawArrays(gl.TRIANGLES, 0, this.tris.length * 3);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ceilingBuffer);
        gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
        gl.uniform3f(ColorPosition, this.ceilingColor.r / 255, this.ceilingColor.g / 255, this.ceilingColor.b / 255);
        gl.drawArrays(gl.TRIANGLES, 0, this.tris.length * 3);
    };
    Sector.prototype.createBuffers = function () {
        var floorVerts = new Array();
        var ceilingVerts = new Array();
        var uvs = new Array();
        for (var i = 0; i < this.tris.length; i++) {
            floorVerts.push(this.tris[i].points_[0].x);
            floorVerts.push(this.bottom);
            floorVerts.push(this.tris[i].points_[0].y);
            floorVerts.push(this.tris[i].points_[1].x);
            floorVerts.push(this.bottom);
            floorVerts.push(this.tris[i].points_[1].y);
            floorVerts.push(this.tris[i].points_[2].x);
            floorVerts.push(this.bottom);
            floorVerts.push(this.tris[i].points_[2].y);
            for (var j = 0; j < 6; j++)
                uvs.push(0);
            ceilingVerts.push(this.tris[i].points_[0].x);
            ceilingVerts.push(this.top);
            ceilingVerts.push(this.tris[i].points_[0].y);
            ceilingVerts.push(this.tris[i].points_[1].x);
            ceilingVerts.push(this.top);
            ceilingVerts.push(this.tris[i].points_[1].y);
            ceilingVerts.push(this.tris[i].points_[2].x);
            ceilingVerts.push(this.top);
            ceilingVerts.push(this.tris[i].points_[2].y);
        }
        this.floorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorBuffer);
        gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVerts), gl.STATIC_DRAW);
        this.ceilingBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ceilingBuffer);
        gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ceilingVerts), gl.STATIC_DRAW);
        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(VertexTexture, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    };
    return Sector;
})();
var sectors = new Array();
function getSector(p) {
    for (var i = 0; i < sectors.length; i++) {
        if (sectors[i].pointIsIn(p))
            return sectors[i];
    }
    return null;
}
window.onload = function () {
    gl = (document.getElementById('canvas')).getContext("webgl");
    if (!gl) {
        gl = (document.getElementById('canvas')).getContext("experimental-webgl");
        if (!gl)
            alert("your browser does not support webgl");
    }
    initGL();
    load((document.getElementById("frmFile")).contentWindow.document.body.childNodes[0].innerHTML);
};
function loaded() {
    setInterval(update, 17);
}
function update() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(perspectivePT, false, MakePerspective(90, 4 / 3, 1, 1000));
    gl.uniformMatrix4fv(transformPT, false, MakeTransform());
    for (var i = 0; i < sectors.length; i++)
        sectors[i].draw();
    for (var i = 0; i < entities.length; i++) {
        entities[i].update();
        if (!entities[i].s.pointIsIn(entities[i].p)) {
            var t = getSector(entities[i].p);
            if (t != null)
                entities[i].s = t;
        }
    }
}
function quad(a, b, bottom, top, texId) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texId);
    gl.uniform1i(gl.getUniformLocation(ShaderProgramTex, "uSampler"), 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([a.x, top, a.y, a.x, bottom, a.y, b.x, top, b.y, b.x, bottom, b.y]), gl.STREAM_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(VertexTexture, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
var loadedTextures = new Object();
function getTex(name) {
    if (loadedTextures[name])
        return loadedTextures[name];
    alert(name + "is not loaded");
}
function initGL() {
    var FShader = document.getElementById("FragmentShader");
    var VShader = document.getElementById("VertexShader");

    if (!FShader || !VShader)
        alert("Error, Could Not Find Shaders"); else {
        //Load and Compile Fragment Shader
        var TCode = LoadShader(FShader);
        FShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(FShader, TCode);
        gl.compileShader(FShader);

        //Load and Compile Vertex Shader
        var VCode = LoadShader(VShader);
        VShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(VShader, VCode);
        gl.compileShader(VShader);

        //Create The Shader Program
        ShaderProgramTex = gl.createProgram();
        gl.attachShader(ShaderProgramTex, FShader);
        gl.attachShader(ShaderProgramTex, VShader);
        gl.linkProgram(ShaderProgramTex);
        gl.useProgram(ShaderProgramTex);

        //Link Vertex Position Attribute from Shader
        VertexPositionTex = gl.getAttribLocation(ShaderProgramTex, "VertexPosition");
        gl.enableVertexAttribArray(VertexPositionTex);

        //Link Texture Coordinate Attribute from Shader
        VertexTexture = gl.getAttribLocation(ShaderProgramTex, "TextureCoord");
        gl.enableVertexAttribArray(VertexTexture);

        perspectivePT = gl.getUniformLocation(ShaderProgramTex, "PerspectiveMatrix");
        transformPT = gl.getUniformLocation(ShaderProgramTex, "TransformationMatrix");

        //Link Texture Coordinate Attribute from Shader
        ColorPosition = gl.getUniformLocation(ShaderProgramTex, "color");
        MultPosition = gl.getUniformLocation(ShaderProgramTex, "texMult");
    }
    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(VertexTexture, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]), gl.STATIC_DRAW);
    vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
}

function MakePerspective(FOV, AspectRatio, Closest, Farest) {
    var YLimit = Closest * Math.tan(FOV * Math.PI / 360);
    var A = -(Farest + Closest) / (Farest - Closest);
    var B = -2 * Farest * Closest / (Farest - Closest);
    var C = (2 * Closest) / ((YLimit * AspectRatio) * 2);
    var D = (2 * Closest) / (YLimit * 2);
    return [
        C,
        0,
        0,
        0,
        0,
        D,
        0,
        0,
        0,
        0,
        A,
        -1,
        0,
        0,
        B,
        0
    ];
}
function MakeTransform() {
    var a = (player.angle - 90) * Math.PI / 180;
    var rot = [
        Math.cos(a),
        0,
        Math.cos(a - Math.PI / 2),
        0,
        0,
        1,
        0,
        0,
        Math.sin(a),
        0,
        Math.sin(a - Math.PI / 2),
        0,
        player.p.x,
        player.z,
        player.p.y,
        1
    ];

    return transpose(inverse(transpose(rot)));
    var t = [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        -player.p.x,
        -player.z,
        -player.p.y,
        1
    ];
    return multMatrix(rot, t);
}
function LoadShader(Script) {
    var Code = "";
    var CurrentChild = Script.firstChild;
    while (CurrentChild) {
        if (CurrentChild.nodeType == CurrentChild.TEXT_NODE)
            Code += CurrentChild.textContent;
        CurrentChild = CurrentChild.nextSibling;
    }
    return Code;
}
function LoadTexture(names) {
    if (names.length == 0) {
        loaded();
        return;
    }
    var Img = new Image();
    Img.onload = function () {
        //Create a new Texture and Assign it as the active one
        var TempTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, TempTex);

        //Flip Positive Y (Optional)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        //Load in The Image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Img);

        //Setup Scaling properties
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        //Unbind the texture and return it.
        gl.bindTexture(gl.TEXTURE_2D, null);
        loadedTextures[name] = TempTex;
        LoadTexture(names);
    };
    Img.onerror = function () {
        alert("error");
    };
    var name = names[0];
    names.splice(0, 1);
    Img.src = name;
}
;
function otherWallWithPoint(wall, p, list, inSector) {
    if (!list)
        list = walls;
    if (!inSector)
        inSector = false;
    for (var i = 0; i < list.length; i++) {
        if (list[i] == wall)
            continue;
        if (list[i].s != null && !inSector)
            continue;
        if (list[i].a.dist(p) < .1 || list[i].b.dist(p) < .1)
            return list[i];
    }
    return null;
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 256,
        g: parseInt(result[2], 16) / 256,
        b: parseInt(result[3], 16) / 256
    } : null;
}
function isLeft(a, b, c) {
    return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
}
function load(str) {
    var textures = new Array();
    walls.splice(0, walls.length);
    sectors.splice(0, sectors.length);
    entities.splice(0, entities.length);
    lpts = new Array();
    var lines = str.split('\n');
    var nWall = parseInt(lines[0]);
    for (var i = 0; i < nWall; i++) {
        var wall = new Wall();
        wall.a = getVec2(lines[i * 4 + 0 + 1]);
        wall.b = getVec2(lines[i * 4 + 1 + 1]);
        (wall).t = getVec2(lines[i * 4 + 2 + 1]);
        wall.textureName = lines[i * 4 + 3 + 1].split(',')[1];
        if (textures.indexOf(wall.textureName) == -1)
            textures.push(wall.textureName);
        walls.push(wall);
    }
    var at = nWall * 4 + 1;
    var nSector = parseInt(lines[at]);
    at++;
    for (var i = 0; i < nSector; i++) {
        var s = new Sector();
        s.walls = new Array();
        nWall = parseInt(lines[at++]);
        for (var j = 0; j < nWall; j++)
            s.walls.push(walls[lines[at + j]]);
        at += nWall;
        var t = getVec2(lines[at++]);
        s.bottom = t.x;
        s.top = t.y;
        t = lines[at++].split(',');
        s.floorColor = hexToRgb(t[0]);
        s.ceilingColor = hexToRgb(t[1]);
        var nP = parseInt(lines[at++]);
        s.pts = new Array();
        for (var j = 0; j < nP; j++) {
            s.pts.push(getVec2(lines[at++]));
        }
        var nT = parseInt(lines[at++]);
        s.tris = new Array();
        for (var j = 0; j < nT; j++) {
            var t = lines[at++].split(',');
            s.tris.push(makeTri(s.pts[t[0]], s.pts[t[1]], s.pts[t[2]]));
        }
        s.p = getVec2(lines[at++]);
        sectors.push(s);
        s.extendedWalls = s.extendedWalls.concat(s.walls);
    }
    for (var i = 0; i < walls.length; i++) {
        var t = (walls[i]).t;
        walls[i].s = sectors[t.x];
        if (t.y != -1) {
            walls[i].portal = sectors[t.y];
            walls[i].isPortal = true;
            if (walls[i].s.sectors.indexOf(sectors[t.y]) == -1) {
                walls[i].s.sectors.push(sectors[t.y]);
                walls[i].s.extendedWalls = walls[i].s.extendedWalls.concat(sectors[t.y].walls);
            }
        }
        var wall = walls[i];
        var dir = wall.b.minus(wall.a);
        dir.normalize();
        var n = new vec2(-dir.y, dir.x);
        var pt = wall.a.plus(n);
        if (!wall.s.pointIsIn(pt)) {
            n.x = -n.x;
            n.y = -n.y;
        }
        wall.n = n;
    }
    for (var i = 0; i < sectors.length; i++) {
        s.pts.splice(0, s.pts.length);
        var lastWall = s.walls[0];
        var pt = lastWall.b;
        s.pts.push(pt);
        while (true) {
            var wa = otherWallWithPoint(lastWall, pt, s.walls, true);
            if (wa == null) {
                alert("no closed loop!");
                break;
            }
            if (wa == s.walls[0])
                break;
            if (wa.a.dist(pt) < .1)
                pt = wa.b; else
                pt = wa.a;
            s.pts.push(pt);
            lastWall = wa;
        }
        sectors[i].createBuffers();
    }
    var nEntity = parseInt(lines[at++]);
    for (var i = 0; i < nEntity; i++) {
        var str = lines[at++].split(',')[1];
        var p = getVec2(lines[at++]);
        var type = str.split('\n')[0];
        if (type == "spawn")
            entities.push(new Player(p));
    }

    LoadTexture(textures);
}
var lpts;
function getVec2(str) {
    var strs = str.split(',');
    var v = new vec2(parseFloat(strs[0]), parseFloat(strs[1]));
    for (var i = 0; i < lpts.length; i++)
        if (lpts[i].dist(v) < .1)
            return lpts[i];
    lpts.push(v);
    return v;
}
function makeTri(a, b, c) {
    var r = new Triangle();
    (r).points_ = new Array();
    (r).points_.push(a);
    (r).points_.push(b);
    (r).points_.push(c);
    return r;
}
//@ sourceMappingURL=app.js.map
