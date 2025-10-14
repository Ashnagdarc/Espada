"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const topCategories = [
  "NEW",
  "BEST SELLERS",
  "T-SHIRTS",
  "POLO SHIRTS",
  "SHORTS",
  "JACKETS",
];

// Product interface for type safety
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  colors: Array<{ name: string; value: string }>;
  sizes: string[];
  inStock: boolean;
  collection: string;
  tags: string[];
  rating: number;
  stock: number;
}

// Interface for API product data
interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  images?: string[];
  category: string;
  colors?: Array<{ name: string; value: string }>;
  sizes?: string[];
  stock: number;
  featured?: boolean;
  rating?: number;
}

const priceRanges = [
  { label: "$0 - $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200+", min: 200, max: Infinity },
];

const ratings = [5, 4, 3, 2, 1];

// Loading component for Suspense fallback
function ProductsPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-label-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Loading products...
          </span>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main products component that uses useSearchParams
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("NEW");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  // Collapsible filter states
  const [isAvailabilityCollapsed, setIsAvailabilityCollapsed] = useState(false);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  const [isColorsCollapsed, setIsColorsCollapsed] = useState(false);
  const [isCollectionsCollapsed, setIsCollectionsCollapsed] = useState(false);
  const [isPriceRangeCollapsed, setIsPriceRangeCollapsed] = useState(false);
  const [isTagsCollapsed, setIsTagsCollapsed] = useState(false);
  const [isRatingsCollapsed, setIsRatingsCollapsed] = useState(false);
  const [isSizesCollapsed, setIsSizesCollapsed] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAvailable, setShowAvailable] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  // Dynamic filter extraction from products
  const getAvailableSizes = () => {
    const allSizes = products.flatMap(product => product.sizes || []);
    return [...new Set(allSizes)].sort();
  };

  const getAvailableColors = () => {
    const allColors = products.flatMap(product => product.colors || []);
    const uniqueColors = allColors.reduce((acc, color) => {
      if (!acc.find(c => c.name === color.name)) {
        acc.push(color);
      }
      return acc;
    }, [] as Array<{ name: string; value: string }>);
    return uniqueColors;
  };

  const getAvailableCollections = () => {
    const allCollections = products.map(product => product.collection).filter(Boolean);
    return [...new Set(allCollections)].sort();
  };

  const getAvailableTags = () => {
    const allTags = products.flatMap(product => product.tags || []);
    return [...new Set(allTags)].sort();
  };

  // Get dynamic filter arrays (calculated after products are loaded)
  const sizes = products.length > 0 ? getAvailableSizes() : [];
  const colors = products.length > 0 ? getAvailableColors() : [];
  const collections = products.length > 0 ? getAvailableCollections() : [];
  const tags = products.length > 0 ? getAvailableTags() : [];

  // Handle URL search parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Fetch products from API
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/products", {
          signal: controller.signal,
          cache: "no-store",
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform admin products to match shop format
        const transformedProducts = data.map((product: ApiProduct) => ({
          ...product,
          image: product.images?.[0] || "/images/placeholder.jpg", // Use first image
          inStock: product.stock > 0,
          collection: product.category || "General",
          tags: product.featured ? ["Featured"] : [],
          rating: product.rating || 4.5, // Default rating
          sizes: product.sizes || ["S", "M", "L", "XL"], // Default sizes if not provided
          colors: product.colors || [{ name: "Default", value: "#000000" }], // Default color
        }));
        
        if (isMounted) {
          setProducts(transformedProducts);
        }
      } catch (error) {
        // Ignore abort errors triggered by unmount/navigation/HMR in dev
        if ((error as any)?.name === "AbortError") {
          return;
        }
        console.error("Error fetching products:", error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Failed to load products");
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
      if (!controller.signal.aborted) {
        // Provide an abort reason to avoid noisy logs in some runtimes
        try {
          controller.abort("unmount");
        } catch {
          // Fallback for environments without reason support
          controller.abort();
        }
      }
    };
  }, []);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const togglePriceRange = (rangeLabel: string) => {
    setSelectedPriceRange((prev) =>
      prev.includes(rangeLabel)
        ? prev.filter((r) => r !== rangeLabel)
        : [...prev, rangeLabel]
    );
  };

  const toggleCollection = (collection: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle functions for collapsible sections
  const toggleAvailabilityCollapse = () =>
    setIsAvailabilityCollapsed((prev) => !prev);
  const toggleCategoryCollapse = () => setIsCategoryCollapsed((prev) => !prev);
  const toggleColorsCollapse = () => setIsColorsCollapsed((prev) => !prev);
  const toggleCollectionsCollapse = () =>
    setIsCollectionsCollapsed((prev) => !prev);
  const togglePriceRangeCollapse = () =>
    setIsPriceRangeCollapsed((prev) => !prev);
  const toggleTagsCollapse = () => setIsTagsCollapsed((prev) => !prev);
  const toggleRatingsCollapse = () => setIsRatingsCollapsed((prev) => !prev);
  const toggleSizesCollapse = () => setIsSizesCollapsed((prev) => !prev);

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setSelectedPriceRange([]);
    setSelectedCollections([]);
    setSelectedTags([]);
    setSelectedRatings([]);
    setActiveCategory("NEW");
    setSearchQuery("");
    setShowAvailable(true);
    setShowOutOfStock(false);
  };

  // Calculate dynamic counts for filters
  const getAvailableCount = () => products.filter(p => p.inStock).length;
  const getOutOfStockCount = () => products.filter(p => !p.inStock).length;
  
  const getCategoryCount = (category: string) => 
    products.filter(p => p.category === category).length;
  
  const getPriceRangeCount = (rangeLabel: string) => {
    const range = priceRanges.find(r => r.label === rangeLabel);
    if (!range) return 0;
    return products.filter(p => 
      p.price >= range.min && (range.max === Infinity || p.price <= range.max)
    ).length;
  };
  
  const getCollectionCount = (collection: string) =>
    products.filter(p => p.collection === collection).length;
  
  const getTagCount = (tag: string) =>
    products.filter(p => p.tags?.includes(tag)).length;
  
  const getSizeCount = (size: string) =>
    products.filter(p => p.sizes?.includes(size)).length;

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedCategories.length > 0 ||
    selectedPriceRange.length > 0 ||
    selectedCollections.length > 0 ||
    selectedTags.length > 0 ||
    selectedRatings.length > 0 ||
    activeCategory !== "NEW" ||
    searchQuery !== "" ||
    !showAvailable ||
    showOutOfStock;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="px-8 py-6 border-b border-separator bg-fill-secondary">
        <div className="flex items-center gap-2 text-sm text-label-tertiary">
          <span className="font-medium">Home</span>
          <span className="text-label-quaternary">/</span>
          <span className="text-label-primary font-semibold">Shop</span>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden px-8 py-4 border-b border-separator bg-background">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-2 bg-fill-secondary hover:bg-fill-tertiary rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-label-primary" />
          <span
            className="text-sm font-medium text-label-primary"
            style={{ fontFamily: "Gilroy, sans-serif" }}
          >
            Filters
          </span>
        </button>
      </div>

      <div className="flex">
        {/* Mobile Filter Backdrop */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        {/* Filters Sidebar */}
        <div
          className={`
          w-80 bg-background border-r border-separator p-8 overflow-y-auto
          lg:relative lg:translate-x-0 lg:block
          ${
            showMobileFilters
              ? "fixed top-0 left-0 h-full z-50 translate-x-0"
              : "hidden lg:block"
          }
          transition-transform duration-300 ease-in-out
        `}
        >
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-2xl font-bold text-label-primary"
              style={{ fontFamily: "Gilroy, sans-serif" }}
            >
              Filters
            </h2>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-label-tertiary hover:text-label-primary transition-colors underline"
                  style={{ fontFamily: "Gilroy, sans-serif" }}
                >
                  Clear All
                </button>
              )}
              {/* Mobile Close Button */}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="lg:hidden p-2 hover:bg-fill-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-label-primary" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4 text-label-primary"
              style={{ fontFamily: "Gilroy, sans-serif" }}
            >
              Search
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-separator rounded-xl bg-background text-label-primary placeholder-label-tertiary focus:outline-none focus:ring-2 focus:ring-label-primary focus:border-transparent transition-all"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-label-tertiary" />
            </div>
          </div>

          {/* Size Filter */}
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-4 text-label-primary"
              style={{ fontFamily: "Gilroy, sans-serif" }}
            >
              Size
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`h-11 min-w-[44px] border border-separator rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedSizes.includes(size)
                      ? "bg-label-primary text-background border-label-primary shadow-sm"
                      : "bg-background text-label-secondary hover:border-label-tertiary hover:shadow-sm"
                  }`}
                  style={{ fontFamily: "Gilroy, sans-serif" }}
                  title={`${size} (${getSizeCount(size)} products)`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={toggleAvailabilityCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Availability
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isAvailabilityCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`space-y-4 transition-all duration-300 overflow-hidden ${
                isAvailabilityCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-96 opacity-100"
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailable}
                  onChange={(e) => setShowAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-label-secondary">
                  Available
                </span>
                <span className="text-sm text-label-quaternary ml-auto">
                  ({getAvailableCount()})
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                  className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-label-secondary">
                  Out Of Stock
                </span>
                <span className="text-sm text-label-quaternary ml-auto">
                  ({getOutOfStockCount()})
                </span>
              </label>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={toggleCategoryCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Category
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isCategoryCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`space-y-3 transition-all duration-300 overflow-hidden ${
                isCategoryCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-96 opacity-100"
              }`}
            >
              {["T-SHIRTS", "POLO SHIRTS", "SHORTS", "JACKETS"].map(
                (category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                    />
                    <span className="text-sm font-medium text-label-secondary">
                      {category}
                    </span>
                    <span className="text-sm text-label-quaternary ml-auto">
                      ({getCategoryCount(category)})
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={toggleColorsCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Colors
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isColorsCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`grid grid-cols-3 gap-3 transition-all duration-300 overflow-hidden ${
                isColorsCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
              }`}
            >
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`relative h-11 min-w-[44px] rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedColors.includes(color.name)
                      ? "border-label-primary shadow-md"
                      : "border-separator hover:border-label-tertiary"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColors.includes(color.name) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-3 h-3 bg-label-primary rounded-full"
                        style={{
                          backgroundColor:
                            color.value === "#FFFFFF" ? "#000000" : "#FFFFFF",
                        }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={togglePriceRangeCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Price Range
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isPriceRangeCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`space-y-3 transition-all duration-300 overflow-hidden ${
                isPriceRangeCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-96 opacity-100"
              }`}
            >
              {priceRanges.map((range) => (
                <label
                  key={range.label}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedPriceRange.includes(range.label)}
                    onChange={() => togglePriceRange(range.label)}
                    className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                  />
                  <span
                    className="text-label-secondary group-hover:text-label-primary transition-colors"
                    style={{ fontFamily: "Gilroy, sans-serif" }}
                  >
                    {range.label}
                  </span>
                  <span className="text-sm text-label-quaternary ml-auto">
                    ({getPriceRangeCount(range.label)})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Collections Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={toggleCollectionsCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Collections
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isCollectionsCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`space-y-3 transition-all duration-300 overflow-hidden ${
                isCollectionsCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-96 opacity-100"
              }`}
            >
              {collections.map((collection) => (
                <label
                  key={collection}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(collection)}
                    onChange={() => toggleCollection(collection)}
                    className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                  />
                  <span
                    className="text-label-secondary group-hover:text-label-primary transition-colors"
                    style={{ fontFamily: "Gilroy, sans-serif" }}
                  >
                    {collection}
                  </span>
                  <span className="text-sm text-label-quaternary ml-auto">
                    ({getCollectionCount(collection)})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={toggleTagsCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Tags
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isTagsCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`flex flex-wrap gap-2 transition-all duration-300 overflow-hidden ${
                isTagsCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
              }`}
            >
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? "bg-label-primary text-background"
                      : "bg-fill-tertiary text-label-secondary hover:bg-fill-secondary hover:text-label-primary"
                  }`}
                  style={{ fontFamily: "Gilroy, sans-serif" }}
                >
                  {tag} ({getTagCount(tag)})
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={toggleSizesCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Sizes
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isSizesCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`grid grid-cols-4 gap-2 transition-all duration-300 overflow-hidden ${
                isSizesCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
              }`}
            >
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`h-11 min-w-[44px] rounded-lg border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    selectedSizes.includes(size)
                      ? "border-label-primary bg-label-primary text-background"
                      : "border-separator text-label-secondary hover:border-label-tertiary hover:text-label-primary"
                  }`}
                  style={{ fontFamily: "Gilroy, sans-serif" }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings Filter */}
          <div className="mb-8">
            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={toggleRatingsCollapse}
            >
              <h3
                className="text-lg font-semibold text-label-primary"
                style={{ fontFamily: "Gilroy, sans-serif" }}
              >
                Ratings
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-label-quaternary transition-transform duration-200 ${
                  isRatingsCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
            <div
              className={`space-y-3 transition-all duration-300 overflow-hidden ${
                isRatingsCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-96 opacity-100"
              }`}
            >
              {ratings.map((rating) => (
                <label
                  key={rating}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(rating)}
                    onChange={() => toggleRating(rating)}
                    className="w-5 h-5 rounded border-separator text-label-primary focus:ring-label-primary focus:ring-2 focus:ring-offset-0 transition-colors"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating ? "text-yellow-400" : "text-separator"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span
                      className="text-label-secondary group-hover:text-label-primary transition-colors"
                      style={{ fontFamily: "Gilroy, sans-serif" }}
                    >
                      {rating} star{rating !== 1 ? "s" : ""} & up
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 bg-background">
          {/* Page Title */}
          <h1
            className="text-4xl font-bold mb-8 text-label-primary"
            style={{ fontFamily: "Gilroy, sans-serif" }}
          >
            SHOP
          </h1>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-label-quaternary" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border border-separator rounded-xl bg-fill-secondary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-label-primary focus:border-transparent focus:bg-background transition-all duration-200 text-label-primary placeholder:text-label-quaternary"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {topCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 min-h-[44px] rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-label-primary text-background shadow-md"
                    : "bg-fill-secondary text-label-secondary hover:bg-fill-tertiary hover:shadow-sm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-fill-secondary rounded-lg h-80 mb-4"></div>
                  <div className="bg-fill-secondary rounded h-4 mb-2"></div>
                  <div className="bg-fill-secondary rounded h-4 w-2/3"></div>
                </div>
              ))
            ) : error ? (
              // Error state
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-xl font-semibold text-label-primary mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-label-secondary mb-4 text-center max-w-md">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-label-primary text-background rounded-lg hover:bg-opacity-90 transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              // Empty state
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-xl font-semibold text-label-primary mb-2">
                  No products found
                </h3>
                <p className="text-label-secondary text-center max-w-md">
                  We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              products
                  .filter((product) => {
                    // Enhanced search across name, description, and category
                    const searchLower = searchQuery.toLowerCase();
                    const matchesSearch = searchQuery === "" || 
                      product.name.toLowerCase().includes(searchLower) ||
                      product.description.toLowerCase().includes(searchLower) ||
                      product.category.toLowerCase().includes(searchLower);
                    
                    // Category filter - check both top tabs and sidebar checkboxes
                    const matchesTopCategory =
                      activeCategory === "NEW" ||
                      product.category === activeCategory;
                    const matchesSidebarCategory =
                      selectedCategories.length === 0 ||
                      selectedCategories.includes(product.category);
                    const matchesCategory = matchesTopCategory && matchesSidebarCategory;

                    // Availability filter - use showAvailable and showOutOfStock
                    const matchesAvailability =
                      (showAvailable && product.inStock) ||
                      (showOutOfStock && !product.inStock);

                    // Size filter
                    const matchesSize =
                      selectedSizes.length === 0 ||
                      selectedSizes.some((size) => product.sizes?.includes(size));

                    // Color filter
                    const matchesColor =
                      selectedColors.length === 0 ||
                      selectedColors.some((color) => {
                        return product.colors?.some(
                          (productColor) => productColor.name === color
                        );
                      });

                    // Price range filter
                    const matchesPrice =
                      selectedPriceRange.length === 0 ||
                      selectedPriceRange.some((rangeLabel) => {
                        const range = priceRanges.find(
                          (r) => r.label === rangeLabel
                        );
                        if (!range) return false;
                        return (
                          product.price >= range.min &&
                          (range.max === Infinity || product.price <= range.max)
                        );
                      });

                    // Collections filter
                    const matchesCollection =
                      selectedCollections.length === 0 ||
                      selectedCollections.includes(product.collection);

                    // Tags filter
                    const matchesTag =
                      selectedTags.length === 0 ||
                      selectedTags.some((tag) => product.tags?.includes(tag));

                    // Ratings filter
                    const matchesRating =
                      selectedRatings.length === 0 ||
                      selectedRatings.some((rating) => {
                        return product.rating >= rating;
                      });

                    return (
                      matchesSearch &&
                      matchesCategory &&
                      matchesAvailability &&
                      matchesSize &&
                      matchesColor &&
                      matchesPrice &&
                      matchesCollection &&
                      matchesTag &&
                      matchesRating
                    );
                  })
                  .map((product) => {
                    // Transform product data to match ProductCard interface
                    const productCardData = {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      colors: product.colors || [],
                    };

                    return (
                      <ProductCard
                        key={product.id}
                        product={productCardData}
                        layout="grid"
                      />
                    );
                  })
            )}
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </ErrorBoundary>
  );
}

// Main export with Suspense wrapper
export default function ProductsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ProductsPageLoading />}>
        <ProductsPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}
