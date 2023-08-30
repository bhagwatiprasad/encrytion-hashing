const data = require("../data/data.json");
const crypto = require("crypto");

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

function generateMessage() {
  const message = {
    name: getRandomElement(data.names),
    origin: getRandomElement(data.cities),
    destination: getRandomElement(data.cities),
  };

  // Hashing the message and adding checkSum
  let sumCheckMessage = hashing(message);

  // Encrypting the message
  const outputMessage = encryption(sumCheckMessage);
  return outputMessage;
}

function hashing(message) {
  // Create a SHA-256 hash
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(message));

  const sumCheckMessage = {
    ...message,
    secret_key: hash.digest("hex"),
  };

  return sumCheckMessage;
}

function encryption(sumCheckMessage) {
  // Create a 32-byte key (256 bits)
  const key = crypto
    .createHash("sha256")
    .update(String("passkey"))
    .digest("base64")
    .substr(0, 32);

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Encrypt the message
  const cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(key), iv);
  let encryptedMessage = cipher.update(
    JSON.stringify(sumCheckMessage),
    "utf8",
    "hex"
  );
  encryptedMessage += cipher.final("hex");

  // Combine IV and encrypted message
  const outputMessage = iv.toString("hex") + ":" + encryptedMessage;
  return outputMessage;
}

module.exports = {
  generateMessage,
  getRandomElement,
};
