'use client';

import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'small' | 'medium';
  disabled?: boolean;
  color?: 'secondary' | 'primary';
}

const NewButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  size = 'small',
  disabled = false,
  color = 'primary',
  ...rest
}) => {
  const padding = size === 'small' ? 'py-2' : 'py-3';

  const baseInner = `relative z-10 w-full rounded-full px-8 font-semibold lg:w-full ${padding}`;

  const variants = {
    primary: disabled
      ? 'bg-gray-300 text-gray-500'
      : 'bg-[#c0e388] text-gray-900 active:bg-[#7CC243] transition-transform duration-300 hover:translate-x-2 hover:translate-y-2 active:translate-x-2 active:translate-y-2',
    secondary: disabled
      ? 'bg-gray-200 text-gray-400 border border-gray-300'
      : 'bg-white text-gray-700 border border-gray-300 transition-transform duration-300 hover:translate-x-2 hover:translate-y-2 active:translate-x-2 active:translate-y-2',
  };

  const shadowVariants = {
    primary: 'bg-[#7CC243]',
    secondary: 'bg-gray-400',
  };

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
        <div className={`${baseInner} ${variants[color]}`}>{children}</div>

        {!disabled && (
          <div
            className={`absolute inset-0 z-1 translate-x-2 translate-y-2 rounded-full ${shadowVariants[color]}`}
          />
        )}
      </div>
    </button>
  );
};

export default NewButton;