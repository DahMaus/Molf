const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let StartPos = [0, 0];
var GolfPos = [0, 0];
let vx = 0;
let vy = 0;

let walls = [];
let sand = [];
let platforms = [];
let fans = [];
let goal = { x: 0, y: 0, r: 25 };
let CurrentLevel = 0;
let Finished = false;

const Levels = [
    {
        start: [50, 92],
        goal: { x: 50, y: 8 },
        walls: [
            { x: 0,  y: 75, w: 70, h: 2 },
            { x: 30, y: 55, w: 70, h: 2 },
            { x: 0,  y: 35, w: 70, h: 2 },
            { x: 35, y: 20, w: 30, h: 2 },
        ],
        sand: [],
        platforms: [],
        fans: [],
    },
    {
        start: [50, 92],
        goal: { x: 85, y: 8 },
        walls: [
            { x: 0,  y: 80, w: 40, h: 2 },
            { x: 60, y: 80, w: 40, h: 2 },
            { x: 0,  y: 48, w: 30, h: 2 },
            { x: 70, y: 48, w: 30, h: 2 },
            { x: 20, y: 30, w: 80, h: 2 },
        ],
        sand: [
            { x: 0,  y: 62, w: 100, h: 12 },
            { x: 55, y: 2,  w: 45,  h: 14 },
        ],
        platforms: [
            { x: 30, y: 48, w: 20, h: 2, axis: "x", range: 20, speed: 2 },
        ],
        fans: [],
    },
    {
        start: [15, 92],
        goal: { x: 85, y: 6 },
        walls: [
            { x: 0,  y: 78, w: 65, h: 2 },
            { x: 35, y: 60, w: 65, h: 2 },
            { x: 0,  y: 35, w: 35, h: 2 },
            { x: 65, y: 35, w: 35, h: 2 },
        ],
        sand: [
            { x: 40, y: 84, w: 25, h: 10 },
        ],
        platforms: [
            { x: 48, y: 30, w: 4, h: 12, axis: "y", range: 10, speed: 1.5 },
        ],
        fans: [
            { x: 0,  y: 62, w: 35, h: 16, fx: 0,    fy: -0.2 },
            { x: 50, y: 10, w: 50, h: 20, fx: 0.25, fy: 0 },
        ],
    },
];

function LoadLevel(i){
    const L = Levels[i];
    StartPos = [L.start[0] / 100 * canvas.width, L.start[1] / 100 * canvas.height];
    GolfPos = [StartPos[0], StartPos[1]];
    vx = 0;
    vy = 0;
    walls = L.walls;
    sand = L.sand;
    platforms = L.platforms;
    fans = L.fans;
    goal = {
        x: L.goal.x / 100 * canvas.width,
        y: L.goal.y / 100 * canvas.height,
        r: 25,
    };
}

function ToPixels(o){
    return {
        x: o.x / 100 * canvas.width,
        y: o.y / 100 * canvas.height,
        w: o.w / 100 * canvas.width,
        h: o.h / 100 * canvas.height,
    };
}

function GetPlatformRect(p, time){
    const offset = Math.sin(time / 1000 * p.speed) * p.range / 2;
    return ToPixels({
        x: p.axis === "x" ? p.x + offset : p.x,
        y: p.axis === "y" ? p.y + offset : p.y,
        w: p.w,
        h: p.h,
    });
}

function GetSolids(time){
    const solids = walls.map(ToPixels);
    for (const p of platforms) solids.push(GetPlatformRect(p, time));
    return solids;
}

function InRect(pos, r){
    return pos[0] > r.x && pos[0] < r.x + r.w && pos[1] > r.y && pos[1] < r.y + r.h;
}

function DrawGolfBall(time){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    DrawSand();
    DrawFans();
    DrawGoal();
    DrawWalls(time);
    ctx.beginPath();
    ctx.arc(GolfPos[0], GolfPos[1], 15, 0, 2 * Math.PI);

    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";

    ctx.fillStyle = "white";
    ctx.fill();

    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("Level " + (CurrentLevel + 1) + " / " + Levels.length, 15, 35);

    if (Finished) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Thanks for playing!", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left";
    }
}

function DrawSand(){
    ctx.fillStyle = "khaki";
    for (const s of sand) {
        const r = ToPixels(s);
        ctx.fillRect(r.x, r.y, r.w, r.h);
    }
}

