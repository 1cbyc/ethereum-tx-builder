import React from 'react';
import { FormGroup, FormControl, Col, ControlLabel } from 'react-bootstrap';
import { NETWORKS, getNetworkById } from '../networks';

/**
 * Network selector component
 */
function NetworkSelector({ selectedNetwork, onNetworkChange, validation }) {
  // Component for network selection
  const handleChange = (event) => {
    const networkId = event.target.value;
    const network = getNetworkById(networkId);
    window.localStorage.setItem('selectedNetwork', networkId);
    onNetworkChange(network);
  };

  return (
    <FormGroup controlId="network">
      <Col componentClass={ControlLabel} sm={2}>
        Network
      </Col>
      <Col sm={10}>
        <FormControl
          componentClass="select"
          value={selectedNetwork.id}
          onChange={handleChange}
        >
          {Object.values(NETWORKS).map(network => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
        </FormControl>
        {validation && validation.error && (
          <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
            {validation.error}
          </span>
        )}
        <p className="text-muted">
          Select the Ethereum network. API URL will be updated automatically.
        </p>
      </Col>
    </FormGroup>
  );
}

NetworkSelector.propTypes = {
  selectedNetwork: React.PropTypes.object.isRequired,
  onNetworkChange: React.PropTypes.func.isRequired,
  validation: React.PropTypes.object,
};

export default NetworkSelector;

