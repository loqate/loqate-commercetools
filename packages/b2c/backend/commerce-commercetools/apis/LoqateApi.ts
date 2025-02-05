import axios from 'axios';
import {
  LoqateClientConfiguration,
  LoqateAddressCaptureRequest,
  LoqateAddressCaptureResponse,
  EnhancedLoqateAddressCaptureResponse,
  LoqateAddressVerifyRequest,
  LoqateAddressVerifyResponse,
  LoqateGetCountryByIpAddressRequest,
  LoqateGetCountryByIpAddressResponse,
  LoqateValidateEmailRequest,
  LoqateValidateEmailItemResponse,
  LoqateValidatePhoneRequest,
  InternalLoqateValidatePhoneItemResponse,
  LoqateValidatePhoneItemResponse,
} from '../interfaces/loqate';
import { toCamelCase } from '../utils/toCamelCase';
import { buildQueryString } from '../utils/buildQueryString';

const SOURCE_KEY = 'CommerceToolsV1.0.0.0';

const goodAddressVerificationLevels = ['P4', 'V4', 'V5'] as const;
type GoodAddressVerificationLevel = (typeof goodAddressVerificationLevels)[number];

function isValidAddress(
  matchScore: number,
  addressVerificationLevel: GoodAddressVerificationLevel,
  goodAddressMinimumMatchscore: number,
): string {
  if (goodAddressVerificationLevels.includes(addressVerificationLevel) && matchScore >= goodAddressMinimumMatchscore) {
    return 'Valid';
  }

  if (
    goodAddressVerificationLevels.includes(addressVerificationLevel) &&
    matchScore >= 80 &&
    matchScore < goodAddressMinimumMatchscore
  ) {
    return 'Questionable';
  }

  return 'Invalid';
}

function extractDescription(description: string): { postCode: string; city: string } {
  const parts = description.split(' ');
  let postCode = '';
  let city = '';

  parts.forEach((part) => {
    if (/\d/.test(part)) {
      postCode += part + ' ';
    } else {
      city += part + ' ';
    }
  });

  return {
    postCode: postCode.trim(),
    city: city.trim(),
  };
}

function extractCountryIsoCode(id: string): string {
  const regex = /^([A-Z]{2})\|/;
  const match = id.match(regex);
  return match ? match[1] : '';
}

export class LoqateApi {
  private apiKey: string;
  private host: string;
  private avc: number;
  private emailValidationTimeoutMilliseconds: number;
  private includeValidCatchAllEmails: boolean;
  private includeMaybePhoneNumbers: boolean;

  constructor(config: LoqateClientConfiguration) {
    this.apiKey = config.apiKey;
    this.host = config.host;
    this.avc = config.avc;
    this.emailValidationTimeoutMilliseconds = config.emailValidationTimeoutMilliseconds;
    this.includeValidCatchAllEmails = config.includeValidCatchAllEmails;
    this.includeMaybePhoneNumbers = config.includeMaybePhoneNumbers;
  }

