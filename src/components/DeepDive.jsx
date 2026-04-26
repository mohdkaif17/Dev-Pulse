import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SignalPill from './SignalPill';
import InterpretationPanel from './InterpretationPanel';
import { ArrowLeft, MoveRight } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from './StateViews';

const DeepDive = ({ onLogout, onTabChange, onBack, developerId }) => {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!developerId) return;
    
    // We fetch April for this MVP
    const fetchProfile = async () => {
      setStatus('loading');
      try {
        const res = await fetch(`/api/metrics/${developerId}/2026-04`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
        setStatus('success');
      } catch (e) {
        setStatus('error');
      }
    };
    fetchProfile();
  }, [developerId]);

  if (!developerId) {
    return (
      <div className="devpulse-page">
        <Navbar activeTab="deepdive" onLogout={onLogout} onTabChange={onTabChange} />
        <main className="container" style={{ paddingBottom: '48px', paddingTop: '24px' }}>
          <button className="back-link" onClick={onBack} style={{ background: 'none', border: 'none', padding: 0 }}>
            <ArrowLeft size={16} /> Back to Team Overview
          </button>
          <div style={{ marginTop: '24px' }}>
            <EmptyState message="No developer selected." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="devpulse-page">
      <Navbar activeTab="deepdive" onLogout={onLogout} onTabChange={onTabChange} />
      
      <main className="container" style={{ paddingBottom: '48px' }}>
        <div style={{ paddingTop: '24px' }}>
          <button className="back-link" onClick={onBack} style={{ background: 'none', border: 'none', padding: 0 }}>
            <ArrowLeft size={16} />
            Back to Team Overview
          </button>
        </div>

        {status === 'loading' && <div style={{ marginTop: '24px' }}><LoadingState /></div>}
        {status === 'error' && <div style={{ marginTop: '24px' }}><ErrorState /></div>}

        {status === 'success' && data && (
          <>
            <div className="devpulse-card" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="avatar-circle" style={{ width: '52px', height: '52px', fontSize: '18px' }}>
                  {data.developer_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ marginLeft: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>{data.developer_name}</h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                    {data.team_name} &nbsp;&middot;&nbsp; {data.level} &nbsp;&middot;&nbsp; Reports to {data.manager_name}
                  </p>
                </div>
              </div>
              <SignalPill status={data.interpretation.signal === 'warning' ? 'quality' : data.interpretation.signal === 'info' ? 'review' : 'healthy'}>
                {data.pattern_hint}
              </SignalPill>
            </div>

            <div className="devpulse-card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
              <table className="devpulse-table comparison-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Previous Month</th>
                    <th>Current Month</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Lead Time</td>
                    <td>{data.trend ? (data.avg_lead_time_days - data.trend.lead_time).toFixed(2) : '-'} days</td>
                    <td>{data.avg_lead_time_days.toFixed(2)} days</td>
                    <td style={data.trend && data.trend.lead_time < 0 ? { color: '#22C55E', fontWeight: 500 } : data.trend && data.trend.lead_time > 0 ? { color: '#EF4444', fontWeight: 500 } : { color: '#6B7280', fontWeight: 500 }}>
                      {data.trend ? (data.trend.lead_time < 0 ? `▼ ${Math.abs(data.trend.lead_time).toFixed(2)} improved` : data.trend.lead_time > 0 ? `▲ ${data.trend.lead_time.toFixed(2)} declined` : '→ no change') : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Cycle Time</td>
                    <td>{data.trend ? (data.avg_cycle_time_days - data.trend.cycle_time).toFixed(2) : '-'} days</td>
                    <td>{data.avg_cycle_time_days.toFixed(2)} days</td>
                    <td style={data.trend && data.trend.cycle_time < 0 ? { color: '#22C55E', fontWeight: 500 } : data.trend && data.trend.cycle_time > 0 ? { color: '#EF4444', fontWeight: 500 } : { color: '#6B7280', fontWeight: 500 }}>
                      {data.trend ? (data.trend.cycle_time < 0 ? `▼ ${Math.abs(data.trend.cycle_time).toFixed(2)} improved` : data.trend.cycle_time > 0 ? `▲ ${data.trend.cycle_time.toFixed(2)} declined` : '→ no change') : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Bug Rate</td>
                    <td>{data.trend ? ((data.bug_rate_pct - data.trend.bug_rate) * 100).toFixed(0) : '-'}%</td>
                    <td>{(data.bug_rate_pct * 100).toFixed(0)}%</td>
                    <td style={data.trend && data.trend.bug_rate < 0 ? { color: '#22C55E', fontWeight: 500 } : data.trend && data.trend.bug_rate > 0 ? { color: '#EF4444', fontWeight: 500 } : { color: '#6B7280', fontWeight: 500 }}>
                      {data.trend ? (data.trend.bug_rate < 0 ? `▼ ${Math.abs(data.trend.bug_rate * 100).toFixed(0)}% improved` : data.trend.bug_rate > 0 ? `▲ ${(data.trend.bug_rate * 100).toFixed(0)}% declined` : '→ no change') : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Deployments</td>
                    <td>{data.trend ? data.prod_deployments - data.trend.deployments : '-'}</td>
                    <td>{data.prod_deployments}</td>
                    <td style={data.trend && data.trend.deployments > 0 ? { color: '#22C55E', fontWeight: 500 } : data.trend && data.trend.deployments < 0 ? { color: '#EF4444', fontWeight: 500 } : { color: '#6B7280', fontWeight: 500 }}>
                      {data.trend ? (data.trend.deployments > 0 ? `▲ ${data.trend.deployments} more` : data.trend.deployments < 0 ? `▼ ${Math.abs(data.trend.deployments)} less` : '→ no change') : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>PR Throughput</td>
                    <td>{data.trend ? data.merged_prs - data.trend.merged_prs : '-'}</td>
                    <td>{data.merged_prs}</td>
                    <td style={data.trend && data.trend.merged_prs > 0 ? { color: '#22C55E', fontWeight: 500 } : data.trend && data.trend.merged_prs < 0 ? { color: '#EF4444', fontWeight: 500 } : { color: '#6B7280', fontWeight: 500 }}>
                      {data.trend ? (data.trend.merged_prs > 0 ? `▲ ${data.trend.merged_prs} more` : data.trend.merged_prs < 0 ? `▼ ${Math.abs(data.trend.merged_prs)} less` : '→ no change') : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {data.changeStory && (
              <div className="devpulse-card" style={{ marginTop: '24px' }}>
                <p className="label-text" style={{ marginBottom: '12px' }}>PATTERN JOURNEY</p>
                <div className="pattern-journey">
                  <SignalPill status="healthy">Previous Month</SignalPill>
                  <div className="pattern-arrow"><MoveRight size={20} /></div>
                  <SignalPill status={data.interpretation.signal === 'warning' ? 'quality' : data.interpretation.signal === 'info' ? 'review' : 'healthy'}>
                    Current Month
                  </SignalPill>
                </div>
                <p className="small-text" style={{ marginTop: '12px', fontSize: '13px' }}>
                  {data.changeStory.text}
                </p>
              </div>
            )}

            {data.interpretation && (
              <InterpretationPanel 
                story={data.interpretation.story}
                signal={data.interpretation.signal}
                nextSteps={data.interpretation.nextSteps}
                confidence={data.interpretation.confidence}
              />
            )}

            <div className="devpulse-card" style={{ marginTop: '24px' }}>
              <p className="label-text" style={{ marginBottom: '12px' }}>MANAGER NOTES</p>
              <textarea 
                className="manager-notes-textarea" 
                placeholder="Add a private note about this developer..."
              ></textarea>
              <p className="small-text" style={{ marginTop: '8px' }}>
                Notes are only visible to you.
              </p>
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default DeepDive;
