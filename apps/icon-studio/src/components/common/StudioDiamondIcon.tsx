import React from 'react';

interface StudioDiamondIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const StudioDiamondIcon: React.FC<StudioDiamondIconProps> = ({
  className = 'w-4 h-4 text-white',
  style,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="15 20 70 64"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M83.8,41.6l-12.3-19.8H28.5l-12.3,19.8,31.5,38.9h0s2.3,2.8,2.3,2.8l33.8-41.7ZM62.8,34.8l-5.6-7.1h7.9l-2.3,7.1ZM58.6,38.9h-17l8.5-10.8,8.5,10.8ZM37.5,34.7l-2.3-7h7.8l-5.5,7ZM59.6,44.8l-9.4,28.9-9.4-28.9h18.8ZM65.7,44.8h7.9l-13.2,16.4,5.3-16.4ZM26.4,44.8h8.2l5.5,17-13.8-17ZM49.9,73.9h.2c0,0-.1,0-.1,0h0ZM75.2,38.9h-7.6l2.6-8,5,8ZM30,30.6l2.7,8.4h-7.9l5.2-8.4Z" />
    </svg>
  );
};
