import React from 'react';

export default function Input({
  label,
  name,
  type = 'text',
  placeholder = ' ',
  error,
  register,
  required,
  helpText,
  rightIcon,
  className = '',
  ...props
}) {
  const regProps = register ? register(name, { required }) : {};

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        {...regProps}
        {...props}
        className={`glass-field w-full px-4 pt-6 pb-2 rounded-xl text-[15px] font-medium peer ${
          error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10' : ''
        }`}
      />
      {label && (
        <label
          htmlFor={name}
          className="absolute left-4 top-4 text-slate-400 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#8A6514] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      {rightIcon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center">
          {rightIcon}
        </div>
      )}
      {error && <p className="text-[#EF4444] text-xs mt-1 ml-1">{error.message || error}</p>}
      {helpText && !error && <p className="text-slate-500 text-xs mt-1 ml-1">{helpText}</p>}
    </div>
  );
}
