import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { SDKResponse } from '@commercetools/frontend-sdk';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { sdk } from 'sdk';
import {
  LoqateProjectSettings,
  LoqateAddressInput,
  LoqateIsValidAddress,
  LoqateSettings,
  LoqateAddressVerifyResponse,
} from './types/loqate';
import { LoqateSuggestedAddresses, LoqateAddress } from './types/loqate-suggested-address';
import { ContextType } from './types/context-type';
import { DEFAULT_PROJECT_SETTINGS_VALUES, DEFAULT_LOQATE_SETTINGS_VALUES } from './constants';
import { mapIpToCountry } from './api/mapIpToCountry';
import { verifyAddress as internalVerifyAddress } from './api/verifyAddress';

const LoqateContext = createContext<ContextType>({
  loqateAddress: {
    id: '',
    text: '',
    isManualInput: true,
  },
  isValidEmail: undefined,
  emailValidationIsInProgress: false,
  isValidPhone: undefined,
  phoneValidationIsInProgress: false,
  bypassAddressVerification: false,
  suggestedAddresses: { items: [] },
  verifyAddress: () => {},
  isValidAddress: () => {},
  validateEmail: () => {},
  validatePhone: () => {},
  setLoqateAddress: () => {},
  setBypassAddressVerification: () => {},
  loqateProjectSettings: DEFAULT_PROJECT_SETTINGS_VALUES,
  setLoqateSettings: () => {},
  setIsValidAddress: () => {},
});

