var key = new Object();

window.onkeydown = function (e) {
    key[String.fromCharCode(e.keyCode)] = true;
};
window.onkeyup = function (e) {
    delete key[String.fromCharCode(e.keyCode)];
};
//@ sourceMappingURL=input.js.map
