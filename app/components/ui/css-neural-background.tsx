'use client';

import { useEffect, useRef } from 'react';

export default function CSSNeuralBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create animated neural nodes
    const createNode = (x: number, y: number, size: number, delay: number) => {
      const node = document.createElement('div');
      node.className = 'absolute rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 animate-pulse blur-sm';
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.animationDelay = `${delay}s`;
      node.style.animationDuration = `${3 + Math.random() * 2}s`;
      return node;
    };

    const nodes = [
      createNode(20, 20, 80, 0),
      createNode(80, 30, 60, 0.5),
      createNode(15, 70, 70, 1),
      createNode(75, 80, 50, 1.5),
      createNode(50, 15, 90, 2),
      createNode(40, 60, 65, 2.5),
      createNode(85, 60, 45, 3),
      createNode(30, 40, 55, 3.5),
    ];

    nodes.forEach(node => {
      containerRef.current?.appendChild(node);
    });

    return () => {
      nodes.forEach(node => {
        node.remove();
      });
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden" aria-hidden="true">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-purple-100/30 animate-pulse" 
           style={{ animationDuration: '4s' }} />
      
      {/* Neural network nodes container */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Moving wave effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-full h-full">
          <div className="absolute top-1/4 left-0 w-full h-32 bg-gradient-to-r from-transparent via-blue-300/20 to-transparent animate-pulse transform -skew-y-3"
               style={{ animationDuration: '6s', animationDelay: '0s' }} />
          <div className="absolute top-3/4 left-0 w-full h-24 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent animate-pulse transform skew-y-2"
               style={{ animationDuration: '8s', animationDelay: '2s' }} />
        </div>
      </div>
      
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/80" />
    </div>
  );
}