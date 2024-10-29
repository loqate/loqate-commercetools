import { sdk } from 'sdk';

export const mapIpToCountry = async (): Promise<any> => {
  return await sdk.callAction({ actionName: 'loqate/getCountryByIp' });
};
