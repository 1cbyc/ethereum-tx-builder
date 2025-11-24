import React from 'react';
import { Panel, Table, Button, ButtonToolbar, Label } from 'react-bootstrap';
import { getTransactionHistory, clearHistory } from '../transactionHistory';

/**
 * Transaction history component
 */
class TransactionHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [],
    };
  }

  componentDidMount() {
    this.loadHistory();
  }

  loadHistory() {
    const history = getTransactionHistory();
    this.setState({ history });
  }

  handleClear = () => {
    if (window.confirm('Are you sure you want to clear all transaction history?')) {
      clearHistory();
      this.loadHistory();
    }
  }

  render() {
    const { history } = this.state;
    const { currentNetwork, currentAddress } = this.props;

    // Filter by current network and address if provided
    let filteredHistory = history;
    if (currentNetwork) {
      filteredHistory = filteredHistory.filter(tx => tx.network === currentNetwork.id);
    }
    if (currentAddress) {
      filteredHistory = filteredHistory.filter(
        tx => tx.from && tx.from.toLowerCase() === currentAddress.toLowerCase()
      );
    }

    if (filteredHistory.length === 0) {
      return (
        <Panel header={<h3>Transaction History</h3>} bsStyle="info">
          <p className="text-muted">No transactions yet. Your transaction history will appear here.</p>
        </Panel>
      );
    }

    return (
      <Panel header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Transaction History</h3>
          <Button bsSize="small" bsStyle="danger" onClick={this.handleClear}>
            Clear History
          </Button>
        </div>
      } bsStyle="info">
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Hash</th>
              <th>To</th>
              <th>Function</th>
              <th>Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((tx, idx) => (
              <tr key={idx}>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
                <td>
                  <code style={{ fontSize: '11px' }}>
                    {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                  </code>
                </td>
                <td>
                  <code style={{ fontSize: '11px' }}>
                    {tx.to ? `${tx.to.substring(0, 8)}...${tx.to.substring(tx.to.length - 6)}` : 'N/A'}
                  </code>
                </td>
                <td>
                  {tx.functionSignature ? (
                    <code style={{ fontSize: '11px' }}>{tx.functionSignature.split('(')[0]}</code>
                  ) : (
                    <Label bsStyle="default">ETH Transfer</Label>
                  )}
                </td>
                <td>{tx.value || '0'} ETH</td>
                <td>
                  <Label bsStyle="success">Sent</Label>
                </td>
                <td>
                  {tx.explorerURL && (
                    <a
                      href={`${tx.explorerURL}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    );
  }
}

TransactionHistory.propTypes = {
  currentNetwork: React.PropTypes.object,
  currentAddress: React.PropTypes.string,
};

export default TransactionHistory;

