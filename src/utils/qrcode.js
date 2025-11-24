/**
 * QR Code generator utilities
 * Using a simple QR code library approach
 */

/**
 * Generate QR code data URL for text
 * @param {string} text - Text to encode
 * @param {number} size - QR code size in pixels
 * @returns {Promise<string>} Data URL of QR code image
 */
export function generateQRCode(text, size = 200) {
  return new Promise((resolve, reject) => {
    // For now, we'll use a QR code API service
    // In production, you'd want to use a proper QR code library
    const encodedText = encodeURIComponent(text);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;

    // Convert to data URL by fetching and converting
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

/**
 * Generate QR code and return as base64 data URL
 * @param {string} text - Text to encode
 * @param {number} size - QR code size
 * @returns {string} Data URL
 */
export function getQRCodeDataURL(text, size = 200) {
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
}

