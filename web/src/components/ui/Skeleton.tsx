import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
  style?: CSSProperties;
}

/** Content-shaped placeholder. Purely decorative - hidden from screen readers. */
export function Skeleton({ width = '100%', height = '1rem', radius, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <span className={`${styles.text} ${className ?? ''}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} height="0.875rem" width={index === lines - 1 ? '60%' : '100%'} />
      ))}
    </span>
  );
}
