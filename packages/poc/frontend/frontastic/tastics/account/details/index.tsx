'use client';

import React, { useEffect } from 'react';
import AccountDetails, { AccountDetailsProps } from 'components/commercetools-ui/organisms/account';
import useUpdateCartAddresses from 'helpers/hooks/useUpdateCartAddresses';
import Redirect from 'helpers/redirect';
import { useAccount } from 'frontastic/hooks';
import { TasticProps } from 'frontastic/tastics/types';
import { LoqateProvider } from 'helpers/contexts/loqate/loqateContext';

const AccountDetailsTastic = ({ data }: TasticProps<AccountDetailsProps>) => {
  const updateCartAddresses = useUpdateCartAddresses();

  const { loggedIn } = useAccount();

  useEffect(() => {
    if (loggedIn) updateCartAddresses();
  }, [loggedIn, updateCartAddresses]);

  if (!loggedIn) return <Redirect target="/" />;

  return (
    <LoqateProvider>
      <AccountDetails {...data} />
    </LoqateProvider>
  );
};

export default AccountDetailsTastic;
