import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import Button from 'components/commercetools-ui/atoms/button';
import Checkbox from 'components/commercetools-ui/atoms/checkbox';
import Info from 'components/commercetools-ui/atoms/info';
import { useLoqate } from 'helpers/contexts/loqate/loqateContext';
import { LoqateAddress } from 'helpers/contexts/loqate/types/loqate-suggested-address';
import { useFormat } from 'helpers/hooks/useFormat';
import useGeo from 'helpers/hooks/useGeo';
import useProcessing from 'helpers/hooks/useProcessing';
import useValidate from 'helpers/hooks/useValidate';
import { useAccount, useCart } from 'frontastic';
import { CartDetails } from 'frontastic/hooks/useCart/types';
import AccountAddresses from './components/account-addresses';
import AddressForm from './components/address-form';
import { Fields, FieldsOptions } from './components/address-form/types';
import useMappers from './hooks/useMappers';
import { Address } from './types';

export interface Props {
  goToNextStep: () => void;
}
const stringOrUndefined = (str?: string) => (str && str.length > 0 ? str : '');

type AddressFields = 'id' | 'type' | 'line1' | 'postalCode' | 'city' | 'country' | 'phone' | 'email';
type LoqateAddressFields = 'id' | 'type' | 'text' | 'postCode' | 'city' | 'countryIsoCode' | 'phone' | 'email';

const addressToLoqateAddressKeyMap: Record<AddressFields, LoqateAddressFields> = {
  id: 'id',
  type: 'type',
  line1: 'text',
  postalCode: 'postCode',
  city: 'city',
  country: 'countryIsoCode',
  phone: 'phone',
  email: 'email',
};

const mapLoqateAddressToAddress = (loqateAddress?: LoqateAddress) => {
  const address: any = loqateAddress || {};
  return {
    line1: stringOrUndefined(address.text),
    postalCode: stringOrUndefined(address.postCode),
    city: stringOrUndefined(address.city),
    country: stringOrUndefined(address.countryIsoCode),
    email: stringOrUndefined(address.email),
    phone: stringOrUndefined(address.phone),
  };
};

