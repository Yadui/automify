"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { LazyImage } from "./lazy-image";

export const ContainerScroll = ({
  titleComponent,
}: {
  titleComponent: string | React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"], // Smooth transition control
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // Initial check

    let timeoutId: NodeJS.Timeout;
    const debouncedCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener("resize", debouncedCheckMobile);
    return () => {
      window.removeEventListener("resize", debouncedCheckMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Increased scale effect for both mobile and desktop
  const scaleRange = useMemo(
    () => (isMobile ? [0.8, 1.2] : [1, 1.9]),
    [isMobile]
  );

  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]); // Starts tilted back
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const translateY = useTransform(scrollYProgress, [0, 1], [50, -900]); // Moves more dramatically

  return (
    <div
      className="h-[150vh] flex items-center justify-center relative p-2 md:p-20 w-full"
      ref={containerRef}
    // style={{ overflow: "hidden" }}
    >
      <div className="pt-10 md:pt-40 w-full relative" style={{ perspective: "1000px" }}>
        <Header translateY={translateY} titleComponent={titleComponent} />
        <Card rotateX={rotateX} translateY={translateY} scale={scale} />
      </div>
    </div>
  );
};

export const Header = ({ translateY, titleComponent }: any) => {
  return (
    <motion.div
      style={{ translateY, willChange: "transform" }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotateX,
  scale,
  translateY,
}: {
  rotateX: any;
  scale: any;
  translateY: any;
}) => {
  return (
    <motion.div
      style={{
        rotateX,
        scale,
        translateY,
        willChange: "transform, opacity",
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-10 md:mt-10 lg:mt-10 mx-auto h-[30rem] md:h-[40rem] w-full p-6 bg-[#222222] rounded-[30px] shadow-2xl opacity-100 sm:opacity-100 sm:pointer-events-auto pointer-events-none"
    >
      <div className="bg-gray-100 h-full w-full rounded-2xl gap-4 overflow-hidden p-4 transition-all">
        <LazyImage
          src="/temp-banner.png"
          alt="bannerImage"
          fill
          className="object-fill border-8 rounded-2xl"
        />
      </div>
    </motion.div>
  );
};
