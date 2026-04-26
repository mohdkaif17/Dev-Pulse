import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Select from './Select';
import SignalPill from './SignalPill';
import { EmptyState, LoadingState, ErrorState } from './StateViews';

const TeamOverview = ({ onLogout, onTabChange, onDeveloperClick }) => {
  const [managers, setManagers] = useState([]);
  const [months, setMonths] = useState([]);
  
  const [manager, setManager] = useState('none');
  const [month, setMonth] = useState('');
  
  const [status, setStatus] = useState('empty');
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    fetch('/api/managers')
      .then(r => r.json())
      .then(data => setManagers(data))
      .catch(e => console.error(e));

    fetch('/api/metrics/months')
      .then(r => r.json())
      .then(data => {
        setMonths(data);
        if (data.length > 0) setMonth(data[data.length - 1]);
      })
      .catch(e => console.error(e));
  }, []);

  const fetchTeamData = (mgrId, m) => {
    if (!mgrId || mgrId === 'none' || !m) {
      setStatus('empty');
      return;
    }
    setStatus('loading');
    fetch(`/api/manager/${mgrId}/${m}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(data => {
        setTeamData(data);
        setStatus('success');
      })
      .catch(err => {
        setStatus('error');
      });
  };

  const handleManagerChange = (e) => {
    const val = e.target.value;
    setManager(val);
    fetchTeamData(val, month);
  };

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setMonth(val);
    fetchTeamData(manager, val);
  };

  return (
    <div className="devpulse-page">
      <Navbar activeTab="team" onLogout={onLogout} onTabChange={onTabChange} />
      
      <main className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <header>
          <h1 className="heading-large">Team Overview</h1>
          <p className="body-text" style={{ color: 'var(--neutral-mid)', marginTop: '4px' }}>
            A lightweight summary of your team's productivity signals this month.
          </p>
        </header>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="label-text">Manager</span>
            <Select 
              value={manager}
              options={[
                { value: 'none', label: 'Select a manager...' },
                ...managers.map(m => ({ value: m.manager_id, label: m.manager_name }))
              ]}
              onChange={handleManagerChange}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="label-text">Month</span>
            <Select 
              value={month}
              options={months.map(m => ({ value: m, label: m }))}
              onChange={handleMonthChange}
            />
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          {status === 'empty' && <EmptyState />}
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorState onRetry={() => fetchTeamData(manager, month)} />}
          
          {status === 'success' && teamData && (
            <>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="devpulse-card" style={{ flex: 1 }}>
                  <p className="label-text" style={{ marginBottom: '8px' }}>AVG LEAD TIME</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{teamData.avg_lead_time_days.toFixed(2)}</span>
                    <span className="body-text" style={{ color: 'var(--neutral-mid)' }}>days</span>
                  </div>
                </div>
                <div className="devpulse-card" style={{ flex: 1 }}>
                  <p className="label-text" style={{ marginBottom: '8px' }}>AVG CYCLE TIME</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{teamData.avg_cycle_time_days.toFixed(2)}</span>
                    <span className="body-text" style={{ color: 'var(--neutral-mid)' }}>days</span>
                  </div>
                </div>
                <div className="devpulse-card" style={{ flex: 1, backgroundColor: teamData.avg_bug_rate_pct > 0 ? '#FFFBEB' : 'white', borderColor: teamData.avg_bug_rate_pct > 0 ? '#FDE68A' : 'var(--border-color)' }}>
                  <p className="label-text" style={{ marginBottom: '8px' }}>AVG BUG RATE</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{(teamData.avg_bug_rate_pct * 100).toFixed(0)}</span>
                    <span className="body-text" style={{ color: 'var(--neutral-mid)' }}>%</span>
                  </div>
                </div>
              </div>

              <div className="devpulse-card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
                <table className="devpulse-table">
                  <thead>
                    <tr>
                      <th>Developer</th>
                      <th>Lead Time</th>
                      <th>Cycle Time</th>
                      <th>Bug Rate</th>
                      <th>Deployments</th>
                      <th>Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamData.developers.map((dev) => (
                      <tr key={dev.developer_id}>
                        <td>
                          <button 
                            onClick={() => onDeveloperClick(dev.developer_id)} 
                            className="developer-link"
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                          >
                            {dev.developer_name}
                            <span className="hover-text">View Profile →</span>
                          </button>
                        </td>
                        <td>{dev.avg_lead_time_days.toFixed(2)}d</td>
                        <td>{dev.avg_cycle_time_days.toFixed(2)}d</td>
                        <td style={dev.bug_rate_pct > 0 ? { color: '#EF4444', fontWeight: '700' } : {}}>
                          {(dev.bug_rate_pct * 100).toFixed(0)}%
                        </td>
                        <td>{dev.prod_deployments}</td>
                        <td>
                          <SignalPill status={dev.signal === 'warning' ? 'quality' : dev.signal === 'info' ? 'review' : 'healthy'}>
                            {dev.pattern_hint}
                          </SignalPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamOverview;
