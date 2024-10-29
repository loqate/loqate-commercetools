'use client';

import React from 'react';
import Checkout, { CheckoutWrappedProps } from 'components/commercetools-ui/organisms/checkout';
// import CommercetoolsCheckout from 'components/commercetools-ui/organisms/checkout/ct-checkout';
import { TasticProps } from '../types';

const CheckoutTastic = ({ data }: TasticProps<CheckoutWrappedProps>) => {
  //CT-Checkout
  return <Checkout {...data} />;

  //Fully customized checkout
  //   return <Checkout {...data} />;
};

export default CheckoutTastic;
