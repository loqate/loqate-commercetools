export interface LoqateAddress {
  id: string;
  text: string;
  description?: string;
  type?: string;
  postCode?: string;
  city?: string;
  countryIsoCode?: string;
  isManualInput: boolean;
  phone?: string;
  email?: string;
}

export interface LoqateSuggestedAddresses {
  items: Array<LoqateAddress>;
}
