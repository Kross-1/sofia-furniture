import { Category } from '../data/products';
import { X } from 'lucide-react';

interface FilterProps {
  categories: Category[];
  materials: string[];
  selectedCategories: string[];
  selectedMaterials: string[];
  priceRange: [number, number];
  maxPrice: number;
  onCategoryChange: (categories: string[]) => void;
  onMaterialChange: (materials: string[]) => void;
  onPriceChange: (range: [number, number]) => void;
  onReset: () => void;
}

export default function Filter({
  categories,
  materials,
  selectedCategories,
  selectedMaterials,
  priceRange,
  maxPrice,
  onCategoryChange,
  onMaterialChange,
  onPriceChange,
  onReset,
}: FilterProps) {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const handleMaterialToggle = (material: string) => {
    if (selectedMaterials.includes(material)) {
      onMaterialChange(selectedMaterials.filter((m) => m !== material));
    } else {
      onMaterialChange([...selectedMaterials, material]);
    }
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedMaterials.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg text-foreground">Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            <X className="w-4 h-4" />
            Сбросить
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-foreground">Категория</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.name)}
                onChange={() => handleCategoryToggle(category.name)}
                className="w-4 h-4 rounded border-input text-accent focus:ring-accent bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-foreground">Цена, ₽</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) =>
                onPriceChange([Number(e.target.value), priceRange[1]])
              }
              placeholder="От"
              className="input-field"
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="flex-1">
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) =>
                onPriceChange([priceRange[0], Number(e.target.value)])
              }
              placeholder="До"
              className="input-field"
            />
          </div>
        </div>
        <input
          type="range"
          min="0"
          max={maxPrice}
          step={Math.max(1000, Math.floor(maxPrice / 20))}
          value={priceRange[1]}
          onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
          className="w-full mt-3 accent-[hsl(var(--accent))]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 ₽</span>
          <span>{maxPrice.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {/* Materials */}
      <div>
        <h4 className="font-medium mb-3 text-foreground">Материал</h4>
        <div className="space-y-2">
          {materials.map((material) => (
            <label
              key={material}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => handleMaterialToggle(material)}
                className="w-4 h-4 rounded border-input text-accent focus:ring-accent bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {material}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
