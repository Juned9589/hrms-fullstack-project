import React from 'react';

export default function Skeleton({ width, height, rounded = 'rounded-xl', className = '' }) {
  return (
    <div
      style={{ width, height }}
      className={`animate-shimmer bg-[linear-gradient(110deg,rgba(255,255,255,0.05),rgba(255,255,255,0.14),rgba(255,255,255,0.05))] bg-[length:200%_100%] ${rounded} ${className}`}
    />
  );
}
