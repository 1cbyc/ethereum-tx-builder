import React from 'react';
import { Panel, Table, Button, FormGroup, FormControl, Modal, ButtonToolbar } from 'react-bootstrap';
import { getTemplates, saveTemplate, deleteTemplate } from '../utils/templates';

/**
 * Template manager component
 */
class TemplateManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templates: [],
      showSaveModal: false,
      showLoadModal: false,
      templateName: '',
    };
  }

  componentDidMount() {
    this.loadTemplates();
  }

  loadTemplates() {
    const templates = getTemplates();
    this.setState({ templates });
  }

  handleSaveTemplate = () => {
    const { templateName } = this.state;
    const { currentConfig } = this.props;

    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (!currentConfig) {
      alert('No configuration to save');
      return;
    }

    const success = saveTemplate({
      name: templateName.trim(),
      config: currentConfig,
    });

    if (success) {
      this.setState({
        showSaveModal: false,
        templateName: '',
      });
      this.loadTemplates();
      alert('Template saved successfully!');
    }
  }

  handleLoadTemplate = (template) => {
    if (this.props.onLoadTemplate) {
      this.props.onLoadTemplate(template.config);
    }
    this.setState({ showLoadModal: false });
  }

  handleDeleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
      this.loadTemplates();
    }
  }

  render() {
    const { templates, showSaveModal, showLoadModal, templateName } = this.state;

    return (
      <div>
        <Panel header={<h3>Transaction Templates</h3>} bsStyle="info">
          <ButtonToolbar>
            <Button
              bsSize="small"
              bsStyle="primary"
              onClick={() => this.setState({ showSaveModal: true })}
            >
              Save Current as Template
            </Button>
            <Button
              bsSize="small"
              bsStyle="default"
              onClick={() => this.setState({ showLoadModal: true })}
            >
              Load Template
            </Button>
          </ButtonToolbar>

          {templates.length > 0 && (
            <Table striped bordered condensed hover style={{ marginTop: '15px' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.name}</td>
                    <td>{new Date(template.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        bsSize="small"
                        bsStyle="primary"
                        onClick={() => this.handleLoadTemplate(template)}
                        style={{ marginRight: '5px' }}
                      >
                        Load
                      </Button>
                      <Button
                        bsSize="small"
                        bsStyle="danger"
                        onClick={() => this.handleDeleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {templates.length === 0 && (
            <p className="text-muted" style={{ marginTop: '15px' }}>
              No templates saved. Save your current transaction configuration as a template for quick reuse.
            </p>
          )}
        </Panel>

        <Modal show={showSaveModal} onHide={() => this.setState({ showSaveModal: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Save Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <label>Template Name</label>
              <FormControl
                type="text"
                placeholder="My Template"
                value={templateName}
                onChange={(e) => this.setState({ templateName: e.target.value })}
              />
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({ showSaveModal: false })}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleSaveTemplate}>Save</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showLoadModal} onHide={() => this.setState({ showLoadModal: false })} size="large">
          <Modal.Header closeButton>
            <Modal.Title>Load Template</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {templates.length === 0 ? (
              <p className="text-muted">No templates available.</p>
            ) : (
              <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td>{template.name}</td>
                      <td>{new Date(template.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          bsSize="small"
                          bsStyle="primary"
                          onClick={() => this.handleLoadTemplate(template)}
                        >
                          Load
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({ showLoadModal: false })}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

TemplateManager.propTypes = {
  currentConfig: React.PropTypes.object,
  onLoadTemplate: React.PropTypes.func.isRequired,
};

export default TemplateManager;

