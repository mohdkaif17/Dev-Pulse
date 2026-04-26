function buildChangeStory(current, previous) {
  if (!previous) return null;

  const bugDelta = current.bug_rate_pct - previous.bug_rate_pct;
  const cycleDelta = current.avg_cycle_time_days - previous.avg_cycle_time_days;
  const leadDelta = current.avg_lead_time_days - previous.avg_lead_time_days;
  const name = current.developer_name;

  if (bugDelta > 0 && cycleDelta < 0) {
    return {
      type: "warning",
      text: "Bug rate rose while cycle time dropped — this month's " +
        "speed may have come at a quality cost. Worth checking " +
        "what changed in the review or testing process."
    };
  }

  if (bugDelta < 0 && cycleDelta > 0) {
    return {
      type: "positive",
      text: "Quality improved this month even though work took longer. " +
        "The slower pace appears to be paying off in fewer escaped bugs."
    };
  }

  if (leadDelta > 1.0 && bugDelta === 0) {
    return {
      type: "info",
      text: "Lead time increased by " + leadDelta.toFixed(1) +
        " days but quality stayed clean. The delay is likely in " +
        "the pipeline or review process, not in the work itself."
    };
  }

  if (bugDelta <= 0 && cycleDelta < 0 && leadDelta < 0) {
    return {
      type: "positive",
      text: name + " improved across the board this month — " +
        "faster cycle time, faster lead time, and clean quality."
    };
  }

  if (previous.bug_rate_pct > 0 && current.bug_rate_pct === 0) {
    return {
      type: "positive",
      text: "Bug rate dropped from " + (previous.bug_rate_pct * 100) +
        "% to 0% — a meaningful quality improvement from last month."
    };
  }

  if (current.pattern_hint !== previous.pattern_hint) {
    return {
      type: "info",
      text: "Pattern shifted from " + previous.pattern_hint +
        " in " + previous.month + " to " + current.pattern_hint +
        " this month. Something in the workflow may have changed."
    };
  }

  return null;
}

module.exports = { buildChangeStory };
