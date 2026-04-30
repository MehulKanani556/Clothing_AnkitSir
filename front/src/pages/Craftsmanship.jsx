import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'; // AnimatePresence used for tab switching
import c1 from '../assets/images/craft1.webp'
import c2 from '../assets/images/craft2.webp'
import c21 from '../assets/images/craft21.webp'
import c22 from '../assets/images/craft22.webp'
import l1 from '../assets/images/Leather.webp'
import l2 from '../assets/images/Leather1.webp'
import l3 from '../assets/images/Leather2.webp'
import s1 from '../assets/images/Scent.webp'
import s2 from '../assets/images/Scent1.webp'
import s3 from '../assets/images/Scent2.webp'
import p1 from '../assets/images/Purity.webp'
import p2 from '../assets/images/Purity1.webp'
import p3 from '../assets/images/Purity2.webp'

// Derives which step index is active from a 0–1 progress value
const getActiveIndex = (progress, totalSteps) => {
  if (progress >= 1) return totalSteps - 1;
  return Math.min(Math.floor(progress * totalSteps), totalSteps - 1);
};

// Single image layer — slides up into view when its step becomes active, stays visible after
const StepImage = ({ step, index, totalSteps, scrollYProgress }) => {
  const sliceSize = 1 / totalSteps;
  const sliceStart = index * sliceSize;
  const sliceEnd = sliceStart + sliceSize;

  const yFrom = index === 0 ? '0%' : '100%';
  const y = useTransform(scrollYProgress, [sliceStart, sliceEnd], [yFrom, '0%']);

  return (
    <motion.div
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ y, zIndex: 10 + index }}
    >
      <img
        src={step.image}
        alt={step.subtitle}
        className="w-full h-full object-cover"
        style={{ transform: 'scale(1.05)' }}
      />
    </motion.div>
  );
};

/**
 * Each item slides in from below when its step is reached.
 * Once revealed it stays fully visible — title + description always shown.
 * No dimming, no collapsing of past items.
 */
const StepItem = ({ step, isRevealed }) => (
  <motion.div
    className="mb-6 last:mb-0"
    initial={{ opacity: 0, y: 40 }}
    animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
    transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <h4 className="text-xl md:text-2xl font-semibold text-[#1B1B1B] mb-2 font-urbanist leading-snug">
      {step.subtitle}
    </h4>
    <p className="text-sm text-[#ADB5BD] font-medium leading-relaxed max-w-sm font-urbanist">
      {step.description}
    </p>
  </motion.div>
);

