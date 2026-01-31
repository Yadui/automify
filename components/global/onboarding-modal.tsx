"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Link2,
  MousePointer2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    title: "Welcome to Automify",
    description:
      "Your hub for connected automations. Let's get you started with the basics.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Triggers",
    description:
      "Every automation starts with a Trigger. This is the event that kicks things off, like a new file in Google Drive.",
    icon: MousePointer2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Actions",
    description:
      "Actions are what happen after the trigger. Send an email, post to Slack, or create a Notion page automatically.",
    icon: Link2,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Infinite Possibilities",
    description:
      "Connect your favorite apps and build complex workflows with ease. Ready to create your first automation?",
    icon: CheckCircle2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export const OnboardingModal = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("automify_onboarding_seen");
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("automify_onboarding_seen", "true");
  };

  const Step = STEPS[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-background/80 backdrop-blur-xl">
        <div className="relative p-8 pt-12">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-1 pt-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-500 ${
                  i <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div
                className={`w-20 h-20 ${Step.bg} rounded-3xl flex items-center justify-center mb-6`}
              >
                <Step.icon className={`w-10 h-10 ${Step.color}`} />
              </div>

              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2">
                  {Step.title}
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                  {Step.description}
                </DialogDescription>
              </DialogHeader>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="min-w-[120px] font-semibold gap-2"
            >
              {currentStep === STEPS.length - 1 ? "Let's Go!" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
