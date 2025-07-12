import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";
import { CanvasRevealEffectDemo2 } from "./glitter-canvas";

export function Footer() {
  return (
    <footer className="dark:bg-black border-t border-neutral-900 pt-8 mt-16 relative overflow-hidden w-full">
      <div className="w-full px-4 relative z-10 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="space-y-4 flex flex-col items-center">
            <h4 className="text-neutral-300 font-semibold">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href=""
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-neutral-300 font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  API Reference
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-neutral-300 font-semibold">Follow Us</h4>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/Yadui/automify"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <Github />
              </Link>
              <Link
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <Twitter />
              </Link>
              <Link
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <Linkedin />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <section className="pt-5 h-full w-full">
        <CanvasRevealEffectDemo2 />
      </section>
    </footer>
  );
}
