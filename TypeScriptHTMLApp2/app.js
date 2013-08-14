///<reference path="WebGL.d.ts" />
///<reference path="player.ts" />
///<reference path="math.ts" />
///<reference path="entity.ts" />
///<reference path="input.ts" />
///<reference path="enemy.ts" />
var gl;
var ShaderProgramTex, ShaderProgramColor, VertexPositionTex, VertexTexture, MultPosition, ColorPosition, ScalePosition, TranPosition, TransPosition;
var vertBuffer, uvBuffer;
var perspectivePT, transformPT;
var perspectivePC, transformPC;

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
        this.neighbors = new Array();
        this.extendedWalls = new Array();
    }
    Sector.prototype.pointIsIn = function (p) {
        return pointInPolygon(p, this.pts);
    };
    Sector.prototype.draw = function () {
        gl.uniform1f(MultPosition, 1);
        gl.uniform4f(ColorPosition, 0, 0, 0, 0);
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
        gl.uniform1f(TransPosition, this.bottom);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorBuffer);
        gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(VertexTexture, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4f(ColorPosition, this.floorColor.r, this.floorColor.g, this.floorColor.b, 1);
        gl.drawArrays(gl.TRIANGLES, 0, this.tris.length * 3);
        gl.uniform1f(TransPosition, this.top);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorBuffer);
        gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
        gl.uniform4f(ColorPosition, this.ceilingColor.r, this.ceilingColor.g, this.ceilingColor.b, 1);
        gl.drawArrays(gl.TRIANGLES, 0, this.tris.length * 3);
        gl.uniform1f(TransPosition, 0);
    };
    Sector.prototype.createBuffers = function () {
        var floorVerts = new Array();
        var uvs = new Array();
        for (var i = 0; i < this.tris.length; i++) {
            floorVerts.push(this.tris[i].points_[0].x);
            floorVerts.push(0);
            floorVerts.push(this.tris[i].points_[0].y);
            floorVerts.push(this.tris[i].points_[1].x);
            floorVerts.push(0);
            floorVerts.push(this.tris[i].points_[1].y);
            floorVerts.push(this.tris[i].points_[2].x);
            floorVerts.push(0);
            floorVerts.push(this.tris[i].points_[2].y);
            for (var j = 0; j < 6; j++)
                uvs.push(0);
        }
        this.floorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.floorBuffer);
        gl.vertexAttribPointer(VertexPositionTex, 3, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVerts), gl.STATIC_DRAW);
        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(VertexTexture, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    };
    return Sector;
})();
var sectors = new Array();
var GUI = (function () {
    function GUI() {
    }
    GUI.prototype.draw = function () {
        var a = new vec2(this.p.x - this.d.x / 2, .9);
        var b = new vec2(this.p.x + this.d.x / 2, .9);
        quad(a, b, this.p.y - this.d.y / 2, this.p.y + this.d.y / 2, this.tex);
    };
    return GUI;
})();
var guis = new Array();
var crosshair;
function getSector(p) {
    for (var i = 0; i < sectors.length; i++) {
        if (sectors[i].pointIsIn(p))
            return sectors[i];
    }
    return null;
}
window.onload = function () {
    var canvas = (document.getElementById('canvas'));
    gl = (document.getElementById('canvas')).getContext("webgl");
    if (!gl) {
        gl = (document.getElementById('canvas')).getContext("experimental-webgl");
        if (!gl)
            alert("your browser does not support webgl");
    }
    initGL();
    initInput(canvas);
    load((document.getElementById("frmFile")).contentWindow.document.body.childNodes[0].innerHTML);
};
function loaded() {
    loadEntities();
    crosshair = new GUI();
    crosshair.p = new vec2(1024 / 2, 768 / 2);
    crosshair.d = new vec2(35 * 2, 24 * 2);
    crosshair.tex = getTex("LB_Crosshair.png");
    guis.push(crosshair);

    //var bb = new BillboardEntity(player.p.plus(new vec2(30, 30)), getTex("LB_Bow01.png"));
    //entities.push(bb);
    /*var en = new Entity3D(player.p.plus(new vec2(10, 0)));
    en.tex = getTex("LB_SS_NPC01.png");
    en.nSide = 8;
    en.angle = 90;
    entities.push(en);*/
    entities.push(new Enemy(player.p.plus(new vec2(10, 10))));

    /*var ar = new Entity3D(player.p.plus(new vec2(10, 10)));
    ar.tex = getTex("arrowlevel.png");
    ar.nSide = 16;
    ar.angle = 45;
    entities.push(ar);*/
    //for(var i = 0; i < walls.length;i++)
    /*entities.push(new Target(walls[walls.length-3], 7.5, function () {
    doDoor(sectors[1]);
    }));
    entities.push(new Button(walls[walls.length - 1], function () {
    doDoor(sectors[1]);
    }));*/
    //addGrass(player.p.plus(new vec2(5, 5)));
    setInterval(update, 17);
}
function update() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.uniformMatrix4fv(perspectivePT, false, MakePerspective(90, 4 / 3, 1, 1000));
    gl.uniformMatrix4fv(transformPT, false, MakeTransform());
    for (var i = 0; i < sectors.length; i++)
        sectors[i].draw();
    gl.uniform1f(MultPosition, 1);
    gl.uniform4f(ColorPosition, 0, 0, 0, 0);
    for (var i = 0; i < entities.length; i++) {
        entities[i].update();
        if (entities[i].remove == true) {
            entities.splice(i, 1);
            i--;
            continue;
        }
        if (!entities[i].s.pointIsIn(entities[i].p)) {
            var t = getSector(entities[i].p);
            if (t != null)
                entities[i].s = t;
        }
        entities[i].draw();
    }
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1f(MultPosition, 1);
    gl.uniform4f(ColorPosition, 0, 0, 0, 0);
    gl.uniformMatrix4fv(transformPT, false, [
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
        0,
        0,
        0,
        1
    ]);
    gl.uniformMatrix4fv(perspectivePT, false, makeOrtho(0, 1024, 768, 0, -1, 1));
    for (var i = 0; i < guis.length; i++)
        guis[i].draw();
    for (var propt in keypressed) {
        if (keypressed[propt] != frame)
            delete keypressed[propt];
    }
    frame = !frame;
}
function quad(a, b, bottom, top, tex) {
    tex.bind();
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
var Texture = (function () {
    function Texture() {
        this.s = new vec2(0, 0);
    }
    Texture.prototype.bind = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.id);
        gl.uniform1i(gl.getUniformLocation(ShaderProgramTex, "uSampler"), 0);
        gl.uniform2f(ScalePosition, this.s.x, this.s.y);
    };
    return Texture;
})();
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
        ScalePosition = gl.getUniformLocation(ShaderProgramTex, "texScale");
        TranPosition = gl.getUniformLocation(ShaderProgramTex, "texTran");
        TransPosition = gl.getUniformLocation(ShaderProgramTex, "trans");
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
    gl.enable(gl.BLEND);
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
    /*var mat = axisAngle(0, 1, 0, player.angle);
    mat[12] = player.p.x;
    mat[13] = player.z + player.height;
    mat[14] = player.p.y;
    return transpose(inverse(transpose(mat)));*/
    var a = (-player.angle) * Math.PI / 180;
    var rot = [
        Math.cos(a - Math.PI / 2),
        0,
        Math.cos(a),
        0,
        0,
        1,
        0,
        0,
        Math.sin(a - Math.PI / 2),
        0,
        Math.sin(a),
        0,
        player.p.x,
        (player.z + player.height),
        player.p.y,
        1
    ];

    return transpose(inverse(transpose(rot)));
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
    var sx = names[1];
    var sy = names[2];
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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        //Unbind the texture and return it.
        gl.bindTexture(gl.TEXTURE_2D, null);
        var tex = new Texture();
        tex.id = TempTex;
        tex.name = name;
        tex.w = Img.width;
        tex.h = Img.height;
        if (sx == 0)
            tex.s.x = 1; else
            tex.s.x = sx / tex.w;
        if (sy == 0)
            tex.s.y = 1; else
            tex.s.y = sy / tex.h;
        loadedTextures[name] = tex;
        LoadTexture(names);
    };
    Img.onerror = function () {
        alert("error");
    };
    var name = names[0];
    names.splice(0, 3);
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
var lines, at;
function load(str) {
    var textures = ["LB_Crosshair.png", 35, 24, "LB_Bow01.png", 475, 208, "LB_SS_NPC01.png", 128, 0, "arrows.png", 256, 256, "LB_Target.png", 44, 44, "LB_Grass02.png", 78, 122, "LB_Grass01.png", 91, 128, "LB_Button01Off.png", 11, 11, "LB_Button01On.png", 11, 11];
    walls.splice(0, walls.length);
    sectors.splice(0, sectors.length);
    entities.splice(0, entities.length);
    guis.splice(0, guis.length);
    lpts = new Array();
    lines = str.split('\n');
    var nWall = parseInt(lines[0]);
    for (var i = 0; i < nWall; i++) {
        var wall = new Wall();
        wall.a = getVec2(lines[i * 4 + 0 + 1]);
        wall.b = getVec2(lines[i * 4 + 1 + 1]);
        (wall).t = getVec2(lines[i * 4 + 2 + 1]);
        wall.textureName = lines[i * 4 + 3 + 1].split(',')[1];
        if (textures.indexOf(wall.textureName) == -1) {
            textures.push(wall.textureName);
            textures.push(0);
            textures.push(0);
        }
        walls.push(wall);
    }
    at = nWall * 4 + 1;
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
        s.oBottom = s.bottom;
        s.oTop = s.top;
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
            var t3 = lines[at++].split(',');
            s.tris.push(makeTri(s.pts[t3[0]], s.pts[t3[1]], s.pts[t3[2]]));
        }
        s.p = getVec2(lines[at++]);
        sectors.push(s);
        s.extendedWalls = s.extendedWalls.concat(s.walls);
    }
    for (var i = 0; i < walls.length; i++) {
        var t2 = (walls[i]).t;
        walls[i].s = sectors[t2.x];
        if (t2.y != -1) {
            walls[i].portal = sectors[t2.y];
            walls[i].isPortal = true;
            if (walls[i].s.neighbors.indexOf(sectors[t2.y]) == -1) {
                walls[i].s.neighbors.push(sectors[t2.y]);
                walls[i].s.extendedWalls = walls[i].s.extendedWalls.concat(sectors[t2.y].walls);
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
        for (var j = 0; j < sectors[i].tris.length; j++)
            sectors[i].tris[j].getNeighbors(sectors[i].tris);
    }
    LoadTexture(textures);
}
function loadEntities() {
    var nEntity = parseInt(lines[at++]);
    for (var i = 0; i < nEntity; i++) {
        var strln = lines[at++];
        var str = strln.split(',')[1];
        var l = parseInt(strln.split(',')[0]);
        while (l > str.length) {
            str = str + "\n" + lines[at++];
        }
        var p = getVec2(lines[at++]);
        var data = str.split('\n');
        var type = data[0];
        if (type == "spawn")
            entities.push(new Player(p));
        if (type == "g")
            addGrass(p);
        if (type == "btn") {
            var s = sectors[parseInt(data[1])];
            entities.push(new Button(getClosestWall(p), function () {
                doDoor(s);
            }));
        }
        if (type == "trgt") {
            var s = sectors[parseInt(data[1])];
            var h = parseFloat(data[2]);
            var r = parseFloat(data[3]);
            entities.push(new Target(getClosestWall(p), h, function () {
                doDoor(s);
            }, r));
        }
    }
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
function getClosestWall(p) {
    var d = 999999;
    var w = null;
    for (var i = 0; i < walls.length; i++) {
        var d2 = distToSegmentSquared(p, walls[i].a, walls[i].b);
        if (d2 < d) {
            d = d2;
            w = walls[i];
        }
    }
    return w;
}
//@ sourceMappingURL=app.js.map
