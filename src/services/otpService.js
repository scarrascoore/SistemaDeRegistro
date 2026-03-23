const bcrypt = require("bcryptjs");
const { generateOtp } = require("../utils/generateOtp");

const OTP_EXPIRES_MINUTES = 5;
const OTP_SALT_ROUNDS = 10;
const MAX_OTP_ATTEMPTS = 5;
const MAX_RESEND_COUNT = 5;

async function createOtpPayload() {
  const otpPlain = generateOtp();
  const otpHash = await bcrypt.hash(otpPlain, OTP_SALT_ROUNDS);

  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  return {
    otpPlain,
    otpHash,
    expiresAt
  };
}

async function compareOtp(plainOtp, hashedOtp) {
  return bcrypt.compare(plainOtp, hashedOtp);
}

function isOtpExpired(expiresAt) {
  return new Date(expiresAt).getTime() <= Date.now();
}

module.exports = {
  OTP_EXPIRES_MINUTES,
  MAX_OTP_ATTEMPTS,
  MAX_RESEND_COUNT,
  createOtpPayload,
  compareOtp,
  isOtpExpired
};