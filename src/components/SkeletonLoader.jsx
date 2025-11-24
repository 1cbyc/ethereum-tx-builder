import React from 'react';

/**
 * Skeleton loader component for form fields
 */
function SkeletonLoader({ lines = 3 }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height: '40px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            marginBottom: '15px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}

SkeletonLoader.propTypes = {
  lines: React.PropTypes.number,
};

export default SkeletonLoader;

