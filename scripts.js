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
    const power = Math.hypot(dx, dy);
    if (power < 20) return;

    let vx = dx * 0.08;
    let vy = dy * 0.08;

    function step(){
        GolfPos[0] += vx;
        GolfPos[1] += vy;

        if (GolfPos[0] < 15) { GolfPos[0] = 15; vx *= -1; }
        if (GolfPos[0] > canvas.width - 15) { GolfPos[0] = canvas.width - 15; vx *= -1; }
        if (GolfPos[1] < 15) { GolfPos[1] = 15; vy *= -1; }
        if (GolfPos[1] > canvas.height - 15) { GolfPos[1] = canvas.height - 15; vy *= -1; }

        vx *= 0.95;
        vy *= 0.95;
        DrawGolfBall();
        if (Math.hypot(vx, vy) > 0.1) requestAnimationFrame(step);
    }
    step();
}