import * as React from "react";

export function LogoText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="0"
        y="32"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="36"
        letterSpacing="-1"
      >
        <tspan fill="#442a65">SQL4</tspan>
        <tspan fill="#87888a">DATA</tspan>
      </text>
    </svg>
  );
}
