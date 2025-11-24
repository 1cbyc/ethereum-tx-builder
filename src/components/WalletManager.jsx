import React from 'react';
import { Panel, Table, Button, FormGroup, FormControl, Modal, Label } from 'react-bootstrap';
import { getWallets, saveWallet, deleteWallet } from '../walletManager';
import { getAddressFromPrivateKey } from '../txbuilder';

/**
 * Wallet manager component for managing multiple wallets
 */
class WalletManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallets: [],
      showAddModal: false,
      newWalletLabel: '',
      newWalletPrivateKey: '',
      deletingAddress: null,
    };
  }

  componentDidMount() {
    this.loadWallets();
  }

  loadWallets() {
    const wallets = getWallets();
    this.setState({ wallets });
  }

  handleAddWallet = () => {
    const { newWalletLabel, newWalletPrivateKey } = this.state;
    
    if (!newWalletPrivateKey) {
      alert('Private key is required');
      return;
    }

    const address = getAddressFromPrivateKey(newWalletPrivateKey);
    if (!address) {
      alert('Invalid private key');
      return;
    }

    const success = saveWallet({
      label: newWalletLabel || `Wallet ${this.state.wallets.length + 1}`,
      address: address,
      privateKey: newWalletPrivateKey,
    });

    if (success) {
      this.setState({
        showAddModal: false,
        newWalletLabel: '',
        newWalletPrivateKey: '',
      });
      this.loadWallets();
      if (this.props.onWalletAdded) {
        this.props.onWalletAdded(address);
      }
    }
  }

  handleDeleteWallet = (address) => {
    if (window.confirm('Are you sure you want to delete this wallet? This cannot be undone.')) {
      deleteWallet(address);
      this.loadWallets();
      if (this.props.onWalletDeleted) {
        this.props.onWalletDeleted(address);
      }
    }
  }

  handleSelectWallet = (wallet) => {
    if (this.props.onWalletSelect) {
      this.props.onWalletSelect(wallet);
    }
  }

  render() {
    const { wallets, showAddModal, newWalletLabel, newWalletPrivateKey } = this.state;
    const { currentAddress } = this.props;

    return (
      <div>
        <Panel header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Saved Wallets</h3>
            <Button bsSize="small" bsStyle="primary" onClick={() => this.setState({ showAddModal: true })}>
              Add Wallet
            </Button>
          </div>
        } bsStyle="info">
          {wallets.length === 0 ? (
            <p className="text-muted">No wallets saved. Click "Add Wallet" to save your first wallet.</p>
          ) : (
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet, idx) => (
                  <tr key={idx} className={currentAddress && wallet.address.toLowerCase() === currentAddress.toLowerCase() ? 'info' : ''}>
                    <td>{wallet.label}</td>
                    <td>
                      <code style={{ fontSize: '11px' }}>
                        {wallet.address.substring(0, 10)}...{wallet.address.substring(wallet.address.length - 8)}
                      </code>
                    </td>
                    <td>
                      <Button
                        bsSize="small"
                        bsStyle="primary"
                        onClick={() => this.handleSelectWallet(wallet)}
                        style={{ marginRight: '5px' }}
                      >
                        Use
                      </Button>
                      <Button
                        bsSize="small"
                        bsStyle="danger"
                        onClick={() => this.handleDeleteWallet(wallet.address)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>

        <Modal show={showAddModal} onHide={() => this.setState({ showAddModal: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Add Wallet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <label>Wallet Label (optional)</label>
              <FormControl
                type="text"
                placeholder="My Wallet"
                value={newWalletLabel}
                onChange={(e) => this.setState({ newWalletLabel: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <label>Private Key</label>
              <FormControl
                type="text"
                placeholder="0x..."
                value={newWalletPrivateKey}
                onChange={(e) => this.setState({ newWalletPrivateKey: e.target.value })}
              />
              <p className="text-muted" style={{ marginTop: '5px' }}>
                Your private key will be stored in browser localStorage. Keep your browser secure!
              </p>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({ showAddModal: false })}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleAddWallet}>Add Wallet</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

WalletManager.propTypes = {
  currentAddress: React.PropTypes.string,
  onWalletSelect: React.PropTypes.func,
  onWalletAdded: React.PropTypes.func,
  onWalletDeleted: React.PropTypes.func,
};

export default WalletManager;

