export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  videos?: string[];
  material?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order?: number;
}

export const categories = [
  { id: 'spalnya', name: 'Спальные гарнитуры', icon: 'Bed' },
  { id: 'tv-tumby', name: 'ТВ тумбы', icon: 'Tv' },
  { id: 'konsoli', name: 'Консоли', icon: 'Coffee' },
  { id: 'stoly', name: 'Столы', icon: 'Armchair' },
  { id: 'stulya', name: 'Стулья', icon: 'Armchair' },
  { id: 'holly', name: 'Холлы', icon: 'Sofa' },
  { id: 'divany', name: 'Диваны', icon: 'Sofa' },
];

export const materials = [
  'Дерево',
  'МДФ',
  'ДСП',
  'Металл',
  'Ткань',
  'Кожа',
  'Шерсть',
  'Вискоза',
];

// Локальные изображения для плейсхолдеров (base64 SVG мебель)
const furniturePlaceholders = {
  bedroom: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23E8DDD4' width='600' height='400'/%3E%3Crect fill='%23A88B7D' x='50' y='200' width='500' height='150' rx='10'/%3E%3Crect fill='%238B7355' x='70' y='220' width='200' height='100' rx='5'/%3E%3Crect fill='%238B7355' x='330' y='220' width='200' height='100' rx='5'/%3E%3Crect fill='%23A88B7D' x='100' y='100' width='400' height='80' rx='10'/%3E%3C/svg%3E`,
  tvTable: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23E8DDD4' width='600' height='400'/%3E%3Crect fill='%23A88B7D' x='100' y='220' width='400' height='100' rx='5'/%3E%3Crect fill='%235D4E3A' x='120' y='240' width='80' height='60' rx='3'/%3E%3Crect fill='%235D4E3A' x='400' y='240' width='80' height='60' rx='3'/%3E%3Crect fill='%238B7355' x='200' y='150' width='200' height='60' rx='3'/%3E%3C/svg%3E`,
  console: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23E8DDD4' width='600' height='400'/%3E%3Crect fill='%23A88B7D' x='150' y='250' width='300' height='80' rx='5'/%3E%3Crect fill='%235D4E3A' x='170' y='270' width='260' height='40' rx='3'/%3E%3Ccircle fill='%238B7355' cx='180' cy='340' r='10'/%3E%3Ccircle fill='%238B7355' cx='420' cy='340' r='10'/%3E%3C/svg%3E`,
  table: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23E8DDD4' width='600' height='400'/%3E%3Cellipse fill='%23A88B7D' cx='300' cy='200' rx='250' ry='80'/%3E%3Crect fill='%238B7355' x='140' y='250' width='320' height='100' rx='50'/%3E%3Crect fill='%235D4E3A' x='160' y='270' width='280' height='60' rx='30'/%3E%3C/svg%3E`,
  chair: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23E8DDD4' width='600' height='400'/%3E%3Crect fill='%23A88B7D' x='200' y='150' width='200' height='180' rx='15'/%3E%3Crect fill='%238B7355' x='220' y='170' width='160' height='140' rx='10'/%3E%3Crect fill='%235D4E3A' x='220' y='320' width='30' height='50' rx='5'/%3E%3Crect fill='%235D4E3A' x='350' y='320' width='30' height='50' rx='5'/%3E%3C/svg%3E`,
  sofa: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23E8DDD4' width='600' height='400'/%3E%3Crect fill='%23A88B7D' x='80' y='180' width='440' height='150' rx='20'/%3E%3Crect fill='%238B7355' x='100' y='200' width='400' height='110' rx='15'/%3E%3Crect fill='%23A88B7D' x='100' y='140' width='60' height='100' rx='10'/%3E%3Crect fill='%23A88B7D' x='440' y='140' width='60' height='100' rx='10'/%3E%3Crect fill='%235D4E3A' x='100' y='320' width='40' height='40' rx='5'/%3E%3Crect fill='%235D4E3A' x='460' y='320' width='40' height='40' rx='5'/%3E%3C/svg%3E`,
  hall: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23E8DDD4' width='600' height='400'/%3E%3Crect fill='%23A88B7D' x='100' y='150' width='400' height='180' rx='20'/%3E%3Crect fill='%238B7355' x='120' y='170' width='360' height='140' rx='15'/%3E%3Crect fill='%235D4E3A' x='140' y='320' width='30' height='40' rx='5'/%3E%3Crect fill='%235D4E3A' x='430' y='320' width='30' height='40' rx='5'/%3E%3C/svg%3E`,
};

