const { pool } = require("../config/db");

async function findUserByEmail(email) {
  const query = `
    SELECT
      id,
      full_name,
      email,
      password_hash,
      terms_accepted,
      privacy_accepted,
      is_verified,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
}

async function createUser({
  fullName,
  email,
  passwordHash,
  termsAccepted,
  privacyAccepted
}) {
  const query = `
    INSERT INTO users (
      full_name,
      email,
      password_hash,
      terms_accepted,
      privacy_accepted,
      is_verified
    )
    VALUES ($1, $2, $3, $4, $5, FALSE)
    RETURNING id, full_name, email, is_verified
  `;

  const values = [
    fullName,
    email,
    passwordHash,
    termsAccepted,
    privacyAccepted
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function updateUnverifiedUser({
  userId,
  fullName,
  passwordHash,
  termsAccepted,
  privacyAccepted
}) {
  const query = `
    UPDATE users
    SET
      full_name = $1,
      password_hash = $2,
      terms_accepted = $3,
      privacy_accepted = $4,
      updated_at = NOW()
    WHERE id = $5
      AND is_verified = FALSE
    RETURNING id, full_name, email, is_verified
  `;

  const values = [
    fullName,
    passwordHash,
    termsAccepted,
    privacyAccepted,
    userId
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

async function markUserAsVerified(userId) {
  const query = `
    UPDATE users
    SET
      is_verified = TRUE,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, is_verified
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

async function invalidateActiveOtps(userId) {
  const query = `
    UPDATE otp_codes
    SET consumed_at = NOW()
    WHERE user_id = $1
      AND consumed_at IS NULL
  `;

  await pool.query(query, [userId]);
}

async function createOtpCode({
  userId,
  otpHash,
  expiresAt,
  resendCount
}) {
  const query = `
    INSERT INTO otp_codes (
      user_id,
      otp_hash,
      expires_at,
      resend_count
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, expires_at, resend_count, attempts, created_at
  `;

  const values = [userId, otpHash, expiresAt, resendCount];
  const { rows } = await pool.query(query, values);

  return rows[0];
}

async function getLatestActiveOtpByUserId(userId) {
  const query = `
    SELECT
      id,
      user_id,
      otp_hash,
      expires_at,
      consumed_at,
      resend_count,
      attempts,
      created_at
    FROM otp_codes
    WHERE user_id = $1
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

async function getLatestOtpByUserId(userId) {
  const query = `
    SELECT
      id,
      user_id,
      otp_hash,
      expires_at,
      consumed_at,
      resend_count,
      attempts,
      created_at
    FROM otp_codes
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

async function incrementOtpAttempts(otpId) {
  const query = `
    UPDATE otp_codes
    SET attempts = attempts + 1
    WHERE id = $1
    RETURNING id, attempts
  `;

  const { rows } = await pool.query(query, [otpId]);
  return rows[0] || null;
}

async function markOtpAsConsumed(otpId) {
  const query = `
    UPDATE otp_codes
    SET consumed_at = NOW()
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [otpId]);
  return rows[0] || null;
}


async function invalidateActivePasswordResetCodes(userId) {
  const query = `
    UPDATE password_reset_codes
    SET consumed_at = NOW()
    WHERE user_id = $1
      AND consumed_at IS NULL
  `;

  await pool.query(query, [userId]);
}

async function createPasswordResetCode({
  userId,
  otpHash,
  expiresAt,
  resendCount
}) {
  const query = `
    INSERT INTO password_reset_codes (
      user_id,
      otp_hash,
      expires_at,
      resend_count
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, expires_at, resend_count, attempts, created_at
  `;

  const values = [userId, otpHash, expiresAt, resendCount];
  const { rows } = await pool.query(query, values);

  return rows[0];
}

async function getLatestActivePasswordResetCodeByUserId(userId) {
  const query = `
    SELECT
      id,
      user_id,
      otp_hash,
      expires_at,
      consumed_at,
      resend_count,
      attempts,
      created_at
    FROM password_reset_codes
    WHERE user_id = $1
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

async function getLatestPasswordResetCodeByUserId(userId) {
  const query = `
    SELECT
      id,
      user_id,
      otp_hash,
      expires_at,
      consumed_at,
      resend_count,
      attempts,
      created_at
    FROM password_reset_codes
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

async function incrementPasswordResetAttempts(resetCodeId) {
  const query = `
    UPDATE password_reset_codes
    SET attempts = attempts + 1
    WHERE id = $1
    RETURNING id, attempts
  `;

  const { rows } = await pool.query(query, [resetCodeId]);
  return rows[0] || null;
}

async function markPasswordResetCodeAsConsumed(resetCodeId) {
  const query = `
    UPDATE password_reset_codes
    SET consumed_at = NOW()
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [resetCodeId]);
  return rows[0] || null;
}

async function updateUserPassword(userId, passwordHash) {
  const query = `
    UPDATE users
    SET
      password_hash = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING id, email
  `;

  const { rows } = await pool.query(query, [passwordHash, userId]);
  return rows[0] || null;
}


module.exports = {
  findUserByEmail,
  createUser,
  updateUnverifiedUser,
  markUserAsVerified,
  invalidateActiveOtps,
  createOtpCode,
  getLatestActiveOtpByUserId,
  getLatestOtpByUserId,
  incrementOtpAttempts,
  markOtpAsConsumed,
  invalidateActivePasswordResetCodes,
  createPasswordResetCode,
  getLatestActivePasswordResetCodeByUserId,
  getLatestPasswordResetCodeByUserId,
  incrementPasswordResetAttempts,
  markPasswordResetCodeAsConsumed,
  updateUserPassword
};