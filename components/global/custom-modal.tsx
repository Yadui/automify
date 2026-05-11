import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/providers/modal-provider";

import React from "react";
import { Button } from "../ui/button";

type Props = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CustomModal = ({ children, subheading, title }: Props) => {
  const { isOpen, setClose } = useModal();
  const handleClose = () => setClose();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-[560px] overflow-hidden rounded-md bg-white p-0">
        <DialogHeader className="px-6 pt-6 text-center sm:text-center">
          <DialogTitle className="text-2xl font-semibold tracking-[-0.96px] text-[#171717]">{title}</DialogTitle>
          <DialogDescription className="text-[#4d4d4d]">{subheading}</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col items-center gap-4 overflow-y-auto px-6 py-4">
          {children}
        </div>
        <DialogFooter className="border-t border-[#ebebeb] bg-white p-4 sm:justify-center sm:space-x-0">
          <DialogClose asChild>
            <Button variant="ghost" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
