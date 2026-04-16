import { useState, useEffect, useRef, useCallback } from 'react'
import { CgProfile } from "react-icons/cg";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { LuSearch } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategories, fetchCategories, fetchSubCategories } from '../redux/slice/category.slice';
import { logout } from '../redux/slice/auth.slice';
import { logSearch, fetchPopularSearches, fetchRecentSearches, fetchTrendingProducts, searchProducts, clearSearchResults } from '../redux/slice/search.slice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiArrowUpRight } from 'react-icons/hi2';
import { ReactComponent as EoLogo } from '../assets/images/eo.svg';

const ACCOUNT_MENU = [
    { label: 'Profile', href: '/profile' },
    { label: 'Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Addresses', href: '/addresses' },
    { label: 'Payments', href: '/payments' },
    { label: 'Settings', href: '/settings' },
    { label: 'Support', href: '/support' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const debounceTimer = useRef(null);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { mainCategories, categories, subCategories } = useSelector((state) => state.category);
    const { user } = useSelector((state) => state.auth);
    const { popularSearches, recentSearches, trendingProducts, searchResults, searchLoading } = useSelector((state) => state.search);

    // Check if we're on the home page
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        if (isAccountOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isAccountOpen]);

    const handleLogout = () => {
        dispatch(logout());
        setIsAccountOpen(false);
        navigate('/');
    };

    useEffect(() => {
        dispatch(fetchMainCategories());
        dispatch(fetchCategories());
        dispatch(fetchSubCategories());
    }, [dispatch]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isSearchOpen) {
            dispatch(fetchPopularSearches());
            dispatch(fetchRecentSearches());
            dispatch(fetchTrendingProducts());
        } else {
            dispatch(clearSearchResults());
            setSearchQuery('');
        }
    }, [isSearchOpen, dispatch]);

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            dispatch(logSearch(searchQuery.trim()));
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
            dispatch(clearSearchResults());
        }
    };

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchQuery(value);
        clearTimeout(debounceTimer.current);
        if (value.trim().length > 0) {
            debounceTimer.current = setTimeout(() => {
                dispatch(searchProducts(value.trim()));
            }, 400);
        } else {
            dispatch(clearSearchResults());
        }
    }, [dispatch]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get categories and subcategories for a specific main category
    const getCategoriesForMainCategory = (mainCategoryId) => {
        return categories.filter(cat => {
            // Handle both populated and non-populated mainCategoryId
            const catMainId = typeof cat.mainCategoryId === 'object' ? cat.mainCategoryId._id : cat.mainCategoryId;
            return catMainId === mainCategoryId;
        });
    };

    const getSubCategoriesForCategory = (categoryId) => {
        return subCategories.filter(sub => {
            // Handle both populated and non-populated categoryId
            const subCatId = typeof sub.categoryId === 'object' ? sub.categoryId._id : sub.categoryId;
            return subCatId === categoryId;
        });
    };

    // Mock data for mega menu content (replace with actual data from your backend)
    const getMegaMenuContent = (mainCategory) => {
        const categoryList = getCategoriesForMainCategory(mainCategory._id);

        // Group categories into columns (you can customize this logic)
        const columns = [];
        const itemsPerColumn = Math.ceil(categoryList.length / 3);

        for (let i = 0; i < categoryList.length; i += itemsPerColumn) {
            columns.push(categoryList.slice(i, i + itemsPerColumn));
        }

        return {
            columns,
            featuredImage: mainCategory.mainCategoryImage || '/men_archive.png',
            featuredTitle: `${mainCategory.mainCategoryName.toUpperCase()} COLLECTION`,
            featuredLink: `/collection/${mainCategory.slug}`
        };
    };


    return (
        <>
            {/* Main Header Container - Fixed at top */}
            <div className={`${isHomePage ? "fixed" : "sticky"} top-0 left-0 w-full z-50 transition-shadow duration-300`}>
                {/* Promo Bar */}
                <div className={`hidden md:block border-b transition-colors duration-300 ${isScrolled || hoveredCategory ? 'bg-primary border-primary/10' : 'bg-primary border-white/5'}`}>
                    <p className='text-white text-center text-[10px] sm:text-xs py-2 font-medium tracking-[0.25em] opacity-80 uppercase'>
                        Orders over $250 ship free | Extended returns available through Jun 15.
                    </p>
                </div>
                {/* Header Content */}
                <header className={`transition-colors duration-300 ${isHomePage
                    ? (isScrolled || hoveredCategory ? 'bg-white text-dark border-b border-border' : 'bg-transparent text-white')
                    : 'bg-white text-dark border-b border-border'
                    }`}>
                    <div className="mx-auto px-4 lg:px-10">
                        <div className="flex items-center h-20 relative">

                            {/* Left: Mobile Menu & Desktop Nav */}
                            <div className="flex items-center w-1/4 lg:w-auto lg:flex-1">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="lg:hidden p-2 -ml-2 hover:opacity-70 transition-opacity z-[70] relative"
                                    aria-label="Toggle Menu"
                                >
                                    {isMenuOpen ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                                    )}
                                </button>

                                <nav className="hidden lg:flex items-center space-x-10">
                                    {(mainCategories && mainCategories.length > 0) ? (
                                        mainCategories.map((category) => (
                                            <div
                                                key={category._id}
                                                className="relative group"
                                                onMouseEnter={() => setHoveredCategory(category._id)}
                                                onMouseLeave={() => setHoveredCategory(null)}
                                            >
                                                <Link
                                                    to={`/collection/${category.slug || category.mainCategoryName?.toLowerCase().replace(' ', '-')}`}
                                                    className={`text-base font-medium text-nowrap transition-all duration-300 relative uppercase ${hoveredCategory === category._id
                                                        ? 'opacity-100'
                                                        : 'opacity-60 hover:opacity-100'
                                                        } ${isHomePage
                                                            ? (isScrolled || hoveredCategory ? 'text-dark' : 'text-white')
                                                            : 'text-dark'
                                                        }`}
                                                >
                                                    {category.mainCategoryName}
                                                    <span className={`absolute -bottom-1 left-0 h-[1px] transition-all duration-300 ${hoveredCategory === category._id ? 'w-full' : 'w-0 group-hover:w-full'
                                                        } ${isHomePage
                                                            ? (isScrolled || hoveredCategory ? 'bg-dark' : 'bg-white')
                                                            : 'bg-dark'
                                                        }`}></span>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        ['SHOP', 'MEN', 'WOMEN', 'LUX CARE'].map((item) => (
                                            <Link key={item} to="#" className={`text-base font-medium uppercase transition-colors opacity-60 hover:opacity-100 ${isHomePage
                                                ? (isScrolled || hoveredCategory ? 'text-dark' : 'text-white')
                                                : 'text-dark'
                                                }`}>{item}</Link>
                                        ))
                                    )}
                                </nav>
                            </div>

                            {/* Center: Logo */}
                            <div className="flex-1 flex justify-center z-[60]">
                                <Link to="/" className="hover:opacity-80 transition-opacity duration-300 outline-none">
                                    <EoLogo
                                        className={`h-8 w-auto transition-all duration-300 ${isHomePage
                                            ? (isScrolled || hoveredCategory ? '[&_path]:fill-primary' : '[&_path]:fill-white')
                                            : '[&_path]:fill-primary'
                                            }`}
                                    />
                                </Link>
                            </div>

                            {/* Right: Icons */}
                            <div className="flex items-center justify-end w-1/4 lg:w-auto lg:flex-1 space-x-1 sm:space-x-2 md:space-x-4">
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className={`p-2 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 ${isHomePage
                                        ? (isScrolled || hoveredCategory ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                        : 'hover:bg-mainBG text-dark'
                                        }`}
                                >
                                    <LuSearch className='text-2xl' />
                                </button>
                                <button className={`hidden xs:block p-2 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 ${isHomePage
                                    ? (isScrolled || hoveredCategory ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                    : 'hover:bg-mainBG text-dark'
                                    }`}>
                                    <FaRegHeart className='text-2xl' />
                                </button>
                                <button className={`p-2 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 relative ${isHomePage
                                    ? (isScrolled || hoveredCategory ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                    : 'hover:bg-mainBG text-dark'
                                    }`}>
                                    <HiOutlineShoppingBag className='text-2xl' />
                                </button>
                                {user ? (
                                    <button
                                        onClick={() => setIsAccountOpen(true)}
                                        className={`flex gap-2 items-center ${isHomePage
                                            ? (isScrolled || hoveredCategory ? 'text-dark' : 'text-white')
                                            : 'text-dark'
                                            }`}>
                                        <div className="h-8 w-8 bg-primary uppercase rounded-full flex items-center justify-center font-bold text-white">
                                            {user?.firstName?.slice(0, 1) || 'U'}
                                        </div>
                                        <span className='capitalize font-medium tracking-wide'>{user?.firstName}</span>
                                    </button>
                                ) : (
                                    <Link to="/auth" className={`hidden sm:block p-2 rounded-full transition-all duration-300 opacity-70 hover:opacity-100 ${isHomePage
                                        ? (isScrolled || hoveredCategory ? 'hover:bg-mainBG text-dark' : 'hover:bg-white/5 text-white')
                                        : 'hover:bg-mainBG text-dark'
                                        }`}>
                                        <CgProfile className='text-2xl' />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Navigation Menu Overflow */}
                <div
                    className={`fixed inset-0 top-[80px] md:top-[100px] bg-black lg:hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-[40] ${isMenuOpen ? 'opacity-100 translate-y-0 visibility-visible shadow-2xl' : 'opacity-0 -translate-y-4 visibility-hidden pointer-events-none'
                        }`}
                    style={{ height: 'calc(100vh - 80px)' }}
                >
                    <div className="flex flex-col h-full overflow-y-auto px-10 py-12">
                        <nav className="flex flex-col space-y-5">
                            {mainCategories && mainCategories.map((category, index) => (
                                <Link
                                    key={category._id}
                                    to={`/collection/${category.slug || category.mainCategoryName?.toLowerCase().replace(' ', '-')}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-lg font-semibold tracking-[0.2em] transform transition-all duration-500 text-white hover:text-gray-400 uppercase ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                                        }`}
                                    style={{ transitionDelay: `${index * 75}ms` }}
                                >
                                    {category.mainCategoryName}
                                </Link>
                            ))}
                        </nav>

                        <div className={`mt-10 pt-10 border-t border-white/10 flex flex-col space-y-5 transition-all duration-700 delay-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}>
                            <Link to="/account" className="text-xs font-semibold tracking-[0.15em] text-white/50 hover:text-white transition-colors uppercase">Account</Link>
                            <Link to="/wishlist" className="text-xs font-semibold tracking-[0.15em] text-white/50 hover:text-white transition-colors uppercase">Wishlist</Link>
                            <Link to="/support" className="text-xs font-semibold tracking-[0.15em] text-white/50 hover:text-white transition-colors uppercase">Customer Care</Link>

                            <div className="pt-6 flex space-x-4">
                                {['IG', 'FB', 'TW'].map((social) => (
                                    <div key={social} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-40 hover:opacity-100 hover:border-white/30 cursor-pointer transition-all">
                                        <span className="text-[9px] font-bold tracking-tighter">{social}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mega Menu Dropdown */}
                {hoveredCategory && (
                    <>
                        {/* Invisible bridge to prevent menu from closing */}
                        <div
                            className="hidden lg:block absolute top-[80px] left-0 w-full h-[10px] z-40"
                            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                        />
                        <div
                            className="hidden lg:block absolute top-[90px] left-0 w-full bg-white text-dark z-50 shadow-lg"
                            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            {mainCategories.map((mainCategory) => {
                                if (mainCategory._id !== hoveredCategory) return null;

                                const menuContent = getMegaMenuContent(mainCategory);
                                const categoryList = getCategoriesForMainCategory(mainCategory._id);

                                // Split categories into up to 3 columns
                                const col1 = categoryList.slice(0, Math.ceil(categoryList.length / 3));
                                const col2 = categoryList.slice(Math.ceil(categoryList.length / 3), Math.ceil(categoryList.length / 3) * 2);
                                const col3 = categoryList.slice(Math.ceil(categoryList.length / 3) * 2);
                                const columns = [col1, col2, col3].filter(c => c.length > 0);

                                return (
                                    <div key={mainCategory._id} className="flex flex-row items-start p-8 w-full">
                                        {categoryList.length > 0 ? (
                                            <>
                                                {/* Category Columns (1–3) */}
                                                {columns.map((colCategories, colIdx) => (
                                                    <div
                                                        key={colIdx}
                                                        className="flex flex-col items-start gap-6 flex-1 pr-8 self-stretch"
                                                    >
                                                        {colCategories.map((category) => {
                                                            const subCats = getSubCategoriesForCategory(category._id);
                                                            return (
                                                                <div key={category._id} className="flex flex-col items-start gap-4 w-full">
                                                                    {/* Column Title */}
                                                                    <h3
                                                                        className="w-full uppercase text-primary"
                                                                        style={{
                                                                            fontFamily: 'Urbanist, sans-serif',
                                                                            fontWeight: 800,
                                                                            fontSize: '14px',
                                                                            lineHeight: '16px',
                                                                        }}
                                                                    >
                                                                        {category.categoryName}
                                                                    </h3>
                                                                    {/* Options */}
                                                                    {subCats.length > 0 ? (
                                                                        <ul className="flex flex-col items-start gap-4 w-full">
                                                                            {subCats.map((subCat) => (
                                                                                <li key={subCat._id} className="w-full">
                                                                                    <Link
                                                                                        to={`/collection/${mainCategory.slug}/${category.slug}/${subCat.slug}`}
                                                                                        className="block w-full transition-colors duration-200 hover:text-gold"
                                                                                        style={{
                                                                                            fontFamily: 'Urbanist, sans-serif',
                                                                                            fontWeight: 500,
                                                                                            fontSize: '16px',
                                                                                            lineHeight: '22px',
                                                                                            color: '#343A40',
                                                                                        }}
                                                                                    >
                                                                                        {subCat.subCategoryName}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="text-sm text-lightText italic">No subcategories</p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}

                                                {/* Column 4 — Featured Image + CTAs */}
                                                <div className="flex flex-col items-start gap-6 flex-1 self-stretch">
                                                    {/* Section title */}
                                                    <h3
                                                        className="w-full uppercase text-primary"
                                                        style={{
                                                            fontFamily: 'Urbanist, sans-serif',
                                                            fontWeight: 800,
                                                            fontSize: '14px',
                                                            lineHeight: '16px',
                                                        }}
                                                    >
                                                        {mainCategory.mainCategoryName}
                                                    </h3>
                                                    {/* Featured Image */}
                                                    <div className="w-full" style={{ height: '400px' }}>
                                                        <img
                                                            src={menuContent.featuredImage}
                                                            alt={menuContent.featuredTitle}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {/* CTA Buttons */}
                                                    <Link
                                                        to={menuContent.featuredLink}
                                                        className="flex flex-row items-center gap-3 hover:opacity-70 transition-opacity"
                                                    >
                                                        <span
                                                            style={{
                                                                fontFamily: 'Urbanist, sans-serif',
                                                                fontWeight: 600,
                                                                fontSize: '18px',
                                                                lineHeight: '22px',
                                                                textTransform: 'uppercase',
                                                                color: '#1B1B1B',
                                                            }}
                                                        >
                                                            Shop {mainCategory.mainCategoryName}
                                                        </span>
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        to={`${menuContent.featuredLink}/new-arrivals`}
                                                        className="flex flex-row items-center gap-3 hover:opacity-70 transition-opacity"
                                                    >
                                                        <span
                                                            style={{
                                                                fontFamily: 'Urbanist, sans-serif',
                                                                fontWeight: 600,
                                                                fontSize: '18px',
                                                                lineHeight: '22px',
                                                                textTransform: 'uppercase',
                                                                color: '#1B1B1B',
                                                            }}
                                                        >
                                                            New Arrivals
                                                        </span>
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-8 text-center w-full">
                                                <p className="text-lightText">No categories available for {mainCategory.mainCategoryName}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Search Overlay */}
                {isSearchOpen && (
                    <div
                        className="fixed top-0 left-0 w-full bg-white z-[100] shadow-2xl"
                        style={{ minHeight: '520px' }}
                    >
                        {/* Close button row */}
                        <div className="flex items-center justify-end px-6 md:px-10 pt-4">
                            <button
                                onClick={() => setIsSearchOpen(false)}
                                className="p-2 hover:bg-mainBG rounded-full transition-colors"
                            >
                                <IoClose className="text-2xl text-dark" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Left Sidebar */}
                            <div className="hidden md:flex flex-col gap-10 w-64 shrink-0 px-8 pb-10 pt-2 border-r border-border">
                                <div>
                                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-4 text-dark">
                                        Popular Searches
                                    </h3>
                                    <ul className="space-y-3">
                                        {(popularSearches && popularSearches.length > 0
                                            ? popularSearches
                                            : ['Leather clothing', 'Sculptural Cross-body Bags', 'Oxford Shoes', 'Vitamin C Brightening Elixirs']
                                        ).map((s, i) => (
                                            <li key={i}>
                                                <button
                                                    onClick={() => {
                                                        dispatch(logSearch(s));
                                                        navigate(`/search?q=${encodeURIComponent(s)}`);
                                                        setIsSearchOpen(false);
                                                    }}
                                                    className="text-sm text-mainText hover:text-gold transition-colors text-left w-full"
                                                >
                                                    {s}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-4 text-dark">
                                        {recentSearches?.length > 0 ? 'Recent Searches' : 'Suggestions'}
                                    </h3>
                                    <ul className="space-y-3">
                                        {(recentSearches?.length > 0
                                            ? recentSearches
                                            : ['Barbara bag', 'Gifts for her', 'Gifts for him', "Men's new arrivals", "Women's new arrivals"]
                                        ).map((s, i) => (
                                            <li key={i}>
                                                <button
                                                    onClick={() => {
                                                        navigate(`/search?q=${encodeURIComponent(s)}`);
                                                        setIsSearchOpen(false);
                                                    }}
                                                    className="text-sm text-mainText hover:text-gold transition-colors text-left w-full"
                                                >
                                                    {s}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Content */}
                            <div className="flex-1 flex flex-col px-6 md:px-10 pb-10 pt-2 overflow-y-auto">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 border border-border px-4 py-3 mb-8 bg-[#F9F9F9]">
                                    <LuSearch className="text-lg text-primary/40 shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleSearchSubmit}
                                        placeholder="Search our global archive for objects of rarity.."
                                        className="flex-1 text-sm text-dark placeholder:text-primary/30 outline-none bg-transparent"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); dispatch(clearSearchResults()); }}>
                                            <IoClose className="text-lg text-primary/40 hover:text-dark transition-colors" />
                                        </button>
                                    )}
                                </div>

                                {/* Live Results or Trending */}
                                {searchQuery.trim().length > 0 ? (
                                    <div>
                                        <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-6 text-dark">
                                            {searchLoading ? 'Searching...' : `Results for "${searchQuery}"`}
                                        </h3>
                                        {searchLoading ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="aspect-[3/4] bg-mainBG mb-3"></div>
                                                        <div className="h-3 bg-mainBG w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-mainBG w-1/4"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                {searchResults.slice(0, 8).map((product) => (
                                                    <Link
                                                        key={product._id}
                                                        to={`/product/${product.slug}`}
                                                        onClick={() => setIsSearchOpen(false)}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="relative mb-3 bg-[#F9F9F9] aspect-[3/4] overflow-hidden">
                                                            <img
                                                                src={product.variants?.[0]?.images?.[0] || "/images/product.png"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                            />
                                                            {product.badge && (
                                                                <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase text-lightText bg-white px-1.5 py-0.5">
                                                                    {product.badge}
                                                                </span>
                                                            )}
                                                            <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm">
                                                                <FaRegHeart className="text-xs" />
                                                            </button>
                                                        </div>
                                                        <h4 className="text-sm font-medium text-dark group-hover:text-gold transition-colors leading-snug">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-sm text-lightText mt-0.5">
                                                            ${product.variants?.[0]?.price || '0.00'}
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-lightText">No products found for "{searchQuery}"</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase mb-6 text-dark">
                                            Trending Products
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {trendingProducts && trendingProducts.length > 0 ? (
                                                trendingProducts.map((product) => (
                                                    <Link
                                                        key={product._id}
                                                        to={`/product/${product.slug}`}
                                                        onClick={() => setIsSearchOpen(false)}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="relative mb-3 bg-[#F9F9F9] aspect-[3/4] overflow-hidden">
                                                            <img
                                                                src={product.variants?.[0]?.images?.[0] || "/images/product.png"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                            />
                                                            {product.badge && (
                                                                <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase text-lightText bg-white px-1.5 py-0.5">
                                                                    {product.badge}
                                                                </span>
                                                            )}
                                                            <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm">
                                                                <FaRegHeart className="text-xs" />
                                                            </button>
                                                        </div>
                                                        <h4 className="text-sm font-medium text-dark group-hover:text-gold transition-colors leading-snug">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-sm text-lightText mt-0.5">
                                                            ${product.variants?.[0]?.price || '0.00'}
                                                        </p>
                                                    </Link>
                                                ))
                                            ) : (
                                                [1, 2, 3, 4].map((i) => (
                                                    <div key={i} className="animate-pulse">
                                                        <div className="aspect-[3/4] bg-mainBG mb-3"></div>
                                                        <div className="h-3 bg-mainBG w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-mainBG w-1/4"></div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Backdrop overlay when search is open */}
                {isSearchOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-[90]"
                        onClick={() => setIsSearchOpen(false)}
                    />
                )}
            </div>

            {/* Account Sidebar Backdrop */}
            {isAccountOpen && (
                <div
                    className="fixed inset-0 z-[80] bg-black/30"
                    onClick={() => setIsAccountOpen(false)}
                />
            )}

            {/* Account Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white z-[90] shadow-xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isAccountOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <span className="text-2xl font-bold text-dark tracking-wide">Account</span>
                    <button
                        onClick={() => setIsAccountOpen(false)}
                        className="text-dark transition-colors"
                        aria-label="Close account menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 flex flex-col px-6 pt-4">
                    {ACCOUNT_MENU.map((item) => (
                        <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setIsAccountOpen(false)}
                            className="group p-6 text-lg text-mainText font-medium hover:bg-mainBG transition-colors tracking-wide hover:ring-1 hover:ring-border flex items-center justify-between"
                        >
                            {item.label}
                            <HiArrowUpRight className='text-lightText font-bold opacity-0 group-hover:opacity-100 transition-opacity' />
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="p-6 text-lg text-mainText font-medium hover:bg-mainBG transition-colors tracking-wide hover:ring-1 hover:ring-border text-left"
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </>
    )
}




