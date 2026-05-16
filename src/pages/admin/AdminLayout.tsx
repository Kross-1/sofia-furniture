import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  Edit3,
  MessageSquare,
  Sun,
  Moon,
  Share2,
  Globe,
} from 'lucide-react';
import { useState, ReactNode } from 'react';
import MenuIcon from '../../components/MenuIcon';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  developerOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { path: '/admin',           label: 'Дашборд',           icon: LayoutDashboard },
  { path: '/admin/products',  label: 'Товары',            icon: Package },
  { path: '/admin/pages',     label: 'Текстовый редактор', icon: Edit3 },
  { path: '/admin/categories', label: 'Категории',        icon: LayoutDashboard },
  { path: '/admin/messages',  label: 'Сообщения',         icon: MessageSquare },
  { path: '/admin/content',   label: 'Контент',           icon: FileText },
  { path: '/admin/analytics', label: 'Аналитика',         icon: BarChart3 },
  { path: '/admin/socials',  label: 'Социальные сети',   icon: Share2 },
  { path: '/admin/seo',      label: 'SEO настройки',     icon: Globe },
  { path: '/admin/users',     label: 'Пользователи',      icon: Users, developerOnly: true },
  { path: '/admin/settings',  label: 'Настройки',         icon: Settings },
];

interface AdminLayoutProps {
  children?: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isDeveloper } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminNavItems = allNavItems.filter(
    (item) => !item.developerOnly || isDeveloper
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const logoSrc = theme === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="bg-card text-card-foreground shadow-sm border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
              aria-label="Toggle sidebar"
              aria-expanded={isSidebarOpen}
            >
              <MenuIcon open={isSidebarOpen} className="w-6 h-6" />
            </button>
            <Link to="/admin" className="flex items-center gap-2 shrink-0">
              <img src={logoSrc} alt="Сафия" className="h-8 w-auto object-contain" />
              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded font-semibold">
                Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full transition-all duration-300
                hover:bg-muted border border-transparent hover:border-accent/40 text-foreground"
              aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-accent" />
              ) : (
                <Moon className="w-5 h-5 text-foreground/70" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              {isDeveloper && <span className="truncate max-w-[200px]">{user?.email}</span>}
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  user?.role === 'developer'
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                    : 'bg-accent/15 text-accent border border-accent/30'
                }`}
              >
                {user?.role === 'developer' ? 'Разработчик' : 'Админ'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-destructive
                hover:bg-destructive/10 rounded-lg transition-colors"
              aria-label="Выйти"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-card text-card-foreground border-r border-border z-40 transform transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm shadow-accent/30'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm
              text-muted-foreground hover:text-accent border border-border rounded-lg
              hover:bg-muted hover:border-accent/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Вернуться на сайт
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-4 sm:p-6">{children || <Outlet />}</div>
      </main>
    </div>
  );
}
