"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const WorkflowSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [value, setValue] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  const clearSearch = () => {
    setValue("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search workflows..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-9 bg-transparent border-neutral-800"
      />
      {value && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default WorkflowSearch;
