const express = require("express");
const router = express.Router();
const data = require("../data/metrics.json");
const { interpretMetrics } = require("../logic/interpret");

router.get("/", (req, res) => {
  const seen = new Set();
  const managers = data
    .filter(row => {
      if (seen.has(row.manager_id)) return false;
      seen.add(row.manager_id);
      return true;
    })
    .map(row => ({
      manager_id: row.manager_id,
      manager_name: row.manager_name
    }));
  res.json(managers);
});

router.get("/:managerId/:month", (req, res) => {
  const { managerId, month } = req.params;

  const teamData = data.filter(
    r => r.manager_id === managerId && r.month === month
  );

  if (teamData.length === 0) {
    return res.status(404).json({ error: "No team data found." });
  }

  const allMonths = [...new Set(data.map(r => r.month))].sort();
  const currentIndex = allMonths.indexOf(month);
  const previousMonth = currentIndex > 0 ? allMonths[currentIndex - 1] : null;

  const developers = teamData.map(row => {
    const previous = previousMonth
      ? data.find(
          r => r.developer_id === row.developer_id && r.month === previousMonth
        )
      : null;
    const interp = interpretMetrics(row, previous);
    return {
      developer_id: row.developer_id,
      developer_name: row.developer_name,
      level: row.level,
      avg_lead_time_days: row.avg_lead_time_days,
      avg_cycle_time_days: row.avg_cycle_time_days,
      bug_rate_pct: row.bug_rate_pct,
      prod_deployments: row.prod_deployments,
      merged_prs: row.merged_prs,
      pattern_hint: row.pattern_hint,
      signal: interp.signal
    };
  });

  const avg = key =>
    parseFloat(
      (teamData.reduce((s, r) => s + r[key], 0) / teamData.length).toFixed(2)
    );

  res.json({
    manager_id: managerId,
    manager_name: teamData[0].manager_name,
    month,
    team_size: teamData.length,
    avg_lead_time_days: avg("avg_lead_time_days"),
    avg_cycle_time_days: avg("avg_cycle_time_days"),
    avg_bug_rate_pct: avg("bug_rate_pct"),
    total_deployments: teamData.reduce((s, r) => s + r.prod_deployments, 0),
    total_merged_prs: teamData.reduce((s, r) => s + r.merged_prs, 0),
    developers
  });
});

module.exports = router;
