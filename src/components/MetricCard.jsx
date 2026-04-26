import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const MetricCard = ({ label, value, unit, trend, trendColor, borderColor, bgTint = 'white' }) => {
  return (
    <div 
      className="devpulse-card metric-card" 
      style={{ 
        borderLeftColor: borderColor,
        backgroundColor: bgTint 
      }}
    >
      <p className="label-text" style={{ marginBottom: '8px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{value}</span>
        <span className="body-text" style={{ color: 'var(--neutral-mid)' }}>{unit}</span>
      </div>
      {trend && (
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          color: trendColor,
          fontWeight: '500',
          fontSize: '13px'
        }}>
          {trend.type === 'up' ? <ArrowUp size={14} strokeWidth={3} /> : <ArrowDown size={14} strokeWidth={3} />}
          <span>{trend.text}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
