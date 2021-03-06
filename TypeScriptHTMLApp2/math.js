﻿var vec2 = (function () {
    function vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    vec2.prototype.dist = function (p) {
        var d = new vec2(p.x - this.x, p.y - this.y);
        return Math.sqrt(d.x * d.x + d.y * d.y);
    };
    vec2.prototype.minus = function (v) {
        var r = new vec2(this.x - v.x, this.y - v.y);
        return r;
    };
    vec2.prototype.plus = function (v) {
        return new vec2(this.x + v.x, this.y + v.y);
    };
    vec2.prototype.magnitude = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    vec2.prototype.normalize = function () {
        var m = this.magnitude();
        this.x /= m;
        this.y /= m;
    };
    vec2.prototype.scale = function (n) {
        return new vec2(this.x * n, this.y * n);
    };
    return vec2;
})();
function copyvec2(p) {
    return new vec2(p.x, p.y);
}
function raycast(from, to, z1, z2, fs, ts) {
    var currentSector = fs;
    var p = copyvec2(from);
    var d = to.minus(from).scale(.1);
    var sectors = [fs];
    for (var i = 0; i < 10; i++) {
        p = p.plus(d);
        if (currentSector.pointIsIn(p) == false) {
            currentSector = getSector(p) || getSector(p.plus(d.scale(.01)));
            if (currentSector == null)
                return false;
            if (sectors.indexOf(currentSector) == -1)
                sectors.push(currentSector);
        }
    }
    for (var i = 0; i < sectors.length; i++) {
        for (var j = 0; j < sectors[i].walls.length; j++) {
            var wall = sectors[i].walls[j];
            if (lineLine(from, to, sectors[i].walls[j].a, sectors[i].walls[j].b) == true) {
                if (wall.isPortal == true) {
                    var ipt = lineLineIntersection(from, to, sectors[i].walls[j].a, sectors[i].walls[j].b);
                    var percent = ipt.dist(from) / to.dist(from);
                    var z = percent * (z2 - z1) + z1;
                    var bottom = Math.max(wall.s.bottom, wall.portal.bottom);
                    var top = Math.min(wall.s.top, wall.portal.top);
                    if (z < bottom || z > top)
                        return false;
                } else
                    return false;
            }
        }
    }
    return true;
}
function lineLineIntersection(ps1, pe1, ps2, pe2) {
    // Get A,B,C of first line - points : ps1 to pe1
    var A1 = pe1.y - ps1.y;
    var B1 = ps1.x - pe1.x;
    var C1 = A1 * ps1.x + B1 * ps1.y;

    // Get A,B,C of second line - points : ps2 to pe2
    var A2 = pe2.y - ps2.y;
    var B2 = ps2.x - pe2.x;
    var C2 = A2 * ps2.x + B2 * ps2.y;

    // Get delta and check if the lines are parallel
    var delta = A1 * B2 - A2 * B1;
    if (delta == 0)
        return null;

    // now return the Vector2 intersection point
    return new vec2((B2 * C1 - B1 * C2) / delta, (A1 * C2 - A2 * C1) / delta);
}
var Triangle = (function () {
    function Triangle() {
        this.neighbors = new Array();
    }
    Triangle.prototype.sign = function (p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };
    Triangle.prototype.pointIsIn = function (pt) {
        var b1, b2, b3;

        b1 = this.sign(pt, this.points_[0], this.points_[1]) < 0.0;
        b2 = this.sign(pt, this.points_[1], this.points_[2]) < 0.0;
        b3 = this.sign(pt, this.points_[2], this.points_[0]) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    };
    Triangle.prototype.getNeighbors = function (tris) {
        for (var i = 0; i < tris.length; i++) {
            var tri = tris[i];
            if (tri == this)
                continue;
            var common = 0;
            for (var j = 0; j < this.points_.length; j++) {
                var k = tri.points_.indexOf(this.points_[j]);
                if (k != -1)
                    common++;
            }
            if (common == 2)
                this.neighbors.push(tri);
        }
    };
    return Triangle;
})();
function pointInPolygon(p, pts) {
    var i, j = pts.length - 1;
    var oddNodes = false;

    for (i = 0; i < pts.length; i++) {
        if (pts[i].y < p.y && pts[j].y >= p.y || pts[j].y < p.y && pts[i].y >= p.y) {
            if (pts[i].x + (p.y - pts[i].y) / (pts[j].y - pts[i].y) * (pts[j].x - pts[i].x) < p.x) {
                oddNodes = !oddNodes;
            }
        }
        j = i;
    }

    return oddNodes;
}
function multMatrix(a, b) {
    var r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
    r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
    r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
    r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

    r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
    r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
    r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
    r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

    r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
    r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
    r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
    r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

    r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
    r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
    r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
    r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
    return r;
}
function inverse(m) {
    var a0 = m[0] * m[5] - m[1] * m[4];
    var a1 = m[0] * m[6] - m[2] * m[4];
    var a2 = m[0] * m[7] - m[3] * m[4];
    var a3 = m[1] * m[6] - m[2] * m[5];
    var a4 = m[1] * m[7] - m[3] * m[5];
    var a5 = m[2] * m[7] - m[3] * m[6];
    var b0 = m[8] * m[13] - m[9] * m[12];
    var b1 = m[8] * m[14] - m[10] * m[12];
    var b2 = m[8] * m[15] - m[11] * m[12];
    var b3 = m[9] * m[14] - m[10] * m[13];
    var b4 = m[9] * m[15] - m[11] * m[13];
    var b5 = m[10] * m[15] - m[11] * m[14];

    var inverse = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;

     {
        //Matrix4 inverse;
        inverse[0] = +m[5] * b5 - m[6] * b4 + m[7] * b3;
        inverse[4] = -m[4] * b5 + m[6] * b2 - m[7] * b1;
        inverse[8] = +m[4] * b4 - m[5] * b2 + m[7] * b0;
        inverse[12] = -m[4] * b3 + m[5] * b1 - m[6] * b0;
        inverse[1] = -m[1] * b5 + m[2] * b4 - m[3] * b3;
        inverse[5] = +m[0] * b5 - m[2] * b2 + m[3] * b1;
        inverse[9] = -m[0] * b4 + m[1] * b2 - m[3] * b0;
        inverse[13] = +m[0] * b3 - m[1] * b1 + m[2] * b0;
        inverse[2] = +m[13] * a5 - m[14] * a4 + m[15] * a3;
        inverse[6] = -m[12] * a5 + m[14] * a2 - m[15] * a1;
        inverse[10] = +m[12] * a4 - m[13] * a2 + m[15] * a0;
        inverse[14] = -m[12] * a3 + m[13] * a1 - m[14] * a0;
        inverse[3] = -m[9] * a5 + m[10] * a4 - m[11] * a3;
        inverse[7] = +m[8] * a5 - m[10] * a2 + m[11] * a1;
        inverse[11] = -m[8] * a4 + m[9] * a2 - m[11] * a0;
        inverse[15] = +m[8] * a3 - m[9] * a1 + m[10] * a0;

        var invDet = (1) / det;
        inverse[0] *= invDet;
        inverse[1] *= invDet;
        inverse[2] *= invDet;
        inverse[3] *= invDet;
        inverse[4] *= invDet;
        inverse[5] *= invDet;
        inverse[6] *= invDet;
        inverse[7] *= invDet;
        inverse[8] *= invDet;
        inverse[9] *= invDet;
        inverse[10] *= invDet;
        inverse[11] *= invDet;
        inverse[12] *= invDet;
        inverse[13] *= invDet;
        inverse[14] *= invDet;
        inverse[15] *= invDet;

        return inverse;
    }
}
function transpose(m) {
    var r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    r[0] = m[0];
    r[1] = m[4];
    r[2] = m[8];
    r[3] = m[12];
    r[4] = m[1];
    r[5] = m[5];
    r[6] = m[9];
    r[7] = m[13];
    r[8] = m[2];
    r[9] = m[6];
    r[10] = m[10];
    r[11] = m[14];
    r[12] = m[3];
    r[13] = m[7];
    r[14] = m[11];
    r[15] = m[15];
    return r;
}
function sqr(x) {
    return x * x;
}
function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y);
}
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0)
        return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0)
        return dist2(p, v);
    if (t > 1)
        return dist2(p, w);
    return dist2(p, {
        x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y)
    });
}
function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}
function projectPoint(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0)
        return copyvec2(v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0)
        return copyvec2(v);
    if (t > 1)
        return copyvec2(w);
    return new vec2(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
}
function makeOrtho(left, right, bottom, top, zNear, zFar) {
    var m = [
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
    m[0] = 2 / (right - left);
    m[4] = m[8] = 0;
    m[3] = -(right + left) / (right - left);
    m[1] = 0;
    m[5] = 2 / (top - bottom);
    m[9] = 0;
    m[7] = -(top + bottom) / (top - bottom);
    m[2] = m[6] = 0;
    m[10] = -2 / (zFar - zNear);
    m[11] = -(zFar + zNear) / (zFar - zNear);
    m[12] = m[13] = m[14] = 0;
    m[15] = 1;
    return transpose(m);
}
function axisAngle(x, y, z, angle) {
    var m = [
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
    var axis = { x: x, y: y, z: z };
    var c = Math.cos(angle * Math.PI / 180);
    var s = Math.sin(angle * Math.PI / 180);
    var t = 1. - c;

    //  if axis is not already normalized then uncomment this
    // double magnitude = Math.sqrt(a1.x*a1.x + a1.y*a1.y + a1.z*a1.z);
    // if (magnitude==0) throw error;
    // a1.x /= magnitude;
    // a1.y /= magnitude;
    // a1.z /= magnitude;
    m[0] = c + axis.x * axis.x * t;
    m[5] = c + axis.y * axis.y * t;
    m[10] = c + axis.z * axis.z * t;

    var tmp1 = axis.x * axis.y * t;
    var tmp2 = axis.z * s;
    m[4] = tmp1 + tmp2;
    m[1] = tmp1 - tmp2;
    tmp1 = axis.x * axis.z * t;
    tmp2 = axis.y * s;
    m[8] = tmp1 - tmp2;
    m[2] = tmp1 + tmp2;
    tmp1 = axis.y * axis.z * t;
    tmp2 = axis.x * s;
    m[9] = tmp1 + tmp2;
    m[6] = tmp1 - tmp2;
    return transpose(m);
}

function lineLine(a, b, c, d) {
    var r = ((a.y - c.y) * (d.x - c.x) - (a.x - c.x) * (d.y - c.y)) / ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x));
    var s = ((a.y - c.y) * (b.x - a.x) - (a.x - c.x) * (b.y - a.y)) / ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x));
    if (r >= 0 && r <= 1 && s >= 0 && s <= 1)
        return true; else
        return false;
}

function angleBetween(x, y) {
    x = x * Math.PI / 180;
    y = y * Math.PI / 180;
    return Math.atan2(Math.sin(x - y), Math.cos(x - y)) * 180 / Math.PI;
}
//@ sourceMappingURL=math.js.map
