"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, MotionValue, motionValue, useInView } from "framer-motion";
import * as d3force from "d3-force";
import { polygonContains, polygonCentroid } from "d3-polygon";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons/logos";

// --- DATA MAPPED TO SCREENSHOT LAYOUT ---
const initialIntegrations = [
  // ======================
  // CENTER (ANCHOR)
  // ======================
  {
    id: "openai",
    name: "OpenAI",
    icon: <Icons.openai />,
    color: "#10A37F",
    bx: 0,
    by: 10,
    group: "ai",
    connections: [
      "drive",
      "notion",
      "github",
      "gmail",
      "slack",
      "discord",
      "zoom",
      "whatsapp",
      "stripe",
    ],
  },

  // ======================
  // LEFT — INPUT / CONTEXT
  // ======================
  {
    id: "notion",
    name: "Notion",
    icon: <Icons.notion />,
    color: "#000000",
    bx: -42,
    by: -16,
    group: "apps",
    connections: ["openai"],
  },
  {
    id: "drive",
    name: "Drive",
    icon: <Icons.googleDrive />,
    color: "#00ac47",
    bx: -42,
    by: 0,
    group: "apps",
    connections: ["openai"],
  },
  {
    id: "github",
    name: "GitHub",
    icon: <Icons.github />,
    color: "#000000",
    bx: -42,
    by: 16,
    group: "dev",
    connections: ["openai"],
  },
  {
    id: "user",
    name: "User",
    icon: <Icons.user />,
    color: "#000000",
    bx: -30,
    by: 0,
    group: "user",
    connections: ["openai"],
  },

  // ======================
  // RIGHT — COMMUNICATION
  // ======================
  {
    id: "gmail",
    name: "Gmail",
    icon: <Icons.gmail />,
    color: "#EA4335",
    bx: 32,
    by: -18,
    group: "apps",
    connections: ["openai"],
  },
  {
    id: "slack",
    name: "Slack",
    icon: <Icons.slack />,
    color: "#36C5F0",
    bx: 36,
    by: 0,
    group: "apps",
    connections: ["openai"],
  },
  {
    id: "discord",
    name: "Discord",
    icon: <Icons.discord />,
    color: "#5865F2",
    bx: 32,
    by: 18,
    group: "apps",
    connections: ["openai"],
  },
  {
    id: "zoom",
    name: "Zoom",
    icon: <Icons.zoom />,
    color: "#2D8CFF",
    bx: 22,
    by: -6,
    group: "apps",
    connections: ["openai"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <Icons.whatsapp />,
    color: "#25D366",
    bx: 22,
    by: 12,
    group: "apps",
    connections: ["openai"],
  },

  // ======================
  // BOTTOM — SYSTEM / MONEY
  // ======================
  {
    id: "stripe",
    name: "Stripe",
    icon: <Icons.stripe />,
    color: "#635BFF",
    bx: 8,
    by: 28,
    group: "fin",
    connections: ["openai"],
  },
] as const;

type IntegrationNode = {
  id: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  targetX?: number;
  targetY?: number;
} & (typeof initialIntegrations)[number];

const CENTER_X = 0;
const CENTER_Y = 0;

function pathToPolygon(pathEl: SVGPathElement, step = 3) {
  const length = pathEl.getTotalLength();
  const points: [number, number][] = [];
  for (let i = 0; i < length; i += step) {
    const p = pathEl.getPointAtLength(i);
    points.push([p.x, p.y]);
  }
  return points;
}

const SkillConnection = ({
  x1,
  y1,
  x2,
  y2,
  isRelated,
}: {
  x1: MotionValue<number>;
  y1: MotionValue<number>;
  x2: MotionValue<number>;
  y2: MotionValue<number>;
  isRelated: boolean;
}) => {
  const [timing, setTiming] = useState<{
    duration: number;
    delay: number;
  } | null>(null);

  useEffect(() => {
    const duration = 1.5 + Math.random() * 3.0;
    const delay = Math.random() * 4.0;
    setTiming({ duration, delay });
  }, []);

  return (
    <>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isRelated ? "#525252" : "#e5e5e5"}
        strokeWidth={isRelated ? 4 : 2}
        strokeLinecap="round"
        opacity={isRelated ? 1 : 0.5}
        transition={{ duration: 0.2 }}
      />
      {timing && (
        <motion.line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#a78bfa"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="20 400"
          animate={{ strokeDashoffset: [-420, 20] }}
          transition={{
            duration: timing.duration * 0.7,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
            delay: timing.delay,
            ease: "linear",
          }}
          style={{ opacity: 1, filter: "drop-shadow(0 0 4px #8b5cf6)" }}
        />
      )}
    </>
  );
};

