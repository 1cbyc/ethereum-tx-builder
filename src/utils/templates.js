/**
 * Transaction template management utilities
 */

const TEMPLATES_KEY = 'ethereum_tx_templates';

/**
 * Get all saved templates
 * @returns {Array} Array of template objects
 */
export function getTemplates() {
  try {
    const templates = window.localStorage.getItem(TEMPLATES_KEY);
    return templates ? JSON.parse(templates) : [];
  } catch (e) {
    console.error('Error reading templates:', e);
    return [];
  }
}

/**
 * Save a template
 * @param {object} templateData - Template data
 * @param {string} templateData.name - Template name
 * @param {object} templateData.config - Template configuration
 * @returns {boolean} Success status
 */
export function saveTemplate(templateData) {
  try {
    const templates = getTemplates();
    
    const template = {
      id: templateData.id || Date.now().toString(),
      name: templateData.name || `Template ${templates.length + 1}`,
      config: templateData.config,
      createdAt: templateData.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    return true;
  } catch (e) {
    console.error('Error saving template:', e);
    return false;
  }
}

/**
 * Delete a template
 * @param {string} templateId - Template ID
 * @returns {boolean} Success status
 */
export function deleteTemplate(templateId) {
  try {
    const templates = getTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting template:', e);
    return false;
  }
}

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @returns {object|null} Template object or null
 */
export function getTemplateById(templateId) {
  const templates = getTemplates();
  return templates.find(t => t.id === templateId) || null;
}

