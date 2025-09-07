import { notify } from "./toast";
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

/**
 * Encrypt a JavaScript object/data to encrypted string
 * @param {any} data - Data to encrypt (object, array, string, etc.)
 * @returns {string} - Encrypted string
 */
export const encryptData = (data) => {
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
    // throw new Error("Failed to encrypt data: " + error.message);
  }
};

/**
 * Decrypt an encrypted string back to original data
 * @param {string} encryptedData - Encrypted string
 * @returns {any} - Decrypted and parsed data
 */
export const decryptData = (encryptedData) => {
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
    //   console.error("Decryption error:", error);
    //   throw new Error("Failed to decrypt data: " + error.message);
  }
};

/**
 * Send encrypted data to server
 * @param {string} url - API endpoint
 * @param {any} data - Data to encrypt and send
 * @param {string} token - Authorization token
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const sendUnencryptedData = async (url, data, token, options = {}) => {
  try {

    const defaultOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    };
    
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
      credentials:"include"
    };

    return await fetch(url, mergedOptions);
  } catch (error) {
    // console.error("Error sending encrypted data:", error);
    // throw error;
  }
};

/**
 * Send encrypted data to server
 * @param {string} url - API endpoint
 * @param {any} data - Data to encrypt and send
 * @param {string} token - Authorization token
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const sendEncryptedData = async (url, data, token, options = {}) => {
  try {
    const encryptedData = encryptData(data);

    const defaultOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ encryptedData }),
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
      credentials: "include",
    };

    return await fetch(url, mergedOptions);
  } catch (error) {
    // console.error("Error sending encrypted data:", error);
    // throw error;
  }
};

/**
 * Fetch and decrypt data from server
 * @param {string} url - API endpoint
 * @param {string} token - Authorization token
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} - Decrypted data
 */
export const fetchEncryptedData = async (url, token, options = {}) => {
  try {
    const defaultOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, mergedOptions);
    const status = response.status;
    if (!response.ok) {
      if (response.status !== 404) {
        notify("Something went wrong", "error");
      }
      return { data: [], status: response.status };
    }

    const encryptedData = await response.text(); // Get as text first
    const decrypted = decryptData(encryptedData);
    return { data: decrypted, status: status };
  } catch (error) {
    // console.error("Error fetching encrypted data:", error);
    // throw error;
  }
};

export const isAuthorized = async (projectId, email) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/user/check-project`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectId,
          email: email,
        }),
        credentials:"include"
      }
    )
      .then(async (res) => {
        const data = await res.json();
        return data.projectExists;
      })
      .catch((err) => {
        notify("Something went wrong", "error");
        return false;
      });
    return res;
  } catch (err) {
    notify("Something went wrong", "error");
    return false;
  }
};
