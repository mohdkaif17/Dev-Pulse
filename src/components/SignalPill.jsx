import React from 'react';

const SignalPill = ({ status, children }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'healthy': return 'healthy';
      case 'quality': return 'quality';
      case 'review': return 'review';
      default: return '';
    }
  };

  return (
    <span className={`signal-pill ${getStatusClass()}`}>
      {children}
    </span>
  );
};

export default SignalPill;
