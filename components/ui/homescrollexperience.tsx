"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { MorphingText } from "../ui/MorphingText";
import { WarpBackground } from "../ui/WarpBackground";

// Scroll-driven counter component
function ScrollCounter({
    target,
    suffix = "",
    scrollProgress
}: {
    target: number;
    suffix?: string;
    scrollProgress: ReturnType<typeof useTransform<number, number>>;
}) {
    const [count, setCount] = useState(0);
    const [maxCount, setMaxCount] = useState(0);

    useEffect(() => {
        // Subscribe to scroll progress changes
        const unsubscribe = scrollProgress.on("change", (value) => {
            // Map scroll 0.45-0.75 to counter 0-target (even earlier)
            const normalized = Math.max(0, Math.min(1, (value - 0.45) / 0.3));
            const newCount = Math.floor(normalized * target);

            // Only count UP, never down (or allow both - user said either is fine)
            // Using max to ensure we never decrease
            setMaxCount(prev => Math.max(prev, newCount));
        });

        return () => unsubscribe();
    }, [scrollProgress, target]);

    return <div className="text-3xl font-bold text-white mb-1">{maxCount}{suffix}</div>;
}


export function HomeScrollExperience() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Scene 1: Hero (Fly-through)
    const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 30]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1, 0]);
    const heroPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.35 ? "none" : "auto"));

    // Scene 2: About Content - appears even earlier
    const aboutScale = useTransform(scrollYProgress, [0.3, 0.8], [0.3, 1]);
    const aboutOpacity = useTransform(scrollYProgress, [0.3, 0.55], [0, 1]);
    const aboutPointerEvents = useTransform(scrollYProgress, (v) => (v < 0.4 ? "none" : "auto"));

    // Staggered animations for About section elements
    // 1. Title (main text) - appears first, CENTERED and STATIC
    const titleOpacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
    const titleY = useTransform(scrollYProgress, [0.3, 0.4], [30, 0]);

    // 2. "Since 2009" slides in from right WHILE title is still centered
    const since2009Opacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
    const since2009X = useTransform(scrollYProgress, [0.4, 0.5], [100, 0]);

    // 3. AFTER Since 2009 arrives, the WHOLE title block moves left together
    // Title starts at 40% right (more centered in viewport), moves to 0% (grid position)
    const contentX = useTransform(scrollYProgress, [0.5, 0.65], ["40%", "0%"]);

    // 4. Stats section - slides up from below
    const statsOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
    const statsY = useTransform(scrollYProgress, [0.45, 0.6], [60, 0]);

    // 5. Value cards - slides in last
    const cardsOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
    const cardsX = useTransform(scrollYProgress, [0.55, 0.7], [100, 0]);

    // Tunnel Opacity - fades out earlier
    const tunnelOpacity = useTransform(scrollYProgress, [0.35, 0.6], [1, 0]);

    return (
        <div ref={containerRef} className="relative h-[150vh] bg-black">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Persistent Background */}
                <motion.div style={{ opacity: tunnelOpacity }} className="absolute inset-0 z-0">
                    <WarpBackground className="w-full h-full" scrollProgress={scrollYProgress} />
                </motion.div>

                {/* HERO SCENE */}
                <motion.div
                    style={{ scale: heroScale, opacity: heroOpacity, pointerEvents: heroPointerEvents }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-20"
                >
                    <div className="text-center px-6 max-w-6xl mx-auto">
                        <p className="uppercase text-base tracking-widest text-white/80 mb-6">
                            Your Trusted Technology Solutions Partner
                        </p>

                        <h1 className="text-6xl lg:text-8xl font-light mb-6 leading-tight text-white">
                            Empower Your Business with
                            <MorphingText
                                className="block mt-2 font-bold"
                                texts={["Cloud", "Security", "Collaboration"]}
                            />
                        </h1>

                        <p className="text-xl mb-10 max-w-3xl mx-auto mt-4 text-white/90">
                            From Microsoft 365 to advanced security with Sophos, and reliable
                            backup solutions — Foetron delivers end-to-end technology services
                            tailored for your business.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a
                                href="/contact-us"
                                className="inline-block px-12 py-5 text-lg bg-white text-black font-semibold rounded-full shadow hover:scale-105 transition"
                            >
                                Talk to an Expert
                            </a>
                            <a
                                href="/contact-us"
                                className="inline-block px-12 py-5 text-lg border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 hover:scale-105 transition"
                            >
                                Get Started Today
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* ABOUT SCENE */}
                <motion.div
                    style={{ scale: aboutScale, opacity: aboutOpacity, pointerEvents: aboutPointerEvents }}
                    className="absolute inset-0 flex items-center justify-center z-30"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-white">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Content Left */}
                            <motion.div style={{ x: contentX }}>
                                <motion.div
                                    style={{ opacity: statsOpacity, y: statsY }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F96E5B]/20 text-[#F96E5B] text-sm font-medium mb-6 backdrop-blur-sm border border-[#F96E5B]/20"
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F96E5B] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F96E5B]"></span>
                                    </span>
                                    About Foetron
                                </motion.div>

                                <motion.h2
                                    style={{ opacity: titleOpacity, y: titleY }}
                                    className="text-4xl sm:text-5xl font-bold mb-6 leading-tight text-white"
                                >
                                    Your Trusted Microsoft{" "}
                                    <span className="whitespace-nowrap">
                                        Cloud Partner{" "}
                                        <motion.span
                                            style={{ opacity: since2009Opacity, x: since2009X }}
                                            className="text-[#F96E5B] inline-block"
                                        >
                                            Since 2009
                                        </motion.span>
                                    </span>
                                </motion.h2>

                                {/* Description arrives WITH stats, not with title */}
                                <motion.p
                                    style={{ opacity: statsOpacity, y: statsY }}
                                    className="text-lg text-gray-300 mb-8 leading-relaxed"
                                >
                                    Foetron Consultancy Services is dedicated to helping businesses transform and thrive through innovative Microsoft cloud solutions.
                                </motion.p>

                                {/* Stats with counter animation */}
                                <motion.div
                                    style={{ opacity: statsOpacity, y: statsY }}
                                    className="grid grid-cols-2 gap-8 mb-10"
                                >
                                    <div>
                                        <ScrollCounter target={15} suffix="+" scrollProgress={scrollYProgress} />
                                        <div className="text-sm text-gray-400 font-medium">Years of Excellence</div>
                                    </div>
                                    <div>
                                        <ScrollCounter target={500} suffix="+" scrollProgress={scrollYProgress} />
                                        <div className="text-sm text-gray-400 font-medium">Clients Worldwide</div>
                                    </div>
                                    <div>
                                        <ScrollCounter target={1000} suffix="+" scrollProgress={scrollYProgress} />
                                        <div className="text-sm text-gray-400 font-medium">Projects Delivered</div>
                                    </div>
                                    <div>
                                        <ScrollCounter target={50} suffix="+" scrollProgress={scrollYProgress} />
                                        <div className="text-sm text-gray-400 font-medium">Expert Consultants</div>
                                    </div>
                                </motion.div>

                                <motion.a
                                    style={{ opacity: statsOpacity, y: statsY }}
                                    href="/about"
                                    className="group inline-flex items-center gap-2 text-[#F96E5B] font-bold text-lg hover:gap-4 transition-all"
                                >
                                    Learn more about our story
                                    <span>&rarr;</span>
                                </motion.a>
                            </motion.div>

                            {/* Right Side - Value Cards */}
                            <motion.div
                                style={{ opacity: cardsOpacity, x: cardsX }}
                                className="relative"
                            >
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F96E5B]/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative grid sm:grid-cols-2 gap-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#F96E5B]/50 hover:bg-white/10 transition-all backdrop-blur-sm"
                                    >
                                        <h3 className="text-xl font-bold text-white mb-3">Customer Focus</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            We put our clients' success at the center of everything we do.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#F96E5B]/50 hover:bg-white/10 transition-all backdrop-blur-sm"
                                    >
                                        <h3 className="text-xl font-bold text-white mb-3">Excellence</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            We strive for excellence in every project and interaction.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#F96E5B]/50 hover:bg-white/10 transition-all backdrop-blur-sm"
                                    >
                                        <h3 className="text-xl font-bold text-white mb-3">Integrity</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            We operate with honesty, transparency, and ethical standards.
                                        </p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#F96E5B]/50 hover:bg-white/10 transition-all backdrop-blur-sm"
                                    >
                                        <h3 className="text-xl font-bold text-white mb-3">Collaboration</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            We believe in the power of teamwork and partnership.
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

            </div >
        </div >
    );
}
