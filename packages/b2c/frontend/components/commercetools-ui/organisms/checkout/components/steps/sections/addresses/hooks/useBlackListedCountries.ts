import { useState, useEffect } from 'react';
import { SDKResponse } from '@commercetools/frontend-sdk';
import { catchError, from, map, of, tap } from 'rxjs';
import { sdk } from 'sdk';
import allCountries from 'static/countries.json';

interface BlacklistedCountriesResponse {
  blackListedCountries: string;
  isError: boolean;
  tracing: {
    frontasticRequestId: string;
  };
}

async function fetchBlackListedCountries(): Promise<SDKResponse<BlacklistedCountriesResponse>> {
  return await sdk.callAction({ actionName: 'loqate/getBlackListedCountries' });
}

const useBlackListedCountries = (): [
  countries: typeof allCountries,
  fetchingInProgress: boolean,
  successfullyFetched: boolean,
] => {
  const [countries, setCountries] = useState(allCountries);
  const [fetchingInProgress, setFetchingInProgress] = useState(true);
  const [successfullyFetched, setSuccessfullyFetched] = useState(false);

  useEffect(() => {
    setFetchingInProgress(true);
    const $obs = from(fetchBlackListedCountries())
      .pipe(
        map((response) => {
          if (response.isError) {
            throw response.tracing;
          }

          const { data } = response;

          const blackListedCountriesCodes = Array.isArray(data.blackListedCountries)
            ? data.blackListedCountries
                .map(({ restrictedCountryCode = '' }) => {
                  if (typeof restrictedCountryCode === 'string' && restrictedCountryCode.length) {
                    return restrictedCountryCode;
                  }

                  return '';
                })
                .filter((v) => v)
            : [];

          return allCountries.filter((c) => !blackListedCountriesCodes.some((b: any) => b.includes(c.value)));
        }),
        tap(() => {
          setFetchingInProgress(false);
          setSuccessfullyFetched(true);
        }),
        catchError((frontasticRequestId: Pick<BlacklistedCountriesResponse, 'tracing'>) => {
          console.error(`There was an error when fetching black-listed countries. Request ID: ${frontasticRequestId}`);
          return of(allCountries);
        }),
      )
      .subscribe(setCountries);

    return () => $obs.unsubscribe();
  }, []);

  return [countries, fetchingInProgress, successfullyFetched];
};

export default useBlackListedCountries;
