export interface LoqateProjectSettings {
  checkoutAddressInputDelay: number;
  checkoutAddressLookupEnabled: boolean;
  checkoutAddressRequestLimit: number;
  checkoutAddressVerificationEnabled: boolean;
  checkoutIpToCountryEnabled: boolean;
  myAccountAddressLookupEnabled: boolean;
  myAccountAddressVerificationEnabled: boolean;
  fetchInProgress: boolean;
  checkoutEmailValidationEnabled: boolean;
  checkoutPhoneValidationEnabled: boolean;
  registrationEmailValidationEnabled: boolean;
  registrationPhoneValidationEnabled: boolean;
}

export interface LoqateSettings {
  addressLookupEnabled: boolean;
  verificationEnabled: boolean;
  ipToCountryEnabled: boolean;
  emailValidationEnabled: boolean;
  phoneValidationEnabled: boolean;
}

export interface LoqateAddressVerifyRequest {
  country: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface LoqateAddressVerifyResponse {
  status: string;
  address1: string;
  country: string;
  postalCode: string;
  locality: string;
}

export interface LoqateIsValidAddress {
  isValid: boolean;
  address1?: string;
}

export interface LoqateAddressInput {
  id?: string;
  text: string;
  countryIsoCode?: string;
  city?: string;
  type?: string;
  postCode?: string;
}
