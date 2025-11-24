import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * Loading spinner component
 */
function LoadingSpinner({ size, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Spinner animation="border" role="status" size={size || 'lg'}>
        <span className="sr-only">Loading...</span>
      </Spinner>
      {text && <p style={{ marginTop: '10px' }}>{text}</p>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: React.PropTypes.string,
  text: React.PropTypes.string,
};

export default LoadingSpinner;

