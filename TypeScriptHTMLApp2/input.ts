var key = new Object();
var keypressed = new Object();
///<reference path="player.ts" />
var aiming = false;
var frame = false;
window.onkeydown=function(e)
{
	var k;
	if (e.keyCode > 31 && e.keyCode < 129)
		k = String.fromCharCode(e.keyCode);
	else if (e.keyCode == 17)
		k = "ctrl";
	else if (e.keyCode == 16)
		k = "shift";
	if (k == " ")
	{
	e.preventDefault();
		aiming = true;
		return;
	}
	key[k] = true;
	keypressed[k] = frame;
}
window.onkeyup=function(e)
{
	var k;
	if (e.keyCode > 31 && e.keyCode < 129)
		k = String.fromCharCode(e.keyCode);
	else if (e.keyCode == 17)
		k = "ctrl";
	else if (e.keyCode == 16)
		k = "shift";
	if (k == " ")
	{
	e.preventDefault();
		aiming = false;
		crosshair.p = new vec2(1024 / 2, 768 / 2);
		return;
	}
    delete key[k];
}
function monmousemove(e: MouseEvent) {
	e.preventDefault();
	var movementX = (<any>e).movementX ||
		(<any>e).mozMovementX ||
		(<any>e).webkitMovementX ||
		0,
		movementY = (<any>e).movementY ||
		(<any>e).mozMovementY ||
		(<any>e).webkitMovementY ||
		0;
	if (aiming == true)
	{
		crosshair.p.x += movementX * .9;
		crosshair.p.y += movementY * .9;
		if (crosshair.p.x < 0)
		{
			player.angle -= -(crosshair.p.x) / .9 * .008;
			crosshair.p.x = 0;
		}
		if (crosshair.p.x >1024)
		{
			player.angle+= (crosshair.p.x-1024) / .9 * .008;
			crosshair.p.x = 1024;
		}
		if (crosshair.p.y < 0)
			crosshair.p.y = 0;
		if (crosshair.p.y > 768)
			crosshair.p.y = 768;
	}
	else
	{
		player.angle += movementX * .6;
	}
}
var locked: bool = false;
function monmousedown(e: MouseEvent) {
	e.preventDefault();
	if (locked == false )
	{
		var canvas = document.getElementById("canvas");
		document.addEventListener('pointerlockchange', pointerLock, false);
		document.addEventListener('mozpointerlockchange', pointerLock, false);
		document.addEventListener('webkitpointerlockchange', pointerLock, false);
		document.addEventListener('pointerlockerror', errorCallback, false);
		document.addEventListener('mozpointerlockerror', errorCallback, false);
		document.addEventListener('webkitpointerlockerror', errorCallback, false);
		(<any>canvas).requestPointerLock = (<any>canvas).requestPointerLock ||
		(<any>canvas).mozRequestPointerLock ||
		(<any>canvas).webkitRequestPointerLock;
		// Ask the browser to lock the pointer
		(<any>canvas).requestPointerLock();
		return;
	}
	if (e.button == 0)
	{
	}
	else if (e.button == 2)
	{
		aiming = true;
	}
}
function monmouseup(e: MouseEvent) {
	e.preventDefault();
	
	if (e.button == 0)
	{
		if (aiming == true)
		{
			var yaw = (crosshair.p.x / 1024 - .5) * 111 + player.angle + Math.random() * 2 - 1;
			var pitch = ((1 - (crosshair.p.y / 768)) * 2 - 1) * 90 + Math.random() * 2 - 1;
			var arrow = new Arrow(yaw, pitch, new vec2(Math.cos(player.angle * Math.PI / 180 - Math.PI / 2) * 2.5, Math.sin(player.angle * Math.PI / 180 - Math.PI / 2)*2.5).plus(player.p),1);
			entities.push(arrow);
		}

	}
	else if (e.button == 2)
	{
		aiming = false;
		crosshair.p = new vec2(1024/2, 768/2);
	}
}
function moncontextmenu(e: MouseEvent) {
	e.preventDefault();
}
function pointerLock(e) {
	var canvas = document.getElementById("canvas");
	if ((<any>document).pointerLockElement === canvas ||
		(<any>document).mozPointerLockElement === canvas ||
		(<any>document).webkitPointerLockElement === canvas) {
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
function initInput(canvas: HTMLCanvasElement) {
	var havePointerLock = 'pointerLockElement' in document ||
		'mozPointerLockElement' in document ||
		'webkitPointerLockElement' in document;
	if (!havePointerLock)
		alert("your browser does not support mouse lock");
	//canvas.onmousemove = monmousemove;
	canvas.oncontextmenu = moncontextmenu;
	canvas.onmousedown = monmousedown;
	canvas.onmouseup = monmouseup;
	

}