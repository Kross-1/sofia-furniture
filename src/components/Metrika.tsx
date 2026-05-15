import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function Metrika() {
  const location = useLocation();

  useEffect(() => {
    // Не инициализируем Метрику в админ-панели
    if (location.pathname.startsWith('/admin')) return;

    // Инициализация (только один раз)
    if (!(window as any).ym) {
      (function(m: any,e: any,t: any,r: any,i: any,k: any,a: any){
          m[i]=m[i]||function(...args: any[]){(m[i].a=m[i].a||[]).push(args)};
          m[i].l=1*new Date().getTime();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109169106', 'ym', null, null);

      (window as any).ym(109169106, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: window.location.href, accurateTrackBounce:true, trackLinks:true});
    } else {
      // Отправляем данные о просмотре новой страницы
      (window as any).ym(109169106, 'hit', location.pathname);
    }
  }, [location.pathname]);

  return null;
}
