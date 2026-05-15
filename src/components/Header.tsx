import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Sun, Moon } from 'lucide-react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { usePageContent } from '../hooks/usePageContent';
import { useTheme } from '../contexts/ThemeContext';
import MenuIcon from './MenuIcon';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { trackPhoneClick } = useAnalytics();
  const { getText } = usePageContent();
  const { theme, toggleTheme } = useTheme();

  const handlePhoneClick = (_phoneNumber: string, displayNumber: string) => {
    // Use setTimeout to ensure tracking fires before the phone app opens
    setTimeout(() => {
      trackPhoneClick(displayNumber, 'Шапка сайта');
    }, 0);
  };

  const phone1 = getText('header-phone-1');
  const phone2 = getText('header-phone-2');
  const formatPhoneForTel = (phone: string) => phone.replace(/[^+\d]/g, '');

  const navLinks = [
    { path: '/', label: getText('header-nav-home'), id: 'nav-home' },
    { path: '/catalog', label: getText('header-nav-catalog'), id: 'nav-catalog' },
    { path: '/about', label: getText('header-nav-about'), id: 'nav-about' },
    { path: '/contacts', label: getText('header-nav-contacts'), id: 'nav-contacts' },
    { path: '/request', label: getText('header-nav-request'), id: 'nav-request' },
  ];

  const logoSrc = theme === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300
      bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" aria-label="Сафия Мебель — Главная">
            <img
              src={logoSrc}
              alt="Сафия Мебель"
              className="h-16 md:h-20 w-auto max-w-[200px] md:max-w-[260px] object-contain object-left transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-medium transition-colors duration-200 group ${
                    isActive
                      ? 'text-accent'
                      : 'text-foreground/80 hover:text-accent'
                  }`}
                  data-text={link.id}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right side: Theme toggle + Phone Numbers */}
          <div className="flex items-center gap-2 lg:gap-5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full transition-all duration-300
                hover:bg-muted border border-transparent hover:border-accent/40"
              aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-accent" />
              ) : (
                <Moon className="w-5 h-5 text-foreground/70" />
              )}
            </button>

            {/* Phone Numbers - Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={`tel:${formatPhoneForTel(phone1)}`}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
                onClick={() => handlePhoneClick(formatPhoneForTel(phone1), phone1)}
                data-text="phone-1"
              >
                <Phone className="w-4 h-4" />
                {phone1}
              </a>
              <a
                href={`tel:${formatPhoneForTel(phone2)}`}
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
                onClick={() => handlePhoneClick(formatPhoneForTel(phone2), phone2)}
                data-text="phone-2"
              >
                <Phone className="w-4 h-4" />
                {phone2}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <MenuIcon open={isMenuOpen} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 bg-background">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    }`}
                    data-text={link.id}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-border">
              <a
                href={`tel:${formatPhoneForTel(phone1)}`}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-accent"
                onClick={() => handlePhoneClick(formatPhoneForTel(phone1), phone1)}
                data-text="phone-1"
              >
                <Phone className="w-4 h-4 text-accent" />
                {phone1}
              </a>
              <a
                href={`tel:${formatPhoneForTel(phone2)}`}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-accent"
                onClick={() => handlePhoneClick(formatPhoneForTel(phone2), phone2)}
                data-text="phone-2"
              >
                <Phone className="w-4 h-4 text-accent" />
                {phone2}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
