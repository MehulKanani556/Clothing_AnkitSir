import React from 'react';
import c1 from '../assets/images/craft1.webp'
import c2 from '../assets/images/craft2.webp'
import c3 from '../assets/images/craft3.webp'
import c4 from '../assets/images/craft4.webp'
import c5 from '../assets/images/craft5.webp'
const Craftsmanship = () => {
  return (
    <div className="bg-white">
      {/* Hero Section - The Anatomy of Luxury */}
      <section className="relative md:px-28">
        {/* Header Text */}
        <div className="py-5 md:py-10 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl text-primary font-semibold mb-4">
            The Anatomy of Luxury
          </h1>
          <p className="text-sm md:text-base text-primary   ">
            An inside look at the meticulous craftsmanship behind every EO creation.
          </p>
          <p className="text-sm md:text-base text-lightText ">
            At EO, we don't believe in mass production. We believe in the slow, deliberate process of creation. From the first sketch to the final polish, every step is a testament to our commitment to excellence.
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full mx-auto px-4 mb-16">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <img
              src={c1}
              alt="Artisan at work"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = c1;
              }}
            />
          </div>
        </div>
      </section>

      {/* The Artisan's Way Section */}
      <section className="bg-white  py-10 ">
        <div className="mx-auto px-4 md:px-8">
          <div className="text-center ">

            <h3 className="text-xs md:text-lg font-semibold text-mainText mb-3 uppercase">
              craft & process
            </h3>

            <h2 className="text-2xl md:text-3xl lg:text-5xl text-primary font-bold  mb-3 uppercase">
              The Artisan's Way
            </h2>
            <p className="text-sm md:text-base text-gray-300 mb-4">
              An immersive journey behind the curtain of EO. Discover the meticulous artistry, heritage techniques, and scientific precision that define our signature collections.
            </p>

          </div>
        </div>
      </section>

      {/* The Art of Tailoring Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ">
            {/* Image */}
            <div className="order-2 md:order-1">
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <img
                  src={c2}
                  alt="Colorful fabric rolls"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80';
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-lightText">
                THE ART OF<br className='hiden md:block' />TAILORING.
              </h2>
              <h2 className="text-base md:text-3xl font-semibold text-dark">
                Fabric Curation
              </h2>

              <p className="text-xs md:text-sm  text-lightText ">
                We source only the finest natural fibers—Italian silks, Egyptian cottons, and Grade-A wool—ensuring a drape that feels like a second skin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sculpted in Leather Section */}
      <section className="py-8 ">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ">
            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-lightText">
                SCULPTED IN<br className='hiden md:block' />LEATHER.
              </h2>
              <h2 className="text-base md:text-3xl font-semibold text-dark">
                Selection
              </h2>
              <p className="text-xs md:text-sm  text-lightText ">
                Only 5% of hides meet our criteria for 'Sovereign' quality. We use full-grain leathers that develop a beautiful patina over time.
              </p>
            </div>

            {/* Image */}
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              <img
                src={c3}
                alt="Premium leather texture"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=800&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Purity Meets Performance Section */}
      <section className="py-8 ">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ">
            {/* Image */}
            <div className="order-2 md:order-1">
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <img
                  src={c4}
                  alt="Natural plant materials"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&q=80';
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="order-1 md:order-2 space-y-6">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-lightText">
                  Purity Meets<br className='hiden md:block' />Performance.
                </h2>
                <h2 className="text-base md:text-3xl font-semibold text-dark">
                  Botanical Sourcing
                </h2>
                <p className="text-xs md:text-sm  text-lightText ">
                  We blend rare floral extracts with advanced dermatological science. Every ingredient is chosen for its efficacy and skin-health benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Soul of the Scent Section */}
      <section className="py-8 ">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ">
            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-lightText">
                The Soul of the<br className='hiden md:block' />Scent.
              </h2>
              <h2 className="text-base md:text-3xl font-semibold text-dark">
                The Extraction
              </h2>
              <p className="text-xs md:text-sm  text-lightText ">
                Using traditional steam distillation, we extract the purest essences from rare woods, spices, and blooms.
              </p>
            </div>

            {/* Image */}
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              <img
                src={c5}
                alt="Natural wood texture"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1585009350919-c2671a8a9b6f?w=800&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-primary text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-6">
            Experience the Difference
          </h2>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed mb-8">
            Discover how our commitment to craftsmanship creates pieces that transcend trends and stand the test of time.
          </p>
          <button className="bg-white text-primary px-8 py-3 text-sm md:text-base font-medium tracking-wide hover:bg-gray-100 transition-colors duration-300">
            EXPLORE COLLECTION
          </button>
        </div>
      </section>
    </div>
  );
};

export default Craftsmanship;
