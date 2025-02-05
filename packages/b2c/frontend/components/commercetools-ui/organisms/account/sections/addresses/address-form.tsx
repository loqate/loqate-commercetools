import { useCallback, useEffect, useMemo, useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Account } from 'shared/types/account';
import { Address } from 'shared/types/account/Address';
import AddressValidationAlert from 'components/commercetools-ui/atoms/alerts/address-form-alert';
import Checkbox from 'components/commercetools-ui/atoms/checkbox';
import Dropdown from 'components/commercetools-ui/atoms/dropdown';
import Input from 'components/commercetools-ui/atoms/input';
import Typography from 'components/commercetools-ui/atoms/typography';
import useBlackListedCountries from 'components/commercetools-ui/organisms/checkout/components/steps/sections/addresses/hooks/useBlackListedCountries';
import AddressCapture from 'components/loqate/address-capture';
import { useLoqate } from 'helpers/contexts/loqate/loqateContext';
import { LoqateAddress } from 'helpers/contexts/loqate/types/loqate-suggested-address';
import { useFormat } from 'helpers/hooks/useFormat';
import useI18n from 'helpers/hooks/useI18n';
import useValidate from 'helpers/hooks/useValidate';
import countryStates from 'static/states.json';
import { useAccount } from 'frontastic';
import DeleteModal from './deleteModal';
import usePropsToAddressType from './mapPropsToAddressType';
import AccountForm from '../../account-atoms/account-form';
import SaveOrCancel from '../../account-atoms/save-or-cancel';
import useDiscardForm from '../../hooks/useDiscardForm';
import useFeedbackToasts from '../../hooks/useFeedbackToasts';

const stringOrUndefined = (str?: string) => (str && str.length > 0 ? str : '');

type AddressFields = 'id' | 'type' | 'streetName' | 'postalCode' | 'city' | 'country';
type LoqateAddressFields = 'id' | 'type' | 'text' | 'postCode' | 'city' | 'countryIsoCode';

const addressToLoqateAddressKeyMap: Record<AddressFields, LoqateAddressFields> = {
  id: 'id',
  type: 'type',
  streetName: 'text',
  postalCode: 'postCode',
  city: 'city',
  country: 'countryIsoCode',
};

const mapLoqateAddressToAddress = (loqateAddress?: LoqateAddress) => {
  const address: any = loqateAddress || {};
  return {
    streetName: stringOrUndefined(address.text),
    postalCode: stringOrUndefined(address.postCode),
    city: stringOrUndefined(address.city),
    country: stringOrUndefined(address.countryIsoCode),
  };
};

export interface AddressFormProps {
  addressId?: string;
  editedAddressId?: Address['addressId'];
}

export interface AddressFormData extends Address {
  addressId: string;
  addressType?: 'shipping' | 'billing';
  isDefaultAddress?: boolean;
  isBillingAddress?: boolean;
  isDefaultBillingAddress?: boolean;
  isDefaultShippingAddress?: boolean;
}

type AddressType = 'shipping' | 'billing';
type AddressTypeOptions = Array<{ label: string; value: AddressType }>;

