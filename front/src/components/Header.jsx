import { useState, useEffect } from 'react'
import { CgProfile } from "react-icons/cg";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { LuSearch } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategories, fetchCategories, fetchSubCategories } from '../redux/slice/category.slice';
import { logout } from '../redux/slice/auth.slice';
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
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { mainCategories, categories, subCategories } = useSelector((state) => state.category);
    const { user } = useSelector((state) => state.auth);

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

    const popularSearches = [
        'Leather clothing',
        'Sculptural Cross-body Bags',
        'Oxford Shoes',
        'Vitamin C Brightening Elixirs'
    ];

    const suggestions = [
        'Barbana bag',
        'Gifts for her',
        'Gifts for him',
        "Men's new arrivals",
        "Women's new arrivals"
    ];

    return (
        <div className="font-sans">
            {/* Main Header Container - Fixed at top */}
            <div className={`fixed top-0 left-0 w-full z-50 transition-shadow duration-300 ${isScrolled || hoveredCategory ? 'shadow-md' : ''}`}>
                {/* Promo Bar */}
                <div className={`hidden md:block border-b transition-colors duration-300 ${isScrolled || hoveredCategory ? 'bg-primary border-primary/10' : 'bg-primary border-white/5'}`}>
                    <p className='text-white text-center text-[10px] sm:text-xs py-2 font-medium tracking-[0.25em] opacity-80 uppercase'>
                        Orders over $250 ship free | Extended returns available through Jun 15.
                    </p>
                </div>
                {/* Header Content */}
                <header className={`transition-colors duration-300 ${isHomePage
                    ? (isScrolled || hoveredCategory ? 'bg-white text-dark border-b border-border' : 'bg-transparent text-white')
                    : 'bg-white text-dark'
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
                                        <span className='capitalize'>{user?.firstName}</span>
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
                            className="hidden lg:block absolute top-[64px] left-0 w-full h-[20px] z-40"
                            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        />
                        <div
                            className="hidden lg:block absolute top-[90px] left-0 w-full bg-white text-dark z-50"
                            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            {mainCategories.map((mainCategory) => {
                                if (mainCategory._id !== hoveredCategory) return null;

                                const menuContent = getMegaMenuContent(mainCategory);
                                const categoryList = getCategoriesForMainCategory(mainCategory._id);

                                return (
                                    <div key={mainCategory._id} className="container mx-auto px-10 py-12">
                                        {categoryList.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-4">
                                                {/* Categories Columns */}
                                                <div className="col-span-3 grid grid-cols-3 gap-4">
                                                    {categoryList.map((category) => {
                                                        const subCats = getSubCategoriesForCategory(category._id);
                                                        return (
                                                            <div key={category._id}>
                                                                <h3 className="text-sm font-bold tracking-wider uppercase mb-1 text-primary">
                                                                    {category.categoryName}
                                                                </h3>
                                                                {subCats.length > 0 ? (
                                                                    <ul className="">
                                                                        {subCats.map((subCat) => (
                                                                            <li key={subCat._id}>
                                                                                <Link
                                                                                    to={`/collection/${mainCategory.slug}/${category.slug}/${subCat.slug}`}
                                                                                    className="text-sm font-medium text-mainText hover:text-gold transition-colors duration-200"
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

                                                {/* Featured Section */}
                                                <div className="col-span-1">
                                                    <div className="relative group cursor-pointer">
                                                        <img
                                                            src={menuContent.featuredImage}
                                                            alt={menuContent.featuredTitle}
                                                            className="w-full h-64 object-cover"
                                                        />
                                                        <div className="mt-4">
                                                            <Link
                                                                to={menuContent.featuredLink}
                                                                className="text-xs font-bold tracking-wider uppercase text-dark/80 hover:text-primary transition-colors flex items-center gap-2"
                                                            >
                                                                {menuContent.featuredTitle}
                                                                <span className="text-lg">→</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
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
                    <div className="fixed top-[120px] left-0 w-full bg-white z-[100] shadow-2xl max-h-[60vh] overflow-y-auto">
                        <div className="container mx-auto px-10 py-8">
                            {/* Search Header */}
                            <div className="flex items-center justify-between pb-6 border-b border-border">
                                <div className="flex-1 flex items-center gap-4">
                                    <LuSearch className="text-2xl text-mainText" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search our global archive for objects of rarity."
                                        className="flex-1 text-lg text-mainText placeholder:text-lightText outline-none bg-transparent"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="p-2 hover:bg-mainBG rounded-full transition-colors"
                                >
                                    <IoClose className="text-2xl text-mainText" />
                                </button>
                            </div>

                            {/* Search Content */}
                            <div className="py-8">
                                <div className="grid grid-cols-4 gap-12">
                                    {/* Left Column - Searches */}
                                    <div className="col-span-1 space-y-8">
                                        {/* Popular Searches */}
                                        <div>
                                            <h3 className="text-xs font-bold tracking-wider uppercase mb-4 text-dark/80">
                                                POPULAR SEARCHES
                                            </h3>
                                            <ul className="space-y-2.5">
                                                {popularSearches.map((search, index) => (
                                                    <li key={index}>
                                                        <Link
                                                            to={`/search?q=${encodeURIComponent(search)}`}
                                                            className="text-sm text-mainText hover:text-primary transition-colors duration-200"
                                                        >
                                                            {search}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Suggestions */}
                                        <div>
                                            <h3 className="text-xs font-bold tracking-wider uppercase mb-4 text-dark/80">
                                                SUGGESTIONS
                                            </h3>
                                            <ul className="space-y-2.5">
                                                {suggestions.map((suggestion, index) => (
                                                    <li key={index}>
                                                        <Link
                                                            to={`/search?q=${encodeURIComponent(suggestion)}`}
                                                            className="text-sm text-mainText hover:text-primary transition-colors duration-200"
                                                        >
                                                            {suggestion}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Right Column - Trending Products */}
                                    <div className="col-span-3">
                                        <h3 className="text-xs font-bold tracking-wider uppercase mb-6 text-dark/80">
                                            TRENDING PRODUCTS
                                        </h3>
                                        <div className="grid grid-cols-4 gap-6">
                                            {/* Mock trending products - replace with actual data */}
                                            {[1, 2, 3, 4].map((item) => (
                                                <div key={item} className="group cursor-pointer">
                                                    <div className="relative mb-3 bg-mainBG aspect-square overflow-hidden">
                                                        <img
                                                            src="/images/product.png"
                                                            alt="Product"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <FaRegHeart className="text-sm" />
                                                        </button>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-mainText mb-1">
                                                        Product Name {item}
                                                    </h4>
                                                    <p className="text-sm text-lightText">$XXX</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Backdrop overlay when search is open */}
                {isSearchOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-[90]"
                        onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                        }}
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
                className={`fixed top-0 right-0 h-full w-96 bg-white z-[90] shadow-xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isAccountOpen ? 'translate-x-0' : 'translate-x-full'
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
        </div>
    )
}




