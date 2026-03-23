const crypto = require("crypto");

const OTP_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const OTP_LENGTH = 6;

function generateOtp() {
  let otp = "";

  for (let index = 0; index < OTP_LENGTH; index += 1) {
    const randomIndex = crypto.randomInt(0, OTP_CHARACTERS.length);
    otp += OTP_CHARACTERS[randomIndex];
  }

  return otp;
}

module.exports = {
  generateOtp,
  OTP_LENGTH
};