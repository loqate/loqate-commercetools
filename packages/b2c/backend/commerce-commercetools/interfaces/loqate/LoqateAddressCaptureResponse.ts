export interface LoqateAddressCaptureResponse {
  items: Array<{
    id: string;
    text: string;
    highlight: string;
    description: string;
    type: string;
    error?: string;
  }>;
}
