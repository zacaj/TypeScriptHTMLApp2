///<reference path="WebGL.d.ts" />
var gl;
var ShaderProgram, VertexPosition, VertexTexture;
var vertBuffer, uvBuffer;
var perspectiveP, transformP;
var vec2 = (function () {
    function vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    vec2.prototype.dist = function (p) {
        var d = new vec2(p.x - this.x, p.y - this.y);
        return Math.sqrt(d.x * d.x + d.y * d.y);
    };
    return vec2;
})();
function copyvec2(p) {
    return new vec2(p.x, p.y);
}

window.onload = function () {
    gl = (document.getElementById('canvas')).getContext("webgl");
    if (!gl) {
        gl = (document.getElementById('canvas')).getContext("experimental-webgl");
        if (!gl)
            alert("your browser does not support webgl");
    }
    initGL();
    LoadTexture(["texture.bmp"]);
};
function loaded() {
    setInterval(update, 17);
}
function update() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(perspectiveP, false, MakePerspective(90, 4 / 3, 1, 1000));
    gl.uniformMatrix4fv(transformP, false, MakeTransform());
    quad(new vec2(-5, -5), new vec2(5, -5), -3, 3, getTex("texture.bmp"));
}
function quad(a, b, bottom, top, texId) {
    gl.bindTexture(gl.TEXTURE_2D, texId);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([a.x, top, a.y, a.x, bottom, a.y, b.x, top, b.y, b.x, bottom, b.y]), gl.STREAM_DRAW);
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
        var Code = LoadShader(FShader);
        FShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(FShader, Code);
        gl.compileShader(FShader);

        //Load and Compile Vertex Shader
        Code = LoadShader(VShader);
        VShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(VShader, Code);
        gl.compileShader(VShader);

        //Create The Shader Program
        ShaderProgram = gl.createProgram();
        gl.attachShader(ShaderProgram, FShader);
        gl.attachShader(ShaderProgram, VShader);
        gl.linkProgram(ShaderProgram);
        gl.useProgram(ShaderProgram);

        //Link Vertex Position Attribute from Shader
        VertexPosition = gl.getAttribLocation(this.ShaderProgram, "VertexPosition");
        gl.enableVertexAttribArray(this.VertexPosition);

        //Link Texture Coordinate Attribute from Shader
        VertexTexture = gl.getAttribLocation(this.ShaderProgram, "TextureCoord");
        gl.enableVertexAttribArray(this.VertexTexture);

        perspectiveP = gl.getUniformLocation(ShaderProgram, "PerspectiveMatrix");
        transformP = gl.getUniformLocation(ShaderProgram, "TransformationMatrix");
    }
    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(VertexTexture, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]), gl.STATIC_DRAW);
    vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.vertexAttribPointer(VertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.clearColor(1, 0, 0, 1);
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
    return [
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
    ];
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
//@ sourceMappingURL=Copy of app.js.map
