import React from 'react';

const StepItem = ({ number, text }) => (
  <div className="step-item">
    <div className="step-number">{number}</div>
    <p className="body-text">{text}</p>
  </div>
);

const InterpretationPanel = ({ story, signal, nextSteps, confidence }) => {
  // Determine styles based on signal
  let signalConfig = {
    color: '#F59E0B', // amber
    textColor: '#B45309',
    pillClass: 'quality-watch',
    label: 'Quality Watch',
    dividerClass: 'divider-amber'
  };

  if (signal === 'success') {
    signalConfig = {
      color: '#22C55E', // green
      textColor: '#15803D',
      pillClass: 'healthy',
      label: 'Healthy Flow',
      dividerClass: 'divider-amber' // We only have divider-amber in CSS, could add green but let's reuse
    };
  } else if (signal === 'info') {
    signalConfig = {
      color: '#3B82F6', // blue
      textColor: '#1D4ED8',
      pillClass: 'healthy', // Reuse a light pill or create info
      label: 'Needs Review',
      dividerClass: 'divider-amber'
    };
  }

  // Fallbacks if props are missing
  const displayStory = story || 'No interpretation available for this period.';
  const displaySteps = nextSteps || [];
  const confLevel = confidence?.level || 'unknown';

  return (
    <div className="interpretation-panel" style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: signalConfig.color, borderRadius: '50%' }}></div>
          <div className={`badge-pill ${signalConfig.pillClass}`}>{signalConfig.label}</div>
        </div>
        <div className="badge-pill confidence" style={{ textTransform: 'capitalize' }}>
          Confidence: {confLevel}
        </div>
      </div>

      <hr className={signalConfig.dividerClass} />

      <p className="label-text" style={{ color: signalConfig.textColor }}>WHAT THIS LIKELY MEANS</p>
      <p className="body-text" style={{ marginTop: '8px', lineHeight: '1.8' }}>
        {displayStory}
      </p>

      {displaySteps.length > 0 && (
        <>
          <hr className={signalConfig.dividerClass} />
          <p className="label-text" style={{ color: signalConfig.textColor }}>SUGGESTED NEXT STEPS</p>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displaySteps.map((step, index) => (
              <StepItem key={index} number={index + 1} text={step} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InterpretationPanel;
