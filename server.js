const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

let players = {}; //Store all connected players

wss.on('connection', (ws) => {
    console.log('A player connected');

    ws.on('message', (message) => {
        let data = JSON.parse(message);

        if (data.type === 'join') {
            players[data.id] = { x: 100, y: 100 }; //Default position
            BroadcastChannel({ type: 'updatePlayers', players });
        }

        if (data.type === 'move') {
            if (players[data.id]) {
                players[data.id].x = data.x;
                players[data.id].y = data.y;
                BroadcastChannel({ type: 'updatePlayers', players });
            }
        }
    });

    ws.on('close', () => {
        console.log('A player disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(3000, () => console.log('Server running on port: 3000'));