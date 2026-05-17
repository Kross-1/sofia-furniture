import { useState } from 'react';
import { Save, RotateCcw, Type, AlertTriangle, Info, MapPin, Globe } from 'lucide-react';
import { usePageContent, PageTextItem } from '../../hooks/usePageContent';

const pages = ['Общие', 'Главная', 'Каталог', 'О нас', 'Контакты', 'Заявка'];

interface DuplicateInfo {
  id: string;
  label: string;
  text: string;
  locations: string[];
}

export default function PagesPage() {
  const { texts, updateText, getTextsForPage, resetToDefaults, findDuplicateTexts } = usePageContent();
  const [selectedPage, setSelectedPage] = useState('Общие');
  const [editingItem, setEditingItem] = useState<PageTextItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);

  const handleEdit = (item: PageTextItem) => {
    setEditingItem(item);
    setEditValue(item.text);

    const duplicates = findDuplicateTexts(item.id);
    const allLocations = item.isGlobal && item.locations ? [...item.locations] : [];
    duplicates.forEach(dup => {
      if (dup.locations) {
        dup.locations.forEach(loc => {
          if (!allLocations.includes(loc)) {
            allLocations.push(loc);
          }
        });
      }
    });

    if (allLocations.length > 1) {
      setDuplicateInfo({
        id: item.id,
        label: item.label,
        text: item.text,
        locations: allLocations
      });
    } else {
      setDuplicateInfo(null);
    }
  };

  const handleSave = () => {
    if (editingItem) {
      updateText(editingItem.id, editValue);
      setEditingItem(null);
      setEditValue('');
      setDuplicateInfo(null);
      setHasChanges(true);
      setTimeout(() => setHasChanges(false), 2000);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditValue('');
    setDuplicateInfo(null);
  };

  const handleReset = () => {
    if (confirm('Вы уверены? Все изменения будут потеряны.')) {
      resetToDefaults();
      setHasChanges(false);
    }
  };

  const filteredContents = getTextsForPage(selectedPage);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Type className="w-6 h-6" />
          Текстовый редактор
        </h1>
        <p className="text-muted-foreground mt-1">Редактируйте тексты на каждой странице сайта</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => setSelectedPage(page)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              selectedPage === page
                ? 'bg-accent text-white'
                : 'bg-card text-foreground hover:bg-muted border border-border'
            }`}
          >
            {page === 'Общие' && <Globe className="w-4 h-4" />}
            {page}
          </button>
        ))}
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-semibold text-foreground">
            {selectedPage === 'Общие' ? 'Общие элементы (Шапка и Подвал)' : selectedPage}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Сброс
            </button>
          </div>
        </div>

        <div className="divide-y">
          {filteredContents.map((item, index) => (
            <div key={item.id} className="p-4 hover:bg-muted transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground/70">#{index + 1}</span>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                      {item.label}
                    </span>
                    {item.isGlobal && (
                      <span className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Глобальный
                      </span>
                    )}
                  </div>
                  <p className="text-foreground bg-muted p-3 rounded-lg border border-border">
                    {item.text}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground/70">
                    ID: {item.id}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-2 text-sm bg-accent text-white hover:bg-accent/90 rounded-lg transition-colors"
                >
                  Изменить
                </button>
              </div>
            </div>
          ))}

          {filteredContents.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Нет текстов для отображения
            </div>
          )}
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-card">
              <div>
                <h3 className="font-semibold text-foreground">Редактирование текста</h3>
                <p className="text-sm text-muted-foreground">{editingItem.label}</p>
              </div>
              <button
                onClick={handleCancel}
                className="text-muted-foreground/70 hover:text-muted-foreground text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Текст
                </label>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none bg-background text-foreground"
                  placeholder="Введите текст..."
                />
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-2">Предпросмотр</h4>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <p className="text-foreground whitespace-pre-wrap">{editValue || '...'}</p>
                </div>
              </div>

              <div className="bg-sky-500/10 dark:bg-sky-900/30 p-3 rounded-lg">
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  <strong>Селектор:</strong> <code className="bg-sky-500/15 px-1 rounded">{editingItem.htmlKey}</code>
                </p>
              </div>

              {duplicateInfo && (
                <div className="bg-amber-500/10 dark:bg-amber-900/30 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">
                        Внимание! Текст используется на нескольких страницах
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                        Изменение этого текста автоматически обновит его на всех страницах:
                      </p>
                      <div className="bg-amber-500/15 dark:bg-amber-900/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            Найдено дубликатов: {duplicateInfo.locations.length}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {duplicateInfo.locations.map((location, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                              <MapPin className="w-4 h-4" />
                              <span>{location}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-accent text-white hover:bg-accent/90 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Изменения сохранены
        </div>
      )}
    </div>
  );
}
