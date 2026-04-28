declare module '@splidejs/react-splide' {
  import * as React from 'react';

  export interface SplideProps {
    options?: Record<string, unknown>;
    children?: React.ReactNode;
    className?: string;
    ariaLabel?: string;
    [key: string]: any;
  }

  export const Splide: React.ComponentType<SplideProps>;
  export const SplideSlide: React.ComponentType<{ className?: string; [key: string]: any }>;
}

declare module '@splidejs/react-splide/css';

