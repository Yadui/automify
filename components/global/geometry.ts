
// Helper to generate a normalized sine wave path string
// Now accepts dynamic width/height and curve logic
export function generateSinePath({
  width,
  height,
  amplitude = 10,
  frequency = 1,
  phase = 0,
  points = 100
}: {
  width: number;
  height: number;
  amplitude?: number;
  frequency?: number;
  phase?: number;
  points?: number;
}) {
  const pathData = [];
  
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    
    // 1. Calculate Baseline Position (Diagonal Curve)
    // Start: Bottom-Left (0, height)
    // End: Top-Right (width, 0)
    // Let's add a slight bend using a quadratic bezier feel
    // P0(0, h), P1(w*0.6, h), P2(w, 0) -> Lazy curve that stays low then rises
    
    // Linear Interpolation for X
    const xBase = t * width;
    
    // Bezier Interpolation for Y
    // (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const p0y = height;
    const p1y = height; // Control point Y (stay at bottom)
    const p2y = 0;
    
    // Adjust x control point to smooth the curve?
    // Let's simpler: Linear diagonal for base, modify with Sine.
    // yBase = height - (t * height)
    
    // Let's do the "lazy rise" S-curve
    // Ease-in-out-like curve for Y
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    // Actually, let's just stick to a smooth diagonal curve
    // x = t * width
    // y = height - (t * height)
    
    // User requested "Start bottom left and curve to top right".
    // Curve implies non-linear.
    // Let's map Y to a simple Quad easeOut?
    // Y starts h, goes to 0.
    // y = h * (1 - t*t) ? (Parabola). 
    // At t=0, y=h. At t=1, y=0.
    // Shape: Convex.
    // Concave: y = h * (1-t)^2
    
    const yBase = height * (1 - t) * (1 - t); // Parabolic curve to top-right
    // Or just linear transform:
    // const yBase = height - (t * height);

    // 2. Add Helical Sine Wave
    // We oscillate perpendicular to the generic flow?
    // Simplifying: Just oscillate Y.
    // This makes the "pipe" wavy vertically.
    const angle = t * frequency * 2 * Math.PI + phase;
    const oscillation = amplitude * Math.sin(angle);
    
    // Final Coords
    const x = xBase; 
    const y = yBase + oscillation;
    
    if (i === 0) pathData.push(`M ${x} ${y}`);
    else pathData.push(`L ${x} ${y}`);
  }
  
  return pathData.join(" ");
}

export function generateSpinePaths(width: number, height: number) {
  // 1. Central Spine (Braided Cable) - Thicker, more strands
  const spine = Array.from({ length: 30 }).map((_, i) => ({
    id: `spine-${i}`,
    d: generateSinePath({
      width,
      height,
      amplitude: 15 + Math.random() * 10, // Increased amplitude for a thicker core look
      frequency: 3, 
      phase: i * (Math.PI / 10) + (Math.random() * 0.5), // Randomized phases for richer texture
      points: 200
    }),
  }));

  // 2. Outer Rails (Orbits for Signals) - Increased to 16 rails to show more unique services
  const railConfigs = [
      { count: 4, amp: 30, freq: 1.5 }, // Inner
      { count: 4, amp: 50, freq: 1.4 }, // Mid-Inner
      { count: 4, amp: 70, freq: 1.3 }, // Mid-Outer
      { count: 4, amp: 90, freq: 1.2 }, // Outer
  ];

  const rails = railConfigs.flatMap((cfg, groupIdx) => 
     Array.from({ length: cfg.count }).map((_, i) => {
        // Offset phases to create a spiral cylinder effect
        const phase = (i / cfg.count) * Math.PI * 2 + (groupIdx * Math.PI/4);
        const amplitude = cfg.amp + Math.random() * 5;
        // Vary pitch (frequency) per thread more significantly
        const frequency = cfg.freq + (Math.random() * 1.0 - 0.5);
        
        return {
            id: `outer-${groupIdx}-${i}`,
            d: generateSinePath({
            width,
            height,
            amplitude,
            frequency,
            phase,
            points: 200
            }),
            frequency,
            phase, 
            amplitude,
            // Unique speed factor per thread: [0.5, 2.0]
            speed: 0.5 + Math.random() * 1.5
        };
     })
  );

  return { spine, rails };
}