const Addresses: React.FC<Props> = ({ goToNextStep }) => {
  const { formatMessage } = useFormat({ name: 'common' });
  const { formatMessage: formatCheckoutMessage } = useFormat({ name: 'checkout' });
  const { formatMessage: formatCartMessage } = useFormat({ name: 'cart' });

  const { account, loggedIn, shippingAddresses } = useAccount();

  const { getInfoByZipcode } = useGeo();

  const { updateCart } = useCart();

  const { addressToAccountAddress } = useMappers();

  const { validateEmail } = useValidate();

  const initialAddressData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    postalCode: '',
    city: '',
    country: '',
  } as Address;

  const [shippingAddress, setShippingAddress] = useState(initialAddressData);
  const [billingAddress, setBillingAddress] = useState(initialAddressData);
  const [sameShippingAddress, setSameShippingAddress] = useState(true);
  const {
    isValidAddress,
    setLoqateAddress,
    loqateAddress,
    isValidEmail,
    emailValidationIsInProgress,
    isValidPhone,
    phoneValidationIsInProgress,
    verifyAddress,
    validateEmail: loqateValidateEmail,
    validatePhone: loqateValidatePhone,
    bypassAddressVerification,
  } = useLoqate();

  useEffect(() => {
    setShippingAddress({
      ...shippingAddress,
      ...mapLoqateAddressToAddress(loqateAddress),
    });
  }, [loqateAddress]);

  const currentBillingAddress = useMemo(
    () => (sameShippingAddress ? shippingAddress : billingAddress),
    [sameShippingAddress, shippingAddress, billingAddress],
  );

  const addressValidationScehma = useMemo(() => {
    return yup.object().shape({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      email: yup.string().email().required(),
      phone: yup.string().optional(),
      line1: yup.string().required(),
      line2: yup.string().optional(),
      postalCode: yup.string().required(),
      city: yup.string().required(),
    });
  }, []);

  const isValidShippingAddress = useMemo(() => {
    try {
      addressValidationScehma.validateSync(shippingAddress);
      return true;
    } catch (err) {
      return false;
    }
  }, [addressValidationScehma, shippingAddress]);

  const isValidBillingAddress = useMemo(() => {
    try {
      addressValidationScehma.validateSync(currentBillingAddress);
      return true;
    } catch (err) {
      return false;
    }
  }, [addressValidationScehma, currentBillingAddress]);

  const handleShippingAddressBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.name === 'phone') {
        loqateValidatePhone();
      }
      if (e.target.name === 'email') {
        loqateValidateEmail();
      }
    },
    [loqateValidateEmail, loqateValidatePhone],
  );

  const handleShippingAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (Object.keys(addressToLoqateAddressKeyMap).find((key) => key === e.target.name)) {
        if (e.target.name === 'country') {
          setLoqateAddress({
            id: '',
            text: '',
            isManualInput: true,
            countryIsoCode: e.target.value,
            email: loqateAddress.email,
            phone: loqateAddress.phone,
          });
          return;
        }

        setLoqateAddress({
          ...loqateAddress,
          isManualInput: true,
          [addressToLoqateAddressKeyMap[e.target.name as AddressFields]]: e.target.value,
          type: 'Container',
        });
      }

      setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    },
    [shippingAddress, getInfoByZipcode, loqateAddress],
  );

  const handleBillingAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
    },
    [billingAddress],
  );

  const { processing, startProcessing, stopProcessing } = useProcessing();

  // # Submit form
  const submit = useCallback(async () => {
    if (!isValidShippingAddress || !isValidBillingAddress || processing) return;

    startProcessing();

    if (!bypassAddressVerification) {
      const { isValid: isValidAddress } = await verifyAddress(loqateAddress);

      if (!isValidAddress) {
        stopProcessing();
        return;
      }
    }

    const data = {
      account: { email: account?.email || shippingAddress.email || currentBillingAddress.email },
      shipping: addressToAccountAddress(shippingAddress),
      billing: addressToAccountAddress(currentBillingAddress),
    } as CartDetails;

    const res = await updateCart(data);

    stopProcessing();

    if (res.cartId) goToNextStep();
    else
      toast.error(
        formatCheckoutMessage({
          id: 'update.addresses.error',
          defaultMessage: "Couldn't update your addresses information, please try again later.",
        }),
        { position: 'bottom-left' },
      );
  }, [
    account,
    isValidShippingAddress,
    isValidBillingAddress,
    shippingAddress,
    currentBillingAddress,
    addressToAccountAddress,
    updateCart,
    goToNextStep,
    formatCheckoutMessage,
    processing,
    startProcessing,
    stopProcessing,
    isValidEmail,
    loqateAddress,
    bypassAddressVerification,
  ]);

  const fields = useCallback(
    ({ enableAddress2, onEnableAddress2 }: FieldsOptions) => {
      return [
        {
          name: 'firstName',
          label: formatMessage({ id: 'firstName', defaultMessage: 'First Name' }),
          labelDesc: '',
          required: true,
          type: 'string',
          className: 'col-span-3',
        },
        {
          name: 'lastName',
          label: formatMessage({ id: 'lastName', defaultMessage: 'Last Name' }),
          labelDesc: '',
          required: true,
          type: 'string',
          className: 'col-span-3',
        },
        {
          name: 'email',
          label: formatMessage({ id: 'email', defaultMessage: 'Email' }),
          labelDesc: '',
          required: true,
          type: 'email',
          className: 'col-span-3',
          validate(value) {
            return validateEmail(value) && (emailValidationIsInProgress ? undefined : isValidEmail);
          },
        },
        {
          name: 'phone',
          label: `${formatMessage({ id: 'phone', defaultMessage: 'Phone' })}`,
          labelDesc: formatCheckoutMessage({
            id: 'for.other.updates',
            defaultMessage: 'for other updates',
          }),
          type: 'string',
          className: 'col-span-3',
          validate(value) {
            return phoneValidationIsInProgress ? undefined : isValidPhone;
          },
        },
        {
          name: 'line1',
          label: formatMessage({ id: 'address', defaultMessage: 'Address' }),
          labelDesc: '',
          required: true,
          type: 'string',
          className: 'col-span-3',
          integrateAddressCapture: true,
          validate: () => true,
          render() {
            if (enableAddress2) return <></>;

            return (
              <div className="col-span-3 mt-16 cursor-pointer">
                <p className="w-fit text-14 text-secondary-black" onClick={onEnableAddress2}>
                  + {formatCheckoutMessage({ id: 'add.address', defaultMessage: 'Add another address line' })}
                </p>
              </div>
            );
          },
        },
        ...(enableAddress2
          ? [
              {
                name: 'line2',
                label: `${formatMessage({ id: 'address', defaultMessage: 'Address' })} 2`,
                labelDesc: '',
                type: 'string',
                className: 'col-span-3',
              },
            ]
          : []),
        {
          name: 'postalCode',
          label: formatMessage({ id: 'zipCode', defaultMessage: 'Postcode' }),
          labelDesc: '',
          required: true,
          className: 'col-span-1 mt-12',
        },
        {
          name: 'city',
          label: formatMessage({ id: 'city', defaultMessage: 'City' }),
          labelDesc: '',
          required: true,
          className: 'col-span-2 mt-12',
        },
        {
          name: 'country',
          label: formatMessage({ id: 'country', defaultMessage: 'Country' }),
          labelDesc: '',
          required: true,
          className: 'col-span-2 mt-12',
        },
      ] as Fields[];
    },
    [
      formatMessage,
      formatCheckoutMessage,
      validateEmail,
      emailValidationIsInProgress,
      isValidAddress,
      phoneValidationIsInProgress,
      isValidPhone,
    ],
  );

  // # Address form usage

  return (
    <div className="bg-white pt-16 lg:px-36 lg:pb-36 lg:pt-0">
      {loggedIn ? (
        shippingAddresses.length > 0 && (
          <div className="mt-20">
            <h5 className="text-16 capitalize">
              {formatCheckoutMessage({ id: 'shippingAddress', defaultMessage: 'Shipping Address' })}
            </h5>
            <AccountAddresses
              className="mt-20"
              type="shipping"
              onSelectAddress={(address) => setShippingAddress(address)}
            />
          </div>
        )
      ) : (
        <AddressForm
          className="md:max-w-[400px]"
          fields={fields}
          address={shippingAddress}
          onChange={handleShippingAddressChange}
          onBlur={handleShippingAddressBlur}
        />
      )}

      {loggedIn && shippingAddresses.length === 0 ? (
        <></>
      ) : (
        <div className="mt-48">
          <div className="flex items-center gap-8 lg:gap-12">
            <h5 className="text-16 capitalize">
              {formatCheckoutMessage({ id: 'billingAddress', defaultMessage: 'Billing Address' })}
            </h5>
            <Info
              message={`${formatCheckoutMessage({
                id: 'enter.associated.address.with.payment',
                defaultMessage: 'Enter the address that is associated with your payment method',
              })}.`}
            />
          </div>

          <div className="mt-28 flex items-center gap-12 p-2">
            <Checkbox
              label={formatCheckoutMessage({
                id: 'billingDetailsLabel',
                defaultMessage: 'My billing address is the same as my delivery address',
              })}
              labelPosition="on-right"
              checked={sameShippingAddress}
              onChange={({ checked }) => setSameShippingAddress(checked)}
              disableBackground
            />
          </div>

          {!sameShippingAddress &&
            (loggedIn ? (
              <AccountAddresses
                type="billing"
                className="mt-28"
                onSelectAddress={(address) => setBillingAddress(address)}
              />
            ) : (
              <AddressForm
                className="mt-28 md:max-w-[400px]"
                fields={fields}
                address={billingAddress}
                onChange={handleBillingAddressChange}
                onBlur={handleShippingAddressBlur}
              />
            ))}
        </div>
      )}

      <div className="mt-28 md:mt-36 lg:mt-45">
        <Button
          variant="primary"
          className="w-full min-w-[200px] md:text-16 lg:w-fit lg:px-36"
          disabled={!isValidShippingAddress || !isValidBillingAddress}
          loading={processing}
          type="submit"
          onClick={submit}
        >
          {formatCartMessage({ id: 'continue.to', defaultMessage: 'Continue to' })}{' '}
          <span className="lowercase">{formatCartMessage({ id: 'shipping', defaultMessage: 'Shipping' })}</span>
        </Button>
      </div>
    </div>
  );
};

export default Addresses;
