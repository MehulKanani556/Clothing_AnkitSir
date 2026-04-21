import { useNavigate } from 'react-router-dom';
import { PiArrowUpRightBold } from 'react-icons/pi';
import craft1 from '../assets/images/philosophy1.webp';
import craft2 from '../assets/images/philosophy2.webp';
import craft3 from '../assets/images/philosophy3.webp';
import philosophyImg from '../assets/images/philosophystory.webp';
import IntegrityIcon from '../assets/images/INTEGRITY.webp';
import ArtistryIcon from '../assets/images/ARTISTRY.webp';
import PresenceIcon from '../assets/images/PRESENCE.webp';
import TimelessnessIcon from '../assets/images/TIMELESSNESS.webp';

const pillars = [
    {
        Icon: IntegrityIcon,
        title: 'INTEGRITY',
        description: 'We never compromise on the quality of our raw materials.',
    },
    {
        Icon: ArtistryIcon,
        title: 'ARTISTRY',
        description: 'Every product is treated as a masterpiece, not a commodity.',
    },
    {
        Icon: PresenceIcon,
        title: 'PRESENCE',
        description: 'We design for the individual who wants to leave a mark without saying a word.',
    },
    {
        Icon: TimelessnessIcon,
        title: 'TIMELESSNESS',
        description: 'Our aesthetic is built to transcend seasons and survive decades.',
    },
];

const philosophyCards = [
    {
        img: craft1,
        title: 'Purposeful Craft',
        description:
            'In an era of disposable trends, we choose the path of permanence. Our philosophy rejects mass production in favour of Purposeful Craft. Every stitch is intentional, every ingredient is ethically sourced, and every design is born from a dialogue between tradition and innovation. We don\'t just follow standards, we set them through the lens of perfection.',
    },
    {
        img: craft3,
        title: 'Sensory Synergy',
        description:
            'We believe that style is a multisensory experience. A garment isn\'t just seen through the clothes. They are experienced through their scent and their presence. Our philosophy integrates fashion, fragrance, and cosmetics to create a unified aura by aligning what you wear with the scent you carry, we help you compose a personal identity that is cohesive and unforgettable.',
    },
    {
        img: craft2,
        title: 'Conscious Luxury',
        description:
            'To us, luxury is responsibility. We believe in Clean Luxury — an obligation that is sustainable, ethical and mindful. We minimise our footprint by sourcing rare botanical extracts and heritage fabrics that are natural to the Earth as they are to your skin. For EO, longevity is the ultimate form of sustainability.',
    },
];

export default function Philosophy() {
    const navigate = useNavigate();

    return (
        <div className="bg-mainBG min-h-screen pt-12 pb-12 px-6 md:px-10">
            <div className="max-w-7xl mx-auto">

                {/* ── Section 1: Hero ─────────────────────────────────────────── */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-[20px] md:text-[28px] lg:text-[32px] text-primary font-semibold mb-2">
                        The EO Ethos
                    </h1>
                    <p className="text-sm md:text-base text-primary font-medium mb-3">
                        "True luxury is not a statement of wealth, but a signature of soul."
                    </p>
                    <p className="text-sm md:text-base text-lightText font-medium leading-relaxed">
                        At EO, our philosophy is anchored in the belief that beauty lies in balance — the harmony between the physical garment and the invisible essence of the wearer. We exist for the modern connoisseur who values substance as much as style.
                    </p>
                </div>

                {/* ── Section 2: Three Philosophy Cards ───────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:mb-14">
                    {philosophyCards.map((card) => (
                        <div key={card.title} className="group bg-white flex flex-col border border-border transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2">
                            <div className="overflow-hidden">
                                <img
                                    src={card.img}
                                    alt={card.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6 md:p-8 flex flex-col flex-1">
                                <h3 className="text-sm md:text-2xl font-bold text-center text-primary mb-3">
                                    {card.title}
                                </h3>
                                <p className="text-sm md:text-base text-lightText font-medium leading-relaxed text-center">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Section 3: The Golden Ratio ──────────────────────────────── */}
                <div className="mb-10 md:mb-14">
                    <p className="text-sm md:text-base uppercase text-mainText font-semibold mb-1">
                        The Golden Ratio of EO
                    </p>
                    <p className="text-xs md:text-sm text-lightText font-medium mb-6">
                        An EO object is designed to last a lifetime. To maintain the structural integrity, texture, and color of your garments, we recommend the following preservation rituals.
                    </p>

                    <div className="bg-white p-4 md:p-8 border border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 gap-4">
                            {pillars.map(({ Icon, title, description }, index) => (
                                <div key={title} className="group relative flex flex-col items-center text-center gap-2 px-4 py-6 md:py-8 transition-all duration-300 hover:bg-mainBG/50 rounded-xl">
                                    {/* Vertical Divider */}
                                    {index < pillars.length - 1 && (
                                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-40 bg-border  
                                            ${index === 1 ? 'hidden lg:block' : 'hidden sm:block'}
                                        `} />
                                    )}

                                    <div className="mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
                                        <img
                                            src={Icon}
                                            alt={title}
                                            className="w-16 h-16 object-contain"
                                        />
                                    </div>
                                    <h4 className="text-xs md:text-sm lg:text-base uppercase font-semibold text-primary tracking-widest transition-colors duration-300 group-hover:text-secondary">
                                        {title}
                                    </h4>
                                    <p className="text-[10px] md:text-xs lg:text-sm text-lightText font-medium leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Section 4: Your Story CTA ────────────────────────────────── */}
                <div className="bg-white flex flex-col lg:flex-row">
                    {/* Text side */}
                    <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                        <h2 className="text-[20px] md:text-[36px] lg:text-[44px] font-bold uppercase text-primary mb-2">
                            YOUR STORY,<br />CURATED BY US.
                        </h2>
                        <p className="text-sm md:text-base text-lightText font-medium leading-relaxed mb-8">
                            Our philosophy is incomplete without you. We provide the elements — the fabric, the fragrance, the finish. But you provide the soul.
                        </p>
                        <div>
                            <button
                                onClick={() => navigate('/collection/shop')}
                                className="group flex items-center gap-2 bg-primary text-white px-5 md:px-8 py-3 md:py-4 text-xs md:text-sm font-semibold uppercase tracking-widest hover:bg-primary/95 hover:shadow-[0_10px_30px_rgba(20,55,47,0.3)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
                            >
                                Explore The Collection
                                <PiArrowUpRightBold className="text-lg transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </button>
                        </div>
                    </div>

                    {/* Image side */}
                    <div className="w-full lg:w-1/2 hidden lg:block">
                        <img
                            src={philosophyImg}
                            alt="Your Story Curated By Us"
                            className="w-full h-64 lg:h-full object-cover"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
