import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getQRCodeDataURL } from '../utils/qrcode';

/**
 * QR Code modal component
 */
class QRCodeModal extends React.Component {
  render() {
    const { show, onHide, data, title } = this.props;

    if (!data) return null;

    const qrUrl = getQRCodeDataURL(data, 300);

    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{title || 'QR Code'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center' }}>
          <img src={qrUrl} alt="QR Code" style={{ maxWidth: '100%' }} />
          <p style={{ marginTop: '15px', wordBreak: 'break-all', fontSize: '12px' }}>
            <code>{data}</code>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

QRCodeModal.propTypes = {
  show: React.PropTypes.bool.isRequired,
  onHide: React.PropTypes.func.isRequired,
  data: React.PropTypes.string.isRequired,
  title: React.PropTypes.string,
};

export default QRCodeModal;

