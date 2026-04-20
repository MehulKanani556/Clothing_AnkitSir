import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByCategory, fetchFilterOptions, fetchRecentlyViewed, fetchWishlist, toggleWishlist } from '../redux/slice/product.slice';
import { fetchMainCategories, fetchCategories, fetchSubCategories } from '../redux/slice/category.slice';
import Layout from '../components/Layout';
import { IoClose } from 'react-icons/io5';
import WishlistButton from '../components/WishlistButton';

// ── Skeleton card ─────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="flex flex-col bg-white animate-pulse">
        <div className="h-[450px] bg-gray-100 w-full" />
        <div className="px-4 py-4 flex flex-col gap-2">
            <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto" />
        </div>
    </div>
);

// ── Product Card ──────────────────────────────────────────────────
const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const { wishlist } = useSelector((state) => state.product);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const isWishlisted = wishlist?.some(item => (item._id || item) === product._id);

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;
        dispatch(toggleWishlist(product._id));
    };

    const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
    const image1 = defaultVariant?.images?.[0] || null;
    const image2 = defaultVariant?.images?.[1] || image1; // fallback to image1 if no second image

    const getPrice = () => {
        if (!defaultVariant) return null;
        if (defaultVariant.options?.length > 0) {
            const prices = defaultVariant.options.map(o => o.price).filter(Boolean);
            if (!prices.length) return null;
            const min = Math.min(...prices), max = Math.max(...prices);
            return min === max ? `$${min}` : `$${min} – $${max}`;
        }
        return defaultVariant.price ? `$${defaultVariant.price}` : null;
    };

    const price = getPrice();

    return (
        <Link
            to={`/product/${product.slug}`}
            className="group flex flex-col bg-white hover:bg-mainBG transition-all duration-700 hover:border-border"
        >
            <div className="relative overflow-hidden bg-white h-[450px]">
                {/* Image 1 (Initial) */}
                <div className={`w-full h-full transition-all  group-hover:bg-mainBG duration-1000 ${image2 && image1 !== image2 ? 'group-hover:opacity-0' : ''}`}>
                    {image1 ? (
                        <img
                            src={image1}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-lightText bg-[#F8F9FA]">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                        </div>
                    )}
                </div>

                {/* Image 2 (Hover) */}
                {image2 && image1 !== image2 && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <img
                            src={image2}
                            alt={product.name}
                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                        />
                    </div>
                )}

                {/* Badge (NEW etc.) - Hidden initially */}
                {product.badge && (
                    <span className="absolute top-5 left-5 text-[10px] font-bold tracking-[0.25em] uppercase text-[#6C757D] opacity-0 group-hover:opacity-100 transition-all duration-500">
                        {product.badge}
                    </span>
                )}

                {/* Wishlist Icon - Hidden initially */}
                <WishlistButton productId={product._id} />
            </div>

            <div className="px-5 py-4 flex flex-col gap-1 flex-shrink-0 bg-transparent transition-colors duration-700">
                <p className="font-medium text-[15px] leading-[22px] text-dark text-center tracking-tight truncate px-2">{product.name}</p>
                {price && (
                    <p className="font-medium text-[14px] leading-[20px] text-[#495057] text-center opacity-90">{price}</p>
                )}
            </div>
        </Link>
    );
};

