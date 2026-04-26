const express = require("express");
const router = express.Router();
const data = require("../data/metrics.json");

router.get("/", (req, res) => {
  const seen = new Set();
  const developers = data
    .filter(row => {
      if (seen.has(row.developer_id)) return false;
      seen.add(row.developer_id);
      return true;
    })
    .map(row => ({
      developer_id: row.developer_id,
      developer_name: row.developer_name,
      team_name: row.team_name,
      level: row.level,
      service_type: row.service_type,
      manager_id: row.manager_id,
      manager_name: row.manager_name
    }));
  res.json(developers);
});

router.get("/:devId", (req, res) => {
  const { devId } = req.params;
  const devRows = data.filter(r => r.developer_id === devId);
  if (devRows.length === 0) {
    return res.status(404).json({ error: "Developer not found." });
  }
  const profile = {
    developer_id: devRows[0].developer_id,
    developer_name: devRows[0].developer_name,
    team_name: devRows[0].team_name,
    level: devRows[0].level,
    service_type: devRows[0].service_type,
    manager_name: devRows[0].manager_name,
    months_available: devRows.map(r => r.month).sort()
  };
  res.json(profile);
});

module.exports = router;
