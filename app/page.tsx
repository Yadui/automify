import dynamic from "next/dynamic";
import Navbar from "@/components/global/navbar";
import { products } from "@/lib/constant";
import { LazyBentoDemo, LazyContainerScroll, LazyHeroParallax, LazyLoadSection } from "@/components/global/lazy-load-wrappers";
import { Button } from "@/components/ui/button";


const Pricing = dynamic(() => import("@/components/global/pricing"), {
  ssr: true,
});
const Footer = dynamic(() => import("@/components/global/footer").then((mod) => mod.Footer), {
  ssr: true,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Navbar />
      <section className="min-h-screen w-full bg-neutral-950 rounded-md !overflow-visible relative flex flex-col items-center justify-center antialiased pt-36   md:pt-20">
        <LazyLoadSection className="w-full h-full relative flex flex-col items-center justify-center" minHeight="100vh">
          <div className="absolute inset-0 h-full w-full items-center px-5 [background:radial-gradient(125%_125%_at_50%_10%,#223_15%,#000_100%)]"></div>
          <div className="flex flex-col mt-60 md:mt-20 px-4 sm:px-8 md:px-16 lg:px-24 w-full">
            <LazyContainerScroll
              titleComponent={
                <div className="flex items-center flex-col text-center px-4 relative z-10">
                  <Button
                    size={"lg"}
                    className="p-8 mb-8 text-2xl w-full sm:w-fit border-t-2 rounded-full border-[#4D4D4D] bg-[#1F1F1F] hover:bg-white group transition-all flex items-center justify-center gap-4 hover:shadow-xl hover:shadow-neutral-500 duration-500"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 to-neutral-600 md:text-center font-sans group-hover:bg-gradient-to-r group-hover:from-black group-hover:to-black cursor-none">
                      Start For Free Today
                    </span>
                  </Button>
                  <h1 className="text-5xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-600 font-sans font-bold">
                    Automate Your Work With <br />
                    <span className="text-7xl md:text-[6rem] lg:text-[8rem] font-bold mt-1 leading-none block">
                      Automify
                    </span>
                  </h1>
                </div>
              }
            />
          </div>
        </LazyLoadSection>
      </section>
      <div className="border-b-8 border-white "></div>
      <section className="relative w-full  mb-40 h-[800px] overflow-visible">
        <LazyHeroParallax products={products} />
      </section>
      <section className="mt-20 mb-40 w-full">
        <LazyLoadSection className="w-full" minHeight="800px">
          <LazyBentoDemo />
        </LazyLoadSection>
      </section>
      <section className="mt-20 mb-20 w-full">
        <LazyLoadSection className="w-full" minHeight="500px">
          <Pricing />
        </LazyLoadSection>
      </section>
      <LazyLoadSection className="w-full" minHeight="200px">
        <Footer />
      </LazyLoadSection>
    </main>
  );
}
