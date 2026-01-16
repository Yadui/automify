"use client";

import React, { memo, useRef, useState, useMemo } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

// --- Configuration ---

function generateSinePath({
  width = 100,
  yCenter = 50,
  amplitude = 10,
  frequency = 1,
  phase = 0,
  points = 50
}: {
  width?: number;
  yCenter?: number;
  amplitude?: number;
  frequency?: number;
  phase?: number;
  points?: number;
}) {
  const pathData = [];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const t = i / points;
    const angle = t * frequency * 2 * Math.PI + phase;
    const y = yCenter + amplitude * Math.sin(angle);

    if (i === 0) pathData.push(`M ${x} ${y}`);
    else pathData.push(`L ${x} ${y}`);
  }
  return pathData.join(" ");
}

// 1. Central Spine (Braided Cable)
// Dense, low amplitude, high frequency
const SPINE_THREADS = Array.from({ length: 12 }).map((_, i) => ({
  id: `spine-${i}`,
  d: generateSinePath({
    width: 120,
    yCenter: 50,
    amplitude: 3 + Math.random() * 2, // Tight core variance
    frequency: 4, // High frequency braiding
    phase: i * (Math.PI / 6) + (Math.random() * 0.2), // Jitter
    points: 200
  }),
}));

// 2. Outer Rails (Invisible/Subtle Guides)
const OUTER_THREADS = Array.from({ length: 2 }).map((_, i) => ({
  id: `outer-${i}`,
  d: generateSinePath({
    width: 120,
    yCenter: 50,
    amplitude: 25, // Wide orbit
    frequency: 1.5,
    phase: i * Math.PI, // Opposite phase
    points: 200
  }),
  frequency: 1.5,
  phase: i * Math.PI
}));

export const HeroParallax = ({ products }: { products: { title: string; link: string; thumbnail: string }[] }) => {
  const [hoveredThread, setHoveredThread] = useState<number | null>(null);

  // Increase density by duplicating products
  const denseProducts = useMemo(() => [...products, ...products, ...products], [products]);

  // Assign signals to OUTER threads
  const signals = useMemo(() => {
    return denseProducts.map((product, i) => {
      const threadIndex = i % OUTER_THREADS.length;
      return {
        ...product,
        key: `${product.title}-${i}`,
        threadIndex,
        threadData: OUTER_THREADS[threadIndex],
        initialOffset: (i / denseProducts.length) * 100,
        speed: 1,
      };
    });
  }, [denseProducts]);

  return (
    <div className="relative w-full h-[600px] bg-neutral-950 overflow-hidden flex items-center justify-center">
      {/* 1. SVG Layer (Spine + Rails) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ transform: "translateX(-10%) scaleX(1.1)", overflow: 'visible' }}
      >
        {/* Braided Spine (Infrastructure) */}
        {SPINE_THREADS.map((thread, i) => (
          <path
            key={thread.id}
            d={thread.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.35"
            className="text-white/10"
          />
        ))}

        {/* Outer Rails (Guides) */}
        {OUTER_THREADS.map((thread, i) => (
          <path
            key={thread.id}
            d={thread.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={hoveredThread === i ? "1.2" : "0.6"}
            className=
              "transition-all duration-500"
          />
        ))}
      </svg>

      {/* 2. Signals Layer */}
      <div className="absolute inset-0 w-full h-full" style={{ transform: "translateX(-10%) scaleX(1.1)" }}>
        {signals.map((item, i) => (
          <Signal
            key={item.key}
            item={item}
            setHoveredThread={setHoveredThread}
          />
        ))}
      </div>

      {/* Side Vignettes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-neutral-950 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-neutral-950 to-transparent z-20" />
    </div>
  );
};

const Signal = ({
  item,
  setHoveredThread
}: {
  item: any,
  setHoveredThread: (id: number | null) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(item.initialOffset);
  const depth = useMotionValue(0); // -1 (back) to 1 (front)

  useAnimationFrame((time, delta) => {
    // Speed: % per ms
    const velocity = 0.003 * item.speed;
    let newProgress = progress.get() + (velocity * delta);

    // Loop
    if (newProgress > 100) newProgress -= 100;
    progress.set(newProgress);

    // Calculate Depth (Fake 3D)
    const t = newProgress / 100;
    const angle = t * item.threadData.frequency * 2 * Math.PI + item.threadData.phase;
    const z = Math.cos(angle);
    depth.set(z);
  });

  const offsetDistance = useTransform(progress, v => `${v}%`);

  // Fake 3D Transforms
  // Scale range: 0.6 (back) to 1.2 (front)
  const scale = useTransform(depth, [-1, 1], [0.6, 1.2]);
  // Opacity: 0.6 (back) to 1 (front)
  const opacity = useTransform(depth, [-1, 1], [0.6, 1]);
  // No z-index

  return (
    <motion.div
      ref={containerRef}
      className="absolute top-0 left-0 will-change-transform"
      style={{
        offsetPath: `path('${item.threadData.d}')`,
        offsetDistance,
        offsetRotate: "0deg",
        offsetAnchor: "50% 50%",
        scale,
        opacity,
      }}
      onMouseEnter={() => setHoveredThread(item.threadIndex)}
      onMouseLeave={() => setHoveredThread(null)}
    >
      <div className="
           relative w-12 h-12 rounded-full
           flex items-center justify-center
           overflow-hidden
           group duration-300
        ">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill={true}
          sizes="50px"
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </motion.div>
  );
};