const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Simulate a task with progress updates
const simulateTask = (duration, ws) => {
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            ws.send(`Progress: ${progress}%`);

            if (progress >= 100) {
                clearInterval(interval);
                resolve(`Task completed after ${duration / 1000} seconds.`);
            }
        }, duration / 5); // Update progress 5 times
    });
};

// Endpoint to start the loading process
app.post('/start-loading', async (req, res) => {
    const { duration } = req.body;

    if (!duration || isNaN(duration)) {
        return res.status(400).json({ error: 'Invalid duration provided.' });
    }

    try {
        console.log('Task started...');
        const ws = new WebSocket('ws://localhost:8080');
        ws.on('open', async () => {
            const result = await simulateTask(duration, ws);
            ws.send(result);
            ws.close();
            res.json({ message: result });
        });
    } catch (error) {
        console.error('Error during task:', error);
        res.status(500).json({ error: 'An error occurred during the task.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});