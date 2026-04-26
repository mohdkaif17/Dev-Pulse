import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import MyMetrics from './components/MyMetrics';
import TeamOverview from './components/TeamOverview';
import MetricExplorer from './components/MetricExplorer';
import DeepDive from './components/DeepDive';
import Insights from './components/Insights';

function App() {
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('metrics');
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);

  const handleRoleSelect = (role) => {
    if (role === 'manager') {
      setActiveTab('team');
    } else {
      setActiveTab('metrics');
    }
    setView('dashboard');
  };

  const handleDeveloperClick = (developerName) => {
    setSelectedDeveloper(developerName);
    setActiveTab('deepdive');
  };

  if (view === 'landing') {
    return <LandingPage onSelectRole={handleRoleSelect} />;
  }

  if (activeTab === 'team') {
    return (
      <TeamOverview 
        onLogout={() => setView('landing')} 
        onTabChange={setActiveTab}
        onDeveloperClick={handleDeveloperClick}
      />
    );
  }

  if (activeTab === 'explorer') {
    return (
      <MetricExplorer 
        onLogout={() => setView('landing')} 
        onTabChange={setActiveTab} 
      />
    );
  }

  if (activeTab === 'insights') {
    return (
      <Insights 
        onLogout={() => setView('landing')} 
        onTabChange={setActiveTab} 
      />
    );
  }

  if (activeTab === 'deepdive') {
    return (
      <DeepDive 
        onLogout={() => setView('landing')} 
        onTabChange={setActiveTab}
        onBack={() => setActiveTab('team')}
        developerId={selectedDeveloper}
      />
    );
  }

  return (
    <MyMetrics 
      activeTab={activeTab} 
      onLogout={() => setView('landing')} 
      onTabChange={setActiveTab} 
    />
  );
}

export default App;
