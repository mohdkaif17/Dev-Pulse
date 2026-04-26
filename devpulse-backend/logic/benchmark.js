function buildBenchmark(current, allData) {
  const teamMonth = allData.filter(
    r => r.manager_id === current.manager_id && r.month === current.month
  );

  function stats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      min: parseFloat(sorted[0].toFixed(2)),
      max: parseFloat(sorted[sorted.length - 1].toFixed(2)),
      avg: parseFloat(
        (values.reduce((s, v) => s + v, 0) / values.length).toFixed(2)
      )
    };
  }

  function position(value, min, max) {
    if (max === min) return 50;
    return parseFloat(
      (((value - min) / (max - min)) * 100).toFixed(1)
    );
  }

  const leadStats = stats(teamMonth.map(r => r.avg_lead_time_days));
  const cycleStats = stats(teamMonth.map(r => r.avg_cycle_time_days));
  const bugStats = stats(teamMonth.map(r => r.bug_rate_pct));

  return {
    team_size: teamMonth.length,
    lead_time: {
      ...leadStats,
      yours: current.avg_lead_time_days,
      position: position(current.avg_lead_time_days, leadStats.min, leadStats.max)
    },
    cycle_time: {
      ...cycleStats,
      yours: current.avg_cycle_time_days,
      position: position(current.avg_cycle_time_days, cycleStats.min, cycleStats.max)
    },
    bug_rate: {
      ...bugStats,
      yours: current.bug_rate_pct,
      position: position(current.bug_rate_pct, bugStats.min, bugStats.max)
    }
  };
}

module.exports = { buildBenchmark };