export const LoqateProvider = ({ children }: any) => {
  const [loqateProjectSettings, setLoqateProjectSettings] = useState<LoqateProjectSettings>(
    DEFAULT_PROJECT_SETTINGS_VALUES,
  );

  const [loqateSettings, setLoqateSettings] = useState<LoqateSettings>(DEFAULT_LOQATE_SETTINGS_VALUES);
  const [suggestedAddresses, setSuggestedAddresses] = useState<LoqateSuggestedAddresses>({ items: [] });
  const [loqateAddress, internalSetLoqateAddress] = useState<LoqateAddress>({
    id: '',
    text: '',
    isManualInput: true,
  });
  const [isValidAddress, setIsValidAddress] = useState<LoqateIsValidAddress>({
    isValid: true,
  });
  const [emailValidationIsInProgress, setEmailValidationIsInProgress] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean | undefined>(undefined);

  const [phoneValidationIsInProgress, setPhoneValidationIsInProgress] = useState<boolean>(false);
  const [isValidPhone, setIsValidPhone] = useState<boolean | undefined>(undefined);
  const [bypassAddressVerification, setBypassAddressVerification] = useState(false);

  const addressInputSubjectRef = useRef(new Subject());
  const addressVerificationSubjectRef = useRef(new Subject());

  useEffect(() => {
    async function fetchLoqateSettings() {
      return await sdk.callAction<any>({ actionName: 'loqate/getSettings' });
    }

    fetchLoqateSettings()
      .then((response: SDKResponse<LoqateProjectSettings>) => {
        const { isError, tracing } = response;
        if (isError) {
          throw tracing;
        }

        const { data } = response;
        setLoqateProjectSettings({ ...data, fetchInProgress: false });
      })
      .catch((traceId) => {
        console.log(`There was an error fetching Loqate project settings, trace ID: ${traceId}`);
      });
  }, []);

  useEffect(() => {
    const subscription = addressInputSubjectRef.current
      .pipe(
        debounceTime<any>(loqateProjectSettings.checkoutAddressInputDelay),
        // distinctUntilChanged<LoqateAddressInput>((previous, current) => !Boolean(previous.text === current.text)),
        distinctUntilChanged(),
        switchMap(async (input: LoqateAddressInput) => {
          if (
            !input.text ||
            input.text.length === 0 ||
            input.type === 'Address' ||
            !loqateSettings.addressLookupEnabled
          ) {
            return { items: [] };
          }

          const query: any = {
            address: input.text,
            id: input.id as string,
            limit: loqateProjectSettings.checkoutAddressRequestLimit,
            countryIsoCode: input.countryIsoCode,
            city: input.city,
          };

          const response: any = await sdk.callAction<any>({
            actionName: 'loqate/getAddresses',
            query,
            serverOptions: {},
          });

          return response.data;
        }),
      )
      .subscribe(setSuggestedAddresses);

    return () => subscription.unsubscribe();
  }, [
    addressInputSubjectRef.current,
    loqateSettings.addressLookupEnabled,
    loqateProjectSettings.checkoutAddressRequestLimit,
    loqateProjectSettings.checkoutAddressInputDelay,
  ]);

  useEffect(() => {
    const subscription = addressVerificationSubjectRef.current
      .pipe(
        debounceTime<any>(500),
        distinctUntilChanged(),
        switchMap(async (loqateAddress: LoqateAddress) => {
          await verifyAddress(loqateAddress);
        }),
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [addressVerificationSubjectRef.current, loqateSettings.verificationEnabled]);

  useEffect(() => {
    if (!loqateProjectSettings.fetchInProgress && loqateSettings.ipToCountryEnabled) {
      mapIpToCountry().then((response) => {
        if (response.data.items && response.data.items.length > 0) {
          internalSetLoqateAddress({
            ...loqateAddress,
            countryIsoCode: response.data.items[0].iso2,
          });
        }
      });
    }
  }, [loqateProjectSettings.fetchInProgress, loqateSettings.ipToCountryEnabled]);

  const validateEmail = async () => {
    if (!loqateSettings.emailValidationEnabled) {
      setIsValidEmail(undefined);
      setEmailValidationIsInProgress(false);
      return;
    }

    setIsValidEmail(false);
    setEmailValidationIsInProgress(true);

    if (!loqateAddress.email || loqateAddress.email.length === 0) {
      return;
    }

    const query: any = {
      email: loqateAddress.email,
    };

    const response: any = await sdk.callAction<any>({
      actionName: 'loqate/validateEmail',
      query,
      serverOptions: {},
    });

    const isValidEmailResponse = response && response.data && response.data.isValid;
    setIsValidEmail(isValidEmailResponse);
    setEmailValidationIsInProgress(false);

    return isValidEmailResponse;
  };

  const validatePhone = async () => {
    if (!loqateSettings.phoneValidationEnabled) {
      setIsValidPhone(undefined);
      setPhoneValidationIsInProgress(false);
      return;
    }

    setIsValidPhone(false);
    setPhoneValidationIsInProgress(true);

    if (!loqateAddress.phone || loqateAddress.phone.length === 0) {
      return;
    }

    const query: any = {
      phone: loqateAddress.phone,
      country: loqateAddress.countryIsoCode,
    };

    const response: any = await sdk.callAction<any>({
      actionName: 'loqate/validatePhone',
      query,
      serverOptions: {},
    });

    const isValidPhoneResponse = response && response.data && response.data.isValid;
    setIsValidPhone(isValidPhoneResponse);
    setPhoneValidationIsInProgress(false);

    return isValidPhoneResponse;
  };

  const setLoqateAddress = (value: any) => {
    if (
      value.text !== loqateAddress.text ||
      value.city !== loqateAddress.city ||
      value.countryIsoCode !== loqateAddress.countryIsoCode ||
      value.postCode !== loqateAddress.postCode
    ) {
      setBypassAddressVerification(false);
      setIsValidAddress({ isValid: true });
      addressInputSubjectRef.current.next({ ...value });
    }

    internalSetLoqateAddress({ ...value });
  };

  const verifyAddress = async (loqateAddress: LoqateAddress): Promise<LoqateIsValidAddress> => {
    if (!loqateAddress.isManualInput || !loqateSettings.verificationEnabled) {
      setIsValidAddress({
        isValid: true,
      });
      return { isValid: true };
    }
    const response = await internalVerifyAddress({
      address: loqateAddress.text as string,
      city: loqateAddress?.city as string,
      country: loqateAddress.countryIsoCode as string,
      postalCode: loqateAddress?.postCode as string,
    });

    if (response.isError) {
      throw response.tracing;
    }
    const isValidAddress = response.data && response.data.status === 'Valid';

    const result = {
      ...response.data,
      isValid: isValidAddress,
    };

    setIsValidAddress(result);

    return result;
  };

  return (
    <LoqateContext.Provider
      value={{
        suggestedAddresses,
        verifyAddress,
        isValidAddress,
        loqateProjectSettings,
        loqateAddress,
        setLoqateAddress,
        isValidEmail,
        emailValidationIsInProgress,
        isValidPhone,
        phoneValidationIsInProgress,
        setLoqateSettings,
        validateEmail,
        validatePhone,
        bypassAddressVerification,
        setBypassAddressVerification,
        setIsValidAddress,
      }}
    >
      {children}
    </LoqateContext.Provider>
  );
};

export const useLoqate = () => useContext(LoqateContext);
