'use client';

import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

const NewButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  size = 'small',
  disabled = false,
  ...rest
}) => {
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      <div
        className={`relative w-full lg:w-full ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div
          className={`relative z-10 w-full rounded-full px-8 font-semibold lg:w-full
            ${size === 'small' ? 'py-2' : 'py-3'}
            ${
              disabled
                ? 'bg-gray-300 text-gray-500'
                : 'bg-[#c0e388] active:bg-[#7CC243] transition-transform duration-400 hover:translate-x-2 hover:translate-y-2 active:translate-x-2 active:translate-y-2'
            }
          `}
        >
          {children}
        </div>

        {!disabled && (
          <div className="absolute inset-0 z-1 translate-x-2 translate-y-2 rounded-full bg-[#7CC243]" />
        )}
      </div>
    </button>
  );
};

export default NewButton;