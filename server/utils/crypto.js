const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Encrypt a JavaScript object/data to encrypted string
 * @param {any} data - Data to encrypt (object, array, string, etc.)
 * @returns {string} - Encrypted string
 */
const encryptData = (data) => {
  try {
    if (!SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }

    // Convert data to JSON string if it's not already a string
    const dataString = typeof data === "string" ? data : JSON.stringify(data);

    // Encrypt and return as string
    const encrypted = CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();

    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data: " + error.message);
  }
};

/**
 * Decrypt an encrypted string back to original data
 * @param {string} encryptedData - Encrypted string
 * @returns {any} - Decrypted and parsed data
 */
const decryptData = (encryptedData) => {
  try {
    if (!SECRET_KEY) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }

    if (!encryptedData || typeof encryptedData !== "string") {
      throw new Error("Invalid encrypted data provided");
    }

    // Decrypt
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    // Check if decryption was successful
    if (!decryptedString || decryptedString.length === 0) {
      throw new Error(
        "Decryption failed - possibly wrong key or corrupted data"
      );
    }

    // Try to parse as JSON, if it fails return as string
    try {
      return JSON.parse(decryptedString);
    } catch (parseError) {
      // If JSON parsing fails, return as string
      return decryptedString;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data: " + error.message);
  }
};

/**
 * Middleware to decrypt request body
 * @param {string} fieldName - Name of the field containing encrypted data (default: 'encryptedData')
 * @returns {Function} - Express middleware function
 */
const decryptMiddleware = (fieldName = "encryptedData") => {
  return (req, res, next) => {
    try {
      if (req.body && req.body[fieldName]) {
        const decryptedData = decryptData(req.body[fieldName]);
        req.body.decrypted = decryptedData;
      }
      next();
    } catch (error) {
      console.error("Decryption middleware error:", error);
      return res.status(400).json({
        error: "Failed to decrypt request data",
        details: error.message,
      });
    }
  };
};

/**
 * Send encrypted response
 * @param {object} res - Express response object
 * @param {any} data - Data to encrypt and send
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendEncryptedResponse = (res, data, statusCode = 200) => {
  try {
    const encryptedData = encryptData(data);
    res.status(statusCode).send(encryptedData);
  } catch (error) {
    console.error("Error sending encrypted response:", error);
    res.status(500).json({
      error: "Failed to encrypt response data",
      details: error.message,
    });
  }
};

/**
 * Handle encrypted request and send encrypted response
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} handler - Handler function that processes decrypted data
 * @param {string} fieldName - Name of field containing encrypted data
 */
const handleEncryptedRequest = async (
  req,
  res,
  handler,
  fieldName = "encryptedData"
) => {
  try {
    // Decrypt incoming data
    let decryptedData = null;
    if (req.body && req.body[fieldName]) {
      decryptedData = decryptData(req.body[fieldName]);
    }

    // Call the handler with decrypted data
    const result = await handler(decryptedData, req, res);

    // Send encrypted response if handler returns data
    if (result !== undefined) {
      sendEncryptedResponse(res, result);
    }
  } catch (error) {
    console.error("Error handling encrypted request:", error);
    res.status(500).json({
      error: "Server error processing encrypted request",
      details: error.message,
    });
  }
};

module.exports = {
  encryptData,
  decryptData,
  decryptMiddleware,
  sendEncryptedResponse,
  handleEncryptedRequest,
};
