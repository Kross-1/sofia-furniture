import { useState, useRef } from 'react';
import { useSiteData } from '../../contexts/SiteDataContext';
import { usePageContent } from '../../hooks/usePageContent';
import { Product } from '../../data/products';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
  Save,
  Image as ImageIcon,
  Upload,
  Check,
  PlusCircle,
  Video,
  GripVertical,
} from 'lucide-react';

export default function ProductsPage() {
  const { products, materials, addProduct, updateProduct, deleteProduct, addMaterial } = useSiteData();
  const { categories: homepageCategories, addProductCategory, getProductCategories } = usePageContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Refs for file inputs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    image: '',
    images: [],
    videos: [],
    material: '',
    description: '',
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        images: product.images || [],
        videos: product.videos || [],
      });
      // Parse materials from string to array
      const mats = product.material ? product.material.split(',').map(m => m.trim()) : [];
      setSelectedMaterials(mats);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: enabledCategories[0]?.name || '',
        price: 0,
        image: '',
        images: [],
        videos: [],
        material: '',
        description: '',
      });
      setSelectedMaterials([]);
    }
    setNewMaterial('');
    setShowAddMaterial(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedMaterials([]);
    setNewMaterial('');
    setShowAddMaterial(false);
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  const handleSave = () => {
    if (!formData.name || !formData.category) return;

    // Join selected materials into a string
    const materialStr = selectedMaterials.join(', ');

    const productData = {
      ...formData,
      material: materialStr,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct({
        name: formData.name || '',
        category: formData.category || '',
        price: formData.price || 0,
        image: formData.image || '',
        images: formData.images || [],
        videos: formData.videos || [],
        material: materialStr,
        description: formData.description,
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteProduct(id);
    }
  };

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const handleAddNewMaterial = () => {
    if (newMaterial.trim()) {
      addMaterial(newMaterial.trim());
      setSelectedMaterials(prev => [...prev, newMaterial.trim()]);
      setNewMaterial('');
      setShowAddMaterial(false);
    }
  };

  // Get product categories for form
  const productCategories = getProductCategories();
  const enabledCategories = productCategories.filter(c => c.enabled);

  // Add new product category
  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      const slug = newCategoryName.trim().toLowerCase().replace(/[\s,]+/g, '-').replace(/[^\w-]/g, '');
      addProductCategory({
        name: newCategoryName.trim(),
        slug: slug,
        enabled: true,
        linkedFromHomepage: false,
        order: productCategories.length + 1,
      });
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Convert blob/file to base64 with compression
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Compress image and convert to base64
  const compressImage = (file: File, maxWidth = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if too large
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with 0.8 quality or preserve PNG
          const isPng = file.type === 'image/png';
          const outputType = isPng ? 'image/png' : 'image/jpeg';
          const quality = isPng ? undefined : 0.8;

          try {
            const dataUrl = canvas.toDataURL(outputType, quality);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Main image upload
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await compressImage(file);
        setFormData({ ...formData, image: imageUrl });
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Ошибка при загрузке изображения');
      }
    }
  };

  // Multiple images upload
  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const newImages: string[] = [];
        for (const file of Array.from(files)) {
          const imageUrl = await compressImage(file, 1000);
          newImages.push(imageUrl);
        }
        setFormData({
          ...formData,
          images: [...(formData.images || []), ...newImages]
        });
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    }
  };

  // Remove additional image
  const handleRemoveAdditionalImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  // Video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newVideos: string[] = [];
      Array.from(files).forEach(file => {
        const videoUrl = URL.createObjectURL(file);
        newVideos.push(videoUrl);
      });
      setFormData({
        ...formData,
        videos: [...(formData.videos || []), ...newVideos]
      });
    }
  };

  // Add video URL
  const handleAddVideoUrl = () => {
    const url = prompt('Введите URL видео (YouTube, VK и т.д.):');
    if (url) {
      setFormData({
        ...formData,
        videos: [...(formData.videos || []), url]
      });
    }
  };

  // Remove video
  const handleRemoveVideo = (index: number) => {
    const newVideos = [...(formData.videos || [])];
    newVideos.splice(index, 1);
    setFormData({ ...formData, videos: newVideos });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Управление товарами ({products.length})
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-accent inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить товар
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-12 pr-8 appearance-none cursor-pointer"
            >
              <option value="">Все категории</option>
              {enabledCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">
                  Изображение
                </th>
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">
                  Название
                </th>
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">
                  Категория
                </th>
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">
                  Цена
                </th>
                <th className="text-right px-6 py-4 font-medium text-muted-foreground">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {(product.images?.length || 0) > 0 && (
                        <span className="text-xs text-muted-foreground">
                          +{product.images?.length}
                        </span>
                      )}
                      {(product.videos?.length || 0) > 0 && (
                        <Video className="w-4 h-4 text-sky-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{product.name}</p>
                    {product.material && (
                      <p className="text-sm text-muted-foreground">
                        {product.material}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Товары не найдены</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold">
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="Например: Диван 'Венеция'"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Категория *
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Выберите категорию</option>
                  {enabledCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {showAddCategory ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Новая категория"
                      className="input-field flex-1"
                      autoFocus
                    />
                    <button
                      onClick={handleAddNewCategory}
                      className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowAddCategory(false)}
                      className="px-3 py-2 border border-input rounded-lg hover:bg-muted"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="mt-2 flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Добавить новую категорию
                  </button>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field"
                  placeholder="0"
                />
              </div>

              {/* Materials - Multiple Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Материалы (выберите несколько)
                </label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {materials.map((material) => (
                      <label
                        key={material}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(material)}
                          onChange={() => handleMaterialToggle(material)}
                          className="w-4 h-4 rounded text-accent focus:ring-accent"
                        />
                        <span className="text-sm">{material}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Add new material */}
                {showAddMaterial ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      placeholder="Новый материал"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleAddNewMaterial}
                      className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowAddMaterial(false)}
                      className="px-3 py-2 border border-input rounded-lg hover:bg-muted"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddMaterial(true)}
                    className="mt-2 flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Добавить новый материал
                  </button>
                )}
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Главное изображение
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => mainImageInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted"
                  >
                    <Upload className="w-5 h-5" />
                    Загрузить файл
                  </button>
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="input-field flex-1"
                    placeholder="или вставьте URL изображения"
                  />
                </div>
                {formData.image && (
                  <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Additional Images Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Дополнительные изображения (можно загрузить несколько)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => additionalImagesInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted"
                  >
                    <ImageIcon className="w-5 h-5" />
                    Загрузить файлы
                  </button>
                  <input
                    ref={additionalImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                  />
                </div>
                {(formData.images && formData.images.length > 0) && (
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Additional ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveAdditionalImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Видео (можно добавить несколько)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted"
                  >
                    <Video className="w-5 h-5" />
                    Загрузить видео
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={handleAddVideoUrl}
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted"
                  >
                    Добавить URL
                  </button>
                </div>
                {(formData.videos && formData.videos.length > 0) && (
                  <div className="space-y-2">
                    {formData.videos.map((video, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Video className="w-5 h-5 text-sky-500 flex-shrink-0" />
                        <span className="text-sm truncate flex-1">{video}</span>
                        <button
                          onClick={() => handleRemoveVideo(index)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Описание товара..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="btn-accent inline-flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
