import React from 'react';

/**
 * Loading spinner component
 */
function LoadingSpinner({ size, text }) {
  const spinnerSize = size === 'sm' ? '20px' : size === 'lg' ? '60px' : '40px';
  
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }}
      />
      {text && <p style={{ marginTop: '10px' }}>{text}</p>}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: React.PropTypes.string,
  text: React.PropTypes.string,
};

export default LoadingSpinner;

