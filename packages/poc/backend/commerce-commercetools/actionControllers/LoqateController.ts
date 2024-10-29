import { ActionContext, Request, Response } from '@frontastic/extension-types';
import { LoqateApi } from '@Commerce-commercetools/apis/LoqateApi';
import handleError from '@Commerce-commercetools/utils/handleError';
import { getFromProjectConfig } from '@Commerce-commercetools/utils/Context';

type ActionHook = (request: Request, actionContext: ActionContext) => Promise<Response>;

const createLoqateApi = (actionContext: ActionContext): LoqateApi => {
  const client = new LoqateApi({
    apiKey: getFromProjectConfig('LOQATE_API_KEY', actionContext.frontasticContext),
    host: 'https://api.addressy.com',
    validAddressAQITreshold: getFromProjectConfig(
      'LOQATE_VALID_ADDRESS_AQI_THRESHOLD',
      actionContext.frontasticContext,
    ),
    avc: getFromProjectConfig('LOQATE_AVC', actionContext.frontasticContext),
    emailValidationTimeoutMilliseconds: getFromProjectConfig(
      'LOQATE_EMAIL_VALIDATION_TIMEOUT_MILLISECONDS',
      actionContext.frontasticContext,
    ),
    includeValidCatchAllEmails: getFromProjectConfig(
      'LOQATE_INCLUDE_VALID_CATCHALL_EMAILS',
      actionContext.frontasticContext,
    ),
    includeMaybePhoneNumbers: getFromProjectConfig(
      'LOQATE_INCLUDE_MAYBE_PHONE_NUMBERS',
      actionContext.frontasticContext,
    ),
  });

  return client;
};

export const getAddresses: ActionHook = async (request: Request, actionContext: ActionContext) => {
  const client = createLoqateApi(actionContext);

  try {
    const loqateAddressCaptureRequest = {
      id: request.query['id'],
      text: request.query['address'],
      limit: request.query['limit'],
      countryIsoCode: request.query['countryIsoCode'],
      city: request.query['city'],
    };

    const result = await client.getAddresses(loqateAddressCaptureRequest);
    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };

    return response;
  } catch (error) {
    return handleError(error, request);
  }
};

export const verifyAddress: ActionHook = async (request: Request, actionContext: ActionContext) => {
  const client = createLoqateApi(actionContext);

  const parsedBody = JSON.parse(request.body);
  try {
    const loqateVerifyAddressRequest = {
      country: parsedBody.country,
      address: parsedBody.address,
      city: parsedBody.city,
      postalCode: parsedBody.postalCode,
    };

    const result = await client.verifyAddress(loqateVerifyAddressRequest);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };

    return response;
  } catch (error) {
    return handleError(error, request);
  }
};

export const getCountryByIp: ActionHook = async (request: Request, actionContext: ActionContext) => {
  const client = createLoqateApi(actionContext);

  let clientIp: string | undefined = request.clientIp;

  if (!clientIp && request.headers) {
    const xForwardedFor = request.headers['x-forwarded-for'] || request.headers['X-Forwarded-For'];

    if (xForwardedFor) {
      clientIp = xForwardedFor.split(',').shift()?.trim();
    }
  }

  try {
    const loqateGetCountryByIpRequest = {
      ip: clientIp,
    };

    const result = await client.getCountryByIp(loqateGetCountryByIpRequest);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };

    return response;
  } catch (error) {
    return handleError(error, request);
  }
};

export const validateEmail: ActionHook = async (request: Request, actionContext: ActionContext) => {
  const client = createLoqateApi(actionContext);

  try {
    const validateEmailRequest = {
      email: request.query['email'],
    };

    const result = await client.validateEmail(validateEmailRequest);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };

    return response;
  } catch (error) {
    return handleError(error, request);
  }
};

export const validatePhone: ActionHook = async (request: Request, actionContext: ActionContext) => {
  const client = createLoqateApi(actionContext);

  try {
    const validatePhoneRequest = {
      phone: request.query['phone'],
      country: request.query['country'],
    };

    const result = await client.validatePhone(validatePhoneRequest);

    const response: Response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };

    return response;
  } catch (error) {
    return handleError(error, request);
  }
};

export const getSettings: ActionHook = async (request: Request, actionContext: ActionContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      checkoutAddressInputDelay: getFromProjectConfig('CHECKOUT_ADDRESS_INPUT_DELAY', actionContext.frontasticContext),
      checkoutAddressRequestLimit: getFromProjectConfig(
        'CHECKOUT_ADDRESS_REQUEST_LIMIT',
        actionContext.frontasticContext,
      ),
      checkoutIpToCountryEnabled: getFromProjectConfig('LOQATE_IP_TO_COUNTRY_ENABLED', actionContext.frontasticContext),
      checkoutAddressLookupEnabled: getFromProjectConfig(
        'LOQATE_ADDRESS_LOOKUP_CHECKOUT',
        actionContext.frontasticContext,
      ),
      checkoutAddressVerificationEnabled: getFromProjectConfig(
        'LOQATE_ADDRESS_VERIFICATION_CHECKOUT',
        actionContext.frontasticContext,
      ),
      myAccountAddressLookupEnabled: getFromProjectConfig(
        'LOQATE_ADDRESS_LOOKUP_MY_ACCOUNT',
        actionContext.frontasticContext,
      ),
      myAccountAddressVerificationEnabled: getFromProjectConfig(
        'LOQATE_ADDRESS_VERIFICATION_MY_ACCOUNT',
        actionContext.frontasticContext,
      ),
      checkoutEmailValidationEnabled: getFromProjectConfig(
        'LOQATE_EMAIL_VALIDATION_CHECKOUT',
        actionContext.frontasticContext,
      ),
      myAccountEmailValidationEnabled: getFromProjectConfig(
        'LOQATE_EMAIL_VALIDATION_MY_ACCOUNT',
        actionContext.frontasticContext,
      ),
      checkoutPhoneValidationEnabled: getFromProjectConfig(
        'LOQATE_PHONE_VALIDATION_CHECKOUT',
        actionContext.frontasticContext,
      ),
      myAccountPhoneValidationEnabled: getFromProjectConfig(
        'LOQATE_PHONE_VALIDATION_MY_ACCOUNT',
        actionContext.frontasticContext,
      ),
      registrationEmailValidationEnabled: getFromProjectConfig(
        'LOQATE_EMAIL_VALIDATION_REGISTRATION',
        actionContext.frontasticContext,
      ),
      registrationPhoneValidationEnabled: getFromProjectConfig(
        'LOQATE_PHONE_VALIDATION_REGISTRATION',
        actionContext.frontasticContext,
      ),
    }),
  };
};

export const getBlackListedCountries: ActionHook = async (request: Request, actionContext: ActionContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      blackListedCountries: getFromProjectConfig('RESTRICTED_COUNTRIES', actionContext.frontasticContext),
    }),
  };
};
