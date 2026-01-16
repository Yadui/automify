"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateSpinePaths } from "./geometry";
import { Icons } from "@/components/icons/logos";

// Define strict types
interface OrbitingItem {
  key: string;
  title: string;
  component: React.ComponentType;
  threadIndex: number;
  threadData: any;
  initialOffset: number;
  speed: number;
  size: number;
  glowBias: number;
}

export const HeroSignalSpine = ({ products }: { products?: any[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredOrbit, setHoveredOrbit] = useState<number | null>(null);

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Geometry: Conduit (Spine) & Orbits (Rails)
  const { spine: conduit, rails: orbits } = useMemo(() => {
    if (dimensions.width === 0) return { spine: [], rails: [] };
    return generateSpinePaths(dimensions.width, dimensions.height);
  }, [dimensions]);

  // Base Items (Shuffled on mount for variety)
  const items = useMemo(() => {
    const iconEntries = Object.entries(Icons);
    // Fisher-Yates shuffle
    for (let i = iconEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [iconEntries[i], iconEntries[j]] = [iconEntries[j], iconEntries[i]];
    }
    return iconEntries.map(([key, IconComponent]) => ({
      title: key,
      component: IconComponent
    }));
  }, []);

  // 1. Assign Unique Icons per Orbit (Mutually Exclusive Subsets)
  const signals = useMemo(() => {
    if (orbits.length === 0 || items.length === 0) return [];

    const signalsPerRail = 2; // Keep density low as requested

    return orbits.flatMap((orbit, orbitIndex) => {
      // Divide the total icon pool among the available rails
      // We assign a unique slice of the shuffled pool to each rail to ensure
      // strict mutual exclusivity (no icon appears on two different rails).

      const totalIcons = items.length;
      const totalRails = orbits.length;
      // Determine how many icons this rail *could* maximally handle if we distributed evenly
      // but simpler is to just stride through the list.
      // We want to use ALL icons.

      // Method: Chunking
      const chunkSize = Math.ceil(totalIcons / totalRails);
      const startIndex = orbitIndex * chunkSize;
      // Ensure we don't go out of bounds, but also don't loop back to start (exclusivity)
      const endIndex = Math.min(startIndex + chunkSize, totalIcons);

      const railIcons = items.slice(startIndex, endIndex);

      // If we've run out of unique icons for the last few rails, 
      // we might want to leave them empty OR reuse? 
      // User said "unique set... only those travel". Reuse breaks exclusivity.
      // With ceil(), usually the last rail just has fewer items or 0 if we over-partitioned.
      // If we have 16 rails and 30 icons, ceil(30/16) = 2. 16*2 = 32. Fits.

      if (railIcons.length === 0) return [];

      return Array.from({ length: signalsPerRail }).map((_, itemIndex) => {
        // Cycle through the allocated distinct icons for this specific rail
        const iconEntry = railIcons[itemIndex % railIcons.length];
        const { title: iconName, component: IconComponent } = iconEntry;

        return {
          key: `${iconName}-${orbitIndex}-${itemIndex}`,
          title: iconName,
          component: IconComponent,
          threadIndex: orbitIndex,
          threadData: orbit,
          initialOffset: (itemIndex / signalsPerRail) * 100,

          // Variance (Static per item)
          speed: 0.8 + Math.random() * 0.6,
          size: 1,
          glowBias: Math.random(),
        } as OrbitingItem;
      });
    });
  }, [orbits, items]);

  if (dimensions.width === 0) return <div ref={containerRef} className="w-full h-[600px] bg-neutral-950" />;

  // Create a main spine path for the glow/core layers
  // Use the first strand as the proxy for the core flow.
  const corePath = conduit[0]?.d || "";

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-neutral-950 overflow-hidden flex items-center justify-center">
      {/* 1. Infrastructure Layer (Conduit) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Layer 1: Soft Glow Base */}
        {corePath && (
          <path
            d={corePath}
            fill="none"
            stroke="#a855f7" // Purple
            strokeWidth="12"
            className="opacity-[0.03] blur-md"
          />
        )}

        {/* Layer 2: Core Cable */}
        {corePath && (
          <path
            d={corePath}
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="opacity-[0.05]"
          />
        )}

        {/* Layer 3: Braided Detail (Texture) */}
        {conduit.map((thread) => (
          <path
            key={thread.id}
            d={thread.d}
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            className="opacity-[0.08]"
          />
        ))}

        {/* Orbits (Rails) - Barely Visible Guides */}
        {orbits.map((thread, i) => (
          <path
            key={thread.id}
            d={thread.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={hoveredOrbit === i ? "1" : "0.3"}
            className={cn(
              "transition-all duration-500",
              hoveredOrbit === i ? "text-purple-400/40" : "text-white/5"
            )}
          />
        ))}
      </svg>

      {/* 2. Signals Layer */}
      <div className="absolute inset-0 w-full h-full">
        {signals.map((item) => (
          <OrbitingSignal
            key={item.key}
            item={item}
            setHoveredOrbit={setHoveredOrbit}
          />
        ))}
      </div>

      {/* Side Vignettes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-neutral-950 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-neutral-950 to-transparent z-20" />
    </div>
  );
};

const OrbitingSignal = ({
  item,
  setHoveredOrbit
}: {
  item: OrbitingItem,
  setHoveredOrbit: (id: number | null) => void
}) => {
  const progress = useMotionValue(item.initialOffset);
  const depth = useMotionValue(0);

  useAnimationFrame((time, delta) => {
    // Current depth factor (0.6 at back, 1.0 at front)
    const currentDepth = depth.get();
    const depthFactor = 0.6 + 0.4 * ((currentDepth + 1) / 2);

    // Parallax Speed: front moves faster, back moves slower
    // multiply by thread-specific speed factor for distinct rail dynamics
    const threadSpeed = item.threadData.speed || 1;
    const velocity = 0.0025 * item.speed * threadSpeed * depthFactor;

    let newProgress = progress.get() + (velocity * delta);
    if (newProgress > 100) newProgress -= 100;
    progress.set(newProgress);

    // Update Depth
    const t = newProgress / 100;
    const angle = t * item.threadData.frequency * 2 * Math.PI + item.threadData.phase;
    const z = Math.cos(angle);
    depth.set(z);
  });

  const offsetDistance = useTransform(progress, v => `${v}%`);

  // Transform based on size variance + depth
  // Flatter scale range as requested
  const scale = useTransform(depth, [-1, 1], [0.8, 1.0]);
  const opacity = useTransform(depth, [-1, 1], [0.3, 1]);
  const blur = useTransform(depth, [-1, 1], ["2px", "0px"]); // Blur back items slightly

  // Removed purple glow dropShadow, kept only subtle blur for depth
  const filter = useTransform(blur, b => `blur(${b})`);

  return (
    <motion.div
      className="absolute top-0 left-0 will-change-transform"
      style={{
        offsetPath: `path('${item.threadData.d}')`,
        offsetDistance,
        offsetRotate: "0deg",
        offsetAnchor: "50% 50%",
        scale,
        opacity,
        filter
      }}
      onMouseEnter={() => setHoveredOrbit(item.threadIndex)}
      onMouseLeave={() => setHoveredOrbit(null)}
    >
      <div className="w-8 h-8 text-white/90 transition-colors duration-300">
        <item.component />
      </div>
    </motion.div>
  );
};
