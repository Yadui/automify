"use client";
import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import Image from "next/image";

export function LazyImage({
    src,
    alt,
    className,
    sizes,
    width,
    height,
    fill = true // Default to fill, but allow override if width/height provided without fill
}: {
    src: string;
    alt: string;
    className?: string;
    sizes?: string;
    width?: number;
    height?: number;
    fill?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, {
        margin: "300px",
        once: true,
    });

    return (
        <div ref={ref} className={`relative overflow-hidden ${fill ? "h-full w-full" : ""}`}>
            {inView && (
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className={fill ? "h-full w-full" : ""}
                >
                    <Image
                        src={src}
                        alt={alt}
                        fill={fill}
                        width={!fill ? width : undefined}
                        height={!fill ? height : undefined}
                        sizes={sizes}
                        loading="lazy"
                        decoding="async"
                        className={className}
                    />
                </motion.div>
            )}
        </div>
    );
}
