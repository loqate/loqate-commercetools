import { sdk } from 'sdk';
import { useEffect, useState } from 'react';

async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();

    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
  }
}
const useCountryIsoCode = (): [string, (countryIsoCode: string) => void] => {
  const [countryIsoCode, setCountryIsoCode] = useState<string>('');

  const mapIpToCountry = async (): Promise<any> => {
    return await sdk.callAction({ actionName: 'loqate/getCountryByIp', query: { ip: await getUserIP() } });
  };

  useEffect(() => {
    mapIpToCountry().then((response) => {
      if (response.data.items && response.data.items.length > 0) {
        setCountryIsoCode(response.data.items[0].iso2);
      }
    });
  }, []);

  return [countryIsoCode, setCountryIsoCode];
};

export default useCountryIsoCode;