// ── Pagination ────────────────────────────────────────────────────
const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages } = pagination;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== '...') pages.push('...');
    }

    return (
        <div className="flex items-center justify-center gap-1 py-10 border-t border-border">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center border border-border text-[#343A40] hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`e-${i}`} className="w-10 h-10 flex items-center justify-center text-lightText text-sm">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-10 h-10 flex items-center justify-center border text-sm font-bold transition-colors ${p === page
                            ? 'bg-primary text-white border-primary'
                            : 'border-border text-[#343A40] hover:bg-primary hover:text-white hover:border-primary'
                            }`}
                    >
                        {p}
                    </button>
                )
            )}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center border border-border text-[#343A40] hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
        </div>
    );
};

// ── Filter Section Component ──────────────────────────────────────
const FilterSection = ({ title, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-[#F1F3F5]">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-6 px-8 text-left group"
            >
                <span className="text-[12px] font-extrabold uppercase tracking-[0.3em] text-[#1B1B1B]">{title}</span>
                <span className="text-[#1B1B1B] transition-transform duration-300">
                    {open ? (
                        <svg width="12" height="2" viewBox="0 0 12 2" fill="none"><path d="M0 1H12" stroke="currentColor" strokeWidth="1.2"/></svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M0 6H12M6 0V12" stroke="currentColor" strokeWidth="1.2"/>
                        </svg>
                    )}
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-8 pb-8">{children}</div>
            </div>
        </div>
    );
};

// ── Filter Sidebar ────────────────────────────────────────────────
const FilterSidebar = ({ open, onClose, filterOptions, activeFilters, onFilterChange, onClearAll }) => {
    const [showAllCategories, setShowAllCategories] = useState(false);
    const activeCount = Object.values(activeFilters).flat().filter(Boolean).length;

    const renderItem = (type, item, isActive) => (
        <label
            key={item.name || item.key}
            onClick={() => onFilterChange(type, item.name || item.key)}
            className="flex items-center cursor-pointer group py-0.5"
        >
            <div className="w-4 flex items-center justify-center flex-shrink-0">
                {isActive && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <span className={`text-[14px] leading-tight transition-colors ${isActive ? 'text-primary font-bold' : 'text-[#495057] group-hover:text-primary'}`}>
                {item.label || item.name}
            </span>
            {item.count !== undefined && <sup className="text-[10px] text-[#ADB5BD] ml-0.5 font-medium">{item.count}</sup>}
        </label>
    );

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity duration-500 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-[450px] bg-white z-50 flex flex-col shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-7 border-b border-[#F1F3F5] flex-shrink-0">
                    <h2 className="text-[20px] font-bold text-dark tracking-tight">
                        Filters {activeCount > 0 && <sup className="text-[13px] font-medium text-[#ADB5BD] ml-1">{activeCount}</sup>}
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 hover:opacity-100 opacity-60 transition-all hover:rotate-90">
                        <IoClose size={26} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {/* AVAILABILITY */}
                    <FilterSection title="Availability" defaultOpen={true}>
                        <div className="flex flex-col gap-4">
                            {[
                                { key: 'inStock', label: 'In stock', count: filterOptions?.availability?.inStock },
                                { key: 'outOfStock', label: 'Out of stock', count: filterOptions?.availability?.outOfStock },
                            ].map(item => renderItem('availability', item, activeFilters.availability === item.key))}
                        </div>
                    </FilterSection>

                    {/* COLOR */}
                    {filterOptions?.colors?.length > 0 && (
                        <FilterSection title="Color" defaultOpen={true}>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {filterOptions.colors.map(color => {
                                    const isActive = activeFilters.colors?.includes(color.name);
                                    return (
                                        <label
                                            key={color.name}
                                            onClick={() => onFilterChange('colors', color.name)}
                                            className="flex items-center cursor-pointer group"
                                        >
                                            <div className="w-4 flex items-center justify-center flex-shrink-0">
                                                {isActive && (
                                                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                                        <path d="M1 4.5L4 7.5L10 1" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div
                                                className={`w-5 h-5 flex-shrink-0 border border-border relative`}
                                                style={{ backgroundColor: color.colorCode || color.name.toLowerCase() }}
                                            />
                                            <span className={`text-[14px] transition-colors pl-2 text-[#495057] group-hover:text-primary ${isActive ? 'text-primary font-bold' : ''}`}>
                                                {color.name}
                                            </span>
                                            {color.count !== undefined && <sup className="text-[10px] text-[#ADB5BD] ml-0.5 font-medium">{color.count}</sup>}
                                        </label>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}

                    {/* CATEGORY */}
                    {filterOptions?.categories?.length > 0 && (
                        <FilterSection title="Category" defaultOpen={true}>
                            <div className="grid grid-cols-1 gap-y-4">
                                {(showAllCategories ? filterOptions.categories : filterOptions.categories.slice(0, 6)).map(cat => 
                                    renderItem('categories', cat, activeFilters.categories?.includes(cat.name))
                                )}
                            </div>
                            {filterOptions.categories.length > 6 && (
                                <button 
                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                    className="mt-6 text-[14px] text-[#A6AEB6] hover:text-primary underline underline-offset-8 decoration-1 decoration-[#A6AEB6]/40 block text-left"
                                >
                                    {showAllCategories ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </FilterSection>
                    )}

                    {/* SIZE */}
                    {filterOptions?.sizes?.length > 0 && (
                        <FilterSection title="Size" defaultOpen={true}>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {filterOptions.sizes.map(size => renderItem('sizes', size, activeFilters.sizes?.includes(size.name)))}
                            </div>
                        </FilterSection>
                    )}

                    {/* MATERIAL */}
                    {filterOptions?.materials?.length > 0 && (
                        <FilterSection title="Material" defaultOpen={true}>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {filterOptions.materials.map(mat => renderItem('materials', mat, activeFilters.materials?.includes(mat.name)))}
                            </div>
                        </FilterSection>
                    )}
                </div>

                {/* Footer: Clear All */}
                <div className="flex-shrink-0 py-8 bg-white text-center border-t border-[#F1F3F5]">
                    <button
                        onClick={onClearAll}
                        className="text-[13px] font-extrabold uppercase tracking-[0.3em] text-[#ADB5BD] hover:text-dark transition-colors"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Main Page ─────────────────────────────────────────────────────
export default function CollectionPage() {
    const { mainCategorySlug, categorySlug, subCategorySlug } = useParams();
    const dispatch = useDispatch();

    const { collectionProducts, pagination, loading, filterOptions, recentlyViewed } = useSelector(s => s.product);
    const { mainCategories, categories, subCategories } = useSelector(s => s.category);
    const { isAuthenticated } = useSelector(s => s.auth);

    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        availability: null,
        colors: [],
        sizes: [],
        materials: [],
        categories: [],
    });
    const LIMIT = 12;

    const currentMainCat = mainCategories.find(m => m.slug === mainCategorySlug);
    const currentCat = categories.find(c => c.slug === categorySlug);
    const currentSubCat = subCategories.find(s => s.slug === subCategorySlug);

    const filteredCategories = categories.filter(c => {
        const id = typeof c.mainCategoryId === 'object' ? c.mainCategoryId?._id : c.mainCategoryId;
        return id === currentMainCat?._id;
    });

    const filteredSubCategories = subCategories.filter(s => {
        const id = typeof s.categoryId === 'object' ? s.categoryId?._id : s.categoryId;
        return id === currentCat?._id;
    });

    const activeFilterCount = [
        activeFilters.availability ? 1 : 0,
        activeFilters.colors.length,
        activeFilters.sizes.length,
        activeFilters.materials.length,
        activeFilters.categories.length,
    ].reduce((a, b) => a + b, 0);

    const fetchData = useCallback(() => {
        dispatch(fetchProductsByCategory({
            mainCategorySlug,
            categorySlug,
            subCategorySlug,
            page,
            limit: LIMIT,
            sort,
            colors: activeFilters.colors.join(','),
            sizes: activeFilters.sizes.join(','),
            materials: activeFilters.materials.join(','),
            categories: activeFilters.categories.join(','),
            availability: activeFilters.availability || undefined,
        }));
    }, [dispatch, mainCategorySlug, categorySlug, subCategorySlug, page, sort, activeFilters]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        dispatch(fetchFilterOptions({ mainCategorySlug, categorySlug, subCategorySlug }));
    }, [dispatch, mainCategorySlug, categorySlug, subCategorySlug]);

    useEffect(() => {
        if (!mainCategories.length) dispatch(fetchMainCategories());
        if (!categories.length) dispatch(fetchCategories());
        if (!subCategories.length) dispatch(fetchSubCategories());
        dispatch(fetchRecentlyViewed());
        if (isAuthenticated) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, mainCategories.length, categories.length, subCategories.length, isAuthenticated]);

    useEffect(() => {
        setPage(1);
        setActiveFilters({ availability: null, colors: [], sizes: [], materials: [], categories: [] });
    }, [mainCategorySlug, categorySlug, subCategorySlug]);

    useEffect(() => { setPage(1); }, [sort, activeFilters]);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (type, value) => {
        setActiveFilters(prev => {
            if (type === 'availability') {
                return { ...prev, availability: prev.availability === value ? null : value };
            }
            const arr = prev[type] || [];
            return {
                ...prev,
                [type]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
            };
        });
    };

    const handleClearAll = () => {
        setActiveFilters({ availability: null, colors: [], sizes: [], materials: [], categories: [] });
    };

    const pageTitle = currentSubCat?.subCategoryName
        || currentCat?.categoryName
        || currentMainCat?.mainCategoryName
        || 'Collection';

    const sortOptions = [
        { value: 'newest', label: 'New Arrivals' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'bestseller', label: 'Best Sellers' },
        { value: 'oldest', label: 'Oldest' },
    ];

    return (
        <Layout>
            <div className="flex flex-col font-sans bg-white">

                {/* ── Row 1: page title + category tabs ── */}
                <div className="border-b border-border">
                    <div className="flex items-center h-[70px] px-8 gap-6 relative">
                        <span className="font-semibold text-[18px] leading-[22px] text-primary whitespace-nowrap flex-shrink-0">
                            {pageTitle}
                        </span>
                        <div className="flex-1 flex items-center justify-center gap-8 overflow-x-auto scrollbar-hide">
                            <Link
                                to={`/collection/${mainCategorySlug}`}
                                className={`text-[14px] font-medium leading-[22px] whitespace-nowrap transition-colors flex-shrink-0 ${!categorySlug ? 'text-primary font-semibold' : 'text-lightText hover:text-[#343A40]'}`}
                            >
                                All
                            </Link>
                            {filteredCategories.map(cat => (
                                <Link
                                    key={cat._id}
                                    to={`/collection/${mainCategorySlug}/${cat.slug}`}
                                    className={`text-[14px] font-medium leading-[22px] whitespace-nowrap transition-colors flex-shrink-0 ${categorySlug === cat.slug ? 'text-primary font-semibold' : 'text-lightText hover:text-[#343A40]'}`}
                                >
                                    {cat.categoryName}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Row 2: sub-category tabs + count + FILTERS + SORT ── */}
                <div className="border-b border-border">
                    <div className="flex items-center h-[52px] px-8 gap-4 justify-between">
                        {/* Left: product count */}
                        <span className="text-[13px] font-extrabold uppercase tracking-widest text-primary whitespace-nowrap flex-shrink-0">
                            {pagination ? `${pagination.total} Products` : ''}
                        </span>

                        {/* Center: sub-category scrollable tabs */}
                        {/* <div className="flex-1 flex items-center gap-6 overflow-x-auto scrollbar-hide min-w-0 justify-center">
                            {filteredSubCategories.map(sub => (
                                <Link
                                    key={sub._id}
                                    to={`/collection/${mainCategorySlug}/${categorySlug}/${sub.slug}`}
                                    className={`text-[13px] font-extrabold uppercase tracking-wide whitespace-nowrap transition-colors flex-shrink-0 ${subCategorySlug === sub.slug ? 'text-primary' : 'text-lightText hover:text-[#343A40]'}`}
                                >
                                    {sub.subCategoryName}
                                </Link>
                            ))}
                        </div> */}

                        {/* Right: FILTERS + SORT BY */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {/* FILTERS button */}
                            <button
                                onClick={() => setFilterOpen(true)}
                                className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                            >
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="text-lightText">{activeFilterCount}</span>
                                )}
                            </button>

                            <div className="w-px h-4 bg-border" />

                            {/* SORT BY */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13px] font-extrabold uppercase tracking-widest text-lightText whitespace-nowrap">Sort by :</span>
                                <select
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                    className="text-[13px] font-extrabold text-primary bg-transparent border-none outline-none cursor-pointer uppercase tracking-widest"
                                >
                                    {sortOptions.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Product Grid ── */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: LIMIT }).map((_, i) => (
                            <div key={i} className={`border-border border-b border-r last:border-r-0 ${i % 2 === 1 ? 'lg:border-r' : ''} ${i % 4 === 3 ? 'lg:border-r-0' : ''}`}>
                                <SkeletonCard />
                            </div>
                        ))}
                    </div>
                ) : collectionProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-lightText">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <p className="text-xl font-semibold text-mainText">No products found</p>
                        <p className="text-lightText text-sm">Try adjusting your filters or check back later.</p>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="mt-2 px-6 py-2 border border-primary text-primary text-sm font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <CollectionGrid products={collectionProducts} />

                        {/* Progress and Load More Section */}
                        <div className="flex flex-col items-center justify-center py-20 gap-6 border-t border-border bg-white">
                            <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-lightText">
                                {collectionProducts.length} / {pagination?.total || 100} products
                            </span>
                            <button className="px-10 py-4 bg-gray-100 hover:bg-gray-200 text-dark text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300">
                                SHOW {Math.min(24, (pagination?.total || 100) - collectionProducts.length)} MORE
                            </button>
                        </div>

                        <Pagination pagination={pagination} onPageChange={handlePageChange} />
                    </>
                )}

                {/* ── "Past Discoveries" section ── */}
                <NewFormsSection products={recentlyViewed} />

                {/* ── Filter Sidebar ── */}
                <FilterSidebar
                    open={filterOpen}
                    onClose={() => setFilterOpen(false)}
                    filterOptions={filterOptions}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onClearAll={handleClearAll}
                />
            </div>
        </Layout>
    );
}

