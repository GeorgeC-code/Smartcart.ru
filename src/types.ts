/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CartItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // шт, кг, л, уп, г
  price: number; // Стоимость за единицу или общая
  isBought: boolean;
  notes?: string;
  addedAt: string;
}

export interface Budget {
  limit: number;
  isSet: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'Легко' | 'Средне' | 'Сложно';
  missingIngredients: string[];
}

export interface ShoppingTemplate {
  id: string;
  title: string;
  items: Omit<CartItem, 'id' | 'isBought' | 'addedAt'>[];
}

export const CATEGORIES_METADATA: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  'Молочные продукты': { label: 'Молочные продукты', icon: 'Milk', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  'Овощи и Фрукты': { label: 'Овощи и Фрукты', icon: 'Apple', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  'Бакалея': { label: 'Бакалея', icon: 'Wheat', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  'Мясо и Рыба': { label: 'Мясо и Рыба', icon: 'Beef', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  'Хлеб и Выпечка': { label: 'Хлеб и Выпечка', icon: 'Croissant', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  'Напитки': { label: 'Напитки', icon: 'CupSoda', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
  'Заморозка': { label: 'Замороженные продукты', icon: 'Snowflake', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  'Сладости': { label: 'Сладости и Снеки', icon: 'Candy', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  'Хозтовары': { label: 'Бытовая химия и Косметика', icon: 'Sparkles', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
  'Другое': { label: 'Другое', icon: 'ShoppingBag', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100' },
};
