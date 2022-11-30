const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (client, req) => {
	console.log('connected');
	client.onmessage = (message) => {
		const data = JSON.parse(message.data);
		console.log('data:', data);
	};
	client.onclose = (event) => {
		console.log('closed');
	};
	client.send(JSON.stringify({ event: 'handshake', payload: 'green' }));
});

server.on('upgrade', (req, socket, head) => {
	wss.handleUpgrade(req, socket, head, function done(ws) {
		wss.emit('connection', ws, req);
	});
});

app.use('/', express.static('dist'));

const port = process.env.NODE_ENV === 'prod' ? process.env.PORT : 3000;
server.listen(port, () => {
	console.log(`listening on *:${port}`);
});
