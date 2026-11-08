"use client";

import { forwardRef } from "react";

export const BrandMark = forwardRef<SVGSVGElement, { className?: string }>(
  function BrandMark({ className }, ref) {
    return (
      <svg
        ref={ref}
        className={className}
        viewBox="182 182 636 636"
        fill="currentColor"
        aria-hidden="true"
      >
        <g className="mm-ring">
          <polygon
            points="500,234 730.4,367 730.4,633 500,766 269.6,633 269.6,367"
            fill="none"
            stroke="currentColor"
            strokeWidth="40"
          />
          <rect x="126" y="-24" width="102" height="48" transform="translate(500 500) rotate(-90)" />
          <rect x="126" y="-24" width="102" height="48" transform="translate(500 500) rotate(-30)" />
          <rect x="126" y="-24" width="102" height="48" transform="translate(500 500) rotate(30)" />
          <rect x="126" y="-24" width="102" height="48" transform="translate(500 500) rotate(90)" />
          <rect x="126" y="-24" width="102" height="48" transform="translate(500 500) rotate(150)" />
          <rect x="126" y="-24" width="102" height="48" transform="translate(500 500) rotate(210)" />
          <circle cx="500" cy="234" r="50" />
          <circle cx="730.4" cy="367" r="50" />
          <circle cx="730.4" cy="633" r="50" />
          <circle cx="500" cy="766" r="50" />
          <circle cx="269.6" cy="633" r="50" />
          <circle cx="269.6" cy="367" r="50" />
        </g>
        <polygon
          className="mm-inner"
          points="500,367 615.2,433.5 615.2,566.5 500,633 384.8,566.5 384.8,433.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="20"
        />
        <g className="mm-A" fillRule="evenodd">
          <path d="M516.8,424h-33.6l-31.3,94.2l28.8-21.7l19.3-58l11.6,34.8l17.3-13L516.8,424z" />
          <path d="M432.7,576h21.6l15.3-45.9h60.8l15.3,45.9h21.6L532,469.8l-17.3,13l9.6,28.9h-47.9l-29.8,22.4L432.7,576z" />
        </g>
      </svg>
    );
  },
);
