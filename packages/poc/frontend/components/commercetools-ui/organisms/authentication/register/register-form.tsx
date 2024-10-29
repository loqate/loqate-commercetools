import React, { FC, useCallback, useEffect, useState } from 'react';
import Button from 'components/commercetools-ui/atoms/button';
import Input from 'components/commercetools-ui/atoms/input';
import PasswordInput from 'components/commercetools-ui/atoms/input-password';
import Link from 'components/commercetools-ui/atoms/link';
import Typography from 'components/commercetools-ui/atoms/typography';
import { useLoqate } from 'helpers/contexts/loqate/loqateContext';
import { useFormat } from 'helpers/hooks/useFormat';
import useValidate from 'helpers/hooks/useValidate';
import Redirect from 'helpers/redirect';
import { Reference } from 'types/reference';
import { useAccount } from 'frontastic';
import Feedback from '../../account/account-atoms/feedback';

interface Props {
  termsOfUseLink?: Reference;
}

const RegisterForm: FC<Props> = ({ termsOfUseLink }) => {
  const { formatMessage: formatErrorMessage } = useFormat({ name: 'error' });
  const { formatMessage: formatAccountMessage } = useFormat({ name: 'account' });
  const { formatMessage } = useFormat({ name: 'common' });
  const {
    isValidEmail,
    isValidPhone,
    setLoqateAddress,
    loqateAddress,
    loqateProjectSettings,
    setLoqateSettings,
    validateEmail: loqateValidateEmail,
    validatePhone: loqateValidatePhone,
  } = useLoqate();

  useEffect(() => {
    if (!loqateProjectSettings.fetchInProgress) {
      setLoqateSettings({
        emailValidationEnabled: loqateProjectSettings.registrationEmailValidationEnabled,
        phoneValidationEnabled: loqateProjectSettings.registrationPhoneValidationEnabled,
      });
    }
  }, [loqateProjectSettings.fetchInProgress]);

  const { validatePassword } = useValidate();

  //account actions
  const { register, loggedIn } = useAccount();

  //register data
  const [data, setData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });

  //error
  const [error, setError] = useState('');

  //success
  const [success, setSuccess] = useState('');

  //processing...
  const [loading, setLoading] = useState(false);

  //handle text input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (e.target.name === 'email' || e.target.name === 'phone') {
      setLoqateAddress({
        ...loqateAddress,
        [e.target.name]: e.target.value,
      });
    }
  };

  //data validation
  const validate = useCallback(async () => {
    const validPassword = validatePassword(data.password);

    //UI error messages
    if (!validPassword) {
      setError(
        formatErrorMessage({
          id: 'password.not.valid',
          defaultMessage: 'Password has to be at least 8 characters long and have at least one uppercase letter.',
        }),
      );
    }

    const isValidEmail = loqateProjectSettings.registrationEmailValidationEnabled ? await loqateValidateEmail() : true;
    if (!isValidEmail) {
      setError(
        formatErrorMessage({
          id: 'email.not.valid',
          defaultMessage: 'Email is invalid',
        }),
      );
    }

    const isValidPhone = loqateProjectSettings.registrationPhoneValidationEnabled ? await loqateValidatePhone() : true;
    if (!isValidPhone) {
      setError(
        formatErrorMessage({
          id: 'phone.not.valid',
          defaultMessage: 'Phone is invalid',
        }),
      );
    }

    return validPassword && isValidEmail && isValidPhone;
  }, [loqateProjectSettings, data]);

  //form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //validate data
    const isValidData = await validate();
    if (!isValidData) return;
    //processing starts
    setLoading(true);
    //try registering the user with given credentials
    try {
      const response = await register(data);
      if (!response.success) {
        setError(
          response.error?.message ||
            formatErrorMessage({
              id: 'account.create.fail',
              defaultMessage: "Sorry. We couldn't create your account..",
            }),
        );
        setSuccess('');
      } else {
        setError('');
        setSuccess(
          formatAccountMessage({
            id: 'verification.email.sent',
            defaultMessage: 'A verification email was sent to your mail address!',
          }),
        );
      }
    } catch (err) {
      setError(formatErrorMessage({ id: 'wentWrong', defaultMessage: 'Sorry. Something went wrong..' }));
      setSuccess('');
    }
    //processing ends
    setLoading(false);
  };

  if (loggedIn) return <Redirect target="/account" />;

  return (
    <>
      <Typography as="h3" className="mb-16 text-16 md:mb-24 md:text-20 lg:text-24">
        {formatAccountMessage({ id: 'become.member', defaultMessage: 'Become a member' })}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Feedback success={success} error={error} />

        <Input
          id="name"
          name="firstName"
          type="text"
          autoComplete="firstName"
          required
          className="mb-16 md:mb-20"
          placeholder={formatMessage({ id: 'firstName', defaultMessage: 'First Name' })}
          onChange={handleChange}
        />

        <Input
          id="name"
          name="lastName"
          type="text"
          autoComplete="lastName"
          required
          className="mb-16 md:mb-20"
          placeholder={formatMessage({ id: 'lastName', defaultMessage: 'Last Name' })}
          onChange={handleChange}
        />

        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mb-16 md:mb-20"
          placeholder={formatMessage({ id: 'emailAddress', defaultMessage: 'Email Address' })}
          onChange={handleChange}
          isValid={isValidEmail}
        />

        <Input
          id="phone"
          name="phone"
          type="text"
          autoComplete="phone"
          required
          className="mb-16 md:mb-20"
          placeholder={formatMessage({ id: 'phone', defaultMessage: 'Phone Number' })}
          onChange={handleChange}
          isValid={isValidPhone}
        />

        <PasswordInput
          required
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder={formatAccountMessage({ id: 'password', defaultMessage: 'Password' })}
          className="mb-16 md:mb-20"
          onChange={handleChange}
        />

        <Button size="full" type="submit" className="mb-16 text-16 leading-tight md:mb-20" disabled={loading}>
          {formatAccountMessage({ id: 'account.register', defaultMessage: 'Register' })}
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-4 px-15 md:px-30">
          <Typography className="text-12 text-secondary-black md:text-14">
            {formatAccountMessage({
              id: 'by.registering',
              defaultMessage: 'By registering an account, you agree to our',
            })}
          </Typography>
          <Link className="border-b text-12 text-secondary-black md:text-14" link={termsOfUseLink} variant="menu-item">
            {formatAccountMessage({ id: 'terms.of.use', defaultMessage: 'Terms of Use.' })}
          </Link>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
