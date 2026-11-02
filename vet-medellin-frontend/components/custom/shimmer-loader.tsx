'use client';

import { motion } from 'framer-motion';

interface ShimmerLoaderProps {
  text?: string;
  className?: string;
}

export function ShimmerLoader({ text = 'Cargando', className = '' }: ShimmerLoaderProps) {
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <h2 className="text-4xl font-bold text-transparent bg-clip-text shimmer-text">
          {text}
        </h2>
      </motion.div>

      <style jsx>{`
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #9ca3af 0%,
            #86efac 25%,
            #93c5fd 50%,
            #9ca3af 75%,
            #86efac 100%
          );
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </div>
  );
}

// Table skeleton loader
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Header skeleton */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 bg-gray-200 rounded animate-pulse"
            style={{ width: `${100 / columns}%` }}
          />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 bg-gray-100 rounded animate-pulse"
              style={{ 
                width: `${100 / columns}%`,
                animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
    </div>
  );
}

// Grid skeleton loader
export function GridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
