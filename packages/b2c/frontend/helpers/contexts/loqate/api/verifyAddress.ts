import { sdk } from 'sdk';
import { SDKResponse } from '@commercetools/frontend-sdk';
import { LoqateAddressVerifyRequest, LoqateAddressVerifyResponse } from '../types/loqate';

export const verifyAddress = async (
  fields: LoqateAddressVerifyRequest,
): Promise<SDKResponse<LoqateAddressVerifyResponse>> => {
  return await sdk.callAction({ actionName: 'loqate/verifyAddress', payload: fields });
};
