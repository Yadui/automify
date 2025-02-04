import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="dark:bg-black border-t border-neutral-900 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-600">
              Automify
            </h3>
            <p className="text-neutral-500">
              Automating your workflow, one task at a time.
            </p>
          </div>
          <div className="space-y-4">
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
        <div className="border-t border-neutral-900 mt-8 pt-8 text-center text-neutral-500">
          © {new Date().getFullYear()} Automify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
