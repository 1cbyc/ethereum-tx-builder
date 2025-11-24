import React from 'react';
import { FormGroup, FormControl, Col, ControlLabel, Button, Panel } from 'react-bootstrap';
import { parseABI } from '../abiParser';

/**
 * ABI Loader component for loading and parsing contract ABIs
 */
class ABILoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      abiText: '',
      parsedFunctions: [],
      selectedFunction: null,
      error: null,
      showFunctions: false,
    };
  }

  handleABIChange = (event) => {
    const abiText = event.target.value;
    this.setState({ abiText, error: null, parsedFunctions: [], selectedFunction: null });

    if (abiText.trim()) {
      const { functions, error } = parseABI(abiText);
      if (error) {
        this.setState({ error, parsedFunctions: [] });
      } else {
        this.setState({ parsedFunctions: functions, showFunctions: functions.length > 0 });
      }
    }
  }

  handleFunctionSelect = (func) => {
    this.setState({ selectedFunction: func });
    if (this.props.onFunctionSelect) {
      this.props.onFunctionSelect(func);
    }
  }

  render() {
    const { parsedFunctions, selectedFunction, error, showFunctions } = this.state;

    return (
      <div>
        <FormGroup controlId="contractABI">
          <Col componentClass={ControlLabel} sm={2}>
            Contract ABI (Optional)
          </Col>
          <Col sm={10}>
            <FormControl
              componentClass="textarea"
              rows="4"
              placeholder="Paste contract ABI JSON here"
              onChange={this.handleABIChange}
            />
            {error && (
              <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
                {error}
              </span>
            )}
            <p className="text-muted">
              Load contract ABI to see available functions and auto-fill parameters.
            </p>
          </Col>
        </FormGroup>

        {showFunctions && parsedFunctions.length > 0 && (
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Panel header={<strong>Available Functions</strong>} bsStyle="info">
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {parsedFunctions.map((func, idx) => (
                    <Button
                      key={idx}
                      bsSize="small"
                      bsStyle={
                        selectedFunction && selectedFunction.signature === func.signature ?
                          'primary' : 'default'
                      }
                      onClick={() => this.handleFunctionSelect(func)}
                      style={{
                        margin: '5px',
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      <code>{func.signature}</code>
                      {func.payable && (
                        <span className="label label-success" style={{ marginLeft: '10px' }}>
                          payable
                        </span>
                      )}
                      {func.constant && (
                        <span className="label label-info" style={{ marginLeft: '5px' }}>
                          view
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </Panel>
            </Col>
          </FormGroup>
        )}
      </div>
    );
  }
}

ABILoader.propTypes = {
  onFunctionSelect: React.PropTypes.func,
};

export default ABILoader;

