import React from 'react';
import { BarChart2, AlertTriangle } from 'lucide-react';

export const EmptyState = () => (
  <div className="state-container">
    <div className="icon-circle-indigo">
      <BarChart2 size={28} color="#4F46E5" />
    </div>
    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginTop: '16px' }}>
      Select a developer to begin
    </h2>
    <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '360px', marginTop: '8px', lineHeight: '1.6' }}>
      Choose a developer and month from the dropdowns above to see their productivity metrics and insights.
    </p>
  </div>
);

export const LoadingState = () => (
  <div className="state-container">
    <div className="spinner"></div>
    <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '16px' }}>
      Loading metrics...
    </p>
  </div>
);

export const ErrorState = ({ onRetry }) => (
  <div className="state-container">
    <div className="icon-circle-red">
      <AlertTriangle size={28} color="#EF4444" />
    </div>
    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginTop: '16px' }}>
      Could not load data
    </h2>
    <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '360px', marginTop: '8px' }}>
      Something went wrong while fetching this developer's metrics. Please try again.
    </p>
    <button className="btn-primary" onClick={onRetry} style={{ marginTop: '16px' }}>
      Try again
    </button>
  </div>
);
