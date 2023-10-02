const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const protocol = "ws://";
const socket = new WebSocket(protocol + "localhost:3000");
const players = new Map();

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false
};

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 50,
  color: "#9e6900",
  speed: 5
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

socket.addEventListener("open", () => {
  console.log("Connected to server.");
    socket.send(JSON.stringify({ x: player.x, y: player.y }));
});

socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  player.id = message.id;
  if (players.get(player.id) !== message.message) {
    players.set(player.id, message.message);
  }
});

function drawShape(x, y, r, sides, color = "#000000", borderColor = "#000000") {
  ctx.fillStyle = color;
  ctx.strokeStyle = borderColor;
  ctx.translate(x, y);
  ctx.beginPath();
  if (sides === 0) {
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
  }
  else {
    for (let i = 0; i < sides; i++) {
      const rotation = ((Math.PI * 2) / sides) * i;

      if (i === 0) ctx.moveTo(r * Math.cos(rotation), r * Math.sin(rotation));
      else ctx.lineTo(r * Math.cos(rotation), r * Math.sin(rotation));
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.resetTransform();
}

function handleKeyDown(event) {
  const code = event.code;
  if (code in keys) keys[code] = true;
}

function handleKeyUp(event) {
  const code = event.code;
  if (code in keys) keys[code] = false;
}

function move() {
  if (keys.ArrowUp || keys.KeyW) {
    player.y -= player.speed;
  }
  if (keys.ArrowDown || keys.KeyS) {
    player.y += player.speed;
  }
  if (keys.ArrowLeft || keys.KeyA) {
    player.x -= player.speed;
  }
  if (keys.ArrowRight || keys.KeyD) {
    player.x += player.speed;
  }

  if (socket.readyState) {
    socket.send(JSON.stringify({ x: player.x, y: player.y }));
  }
}

function renderPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let i of players) {
    let pos = i[1];
    drawShape(pos.x, pos.y, player.radius, 7, player.color);
  }
}

function update() {
  move();
  renderPlayers();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

update();