var key = new Object();

///<reference path="player.ts" />
window.onkeydown = function (e) {
    key[String.fromCharCode(e.keyCode)] = true;
};
window.onkeyup = function (e) {
    delete key[String.fromCharCode(e.keyCode)];
};
function monmousemove(e) {
    e.preventDefault();
    var movementX = (e).movementX || (e).mozMovementX || (e).webkitMovementX || 0, movementY = (e).movementY || (e).mozMovementY || (e).webkitMovementY || 0;
    player.angle -= movementX * .6;
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
    }
}
function monmouseup(e) {
    e.preventDefault();

    if (e.button == 0) {
    } else if (e.button == 2) {
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
