import React from 'react';
import { ArrowDown, ArrowUp, MoveRight } from 'lucide-react';

const TrendIndicator = ({ type, value }) => {
  const renderIcon = () => {
    switch (type) {
      case 'improvement':
        return <ArrowDown size={14} strokeWidth={3} />;
      case 'decline':
        return <ArrowUp size={14} strokeWidth={3} />;
      case 'no-change':
        return <MoveRight size={14} strokeWidth={3} />;
      default:
        return null;
    }
  };

  return (
    <div className={`trend-indicator ${type}`}>
      {renderIcon()}
      <span className="small-text" style={{ color: 'inherit', fontWeight: 600 }}>{value}</span>
    </div>
  );
};

export default TrendIndicator;
