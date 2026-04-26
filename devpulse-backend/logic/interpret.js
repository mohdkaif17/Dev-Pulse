function interpretMetrics(current, previous) {
  const {
    developer_name,
    avg_lead_time_days,
    avg_cycle_time_days,
    bug_rate_pct,
    prod_deployments,
    merged_prs,
    pattern_hint,
    team_name,
    issues_done
  } = current;

  let story = "";
  let nextSteps = [];
  let signal = "success";
  let focusArea = null;

  if (bug_rate_pct >= 0.5 && avg_cycle_time_days < 4.5) {
    signal = "warning";
    focusArea = "Review quality process";
    story = developer_name + " is moving fast with a cycle time of " +
      avg_cycle_time_days + " days, but " + (bug_rate_pct * 100) +
      "% of completed work had an escaped production bug. " +
      "When speed and quality diverge like this, it usually means " +
      "tickets are being closed before edge cases are fully tested.";
    nextSteps = [
      "Add a self-review checklist before marking any ticket Done.",
      "Write at least one test per ticket, even a small one.",
      "Consider pairing with a teammate on the next complex task."
    ];
  }
  else if (bug_rate_pct >= 0.5 && avg_cycle_time_days >= 4.5) {
    signal = "warning";
    focusArea = "Reduce ticket complexity";
    story = developer_name + "'s bug rate is " + (bug_rate_pct * 100) +
      "% this month alongside a cycle time of " +
      avg_cycle_time_days + " days. This combination often points " +
      "to tickets that are too large or complex, making it hard " +
      "to track and test every change thoroughly.";
    nextSteps = [
      "Break large tickets into smaller reviewable chunks before starting.",
      "Ask for a code review midway through, not just at the end.",
      "Discuss ticket scope with your team before picking up complex work."
    ];
  }
  else if (pattern_hint === "Needs review" || avg_cycle_time_days > 5.5) {
    signal = "info";
    focusArea = "Investigate what is slowing the pace";
    story = developer_name + "'s cycle time is " +
      avg_cycle_time_days + " days this month, noticeably higher " +
      "than average. Quality looks fine with no escaped bugs, but " +
      "work is staying In Progress longer than expected. This could " +
      "mean complex tickets or mid-task blockers.";
    nextSteps = [
      "Flag blockers early — do not wait until the ticket is overdue.",
      "Check if the current ticket can be split to ship something sooner.",
      "Discuss with your manager whether the scope is right-sized."
    ];
  }
  else if (avg_lead_time_days > 4.0 && bug_rate_pct === 0) {
    signal = "info";
    focusArea = "Check pipeline and review delays";
    story = developer_name + "'s development quality looks solid " +
      "with no escaped bugs, but lead time is " +
      avg_lead_time_days + " days. The extra delay is likely " +
      "happening after the PR is opened — waiting for review, " +
      "CI pipeline, or deployment queue.";
    nextSteps = [
      "Check how long PRs sit before getting a first review.",
      "Ask your manager if there is a deployment bottleneck on the " + team_name + " team.",
      "Break PRs into smaller pieces to speed up review turnaround."
    ];
  }
  else {
    signal = "success";
    focusArea = null;
    story = developer_name + " is having a strong month — lead time " +
      "at " + avg_lead_time_days + " days, cycle time at " +
      avg_cycle_time_days + " days, and no escaped production bugs. " +
      "Shipping " + prod_deployments + " times with " + merged_prs +
      " merged PRs shows a consistent and reliable delivery rhythm.";
    nextSteps = [
      "Share what is working — your rhythm could help struggling teammates.",
      "Consider taking on a slightly more complex ticket next sprint."
    ];
  }

  let confidence = { level: "medium", reason: "" };
  if (issues_done < 2) {
    confidence = {
      level: "low",
      reason: "Only 1 issue completed — too little data for reliable patterns."
    };
  } else if (!previous) {
    confidence = {
      level: "low",
      reason: "Only one month of data. Trends become clearer with more history."
    };
  } else if (pattern_hint === previous.pattern_hint) {
    confidence = {
      level: "medium",
      reason: "Pattern is consistent across two months."
    };
  } else {
    confidence = {
      level: "low",
      reason: "Pattern changed from last month — could be a real shift or variability."
    };
  }

  return { story, nextSteps, signal, pattern_hint, focusArea, confidence };
}

module.exports = { interpretMetrics };
