import * as React from "react";

export function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* SQL4DATA Logo - S symbol with data nodes */}
      <g transform="translate(10, 5)">
        {/* Main S curve */}
        <path
          d="M30 25 C 30 5, 60 10, 65 30 C 70 50, 40 60, 40 85 C 40 105, 70 100, 80 85"
          stroke="#442a65"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />

        {/* Data connection line */}
        <path
          d="M50 40 C 55 55, 80 60, 90 40"
          stroke="#442a65"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Data nodes (white circles) */}
        <circle cx="60" cy="28" r="4.5" fill="white" />
        <circle cx="45" cy="80" r="4.5" fill="white" />

        {/* Grey data bars */}
        <rect x="10" y="75" width="18" height="6" rx="3" fill="#87888a" />
        <rect x="0" y="92" width="28" height="6" rx="3" fill="#87888a" />
      </g>
    </svg>
  );
}
