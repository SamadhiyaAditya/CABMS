"use client";

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

/**
 * Premium Skeleton Placeholder
 * Industry-standard "shimmer" effect for loading states.
 */
export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  className = '' 
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton-base ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear'
      }}
    />
  );
}

// Ensure the animation is available globally or via a style tag
// I'll add the CSS to globals.css in the next step.