function DrawFans(){
    for (const f of fans) {
        const r = ToPixels(f);
        ctx.fillStyle = "rgba(120, 190, 255, 0.4)";
        ctx.fillRect(r.x, r.y, r.w, r.h);

        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const len = Math.min(r.w, r.h) / 2;
        const mag = Math.hypot(f.fx, f.fy);
        const ex = cx + f.fx / mag * len;
        const ey = cy + f.fy / mag * len;

        ctx.beginPath();
        ctx.moveTo(cx - f.fx / mag * len, cy - f.fy / mag * len);
        ctx.lineTo(ex, ey);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "steelblue";
        ctx.stroke();

        const ang = Math.atan2(f.fy, f.fx);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 18 * Math.cos(ang - 0.5), ey - 18 * Math.sin(ang - 0.5));
        ctx.lineTo(ex - 18 * Math.cos(ang + 0.5), ey - 18 * Math.sin(ang + 0.5));
        ctx.closePath();
        ctx.fillStyle = "steelblue";
        ctx.fill();
    }
}

function DrawGoal(){
    ctx.beginPath();
    ctx.arc(goal.x, goal.y, goal.r, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.beginPath();
    ctx.stroke();
}

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

function IsMoving(){
    return Math.hypot(vx, vy) > 0.1;
}

function golf(start, end){
    if (Finished) return;
    if (IsMoving()) return;

    const dx = start[0] - end[0];
    const dy = start[1] - end[1];
    const power = Math.hypot(dx, dy);
    if (power < 20) return;

    vx = dx * 0.08;
    vy = dy * 0.08;
}

function Update(time){
    if (!IsMoving()) {
        vx = 0;
        vy = 0;
        [vx, vy] = WallCollision(vx, vy, time);
        return;
    }

    for (const f of fans) {
        if (InRect(GolfPos, ToPixels(f))) {
            vx += f.fx;
            vy += f.fy;
        }
    }

    const sub = Math.ceil(Math.hypot(vx, vy) / 5);

    for (let i = 0; i < sub; i++) {
        GolfPos[0] += vx / sub;
        GolfPos[1] += vy / sub;

        if (GolfPos[0] < 15) { GolfPos[0] = 15; vx *= -1; }
        if (GolfPos[0] > canvas.width - 15) { GolfPos[0] = canvas.width - 15; vx *= -1; }
        if (GolfPos[1] < 15) { GolfPos[1] = 15; vy *= -1; }
        if (GolfPos[1] > canvas.height - 15) { GolfPos[1] = canvas.height - 15; vy *= -1; }

        [vx, vy] = WallCollision(vx, vy, time);
    }

    let friction = 0.95;
    for (const s of sand) {
        if (InRect(GolfPos, ToPixels(s))) friction = 0.85;
    }
    vx *= friction;
    vy *= friction;

    if (Math.hypot(GolfPos[0] - goal.x, GolfPos[1] - goal.y) < goal.r) {
        if (CurrentLevel === Levels.length - 1) {
            Finished = true;
            vx = 0;
            vy = 0;
        } else {
            CurrentLevel++;
            LoadLevel(CurrentLevel);
        }
    }
}

function DrawWalls(time){
    ctx.fillStyle = "#895129";
    for (const r of GetSolids(time)) {
        ctx.fillRect(r.x, r.y, r.w, r.h);
    }
}

function WallCollision(vx, vy, time){
    const r = 15;
    for (const w of GetSolids(time)) {
        const rx = w.x;
        const ry = w.y;
        const rw = w.w;
        const rh = w.h;

        const cx = Math.max(rx, Math.min(GolfPos[0], rx + rw));
        const cy = Math.max(ry, Math.min(GolfPos[1], ry + rh));

        const dx = GolfPos[0] - cx;
        const dy = GolfPos[1] - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < r && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;

            GolfPos[0] = cx + nx * r;
            GolfPos[1] = cy + ny * r;

            const dot = vx * nx + vy * ny;
            if (dot < 0) {
                vx -= 2 * dot * nx;
                vy -= 2 * dot * ny;
            }
        }
    }
    return [vx, vy];
}

function Loop(time){
    Update(time);
    DrawGolfBall(time);
    requestAnimationFrame(Loop);
}

LoadLevel(CurrentLevel);
requestAnimationFrame(Loop);