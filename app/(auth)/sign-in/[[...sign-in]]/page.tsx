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
      <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-auto font-sans px-6">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <motion.div
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            variants={containerVariants}
            style={{ transformOrigin: "center" }}
            className="relative w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          >
            <motion.div variants={contentVariants} className="p-8 w-full">
              <div className="flex flex-col items-center gap-8">
                {/* Header */}
                <motion.div
                  custom={0}
                  variants={itemVariants}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">
                    {/* Title handled by form state or consistent title */}
                    Welcome to Automify
                  </h1>
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
        </div>
      </div>
    </>
  );
}
