import type { SVGProps } from 'react';

/**
 * Inline SVG icon set (stroke-based, 24px grid). Inlining avoids an icon font
 * or image requests and lets icons inherit `currentColor`.
 */
const PATHS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h14V10M10 20v-6h4v6',
  savings:
    'M5 10.5V8a3 3 0 0 1 3-3h1M19 11h1.5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H19M5 13H3M7 17l-1 3M17 17l1 3M9 5a3 3 0 1 1 6 0M4 11a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z',
  loans:
    'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5ZM6.5 10.5h.01M17.5 13.5h.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  logout: 'M15 17l5-5-5-5M20 12H9M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff:
    'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M6.7 6.7C4.1 8.3 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.5 4.9-1.3M9.9 5.2C10.6 5.1 11.3 5 12 5c6.5 0 10 7 10 7s-.9 1.8-2.6 3.5',
  target:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  flex: 'M3 12c3-6 6-6 9 0s6 6 9 0M3 18c3-6 6-6 9 0s6 6 9 0',
  lock: 'M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v3',
  person: 'M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-8 9c1-4 4-6 8-6s7 2 8 6',
  salary: 'M4 8h16v12H4zM9 8V5h6v3M4 13h16M12 12v3',
  business: 'M3 21h18M5 21V5l7-3 7 3v16M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4',
  check: 'M5 12.5 9.5 17 19 7',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-6v-5M12 8h.01',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  chevronRight: 'm9 6 6 6-6 6',
  shield: 'M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3ZM9 12l2 2 4-4',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v4l3 2',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8',
  wallet: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Zm13 6h.01',
  trend: 'M3 17 9 11l4 4 8-8M15 7h6v6',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Provide a label only when the icon conveys meaning on its own. */
  label?: string;
}

export function Icon({ name, size = 20, label, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {label ? <title>{label}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
