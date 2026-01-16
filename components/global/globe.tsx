// Simplified or corrected import/implementation if needed. 
// For now, let's try to ensure the Globe is properly contained.
import { Globe } from "@/components/magicui/globe";

export function GlobeDemo() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden rounded-lg">
      <Globe className="-top-72 -right-64 md:-right-20 scale-[1.5] md:scale-[1.2]" />
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  );
}