  public async getAddresses(query: LoqateAddressCaptureRequest): Promise<EnhancedLoqateAddressCaptureResponse> {
    const { id, text, limit = 12, countryIsoCode, city } = query;

    const queryString = buildQueryString({
      key: this.apiKey,
      text: text,
      limit: limit,
      countries: countryIsoCode,
      source: SOURCE_KEY,
      Container: id,
      filters: city ? `Locality:${city}` : undefined,
    });

    const url = `${this.host}/Capture/Interactive/Find/v1.1/json3.ws?${queryString}`;

    try {
      const response = await axios.get(url);
      const result: LoqateAddressCaptureResponse = toCamelCase(response.data);

      const enhancedResponse: EnhancedLoqateAddressCaptureResponse = {
        items: result.items.map((item) => {
          if (item.type !== 'Address') {
            return {
              ...item,
            };
          }

          const { postCode, city } = extractDescription(item.description);
          const countryIsoCode = extractCountryIsoCode(item.id);

          return {
            ...item,
            postCode,
            city,
            countryIsoCode,
          };
        }),
      };
      return enhancedResponse as EnhancedLoqateAddressCaptureResponse;
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  }

  public async verifyAddress(request: LoqateAddressVerifyRequest): Promise<LoqateAddressVerifyResponse | any> {
    const requiredFields = ['country', 'postalCode', 'city', 'address'];

    for (const field of requiredFields) {
      if (!request || typeof request[field] !== 'string' || request[field].length === 0) {
        return { isValid: false };
      }
    }

    let url = `${this.host}/Cleansing/International/Batch/v1.00/json4.ws?source=${SOURCE_KEY}`;

    const data = {
      key: this.apiKey,
      addresses: [
        {
          address1: `${request.address}, ${request.city}`,
          postalCode: request.postalCode,
          country: request.country,
        },
      ],
    };

    try {
      const response = await axios.post(url, data);
      const responseData = await response.data;
      const responseDataInCamelCase = toCamelCase(responseData);

      if (Array.isArray(responseDataInCamelCase) && responseDataInCamelCase.length > 0) {
        const firstInput = responseDataInCamelCase[0];
        if (firstInput.matches && firstInput.matches.length > 0) {
          const firstMatch = firstInput.matches[0];
          const avcParts = firstMatch.aVC.split('-');
          const addressVerificationLevel: GoodAddressVerificationLevel = avcParts[0].substring(0, 2);
          const matchScore = +avcParts[avcParts.length - 1];
          const status = isValidAddress(matchScore, addressVerificationLevel, this.avc);
          return {
            ...firstMatch,
            status,
          };
        }
      }
      return {
        status: 'Invalid',
      };
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  }

  public async getCountryByIp(query: LoqateGetCountryByIpAddressRequest): Promise<LoqateGetCountryByIpAddressResponse> {
    const { ip } = query;

    const queryString = buildQueryString({
      ipAddress: ip,
      source: SOURCE_KEY,
      key: this.apiKey,
    });

    let url = `${this.host}/Extras/Web/Ip2Country/v1.10/json3.ws?${queryString}`;

    try {
      const response = await axios.get(url);
      const result = await response.data;
      return toCamelCase(result) as LoqateGetCountryByIpAddressResponse;
    } catch (error) {
      console.error('Error loqate get country by ip address:', error);
      throw error;
    }
  }

  public async validateEmail(query: LoqateValidateEmailRequest): Promise<LoqateValidateEmailItemResponse> {
    const { email } = query;

    if (!email || email.length === 0) {
      return { responseCode: 'Invalid', isValid: false };
    }

    const queryString = buildQueryString({
      email,
      source: SOURCE_KEY,
      key: this.apiKey,
      timeout: this.emailValidationTimeoutMilliseconds,
    });

    let url = `${this.host}/EmailValidation/Interactive/Validate/v2/json3.ws?${queryString}`;

    try {
      const response = await axios.get(url);
      const result = await response.data;
      const itemResponse = toCamelCase(result).items[0] as LoqateValidateEmailItemResponse;
      itemResponse.isValid =
        itemResponse.responseCode === 'Valid' ||
        (itemResponse.responseCode === 'Valid_CatchAll' && this.includeValidCatchAllEmails);

      return itemResponse;
    } catch (error) {
      console.error('Error loqate get country by ip address:', error);
      throw error;
    }
  }

  public async validatePhone(query: LoqateValidatePhoneRequest): Promise<LoqateValidatePhoneItemResponse> {
    const { phone, country } = query;

    if (!phone || phone.length === 0) {
      return { isValid: false };
    }

    const queryString = buildQueryString({
      phone,
      country,
      source: SOURCE_KEY,
      key: this.apiKey,
    });

    let url = `${this.host}/PhoneNumberValidation/Interactive/Validate/v2.2/json3.ws?${queryString}`;

    try {
      const response = await axios.get(url);
      const result = await response.data;
      const phoneNumberItemResponse = toCamelCase(result).items[0] as InternalLoqateValidatePhoneItemResponse;
      const isValidPhoneNumberResponse = {
        isValid:
          phoneNumberItemResponse.isValid === 'Yes' ||
          (this.includeMaybePhoneNumbers && phoneNumberItemResponse.isValid === 'Maybe'),
      };

      return isValidPhoneNumberResponse;
    } catch (error) {
      console.error('Error loqate get country by ip address:', error);
      throw error;
    }
  }
}
