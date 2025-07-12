import { HeroParallax } from "@/components/global/connect-parallax";
import { ContainerScroll } from "@/components/global/container-scroll-animation";
import Navbar from "@/components/global/navbar";
import { Button } from "@/components/ui/button";
import { clients, products } from "@/lib/constant";
import { Footer } from "@/components/global/footer";
import Pricing from "@/components/global/pricing";
import { BentoDemo } from "@/components/global/bento-grid";

export default function Home() {
  //WIP: remove fault IMAge for home page
  return (
    <main className="flex items-center justify-center flex-col pt-20">
      <Navbar />
      <section className="h-screen w-full bg-neutral-950 rounded-md !overflow-visible relative flex flex-col items-center antialiased">
        <div className="absolute inset-0 h-full w-full items-center px-5 [background:radial-gradient(125%_125%_at_50%_10%,#223_15%,#000_100%)]"></div>
        <div className="flex flex-col mt-[-100px] md:mt-[-50px] px-4 sm:px-8 md:px-16 lg:px-24">
          <ContainerScroll
            titleComponent={
              <div className="flex items-center flex-col text-center px-4">
                <Button
                  size={"lg"}
                  className="p-8 mb-8 md:mb-0 text-2xl w-full sm:w-fit border-t-2 rounded-full border-[#4D4D4D] bg-[#1F1F1F] hover:bg-white group transition-all flex items-center justify-center gap-4 hover:shadow-xl hover:shadow-neutral-500 duration-500"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-500 to-neutral-600 md:text-center font-sans group-hover:bg-gradient-to-r group-hover:from-black group-hover:to-black cursor-none">
                    Start For Free Today
                  </span>
                </Button>
                <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl xl:text-8xl pb-24 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-600 font-sans font-bold">
                  Automate Your Work With Automify
                </h1>
              </div>
            }
          />
        </div>
      </section>
      {/* <InfiniteMovingCards
        className="md:mt-[18rem] mt-[-50px]"
        items={clients}
        direction="right"
        speed="slow"
      /> */}
      <section>
        <HeroParallax products={products}></HeroParallax>
      </section>
      <section>
        <BentoDemo />
      </section>
      <section className="">
        <Pricing />
      </section>
      <Footer />
    </main>
  );
}
