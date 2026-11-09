import type { ReactNode } from "react";

// One stroke icon set (24px grid, 1.75 stroke), drawn for this app.
const Svg = (props: { children: ReactNode }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={1.75}
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    {props.children}
  </svg>
);

export const PlayIcon = () => (
  <Svg>
    <path d='M7 5.5v13l11-6.5z' fill='currentColor' />
  </Svg>
);

export const PauseIcon = () => (
  <Svg>
    <path d='M8 5.5v13M16 5.5v13' strokeWidth={3} />
  </Svg>
);

export const SwapIcon = () => (
  <Svg>
    <path d='M4 8h15m-4-4 4 4-4 4M20 16H5m4 4-4-4 4-4' />
  </Svg>
);

export const ExpandIcon = () => (
  <Svg>
    <path d='M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' />
  </Svg>
);

export const CollapseIcon = () => (
  <Svg>
    <path d='M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5' />
  </Svg>
);

export const ChevronLeftIcon = () => (
  <Svg>
    <path d='m14.5 6-6 6 6 6' />
  </Svg>
);

export const ChevronRightIcon = () => (
  <Svg>
    <path d='m9.5 6 6 6-6 6' />
  </Svg>
);
