import { useCallback, useState, useContext, use, useEffect } from 'react';
import { Account } from 'shared/types/account';
import Input, { InputProps } from 'components/commercetools-ui/atoms/input';
import useFeedbackToasts from 'components/commercetools-ui/organisms/account/hooks/useFeedbackToasts';
import { useLoqate } from 'helpers/contexts/loqate/loqateContext';
import { useFormat } from 'helpers/hooks/useFormat';
import useValidate from 'helpers/hooks/useValidate';
import { useAccount } from 'frontastic';
import AccountForm from '../../../account-atoms/account-form';
import useDiscardForm from '../../../hooks/useDiscardForm';

type inputNameType = 'firstName' | 'lastName' | 'email';

const PersonalInfoForm = () => {
  const {
    isValidEmail,
    validateEmail: loqateValidateEmail,
    setLoqateAddress,
    setLoqateSettings,
    loqateProjectSettings,
    emailValidationIsInProgress,
  } = useLoqate();
  const { account, update } = useAccount();
  const { discardForm } = useDiscardForm();
  const [data, setData] = useState<Account>(account as Account);
  const [loading, setLoading] = useState(false);

  const { validateEmail, validateTextExists } = useValidate();
  const { notifyDataUpdated, notifyWentWrong } = useFeedbackToasts();

  const { formatMessage } = useFormat({ name: 'common' });
  const { formatMessage: formatErrorMessage } = useFormat({ name: 'error' });
  const { formatMessage: formatAccountMessage } = useFormat({ name: 'account' });

  const invalidNameErrorMessage = formatErrorMessage({
    id: 'name',
    defaultMessage: 'Name has to be at least two characters.',
  });
  const invalidEmailErrorMessage = formatErrorMessage({ id: 'email', defaultMessage: 'Email is not valid.' });

  //input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setLoqateAddress({ email: e.target.value });
  };

  useEffect(() => {
    if (!loqateProjectSettings.fetchInProgress) {
      setLoqateSettings({
        emailValidationEnabled: true,
      });
    }
  }, [loqateProjectSettings.fetchInProgress]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);

    setLoqateAddress({ email: data.email });
    const validEmail = await loqateValidateEmail();

    if (!validEmail) {
      setLoading(false);
      return;
    }

    update(data)
      .then(() => notifyDataUpdated())
      .then(() => discardForm())
      .then(() => setLoading(false))
      .catch(() => notifyWentWrong());
  }, [loqateValidateEmail, setLoqateAddress]);

  const handleEmailValidation = useCallback(
    (email: string) => {
      return validateEmail(email) && (emailValidationIsInProgress ? undefined : isValidEmail);
    },
    [emailValidationIsInProgress, isValidEmail],
  );

  const inputFields: Array<InputProps> = [
    {
      label: formatMessage({ id: 'firstName', defaultMessage: 'First Name' }),
      name: 'firstName',
      errorMessage: invalidNameErrorMessage,
      validation: validateTextExists,
    },
    {
      label: formatMessage({ id: 'lastName', defaultMessage: 'Last Name' }),
      name: 'lastName',
      errorMessage: invalidNameErrorMessage,
      validation: validateTextExists,
    },
    {
      label: formatMessage({ id: 'email', defaultMessage: 'Email' }),
      name: 'email',
      errorMessage: invalidEmailErrorMessage,
      validation: handleEmailValidation,
    },
  ];

  // # Email edit my account

  return (
    <AccountForm
      title={formatAccountMessage({ id: 'personal.info.edit', defaultMessage: 'Edit personal information' })}
      requiredLabelIsVisible
      defaultCTASection
      loading={loading}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-12">
        {inputFields.map((fieldProps, index) => (
          <Input
            key={index}
            {...fieldProps}
            onChange={handleChange}
            value={data?.[fieldProps.name as inputNameType] ?? ''}
            required
          />
        ))}
      </div>
    </AccountForm>
  );
};

export default PersonalInfoForm;
