import { Link } from 'react-router-dom';
import { ReactComponent as EoLogo } from '../assets/images/eo.svg';
import instaImg from '../assets/images/insta.webp';
import fbImg from '../assets/images/fb.webp';

const shopLinks = [
    { label: 'Seasonal Edit', to: '/shop/seasonal-edit' },
    { label: 'New Arrivals', to: '/shop/new-arrivals' },
    { label: 'All Collections', to: '/shop/all-collections' },
    { label: 'Men', to: '/shop/men' },
    { label: 'Women', to: '/shop/women' },
    { label: 'Lux Care', to: '/shop/lux-care' },
    { label: 'Accessories', to: '/shop/accessories' },
];

const aboutLinks = [
    { label: 'The House', to: '/about/the-house' },
    { label: 'Philosophy', to: '/about/philosophy' },
    { label: 'Craft & Process', to: '/craftsmanship' },
    { label: 'Journal', to: '/about/journal' },
];

const serviceLinks = [
    { label: 'Contact', to: '/contact' },
    { label: 'Delivery & Returns', to: '/delivery-returns' },
    { label: 'Lookbook', to: '/lookbook' },
    { label: 'Care Guide', to: '/care-guide' },
];

function FooterCol({ title, links }) {
    return (
        <div className="flex flex-col gap-6">
            <h3 className="font-bold text-2xl leading-8 text-[#F8F9FA] uppercase tracking-wide">
                {title}
            </h3>
            <ul className="flex flex-col gap-4">
                {links.map((l) => (
                    <li key={l.label}>
                        <Link
                            to={l.to}
                            className="text-base font-medium leading-[22px] text-[#ADB5BD] hover:text-[#F8F9FA] transition-colors duration-200"
                        >
                            {l.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="font-sans">
            <div className="
                bg-[#14372F] w-full box-border
                px-4 py-9
                sm:px-5 sm:py-12
                md600:px-8 md600:py-14
                lg:px-10 lg:py-16
                2xl:px-16 2xl:py-24

                grid gap-7
                grid-cols-1
                sm:grid-cols-2
                md600:grid-cols-3
                2xl:grid-cols-[320px_1fr_1fr_1fr_1.5fr]

                lg:gap-x-10 lg:gap-y-8
                2xl:gap-12
            ">

                {/* ── Brand ── */}
                <div className="
                    flex flex-col gap-6
                    col-span-1
                    sm:col-span-2
                    md600:col-span-3 lg:row-span-2
                    2xl:col-span-1 2xl:row-span-1
                ">
                    <EoLogo className="w-[104px] h-[52px] [&_path]:fill-[#F8F9FA]" />
                    <div className="flex flex-col gap-2">
                        <p className="font-medium text-2xl leading-8 text-[#F8F9FA]">
                            Nothing Without Purpose
                        </p>
                        <p className="font-medium text-lg leading-[22px] text-[#ADB5BD]">
                            A refined expression of form, restraint, and considered design.
                        </p>
                    </div>
                </div>

                {/* ── Shop ── */}
                <FooterCol title="SHOP" links={shopLinks} />

                {/* ── About ── */}
                <FooterCol title="ABOUT" links={aboutLinks} />

                {/* ── Services ── */}
                <FooterCol title="SERVICES" links={serviceLinks} />

                {/* ── Social Media ── */}
                <div className="
                    flex flex-col gap-6
                    col-span-1
                    sm:col-span-2
                    lg:col-span-1
                    2xl:col-span-1
                ">
                    <h3 className="font-bold text-2xl leading-8 text-[#F8F9FA] uppercase tracking-wide">
                        SOCIAL MEDIA
                    </h3>

                    {/* Images — hidden below md (768px) */}
                    <div className="hidden md:flex flex-row gap-3">
                        {/* Instagram */}
                        <div className="flex flex-col gap-4 flex-1">
                            <img
                                src={instaImg}
                                alt="Instagram"
                                className="w-full aspect-square object-cover block"
                            />
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-semibold text-base uppercase text-[#F8F9FA] hover:opacity-75 transition-opacity"
                            >
                                <span>INSTAGRAM</span>
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                    <path d="M5 15L15 5M15 5H7M15 5V13" stroke="#F8F9FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        </div>
                        {/* Facebook */}
                        <div className="flex flex-col gap-4 flex-1">
                            <img
                                src={fbImg}
                                alt="Facebook"
                                className="w-full aspect-square object-cover block"
                            />
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-semibold text-base uppercase text-[#F8F9FA] hover:opacity-75 transition-opacity"
                            >
                                <span>FACEBOOK</span>
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                    <path d="M5 15L15 5M15 5H7M15 5V13" stroke="#F8F9FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Plain links — shown below md (768px) instead of images */}
                    <div className="flex md:hidden flex-col gap-4">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium leading-[22px] text-[#ADB5BD] hover:text-[#F8F9FA] transition-colors duration-200"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-medium leading-[22px] text-[#ADB5BD] hover:text-[#F8F9FA] transition-colors duration-200"
                        >
                            Facebook
                        </a>
                    </div>
                </div>

            </div>

            {/* ── Copyright bar ── */}
            <div className="flex justify-center items-center px-8 py-4 bg-white w-full">
                <p className="font-medium text-base leading-[22px] text-[#343A40] text-center">
                    © 2026 <strong>eo</strong>. All Rights Reserved.
                </p>
            </div>

        </footer>
    );
}
