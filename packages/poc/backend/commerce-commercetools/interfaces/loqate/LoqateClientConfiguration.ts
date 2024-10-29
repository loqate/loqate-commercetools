export interface LoqateClientConfiguration {
  apiKey: string;
  host: string;
  includeValidCatchAllEmails: boolean;
  includeMaybePhoneNumbers: boolean;
  avc: number;
  emailValidationTimeoutMilliseconds: number;
}
