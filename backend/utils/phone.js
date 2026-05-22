const INTERNATIONAL_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const normalizePhoneNumber = (value = "") => value.replace(/[\s()-]/g, "").trim();

const isValidInternationalPhone = (value = "") =>
  INTERNATIONAL_PHONE_REGEX.test(normalizePhoneNumber(value));

const assertValidInternationalPhone = (value = "") => {
  const normalized = normalizePhoneNumber(value);

  if (!isValidInternationalPhone(normalized)) {
    const error = new Error(
      "Phone number must use international format like +919876543210."
    );
    error.code = "INVALID_PHONE";
    throw error;
  }

  return normalized;
};

const phoneToSyntheticUid = (phoneNumber) =>
  `phone-session-${normalizePhoneNumber(phoneNumber).replace(/\D/g, "")}`;

module.exports = {
  INTERNATIONAL_PHONE_REGEX,
  normalizePhoneNumber,
  isValidInternationalPhone,
  assertValidInternationalPhone,
  phoneToSyntheticUid,
};
