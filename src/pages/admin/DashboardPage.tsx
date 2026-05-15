import { useState, useEffect } from 'react';
import { Package, FileText, Users, MessageSquare, ArrowUpRight, Eye, Phone, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../../contexts/SiteDataContext';
import { usePageContent } from '../../hooks/usePageContent';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { getMessages } from '../../lib/db';

export default function DashboardPage() {
  const { products } = useSiteData();
  const { getEnabledProductCategories } = usePageContent();
  const { analytics } = useAnalytics();

  const categoriesCount = getEnabledProductCategories().length;

  const [messagesCount, setMessagesCount] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [serverPhoneClicks, setServerPhoneClicks] = useState<any[]>([]);
  const [serverVisits, setServerVisits] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMessages();
        setMessagesCount(data.length);
        setNewMessagesCount(data.filter((m: any) => m.status === 'new').length);
      } catch {
        try {
          const messages = JSON.parse(localStorage.getItem('sofia_messages') || '[]');
          setMessagesCount(messages.length);
          setNewMessagesCount(messages.filter((m: any) => m.status === 'new').length);
        } catch {}
      }
      try {
        const [visitsRes, clicksRes] = await Promise.all([
          fetch('/api/db?table=Analytics&type=visit&limit=2000'),
          fetch('/api/db?table=Analytics&type=phone-click&limit=1000'),
        ]);
        if (visitsRes.ok) setServerVisits(await visitsRes.json());
        if (clicksRes.ok) setServerPhoneClicks(await clicksRes.json());
      } catch {}
    };
    load();
  }, []);

  const todayVisitors = serverVisits.filter((v) => {
    const visitDate = new Date(v.createdAt);
    const today = new Date();
    return visitDate.toDateString() === today.toDateString();
  }).length;

  const todayPhoneClicks = serverPhoneClicks.filter((c) => {
    const clickDate = new Date(c.createdAt);
    const today = new Date();
    return clickDate.toDateString() === today.toDateString();
  }).length;

  const totalVisits = serverVisits.length;

  const stats = [
    {
      label: 'Товаров',
      value: products.length,
      icon: Package,
      tone: 'sky',
      link: '/admin/products',
    },
    {
      label: 'Категорий',
      value: categoriesCount,
      icon: FileText,
      tone: 'emerald',
      link: '/admin/categories',
    },
    {
      label: 'Сообщений',
      value: messagesCount,
      icon: MessageSquare,
      tone: newMessagesCount > 0 ? 'rose' : 'amber',
      badge: newMessagesCount > 0 ? newMessagesCount : undefined,
      link: '/admin/messages',
    },
    {
      label: 'Пользователей',
      value: 2,
      icon: Users,
      tone: 'violet',
      link: '/admin/users',
    },
  ];

  const toneClasses: Record<string, string> = {
    sky:     'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    rose:    'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    amber:   'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    violet:  'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground mb-6">
        Дашборд
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm
              hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all relative"
          >
            {stat.badge && (
              <div className="absolute top-4 right-4 min-w-6 h-6 px-1.5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                {stat.badge}
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${toneClasses[stat.tone]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-4 text-foreground">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/products?action=add"
            className="p-4 border-2 border-dashed border-border rounded-lg text-center hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">Добавить товар</p>
          </Link>
          <Link
            to="/admin/pages"
            className="p-4 border-2 border-dashed border-border rounded-lg text-center hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">Редактировать страницы</p>
          </Link>
          <Link
            to="/admin/messages"
            className="p-4 border-2 border-dashed border-border rounded-lg text-center hover:border-accent hover:bg-accent/5 transition-colors relative"
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">Сообщения</p>
            {newMessagesCount > 0 && (
              <div className="absolute top-2 right-2 min-w-5 h-5 px-1.5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {newMessagesCount}
              </div>
            )}
          </Link>
          <Link
            to="/admin/analytics"
            className="p-4 border-2 border-dashed border-border rounded-lg text-center hover:border-accent hover:bg-accent/5 transition-colors"
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground">Аналитика</p>
          </Link>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">Аналитика сегодня</h2>
          <Link
            to="/admin/analytics"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            Подробнее
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{todayVisitors}</p>
              <p className="text-sm text-sky-600 dark:text-sky-400">Посещений сегодня</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{todayPhoneClicks}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Кликов по телефону</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{totalVisits}</p>
              <p className="text-sm text-violet-600 dark:text-violet-400">Всего посещений</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm mt-6">
        <h2 className="font-semibold text-lg mb-4 text-foreground">Последние изменения</h2>
        {analytics.changeLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Нет недавней активности</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.changeLogs.slice(-5).reverse().map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{log.details}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