const AddressForm: React.FC<AddressFormProps> = ({ editedAddressId }) => {
  const { formatMessage: formatAccountMessage } = useFormat({ name: 'account' });
  const { formatMessage: formatCheckoutMessage } = useFormat({ name: 'checkout' });
  const { formatMessage } = useFormat({ name: 'common' });

  const { validateTextExists } = useValidate();

  const { removeAddress, account } = useAccount();
  const { mapPropsToAddress } = usePropsToAddressType();
  const { discardForm } = useDiscardForm();
  const { notifyDataUpdated, notifyWentWrong } = useFeedbackToasts();
  const { country } = useI18n();

  const states = countryStates[country as keyof typeof countryStates] ?? [];

  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const toggleLoadingOn = () => setLoading(true);
  const toggleLoadingOff = () => setLoading(false);

  //new address data
  const defaultData = useMemo(() => {
    if (!editedAddressId) return { country } as AddressFormData;

    const accountAddress = account?.addresses?.find(
      (address) => address.addressId === editedAddressId,
    ) as AddressFormData;

    if (accountAddress) {
      accountAddress.addressType = mapPropsToAddress(accountAddress).addressType;
    }

    return accountAddress;
  }, [account?.addresses, country, editedAddressId, mapPropsToAddress]);

  const [data, setData] = useState<AddressFormData>(defaultData || {});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const {
    isValidAddress,
    setLoqateAddress,
    loqateAddress,
    verifyAddress,
    bypassAddressVerification,
    loqateProjectSettings,
    setLoqateSettings,
    setBypassAddressVerification,
    setIsValidAddress,
  } = useLoqate();
  const [countries, , successfullyFetched] = useBlackListedCountries();
  const [isEdit, setIsEdit] = useState(Boolean(editedAddressId && editedAddressId.length > 0));
  const [displayCountry, setDisplayCountry] = useState(false);

  useEffect(() => {
    const isEdit = editedAddressId && editedAddressId.length > 0;
    setIsEdit(Boolean(isEdit));
    setDisplayCountry(Boolean(isEdit || (data.country && data.country.length > 0)));
  }, [loqateProjectSettings.checkoutIpToCountryEnabled, successfullyFetched, data.country, editedAddressId]);

  useEffect(() => {
    if (!loqateProjectSettings.fetchInProgress) {
      setLoqateSettings({
        addressLookupEnabled: loqateProjectSettings.myAccountAddressLookupEnabled,
        ipToCountryEnabled: !isEdit && loqateProjectSettings.checkoutIpToCountryEnabled,
        verificationEnabled: loqateProjectSettings.myAccountAddressVerificationEnabled,
      });
    }
  }, [loqateProjectSettings.fetchInProgress, data.addressId]);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    setData({
      ...data,
      ...mapLoqateAddressToAddress(loqateAddress),
    });
  }, [loqateAddress]);

  const addressTypes: AddressTypeOptions = [
    { label: formatCheckoutMessage({ id: 'shippingAddress', defaultMessage: 'Shipping Address' }), value: 'shipping' },
    { label: formatCheckoutMessage({ id: 'billingAddress', defaultMessage: 'Billing Address' }), value: 'billing' },
  ];

  const formTitle = formatAccountMessage(
    editedAddressId
      ? { id: 'address.edit', defaultMessage: 'Edit address' }
      : { id: 'address.add', defaultMessage: 'Add an address' },
  );

  useEffect(() => {
    setData(defaultData || {});
    setLoqateAddress({
      isManualInput: true,
      text: defaultData?.streetName,
      postCode: defaultData?.postalCode,
      city: defaultData?.city,
      countryIsoCode: defaultData?.country,
    });

    return () => {
      setLoqateAddress({
        isManualInput: true,
        text: '',
        postCode: '',
        city: '',
        countryIsoCode: '',
      });
    };
  }, [defaultData]);

  const updateData = (name: string, value: boolean | string) => {
    setData({ ...data, [name]: value });
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    if (Object.keys(addressToLoqateAddressKeyMap).find((key) => key === e.target.name)) {
      if (e.target.name === 'country') {
        setLoqateAddress({
          id: '',
          text: '',
          isManualInput: true,
          countryIsoCode: e.target.value,
        });
      } else {
        setLoqateAddress({
          ...loqateAddress,
          isManualInput: true,
          [addressToLoqateAddressKeyMap[e.target.name as AddressFields]]: e.target.value,
          type: 'Container',
        });
      }
    }
    updateData(e.target.name, e.target.value);
  };

  const discardFormAndNotify = (promise: Promise<Account | void>) => {
    promise.then(toggleLoadingOff).then(discardForm).then(notifyDataUpdated).catch(notifyWentWrong);
  };

  const handleDelete = () => {
    setLoadingDelete(true);

    removeAddress(data.addressId)
      .then(() => setLoadingDelete(false))
      .then(closeModal)
      .then(() =>
        toast.success(formatAccountMessage({ id: 'address.deleted', defaultMessage: 'Account deleted successfully' })),
      )
      .then(discardForm);
  };

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

  const handleAcceptUnverifiedAddressClick = useCallback(() => {
    setBypassAddressVerification(true);
    setIsValidAddress({ isValid: true });
  }, [isValidAddress, bypassAddressVerification]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!bypassAddressVerification) {
      const { isValid: isValidAddress } = await verifyAddress(loqateAddress);

      if (!isValidAddress) {
        return;
      }
    }

    e.preventDefault();
    toggleLoadingOn();

    const { addAddress, updateAddress } = mapPropsToAddress(data);

    if (editedAddressId) {
      if (defaultData.addressType !== data.addressType) {
        discardFormAndNotify(removeAddress(defaultData.addressId).then(addAddress));
      } else {
        discardFormAndNotify(updateAddress());
      }

      return;
    }
    discardFormAndNotify(addAddress());
  };

  return (
    <AccountForm
      onSubmit={handleSubmit}
      title={formTitle}
      loading={loading}
      containerClassName="grid gap-12 md:px-24 md:px-0"
    >
      <Input
        label={formatMessage({ id: 'firstName', defaultMessage: 'First Name' })}
        required
        type="text"
        name="firstName"
        id="first-name"
        value={data?.firstName ?? ''}
        autoComplete="first-name"
        className="border-neutral-500"
        onChange={handleChange}
        validation={validateTextExists}
      />

      <Input
        label={formatMessage({ id: 'lastName', defaultMessage: 'Last Name' })}
        required
        type="text"
        name="lastName"
        id="last-name"
        value={data?.lastName ?? ''}
        autoComplete="last-name"
        className="border-neutral-500"
        onChange={handleChange}
        validation={validateTextExists}
      />

      <AddressCapture
        labelDesc=""
        label={`${formatMessage({ id: 'address', defaultMessage: 'Address' })} 1`}
        type="text"
        required
        name="streetName"
        id="street-name"
        className="border-neutral-500"
        isValid={isValidAddress}
        onChange={handleChange}
      />

      <Input
        label={`${formatMessage({ id: 'address', defaultMessage: 'Address' })} 2 (${formatMessage({
          id: 'optional',
          defaultMessage: 'Optional',
        })})`}
        type="text"
        name="additionalAddressInfo"
        id="additional-address-info"
        value={data?.additionalAddressInfo ?? ''}
        autoComplete="additional-address-info"
        className="border-neutral-500"
        onChange={handleChange}
      />

      <div className="grid grid-cols-3 gap-12">
        <div className="col-span-3 md:col-span-1">
          <Input
            label={formatMessage({ id: 'zipCode', defaultMessage: 'Postal Code' })}
            required
            type="text"
            name="postalCode"
            id="postal-code"
            value={data?.postalCode ?? ''}
            autoComplete="postal-code"
            className="border-neutral-500"
            validation={validateTextExists}
            onChange={handleChange}
          />
        </div>

        <div className="col-span-3 md:col-span-2">
          <Input
            label={formatMessage({ id: 'city', defaultMessage: 'City' })}
            required
            type="text"
            name="city"
            id="city"
            value={data?.city ?? ''}
            autoComplete="city"
            className="border-neutral-500"
            onChange={handleChange}
            validation={validateTextExists}
          />
        </div>
      </div>

      {displayCountry && (
        <Dropdown
          name="country"
          value={data.country}
          items={countries}
          className="w-full border-neutral-500"
          onChange={handleChange}
          label={formatMessage({
            id: 'country',
            defaultMessage: 'Country',
          })}
        />
      )}

      <Dropdown
        name="addressType"
        items={addressTypes}
        className="w-full border-neutral-500"
        onChange={handleChange}
        defaultValue={editedAddressId ? mapPropsToAddress(data).addressType : addressTypes[0].value}
        label={formatAccountMessage({
          id: 'address.type',
          defaultMessage: 'Address type',
        })}
      />

      <Checkbox
        name="isDefaultAddress"
        id="is-default-address"
        checked={data?.isDefaultBillingAddress || data?.isDefaultShippingAddress || false}
        onChange={({ name, checked }) => updateData(name, checked)}
        containerClassName="mt-4 md:mb-20 mb-12"
        label={formatAccountMessage({
          id: 'address.setDefault',
          defaultMessage: 'Save as default address',
        })}
      />
      {isValidAddress.status === 'Questionable' && (
        <AddressValidationAlert
          status="Questionable"
          address={isValidAddress.address}
          onDiscard={handleDiscardSuggestedAddressClick}
          onAccept={handleAcceptSuggestedAddressClick}
        />
      )}

      {isValidAddress.status === 'Invalid' && (
        <AddressValidationAlert status="Invalid" onContinue={handleAcceptUnverifiedAddressClick} />
      )}
      <div className="grid h-fit items-center justify-between gap-32 md:mt-20 md:flex md:gap-0">
        {editedAddressId && (
          <div
            className="flex items-center gap-8 hover:cursor-pointer hover:opacity-[0.7]"
            onClick={() => setModalIsOpen(true)}
          >
            <TrashIcon className="h-20 w-20 text-secondary-black" />
            <Typography className="text-14 leading-[114%] text-secondary-black" as="span">
              {formatMessage({ id: 'delete', defaultMessage: 'Delete' })}
            </Typography>
          </div>
        )}

        <SaveOrCancel onCancel={discardForm} loading={loading} />
      </div>

      <DeleteModal
        modalIsOpen={modalIsOpen}
        loading={loadingDelete}
        closeModal={closeModal}
        handleDelete={handleDelete}
      />
    </AccountForm>
  );
};

export default AddressForm;
