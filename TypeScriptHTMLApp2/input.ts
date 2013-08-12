﻿var key = new Object();
///<reference path="player.ts" />

window.onkeydown=function(e)
{
    key[String.fromCharCode(e.keyCode)]=true;
}
window.onkeyup=function(e)
{
    delete key[String.fromCharCode(e.keyCode)];
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
	player.angle -= movementX*.6;
}
var locked: bool = false;
function monmousedown(e: MouseEvent) {
	e.preventDefault();
	if (locked == false)
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

	}
}
function monmouseup(e: MouseEvent) {
	e.preventDefault();
	
	if (e.button == 0)
	{

	}
	else if (e.button == 2)
	{

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