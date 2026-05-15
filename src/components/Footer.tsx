import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock } from 'lucide-react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { usePageContent } from '../hooks/usePageContent';
import { SocialLinks } from '../hooks/useSocialNetworks';

export default function Footer() {
  const { getText } = usePageContent();
  const analytics = useAnalytics();

  const handlePhoneClick = (displayNumber: string) => {
    setTimeout(() => {
      analytics.trackPhoneClick(displayNumber, 'Подвал сайта');
    }, 0);
  };

  const phone1 = getText('header-phone-1');
  const phone2 = getText('header-phone-2');
  const formatPhoneForTel = (phone: string) => phone.replace(/[^+\d]/g, '');

  // Footer use light text on always-dark background (premium look)
  return (
    <footer className="bg-[#13110f] text-zinc-300">
      {/* Gold accent line at top */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* About */}
          <div>
            <img
              src="/logo-dark.png"
              alt="Сафия Мебель"
              className="h-14 w-auto mb-5 object-contain"
            />
            <p className="text-sm text-zinc-400 leading-relaxed" data-text="footer-desc">
              {getText('footer-desc')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-5 text-amber-400 flex items-center gap-2 font-sans" data-text="footer-nav-title">
              <span className="w-8 h-px bg-amber-500/50" />
              {getText('footer-nav-title')}
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'header-nav-home', id: 'nav-home' },
                { to: '/catalog', label: 'header-nav-catalog', id: 'nav-catalog' },
                { to: '/about', label: 'header-nav-about', id: 'nav-about' },
                { to: '/contacts', label: 'header-nav-contacts', id: 'nav-contacts' },
                { to: '/request', label: 'header-nav-request', id: 'nav-request' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-2"
                    data-text={item.id}
                  >
                    <span className="w-1 h-1 bg-amber-500/40 rounded-full" />
                    {getText(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-5 text-amber-400 flex items-center gap-2 font-sans" data-text="footer-contacts-title">
              <span className="w-8 h-px bg-amber-500/50" />
              {getText('footer-contacts-title')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                <span className="text-sm text-zinc-400" data-text="address">
                  {getText('footer-address')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0 text-amber-500" />
                <div className="flex flex-col gap-1">
                  <a
                    href={`tel:${formatPhoneForTel(phone1)}`}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                    onClick={() => handlePhoneClick(phone1)}
                    data-text="phone-1"
                  >
                    {phone1}
                  </a>
                  <a
                    href={`tel:${formatPhoneForTel(phone2)}`}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                    onClick={() => handlePhoneClick(phone2)}
                    data-text="phone-2"
                  >
                    {phone2}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 text-amber-500" />
                <span className="text-sm text-zinc-400" data-text="work-time">
                  {getText('footer-work-time')}
                </span>
              </li>
            </ul>
            <SocialLinks className="flex items-center gap-3 mt-5" />
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-5 text-amber-400 flex items-center gap-2 font-sans" data-text="footer-categories-title">
              <span className="w-8 h-px bg-amber-500/50" />
              {getText('footer-categories-title')}
            </h4>
            <ul className="space-y-3">
              {[
                { slug: 'spalnya', key: 'footer-cat-spalnye', id: 'cat-spalnye' },
                { slug: 'tv-tumby', key: 'footer-cat-tv-tumby', id: 'cat-tv-tumby' },
                { slug: 'konsoli', key: 'footer-cat-konsoli', id: 'cat-konsoli' },
                { slug: 'stoly', key: 'footer-cat-stoly', id: 'cat-stoly' },
                { slug: 'stulya', key: 'footer-cat-stulya', id: 'cat-stulya' },
                { slug: 'holly', key: 'footer-cat-holly', id: 'cat-holly' },
                { slug: 'divany', key: 'footer-cat-divany', id: 'cat-divany' },
              ].map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/catalog?category=${item.slug}`}
                    className="text-sm text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-2"
                    data-text={item.id}
                  >
                    <span className="w-1 h-1 bg-amber-500/40 rounded-full" />
                    {getText(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-zinc-800/60 mt-12 pt-8 text-center">
          <p className="text-sm text-zinc-500" data-text="copyright">
            {getText('footer-copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
