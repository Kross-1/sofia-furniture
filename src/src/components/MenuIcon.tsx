import { SVGProps } from 'react';

/**
 * Кастомная иконка-меню (burger / X) с округлёнными концами линий.
 * Концы линий заметно видны с обеих сторон благодаря stroke-linecap="round"
 * и уменьшенному внутреннему отступу.
 *
 * Используется как замена lucide-react `Menu` / `X`,
 * чтобы иконка выглядела одинаково в шапке сайта и в админке,
 * и при этом «дышала» (концы видно).
 */

interface MenuIconProps extends SVGProps<SVGSVGElement> {
  open?: boolean;
}

export function MenuIcon({ open = false, className = 'w-6 h-6', ...rest }: MenuIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {open ? (
        // X (close)
        <>
          <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
          <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
        </>
      ) : (
        // Burger — three rounded lines, padded so the caps are clearly visible
        <>
          <line x1="3.5" y1="6.5"  x2="20.5" y2="6.5" />
          <line x1="3.5" y1="12"   x2="20.5" y2="12" />
          <line x1="3.5" y1="17.5" x2="20.5" y2="17.5" />
        </>
      )}
    </svg>
  );
}

export default MenuIcon;
