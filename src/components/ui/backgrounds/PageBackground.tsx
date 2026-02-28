'use client';

import GridBeams from './GridBeams';

interface PageBackgroundProps {
  variant?: 'default' | 'subtle' | 'intense';
  children?: React.ReactNode;
  className?: string;
}

export default function PageBackground({ variant = 'default', children, className = '' }: PageBackgroundProps) {
  const gradients = {
    default: (
      <>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />
      </>
    ),
    subtle: (
      <>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      </>
    ),
    intense: (
      <>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
      </>
    ),
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Elements */}
      {gradients[variant]}

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

      {/* Dynamic Background Effect */}
      <GridBeams />

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

export { PageBackground };
