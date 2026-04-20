import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import c1 from '../assets/images/craft1.webp'
import c2 from '../assets/images/craft2.webp'
import c21 from '../assets/images/craft21.webp'
import c22 from '../assets/images/craft22.webp'
import c3 from '../assets/images/craft3.webp'
import c4 from '../assets/images/craft4.webp'
import c5 from '../assets/images/craft5.webp'

// Helper component for animated images in the scroll section (Swaps as user scrolls)
const StepImage = ({ step, index, totalSteps, scrollYProgress }) => {
  const stepStart = index / totalSteps;
  const stepEnd = (index + 1) / totalSteps;
  
  // Create smooth fade triggers
  let opacityRange = [stepStart, stepStart + 0.05, stepEnd - 0.05, stepEnd];
  let opacityValues = [0, 1, 1, 0];

  // Specific logic for the first and last steps to stay visible
  if (index === 0) {
    opacityRange = [0, 0.01, stepEnd - 0.05, stepEnd];
    opacityValues = [1, 1, 1, 0];
  }
  if (index === totalSteps - 1) {
    opacityRange[2] = 0.99;
    opacityRange[3] = 1;
    opacityValues[3] = 1;
  }

  const opacity = useTransform(scrollYProgress, opacityRange, opacityValues);
  const scale = useTransform(scrollYProgress, [stepStart, stepEnd], [1.05, 1]);

  return (
    <motion.img
      src={step.image}
      alt={step.subtitle}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity, scale }}
    />
  );
};

