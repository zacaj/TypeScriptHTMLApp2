﻿var key = new Object();

///<reference path="player.ts" />
var aiming = false;
window.onkeydown = function (e) {
    key[String.fromCharCode(e.keyCode)] = true;
};
window.onkeyup = function (e) {
    delete key[String.fromCharCode(e.keyCode)];
};
function monmousemove(e) {
    e.preventDefault();
    var movementX = (e).movementX || (e).mozMovementX || (e).webkitMovementX || 0, movementY = (e).movementY || (e).mozMovementY || (e).webkitMovementY || 0;
    if (aiming == true) {
        crosshair.p.x += movementX * .9;
        crosshair.p.y += movementY * .9;
        if (crosshair.p.x < 0) {
            player.angle += -(crosshair.p.x) / .9 * .008;
            crosshair.p.x = 0;
        }
        if (crosshair.p.x > 1024) {
            player.angle -= (crosshair.p.x - 1024) / .9 * .008;
            crosshair.p.x = 1024;
        }
        if (crosshair.p.y < 0)
            crosshair.p.y = 0;
        if (crosshair.p.y > 768)
            crosshair.p.y = 768;
    } else {
        player.angle -= movementX * .6;
    }
}
var locked = false;
function monmousedown(e) {
    e.preventDefault();
    if (locked == false) {
        var canvas = document.getElementById("canvas");
        document.addEventListener('pointerlockchange', pointerLock, false);
        document.addEventListener('mozpointerlockchange', pointerLock, false);
        document.addEventListener('webkitpointerlockchange', pointerLock, false);
        document.addEventListener('pointerlockerror', errorCallback, false);
        document.addEventListener('mozpointerlockerror', errorCallback, false);
        document.addEventListener('webkitpointerlockerror', errorCallback, false);
        (canvas).requestPointerLock = (canvas).requestPointerLock || (canvas).mozRequestPointerLock || (canvas).webkitRequestPointerLock;

        // Ask the browser to lock the pointer
        (canvas).requestPointerLock();
        return;
    }
    if (e.button == 0) {
    } else if (e.button == 2) {
        aiming = true;
    }
}
function monmouseup(e) {
    e.preventDefault();

    if (e.button == 0) {
        if (aiming == true) {
            var yaw = (-crosshair.p.x / 1024 + .5) * 105 + player.angle + Math.random() * 4 - 2;
            var pitch = ((1 - (crosshair.p.y / 768)) * 2 - 1) * 90 + Math.random() * 4 - 2;
            var arrow = new Arrow(yaw, pitch, new vec2(Math.cos(player.angle * Math.PI / 180 - Math.PI / 2) * 2.5, Math.sin(player.angle * Math.PI / 180 - Math.PI / 2) * 2.5).plus(player.p), 1);
            entities.push(arrow);
        }
    } else if (e.button == 2) {
        aiming = false;
        crosshair.p = new vec2(1024 / 2, 768 / 2);
    }
}
function moncontextmenu(e) {
    e.preventDefault();
}
function pointerLock(e) {
    var canvas = document.getElementById("canvas");
    if ((document).pointerLockElement === canvas || (document).mozPointerLockElement === canvas || (document).webkitPointerLockElement === canvas) {
        // Pointer was just locked
        // Enable the mousemove listener
        document.addEventListener("mousemove", monmousemove, false);
        locked = true;
    } else {
        // Pointer was just unlocked
        // Disable the mousemove listener
        document.removeEventListener("mousemove", monmousemove, false);
        locked = false;
    }
}
function errorCallback() {
    var i;
}
function initInput(canvas) {
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (!havePointerLock)
        alert("your browser does not support mouse lock");

    //canvas.onmousemove = monmousemove;
    canvas.oncontextmenu = moncontextmenu;
    canvas.onmousedown = monmousedown;
    canvas.onmouseup = monmouseup;
}
//@ sourceMappingURL=input.js.map
