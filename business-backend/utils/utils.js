const crypto = require('crypto');
const Buffer = require('buffer').Buffer;

function decryption(encryptedMessage) {
    const [ivHex, encryptedHex] = encryptedMessage.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto
        .createHash('sha256')
        .update(String('passkey'))
        .digest('base64')
        .substr(0, 32);

    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(key), iv);
    let decryptedMessage = decipher.update(encryptedHex, 'hex', 'utf8');
    decryptedMessage += decipher.final('utf8');

    return JSON.parse(decryptedMessage);
}

function checkIntegrity(decryptedMessage) {
    const { secret_key, ...restMessage } = decryptedMessage;
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(restMessage));
    const computedSecretKey = hash.digest('hex');

    return computedSecretKey === secret_key;
}

module.exports = {
    decryption, 
    checkIntegrity
}