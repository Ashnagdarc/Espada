'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  imageHeight?: string;
  lines?: number;
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

interface SkeletonListProps {
  items?: number;
  className?: string;
  showAvatar?: boolean;
}

const shimmerAnimation = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: {
    repeat: Infinity,
    duration: 1.5,
    ease: 'linear'
  }
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animate = true
}) => {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 ${rounded ? 'rounded-full' : 'rounded'} ${className}`;
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  if (!animate) {
    return <div className={baseClasses} style={style} />;
  }

  return (
    <div className={`relative overflow-hidden ${baseClasses}`} style={style}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent"
        {...shimmerAnimation}
      />
    </div>
  );
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  lastLineWidth = '75%'
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showImage = true,
  imageHeight = '12rem',
  lines = 3
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {showImage && (
        <Skeleton
          height={imageHeight}
          className="mb-4"
          rounded={false}
        />
      )}
      
      <div className="space-y-3">
        <Skeleton height="1.5rem" width="60%" />
        <SkeletonText lines={lines} />
        
        <div className="flex space-x-2 pt-2">
          <Skeleton height="2rem" width="5rem" rounded />
          <Skeleton height="2rem" width="5rem" rounded />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
  showHeader = true
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {showHeader && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} height="1rem" width="80%" />
            ))}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  height="1rem"
                  width={colIndex === 0 ? '90%' : Math.random() > 0.5 ? '70%' : '85%'}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  className = '',
  showAvatar = true
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {showAvatar && (
            <Skeleton
              width="3rem"
              height="3rem"
              rounded
            />
          )}
          
          <div className="flex-1 space-y-2">
            <Skeleton height="1.25rem" width="40%" />
            <Skeleton height="1rem" width="80%" />
          </div>
          
          <div className="flex space-x-2">
            <Skeleton width="4rem" height="2rem" rounded />
            <Skeleton width="4rem" height="2rem" rounded />
          </div>
        </div>
      ))}
    </div>
  );
};

// Specialized skeletons for admin components
export const SkeletonStats: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton width="2rem" height="2rem" rounded />
            <Skeleton width="1.5rem" height="1.5rem" />
          </div>
          
          <div className="space-y-2">
            <Skeleton height="2rem" width="60%" />
            <Skeleton height="1rem" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonChart: React.FC<{ className?: string; height?: string }> = ({ 
  className = '', 
  height = '20rem' 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="mb-6">
        <Skeleton height="1.5rem" width="40%" className="mb-2" />
        <Skeleton height="1rem" width="60%" />
      </div>
      
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between space-x-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton
              key={index}
              width="100%"
              height={`${Math.random() * 80 + 20}%`}
              className="flex-1"
            />
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center space-x-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton width="0.75rem" height="0.75rem" rounded />
            <Skeleton width="4rem" height="1rem" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonProduct: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <Skeleton height="12rem" rounded={false} />
      
      <div className="p-4 space-y-3">
        <Skeleton height="1.25rem" width="80%" />
        <Skeleton height="1rem" width="60%" />
        
        <div className="flex items-center justify-between pt-2">
          <Skeleton height="1.5rem" width="4rem" />
          <div className="flex space-x-2">
            <Skeleton width="2rem" height="2rem" rounded />
            <Skeleton width="2rem" height="2rem" rounded />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;