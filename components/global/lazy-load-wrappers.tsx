"use client";
import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import dynamic from "next/dynamic";

export const LazyLoadSection = ({
    children,
    className,
    minHeight = "10px"
}: {
    children: React.ReactNode;
    className?: string;
    minHeight?: string;
}) => {
    const ref = useRef(null);
    // Load when within 200px of viewport
    const inView = useInView(ref, { once: true, margin: "200px" });

    return (
        <div ref={ref} className={className} style={{ minHeight }}>
            {inView ? (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            ) : null}
        </div>
    );
};

export const LazyBentoDemo = dynamic(
    () => import("@/components/global/bento-grid").then((mod) => mod.BentoDemo),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-[800px] w-full animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-3xl" />
        ),
    }
);

export const LazyHeroParallax = dynamic(
    () => import("@/components/global/hero-signal-spine").then((mod) => mod.HeroSignalSpine),
    {
        ssr: false,
        loading: () => <div className="h-screen w-full bg-neutral-100 dark:bg-neutral-900 animate-pulse" />,
    }
);

export const LazyContainerScroll = dynamic(
    () => import("@/components/global/container-scroll-animation").then((mod) => mod.ContainerScroll),
    {
        ssr: false,
        loading: () => <div className="h-[800px] w-full bg-neutral-100 dark:bg-neutral-900 animate-pulse" />,
    }
);
