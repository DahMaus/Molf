const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let StartPos = [225,750]

//             x  y
var GolfPos = [StartPos[0], StartPos[1]];

function DrawGolfBall(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    //      x    y size opa opa2?
    ctx.arc(GolfPos[0], GolfPos[1], 15, 0, 2 * Math.PI);

    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";

    ctx.fillStyle = "white";
    ctx.fill();

    ctx.stroke();
}

DrawGolfBall();

let dragStart = null;

function GetPos(e) {
    const scale = canvas.width / canvas.clientWidth;
    return [e.offsetX * scale, e.offsetY * scale];
}

canvas.addEventListener("mousedown", function (e) {
    dragStart = GetPos(e);
});

window.addEventListener("mouseup", function (e) {
    if (!dragStart) return;
    const dragEnd = GetPos(e);
    golf(dragStart, dragEnd);
    dragStart = null;
});

function golf(start, end){
    const dx = start[0] - end[0];
    const dy = start[1] - end[1];

    GolfPos[0] += dx;
    GolfPos[1] += dy;

    DrawGolfBall();
}