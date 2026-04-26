import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Select from './Select';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from './StateViews';

const Insights = ({ onLogout, onTabChange }) => {
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/metrics/months')
      .then(r => r.json())
      .then(m => {
        setMonths(m);
        if (m.length > 0) setMonth(m[m.length - 1]);
      })
      .catch(e => console.error(e));
  }, []);

  const fetchInsights = (m) => {
    if (!m) return;
    setStatus('loading');
    fetch(`/api/insights/${m}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(res => {
        setData(res);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchInsights(month);
  }, [month]);

  const renderIcon = (type) => {
    if (type === 'warning') return <AlertTriangle size={16} color="#F59E0B" />;
    if (type === 'positive') return <CheckCircle2 size={16} color="#22C55E" />;
    return <Info size={16} color="#3B82F6" />;
  };

  const getTypeStyles = (type) => {
    if (type === 'warning') return { color: '#B45309', border: '#F59E0B', pillClass: 'insight-pill-gray', typeName: 'Quality Signal' };
    if (type === 'positive') return { color: '#15803D', border: '#22C55E', pillClass: 'insight-pill-green', typeName: 'Positive Signal' };
    return { color: '#1D4ED8', border: '#3B82F6', pillClass: 'insight-pill-blue', typeName: 'Speed Signal' };
  };

  return (
    <div className="devpulse-page">
      <Navbar activeTab="insights" onLogout={onLogout} onTabChange={onTabChange} />
      
      <main className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="heading-large">Insights</h1>
              <p className="body-text" style={{ color: 'var(--neutral-mid)', marginTop: '4px' }}>
                Automatically generated signals from this month's team data.
              </p>
              {status === 'success' && data && (
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                  {data.month} &nbsp;&middot;&nbsp; {data.total} insights detected
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="label-text">Month</span>
              <Select 
                value={month}
                options={months.map(m => ({ value: m, label: m }))}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>
        </header>

        {status === 'loading' && <div style={{ marginTop: '24px' }}><LoadingState /></div>}
        {status === 'error' && <div style={{ marginTop: '24px' }}><ErrorState onRetry={() => fetchInsights(month)} /></div>}
        {status === 'success' && data && data.total === 0 && <div style={{ marginTop: '24px' }}><EmptyState message="No insights generated for this month." /></div>}

        {status === 'success' && data && data.total > 0 && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.insights.map((insight, idx) => {
              const styles = getTypeStyles(insight.type);
              return (
                <div key={idx} className="devpulse-card" style={{ padding: '24px', borderLeft: `4px solid ${styles.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderIcon(insight.type)}
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', color: styles.color }}>
                        {styles.typeName}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{data.month}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginTop: '12px' }}>
                    {insight.title}
                  </h3>
                  
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', marginTop: '8px' }}>
                    {insight.body}
                  </p>
                  
                  {insight.involved_developers && insight.involved_developers.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      {insight.involved_developers.map((dev, dIdx) => (
                        <span key={dIdx} className={`insight-pill ${styles.pillClass}`}>{dev}</span>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => onTabChange('team')}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: '14px', color: '#4F46E5', cursor: 'pointer' }}
                    >
                      View Team Overview →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Insights;
