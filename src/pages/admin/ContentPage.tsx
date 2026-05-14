import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home, FileText, Phone, Save, Image as ImageIcon, Upload, X, Link2, CheckCircle2, Film } from 'lucide-react';
import { getMediaItems, saveMediaItem, deleteMediaItem } from '../../lib/db';

type PageSection = 'home' | 'about' | 'contacts';

interface MediaItem {
  key: string;
  label: string;
  description: string;
  value: string;
  type?: 'image' | 'video';
}

const defaultBackgroundData: Record<PageSection, MediaItem[]> = {
  home: [
    { key: 'hero_background', label: 'Фон главного экрана', description: 'Изображение на фоне главной страницы. Поддерживаются JPG, PNG, WebP, GIF, SVG', value: '', type: 'image' },
    { key: 'hero_video', label: 'Видео главного экрана', description: 'Видео воспроизводится автоматически и зацикливается. Видео приоритетнее фона.', value: '', type: 'video' },
  ],
  about: [
    { key: 'about_hero', label: 'Главное фото салона', description: 'Основное фото в блоке «О нас» — автоматически подстраивается под размер блока', value: '', type: 'image' },
    { key: 'about_gallery_1', label: 'Галерея: Фото 1', description: 'Первое фото в галерее салона', value: '', type: 'image' },
    { key: 'about_gallery_2', label: 'Галерея: Фото 2', description: 'Второе фото в галерее салона', value: '', type: 'image' },
    { key: 'about_gallery_3', label: 'Галерея: Фото 3', description: 'Третье фото в галерее салона', value: '', type: 'image' },
  ],
  contacts: [
    { key: 'contacts_exterior', label: 'Фото фасада салона', description: 'Изображение наружной части салона — отображается в нижней части страницы Контакты', value: '', type: 'image' },
  ],
};

const STORAGE_KEY = 'sofia_media_items';

const loadFromStorage = (): Record<PageSection, MediaItem[]> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged: Record<PageSection, MediaItem[]> = {} as Record<PageSection, MediaItem[]>;
      (Object.keys(defaultBackgroundData) as PageSection[]).forEach((section) => {
        const defaults = defaultBackgroundData[section];
        const savedSection = parsed[section] || [];
        merged[section] = defaults.map((def) => {
          const found = savedSection.find((s: MediaItem) => s.key === def.key);
          return found ? { ...def, ...found } : def;
        });
      });
      return merged;
    }
  } catch {}
  return defaultBackgroundData;
};

const loadMediaItems = async (): Promise<Record<PageSection, MediaItem[]>> => {
  try {
    const sections: PageSection[] = ['home', 'about', 'contacts'];
    const result: Record<PageSection, MediaItem[]> = {} as Record<PageSection, MediaItem[]>;
    for (const section of sections) {
      const apiItems = await getMediaItems(section);
      const defaults = defaultBackgroundData[section];
      result[section] = defaults.map((def) => {
        const found = apiItems.find((a: any) => a.section === def.key);
        return found ? { ...def, value: found.url, type: found.type || def.type } : def;
      });
    }
    return result;
  } catch {
    return loadFromStorage();
  }
};

const sections = [
  { id: 'home' as PageSection, label: 'Главная', icon: Home },
  { id: 'about' as PageSection, label: 'О нас', icon: FileText },
  { id: 'contacts' as PageSection, label: 'Контакты', icon: Phone },
];

const fileToDataUrl = (file: File): Promise<string> => {
  return Promise.resolve('');
};

