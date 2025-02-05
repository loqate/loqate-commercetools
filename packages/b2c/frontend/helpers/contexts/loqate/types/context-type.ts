import { LoqateAddressInput, LoqateProjectSettings } from './loqate';
import { LoqateSuggestedAddresses, LoqateAddress } from './loqate-suggested-address';

export interface ContextType {
  suggestedAddresses: LoqateSuggestedAddresses;
  loqateAddress: LoqateAddress;
  verifyAddress: any;
  isValidAddress: any;
  isValidEmail: any;
  emailValidationIsInProgress: any;
  isValidPhone: any;
  phoneValidationIsInProgress: any;
  setLoqateAddress: any;
  loqateProjectSettings: LoqateProjectSettings;
  setLoqateSettings: any;
  validateEmail: any;
  validatePhone: any;
  bypassAddressVerification: boolean;
  setBypassAddressVerification: any;
  setIsValidAddress: any;
}
