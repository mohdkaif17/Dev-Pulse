const express = require("express");
const cors = require("cors");

const developerRoutes = require("./routes/developers");
const metricsRoutes = require("./routes/metrics");
const managerRoutes = require("./routes/manager");
const explorerRoutes = require("./routes/explorer");
const insightsRoutes = require("./routes/insights");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(new Date().toISOString() + " " + req.method + " " + req.url);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/developers", developerRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/explorer", explorerRoutes);
app.use("/api/insights", insightsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("DevPulse backend running on http://localhost:" + PORT);
});
