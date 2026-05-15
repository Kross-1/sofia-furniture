import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSiteData } from '../../contexts/SiteDataContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { Save, AlertCircle, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { getSiteSettings, saveSiteSetting } from '../../lib/db';

export default function SettingsPage() {
  const { user, isDeveloper, updateUser } = useAuth();
  const { resetData } = useSiteData();
  const { addChangeLog } = useAnalytics();

  const [siteName, setSiteName] = useState('Мебельный салон "Сафия"');
  const [siteDescription, setSiteDescription] = useState(
    'Мебельный салон в Махачкале. Широкий ассортимент мебели и ковров.'
  );
  const [contactEmail, setContactEmail] = useState('info@sofia.ru');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password change fields
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await getSiteSettings();
        const nameSetting = settings.find((s: any) => s.key === 'site_name');
        if (nameSetting) setSiteName(nameSetting.value);
        
        const descSetting = settings.find((s: any) => s.key === 'site_description');
        if (descSetting) setSiteDescription(descSetting.value);

        const emailSetting = settings.find((s: any) => s.key === 'contact_email');
        if (emailSetting) setContactEmail(emailSetting.value);
      } catch {
        const savedEmail = localStorage.getItem('sofia_contact_email');
        if (savedEmail) setContactEmail(savedEmail);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        throw new Error('Некорректный формат email');
      }
      await saveSiteSetting('site_name', siteName);
      await saveSiteSetting('site_description', siteDescription);
      await saveSiteSetting('contact_email', contactEmail);
      localStorage.setItem('sofia_contact_email', contactEmail);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setSaveError(e.message || 'Не удалось сохранить');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Вы уверены? Это удалит ВСЕ данные без возможности восстановления!')) {
      if (confirm('ПОДТВЕРДИТЕ окончательное удаление всех данных!')) {
        resetData();
        addChangeLog(user!.email, 'Сброс данных', 'Все данные сброшены к значениям по умолчанию');
        alert('Данные сброшены к значениям по умолчанию.');
      }
    }
  };

  const handlePasswordChange = () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Пароль должен быть не менее 4 символов');
      return;
    }

    if (user && user.password !== currentPassword) {
      setPasswordError('Неверный текущий пароль');
      return;
    }

    updateUser(user!.id, { password: newPassword });
    addChangeLog(user!.email, 'Смена пароля', 'Пароль успешно изменён');

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground mb-6">
        Настройки сайта
      </h1>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-emerald-700 dark:text-emerald-300">Настройки сохранены!</p>
        </div>
      )}

      {saveError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{saveError}</p>
        </div>
      )}

      {passwordSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-emerald-700 dark:text-emerald-300">Пароль успешно изменён!</p>
        </div>
      )}

      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6 space-y-6">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Название сайта</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="input-field max-w-xl"
          />
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Описание сайта (SEO)
          </label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            className="input-field resize-none max-w-xl"
            rows={3}
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email для уведомлений</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="input-field max-w-xl"
          />
        </div>

        {/* Developer Only Section - Password Change */}
        {isDeveloper && (
          <>
            <hr className="border-border" />

            <div>
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Смена пароля
              </h2>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  Изменить пароль
                </button>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">Текущий пароль</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Новый пароль</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Подтвердите пароль</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-destructive text-sm">{passwordError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm"
                    >
                      Сохранить пароль
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                      }}
                      className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Developer Only Section - Reset Data */}
        {isDeveloper && (
          <>
            <hr className="border-border" />

            <div>
              <h2 className="font-semibold text-destructive mb-4">Опасная зона (только разработчик)</h2>
              <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Сбросить все данные</p>
                    <p className="text-sm text-destructive mt-1">
                      Это действие удалит все товары, контент и заявки. Восстановление будет невозможно.
                    </p>
                    <button
                      onClick={handleResetData}
                      className="mt-3 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                    >
                      Сбросить все данные
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
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
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить настройки
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
