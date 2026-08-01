'use strict';

/**
 * roles.constants.js
 *
 * Defines the four user roles established in SRS Chapter 1 (Section 1.5).
 * These values are used as the role field on the User model and are the
 * vocabulary for all RBAC checks throughout the application.
 *
 * Frozen to prevent accidental mutation at runtime.
 */

const ROLES = Object.freeze({
  ADMINISTRATOR: 'ADMINISTRATOR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  CLIENT: 'CLIENT',
});

/**
 * Roles that are considered internal organisation members.
 * Used in middleware and business logic to distinguish internal
 * team members from external Client-role users.
 */
const INTERNAL_ROLES = Object.freeze([
  ROLES.ADMINISTRATOR,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
]);

/**
 * Roles that have elevated management authority within an organisation.
 * Used in middleware guards for operations that require at least Manager
 * level access (e.g., creating projects, changing visibility).
 */
const MANAGEMENT_ROLES = Object.freeze([ROLES.ADMINISTRATOR, ROLES.MANAGER]);

module.exports = { ROLES, INTERNAL_ROLES, MANAGEMENT_ROLES };
