import React from 'react';
import { Activity, AlertCircle, LineChart, Search, Zap, Users } from 'lucide-react';

const LandingPage = ({ onSelectRole }) => {
  const features = [
    {
      icon: Activity,
      title: "Real-time Metrics",
      desc: "Track developer performance with live DORA metrics including lead time, cycle time, and bug rates."
    },
    {
      icon: AlertCircle,
      title: "Automated Signals",
      desc: "Instantly detect when a developer is blocked or if there is a spike in escaped production bugs."
    },
    {
      icon: Search,
      title: "Pattern Detection",
      desc: "Automatically spot trends and shifts in developer output over time to prevent burnout."
    },
    {
      icon: Zap,
      title: "Intelligent Interpretation",
      desc: "Turn raw numbers into readable stories and clear next steps for managers."
    },
    {
      icon: LineChart,
      title: "Metric Explorer",
      desc: "Compare specific metrics across the entire engineering organization with visual rankings."
    },
    {
      icon: Users,
      title: "Dual Portals",
      desc: "Dedicated views tailored specifically for developers checking their own stats, and managers viewing teams."
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <Zap size={24} color="var(--primary)" fill="var(--primary)" />
          DevPulse
        </div>
      </nav>

      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            From raw metrics to<br />real understanding.
          </h1>
          <p className="hero-subtitle">
            DevPulse is the next-generation developer productivity dashboard. We translate complex pull requests, lead times, and bug rates into actionable stories and automated signals.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => onSelectRole('developer')}>
              I am a Developer
            </button>
            <button className="btn-secondary" onClick={() => onSelectRole('manager')}>
              I am a Manager
            </button>
          </div>

          {/* Features Grid */}
          <div className="features-grid">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={20} />
                  </div>
                  <h3 className="feature-title">{item.title}</h3>
                  <p className="feature-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          DevPulse &middot; Built for ProductWorks Internship &middot; &copy; 2026
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
