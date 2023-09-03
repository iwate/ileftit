import React, { ButtonHTMLAttributes } from 'react';

type Props = React.PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  loading?: boolean;
  looks?: 'default' | 'text';
};

export const Button: React.FC<Props> = ({
  children,
  looks,
  className,
  disabled,
  loading,
  ...props
}) => {
  className = className || '';
  if (looks === 'text') {
    className = `btn-text ${className}`;
  } else {
    className = `btn ${className}`;
  }
  if (loading) {
    disabled = true;
    className = `${className || ''} loading`;
  }
  return (
    <button className={className} disabled={disabled} {...props}>
      {loading ? <div className="transparent">{children}</div> : children}
    </button>
  );
};
