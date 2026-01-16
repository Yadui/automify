"use client"

import React, { type HTMLAttributes, useEffect, useRef } from "react"
import { cn } from "../../lib/utils"
import { type MotionValue } from "framer-motion"

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
    perspective?: number
    gridColor?: string
    scrollProgress?: MotionValue<number>
}

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
    children,
    perspective = 100,
    gridColor = "rgba(255, 255, 255, 0.2)",
    className,
    scrollProgress,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        // Tunnel Configuration
        const focusLength = 300;
        const tunnelWidth = 1500;
        const tunnelHeight = 500;
        const speed = 2;
        let autoZOffset = 0;
        let frozenOffset = 0;
        let hasStartedScrolling = false;

        // Geometry
        const numSections = 30;
        const segmentDepth = 150;
        const totalTunnelDepth = numSections * segmentDepth;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        const draw = () => {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            const scrollVal = scrollProgress ? scrollProgress.get() : 0;

            // Scroll drives the camera forward - larger multiplier = faster zoom
            const scrollZ = scrollVal * 12000;

            // Tunnel animation logic
            if (scrollVal < 0.001) {
                // At absolute top - animate
                autoZOffset -= speed;
                // Keep wrapping for seamless loop
                if (autoZOffset <= -segmentDepth) {
                    autoZOffset += segmentDepth;
                }
                hasStartedScrolling = false;
            } else {
                // Scrolling - freeze tunnel position
                if (!hasStartedScrolling) {
                    frozenOffset = autoZOffset;
                    hasStartedScrolling = true;
                }
                autoZOffset = frozenOffset;
            }

            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 3;

            const halfW = tunnelWidth / 2;
            const halfH = tunnelHeight / 2;

            // Helper to project 3D point to 2D
            const project = (x3d: number, y3d: number, z3d: number) => {
                if (z3d < 1) return null; // Behind camera
                const scale = focusLength / z3d;
                return { x: cx + x3d * scale, y: cy + y3d * scale };
            };

            // Draw tunnel rings (rectangular cross-sections)
            for (let i = 0; i <= numSections; i++) {
                // Base position of this ring
                const ringBaseZ = i * segmentDepth;
                // Apply auto offset and scroll zoom
                const z = ringBaseZ + autoZOffset - scrollZ;

                if (z < 10 || z > totalTunnelDepth) continue;

                const scale = focusLength / z;
                const x = halfW * scale;
                const y = halfH * scale;

                const px1 = cx - x;
                const py1 = cy - y;
                const px2 = cx + x;
                const py2 = cy + y;

                ctx.beginPath();
                ctx.rect(px1, py1, px2 - px1, py2 - py1);
                ctx.stroke();
            }

            // Draw longitudinal lines connecting from far to near
            const divisions = 4;
            const farZ = Math.max(10, totalTunnelDepth + autoZOffset - scrollZ);
            const nearZ = 10;

            const stepX = tunnelWidth / divisions;
            const stepY = tunnelHeight / divisions;

            // Top/Bottom longitudinals
            for (let i = 0; i <= divisions; i++) {
                const xVal = -halfW + i * stepX;

                const pFarTop = project(xVal, -halfH, farZ);
                const pNearTop = project(xVal, -halfH, nearZ);
                if (pFarTop && pNearTop) {
                    ctx.beginPath();
                    ctx.moveTo(pFarTop.x, pFarTop.y);
                    ctx.lineTo(pNearTop.x, pNearTop.y);
                    ctx.stroke();
                }

                const pFarBottom = project(xVal, halfH, farZ);
                const pNearBottom = project(xVal, halfH, nearZ);
                if (pFarBottom && pNearBottom) {
                    ctx.beginPath();
                    ctx.moveTo(pFarBottom.x, pFarBottom.y);
                    ctx.lineTo(pNearBottom.x, pNearBottom.y);
                    ctx.stroke();
                }
            }

            // Left/Right longitudinals
            for (let i = 0; i <= divisions; i++) {
                const yVal = -halfH + i * stepY;

                const pFarLeft = project(-halfW, yVal, farZ);
                const pNearLeft = project(-halfW, yVal, nearZ);
                if (pFarLeft && pNearLeft) {
                    ctx.beginPath();
                    ctx.moveTo(pFarLeft.x, pFarLeft.y);
                    ctx.lineTo(pNearLeft.x, pNearLeft.y);
                    ctx.stroke();
                }

                const pFarRight = project(halfW, yVal, farZ);
                const pNearRight = project(halfW, yVal, nearZ);
                if (pFarRight && pNearRight) {
                    ctx.beginPath();
                    ctx.moveTo(pFarRight.x, pFarRight.y);
                    ctx.lineTo(pNearRight.x, pNearRight.y);
                    ctx.stroke();
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gridColor]);

    return (
        <div className={cn("relative w-full h-full", className)} {...props}>
            <canvas
                ref={canvasRef}
                className="pointer-events-none absolute top-0 left-0 size-full"
            />
            <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,black_100%] pointer-events-none" />
            <div className="relative z-10 flex h-full w-full items-center justify-center">{children}</div>
        </div>
    )
}
