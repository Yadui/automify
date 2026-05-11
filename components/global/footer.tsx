import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 w-full bg-white shadow-[rgba(0,0,0,0.08)_0px_-1px_0px_0px]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-4 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <h4 className="text-2xl font-semibold tracking-[-0.96px] text-[#171717]">Automify</h4>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#4d4d4d]">
            A clean control surface for app connections, workflow composition, and automation billing.
          </p>
        </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#171717]">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#product"
                  className="text-[#666666] transition-colors hover:text-[#171717]"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-[#666666] transition-colors hover:text-[#171717]"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#workflow"
                  className="text-[#666666] transition-colors hover:text-[#171717]"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#171717]">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-[#666666] transition-colors hover:text-[#171717]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#666666] transition-colors hover:text-[#171717]"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-[#666666] transition-colors hover:text-[#171717]"
                >
                  Home Page
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#171717]">Follow</h4>
            <div className="flex space-x-3">
              <Link
                href="https://github.com/Yadui/automify"
                className="flex h-10 w-10 items-center justify-center rounded-md text-[#666666] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:text-[#171717]"
              >
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-md text-[#666666] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:text-[#171717]"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-md text-[#666666] shadow-[rgb(235,235,235)_0px_0px_0px_1px] transition-colors hover:text-[#171717]"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
      </div>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-6 text-xs text-[#808080] shadow-[rgb(235,235,235)_0px_-1px_0px_0px] sm:px-8">
        <span>© 2026 Automify</span>
        <span>Built with Geist and quiet infrastructure.</span>
      </div>
    </footer>
  );
}
