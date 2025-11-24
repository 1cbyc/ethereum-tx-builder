import React from 'react';
import { Panel, Button, FormGroup, FormControl, Modal, Alert } from 'react-bootstrap';
import { exportSettings, importSettings, downloadSettings } from '../utils/settings';

/**
 * Settings export/import component
 */
class SettingsManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showImportModal: false,
      importText: '',
      importError: null,
      importSuccess: null,
    };
  }

  handleExport = () => {
    try {
      downloadSettings();
      alert('Settings exported successfully!');
    } catch (e) {
      alert('Error exporting settings: ' + e.message);
    }
  }

  handleImport = () => {
    const { importText } = this.state;
    
    if (!importText.trim()) {
      this.setState({ importError: 'Please paste settings JSON' });
      return;
    }

    const result = importSettings(importText, { overwrite: false });

    if (result.success) {
      this.setState({
        importSuccess: `Imported: ${result.results.wallets} wallets, ${result.results.templates} templates, ${result.results.history} transactions`,
        importError: null,
        importText: '',
      });
      
      if (this.props.onImport) {
        this.props.onImport();
      }

      setTimeout(() => {
        this.setState({ showImportModal: false, importSuccess: null });
      }, 2000);
    } else {
      this.setState({
        importError: result.error || 'Failed to import settings',
        importSuccess: null,
      });
    }
  }

  render() {
    const { showImportModal, importText, importError, importSuccess } = this.state;

    return (
      <div>
        <Panel header={<h3>Settings Backup & Restore</h3>} bsStyle="info">
          <p className="text-muted">
            Export all your settings, wallets, templates, and transaction history as a backup file.
            You can import it later to restore your data.
          </p>
          <Button
            bsStyle="primary"
            onClick={this.handleExport}
            style={{ marginRight: '10px' }}
          >
            Export Settings
          </Button>
          <Button
            bsStyle="default"
            onClick={() => this.setState({ showImportModal: true, importError: null, importSuccess: null })}
          >
            Import Settings
          </Button>
        </Panel>

        <Modal show={showImportModal} onHide={() => this.setState({ showImportModal: false })} size="large">
          <Modal.Header closeButton>
            <Modal.Title>Import Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {importSuccess && (
              <Alert bsStyle="success">
                {importSuccess}
              </Alert>
            )}
            {importError && (
              <Alert bsStyle="danger">
                {importError}
              </Alert>
            )}
            <FormGroup>
              <label>Paste Settings JSON</label>
              <FormControl
                componentClass="textarea"
                rows="10"
                value={importText}
                onChange={(e) => this.setState({ importText: e.target.value, importError: null })}
                placeholder="Paste exported settings JSON here..."
              />
            </FormGroup>
            <p className="text-muted">
              <strong>Note:</strong> Imported data will be merged with existing data. Duplicates may occur.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({ showImportModal: false })}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleImport}>Import</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

SettingsManager.propTypes = {
  onImport: React.PropTypes.func,
};

export default SettingsManager;

