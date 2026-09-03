'use strict';

/**
 * dashboard.constants.js
 *
 * Constants and metrics configurations for the Dashboard & Analytics module.
 *
 * SRS references:
 *  - FR-DASH-001 through FR-DASH-004 (Role-specific views)
 *  - FR-DASH-012 (Upcoming deadlines window)
 */

const DASHBOARD_METRIC_TYPES = Object.freeze({
  OVERVIEW:    'OVERVIEW',
  WORKLOAD:    'WORKLOAD',
  DEADLINES:   'DEADLINES',
  RECENT:      'RECENT',
});

// Default window for upcoming deadlines: 7 days
const DEFAULT_DEADLINE_WINDOW_DAYS = 7;

module.exports = {
  DASHBOARD_METRIC_TYPES,
  DEFAULT_DEADLINE_WINDOW_DAYS,
};
