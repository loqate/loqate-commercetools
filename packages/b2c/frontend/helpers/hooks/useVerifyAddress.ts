import { sdk } from 'sdk';
import { SDKResponse } from '@commercetools/frontend-sdk';
import { useCallback, useEffect, useState } from 'react';

interface LoqateAddressVerifyRequest {
  country: string;
  address: string;
  city: string;
  postalCode: string;
}

interface LoqateAddressVerifyResponse {
  isValid: boolean;
}

interface LoqateIsValidAddress {
  address: boolean;
  secondlineAddress: boolean;
}

let sharedIsValidAddress = {
  address: true,
  secondlineAddress: true,
};

const useVerifyAddress = (
  initialValue?: LoqateIsValidAddress,
): [
  (fields: LoqateAddressVerifyRequest) => Promise<any>,
  LoqateIsValidAddress,
  (value: LoqateIsValidAddress) => void,
] => {
  const [isValidAddress, _setIsValidAddress] = useState<any>(sharedIsValidAddress);

  useEffect(() => {
    if (sharedIsValidAddress !== undefined && initialValue) {
      sharedIsValidAddress = initialValue;
    }
  }, []);

  useEffect(() => {
    _setIsValidAddress(sharedIsValidAddress);
  }, [sharedIsValidAddress]);

  const verifyAddress = async (
    fields: LoqateAddressVerifyRequest,
  ): Promise<SDKResponse<LoqateAddressVerifyResponse>> => {
    return await sdk.callAction({ actionName: 'loqate/verifyAddress', payload: fields });
  };

  const setIsValidAddress = (value: LoqateIsValidAddress) => {
    sharedIsValidAddress = value;
    _setIsValidAddress(value);
  };
  return [verifyAddress, isValidAddress, setIsValidAddress];
};

export default useVerifyAddress;
