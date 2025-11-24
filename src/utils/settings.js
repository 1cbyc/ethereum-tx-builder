/**
 * Settings export/import utilities
 */

/**
 * Export all settings to JSON
 * @returns {string} JSON string of all settings
 */
export function exportSettings() {
  try {
    const settings = {
      wallets: JSON.parse(window.localStorage.getItem('ethereum_wallets') || '[]'),
      templates: JSON.parse(window.localStorage.getItem('ethereum_tx_templates') || '[]'),
      transactionHistory: JSON.parse(window.localStorage.getItem('ethereum_tx_history') || '[]'),
      preferences: {
        selectedNetwork: window.localStorage.getItem('selectedNetwork'),
        theme: window.localStorage.getItem('ethereum_tx_builder_theme'),
        apiURL: window.localStorage.getItem('apiURL'),
        apiKey: window.localStorage.getItem('apiKey'),
      },
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    return JSON.stringify(settings, null, 2);
  } catch (e) {
    console.error('Error exporting settings:', e);
    throw new Error('Failed to export settings');
  }
}

/**
 * Import settings from JSON
 * @param {string} jsonString - JSON string of settings
 * @param {object} options - Import options
 * @param {boolean} options.overwrite - Whether to overwrite existing data
 * @returns {object} Import result
 */
export function importSettings(jsonString, options = {}) {
  try {
    const settings = JSON.parse(jsonString);
    const { overwrite = false } = options;
    const results = {
      wallets: 0,
      templates: 0,
      history: 0,
      preferences: false,
    };

    // Import wallets
    if (settings.wallets && Array.isArray(settings.wallets)) {
      if (overwrite) {
        window.localStorage.setItem('ethereum_wallets', JSON.stringify(settings.wallets));
      } else {
        const existing = JSON.parse(window.localStorage.getItem('ethereum_wallets') || '[]');
        const merged = [...existing, ...settings.wallets];
        window.localStorage.setItem('ethereum_wallets', JSON.stringify(merged));
      }
      results.wallets = settings.wallets.length;
    }

    // Import templates
    if (settings.templates && Array.isArray(settings.templates)) {
      if (overwrite) {
        window.localStorage.setItem('ethereum_tx_templates', JSON.stringify(settings.templates));
      } else {
        const existing = JSON.parse(window.localStorage.getItem('ethereum_tx_templates') || '[]');
        const merged = [...existing, ...settings.templates];
        window.localStorage.setItem('ethereum_tx_templates', JSON.stringify(merged));
      }
      results.templates = settings.templates.length;
    }

    // Import transaction history
    if (settings.transactionHistory && Array.isArray(settings.transactionHistory)) {
      if (overwrite) {
        window.localStorage.setItem('ethereum_tx_history', JSON.stringify(settings.transactionHistory));
      } else {
        const existing = JSON.parse(window.localStorage.getItem('ethereum_tx_history') || '[]');
        const merged = [...existing, ...settings.transactionHistory];
        window.localStorage.setItem('ethereum_tx_history', JSON.stringify(merged));
      }
      results.history = settings.transactionHistory.length;
    }

    // Import preferences
    if (settings.preferences) {
      Object.keys(settings.preferences).forEach(key => {
        if (settings.preferences[key] !== null) {
          window.localStorage.setItem(key, settings.preferences[key]);
        }
      });
      results.preferences = true;
    }

    return {
      success: true,
      results,
    };
  } catch (e) {
    console.error('Error importing settings:', e);
    return {
      success: false,
      error: e.message,
    };
  }
}

/**
 * Download settings as file
 * @param {string} filename - Filename for download
 */
export function downloadSettings(filename = 'ethereum-tx-builder-settings.json') {
  try {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error downloading settings:', e);
    throw e;
  }
}

