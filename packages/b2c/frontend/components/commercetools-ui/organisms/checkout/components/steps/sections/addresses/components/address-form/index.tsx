import React, { useCallback, useEffect, useState } from 'react';
import AddressValidationAlert from 'components/commercetools-ui/atoms/alerts/address-form-alert';
import Dropdown from 'components/commercetools-ui/atoms/dropdown';
import Input from 'components/commercetools-ui/atoms/input';
import AddressCapture from 'components/loqate/address-capture';
import { useLoqate } from 'helpers/contexts/loqate/loqateContext';
import { Fields, FieldsOptions } from './types';
import useBlackListedCountries from '../../hooks/useBlackListedCountries';
import { Address } from '../../types';

interface Props {
  className?: string;
  address: Address;
  fields: (options: FieldsOptions) => Fields[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
}

const AddressForm = ({
  className: containerClassName,
  fields,
  address,
  onChange,
  onBlur,
  onSubmit,
  children,
}: React.PropsWithChildren<Props>) => {
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.();
    },
    [onSubmit],
  );
  const [enableAddress2, setEnableAddress2] = useState(false);
  const onEnableAddress2 = useCallback(() => setEnableAddress2(true), []);

  const {
    isValidAddress,
    loqateProjectSettings,
    setLoqateSettings,
    bypassAddressVerification,
    loqateAddress,
    setLoqateAddress,
    setBypassAddressVerification,
    setIsValidAddress,
  } = useLoqate();
  const [countries, fetchingInProgress] = useBlackListedCountries();

  useEffect(() => {
    if (!loqateProjectSettings.fetchInProgress) {
      setLoqateSettings({
        addressLookupEnabled: loqateProjectSettings.checkoutAddressLookupEnabled,
        ipToCountryEnabled: loqateProjectSettings.checkoutIpToCountryEnabled,
        verificationEnabled: loqateProjectSettings.checkoutAddressVerificationEnabled,
        emailValidationEnabled: loqateProjectSettings.checkoutEmailValidationEnabled,
        phoneValidationEnabled: loqateProjectSettings.checkoutPhoneValidationEnabled,
      });
    }
  }, [loqateProjectSettings.fetchInProgress]);

  const handleAcceptUnverifiedAddressClick = useCallback(() => {
    setBypassAddressVerification(true);
    setIsValidAddress({ isValid: true });
  }, [isValidAddress, bypassAddressVerification]);

  const handleAcceptSuggestedAddressClick = useCallback(() => {
    setLoqateAddress({
      ...loqateAddress,
      isManualInput: false,
      postCode: isValidAddress.postalCode,
      city: isValidAddress.locality,
      countryIsoCode: isValidAddress.country,
      text: isValidAddress.address1,
    });
    setBypassAddressVerification(true);
    setIsValidAddress({ isValid: true });
  }, [isValidAddress, bypassAddressVerification]);

  const handleDiscardSuggestedAddressClick = useCallback(() => {
    setBypassAddressVerification(true);
    setIsValidAddress({ isValid: true });
  }, [bypassAddressVerification]);

  return (
    <form onSubmit={handleSubmit}>
      <div className={`grid grid-cols-3 gap-12 ${containerClassName}`}>
        {fields({ enableAddress2, onEnableAddress2 }).map(
          ({ name, label, labelDesc, type, required, className, render, validate, integrateAddressCapture }) => {
            if (name === 'country') {
              if (
                fetchingInProgress ||
                (loqateProjectSettings.checkoutIpToCountryEnabled && address?.country?.length === 0)
              ) {
                return <></>;
              }
              return (
                <div key={name} className="col-span-3">
                  <Dropdown
                    name={name}
                    label={label}
                    required={required}
                    value={address.country}
                    items={countries}
                    className="w-full border-neutral-500"
                    onChange={(e) => {
                      onChange?.(e);
                    }}
                  />
                </div>
              );
            }
            if (integrateAddressCapture && loqateProjectSettings.checkoutAddressLookupEnabled) {
              return (
                <>
                  <AddressCapture
                    key={name}
                    required={true}
                    name={name}
                    label={label}
                    labelDesc={labelDesc}
                    isValid={isValidAddress.isValid}
                    type={type ?? 'text'}
                    className={className}
                    onChange={(e) => {
                      onChange?.(e);
                    }}
                  />
                  {render?.()}
                </>
              );
            }
            return (
              <React.Fragment key={name}>
                <div className={className}>
                  <Input
                    name={name}
                    label={label}
                    labelDesc={labelDesc}
                    type={type}
                    required={required}
                    value={address[name as keyof Address]}
                    labelPosition="top"
                    isValid={
                      (!required || (required && !!address[name as keyof Address])) &&
                      (validate ? validate(address[name as keyof Address] as string) : true)
                    }
                    onChange={(e) => {
                      onChange?.(e);
                    }}
                    onBlur={(e) => {
                      onBlur?.(e);
                    }}
                    hideCheckIcon
                  />
                  {render?.()}
                </div>
              </React.Fragment>
            );
          },
        )}
        {isValidAddress.status === 'Questionable' && (
          <AddressValidationAlert
            status="Questionable"
            address={isValidAddress.address}
            onDiscard={handleDiscardSuggestedAddressClick}
            onAccept={handleAcceptSuggestedAddressClick}
            className="col-span-3 rounded-b border-t-4 border-teal-500 bg-teal-100 px-4 py-3 text-teal-900 shadow-md"
          />
        )}

        {isValidAddress.status === 'Invalid' && (
          <AddressValidationAlert
            status="Invalid"
            onContinue={handleAcceptUnverifiedAddressClick}
            className="col-span-3 rounded-b border-t-4 border-teal-500 bg-teal-100 px-4 py-3 text-teal-900 shadow-md"
          />
        )}
      </div>
      {children}
    </form>
  );
};

export default AddressForm;
