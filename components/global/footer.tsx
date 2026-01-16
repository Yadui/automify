import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";
import { CanvasRevealEffectDemo2 } from "./glitter-canvas";

export function Footer() {
  return (
    <footer className="dark:bg-black border-t border-neutral-900 pt-8 mt-16 relative overflow-hidden w-full">
      <section className="pt-5 h-full w-full">
        <CanvasRevealEffectDemo2 />
      </section>
    </footer>
  );
}
