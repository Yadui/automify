"use client";
import Workflowform from "@/components/forms/workflow-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useBilling } from "@/providers/billing-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import React from "react";

type Props = {
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  className?: string; // Accept className for CustomButton styling
};

export default function WorkflowButton({
  size = "icon",
  children,
  className,
}: Props) {
  const { credits } = useBilling();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} disabled={credits === "0"} className={className}>
          {children ? children : <Plus />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
          <DialogDescription>
            Workflows allow you to automate tasks.
          </DialogDescription>
        </DialogHeader>
        <Workflowform onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
