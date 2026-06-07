// Automify Navbar Component
import Link from "next/link";
import React from "react";
import { MenuIcon, CirclePlus } from "lucide-react";
import { getAppUser } from "@/lib/app-auth";
import AuthAccountButton from "@/components/global/auth-account-button";

const Navbar = async () => {
  const user = await getAppUser();
  return (
    <header className="fixed right-0 left-0 top-0 z-[100] bg-white/90 px-4 py-3 backdrop-blur-xl shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
      <aside className="flex items-center gap-1 text-[#171717]">
        <p className="text-2xl font-semibold tracking-[-0.96px]">Aut</p>
        <CirclePlus className="h-5 w-5" strokeWidth={2} />
        <p className="text-2xl font-semibold tracking-[-0.96px]">mify</p>
      </aside>
      <nav className="hidden md:block">
        <ul className="flex items-center gap-8 list-none text-sm font-medium text-[#171717]">
          <li>
            <Link href="/docs" className="transition-colors hover:text-[#0072f5]">Docs</Link>
          </li>
          <li>
            <Link href="#workflow" className="transition-colors hover:text-[#0072f5]">Workflow</Link>
          </li>
          <li>
            <Link href="#pricing" className="transition-colors hover:text-[#0072f5]">Pricing</Link>
          </li>
        </ul>
      </nav>
      <aside className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#171717] px-4 text-sm font-medium text-white shadow-[rgba(0,0,0,0.08)_0px_0px_0px_1px] transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsla(212,100%,48%,1)]"
        >
          {user ? "Dashboard" : "Get Started"}
        </Link>
        {user && <AuthAccountButton source={user.source} email={user.email} name={user.name} compact />}
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[rgb(235,235,235)_0px_0px_0px_1px] md:hidden" aria-label="Open menu">
          <MenuIcon className="h-4 w-4" />
        </button>
      </aside>
      </div>
    </header>
  );
};

export default Navbar;
