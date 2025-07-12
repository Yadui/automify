import { FileTextIcon, GlobeIcon } from "@radix-ui/react-icons";
import { Layers, Share2Icon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import { OrbitingCirclesDemo } from "./orbiting-circles";
import { AnimatedBeamMultipleOutputDemo } from "./animated-beam";
import { GlobeDemo } from "./globe";

const files = [
  {
    name: "Setup connections",
    body: "Connect your favorite apps and services to your workflow.",
  },
  {
    name: "Create automations",
    body: "Join the apps at your will.",
  },
  {
    name: "Connect to your data",
    body: "Connect to your data and get the most out of your workflow.",
  },
];

const features = [
  {
    Icon: FileTextIcon,
    name: "Save your files",
    description: "Create and save .",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_5%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: GlobeIcon,
    name: "Globally, Yours.",
    description: "Make anything, anywhere, anytime.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: <GlobeDemo />,
  },
  {
    Icon: Share2Icon,
    name: "Integrations",
    description: "Supports 10+ integrations and counting.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute left-20 right-0 -bottom-10" />
    ),
  },
  {
    Icon: Layers,
    name: "Apps",
    description: "The apps you need to get the job done.",
    href: "#",
    cta: "Learn more",
    className: "col-span-2 lg:col-span-1",
    background: <OrbitingCirclesDemo />,
  },
];

export function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
