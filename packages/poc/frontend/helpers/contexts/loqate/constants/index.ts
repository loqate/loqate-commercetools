export const SETTINGS_LOCAL_STORAGE_KEY = 'loqateSettings';
export const SETTINGS_CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
export const DEFAULT_PROJECT_SETTINGS_VALUES = {
  checkoutAddressInputDelay: 1000,
  checkoutAddressLookupEnabled: false,
  checkoutAddressRequestLimit: 7,
  checkoutAddressVerificationEnabled: false,
  checkoutEmailValidationEnabled: false,
  checkoutPhoneValidationEnabled: false,
  checkoutIpToCountryEnabled: false,
  myAccountAddressLookupEnabled: false,
  myAccountAddressVerificationEnabled: false,
  fetchInProgress: true,
  registrationEmailValidationEnabled: false,
  registrationPhoneValidationEnabled: false,
};

export const DEFAULT_LOQATE_SETTINGS_VALUES = {
  addressLookupEnabled: false,
  verificationEnabled: false,
  ipToCountryEnabled: false,
  emailValidationEnabled: false,
  phoneValidationEnabled: false,
};

export const ADDRESS_CACHE_KEY = 'loqateAddressCache';
export const ADDRESS_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
