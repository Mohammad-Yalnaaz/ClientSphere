'use strict';

/**
 * comments.constants.js
 *
 * Constants for the Comment entity.
 *
 * SRS references:
 *  - FR-COMMENT-001, FR-COMMENT-002 (comments on Task and Project)
 *  - FR-COMMENT-013 (visibility — internal vs client-visible)
 */

/**
 * Entity types a comment can be attached to.
 * Supports polymorphic attachment (FR-COMMENT-001, FR-COMMENT-002).
 */
const COMMENT_ENTITY_TYPES = Object.freeze({
  TASK:    'TASK',
  PROJECT: 'PROJECT',
});

/**
 * Visibility levels for a comment.
 * INTERNAL  — visible only to org team members (not CLIENT-role users).
 * CLIENT    — visible to CLIENT-role users as well (FR-COMMENT-013).
 */
const COMMENT_VISIBILITY = Object.freeze({
  INTERNAL: 'INTERNAL',
  CLIENT:   'CLIENT',
});

module.exports = {
  COMMENT_ENTITY_TYPES,
  COMMENT_VISIBILITY,
};
