import React from 'react';
import { Button } from 'react-bootstrap';
import { copyToClipboard } from '../utils/clipboard';

/**
 * Copy button component
 */
class CopyButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
    };
  }

  handleCopy = async () => {
    const { text } = this.props;
    if (!text) return;

    const success = await copyToClipboard(text);
    if (success) {
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);

      if (this.props.onCopy) {
        this.props.onCopy();
      }
    }
  }

  render() {
    const { text, bsSize, bsStyle, label } = this.props;
    const { copied } = this.state;

    if (!text) return null;

    return (
      <Button
        bsSize={bsSize || 'small'}
        bsStyle={bsStyle || 'default'}
        onClick={this.handleCopy}
        title={copied ? 'Copied!' : `Copy ${label || 'to clipboard'}`}
      >
        {copied ? '✓ Copied' : (this.props.children || 'Copy')}
      </Button>
    );
  }
}

CopyButton.propTypes = {
  text: React.PropTypes.string.isRequired,
  bsSize: React.PropTypes.string,
  bsStyle: React.PropTypes.string,
  label: React.PropTypes.string,
  onCopy: React.PropTypes.func,
  children: React.PropTypes.node,
};

export default CopyButton;

