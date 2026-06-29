import React from 'react';

export default function GlassPanel({
  as: Component = 'div',
  children,
  className = '',
  interactive = false,
  ...props
}) {
  return (
    <Component
      className={`${interactive ? 'glass-card' : 'app-panel'} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
