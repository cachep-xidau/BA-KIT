'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

interface SkeletonTextProps {
  width?: string;
  lines?: number;
  className?: string;
}

export function SkeletonText({ width = '100%', lines = 1, className = '' }: SkeletonTextProps) {
  if (lines === 1) {
    return <Skeleton className={`skeleton-text ${className}`} width={width} />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="skeleton-text" width={i === lines - 1 ? '70%' : width} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return <Skeleton className="skeleton-card" />;
}

export function SkeletonStat() {
  return (
    <div
      className="glass-card-static"
      style={{
        padding: '1.35rem 1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}
      aria-hidden="true"
    >
      <Skeleton className="skeleton-avatar" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton className="skeleton-text" width="40%" height="1.5rem" />
        <Skeleton className="skeleton-text" width="60%" height="0.8rem" />
      </div>
    </div>
  );
}
