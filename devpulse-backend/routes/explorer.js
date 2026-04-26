const express = require("express");
const router = express.Router();
const data = require("../data/metrics.json");

const VALID_METRICS = [
  "avg_lead_time_days",
  "avg_cycle_time_days",
  "bug_rate_pct",
  "prod_deployments",
  "merged_prs"
];

router.get("/:metric/:month", (req, res) => {
  const { metric, month } = req.params;

  if (!VALID_METRICS.includes(metric)) {
    return res.status(400).json({
      error: "Invalid metric. Valid options: " + VALID_METRICS.join(", ")
    });
  }

  const monthData = data.filter(r => r.month === month);

  if (monthData.length === 0) {
    return res.status(404).json({ error: "No data found for this month." });
  }

  const lowerIsBetter = [
    "avg_lead_time_days",
    "avg_cycle_time_days",
    "bug_rate_pct"
  ];

  const sorted = [...monthData].sort((a, b) =>
    lowerIsBetter.includes(metric)
      ? a[metric] - b[metric]
      : b[metric] - a[metric]
  );

  const values = monthData.map(r => r[metric]);
  const teamAvg = parseFloat(
    (values.reduce((s, v) => s + v, 0) / values.length).toFixed(2)
  );
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  const ranked = sorted.map((row, index) => ({
    rank: index + 1,
    developer_id: row.developer_id,
    developer_name: row.developer_name,
    team_name: row.team_name,
    value: row[metric],
    pattern_hint: row.pattern_hint,
    bar_position: parseFloat(
      maxVal === minVal
        ? 50
        : (((row[metric] - minVal) / (maxVal - minVal)) * 100).toFixed(1)
    )
  }));

  let insight = null;
  if (metric === "bug_rate_pct") {
    const buggyCount = monthData.filter(r => r.bug_rate_pct >= 0.5).length;
    if (buggyCount >= 2) {
      insight = buggyCount + " out of " + monthData.length +
        " developers had escaped bugs this month. When multiple " +
        "team members show the same quality signal, the root cause " +
        "is often a shared process change.";
    }
  }

  if (metric === "avg_cycle_time_days") {
    const slowCount = monthData.filter(
      r => r.avg_cycle_time_days > teamAvg + 1
    ).length;
    if (slowCount >= 2) {
      insight = slowCount + " developers have cycle times more than " +
        "1 day above the team average. This may indicate shared " +
        "blockers or overly large tickets across the team.";
    }
  }

  res.json({
    metric,
    month,
    team_avg: teamAvg,
    min: minVal,
    max: maxVal,
    lower_is_better: lowerIsBetter.includes(metric),
    insight,
    ranked
  });
});

module.exports = router;
