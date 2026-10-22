const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let StartPos = [225,750]

function golfBall(){
    ctx.beginPath();
    //      x    y size opa opa2?
    ctx.arc(StartPos.at(0), StartPos.at(1), 15, 0, 2 * Math.PI);

    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";

    ctx.fillStyle = "white";
    ctx.fill();

    ctx.stroke();
}

golfBall();