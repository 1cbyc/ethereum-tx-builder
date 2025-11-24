/**
 * Clipboard utilities
 */

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => {
          // Fallback for older browsers
          fallbackCopyToClipboard(text, resolve);
        });
    } else {
      // Fallback for older browsers
      fallbackCopyToClipboard(text, resolve);
    }
  });
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyToClipboard(text, callback) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    callback(successful);
  } catch (err) {
    document.body.removeChild(textArea);
    callback(false);
  }
}

