function generateTransactionID() {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-4); // Get last 4 digits of timestamp
    const randomLetters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Generate 2 random letters
    const transactionId = `#TR${timestamp}${randomLetters}`;

    return transactionId
}

module.exports = generateTransactionID