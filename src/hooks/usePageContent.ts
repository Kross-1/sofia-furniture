import { useState, useCallback, useMemo, useEffect } from 'react';
import { saveSiteSetting, getSiteSettings } from '../lib/db';

export interface PageTextItem {
  id: string;
  page: string;
  section: string;
  label: string;
  text: string;
  htmlKey: string;
  isGlobal?: boolean;
  locations?: string[];
  order?: number;
}

export interface IconItem {
  id: string;
  name: string;
  category: string;
  iconType: string;
  location: string;
  color: string;
  order: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconType: string;
  iconUrl?: string;
  link: string;
  order: number;
}

export interface ProductCategoryItem {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  linkedFromHomepage: boolean;
  homepageCategoryId?: string;
  order: number;
}

const defaultCategories: CategoryItem[] = [
  { id: 'spalnya', name: 'Спальные гарнитуры', iconType: 'Спальные гарнитуры.png', link: '/catalog?category=spalnya', order: 1 },
  { id: 'tv-tumby', name: 'ТВ тумбы', iconType: 'Тв тумба.png', link: '/catalog?category=tv-tumby', order: 2 },
  { id: 'konsoli', name: 'Консоли', iconType: 'Консоль.png', link: '/catalog?category=konsoli', order: 3 },
  { id: 'stoly', name: 'Столы', iconType: 'Столы.png', link: '/catalog?category=stoly', order: 4 },
  { id: 'stulya', name: 'Стулья', iconType: 'Стулья.png', link: '/catalog?category=stulya', order: 5 },
  { id: 'holly', name: 'Холлы', iconType: 'Холлы.png', link: '/catalog?category=holly', order: 6 },
  { id: 'divany', name: 'Диваны', iconType: 'Диваны.png', link: '/catalog?category=divany', order: 7 },
];

const defaultProductCategories: ProductCategoryItem[] = [
  { id: 'pc-spalnya', name: 'Спальные гарнитуры', slug: 'spalnya', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'spalnya', order: 1 },
  { id: 'pc-tv-tumby', name: 'ТВ тумбы', slug: 'tv-tumby', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'tv-tumby', order: 2 },
  { id: 'pc-konsoli', name: 'Консоли', slug: 'konsoli', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'konsoli', order: 3 },
  { id: 'pc-stoly', name: 'Столы', slug: 'stoly', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'stoly', order: 4 },
  { id: 'pc-stulya', name: 'Стулья', slug: 'stulya', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'stulya', order: 5 },
  { id: 'pc-holly', name: 'Холлы', slug: 'holly', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'holly', order: 6 },
  { id: 'pc-divany', name: 'Диваны', slug: 'divany', enabled: true, linkedFromHomepage: true, homepageCategoryId: 'divany', order: 7 },
];

const defaultIcons: IconItem[] = [
  { id: 'icon-adv-quality', name: 'Качество', category: 'advantages', iconType: 'Качество.png', location: 'Главная: Преимущества - Качество', color: '#A88B7D', order: 1 },
  { id: 'icon-adv-price', name: 'Доступные цены', category: 'advantages', iconType: 'Доступные цены.png', location: 'Главная: Преимущества - Доступные цены', color: '#A88B7D', order: 2 },
  { id: 'icon-adv-delivery', name: 'Доставка', category: 'advantages', iconType: 'Доставка.png', location: 'Главная: Преимущества - Доставка', color: '#A88B7D', order: 3 },
  { id: 'icon-adv-warranty', name: 'Гарантия', category: 'advantages', iconType: 'Гарантия.png', location: 'Главная: Преимущества - Гарантия', color: '#A88B7D', order: 4 },
  { id: 'icon-cat-spalnye', name: 'Спальные гарнитуры', category: 'catalog', iconType: 'Спальные гарнитуры.png', location: 'Главная: Категории', color: '#A88B7D', order: 5 },
  { id: 'icon-cat-tv-tumby', name: 'ТВ тумбы', category: 'catalog', iconType: 'Тв тумба.png', location: 'Главная: Категории', color: '#A88B7D', order: 6 },
  { id: 'icon-cat-konsoli', name: 'Консоли', category: 'catalog', iconType: 'Консоль.png', location: 'Главная: Категории', color: '#A88B7D', order: 7 },
  { id: 'icon-cat-stoly', name: 'Столы', category: 'catalog', iconType: 'Столы.png', location: 'Главная: Категории', color: '#A88B7D', order: 8 },
  { id: 'icon-cat-stulya', name: 'Стулья', category: 'catalog', iconType: 'Стулья.png', location: 'Главная: Категории', color: '#A88B7D', order: 9 },
  { id: 'icon-cat-holly', name: 'Холлы', category: 'catalog', iconType: 'Холлы.png', location: 'Главная: Категории', color: '#A88B7D', order: 10 },
  { id: 'icon-cat-divany', name: 'Диваны', category: 'catalog', iconType: 'Диваны.png', location: 'Главная: Категории', color: '#A88B7D', order: 11 },
];