// ── Collection Grid ───────────────────────────────────────────────
function CollectionGrid({ products }) {
    const dispatch = useDispatch();
    const { wishlist } = useSelector((state) => state.product);
    const { isAuthenticated } = useSelector((state) => state.auth);
    if (!products.length) return null;

    const rows = [];
    let i = 0, rowIndex = 0;
    while (i < products.length) {
        const isFeatureRow = rowIndex % 3 === 1;
        const count = isFeatureRow ? 5 : 4;
        rows.push({ products: products.slice(i, i + count), isFeatureRow });
        i += count;
        rowIndex++;
    }

    return (
        <div className="w-full">
            {rows.map((row, idx) => {
                if (row.isFeatureRow && row.products.length >= 3) {
                    const [large, ...smalls] = row.products;
                    return (
                        <div key={idx} className="flex flex-col md:flex-row border-b border-[#E9ECEF]">
                            {/* Large card — left side (full width on mobile, half on desktop) */}
                            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-[#E9ECEF]">
                                <Link
                                    to={`/product/${large.slug}`}
                                    className="group flex flex-col h-full bg-white hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="relative overflow-hidden bg-[#F8F9FA] h-[450px] md:h-full">
                                        {large.variants?.[0]?.images?.[0] ? (
                                            <img
                                                src={large.variants[0].images[0]}
                                                alt={large.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[#ADB5BD]">
                                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                                            </div>
                                        )}
                                        {large.badge && (
                                            <span className="absolute top-3 left-3 bg-[#1B1B1B] text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                                                {large.badge}
                                            </span>
                                        )}
                                        {/* Wishlist Icon for large card */}
                                        <WishlistButton productId={large._id} />
                                    </div>
                                    <div className="px-4 py-[14px] flex-shrink-0">
                                        <p className="font-semibold text-[15px] leading-[22px] text-[#1B1B1B] text-center truncate">{large.name}</p>
                                    </div>
                                </Link>
                            </div>
                            {/* Right side: 2×2 grid (full width on mobile, half on desktop) */}
                            <div className="w-full md:w-1/2 grid grid-cols-2">
                                {smalls.slice(0, 4).map((product, si) => (
                                    <div key={product._id} className={`border-[#E9ECEF] ${si % 2 === 0 ? 'border-r' : ''} ${si < 2 ? 'border-b' : ''}`}>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                                {smalls.length < 4 && Array.from({ length: 4 - smalls.length }).map((_, ei) => (
                                    <div key={`fe-${ei}`} className="bg-[#1B1B1B] h-[450px]" />
                                ))}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={idx} className="grid grid-cols-2 md:grid-cols-4 border-b border-border">
                        {row.products.map((product, pi) => (
                            <div key={product._id} className={`border-border border-r last:border-r-0 ${pi % 2 === 1 ? 'md:border-r' : ''} ${pi % 4 === 3 ? 'md:border-r-0' : ''}`}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                        {row.products.length < 4 && Array.from({ length: 4 - row.products.length }).map((_, ei) => {
                            const pi = row.products.length + ei;
                            return (
                                <div key={`re-${ei}`} className={`h-[450px] border-border border-r last:border-r-0 ${pi % 2 === 1 ? 'md:border-r' : ''} ${pi % 4 === 3 ? 'md:border-r-0' : ''}`} />
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

// ── "Past Discoveries" section ───────────────────────────
function NewFormsSection({ products }) {
    if (!products || products.length === 0) return null;
    const featured = products.slice(0, 4);

    return (
        <section className="flex flex-col items-center bg-white overflow-hidden">
            <div className="w-full flex flex-col items-center gap-4 py-24 px-8 text-center border-t border-border">
                <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-dark">
                    THE ARCHIVE OF YOUR SEARCH
                </p>
                <h2 className="font-bold uppercase text-primary leading-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                    PAST DISCOVERIES
                </h2>
                <p className="font-medium text-[14px] md:text-[16px] text-lightText max-w-2xl leading-relaxed">
                    Don't let a favorite piece slip away. Re-access your latest searches and pick up your exploration exactly where you left off.
                </p>
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 border-t border-border">
                {featured.map((product, pi) => (
                    <div key={product._id} className={`border-border border-b border-r last:border-r-0 ${pi % 2 === 1 ? 'md:border-r' : ''} ${pi % 4 === 3 ? 'md:border-r-0' : ''}`}>
                        <ProductCard product={product} />
                    </div>
                ))}
                {featured.length < 4 && Array.from({ length: 4 - featured.length }).map((_, ei) => {
                    const pi = featured.length + ei;
                    return (
                        <div key={`nf-${ei}`} className={`bg-[#1B1B1B] h-[450px] border-border border-b border-r last:border-r-0 ${pi % 2 === 1 ? 'md:border-r' : ''} ${pi % 4 === 3 ? 'md:border-r-0' : ''}`} />
                    );
                })}
            </div>
        </section>
    );
}
