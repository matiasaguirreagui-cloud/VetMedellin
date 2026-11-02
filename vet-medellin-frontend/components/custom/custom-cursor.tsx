'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Add hover detection for interactive elements
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, [role="button"], input, select, textarea, [data-cursor-hover]'
      );

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    
    // Initial and mutation observer for dynamic elements
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  // Only show custom cursor on desktop
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return null;
  }

  return (
    <>
      {/* Hide default cursor */}
      <style jsx global>{`
        @media (min-width: 769px) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
      
      {/* Custom paw cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 500, damping: 30 },
          opacity: { duration: 0.2 },
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-colors duration-200 ${isHovering ? 'text-emerald-500' : 'text-gray-700'}`}
        >
          {/* Main pad */}
          <ellipse
            cx="12"
            cy="14"
            rx="5"
            ry="4"
            fill="currentColor"
          />
          {/* Top left toe */}
          <ellipse
            cx="7"
            cy="8"
            rx="2"
            ry="2.5"
            fill="currentColor"
            transform="rotate(-15 7 8)"
          />
          {/* Top right toe */}
          <ellipse
            cx="17"
            cy="8"
            rx="2"
            ry="2.5"
            fill="currentColor"
            transform="rotate(15 17 8)"
          />
          {/* Middle left toe */}
          <ellipse
            cx="9.5"
            cy="6"
            rx="1.8"
            ry="2.3"
            fill="currentColor"
            transform="rotate(-5 9.5 6)"
          />
          {/* Middle right toe */}
          <ellipse
            cx="14.5"
            cy="6"
            rx="1.8"
            ry="2.3"
            fill="currentColor"
            transform="rotate(5 14.5 6)"
          />
        </svg>
      </motion.div>
    </>
  );
}
