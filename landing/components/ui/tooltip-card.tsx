"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const Tooltip = ({
  content,
  children,
  containerClassName,
}: {
  content: string | React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isVisible, content]);

  const calculatePosition = (clientX: number, clientY: number) => {
    if (!contentRef.current)
      return { x: clientX + 12, y: clientY + 12 };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const tooltipWidth = 256;
    const tooltipHeight = contentRef.current.scrollHeight;

    let x = clientX + 12;
    let y = clientY + 12;

    if (x + tooltipWidth > viewportWidth) {
      x = clientX - tooltipWidth - 12;
    }

    if (x < 0) {
      x = 12;
    }

    if (y + tooltipHeight > viewportHeight) {
      y = clientY - tooltipHeight - 12;
    }

    if (y < 0) {
      y = 12;
    }

    return { x, y };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    setIsVisible(true);
    setPosition(calculatePosition(e.clientX, e.clientY));
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!isVisible) return;
    setPosition(calculatePosition(e.clientX, e.clientY));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLSpanElement>) => {
    const touch = e.touches[0];
    setPosition(calculatePosition(touch.clientX, touch.clientY));
    setIsVisible(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      if (isVisible) {
        setIsVisible(false);
      } else {
        setPosition(calculatePosition(e.clientX, e.clientY));
        setIsVisible(true);
      }
    }
  };

  useEffect(() => {
    if (isVisible && contentRef.current) {
      setPosition(calculatePosition(
        window.innerWidth / 2,
        window.innerHeight / 2
      ));
    }
  }, [isVisible, height]);

  return (
    <span
      ref={containerRef}
      className={cn("relative inline-block", containerClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                key={String(isVisible)}
                initial={{ height: 0, opacity: 1 }}
                animate={{ height, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="pointer-events-none fixed z-50 max-w-[16rem] overflow-hidden rounded-md border border-transparent bg-white shadow-sm ring-1 shadow-black/5 ring-black/5 dark:bg-neutral-900 dark:shadow-white/10 dark:ring-white/5"
                style={{
                  top: position.y,
                  left: position.x,
                }}
              >
                <div
                  ref={contentRef}
                  className="p-2 text-sm text-neutral-600 md:p-4 dark:text-neutral-400"
                >
                  {content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
};