const globalTexts: PageTextItem[] = [
  { id: 'header-brand-name', page: 'Общие', section: 'header', label: 'Шапка: Название магазина', text: 'Сафия', htmlKey: '[data-text="brand-name"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 1 },
  { id: 'header-nav-home', page: 'Общие', section: 'header', label: 'Шапка: Главная', text: 'Главная', htmlKey: '[data-text="nav-home"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 2 },
  { id: 'header-nav-catalog', page: 'Общие', section: 'header', label: 'Шапка: Каталог', text: 'Каталог', htmlKey: '[data-text="nav-catalog"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 3 },
  { id: 'header-nav-about', page: 'Общие', section: 'header', label: 'Шапка: О нас', text: 'О нас', htmlKey: '[data-text="nav-about"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 4 },
  { id: 'header-nav-contacts', page: 'Общие', section: 'header', label: 'Шапка: Контакты', text: 'Контакты', htmlKey: '[data-text="nav-contacts"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 5 },
  { id: 'header-nav-request', page: 'Общие', section: 'header', label: 'Шапка: Оставить заявку', text: 'Оставить заявку', htmlKey: '[data-text="nav-request"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 6 },
  { id: 'header-phone-1', page: 'Общие', section: 'header', label: 'Шапка: Телефон 1', text: '+7 (928) 569-09-09', htmlKey: '[data-text="phone-1"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта', 'Контакты', 'Заявка'], order: 7 },
  { id: 'header-phone-2', page: 'Общие', section: 'header', label: 'Шапка: Телефон 2', text: '+7 (929) 222-22-52', htmlKey: '[data-text="phone-2"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта', 'Контакты', 'Заявка'], order: 8 },
  { id: 'footer-brand-name', page: 'Общие', section: 'footer', label: 'Подвал: Название магазина', text: 'Сафия', htmlKey: '[data-text="brand-name"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 9 },
  { id: 'footer-desc', page: 'Общие', section: 'footer', label: 'Подвал: Описание', text: 'Мебельный салон с широким ассортиментом качественной мебели и ковров. Более 5 лет радуем клиентов стильными и комфортными решениями для дома.', htmlKey: '[data-text="footer-desc"]', isGlobal: true, locations: ['Подвал сайта'], order: 10 },
  { id: 'footer-nav-title', page: 'Общие', section: 'footer', label: 'Подвал: Навигация (заголовок)', text: 'Навигация', htmlKey: '[data-text="footer-nav-title"]', isGlobal: true, locations: ['Подвал сайта'], order: 11 },
  { id: 'footer-nav-home', page: 'Общие', section: 'footer', label: 'Подвал: Главная', text: 'Главная', htmlKey: '[data-text="nav-home"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 12 },
  { id: 'footer-nav-catalog', page: 'Общие', section: 'footer', label: 'Подвал: Каталог', text: 'Каталог', htmlKey: '[data-text="nav-catalog"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 13 },
  { id: 'footer-nav-about', page: 'Общие', section: 'footer', label: 'Подвал: О нас', text: 'О нас', htmlKey: '[data-text="nav-about"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 14 },
  { id: 'footer-nav-contacts', page: 'Общие', section: 'footer', label: 'Подвал: Контакты', text: 'Контакты', htmlKey: '[data-text="nav-contacts"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 15 },
  { id: 'footer-nav-request', page: 'Общие', section: 'footer', label: 'Подвал: Оставить заявку', text: 'Оставить заявку', htmlKey: '[data-text="nav-request"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта'], order: 16 },
  { id: 'footer-contacts-title', page: 'Общие', section: 'footer', label: 'Подвал: Контакты (заголовок)', text: 'Контакты', htmlKey: '[data-text="footer-contacts-title"]', isGlobal: true, locations: ['Подвал сайта'], order: 17 },
  { id: 'footer-address', page: 'Общие', section: 'footer', label: 'Подвал: Адрес', text: 'г. Махачкала, просп. Амет-хана Султана, 256, стр. 24', htmlKey: '[data-text="address"]', isGlobal: true, locations: ['Подвал сайта', 'Контакты'], order: 18 },
  { id: 'footer-phone-1', page: 'Общие', section: 'footer', label: 'Подвал: Телефон 1', text: '+7 (928) 569-09-09', htmlKey: '[data-text="phone-1"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта', 'Контакты', 'Заявка'], order: 19 },
  { id: 'footer-phone-2', page: 'Общие', section: 'footer', label: 'Подвал: Телефон 2', text: '+7 (929) 222-22-52', htmlKey: '[data-text="phone-2"]', isGlobal: true, locations: ['Шапка сайта', 'Подвал сайта', 'Контакты', 'Заявка'], order: 20 },
  { id: 'footer-work-time', page: 'Общие', section: 'footer', label: 'Подвал: Время работы', text: 'Ежедневно: 09:00 - 20:00', htmlKey: '[data-text="work-time"]', isGlobal: true, locations: ['Подвал сайта', 'Контакты'], order: 21 },
  { id: 'footer-categories-title', page: 'Общие', section: 'footer', label: 'Подвал: Категории (заголовок)', text: 'Категории', htmlKey: '[data-text="footer-categories-title"]', isGlobal: true, locations: ['Подвал сайта'], order: 22 },
  { id: 'footer-cat-spalnye', page: 'Общие', section: 'footer', label: 'Подвал: Спальные гарнитуры', text: 'Спальные гарнитуры', htmlKey: '[data-text="cat-spalnye"]', isGlobal: true, locations: ['Главная (карточки)', 'Подвал сайта'], order: 23 },
  { id: 'footer-cat-tv-tumby', page: 'Общие', section: 'footer', label: 'Подвал: ТВ тумбы', text: 'ТВ тумбы', htmlKey: '[data-text="cat-tv-tumby"]', isGlobal: true, locations: ['Главная (карточки)', 'Подвал сайта'], order: 24 },
  { id: 'footer-cat-konsoli', page: 'Общие', section: 'footer', label: 'Подвал: Консоли', text: 'Консоли', htmlKey: '[data-text="cat-konsoli"]', isGlobal: true, locations: ['Главная (карточки)', 'Подвал сайта'], order: 24.5 },
  { id: 'footer-cat-stoly', page: 'Общие', section: 'footer', label: 'Подвал: Столы', text: 'Столы', htmlKey: '[data-text="cat-stoly"]', isGlobal: true, locations: ['Главная (карточки)', 'Подвал сайта'], order: 25 },
  { id: 'footer-cat-stulya', page: 'Общие', section: 'footer', label: 'Подвал: Стулья', text: 'Стулья', htmlKey: '[data-text="cat-stulya"]', isGlobal: true, locations: ['Главная (карточки)', 'Подвал сайта'], order: 25.5 },
  { id: 'footer-cat-holly', page: 'Общие', section: 'footer', label: 'Подвал: Холлы', text: 'Холлы', htmlKey: '[data-text="cat-holly"]', isGlobal: true, locations: ['Главная (карточки)', 'Подвал сайта'], order: 26 },
  { id: 'footer-cat-divany', page: 'Общие', section: 'footer', label: 'Подвал: Диваны', text: 'Диваны', htmlKey: '[data-text="cat-divany"]', isGlobal: true, locations: ['Главная (карточки)', 'Подвал сайта'], order: 27 },
  { id: 'footer-copyright', page: 'Общие', section: 'footer', label: 'Подвал: Копирайт', text: '© {year} Мебельный салон "Сафия". Все права защищены.', htmlKey: '[data-text="copyright"]', isGlobal: true, locations: ['Подвал сайта'], order: 28 },
];

const pageTexts: PageTextItem[] = [
  { id: 'home-hero-badge', page: 'Главная', section: 'hero', label: 'Главная: Бейдж', text: 'Мебельный салон', htmlKey: '[data-text="hero-badge"]', order: 1 },
  { id: 'home-hero-title', page: 'Главная', section: 'hero', label: 'Главная: Заголовок', text: 'Создайте уют в вашем доме с салоном «Сафия»', htmlKey: '[data-text="hero-title"]', order: 2 },
  { id: 'home-hero-subtitle', page: 'Главная', section: 'hero', label: 'Главная: Подзаголовок', text: 'Широкий ассортимент качественной мебели и ковров ручной работы. Более 5 лет радуем жителей Махачкалы стильными решениями для дома.', htmlKey: '[data-text="home-hero-subtitle"]', order: 3 },
  { id: 'home-hero-btn', page: 'Главная', section: 'hero', label: 'Главная: Кнопка каталога', text: 'Перейти в каталог', htmlKey: '[data-text="hero-btn"]', order: 4 },
  { id: 'home-hero-btn-contacts', page: 'Главная', section: 'hero', label: 'Главная: Кнопка контактов', text: 'Наши контакты', htmlKey: '[data-text="hero-btn-contacts"]', order: 5 },
  { id: 'home-features-title', page: 'Главная', section: 'features', label: 'Главная: Заголовок преимуществ', text: 'Почему выбирают нас', htmlKey: '[data-text="features-title"]', order: 6 },
  { id: 'home-features-subtitle', page: 'Главная', section: 'features', label: 'Главная: Подзаголовок преимуществ', text: 'Мы стремимся создавать комфортное пространство в каждом доме', htmlKey: '[data-text="features-subtitle"]', order: 7 },
  { id: 'home-adv-quality-title', page: 'Главная', section: 'features', label: 'Главная: Качество (заголовок)', text: 'Качество', htmlKey: '[data-text="adv-quality"]', order: 8 },
  { id: 'home-adv-quality-desc', page: 'Главная', section: 'features', label: 'Главная: Качество (описание)', text: 'Только проверенные производители и материалы', htmlKey: '[data-text="adv-quality-desc"]', order: 9 },
  { id: 'home-adv-price-title', page: 'Главная', section: 'features', label: 'Главная: Доступные цены (заголовок)', text: 'Доступные цены', htmlKey: '[data-text="adv-price"]', order: 10 },
  { id: 'home-adv-price-desc', page: 'Главная', section: 'features', label: 'Главная: Доступные цены (описание)', text: 'Честные цены без скрытых наценок', htmlKey: '[data-text="adv-price-desc"]', order: 11 },
  { id: 'home-adv-delivery-title', page: 'Главная', section: 'features', label: 'Главная: Доставка (заголовок)', text: 'Доставка', htmlKey: '[data-text="adv-delivery"]', order: 12 },
  { id: 'home-adv-delivery-desc', page: 'Главная', section: 'features', label: 'Главная: Доставка (описание)', text: 'Быстрая доставка и профессиональная сборка', htmlKey: '[data-text="adv-delivery-desc"]', order: 13 },
  { id: 'home-adv-warranty-title', page: 'Главная', section: 'features', label: 'Главная: Гарантия (заголовок)', text: 'Гарантия', htmlKey: '[data-text="adv-warranty"]', order: 14 },
  { id: 'home-adv-warranty-desc', page: 'Главная', section: 'features', label: 'Главная: Гарантия (описание)', text: 'Расширенная гарантия на всю мебель', htmlKey: '[data-text="adv-warranty-desc"]', order: 15 },
  { id: 'home-categories-title', page: 'Главная', section: 'categories', label: 'Главная: Заголовок категорий', text: 'Наши категории', htmlKey: '[data-text="categories-title"]', order: 16 },
  { id: 'home-categories-subtitle', page: 'Главная', section: 'categories', label: 'Главная: Подзаголовок категорий', text: 'Выберите нужную категорию для просмотра товаров', htmlKey: '[data-text="categories-subtitle"]', order: 17 },
  { id: 'home-categories-btn', page: 'Главная', section: 'categories', label: 'Главная: Кнопка каталога', text: 'Смотреть весь каталог', htmlKey: '[data-text="categories-btn"]', order: 18 },
  { id: 'home-cta-title', page: 'Главная', section: 'cta', label: 'Главная: Заголовок призыва', text: 'Нужна консультация?', htmlKey: '[data-text="cta-title"]', order: 19 },
  { id: 'home-cta-subtitle', page: 'Главная', section: 'cta', label: 'Главная: Подзаголовок призыва', text: 'Наши специалисты помогут подобрать мебель под ваш интерьер и бюджет. Оставьте заявку, и мы свяжемся с вами в ближайшее время.', htmlKey: '[data-text="cta-subtitle"]', order: 20 },
  { id: 'home-cta-btn', page: 'Главная', section: 'cta', label: 'Главная: Кнопка призыва', text: 'Оставить заявку', htmlKey: '[data-text="cta-btn"]', order: 21 },
  { id: 'catalog-title', page: 'Каталог', section: 'header', label: 'Каталог: Заголовок', text: 'Каталог', htmlKey: '[data-text="catalog-title"]', order: 1 },
  { id: 'catalog-subtitle', page: 'Каталог', section: 'header', label: 'Каталог: Подзаголовок', text: 'Найдено товаров', htmlKey: '[data-text="catalog-subtitle"]', order: 2 },
  { id: 'catalog-filter-title', page: 'Каталог', section: 'filter', label: 'Каталог: Фильтры (заголовок)', text: 'Фильтры', htmlKey: '[data-text="filter-title"]', order: 3 },
  { id: 'catalog-filter-category', page: 'Каталог', section: 'filter', label: 'Каталог: Категории', text: 'Категории', htmlKey: '[data-text="filter-category"]', order: 4 },
  { id: 'catalog-filter-material', page: 'Каталог', section: 'filter', label: 'Каталог: Материал', text: 'Материал', htmlKey: '[data-text="filter-material"]', order: 5 },
  { id: 'catalog-filter-price', page: 'Каталог', section: 'filter', label: 'Каталог: Цена', text: 'Цена', htmlKey: '[data-text="filter-price"]', order: 6 },
  { id: 'catalog-filter-reset', page: 'Каталог', section: 'filter', label: 'Каталог: Сброс фильтров', text: 'Сбросить', htmlKey: '[data-text="filter-reset"]', order: 7 },
  { id: 'catalog-empty-title', page: 'Каталог', section: 'products', label: 'Каталог: Товары не найдены', text: 'Товары не найдены', htmlKey: '[data-text="catalog-empty"]', order: 8 },
  { id: 'catalog-empty-subtitle', page: 'Каталог', section: 'products', label: 'Каталог: Подтекст пустого каталога', text: 'Попробуйте изменить параметры фильтра', htmlKey: '[data-text="catalog-empty-sub"]', order: 9 },
  { id: 'about-badge', page: 'О нас', section: 'header', label: 'О нас: Бейдж', text: 'О салоне', htmlKey: '[data-text="about-badge"]', order: 1 },
  { id: 'about-title', page: 'О нас', section: 'header', label: 'О нас: Заголовок', text: 'Мебельный салон «Сафия» — ваш надежный выбор', htmlKey: '[data-text="about-title"]', order: 2 },
  { id: 'about-text-1', page: 'О нас', section: 'content', label: 'О нас: Текст 1', text: 'Мы работаем на рынке мебели и товаров для дома более 5 лет. За это время тысячи семей доверили нам обустройство своих домов и остались полностью удовлетворены качеством и сервисом.', htmlKey: '[data-text="about-text-1"]', order: 3 },
  { id: 'about-text-2', page: 'О нас', section: 'content', label: 'О нас: Текст 2', text: 'Наш салон предлагает широкий ассортимент мебели для дома — от элегантных спальных гарнитуров до стильных диванов и качественных ковров ручной работы. Мы работаем только с проверенными производителями и гарантируем качество каждого товара.', htmlKey: '[data-text="about-text-2"]', order: 4 },
  { id: 'about-years-badge', page: 'О нас', section: 'content', label: 'О нас: Бейдж лет', text: '5+', htmlKey: '[data-text="about-years"]', order: 5 },
  { id: 'about-years-text', page: 'О нас', section: 'content', label: 'О нас: Текст лет', text: 'лет на рынке', htmlKey: '[data-text="about-years-text"]', order: 6 },
  { id: 'about-mission-title', page: 'О нас', section: 'mission', label: 'О нас: Заголовок миссии', text: 'Наша миссия', htmlKey: '[data-text="about-mission-title"]', order: 7 },
  { id: 'about-mission-text', page: 'О нас', section: 'mission', label: 'О нас: Текст миссии', text: 'Мы стремимся создавать уют в каждом доме, предлагая качественную мебель и товары для дома по доступным ценам. Наша цель — помочь каждому клиенту найти идеальное решение для своего интерьера, учитывая все пожелания и бюджет.', htmlKey: '[data-text="about-mission-text"]', order: 8 },
  { id: 'about-features-title', page: 'О нас', section: 'features', label: 'О нас: Заголовок преимуществ', text: 'Почему выбирают нас', htmlKey: '[data-text="about-features-title"]', order: 9 },
  { id: 'about-adv-style-title', page: 'О нас', section: 'features', label: 'О нас: Качество и стиль', text: 'Качество и стиль', htmlKey: '[data-text="about-adv-style"]', order: 10 },
  { id: 'about-adv-style-desc', page: 'О нас', section: 'features', label: 'О нас: Качество и стиль (описание)', text: 'Мы тщательно отбираем каждый товар, чтобы предложить вам лучшее', htmlKey: '[data-text="about-adv-style-desc"]', order: 11 },
  { id: 'about-adv-experience-title', page: 'О нас', section: 'features', label: 'О нас: Более 5 лет опыта', text: 'Более 5 лет опыта', htmlKey: '[data-text="about-adv-experience"]', order: 12 },
  { id: 'about-adv-experience-desc', page: 'О нас', section: 'features', label: 'О нас: Более 5 лет опыта (описание)', text: 'Наши специалисты знают всё о мебели и помогут сделать правильный выбор', htmlKey: '[data-text="about-adv-experience-desc"]', order: 13 },
  { id: 'about-adv-clients-title', page: 'О нас', section: 'features', label: 'О нас: Более 5000 клиентов', text: 'Более 5000 клиентов', htmlKey: '[data-text="about-adv-clients"]', order: 14 },
  { id: 'about-adv-clients-desc', page: 'О нас', section: 'features', label: 'О нас: Более 5000 клиентов (описание)', text: 'Тысячи довольных клиентов рекомендуют нас своим друзьям и знакомым', htmlKey: '[data-text="about-adv-clients-desc"]', order: 15 },
  { id: 'about-adv-guarantee-title', page: 'О нас', section: 'features', label: 'О нас: Гарантия качества', text: 'Гарантия качества', htmlKey: '[data-text="about-adv-guarantee"]', order: 16 },
  { id: 'about-adv-guarantee-desc', page: 'О нас', section: 'features', label: 'О нас: Гарантия качества (описание)', text: 'Мы предоставляем гарантию на всю мебель и осуществляем сервисное обслуживание', htmlKey: '[data-text="about-adv-guarantee-desc"]', order: 17 },
  { id: 'about-gallery-title', page: 'О нас', section: 'gallery', label: 'О нас: Заголовок галереи', text: 'Наш салон', htmlKey: '[data-text="about-gallery-title"]', order: 18 },
  { id: 'contacts-title', page: 'Контакты', section: 'header', label: 'Контакты: Заголовок', text: 'Контакты', htmlKey: '[data-text="contacts-title"]', order: 1 },
  { id: 'contacts-subtitle', page: 'Контакты', section: 'header', label: 'Контакты: Подзаголовок', text: 'Свяжитесь с нами или посетите наш шоу-рум', htmlKey: '[data-text="contacts-subtitle"]', order: 2 },
  { id: 'contacts-info-title', page: 'Контакты', section: 'info', label: 'Контакты: Информация о салоне', text: 'Информация о салоне', htmlKey: '[data-text="contacts-info-title"]', order: 3 },
  { id: 'contacts-address-label', page: 'Контакты', section: 'info', label: 'Контакты: Адрес (метка)', text: 'Адрес', htmlKey: '[data-text="contacts-address-label"]', order: 4 },
  { id: 'contacts-address-text', page: 'Контакты', section: 'info', label: 'Контакты: Адрес (текст)', text: 'г. Махачкала, просп. Амет-хана Султана, 256, стр. 24', htmlKey: '[data-text="address"]', order: 5 },
  { id: 'contacts-phone-label', page: 'Контакты', section: 'info', label: 'Контакты: Телефоны (метка)', text: 'Телефоны', htmlKey: '[data-text="contacts-phone-label"]', order: 6 },
  { id: 'contacts-phone-1', page: 'Контакты', section: 'info', label: 'Контакты: Телефон 1', text: '+7 (928) 569-09-09', htmlKey: '[data-text="phone-1"]', order: 7 },
  { id: 'contacts-phone-2', page: 'Контакты', section: 'info', label: 'Контакты: Телефон 2', text: '+7 (929) 222-22-52', htmlKey: '[data-text="phone-2"]', order: 8 },
  { id: 'contacts-time-label', page: 'Контакты', section: 'info', label: 'Контакты: Время работы (метка)', text: 'Время работы', htmlKey: '[data-text="contacts-time-label"]', order: 9 },
  { id: 'contacts-time-text', page: 'Контакты', section: 'info', label: 'Контакты: Время работы (текст)', text: 'Ежедневно: с 09:00 до 20:00\nБез перерыва и выходных', htmlKey: '[data-text="contacts-time-text"]', order: 10 },
  { id: 'contacts-email-label', page: 'Контакты', section: 'info', label: 'Контакты: Email (метка)', text: 'Email', htmlKey: '[data-text="contacts-email-label"]', order: 11 },
  { id: 'contacts-email-text', page: 'Контакты', section: 'info', label: 'Контакты: Email (текст)', text: 'info@sofia.ru', htmlKey: '[data-text="contacts-email-text"]', order: 12 },
  { id: 'contacts-map-title', page: 'Контакты', section: 'map', label: 'Контакты: Название карты', text: 'Мебельный салон Сафия на карте', htmlKey: '[data-text="contacts-map-title"]', order: 13 },
  { id: 'request-title', page: 'Заявка', section: 'header', label: 'Заявка: Заголовок', text: 'Оставить заявку', htmlKey: '[data-text="request-title"]', order: 1 },
  { id: 'request-subtitle', page: 'Заявка', section: 'header', label: 'Заявка: Подзаголовок', text: 'Заполните форму, и наш менеджер свяжется с вами для уточнения деталей', htmlKey: '[data-text="request-subtitle"]', order: 2 },
  { id: 'request-name-label', page: 'Заявка', section: 'form', label: 'Заявка: Имя (метка)', text: 'Имя', htmlKey: '[data-text="request-name-label"]', order: 3 },
  { id: 'request-name-placeholder', page: 'Заявка', section: 'form', label: 'Заявка: Имя (плейсхолдер)', text: 'Введите ваше имя', htmlKey: '[data-text="request-name-placeholder"]', order: 4 },
  { id: 'request-phone-label', page: 'Заявка', section: 'form', label: 'Заявка: Телефон (метка)', text: 'Телефон', htmlKey: '[data-text="request-phone-label"]', order: 5 },
  { id: 'request-phone-placeholder', page: 'Заявка', section: 'form', label: 'Заявка: Телефон (плейсхолдер)', text: '+7 (999) 000-00-00', htmlKey: '[data-text="request-phone-placeholder"]', order: 6 },
  { id: 'request-comment-label', page: 'Заявка', section: 'form', label: 'Заявка: Комментарий (метка)', text: 'Комментарий', htmlKey: '[data-text="request-comment-label"]', order: 7 },
  { id: 'request-comment-placeholder', page: 'Заявка', section: 'form', label: 'Заявка: Комментарий (плейсхолдер)', text: 'Расскажите, что вас интересует', htmlKey: '[data-text="request-comment-placeholder"]', order: 8 },
  { id: 'request-btn', page: 'Заявка', section: 'form', label: 'Заявка: Кнопка отправки', text: 'Отправить заявку', htmlKey: '[data-text="request-btn"]', order: 9 },
  { id: 'request-sending', page: 'Заявка', section: 'form', label: 'Заявка: Текст отправки', text: 'Отправка...', htmlKey: '[data-text="request-sending"]', order: 10 },
  { id: 'request-privacy', page: 'Заявка', section: 'form', label: 'Заявка: Политика конфиденциальности', text: 'Нажимая кнопку "Отправить заявку", вы соглашаетесь с обработкой персональных данных', htmlKey: '[data-text="request-privacy"]', order: 11 },
  { id: 'request-contact-text', page: 'Заявка', section: 'contact', label: 'Заявка: Текст контактов', text: 'Или позвоните нам напрямую:', htmlKey: '[data-text="request-contact-text"]', order: 12 },
  { id: 'request-success-title', page: 'Заявка', section: 'success', label: 'Заявка: Заголовок успеха', text: 'Заявка отправлена!', htmlKey: '[data-text="request-success-title"]', order: 13 },
  { id: 'request-success-text', page: 'Заявка', section: 'success', label: 'Заявка: Текст успеха', text: 'Спасибо за вашу заявку! Наш менеджер свяжется с вами в ближайшее время.', htmlKey: '[data-text="request-success-text"]', order: 14 },
  { id: 'request-success-btn', page: 'Заявка', section: 'success', label: 'Заявка: Кнопка успеха', text: 'Отправить ещё одну заявку', htmlKey: '[data-text="request-success-btn"]', order: 15 },
  { id: 'request-error-name', page: 'Заявка', section: 'form', label: 'Заявка: Ошибка имени', text: 'Пожалуйста, введите ваше имя', htmlKey: '[data-text="request-error-name"]', order: 16 },
  { id: 'request-error-phone', page: 'Заявка', section: 'form', label: 'Заявка: Ошибка телефона', text: 'Пожалуйста, введите номер телефона', htmlKey: '[data-text="request-error-phone"]', order: 17 },
  { id: 'request-error-phone-format', page: 'Заявка', section: 'form', label: 'Заявка: Ошибка формата телефона', text: 'Введите корректный номер телефона', htmlKey: '[data-text="request-error-phone-format"]', order: 18 },
];

const allDefaultTexts: PageTextItem[] = [...globalTexts, ...pageTexts];

export function usePageContent() {
  const [texts, setTexts] = useState<PageTextItem[]>(allDefaultTexts);
  const [icons] = useState<IconItem[]>(defaultIcons);
  const [categories] = useState<CategoryItem[]>(defaultCategories);
  const [productCategories] = useState<ProductCategoryItem[]>(defaultProductCategories);
  const [isLoaded, setIsLoaded] = useState(false);

import { useState, useCallback, useMemo, useEffect } from 'react';
import { saveSiteSetting, getSiteSettings, dataEvents } from '../lib/db';

// ... (оставляем типы как есть)

// Единое состояние для всего сайта
let sharedTexts: PageTextItem[] = allDefaultTexts;
const listeners = new Set<(texts: PageTextItem[]) => void>();

export function usePageContent() {
  const [texts, setTexts] = useState<PageTextItem[]>(sharedTexts);
  const [isLoaded, setIsLoaded] = useState(false);

  // Подписка на обновление состояния
  useEffect(() => {
    const listener = (newTexts: PageTextItem[]) => setTexts(newTexts);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  // Загрузка данных
  useEffect(() => {
    if (isLoaded) return;
    getSiteSettings().then(dbSettings => {
      if (dbSettings && dbSettings.length > 0) {
        sharedTexts = sharedTexts.map(t => {
          const found = dbSettings.find((s: any) => s.key === t.id);
          return found ? { ...t, text: found.value } : t;
        });
        setTexts(sharedTexts);
        listeners.forEach(l => l(sharedTexts));
      }
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [isLoaded]);

  const getText = useCallback((id: string): string => {
    const item = texts.find(t => t.id === id);
    if (item) {
      if (id === 'footer-copyright' || id === 'common-copyright') {
        return item.text.replace('{year}', new Date().getFullYear().toString());
      }
      return item.text;
    }
    return '';
  }, [texts]);

  const updateText = useCallback(async (id: string, newText: string) => {
    try {
      await saveSiteSetting(id, newText);
      // Обновляем общие данные и оповещаем всех
      sharedTexts = sharedTexts.map(t => t.id === id ? { ...t, text: newText } : t);
      setTexts(sharedTexts);
      listeners.forEach(l => l(sharedTexts));
    } catch (e) {
      console.error('Ошибка сохранения:', e);
      alert('Не удалось сохранить текст');
    }
  }, []);


  // Load texts from DB on mount
  useEffect(() => {
    reloadData();
    
    // Listen for data changes
    const handleDataChange = () => {
      reloadData();
    };
    dataEvents.addEventListener('data-changed', handleDataChange);
    return () => dataEvents.removeEventListener('data-changed', handleDataChange);
  }, [reloadData]);

  // ... остальная часть хука


  const getText = useCallback((id: string): string => {
    const item = texts.find(t => t.id === id);
    if (item) {
      if (id === 'footer-copyright' || id === 'common-copyright') {
        return item.text.replace('{year}', new Date().getFullYear().toString());
      }
      return item.text;
    }
    return '';
  }, [texts]);

  const getTextsForPage = useCallback((pageName: string): PageTextItem[] => {
    const filtered = texts.filter(t => {
      if (pageName === 'Общие') return t.page === 'Общие';
      return t.page === pageName;
    });
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [texts]);

  const getGlobalTexts = useCallback((): PageTextItem[] => {
    return texts.filter(t => t.isGlobal).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [texts]);

  const getAllPagesForEditor = useMemo(() => {
    const pages = ['Общие', 'Главная', 'Каталог', 'О нас', 'Контакты', 'Заявка'];
    return pages.map(page => ({
      name: page,
      texts: getTextsForPage(page),
      globalCount: page === 'Общие'
        ? texts.filter(t => t.page === 'Общие').length
        : texts.filter(t => t.isGlobal && t.locations?.some(loc => loc.includes(page))).length,
    }));
  }, [texts, getTextsForPage]);

  const updateText = useCallback(async (id: string, newText: string) => {
    try {
      await saveSiteSetting(id, newText);
      setTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
    } catch (e) {
      console.error('Ошибка сохранения:', e);
      alert('Не удалось сохранить текст');
    }
  }, []);

  const getIconsByCategory = useCallback((category: string): IconItem[] => {
    return icons.filter(icon => icon.category === category).sort((a, b) => a.order - b.order);
  }, [icons]);

  const getIcon = useCallback((id: string): IconItem | undefined => {
    return defaultIcons.find(i => i.id === id);
  }, []);

  const getCategories = useCallback((): CategoryItem[] => {
    return [...categories].sort((a, b) => a.order - b.order);
  }, [categories]);

  const getProductCategories = useCallback((): ProductCategoryItem[] => {
    return [...productCategories].sort((a, b) => a.order - b.order);
  }, [productCategories]);

  const getEnabledProductCategories = useCallback((): ProductCategoryItem[] => {
    return productCategories.filter(c => c.enabled).sort((a, b) => a.order - b.order);
  }, [productCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<CategoryItem>) => {}, []);
  const addCategory = useCallback((category: Omit<CategoryItem, 'id'>): CategoryItem => { return category as CategoryItem; }, []);
  const deleteCategory = useCallback((id: string) => {}, []);
  const resetCategoriesToDefaults = useCallback(() => {}, []);

  const updateProductCategory = useCallback((id: string, updates: Partial<ProductCategoryItem>) => {}, []);
  const addProductCategory = useCallback((category: Omit<ProductCategoryItem, 'id'>): ProductCategoryItem => { return category as ProductCategoryItem; }, []);
  const deleteProductCategory = useCallback((id: string) => {}, []);
  const resetProductCategoriesToDefaults = useCallback(() => {}, []);

  const resetToDefaults = useCallback(() => {
    setTexts(allDefaultTexts);
  }, []);
  const findDuplicateTexts = useCallback((id: string): PageTextItem[] => {
    const target = allDefaultTexts.find(t => t.id === id);
    if (!target) return [];
    return allDefaultTexts.filter(t => t.id !== id && t.htmlKey === target.htmlKey);
  }, []);
  const updateIcon = useCallback((id: string, updates: Partial<IconItem>) => {}, []);
  const addIcon = useCallback((icon: Omit<IconItem, 'id'>): IconItem => { return icon as IconItem; }, []);
  const deleteIcon = useCallback((id: string) => {}, []);
  const resetIconsToDefaults = useCallback(() => {}, []);
  const syncProductCategoryFromHomepage = useCallback((homepageCategory: CategoryItem): ProductCategoryItem => {
    return defaultProductCategories[0];
  }, []);
  const unlinkProductCategoryFromHomepage = useCallback((homepageCategoryId: string) => {}, []);

  return {
    isLoaded,
    texts,
    getText,
    getTextsForPage,
    getGlobalTexts,
    setTexts,
    getAllPagesForEditor,
    icons,
    getIconsByCategory,
    getIcon,
    categories,
    getCategories,
    productCategories,
    getProductCategories,
    getEnabledProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    resetProductCategoriesToDefaults,
    resetToDefaults,
    updateText,
    findDuplicateTexts,
    updateCategory,
    addCategory,
    deleteCategory,
    resetCategoriesToDefaults,
    updateIcon,
    addIcon,
    deleteIcon,
    resetIconsToDefaults,
    syncProductCategoryFromHomepage,
    unlinkProductCategoryFromHomepage,
  };
}

export { allDefaultTexts as defaultTexts, globalTexts, pageTexts, defaultIcons, defaultCategories };
