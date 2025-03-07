import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from 'components/commercetools-ui/atoms/button';
import Checkbox from 'components/commercetools-ui/atoms/checkbox';
import Dropdown from 'components/commercetools-ui/atoms/dropdown';
import Modal from 'components/commercetools-ui/atoms/modal';
import { useLoqate } from 'helpers/contexts/loqate/loqateContext';
import { LoqateAddress } from 'helpers/contexts/loqate/types/loqate-suggested-address';
import { useFormat } from 'helpers/hooks/useFormat';
import useGeo from 'helpers/hooks/useGeo';
import useI18n from 'helpers/hooks/useI18n';
import useProcessing from 'helpers/hooks/useProcessing';
import countryStates from 'static/states.json';
import { useAccount } from 'frontastic';
import AddressForm from '../steps/sections/addresses/components/address-form';
import { Fields } from '../steps/sections/addresses/components/address-form/types';
import useMappers from '../steps/sections/addresses/hooks/useMappers';
import { Address } from '../steps/sections/addresses/types';

// # Add new address (address-only) | Checkout |
const stringOrUndefined = (str?: string) => (str && str.length > 0 ? str : '');

type AddressFields = 'id' | 'type' | 'line1' | 'postalCode' | 'city' | 'country';
type LoqateAddressFields = 'id' | 'type' | 'text' | 'postCode' | 'city' | 'countryIsoCode';

const addressToLoqateAddressKeyMap: Record<AddressFields, LoqateAddressFields> = {
  id: 'id',
  type: 'type',
  line1: 'text',
  postalCode: 'postCode',
  city: 'city',
  country: 'countryIsoCode',
};

const mapLoqateAddressToAddress = (loqateAddress?: LoqateAddress) => {
  const address: any = loqateAddress || {};
  return {
    line1: stringOrUndefined(address.text),
    postalCode: stringOrUndefined(address.postCode),
    city: stringOrUndefined(address.city),
    country: stringOrUndefined(address.countryIsoCode),
  };
};

