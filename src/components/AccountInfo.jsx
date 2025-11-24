import React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { Form, FormGroup, FormControl, Button, Col, ControlLabel, ButtonToolbar } from 'react-bootstrap';
import { calculateNonce } from "../txbuilder";
import CopyButton from "./CopyButton";
import QRCodeModal from "./QRCodeModal";

@observer
class AccountInfo extends React.Component {

  constructor({state}) {
    super();
    this.state = state;
    this.localState = {
      showQRCode: false,
    };
  }

  componentDidMount() {
    let state = this.state;
  }

  render() {

    let state = this.state;

    function increaseNonce() {
      state.nonceOffset++;
      state.nonce = calculateNonce(state.baseNonce, state.testnetOffset, state.nonceOffset);
    }
    increaseNonce = action(increaseNonce);

    const hexNonce = "0x" + state.nonce.toString(16);

    return (
      <div>
        <hr />

        <h3>Account information</h3>

        <FormGroup controlId="address">

          <Col componentClass={ControlLabel} sm={2}>
            Private key address
          </Col>

          <Col sm={10}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <FormControl type="text" value={state.address} disabled style={{ flex: 1 }} />
              <CopyButton text={state.address} label="address" />
              <Button
                bsSize="small"
                onClick={() => this.localState.showQRCode = true; this.forceUpdate();}
              >
                QR
              </Button>
            </div>
            <p className="text-muted">
              Address from the private key. &nbsp;
              <a target="_blank" href={"https://testnet.etherscan.io/address/" + state.address}>View on EtherScan.io</a>.
            </p>
            <QRCodeModal
              show={this.localState.showQRCode}
              onHide={() => { this.localState.showQRCode = false; this.forceUpdate(); }}
              data={state.address}
              title="Address QR Code"
            />
          </Col>

        </FormGroup>

        <FormGroup controlId="balance">

          <Col componentClass={ControlLabel} sm={2}>
            Account balance (ETH)
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.balance} disabled />

            <p className="text-muted">Balance of the address above.</p>
          </Col>

        </FormGroup>

        <FormGroup controlId="balance">

          <Col componentClass={ControlLabel} sm={2}>
            Next nonce
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={hexNonce} disabled />

            <p className="text-muted">Each transaction must have a nonce one higher than previous one.</p>
          </Col>

        </FormGroup>

        <Button bsStyle="primary" onClick={increaseNonce}>
          Manually increase nonce
        </Button>

        <p className="text-muted">
          Helps to troubleshoot issues when sending multiple transactions sequentially. If there is a gap in the nonce sequence the transaction silently disappers from the tranasaction pool or never shows in the blockchain explorer.
        </p>

      </div>
    )
  }
}

export default AccountInfo;