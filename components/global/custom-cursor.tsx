"use client";

import React, { useEffect, useRef, useState } from "react";

const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isMoving, setIsMoving] = useState(false); // Track whether the cursor is moving
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true); // Cursor is moving

      // Set a timeout to reset the moving state after 100ms
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMoving(false), 100);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Smoothly interpolate the cursor's position
  useEffect(() => {
    const followCursor = () => {
      if (cursorRef.current) {
        const currentX = parseFloat(cursorRef.current.style.left || "0");
        const currentY = parseFloat(cursorRef.current.style.top || "0");

        const deltaX = mousePosition.x - currentX;
        const deltaY = mousePosition.y - currentY;

        // Calculate the distance between the current and target position
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        // If the distance is small, snap directly to the target position
        if (distance < 0.5) {
          cursorRef.current.style.left = `${mousePosition.x}px`;
          cursorRef.current.style.top = `${mousePosition.y}px`;
        } else {
          // Otherwise, continue interpolating
          const newX = currentX + deltaX * 0.2; // Adjust "0.2" for speed
          const newY = currentY + deltaY * 0.2;

          cursorRef.current.style.left = `${newX}px`;
          cursorRef.current.style.top = `${newY}px`;
        }
      }

      requestAnimationFrame(followCursor);
    };

    followCursor();
  }, [mousePosition]);

  return (
    <>
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isMoving ? "40px" : "20px", // Enlarges when moving
          height: isMoving ? "40px" : "20px", // Enlarges when moving
          backgroundColor: "white", // White color for the cursor
          borderRadius: "50%", // Make it a circle
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          transition: "width 0.1s ease, height 0.1s ease", // Smooth transition for size change
          zIndex: 9999,
        }}
      />

      {/* Global styles to hide the default pointer */}
      <style>{`
        body, a, button, *, *::before, *::after {
          cursor: none !important; 
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
