export interface EnhancedLoqateAddressCaptureResponse {
  items: Array<{
    id: string;
    text: string;
    highlight: string;
    description: string;
    type: string;
    postCode?: string;
    city?: string;
    countryIsoCode?: string;
  }>;
}
