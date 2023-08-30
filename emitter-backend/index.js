const http = require('http');
const socketIO = require('socket.io');
const { generateMessage } = require('./utils/emitter'); // Assuming you have a separate 'emitter.js' file for the generateMessage function

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.io server running');
});

// Attach Socket.io to the HTTP server
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  // Emit messages every 10 seconds
  setInterval(() => {
    const messageCount = Math.floor(Math.random() * (499 - 49) + 49);
    const messages = Array.from({ length: messageCount }, () => generateMessage());
    const messageStream = messages.join('|');
    console.log('messageStream', messageStream);
    socket.emit('dataStream', messageStream);
  }, 10000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the HTTP server on port 3000
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000/');
});
