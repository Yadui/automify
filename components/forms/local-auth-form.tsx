"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
import Link from "next/link";

export const LocalAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(isLogin ? "Welcome back!" : "Account created!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tight text-white leading-none uppercase">
          {isLogin ? "Fallback Login" : "Create Account"}
        </h2>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] leading-relaxed">
          {isLogin
            ? "Authorized Personnel Only"
            : "Initialize local database record"}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/api/auth/github/start" className="w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] h-14 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-3 text-neutral-400 hover:text-white uppercase tracking-widest group"
            disabled={loading}
          >
            <Github className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
            Continue with GitHub
          </Button>
        </Link>

        <div className="relative flex items-center gap-4 my-2">
          <div className="h-[1px] w-full bg-white/5" />
          <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] whitespace-nowrap">
            OR USE PROTOCOL
          </span>
          <div className="h-[1px] w-full bg-white/5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">
              Identifier
            </label>
            <Input
              placeholder="YOUR NAME"
              className="bg-neutral-900/30 border-neutral-800/80 focus:border-[#E2CBFF]/30 transition-all h-13 rounded-2xl text-xs font-bold tracking-wider placeholder:text-neutral-700 uppercase"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">
            Credentials / Email
          </label>
          <Input
            type="email"
            placeholder="ACCESS@DOMAIN.COM"
            className="bg-neutral-900/30 border-neutral-800/80 focus:border-[#E2CBFF]/30 transition-all h-13 rounded-2xl text-xs font-bold tracking-wider placeholder:text-neutral-700 uppercase"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">
            Access Protocol / Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            className="bg-neutral-900/30 border-neutral-800/80 focus:border-[#E2CBFF]/30 transition-all h-13 rounded-2xl text-xs font-bold tracking-wider placeholder:text-neutral-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="bg-[#E2CBFF] text-black hover:bg-white h-14 rounded-2xl font-black text-xs shadow-lg shadow-[#E2CBFF]/5 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 uppercase tracking-widest"
          disabled={loading}
        >
          {loading
            ? "PROCESSING..."
            : isLogin
            ? "EXECUTE LOGIN"
            : "INITIALIZE ACCOUNT"}
        </Button>
      </form>

      <div className="flex justify-center border-t border-neutral-800/50 pt-8 pb-2">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[9px] font-black text-neutral-600 hover:text-white transition-all uppercase tracking-[0.2em]"
        >
          {isLogin
            ? "Request new access credentials"
            : "Return to login protocol"}
        </button>
      </div>
    </div>
  );
};
