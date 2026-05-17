import { useState } from 'react';
import { usePageContent, CategoryItem } from '../../hooks/usePageContent';
import { Trash2, Plus, Edit2, Check, X, Image, Link as LinkIcon } from 'lucide-react';

const AVAILABLE_ICONS = [
  'Спальные гарнитуры.png',
  'Тв тумба.png',
  'Консоль.png',
  'Столы.png',
  'Стулья.png',
  'Холлы.png',
  'Диваны.png',
];

const getIconFilter = () => 'brightness(0) saturate(100%) invert(40%) sepia(15%) saturate(500%) hue-rotate(0deg)';

const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');

const getIconSrc = (category: CategoryItem) => {
  if (category.iconUrl && isExternalUrl(category.iconUrl)) {
    return category.iconUrl;
  }
  return `/icons/${category.iconType}`;
};

const getPreviewIconSrc = (iconType: string, customUrl?: string, useCustom?: boolean) => {
  if (useCustom && customUrl && isExternalUrl(customUrl)) {
    return customUrl;
  }
  return `/icons/${iconType}`;
};

export default function CategoryEditor() {
  const {
    categories,
    updateCategory,
    addCategory,
    deleteCategory,
    resetCategoriesToDefaults,
    syncProductCategoryFromHomepage,
    unlinkProductCategoryFromHomepage,
  } = usePageContent();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editIconType, setEditIconType] = useState('');
  const [editUseCustomIcon, setEditUseCustomIcon] = useState(false);
  const [editCustomIconUrl, setEditCustomIconUrl] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newIconType, setNewIconType] = useState(AVAILABLE_ICONS[0]);
  const [newUseCustomIcon, setNewUseCustomIcon] = useState(false);
  const [newCustomIconUrl, setNewCustomIconUrl] = useState('');

  const handleStartEdit = (category: CategoryItem) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditLink(category.link);
    setEditIconType(category.iconType);
    setEditUseCustomIcon(!!category.iconUrl && isExternalUrl(category.iconUrl));
    setEditCustomIconUrl(category.iconUrl || '');
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;

    const iconUrl = editUseCustomIcon && editCustomIconUrl.trim()
      ? editCustomIconUrl.trim()
      : undefined;

    updateCategory(editingId, {
      name: editName.trim(),
      link: editLink.trim(),
      iconType: editIconType,
      iconUrl: iconUrl,
    });

    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAddCategory = () => {
    if (!newName.trim()) return;

    const iconUrl = newUseCustomIcon && newCustomIconUrl.trim()
      ? newCustomIconUrl.trim()
      : undefined;

    const newCategory = addCategory({
      name: newName.trim(),
      link: newLink.trim() || `/catalog?category=${newName.trim().toLowerCase().replace(/ /g, '-')}`,
      iconType: newIconType,
      iconUrl: iconUrl,
      order: categories.length + 1,
    });

    syncProductCategoryFromHomepage(newCategory);

    setShowAddForm(false);
    setNewName('');
    setNewLink('');
    setNewIconType(AVAILABLE_ICONS[0]);
    setNewUseCustomIcon(false);
    setNewCustomIconUrl('');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Удалить эту категорию? Связанная категория товаров будет отключена, но не удалена.')) {
      unlinkProductCategoryFromHomepage(id);
      deleteCategory(id);
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить все категории к исходным значениям?')) {
      resetCategoriesToDefaults();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Управление категориями</h1>
          <p className="text-muted-foreground mt-1">Добавление, редактирование и удаление категорий на главной странице</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить категорию
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
          >
            Сбросить к умолчанию
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Новая категория</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Название</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Например: Кухни"
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Ссылка</label>
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="/catalog?category=kitchens"
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-foreground"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Иконка</label>

            <div className="flex gap-4 mb-3">
              <button
                type="button"
                onClick={() => setNewUseCustomIcon(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  !newUseCustomIcon
                    ? 'bg-accent text-white border-accent'
                    : 'bg-card text-muted-foreground border-input hover:bg-muted'
                }`}
              >
                <Image className="w-4 h-4" />
                Из набора
              </button>
              <button
                type="button"
                onClick={() => setNewUseCustomIcon(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  newUseCustomIcon
                    ? 'bg-accent text-white border-accent'
                    : 'bg-card text-muted-foreground border-input hover:bg-muted'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Свой URL
              </button>
            </div>

            {newUseCustomIcon ? (
              <div>
                <input
                  type="url"
                  value={newCustomIconUrl}
                  onChange={(e) => setNewCustomIconUrl(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Вставьте URL изображения иконки (PNG, JPG, SVG)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIconType(icon)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      newIconType === icon
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                    title={icon.replace('.png', '')}
                  >
                    <img
                      src={`/icons/${icon}`}
                      alt={icon.replace('.png', '')}
                      className="w-10 h-10 object-contain mx-auto"
                      style={{ filter: getIconFilter() }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
              <img
                src={getPreviewIconSrc(newIconType, newCustomIconUrl, newUseCustomIcon)}
                alt="Preview"
                className="w-10 h-10 object-contain"
                style={{ filter: getIconFilter() }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/Диваны.png';
                }}
              />
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Превью</span>
              <p className="font-medium">{newName || 'Название категории'}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Сохранить
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewUseCustomIcon(false);
                setNewCustomIconUrl('');
              }}
              className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-card text-card-foreground border border-border rounded-xl shadow-md p-6">
            {editingId === category.id ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Редактирование</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Сохранить"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Отмена"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Название</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Ссылка</label>
                    <input
                      type="text"
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Иконка</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setEditUseCustomIcon(false)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
                          !editUseCustomIcon
                            ? 'bg-accent text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Image className="w-3 h-3" />
                        Из набора
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditUseCustomIcon(true)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
                          editUseCustomIcon
                            ? 'bg-accent text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        Свой URL
                      </button>
                    </div>

                    {editUseCustomIcon ? (
                      <input
                        type="url"
                        value={editCustomIconUrl}
                        onChange={(e) => setEditCustomIconUrl(e.target.value)}
                        placeholder="https://example.com/icon.png"
                        className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-sm bg-background text-foreground"
                      />
                    ) : (
                      <div className="grid grid-cols-4 gap-1">
                        {AVAILABLE_ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setEditIconType(icon)}
                            className={`p-1.5 rounded border-2 transition-all ${
                              editIconType === icon
                                ? 'border-accent bg-accent/10'
                                : 'border-border hover:border-accent/50'
                            }`}
                            title={icon.replace('.png', '')}
                          >
                            <img
                              src={`/icons/${icon}`}
                              alt={icon.replace('.png', '')}
                              className="w-8 h-8 object-contain mx-auto"
                              style={{ filter: getIconFilter() }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={getPreviewIconSrc(editIconType, editCustomIconUrl, editUseCustomIcon)}
                      alt="Preview"
                      className="w-8 h-8 object-contain"
                      style={{ filter: getIconFilter() }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/Диваны.png';
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{editName}</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">#{category.order}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(category)}
                      className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                    <img
                      src={getIconSrc(category)}
                      alt={category.name}
                      className="w-10 h-10 object-contain"
                      style={{ filter: getIconFilter() }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/Диваны.png';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{category.link}</p>
                    {category.iconUrl && isExternalUrl(category.iconUrl) && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent mt-1">
                        <LinkIcon className="w-3 h-3" />
                        Своя иконка
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-accent/10 rounded-lg">
        <h3 className="font-semibold text-foreground mb-2">Как это работает:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- Добавленные категории автоматически появляются на главной странице в секции "Наши категории"</li>
          <li>- Можно выбрать иконку из предустановленного набора или указать свой URL изображения</li>
          <li>- При указании своего URL изображение будет загружаться напрямую с указанного адреса</li>
          <li>- Цвет и размер иконок автоматически подстраиваются под дизайн сайта</li>
          <li>- Сброс к умолчанию вернет все категории в исходное состояние</li>
        </ul>
      </div>
    </div>
  );
}
