import React, { FC, useState, useRef, useCallback } from 'react';
import { CiLocationArrow1 } from 'react-icons/ci';
import Input from 'components/commercetools-ui/atoms/input';
import { useLoqate } from 'helpers/contexts/loqate/loqateContext';
import { LoqateAddress } from 'helpers/contexts/loqate/types/loqate-suggested-address';

interface AddressCaptureProps {
  id?: string;
  name: string;
  className: string;
  label: string;
  required: boolean;
  labelDesc: string;
  type: string;
  isValid: boolean;
  onChange: (event: any) => void;
}

const AddressCapture: FC<AddressCaptureProps> = ({
  id,
  name,
  className,
  label,
  required,
  labelDesc,
  type,
  isValid,
  onChange,
}) => {
  const [elementFocused, setElementFocused] = useState<boolean>(false);
  const { suggestedAddresses, loqateAddress, setLoqateAddress } = useLoqate();
  const containerRef = useRef<HTMLDivElement>(null);
  const handleItemClick = (item: LoqateAddress, name: string) => {
    setLoqateAddress({ ...loqateAddress, ...item, isManualInput: false });
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onBlur={(e) => {
        if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
          setElementFocused(false);
        }
      }}
      onFocus={() => setElementFocused(true)}
    >
      <Input
        id={id}
        name={name}
        label={label}
        labelDesc={labelDesc}
        type={type}
        required={required}
        value={loqateAddress.text}
        labelPosition="top"
        isValid={isValid}
        onChange={(e) => {
          onChange(e);
        }}
        hideCheckIcon
      />

      {elementFocused && suggestedAddresses?.items?.length > 0 && (
        <ul
          className="address-capture-ul overflow-y-auto rounded border border-gray-300"
          onMouseDown={(e) => e.preventDefault()} // Prevent the blur event
        >
          {suggestedAddresses.items?.map((item, index) => (
            <li
              key={index}
              className="flex cursor-pointer items-center justify-between p-2 text-sm hover:bg-gray-100"
              onClick={() => handleItemClick(item, name)}
            >
              <div>
                {item.text} <span className="text-gray-500">{item.description}</span>
              </div>
              {item.type === 'Container' && <CiLocationArrow1 />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressCapture;