const CraftsmanshipSection = ({ sectionTitle, sectionTitle2, steps, imageLeft = true }) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (v) => {
      setActiveIndex(getActiveIndex(v, steps.length));
    });
    return unsubscribe;
  }, [smoothProgress, steps.length]);

  // Each step gets 100vh of scroll room
  const totalHeight = steps.length * 100;

  return (
    <div ref={containerRef} className="relative" style={{ height: `${totalHeight}vh` }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden bg-white">
        <div className="w-full h-full px-6 md:px-20 py-16 flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center w-full">

            {/* Image panel */}
            <div
              className={`relative aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden rounded-sm shadow-2xl ${imageLeft ? 'order-1' : 'md:order-2 order-1'
                }`}
            >
              {steps.map((step, index) => (
                <StepImage
                  key={index}
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                  scrollYProgress={smoothProgress}
                />
              ))}
            </div>

            {/* Text panel */}
            <div className={`flex flex-col ${imageLeft ? 'order-2' : 'md:order-1 order-2'}`}>
              {/* Watermark title */}
              <h2 className="text-5xl md:text-7xl lg:text-[72px] font-bold text-[#ADB5BD]/20 uppercase tracking-tighter mb-8 leading-none select-none font-urbanist">
                {sectionTitle} <br /> {sectionTitle2}
              </h2>

              {/* All steps — build up as user scrolls, each revealed item stays */}
              <div className="flex flex-col">
                {steps.map((step, index) => (
                  <StepItem
                    key={index}
                    step={step}
                    isRevealed={index <= activeIndex}
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
  const [activeTab, setActiveTab] = useState('All Craft & Process');

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <section className="relative px-6 md:px-20 min-h-screen flex items-center bg-white font-urbanist overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-[48px] text-[#14372F] font-semibold mb-4 tracking-tight leading-[58px]"
          >
            The Anatomy of Luxury.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-base text-[#14372F] font-medium mb-2"
          >
            An inside look at the meticulous craftsmanship behind every EO creation.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[10px] md:text-base text-[#ADB5BD] max-w-3xl leading-[22px] mb-12 font-medium"
          >
            At EO, we don't believe in mass production. We believe in the slow, deliberate process of creation. From the first sketch to the final polish, every step is a testament to our commitment to excellence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="w-full aspect-[16/9] md:aspect-[21/8] overflow-hidden rounded-sm"
          >
            <img src={c1} alt="Artisan at work" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-white min-h-screen flex items-center font-urbanist">
        <div className="mx-auto px-4 md:px-8 text-center max-w-5xl w-full">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] md:text-[18px] font-semibold text-[#343A40] mb-6 uppercase tracking-[0.2em]"
          >
            CRAFT & PROCESS
          </motion.h3>
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl lg:text-[72px] font-bold text-[#14372F] mb-6 uppercase tracking-tighter leading-[80px]"
          >
            THE ARTISAN'S WAY
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-[18px] text-[#ADB5BD] leading-[22px] max-w-2xl mx-auto mb-16 font-medium"
          >
            An immersive journey behind the curtain of EO. Discover the meticulous artistry, heritage techniques, and scientific precision that define our signature collections.
          </motion.p>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-6 md:gap-10 border-y border-[#E9ECEF] py-8"
          >
            {['All Craft & Process', 'Fashion', 'Lux care', 'Accessories', 'Fragrance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[9px] md:text-[14px] uppercase tracking-[0.2em] transition-all duration-300 font-medium ${activeTab === tab ? 'text-[#14372F] font-semibold' : 'text-[#ADB5BD] hover:text-[#14372F]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Tailoring / Fashion */}
          {(activeTab === 'All Craft & Process' || activeTab === 'Fashion') && (
            <CraftsmanshipSection
              sectionTitle="The Art of"
              sectionTitle2="Tailoring."
              imageLeft={true}
              steps={[
                {
                  subtitle: 'Fabric Curation',
                  description: 'We source only the finest natural fibers—Italian silks, Egyptian cottons, and Grade-A wool—ensuring a drape that feels like a second skin.',
                  image: c2,
                },
                {
                  subtitle: 'Precision Cutting',
                  description: 'Every pattern is hand-cut by master tailors. We respect the grain of the fabric to ensure the garment never loses its shape.',
                  image: c21,
                },
                {
                  subtitle: 'The Finishing Stitch',
                  description: "Our signature 'Heritage' finish involves hand-rolled hems and reinforced seams, ensuring longevity that lasts generations.",
                  image: c22,
                },
              ]}
            />
          )}

          {/* Leather / Accessories */}
          {(activeTab === 'All Craft & Process' || activeTab === 'Accessories') && (
            <CraftsmanshipSection
              sectionTitle="Sculpted in"
              sectionTitle2="Leather."
              imageLeft={false}
              steps={[
                {
                  subtitle: 'Selection',
                  description: "Only 5% of hides meet our criteria for 'Sovereign' quality. We use full-grain leathers that develop a beautiful patina over time.",
                  image: l1,
                },
                {
                  subtitle: 'Structural Integrity',
                  description: 'Our bags are built from the inside out. We use reinforced linings and architectural brass hardware to ensure they remain as structured as the day they were made.',
                  image: l2,
                },
                {
                  subtitle: 'Hand-Burnishing',
                  description: 'Every edge is hand-painted and polished multiple times to create a smooth, seamless finish that is resistant to the elements.',
                  image: l3,
                },
              ]}
            />
          )}

          {/* Lux care */}
          {(activeTab === 'All Craft & Process' || activeTab === 'Lux care') && (
            <CraftsmanshipSection
              sectionTitle="Purity Meets"
              sectionTitle2="Performance."
              imageLeft={false}
              steps={[
                {
                  subtitle: 'Botanical Sourcing',
                  description: 'We blend rare floral extracts with advanced dermatological science. Every ingredient is chosen for its efficacy and skin-health benefits.',
                  image: p1,
                },
                {
                  subtitle: 'Micro-Milling',
                  description: 'Our powders and pigments are triple-milled to a microscopic level, creating a texture so fine it blends invisibly into the skin.',
                  image: p2,
                },
                {
                  subtitle: 'Signature Encasing',
                  description: 'Luxury is tactile. Our cosmetic cases are weighted and designed with magnetic closures to provide a satisfying, premium feel with every use.',
                  image: p3,
                },
              ]}
            />
          )}

          {/* Fragrance */}
          {(activeTab === 'All Craft & Process' || activeTab === 'Fragrance') && (
            <CraftsmanshipSection
              sectionTitle="The Soul of the"
              sectionTitle2="Scent."
              imageLeft={true}
              steps={[
                {
                  subtitle: 'The Extraction',
                  description: 'Using traditional steam distillation, we extract the purest essences from rare woods, spices, and blooms.',
                  image: s1,
                },
                {
                  subtitle: 'The Aging Process',
                  description: 'Like fine wine, our perfumes are macerated for weeks. This allows the top, heart, and base notes to bond perfectly.',
                  image: s2,
                },
                {
                  subtitle: 'Manual Bottling',
                  description: "Each bottle is inspected under light for clarity and hand-sealed, ensuring that the 'invisible accessory' reaches you in its most potent form.",
                  image: s3,
                },
              ]}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA */}
      <section className="bg-primary py-24 text-white flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="text-4xl md:text-7xl font-bold mb-10 tracking-tighter uppercase">
            Experience <br /> The Difference
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
