import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Select from './Select';
import SignalPill from './SignalPill';
import { Info, AlertTriangle } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from './StateViews';

const VALID_METRICS = [
  { value: 'bug_rate_pct', label: 'Bug Rate' },
  { value: 'avg_cycle_time_days', label: 'Cycle Time' },
  { value: 'avg_lead_time_days', label: 'Lead Time' },
  { value: 'prod_deployments', label: 'Deployments' },
  { value: 'merged_prs', label: 'PR Throughput' }
];

const MetricExplorer = ({ onLogout, onTabChange }) => {
  const [months, setMonths] = useState([]);
  const [metric, setMetric] = useState('bug_rate_pct');
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

  const fetchData = (met, m) => {
    if (!met || !m) return;
    setStatus('loading');
    fetch(`/api/explorer/${met}/${m}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(res => {
        setData(res);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchData(metric, month);
  }, [metric, month]);

  const avgPosition = data && data.max !== data.min 
    ? ((data.team_avg - data.min) / (data.max - data.min)) * 100 
    : 50;

  return (
    <div className="devpulse-page">
      <Navbar activeTab="explorer" onLogout={onLogout} onTabChange={onTabChange} />
      
      <main className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <header>
          <h1 className="heading-large">Metric Explorer</h1>
          <p className="body-text" style={{ color: 'var(--neutral-mid)', marginTop: '4px' }}>
            Compare one metric across all developers for any given month.
          </p>
        </header>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="label-text">Metric</span>
            <Select 
              value={metric}
              options={VALID_METRICS}
              onChange={(e) => setMetric(e.target.value)}
            />
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

        {status === 'loading' && <div style={{ marginTop: '24px' }}><LoadingState /></div>}
        {status === 'error' && <div style={{ marginTop: '24px' }}><ErrorState onRetry={() => fetchData(metric, month)} /></div>}
        {status === 'empty' && <div style={{ marginTop: '24px' }}><EmptyState /></div>}

        {status === 'success' && data && (
          <>
            <div className="info-bar-blue" style={{ marginTop: '16px' }}>
              <Info size={16} />
              <span>
                Team average {VALID_METRICS.find(m => m.value === metric)?.label.toLowerCase()} this month: 
                <strong style={{ marginLeft: '4px' }}>
                  {metric === 'bug_rate_pct' ? `${(data.team_avg * 100).toFixed(0)}%` : data.team_avg}
                </strong>
              </span>
            </div>

            <div className="devpulse-card" style={{ marginTop: '16px', padding: 0, overflow: 'visible' }}>
              <table className="devpulse-table" style={{ position: 'relative' }}>
                <thead style={{ position: 'relative', zIndex: 2 }}>
                  <tr>
                    <th style={{ width: '30%' }}>Rank + Developer</th>
                    <th style={{ width: '50%', textAlign: 'center', position: 'relative' }}>
                      <div style={{ position: 'relative', width: '220px', margin: '0 auto', textAlign: 'left' }}>
                        {VALID_METRICS.find(m => m.value === metric)?.label}
                        <div className="avg-line-container">
                          <div className="avg-line" style={{ left: `${avgPosition}%` }}></div>
                          <span className="avg-label" style={{ left: `${avgPosition}%` }}>avg</span>
                        </div>
                      </div>
                    </th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Signal</th>
                  </tr>
                </thead>
                <tbody style={{ position: 'relative', zIndex: 1 }}>
                  {data.ranked.map((dev) => (
                    <tr key={dev.rank}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="rank-circle">{dev.rank}</span>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827', marginLeft: '12px' }}>
                            {dev.developer_name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div className="bar-container">
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${dev.bar_position}%`, backgroundColor: data.lower_is_better && dev.value > data.team_avg ? '#EF4444' : 'var(--primary)' }}></div>
                               <div className="avg-line" style={{ left: `${avgPosition}%`, top: '-16px', bottom: '-16px', zIndex: 1 }}></div>
                            </div>
                            <span style={{ fontSize: '14px', color: '#374151', minWidth: '40px' }}>
                              {metric === 'bug_rate_pct' ? `${(dev.value * 100).toFixed(0)}%` : dev.value}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <SignalPill status={dev.pattern_hint.toLowerCase().includes('quality') ? 'quality' : dev.pattern_hint.toLowerCase().includes('review') ? 'review' : 'healthy'}>
                          {dev.pattern_hint}
                        </SignalPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.insight && (
              <div className="auto-insight-card" style={{ marginTop: '24px' }}>
                <AlertTriangle size={24} color="#D97706" style={{ flexShrink: 0 }} />
                <div>
                  <h3 className="auto-insight-heading">Team-level pattern detected</h3>
                  <p className="auto-insight-body">
                    {data.insight}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MetricExplorer;