function ImageUploader({
  item,
  onChange,
  onClear,
}: {
  item: MediaItem;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setPreviewError(false);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://api.imgbb.com/1/upload?key=f99478039075afbc5c9a4b7cedeed1e3', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        onChange(result.data.url);
      } else {
        throw new Error(result.error?.message || 'Ошибка загрузки');
      }
    } catch (e) {
      console.error(e);
      setPreviewError(true);
      alert('Ошибка при загрузке: ' + e);
    }
    setIsLoading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }, [item.key]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (const itemData of items) {
      if (itemData.type.startsWith('image/')) {
        const file = itemData.getAsFile();
        if (file) {
          e.preventDefault();
          handleFile(file);
          return;
        }
      }
    }
  }, [item.key]);

  const hasValue = !!item.value;
  const isDataUrl = item.value?.startsWith('data:');
  const isUrl = item.value?.startsWith('http');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-accent" />
          {item.label}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
      </div>

      {hasValue && (
        <div
          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
            previewError ? 'border-destructive' : 'border-accent/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-accent/20 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="text-accent font-medium">Отпустите для загрузки</div>
            </div>
          )}

          {previewError ? (
            <div className="w-full h-48 bg-destructive/10 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <X className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive text-sm">Не удалось загрузить изображение</p>
                <p className="text-muted-foreground text-xs mt-1">Проверьте URL или загрузите файл</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <img
                src={item.value}
                alt={item.label}
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
              {isDataUrl ? 'Файл' : isUrl ? 'URL' : ''}
            </span>
            <button
              onClick={onClear}
              className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-md backdrop-blur-sm transition-colors"
              title="Удалить"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={`flex-1 sm:flex-none px-4 py-2.5 border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-2 font-medium ${
            isDragging
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-input hover:border-accent hover:bg-accent/5 text-muted-foreground hover:text-accent'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Загрузить файл
            </>
          )}
        </button>

        <div className="relative flex-[2]">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="url"
            value={isDataUrl ? '' : item.value}
            onChange={(e) => { setPreviewError(false); onChange(e.target.value); }}
            onPaste={handlePaste}
            className="input-field pl-10"
            placeholder="Или вставьте URL изображения..."
          />
        </div>
      </div>

      {!hasValue && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span>Перетащите изображение сюда, вставьте URL или нажмите &quot;Загрузить файл&quot;</span>
        </div>
      )}
    </div>
  );
}

function VideoUploader({
  item,
  onChange,
  onClear,
}: {
  item: MediaItem;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    alert('Прямая загрузка отключена. Используйте хостинг картинок (imgbb, postimages) и вставьте ссылку.');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleFile(file);
    }
  }, [item.key]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (const itemData of items) {
      if (itemData.type.startsWith('video/')) {
        const file = itemData.getAsFile();
        if (file) {
          e.preventDefault();
          handleFile(file);
          return;
        }
      }
    }
  }, [item.key]);

  const hasValue = !!item.value;
  const isDataUrl = item.value?.startsWith('data:');
  const isUrl = item.value?.startsWith('http');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Film className="w-4 h-4 text-accent" />
          {item.label}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
      </div>

      {hasValue && (
        <div
          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
            previewError ? 'border-destructive' : 'border-accent/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-accent/20 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="text-accent font-medium">Отпустите для загрузки</div>
            </div>
          )}

          {previewError ? (
            <div className="w-full h-48 bg-destructive/10 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <X className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive text-sm">Не удалось загрузить видео</p>
                <p className="text-muted-foreground text-xs mt-1">Проверьте URL или загрузите файл</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-black rounded-xl overflow-hidden">
              <video
                src={item.value}
                controls
                loop
                muted
                autoPlay
                className="w-full h-full object-cover"
                onError={() => setPreviewError(true)}
                onCanPlay={() => setPreviewError(false)}
              />
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
              {isDataUrl ? 'Файл' : isUrl ? 'URL' : ''}
            </span>
            <button
              onClick={onClear}
              className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-md backdrop-blur-sm transition-colors"
              title="Удалить"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={`flex-1 sm:flex-none px-4 py-2.5 border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-2 font-medium ${
            isDragging
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-input hover:border-accent hover:bg-accent/5 text-muted-foreground hover:text-accent'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Загрузить видео
            </>
          )}
        </button>

        <div className="relative flex-[2]">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="url"
            value={isDataUrl ? '' : item.value}
            onChange={(e) => { setPreviewError(false); onChange(e.target.value); }}
            onPaste={handlePaste}
            className="input-field pl-10"
            placeholder="Или вставьте URL видео..."
          />
        </div>
      </div>

      {!hasValue && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 flex items-center gap-2">
          <Film className="w-3.5 h-3.5 shrink-0" />
          <span>MP4, WebM, MOV — перетащите видео сюда, вставьте URL или нажмите &quot;Загрузить видео&quot;</span>
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = (searchParams.get('section') as PageSection) || 'home';
  const [activeSection, setActiveSection] = useState<PageSection>(initialSection);
  const [mediaItems, setMediaItems] = useState<Record<PageSection, MediaItem[]>>(defaultBackgroundData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadMediaItems().then(setMediaItems);
  }, []);

  const handleSectionChange = (section: PageSection) => {
    setActiveSection(section);
    setSearchParams({ section });
  };

  const handleUrlChange = (key: string, value: string) => {
    setMediaItems((prev) => ({
      ...prev,
      [activeSection]: prev[activeSection].map((item) =>
        item.key === key ? { ...item, value } : item
      ),
    }));
  };

  const handleClearMedia = (key: string) => {
    setMediaItems((prev) => ({
      ...prev,
      [activeSection]: prev[activeSection].map((item) =>
        item.key === key ? { ...item, value: '' } : item
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existingItems = await getMediaItems(activeSection);
      for (const item of existingItems) {
        if (item.id) {
          await deleteMediaItem(item.id);
        }
      }
      for (const item of mediaItems[activeSection]) {
        if (item.value) {
          await saveMediaItem(activeSection, item.key, item.type || 'image', item.value);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaItems));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Save error:', e);
      alert('Ошибка при сохранении: ' + e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSection = () => {
    setMediaItems((prev) => ({
      ...prev,
      [activeSection]: defaultBackgroundData[activeSection],
    }));
  };

  const currentMediaItems = mediaItems[activeSection];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Управление контентом
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Загружайте медиафайлы или указывайте ссылки — контент автоматически подстраивается под размер блока
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSection}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Сбросить раздел
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-accent inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Сохранение...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Сохранено!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-4">
            <h2 className="font-semibold mb-4 text-foreground">Страницы</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-accent text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span>{section.label}</span>
                  {section.id === 'about' && (
                    <span className="ml-auto text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                      4 фото
                    </span>
                  )}
                  {section.id === 'home' && (
                    <span className="ml-auto text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                      фото + видео
                    </span>
                  )}
                  {section.id === 'contacts' && (
                    <span className="ml-auto text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                      1 фото
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-semibold text-lg text-foreground">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {activeSection === 'about'
                  ? 'Загрузите изображения для страницы «О нас». Все изображения автоматически подстраиваются под размер блока с сохранением пропорций.'
                  : activeSection === 'home'
                  ? 'Загрузите фоновое изображение и/или видео для главной страницы. Видео воспроизводится автоматически и зацикливается.'
                  : 'Фоновое изображение для страницы контактов'}
              </p>
            </div>

            <div className="p-6 space-y-8">
              {currentMediaItems.map((item) =>
                item.type === 'video' ? (
                  <VideoUploader
                    key={item.key}
                    item={item}
                    onChange={(value) => handleUrlChange(item.key, value)}
                    onClear={() => handleClearMedia(item.key)}
                  />
                ) : (
                  <ImageUploader
                    key={item.key}
                    item={item}
                    onChange={(value) => handleUrlChange(item.key, value)}
                    onClear={() => handleClearMedia(item.key)}
                  />
                )
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-accent/5 dark:bg-accent/10 rounded-lg border border-accent/20">
            <h3 className="font-medium text-accent mb-2">Подсказки</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                Загружайте файлы или вставляйте URL (например, с Яндекс.Диска, VK, Telegram)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                Изображения: JPG, PNG, WebP, GIF, SVG — автоматически масштабируются под размер блока
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                Видео на главной: MP4, WebM, MOV — воспроизводится автоматически в цикле
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                Перетащите файл прямо на область предпросмотра для быстрой загрузки
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