export const products: Product[] = [
  {
    id: 1,
    name: 'Спальный гарнитур "Престиж"',
    category: 'Спальные гарнитуры',
    price: 125000,
    image: furniturePlaceholders.bedroom,
    material: 'Дерево',
    description: 'Элегантный спальный гарнитур из натурального дерева с мягким изголовьем',
  },
  {
    id: 2,
    name: 'ТВ тумба "Минимал"',
    category: 'ТВ тумбы',
    price: 28000,
    image: furniturePlaceholders.tvTable,
    material: 'МДФ',
    description: 'Современная ТВ тумба с ящиками и нишей для техники',
  },
  {
    id: 3,
    name: 'Консоль "Венеция"',
    category: 'Консоли',
    price: 35000,
    image: furniturePlaceholders.console,
    material: 'Дерево',
    description: 'Изящная консоль для прихожей или гостиной',
  },
  {
    id: 4,
    name: 'Обеденный стол "Семья"',
    category: 'Столы',
    price: 45000,
    image: furniturePlaceholders.table,
    material: 'Дерево',
    description: 'Просторный обеденный стол на 6 персон из массива дуба',
  },
  {
    id: 5,
    name: 'Стул "Комфорт"',
    category: 'Стулья',
    price: 8500,
    image: furniturePlaceholders.chair,
    material: 'Ткань',
    description: 'Мягкий стул с обивкой из велюра',
  },
  {
    id: 6,
    name: 'Холл "Уютный"',
    category: 'Холлы',
    price: 55000,
    image: furniturePlaceholders.hall,
    material: 'Ткань',
    description: 'Мягкий холл с подушками для максимального комфорта',
  },
  {
    id: 7,
    name: 'Диван "Венеция"',
    category: 'Диваны',
    price: 89000,
    image: furniturePlaceholders.sofa,
    material: 'Ткань',
    description: 'Мягкий раскладной диван с ящиком для белья',
  },
  {
    id: 8,
    name: 'Спальный гарнитур "Мечта"',
    category: 'Спальные гарнитуры',
    price: 98000,
    image: furniturePlaceholders.bedroom,
    material: 'МДФ',
    description: 'Стильный гарнитур с зеркалом и вместительными шкафами',
  },
  {
    id: 9,
    name: 'ТВ тумба "Лофт"',
    category: 'ТВ тумбы',
    price: 32000,
    image: furniturePlaceholders.tvTable,
    material: 'Металл',
    description: 'Индустриальная ТВ тумба в стиле лофт',
  },
  {
    id: 10,
    name: 'Консоль "Модерн"',
    category: 'Консоли',
    price: 42000,
    image: furniturePlaceholders.console,
    material: 'МДФ',
    description: 'Минималистичная консоль с глянцевым покрытием',
  },
  {
    id: 11,
    name: 'Письменный стол "Работа"',
    category: 'Столы',
    price: 38000,
    image: furniturePlaceholders.table,
    material: 'Дерево',
    description: 'Функциональный письменный стол с выдвижными ящиками',
  },
  {
    id: 12,
    name: 'Стул "Велюр"',
    category: 'Стулья',
    price: 12000,
    image: furniturePlaceholders.chair,
    material: 'Велюр',
    description: 'Элегантный стул с обивкой из велюра и металлическими ножками',
  },
  {
    id: 13,
    name: 'Холл "Классик"',
    category: 'Холлы',
    price: 65000,
    image: furniturePlaceholders.hall,
    material: 'Кожа',
    description: 'Классический холл с элегантным дизайном',
  },
  {
    id: 14,
    name: 'Диван "Аккордеон"',
    category: 'Диваны',
    price: 65000,
    image: furniturePlaceholders.sofa,
    material: 'Ткань',
    description: 'Раскладной диван типа "аккордеон" с ортопедическим матрасом',
  },
  {
    id: 15,
    name: 'Кожаный диван "Бизнес"',
    category: 'Диваны',
    price: 145000,
    image: furniturePlaceholders.sofa,
    material: 'Кожа',
    description: 'Премиальный кожаный диван для офиса или дома',
  },
  {
    id: 16,
    name: 'Холл "Лофт"',
    category: 'Холлы',
    price: 48000,
    image: furniturePlaceholders.hall,
    material: 'Ткань',
    description: 'Современный холл в стиле лофт для вашего интерьера',
  },
];
