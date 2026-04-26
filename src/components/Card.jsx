import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`devpulse-card ${className}`}>
      {children}
    </div>
  );
};

export default Card;
