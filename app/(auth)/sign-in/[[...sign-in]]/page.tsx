"use client";
import { LocalAuthForm } from "@/components/forms/local-auth-form";
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // BackOut easing for the premium "overshoot" effect
  const backOutEase = [0.175, 0.885, 0.32, 1.2];

  const containerVariants = {
    hidden: {
      scaleY: 0,
      opacity: 0,
    },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: backOutEase,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.6, // Wait for expansion to mostly finish
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8 + i * 0.1, // Start after content starts fading in
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <>
      <style jsx global>{`
        html,
        body {
          background-color: #030303 !important;
          color-scheme: dark;
        }
      `}</style>

      <div className="fixed inset-0 z-[9999] bg-[#030303] flex items-center justify-center overflow-auto font-sans selection:bg-[#E2CBFF]/30 px-6">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <motion.div
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            variants={containerVariants}
            style={{ transformOrigin: "center" }}
            className="relative w-full bg-white/[0.05] backdrop-blur-3xl border border-white/[0.1] rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
          >
            <motion.div variants={contentVariants} className="p-8 w-full">
              <div className="flex flex-col items-center gap-10">
                {/* Header */}
                <motion.div
                  custom={0}
                  variants={itemVariants}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] shadow-2xl transition-all hover:border-white/[0.3]">
                    <Sparkles className="w-8 h-8 text-[#E2CBFF]" />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl font-black text-white tracking-widest uppercase">
                      Automify
                    </h1>
                  </div>
                </motion.div>

                {/* Auth Form Area */}
                <motion.div
                  custom={1}
                  variants={itemVariants}
                  className="w-full"
                >
                  <LocalAuthForm />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Global Footer */}
          <motion.div
            custom={2}
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            variants={itemVariants}
            className="flex items-center justify-center gap-8 pt-8"
          >
            <span className="text-[8px] font-black text-neutral-800 uppercase tracking-[0.3em] cursor-default hover:text-neutral-600 transition-colors">
              Security Audit
            </span>
            <div className="w-1 h-1 rounded-full bg-neutral-900" />
            <span className="text-[8px] font-black text-neutral-800 uppercase tracking-[0.3em] cursor-default hover:text-neutral-600 transition-colors">
              Version 3.0.0
            </span>
          </motion.div>
        </div>
      </div>
    </>
  );
}
