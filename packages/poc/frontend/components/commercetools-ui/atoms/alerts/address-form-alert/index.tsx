import React from 'react';

interface AddressValidationAlertProps {
  status: 'Questionable' | 'Invalid';
  address?: string;
  className?: string;
  onDiscard?: () => void;
  onAccept?: () => void;
  onContinue?: () => void;
}

const AddressValidationAlert: React.FC<AddressValidationAlertProps> = ({
  status,
  address,
  onDiscard,
  onAccept,
  onContinue,
  className,
}) => {
  return (
    <div
      className={className ?? 'rounded-b border-t-4 border-teal-500 bg-teal-100 px-4 py-3 text-teal-900 shadow-md'}
      role="alert"
    >
      <div className="flex">
        <div>
          {status === 'Questionable' && (
            <>
              <p className="font-bold">The address that you&apos;ve entered is questionable</p>
              <p className="me-8 mt-10 text-sm">
                Did you mean: <span className="underline decoration-solid">{address}</span>
              </p>
            </>
          )}
          {status === 'Invalid' && (
            <>
              <p className="font-bold">The address that you&apos;ve entered could not be verified</p>
              <p className="me-8 mt-10 text-sm">Would you like to continue anyway?</p>
            </>
          )}
        </div>
      </div>
      <div className="float-right mt-30">
        {status === 'Questionable' && (
          <>
            <button
              onClick={onDiscard}
              className="rounded bg-transparent px-5 py-2 font-semibold text-teal-700 hover:border-transparent hover:bg-teal-900 hover:text-white"
            >
              Discard
            </button>
            <button
              onClick={onAccept}
              className="rounded bg-transparent px-5 py-2 font-semibold text-teal-700 hover:border-transparent hover:bg-teal-900 hover:text-white"
            >
              Accept
            </button>
          </>
        )}
        {status === 'Invalid' && (
          <button
            onClick={onContinue}
            className="rounded bg-transparent px-5 py-2 font-semibold text-teal-700 hover:border-transparent hover:bg-teal-900 hover:text-white"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressValidationAlert;
