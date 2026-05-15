import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import {
  Eye,
  Phone,
  Edit3,
  Clock,
  MapPin,
  User,
  Trash2,
  Download,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

type TabType = 'visitors' | 'phone-clicks' | 'change-log';

export default function AnalyticsPage() {
  const { isDeveloper } = useAuth();
  const { analytics, clearAnalytics } = useAnalytics();
  const [activeTab, setActiveTab] = useState<TabType>('visitors');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [serverVisits, setServerVisits] = useState<any[]>([]);
  const [serverClicks, setServerClicks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch data directly from server on mount and every 30 seconds
  useEffect(() => {
    const loadServerData = async () => {
      setIsLoading(true);
      try {
        const [visitsRes, clicksRes] = await Promise.all([
          fetch('/api/db?table=Analytics&type=visit&limit=2000'),
          fetch('/api/db?table=Analytics&type=phone-click&limit=1000'),
        ]);
        
        if (visitsRes.ok) {
          const visits = await visitsRes.json();
          console.log('[Analytics] Received visits:', visits);
          setServerVisits(visits.map((v: any) => ({
            id: v.id,
            timestamp: v.createdAt,
            page: v.page || 'Unknown',
            referrer: v.referrer,
            userAgent: v.userAgent,
          })));
        }
        
        if (clicksRes.ok) {
          const clicks = await clicksRes.json();
          console.log('[Analytics] Received clicks:', clicks);
          setServerClicks(clicks.map((c: any) => ({
            id: c.id,
            timestamp: c.createdAt,
            phoneNumber: c.phoneNumber,
            page: c.page,
          })));
        }
      } catch (e) {
        console.error('Failed to load analytics from server:', e);
      } finally {
        setIsLoading(false);
        setLastUpdated(new Date());
      }
    };
    loadServerData();
    const interval = setInterval(loadServerData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filterByDate = <T extends { timestamp: string }>(items: T[]): T[] => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case 'today':
        return items.filter((item) => new Date(item.timestamp) >= startOfToday);
      case 'week':
        const weekAgo = new Date(startOfToday);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return items.filter((item) => new Date(item.timestamp) >= weekAgo);
      case 'month':
        const monthAgo = new Date(startOfToday);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return items.filter((item) => new Date(item.timestamp) >= monthAgo);
      default:
        return items;
    }
  };

  const filteredVisitors = filterByDate(serverVisits);
  const filteredPhoneClicks = filterByDate(serverClicks);
  const filteredChangeLogs = filterByDate(analytics.changeLogs);

  const totalVisitors = filteredVisitors.length;
  const uniqueVisitors = new Set(filteredVisitors.map((v: any) => v.userAgent)).size;
  const totalPhoneClicks = filteredPhoneClicks.length;
  const phoneClicksByNumber = filteredPhoneClicks.reduce((acc: Record<string, number>, click: any) => {
    acc[click.phoneNumber] = (acc[click.phoneNumber] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const visitorsByPage = filteredVisitors.reduce((acc: Record<string, number>, visitor: any) => {
    acc[visitor.page] = (acc[visitor.page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearData = async () => {
    if (confirm('Вы уверены, что хотите удалить все данные аналитики?')) {
      if (confirm('Это действие нельзя отменить. Продолжить?')) {
        try {
          await fetch('/api/db?table=Analytics', { method: 'DELETE' });
          setServerVisits([]);
          setServerClicks([]);
          clearAnalytics();
        } catch (e) {
          console.error('Failed to clear analytics:', e);
        }
      }
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const [visitsRes, clicksRes] = await Promise.all([
        fetch('/api/db?table=Analytics&type=visit&limit=2000'),
        fetch('/api/db?table=Analytics&type=phone-click&limit=1000'),
      ]);
      if (visitsRes.ok) setServerVisits((await visitsRes.json()).map((v: any) => ({ ...v, timestamp: v.createdAt })));
      if (clicksRes.ok) setServerClicks((await clicksRes.json()).map((c: any) => ({ ...c, timestamp: c.createdAt })));
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      visitors: filteredVisitors,
      phoneClicks: filteredPhoneClicks,
      changeLogs: filteredChangeLogs,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sofia-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'visitors' as TabType, label: 'Посещения', icon: Eye, count: totalVisitors },
    { id: 'phone-clicks' as TabType, label: 'Клики по телефону', icon: Phone, count: totalPhoneClicks },
    { id: 'change-log' as TabType, label: 'Журнал изменений', icon: Edit3, count: filteredChangeLogs.length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            Аналитика
            <span className="flex items-center gap-1 text-xs font-normal text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Live
            </span>
          </h1>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="input-field py-2"
          >
            <option value="today">Сегодня</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="all">Все время</option>
          </select>
          <button
            onClick={handleRefresh}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
          <button
            onClick={exportData}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Экспорт
          </button>
          {isDeveloper && (
            <button
              onClick={handleClearData}
              className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <Eye className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalVisitors}</p>
              <p className="text-sm text-muted-foreground">Посещений</p>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueVisitors}</p>
              <p className="text-sm text-muted-foreground">Уникальных</p>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/15 dark:bg-yellow-900/30 flex items-center justify-center">
              <Phone className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPhoneClicks}</p>
              <p className="text-sm text-muted-foreground">Кликов по телефону</p>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredChangeLogs.length}</p>
              <p className="text-sm text-muted-foreground">Изменений</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-accent/10 text-accent' : 'bg-muted'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'visitors' && (
            <div>
              {Object.keys(visitorsByPage).length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Посещения по страницам
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(visitorsByPage).map(([page, count]) => (
                      <div key={page} className="bg-card text-card-foreground border border-border rounded-lg p-3 text-center">
                        <p className="text-lg font-bold">{String(count)}</p>
                        <p className="text-xs text-muted-foreground">{String(page)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredVisitors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет данных о посещениях</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Время</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Страница</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">Источник</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden md:table-cell">Устройство</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredVisitors.slice(0, 50).map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-muted">
                          <td className="py-3 px-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {formatDate(visitor.timestamp)}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            {visitor.page}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">
                            {visitor.referrer ? (
                              <span className="truncate max-w-[150px] block" title={visitor.referrer}>
                                {new URL(visitor.referrer).hostname || visitor.referrer}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/70">Прямой</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">
                            <span className="truncate max-w-[200px] block" title={visitor.userAgent}>
                              {visitor.userAgent?.split(' ')[0] || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredVisitors.length > 50 && (
                    <p className="text-center py-4 text-sm text-muted-foreground">
                      Показаны последние 50 из {filteredVisitors.length} записей
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'phone-clicks' && (
            <div>
              {Object.keys(phoneClicksByNumber).length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-3">Клики по номерам телефонов</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(phoneClicksByNumber).map(([phone, count]) => (
                      <div key={phone} className="bg-card text-card-foreground border border-border rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-accent" />
                          <span className="font-medium">{phone}</span>
                        </div>
                        <span className="text-xl font-bold text-accent">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredPhoneClicks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет данных о кликах по телефону</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Время</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Телефон</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Место</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredPhoneClicks.slice(0, 50).map((click) => (
                        <tr key={click.id} className="hover:bg-muted">
                          <td className="py-3 px-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {formatDate(click.timestamp)}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <a href={`tel:${click.phoneNumber}`} className="text-accent hover:underline font-medium">
                              {click.phoneNumber}
                            </a>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {click.page}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPhoneClicks.length > 50 && (
                    <p className="text-center py-4 text-sm text-muted-foreground">
                      Показаны последние 50 из {filteredPhoneClicks.length} записей
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'change-log' && (
            <div>
              {filteredChangeLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Нет записей об изменениях</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Время</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Пользователь</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Действие</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">Детали</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredChangeLogs.slice(0, 50).map((log) => (
                        <tr key={log.id} className="hover:bg-muted">
                          <td className="py-3 px-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              {formatDate(log.timestamp)}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{log.user}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm">
                            <span className="px-2 py-1 bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 rounded text-xs">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredChangeLogs.length > 50 && (
                    <p className="text-center py-4 text-sm text-muted-foreground">
                      Показаны последние 50 из {filteredChangeLogs.length} записей
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
