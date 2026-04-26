const express = require("express");
const router = express.Router();
const data = require("../data/metrics.json");
const { interpretMetrics } = require("../logic/interpret");
const { buildChangeStory } = require("../logic/changeStory");
const { buildBenchmark } = require("../logic/benchmark");

router.get("/months", (req, res) => {
  const months = [...new Set(data.map(r => r.month))].sort();
  res.json(months);
});

router.get("/:devId/:month", (req, res) => {
  const { devId, month } = req.params;

  const current = data.find(
    r => r.developer_id === devId && r.month === month
  );

  if (!current) {
    return res.status(404).json({
      error: "No data found for this developer and month."
    });
  }

  const allMonths = [...new Set(data.map(r => r.month))].sort();
  const currentIndex = allMonths.indexOf(month);
  const previousMonth = currentIndex > 0 ? allMonths[currentIndex - 1] : null;

  const previous = previousMonth
    ? data.find(r => r.developer_id === devId && r.month === previousMonth)
    : null;

  const trend = previous ? {
    lead_time: parseFloat(
      (current.avg_lead_time_days - previous.avg_lead_time_days).toFixed(2)
    ),
    cycle_time: parseFloat(
      (current.avg_cycle_time_days - previous.avg_cycle_time_days).toFixed(2)
    ),
    bug_rate: parseFloat(
      (current.bug_rate_pct - previous.bug_rate_pct).toFixed(2)
    ),
    deployments: current.prod_deployments - previous.prod_deployments,
    merged_prs: current.merged_prs - previous.merged_prs
  } : null;

  const interpretation = interpretMetrics(current, previous);
  const changeStory = buildChangeStory(current, previous);
  const benchmark = buildBenchmark(current, data);

  res.json({ ...current, trend, interpretation, changeStory, benchmark });
});

module.exports = router;
