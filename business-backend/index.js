const io = require("socket.io")(4000); // Initialize Socket.IO on port 4000 for frontend
const clientIo = require("socket.io-client"); // Socket.IO client for connecting to Emitter
const crypto = require("crypto");
const { InfluxDBClient, Point } = require("@influxdata/influxdb3-client");
const { decryption, checkIntegrity } = require("./utils/utils");

// Initialize InfluxDB client
const influx = new InfluxDBClient({
    host: "url",
  token:
    "token",
});
// const writeApi = influx.getWriteApi("o", "general");

// Connect to Emitter backend
const emitterSocket = clientIo.connect("http://localhost:3000");

emitterSocket.on("dataStream", async (encryptedMessageStream) => {
  console.log("received dataStream", encryptedMessageStream);
  const encryptedMessages = encryptedMessageStream.split("|");

  encryptedMessages.forEach( (encryptedMessage) => {
    // Decrypt the message
    const decryptedMessage = decryption(encryptedMessage);
    console.log("decryptedMessage", decryptedMessage);
    // Data integrity check
    const isValid = checkIntegrity(decryptedMessage);
    console.log("isValid", isValid);
    if (isValid) {
      // Add a timestamp
      const timestampedData = {
        ...decryptedMessage,
        timestamp: new Date().toISOString(),
      };

      //   Write to InfluxDB
      const point = new Point("message")
        .tag("name", timestampedData.name)
        .tag("origin", timestampedData.origin)
        .tag("destination", timestampedData.destination)
        .timestamp(timestampedData.timestamp);

        let database = `general`

        influx.write(point, database)
            .then(() => new Promise(resolve => setTimeout(resolve, 100)));

      // Emit to frontend
      io.emit("newData", timestampedData);
    }
  });
});

// Frontend connection
io.on("connection", (socket) => {
  console.log("Frontend connected");
  // You can add more events here to interact with the frontend
});
