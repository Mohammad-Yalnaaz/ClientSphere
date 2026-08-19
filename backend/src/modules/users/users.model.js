'use strict';

/**
 * users.model.js
 *
 * Mongoose schema for the User entity.
 *
 * Design decisions:
 * - Role is a property of User, not a standalone entity (SRS §3.4 refined note).
 * - password is never returned in API responses — the toJSON transform
 *   strips it and googleId is similarly excluded for security.
 * - googleId enables Google OAuth account linking (FR-AUTH-005, FR-AUTH-006).
 * - refreshToken is stored here to support token rotation / logout invalidation
 *   (ARCHITECTURE_DECISIONS.md §4).
 * - isActive supports deactivation (FR-AUTH-016, FR-USER-006) without deletion,
 *   preserving historical attribution per SRS §3.8.3.
 * - passwordChangedAt is used by the authenticate middleware to reject tokens
 *   issued before the most recent password change (security best practice).
 * - No business logic — schema and indexes only, per ARCHITECTURE_DECISIONS.md §9.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../../constants/roles.constants');

const userSchema = new mongoose.Schema(
  {
    // ── Organization binding (SRS §3.5.1) ────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'User must belong to an Organization.'],
      index: true,
    },

    // ── Identity ──────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
      maxlength: [50, 'First name must not exceed 50 characters.'],
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true,
      maxlength: [50, 'Last name must not exceed 50 characters.'],
    },

    email: {
      type: String,
      required: [true, 'Email is required.'],
      lowercase: true,
      trim: true,
      // Uniqueness enforced via compound index below (email + organizationId).
    },

    // ── Authentication ────────────────────────────────────────────────────
    // Nullable — users who registered via Google OAuth have no password.
    password: {
      type: String,
      default: null,
      select: false, // Never returned by default queries.
    },

    // Google OAuth identifier for account linking (FR-AUTH-005, FR-AUTH-006).
    googleId: {
      type: String,
      default: null,
      select: false,
    },

    // Stores the current valid refresh token (ARCHITECTURE_DECISIONS.md §4).
    // Hashed before storage; null means no active session.
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    // Used to invalidate access tokens issued before a password change.
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Role (SRS §3.4, §3.4 refined note) ───────────────────────────────
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: `Role must be one of: ${Object.values(ROLES).join(', ')}.`,
      },
      required: [true, 'User role is required.'],
      default: ROLES.EMPLOYEE,
    },

    // ── Profile extras ────────────────────────────────────────────────────
    avatarUrl: {
      type: String,
      default: null,
    },

    // ── Account status ────────────────────────────────────────────────────
    // Supports deactivation (FR-AUTH-016) without hard deletion.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        // Never expose sensitive fields in serialised output.
        delete ret.password;
        delete ret.googleId;
        delete ret.refreshToken;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Virtual ───────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Indexes ───────────────────────────────────────────────────────────────────
// Enforce email uniqueness within an organization (SRS §3.6.7).
// A user may have the same email in different organizations (future multi-tenancy).
userSchema.index({ email: 1, organizationId: 1 }, { unique: true });

// Fast lookup by email alone (used during login without knowing organizationId).
userSchema.index({ email: 1 });

// Fast lookup by googleId for OAuth account association (FR-AUTH-005).
userSchema.index({ googleId: 1 }, { sparse: true });

// ── Pre-save hook: hash password ──────────────────────────────────────────────
// NOTE: This is the only Mongoose middleware in this schema.
// ARCHITECTURE_DECISIONS.md §3 prohibits hooks for activity logging,
// but password hashing at the model level is a data-integrity concern,
// not business logic, and ensures the plain text is never persisted
// regardless of which service calls save().
userSchema.pre('save', async function (next) {
  // Only re-hash when the password field has actually changed.
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);

  // Invalidate any tokens issued before this password change.
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// ── Instance method: verify password ─────────────────────────────────────────
// Kept on the model because it is a pure data concern (comparing stored hash),
// not business logic in the service sense.
userSchema.methods.isPasswordMatch = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: was token issued before password change? ─────────────────
userSchema.methods.isTokenIssuedBeforePasswordChange = function (jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;
  const changedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIssuedAt < changedAtSeconds;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
