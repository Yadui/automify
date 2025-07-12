import { HardDrive, Search, Settings } from "lucide-react";
import { OrbitingCircles } from "../magicui/orbiting-circles";

export default function BentoGrid() {
  return (
    <div className="h-screen  flex items-center justify-center bg-white">
      <div className="grid grid-cols-2 grid-rows-2 gap-0 w-[600px] h-[600px] border-2 border-white rounded-2xl overflow-hidden">
        <OrbitingCircles>
          <HardDrive />
        </OrbitingCircles>
        <OrbitingCircles radius={100} reverse>
          <Settings />
          <Search />
        </OrbitingCircles>
      </div>
    </div>
  );
}
