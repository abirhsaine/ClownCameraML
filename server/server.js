const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../')));

wss.on('connection', (ws) => {
	console.log('Client connected');

	ws.on('message', (message) => {
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	});

	ws.on('close', () => {
		console.log('Client déconnecté');
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, 'localhost', () => {
	console.log(`Serveur web démarré sur le port ${PORT} : http://localhost:${PORT}`);
});