export function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef);
  // draggingId state removed

  const positionsRef = useRef<Record<
    string,
    { x: MotionValue<number>; y: MotionValue<number> }
  > | null>(null);
  if (!positionsRef.current) {
    positionsRef.current = initialIntegrations.reduce((acc, s) => {
      acc[s.id] = { x: motionValue(0), y: motionValue(0) };
      return acc;
    }, {} as Record<string, { x: MotionValue<number>; y: MotionValue<number> }>);
  }
  const positions = positionsRef.current;

  // Reduced scale slightly to fit better in bento card
  const [scale, setScale] = useState(3.5);
  const nodesRef = useRef<IntegrationNode[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Adjusted scales for bento card context
      if (width < 640) {
        setScale(2.5);
      } else if (width < 1024) {
        setScale(3.5);
      } else {
        setScale(4.5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const currentNodes =
      nodesRef.current.length > 0
        ? nodesRef.current
        : initialIntegrations.map((s) => ({ ...s } as IntegrationNode));

    currentNodes.forEach((node, i) => {
      const original = initialIntegrations[i];
      const tx = original.bx * scale;
      const ty = original.by * scale;

      node.targetX = tx;
      node.targetY = ty;

      if (nodesRef.current.length === 0) {
        node.x = tx;
        node.y = ty;
      }
    });

    nodesRef.current = currentNodes;
    const nodes = currentNodes;

    const links = initialIntegrations.flatMap((s) =>
      s.connections
        .map((targetId) => {
          const sourceNode = nodes.find((n) => n.id === s.id);
          const targetNode = nodes.find((n) => n.id === targetId);
          return sourceNode && targetNode
            ? { source: sourceNode, target: targetNode }
            : null;
        })
        .filter(Boolean)
    ) as { source: IntegrationNode; target: IntegrationNode }[];

    const repulsionStrength = -150 * scale; // Stronger repulsion for spacing
    const linkDistance = 20 * scale;
    const collisionRadius = 15 * scale;

    const simulation = d3force
      .forceSimulation(nodes as any)
      .force("charge", d3force.forceManyBody().strength(repulsionStrength))
      .force("link", d3force.forceLink(links).distance(linkDistance))
      .force("collide", d3force.forceCollide(collisionRadius).strength(0.8))
      .force("x", d3force.forceX((d: any) => d.targetX).strength(0.3)) // Stronger anchor
      .force("y", d3force.forceY((d: any) => d.targetY).strength(0.3)) // Stronger anchor
      .alphaDecay(0.05) // Faster settle
      .alpha(1)
      .alphaMin(0.001);

    const svgEl = containerRef.current.querySelector(
      "#eFs69VwC5ck1"
    ) as SVGSVGElement | null;
    let polygon: [number, number][] | null = null;

    try {
      if (svgEl) {
        const paths = Array.from(
          svgEl.querySelectorAll("path")
        ) as SVGPathElement[];
        const pathEl = paths.find(
          (p) => p.getAttribute("d") && p.getAttribute("d")!.trim().length > 10
        );
        if (pathEl) {
          const pts = pathToPolygon(pathEl, 3);
          const [cx, cy] = polygonCentroid(pts as any);

          const polyScale = scale * 0.8; // Slightly tighter containment
          const tx = -cx * polyScale + CENTER_X;
          const ty = -cy * polyScale + CENTER_Y;
          polygon = pts.map(([x, y]) => [
            x * polyScale + tx,
            y * polyScale + ty,
          ]);

          const forceShapeContainment = (alpha: number) => {
            if (!polygon) return;
            nodes.forEach((node) => {
              if (!polygonContains(polygon as any, [node.x, node.y])) {
                const [px, py] = polygonCentroid(polygon as any);
                node.x += (px - node.x) * alpha * 0.4;
                node.y += (py - node.y) * alpha * 0.4;
                node.x += (node.targetX! - node.x) * alpha * 0.1;
                node.y += (node.targetY! - node.y) * alpha * 0.1;
              }
            });
          };

          simulation.force("containment", forceShapeContainment as any);
        }
      }
    } catch (e) {
      console.warn("Could not create polygon containment", e);
    }

    simulation.stop();

    for (let i = 0; i < 120; i++) {
      simulation.tick();
    }

    nodes.forEach((node) => {
      positions[node.id].x.set(node.x);
      positions[node.id].y.set(node.y);
    });

    (containerRef.current as any).__simulation = simulation;

    return () => {
      simulation.stop();
    };
  }, [positions, scale]); // Re-run when scale changes

  // Drag handlers removed

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-visible",
        className
      )}
      style={{
        transform: "translateZ(0) scale(1)",
        transformOrigin: "center center",
      }}
    >
      {/* Background Decorative SVG for Brain Shape Containment */}
      <svg
        id="eFs69VwC5ck1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 300 300"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        className="absolute max-w-none opacity-0 pointer-events-none"
        style={{
          width: "1000px",
          height: "1000px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <path
          d="M92.4466,158.59289c-10.57235,0-23.37585,2.66875-33.4468-1.35963-14.59217-5.83687-25.3364-28.69193-17.40321-43.2361c5.49842-10.08043,14.19438-16.01631,22.56979-22.29787c7.0864-5.3148,7.438735-13.307333,15.964935-18.423053c6.46625-3.87975,23.721925-2.448447,29.990415-5.234437c23.51382-10.45058,30.43951-12.31519,54.65697-5.71043c7.63907,2.08338,18.31928.501,25.01712,5.71043c3.00741,2.33909,6.38445,8.430948,9.51738,10.310708c4.88749,2.9325,9.55501,2.246242,13.32433,7.092512c2.34617,3.0165,4.28835,13.63771,6.52621,15.46869c6.55855,5.36609,11.56941,3.65753,14.14011,13.08345c1.18386,4.34084-.89316,13.40258.27192,15.49974c3.57408,6.43334,6.683512,4.41089,7.868142,16.2572.88526,8.85261-2.805572,11.70347-3.245412,16.1019-.55452,5.54522-3.962324,8.753438-10.009294,12.381618-2.96507,1.77904-13.947476,5.864712-15.551676,7.468922-8.22022,8.22022,5.16793,4.31119-13.32433,11.7081-5.98571,2.39429-3.51594,5.26384-9.51738,4.06356-.44441-.08888-9.44114,3.78874-9.78931,4.07888-2.84329,2.36941,6.45936,17.45335,2.1754,20.66631-13.73537,10.30153-32.62569-13.53938-37.7976-24.74519-.8991-1.94805-4.21267-13.13355-6.52621-13.59626-9.95966-1.99194-15.94398,6.40088-27.73637-2.1754-4.87527-3.54565-9.95011-8.15188-12.23663-13.86818-.54541-1.36353-1.60167-5.97239-3.2631-6.52621-4.83879-1.61293,6.73016.84297-2.1754-2.71926"
          fill="none"
          stroke="#3f5787"
          strokeWidth="0.6"
        />
      </svg>

      {/* --- CONNECTIONS LAYER --- */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ overflow: "visible" }}
      >
        <g style={{ transform: "translate(50%, 50%)" }}>
          {initialIntegrations.flatMap((a) =>
            a.connections.map((cid) => {
              const b = initialIntegrations.find((s) => s.id === cid);
              if (!b) return null;

              return (
                <SkillConnection
                  key={`${a.id}-${b.id}`}
                  x1={positions[a.id].x}
                  y1={positions[a.id].y}
                  x2={positions[b.id].x}
                  y2={positions[b.id].y}
                  isRelated={false}
                />
              );
            })
          )}
        </g>
      </svg>

      {/* --- NODES LAYER --- */}
      {initialIntegrations.map((skill) => {
        const isDragging = false;
        const isOther = false;

        return (
          <motion.div
            key={skill.id}
            style={{
              x: positions[skill.id].x,
              y: positions[skill.id].y,
              position: "absolute",
              left: "50%",
              top: "50%",
            }}
            whileHover={{ scale: 1.1, zIndex: 50 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "w-12 h-12 rounded-full border border-neutral-200 bg-white shadow-md flex items-center justify-center z-20 transition-colors group -ml-6 -mt-6 text-black",
              skill.id === "openai" ? "bg-black border-black text-white" : ""
            )}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {skill.icon}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