// Helper component for stacking text blocks
const StepContent = ({ step, index, totalSteps, scrollYProgress }) => {
  const stepStart = index / totalSteps;
  
  // Fix: Ensure range has a minimum difference [start, start + 0.01] to avoid math errors
  const start = index === 0 ? 0 : stepStart;
  const end = index === 0 ? 0.05 : stepStart + 0.05;

  // Stacking logic: Items fade in and then persist
  const opacity = useTransform(scrollYProgress, [start, end], [index === 0 ? 1 : 0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [index === 0 ? 0 : 40, 0]);

  return (
    <motion.div
      className="flex flex-col mb-12 last:mb-0"
      style={{ opacity, y }}
    >
      <h4 className="text-xl md:text-3xl font-bold text-primary mb-3">
        {step.subtitle}
      </h4>
      <p className="text-sm md:text-lg text-gray-500 font-medium leading-relaxed max-w-sm">
        {step.description}
      </p>
    </motion.div>
  );
};

const CraftsmanshipSection = ({ sectionTitle, steps, imageLeft = true }) => {
  const containerRef = useRef(null);
  
  // Use window scroll by default (best for SEO and performance)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate snap behavior through CSS classes on sections
  return (
    <div ref={containerRef} className="relative h-[400vh]">
      {/* Invisible snap markers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(steps.length)].map((_, i) => (
          <div key={i} className="h-screen w-full snap-start" />
        ))}
      </div>

      {/* Sticky viewport content */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden bg-white z-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full pt-16 md:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            
            {/* Image section */}
            <div className={`relative aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden rounded-sm shadow-2xl z-20 ${imageLeft ? 'order-1' : 'md:order-2 order-1'}`}>
              {steps.map((step, index) => (
                <StepImage 
                  key={index} 
                  step={step} 
                  index={index} 
                  totalSteps={steps.length} 
                  scrollYProgress={scrollYProgress} 
                />
              ))}
            </div>

            {/* Content section */}
            <div className={`flex flex-col z-20 ${imageLeft ? 'order-2' : 'md:order-1 order-2'}`}>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-200 uppercase tracking-tighter mb-10 leading-none">
                    THE ART OF<br/>{sectionTitle}.
                </h2>
                
                <div className="flex flex-col relative">
                    {steps.map((step, index) => (
                    <StepContent 
                        key={index} 
                        step={step} 
                        index={index} 
                        totalSteps={steps.length} 
                        scrollYProgress={scrollYProgress} 
                    />
                    ))}
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const Craftsmanship = () => {
  // Inject snap-scroll behavior into the main body for this page only
  useEffect(() => {
    document.body.style.scrollSnapType = 'y mandatory';
    document.documentElement.style.scrollSnapType = 'y mandatory';
    return () => {
      document.body.style.scrollSnapType = '';
      document.documentElement.style.scrollSnapType = '';
    };
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative md:px-28 h-screen snap-start flex flex-col justify-center">
        <div className="py-5 md:py-10 px-4">
          <h1 className="text-3xl md:text-5xl lg:text-7xl text-primary font-bold mb-6 tracking-tighter">
            The Anatomy <br/> of Luxury
          </h1>
          <p className="text-sm md:text-xl text-primary font-medium max-w-xl border-l-2 border-gold pl-6 mt-6">
            An inside look at the meticulous craftsmanship behind every EO creation. At EO, we believe in the slow, deliberate process of excellence.
          </p>
        </div>

        <div className="w-full mx-auto px-4 mt-12 bg-gray-50 p-4">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-sm shadow-lg">
            <img
              src={c1}
              alt="Artisan at work"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-white h-screen snap-start flex items-center justify-center">
        <div className="mx-auto px-4 md:px-8 text-center max-w-4xl">
            <h3 className="text-xs md:text-sm font-bold text-gold mb-6 uppercase tracking-[0.4em]">
              Heritage & Horizon
            </h3>
            <h2 className="text-3xl md:text-6xl font-bold text-primary mb-8 uppercase leading-tight select-none">
              The Artisan's <br className="hidden md:block"/> Way
            </h2>
            <p className="text-base md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto italic">
              "Discover the meticulous artistry, heritage techniques, and scientific precision that define our signature collections—from the first stitch to the final maceration."
            </p>
        </div>
      </section>

      {/* Tailoring */}
      <CraftsmanshipSection
        sectionTitle="Tailoring"
        imageLeft={true}
        steps={[
          {
            subtitle: "Fabric Curation",
            description: "We source only the finest natural fibers—Italian silks and Grade-A wool—ensuring a drape that feels like a second skin.",
            image: c2
          },
          {
            subtitle: "Precision Cutting",
            description: "Every pattern is hand-cut by master tailors. We respect the grain of the fabric to ensure the garment never loses its shape.",
            image: c21
          },
          {
            subtitle: "The Finishing Stitch",
            description: "Our signature 'Heritage Finish' involves hand-rolled hems and reinforced seams for longevity that lasts generations.",
            image: c22
          }
        ]}
      />

      {/* Leather */}
      <CraftsmanshipSection
        sectionTitle="Leather"
        imageLeft={false}
        steps={[
          {
            subtitle: "Selection",
            description: "We use only top-tier full-grain leathers that develop a beautiful patina over decades of use.",
            image: c3
          },
          {
            subtitle: "Saddle Stitching",
            description: "Traditional two-needle saddle stitching creates seams that are virtually indestructible and aesthetically superior.",
            image: c3
          },
          {
            subtitle: "Expert Finishing",
            description: "Every raw edge is repeatedly sanded and polished with natural beeswax for a glass-like finish.",
            image: c3
          }
        ]}
      />

      {/* Bottom CTA */}
      <section className="bg-primary text-white h-screen snap-start flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="text-4xl md:text-7xl font-bold mb-10 tracking-tighter uppercase">
            Experience <br/> The Difference
          </h2>
          <p className="text-sm md:text-xl text-gray-300 font-light mb-12 max-w-xl mx-auto tracking-wide">
            Discover pieces that transcend trends and celebrate the timeless soul of artisan creation.
          </p>
          <button className="bg-white text-primary px-12 py-5 text-sm md:text-base font-bold tracking-widest hover:bg-gold hover:text-white transition-all duration-500 uppercase rounded-full">
            EXPLORE THE CRAFT
          </button>
        </div>
      </section>
    </div>
  );
};

export default Craftsmanship;
