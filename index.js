const port = 3000;
const clients = new Map();
let counter = 0;

function getID() {
  counter++;
  return counter;
};

Bun.serve({
  port: port,
  fetch(req, server) {
    let pathName = new URL(req.url).pathname;

    switch (pathName) {
      case "/":
        if (server.upgrade(req)) return;
        pathName = "/index.html";
        break;
    };

    const file = Bun.file("./public" + pathName);
    return new Response(file);
  },
  websocket: {
    open(ws) {
      clients.set(ws, getID());
      console.log(`Client #${clients.get(ws)} connected.`);
    },
    message(ws, message) {
      const parsedMessage = JSON.parse(message);
      const messageToBeSent = JSON.stringify({ id: clients.get(ws), message: parsedMessage });
      clients.forEach(function(v, key) {
        key.send(messageToBeSent);
      })
    },
    close(ws) {
      console.log(`Client #${clients.get(ws)} disconnected.`);
      clients.delete(ws);
    },
  },
  error() {
    return new Response(null, { status: 404 });
  },
});

console.log(`Server listening on port ${port}`);