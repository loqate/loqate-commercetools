import React from 'react';
import { LoqateProvider } from 'helpers/contexts/loqate/loqateContext';
import { Reference } from 'types/reference';
import RegisterForm from './register-form';
import AlterForm from '../../account/account-atoms/alter-form';

export interface RegisterProps {
  termsOfUseLink?: Reference;
}

const Register: React.FC<RegisterProps> = ({ termsOfUseLink }) => {
  return (
    <LoqateProvider>
      <div className="m-auto grid max-w-[480px] px-16">
        <RegisterForm termsOfUseLink={termsOfUseLink} />
      </div>
      <AlterForm page="login" />
    </LoqateProvider>
  );
};

export default Register;