const CreateAddressModal = () => {
  const { isValidAddress, setLoqateAddress, loqateAddress, verifyAddress, bypassAddressVerification } = useLoqate();

  const { formatMessage } = useFormat({ name: 'common' });
  const { formatMessage: formatAccountMessage } = useFormat({ name: 'account' });
  const { formatMessage: formatCheckoutMessage } = useFormat({ name: 'checkout' });

  const { processing, startProcessing, stopProcessing } = useProcessing();

  const { getInfoByZipcode } = useGeo();

  const { addressToAccountAddress } = useMappers();

  const { shippingAddresses, billingAddresses, addShippingAddress, addBillingAddress, loggedIn } = useAccount();
  const { country } = useI18n();

  const states = countryStates[country as keyof typeof countryStates] ?? [];

  const [isOpen, setIsOpen] = useState<boolean>();

  useEffect(() => {
    if (shippingAddresses?.length || billingAddresses?.length) {
      setIsOpen(false);
    }
  }, [shippingAddresses, billingAddresses]);

  const closeModal = useCallback(() => setIsOpen(false), []);

  const initialData = useMemo(() => ({ addressType: 'shipping' } as Address), []);

  const [data, setData] = useState<Address>(initialData);

  const [saveAsDefault, setSaveAsDefault] = useState(false);

  useEffect(() => {
    setData({
      ...data,
      ...mapLoqateAddressToAddress(loqateAddress),
    });
  }, [loqateAddress]);

  const handleChange = useCallback(
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

      setData({ ...data, [e.target.name]: e.target.value });

      if (e.target.name === 'postalCode') {
        getInfoByZipcode(e.target.value).then((info) => {
          if (info.places?.[0]) setData((data) => ({ ...data, city: info.places[0]['place name'] ?? '' }));
        });
      }
    },
    [data, getInfoByZipcode],
  );

  const handleSubmit = useCallback(async () => {
    startProcessing();

    if (!bypassAddressVerification) {
      const { isValid: isValidAddress } = await verifyAddress(loqateAddress);

      if (!isValidAddress) {
        stopProcessing();
        return;
      }
    }

    await (data.addressType === 'shipping' ? addShippingAddress : addBillingAddress)({
      ...addressToAccountAddress(data),
      isDefaultShippingAddress: data.addressType === 'shipping' && saveAsDefault,
      isDefaultBillingAddress: data.addressType === 'billing' && saveAsDefault,
    });

    stopProcessing();
    closeModal();
    setData(initialData);
    setSaveAsDefault(false);
  }, [
    addShippingAddress,
    addBillingAddress,
    data,
    addressToAccountAddress,
    saveAsDefault,
    startProcessing,
    stopProcessing,
    closeModal,
    initialData,
  ]);

  const addressTypeOptions = useMemo(() => {
    return [
      {
        label: formatCheckoutMessage({ id: 'shippingAddress', defaultMessage: 'Shipping Address' }),
        value: 'shipping',
      },
      { label: formatCheckoutMessage({ id: 'billingAddress', defaultMessage: 'Billing Address' }), value: 'billing' },
    ];
  }, [formatCheckoutMessage]);

  const fields = useCallback(() => {
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
        name: 'line1',
        label: formatMessage({ id: 'address', defaultMessage: 'Address' }),
        labelDesc: '',
        required: true,
        type: 'string',
        className: 'col-span-3',
        integrateAddressCapture: true,
        render() {
          // if (enableAddress2) return <></>;
          // return (
          //   <div className="col-span-3 mt-16 cursor-pointer">
          //     <p className="w-fit text-14 text-secondary-black" onClick={onEnableAddress2}>
          //       + {formatCheckoutMessage({ id: 'add.address', defaultMessage: 'Add another address line' })}
          //     </p>
          //   </div>
          // );
        },
      },
      // ...(enableAddress2
      //   ? [
      //       {
      //         name: 'line2',
      //         label: `${formatMessage({ id: 'address', defaultMessage: 'Address' })} 2`,
      //         labelDesc: '',
      //         type: 'string',
      //         className: 'col-span-3',
      //       },
      //     ]
      //   : []),
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
  }, [formatMessage, formatCheckoutMessage]);

  if (!loggedIn) return <></>;

  return (
    <>
      <p className="text-14 underline underline-offset-2 hover:cursor-pointer" onClick={() => setIsOpen(true)}>
        {formatAccountMessage({ id: 'address.add', defaultMessage: 'Add new address' })} +
      </p>
      <Modal
        isOpen={Boolean(isOpen)}
        onRequestClose={closeModal}
        style={{ content: { background: 'transparent', border: 'none' } }}
        closeTimeoutMS={200}
      >
        <div className="mx-auto w-[90%] max-w-[600px] rounded-sm bg-white p-32 pt-24">
          <h4 className="text-24">{formatAccountMessage({ id: 'address.add', defaultMessage: 'Add new address' })}</h4>
          <AddressForm className="mt-32" address={data} fields={fields} onChange={handleChange} onSubmit={handleSubmit}>
            <div className="mt-12">
              <Dropdown
                name="addressType"
                items={addressTypeOptions}
                className="w-full border-neutral-500"
                onChange={handleChange}
                label={`${formatAccountMessage({
                  id: 'address.type',
                  defaultMessage: 'Address type',
                })} *`}
              />
            </div>
            <div className="mt-16">
              <Checkbox
                label={formatCheckoutMessage({
                  id: 'address.setDefault',
                  defaultMessage: 'Save as default address',
                })}
                labelPosition="on-right"
                checked={saveAsDefault}
                onChange={({ checked }) => setSaveAsDefault(checked)}
              />
            </div>
            <div className="mt-32 flex gap-12">
              <Button variant="secondary" className="px-48" type="button" onClick={closeModal}>
                {formatMessage({ id: 'cancel', defaultMessage: 'Cancel' })}
              </Button>
              <Button variant="primary" className="px-48" type="submit" loading={processing}>
                {formatMessage({ id: 'save', defaultMessage: 'Save' })}
              </Button>
            </div>
          </AddressForm>
        </div>
      </Modal>
    </>
  );
};

export default CreateAddressModal;
function setLoqateAddress(arg0: {
  id: string;
  text: string;
  isManualInput: boolean;
  countryIsoCode: string;
  email: any;
  phone: any;
}) {
  throw new Error('Function not implemented.');
}
