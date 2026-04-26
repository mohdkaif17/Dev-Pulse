function generateInsights(allData, month) {
  const thisMonth = allData.filter(r => r.month === month);

  const allMonths = [...new Set(allData.map(r => r.month))].sort();
  const monthIndex = allMonths.indexOf(month);
  const prevMonth = monthIndex > 0 ? allMonths[monthIndex - 1] : null;
  const lastMonth = prevMonth
    ? allData.filter(r => r.month === prevMonth)
    : [];

  const insights = [];

  const buggyDevs = thisMonth.filter(r => r.bug_rate_pct >= 0.5);
  if (buggyDevs.length >= 2) {
    const prevBuggyCount = lastMonth.filter(r => r.bug_rate_pct >= 0.5).length;
    insights.push({
      id: "team-bug-pattern",
      type: "warning",
      title: buggyDevs.length + " developers had escaped bugs this month",
      body: prevBuggyCount < buggyDevs.length
        ? "This is up from " + prevBuggyCount + " developer" +
          (prevBuggyCount === 1 ? "" : "s") + " last month. " +
          "When multiple team members show the same quality signal " +
          "in the same period, the root cause is often a shared " +
          "process or release change rather than individual issues."
        : "When multiple team members show the same quality signal " +
          "in the same period, the root cause is often a shared " +
          "process or release change rather than individual performance.",
      affected: buggyDevs.map(d => d.developer_name),
      link: "team"
    });
  }

  if (prevMonth) {
    const improved = thisMonth.filter(r => {
      const prev = lastMonth.find(p => p.developer_id === r.developer_id);
      return prev && prev.bug_rate_pct > 0 && r.bug_rate_pct === 0
        && r.pattern_hint !== prev.pattern_hint;
    });

    improved.forEach(dev => {
      const prev = lastMonth.find(p => p.developer_id === dev.developer_id);
      insights.push({
        id: "improved-" + dev.developer_id,
        type: "positive",
        title: dev.developer_name + " moved from " + prev.pattern_hint +
          " to " + dev.pattern_hint,
        body: "Bug rate dropped from " + (prev.bug_rate_pct * 100) +
          "% to 0% month over month" +
          (dev.avg_cycle_time_days < prev.avg_cycle_time_days
            ? " and cycle time improved by " +
              (prev.avg_cycle_time_days - dev.avg_cycle_time_days).toFixed(2) +
              " days"
            : "") +
          ". This kind of turnaround is worth understanding — " +
          "what changed could help others on the team.",
        stats: [
          "Bug rate: " + (prev.bug_rate_pct * 100) + "% to 0%",
          "Cycle time: " + prev.avg_cycle_time_days + " to " +
            dev.avg_cycle_time_days + " days"
        ],
        link: "developer/" + dev.developer_id
      });
    });
  }

  const slowest = thisMonth.reduce((a, b) =>
    b.avg_cycle_time_days > a.avg_cycle_time_days ? b : a
  );
  const teamAvgCycle = parseFloat(
    (thisMonth.reduce((s, r) => s + r.avg_cycle_time_days, 0) /
      thisMonth.length).toFixed(2)
  );

  if (slowest.avg_cycle_time_days > teamAvgCycle + 1) {
    insights.push({
      id: "slow-cycle-" + slowest.developer_id,
      type: "info",
      title: slowest.developer_name +
        " has the slowest cycle time on the team this month",
      body: "At " + slowest.avg_cycle_time_days +
        " days, cycle time sits above the team average of " +
        teamAvgCycle + " days. " +
        (slowest.bug_rate_pct === 0
          ? "Quality looks clean with no escaped bugs — ticket " +
            "complexity or blockers may be worth a conversation."
          : "Combined with escaped bugs, this suggests both " +
            "speed and quality need attention."),
      stats: [
        "Cycle time: " + slowest.avg_cycle_time_days + " days",
        "Team average: " + teamAvgCycle + " days"
      ],
      link: "developer/" + slowest.developer_id
    });
  }

  if (prevMonth) {
    const worsened = thisMonth.filter(r => {
      const prev = lastMonth.find(p => p.developer_id === r.developer_id);
      return prev && prev.pattern_hint === "Healthy flow"
        && r.pattern_hint !== "Healthy flow";
    });

    worsened.forEach(dev => {
      insights.push({
        id: "worsened-" + dev.developer_id,
        type: "warning",
        title: dev.developer_name + "'s pattern shifted to " + dev.pattern_hint,
        body: "Previously on Healthy flow, this month's metrics " +
          "indicate a shift worth watching. " +
          (dev.bug_rate_pct > 0
            ? "Bug rate moved to " + (dev.bug_rate_pct * 100) + "%."
            : "Cycle time moved to " + dev.avg_cycle_time_days + " days.") +
          " One month of change could be noise — " +
          "two months would be a pattern.",
        link: "developer/" + dev.developer_id
      });
    });
  }

  return insights;
}

module.exports = { generateInsights };
