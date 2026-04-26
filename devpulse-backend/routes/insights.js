const express = require("express");
const router = express.Router();
const data = require("../data/metrics.json");
const { generateInsights } = require("../logic/insights");

router.get("/:month", (req, res) => {
  const { month } = req.params;

  const monthData = data.filter(r => r.month === month);

  if (monthData.length === 0) {
    return res.status(404).json({
      error: "No data found for this month."
    });
  }

  const insights = generateInsights(data, month);

  res.json({
    month,
    total: insights.length,
    insights
  });
});

module.exports = router;
