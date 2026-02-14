import React from "react";

const MentorshipIllustration: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background blobs for depth */}
      <circle
        cx="200"
        cy="150"
        r="120"
        fill="url(#paint0_radial)"
        fillOpacity="0.2"
      />

      {/* Woman (Right) */}
      <g transform="translate(220, 80)">
        {/* Hair */}
        <path
          d="M60 20C60 20 85 20 90 50C95 80 80 90 80 90L60 80V50"
          fill="#2e1065"
        />
        <circle cx="50" cy="50" r="30" fill="#Fcd34d" /> {/* Face */}
        <path
          d="M20 80C20 80 10 160 10 180H110C110 160 100 80 100 80L20 80Z"
          fill="#8b5cf6"
        />{" "}
        {/* Body */}
        <circle cx="50" cy="50" r="30" fill="#ffedd5" />{" "}
        {/* Face actual color */}
        <path
          d="M20 50C20 30 40 10 60 15C80 20 85 50 85 50"
          stroke="#2e1065"
          strokeWidth="10"
          strokeLinecap="round"
        />{" "}
        {/* Hair detail */}
      </g>

      {/* Man (Left) */}
      <g transform="translate(60, 90)">
        <path
          d="M20 90C20 90 10 170 10 190H110C110 170 100 90 100 90L20 90Z"
          fill="#0ea5e9"
        />{" "}
        {/* Body */}
        <circle cx="60" cy="50" r="30" fill="#ffedd5" /> {/* Face */}
        <path
          d="M30 40C30 40 40 10 70 10C100 10 90 50 90 50"
          fill="#1e293b"
        />{" "}
        {/* Hair */}
      </g>

      {/* Speech Bubbles */}
      <g transform="translate(140, 30)">
        <path
          d="M10 10H90C100 10 100 20 100 20V60C100 70 90 70 90 70H40L20 90L30 70H10C0 70 0 60 0 60V20C0 10 10 10 10 10Z"
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <circle cx="30" cy="40" r="4" fill="#cbd5e1" />
        <circle cx="50" cy="40" r="4" fill="#cbd5e1" />
        <circle cx="70" cy="40" r="4" fill="#cbd5e1" />
      </g>

      {/* Connection Lines */}
      <path
        d="M120 150 L220 150"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <circle
        cx="170"
        cy="150"
        r="10"
        fill="white"
        stroke="#0ea5e9"
        strokeWidth="2"
      />

      <defs>
        <radialGradient
          id="paint0_radial"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(200 150) rotate(90) scale(120)"
        >
          <stop stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#0EA5E9" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default MentorshipIllustration;
