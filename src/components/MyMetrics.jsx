import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import MetricCard from './MetricCard';
import Select from './Select';
import { AlertTriangle } from 'lucide-react';
import InterpretationPanel from './InterpretationPanel';
import { EmptyState, LoadingState, ErrorState } from './StateViews';

const MyMetrics = ({ onLogout, activeTab, onTabChange }) => {
  const [developers, setDevelopers] = useState([]);
  const [months, setMonths] = useState([]);
  
  const [developer, setDeveloper] = useState('none');
  const [month, setMonth] = useState('');
  
  const [status, setStatus] = useState('empty'); // 'empty', 'loading', 'success', 'error'
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/developers')
      .then(r => r.json())
      .then(data => setDevelopers(data))
      .catch(e => console.error("Failed to load developers", e));

    fetch('/api/metrics/months')
      .then(r => r.json())
      .then(data => {
        setMonths(data);
        if (data.length > 0) setMonth(data[data.length - 1]);
      })
      .catch(e => console.error("Failed to load months", e));
  }, []);

  const fetchMetrics = (devId, m) => {
    if (!devId || devId === 'none' || !m) {
      setStatus('empty');
      return;
    }
    setStatus('loading');
    fetch(`/api/metrics/${devId}/${m}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(data => {
        setMetrics(data);
        setStatus('success');
      })
      .catch(err => {
        setStatus('error');
      });
  };

  const handleDeveloperChange = (e) => {
    const val = e.target.value;
    setDeveloper(val);
    fetchMetrics(val, month);
  };

  const handleMonthChange = (e) => {
    const val = e.target.value;
    setMonth(val);
    fetchMetrics(developer, val);
  };

  const handleRetry = () => {
    fetchMetrics(developer, month);
  };

  return (
    <div className="devpulse-page">
      <Navbar activeTab={activeTab} onLogout={onLogout} onTabChange={onTabChange} />
      
      <main className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <header>
          <h1 className="heading-large">My Metrics</h1>
          <p className="body-text" style={{ color: 'var(--neutral-mid)', marginTop: '4px' }}>
            View your metrics, understand what they mean, and see what to do next.
          </p>
        </header>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="label-text">Developer</span>
            <Select 
              value={developer}
              options={[
                { value: 'none', label: 'Select a developer...' },
                ...developers.map(d => ({ value: d.developer_id, label: `${d.developer_name} — ${d.team_name}` }))
              ]}
              onChange={handleDeveloperChange}
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
          {status === 'error' && <ErrorState onRetry={handleRetry} />}
          
          {status === 'success' && metrics && (
            <>
              <div>
                <div className="metrics-grid">
                  <MetricCard 
                    label="LEAD TIME"
                    value={metrics.avg_lead_time_days.toFixed(2)}
                    unit="days"
                    borderColor="#F59E0B"
                    trend={metrics.trend ? { 
                      type: metrics.trend.lead_time > 0 ? 'up' : 'down', 
                      text: `${Math.abs(metrics.trend.lead_time).toFixed(2)} ${metrics.trend.lead_time > 0 ? 'more' : 'less'} than last month` 
                    } : null}
                    trendColor={metrics.trend && metrics.trend.lead_time > 0 ? "#F59E0B" : "#22C55E"}
                  />
                  <MetricCard 
                    label="CYCLE TIME"
                    value={metrics.avg_cycle_time_days.toFixed(2)}
                    unit="days"
                    borderColor="#22C55E"
                    trend={metrics.trend ? { 
                      type: metrics.trend.cycle_time > 0 ? 'up' : 'down', 
                      text: `${Math.abs(metrics.trend.cycle_time).toFixed(2)} ${metrics.trend.cycle_time > 0 ? 'more' : 'less'} than last month` 
                    } : null}
                    trendColor={metrics.trend && metrics.trend.cycle_time > 0 ? "#F59E0B" : "#22C55E"}
                  />
                  <MetricCard 
                    label="BUG RATE"
                    value={metrics.bug_rate_pct * 100}
                    unit="%"
                    borderColor="#EF4444"
                    bgTint={metrics.bug_rate_pct > 0 ? "#FFFBEB" : "white"}
                    trend={metrics.trend ? { 
                      type: metrics.trend.bug_rate > 0 ? 'up' : metrics.trend.bug_rate < 0 ? 'down' : 'up', 
                      text: `${Math.abs(metrics.trend.bug_rate * 100).toFixed(0)}% ${metrics.trend.bug_rate > 0 ? 'more' : metrics.trend.bug_rate < 0 ? 'less' : 'same'} than last month` 
                    } : null}
                    trendColor={metrics.trend && metrics.trend.bug_rate > 0 ? "#EF4444" : "#22C55E"}
                  />
                </div>
                <div className="metrics-grid-bottom">
                  <MetricCard 
                    label="DEPLOYMENTS"
                    value={metrics.prod_deployments}
                    unit="this month"
                    borderColor="#4F46E5"
                  />
                  <MetricCard 
                    label="PR THROUGHPUT"
                    value={metrics.merged_prs}
                    unit="merged"
                    borderColor="#4F46E5"
                  />
                </div>
              </div>

              {metrics.changeStory && (
                <div className="devpulse-card" style={{ marginTop: '24px', borderLeft: `3px solid ${metrics.changeStory.type === 'positive' ? '#22C55E' : metrics.changeStory.type === 'warning' ? '#F59E0B' : '#3B82F6'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={14} color={metrics.changeStory.type === 'positive' ? '#15803D' : metrics.changeStory.type === 'warning' ? '#B45309' : '#1D4ED8'} />
                    <span className="label-text">WHAT CHANGED FROM LAST MONTH</span>
                  </div>
                  <p className="body-text" style={{ marginTop: '12px', fontStyle: 'italic', lineHeight: '1.7' }}>
                    "{metrics.changeStory.text}"
                  </p>
                </div>
              )}

              {metrics.interpretation && (
                <InterpretationPanel 
                  story={metrics.interpretation.story}
                  signal={metrics.interpretation.signal}
                  nextSteps={metrics.interpretation.nextSteps}
                  confidence={metrics.interpretation.confidence}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyMetrics;
