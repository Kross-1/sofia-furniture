import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSiteData } from '../contexts/SiteDataContext';
import { usePageContent } from '../hooks/usePageContent';
import ProductCard from '../components/ProductCard';
import Filter from '../components/Filter';
import MenuIcon from '../components/MenuIcon';
import { Grid3X3, List } from 'lucide-react';
import { Category } from '../data/products';

export default function CatalogPage() {
  const { products, materials } = useSiteData();
  const { getEnabledProductCategories } = usePageContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  // Filter visibility — default: open on desktop, closed on mobile
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 1024
  );

  // Get dynamic categories from usePageContent
  const categories: Category[] = getEnabledProductCategories().map((pc, index) => ({
    id: pc.slug,
    name: pc.name,
    icon: 'Grid3X3',
    sort_order: pc.order || index + 1,
  }));

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const category = categories.find((c) => c.id === categoryParam);
      if (category && !selectedCategories.includes(category.name)) {
        setSelectedCategories([category.name]);
      }
    }
  }, [searchParams, categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }

      // Material filter - check if any selected material matches
      if (selectedMaterials.length > 0 && product.material) {
        const productMaterials = product.material.split(',').map(m => m.trim().toLowerCase());
        const hasMatch = selectedMaterials.some(m =>
          productMaterials.includes(m.toLowerCase())
        );
        if (!hasMatch) {
          return false;
        }
      }

      // Price filter
      if (
        product.price < priceRange[0] ||
        product.price > priceRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategories, selectedMaterials, priceRange]);

  // Get unique materials from products for filter
  const availableMaterials = useMemo(() => {
    const materialSet = new Set<string>();
    products.forEach(p => {
      if (p.material) {
        p.material.split(',').forEach(m => materialSet.add(m.trim()));
      }
    });
    // Add all predefined materials
    materials.forEach(m => materialSet.add(m));
    return Array.from(materialSet).sort();
  }, [products, materials]);

  // Calculate price range from products
  const maxPrice = 3000000;

  const handleCategoryChange = (cats: string[]) => {
    setSelectedCategories(cats);
    // Update URL
    if (cats.length === 1) {
      const category = categories.find(c => c.name === cats[0]);
      if (category) {
        setSearchParams({ category: category.id });
        return;
      }
    }
    setSearchParams({});
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setPriceRange([0, maxPrice]);
    setSearchParams({});
  };

  return (
    <main className="pt-24 pb-16 bg-secondary min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {/* Filter toggle — same MenuIcon as in mobile header */}
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className="p-2 rounded-lg border border-border bg-card text-foreground
                  hover:bg-muted hover:border-accent/50 transition-all"
                aria-label={isFilterOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                aria-expanded={isFilterOpen}
                aria-controls="catalog-filters"
                title={isFilterOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
              >
                <MenuIcon open={isFilterOpen} className="w-6 h-6" />
              </button>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Каталог
              </h1>
            </div>
            <p className="text-muted-foreground mt-3">
              Найдено товаров: {filteredProducts.length}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters — hidden when isFilterOpen is false */}
          {isFilterOpen && (
            <aside
              id="catalog-filters"
              className="lg:w-1/4 flex-shrink-0 animate-fade-in"
            >
              <div className="lg:sticky lg:top-24">
                <Filter
                  categories={categories}
                  materials={availableMaterials}
                  selectedCategories={selectedCategories}
                  selectedMaterials={selectedMaterials}
                  priceRange={priceRange}
                  maxPrice={maxPrice}
                  onCategoryChange={handleCategoryChange}
                  onMaterialChange={setSelectedMaterials}
                  onPriceChange={setPriceRange}
                  onReset={handleReset}
                />
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className={isFilterOpen ? 'lg:w-3/4' : 'w-full'}>
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Показано {filteredProducts.length} из {products.length} товаров
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors border ${
                    viewMode === 'grid'
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-accent/40'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors border ${
                    viewMode === 'list'
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-accent/40'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? `grid grid-cols-1 md:grid-cols-2 ${isFilterOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-6`
                    : 'space-y-6'
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card text-card-foreground border border-border rounded-2xl">
                <p className="text-lg text-foreground mb-4 font-medium">
                  Товары не найдены
                </p>
                <p className="text-sm text-muted-foreground">
                  Попробуйте изменить параметры фильтра
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
