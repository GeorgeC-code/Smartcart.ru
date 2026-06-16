/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { ShoppingTemplate, CartItem } from '../types';
import { Heart, Plus, Check, Trash2, Bookmark } from 'lucide-react';

interface TemplatesSectionProps {
  currentItems: CartItem[];
  onAddItems: (items: Omit<CartItem, 'id' | 'isBought' | 'addedAt'>[]) => void;
}

const DEFAULT_TEMPLATES: ShoppingTemplate[] = [
  {
    id: 'tmpl-borsch',
    title: 'Набор для борща 🍲',
    items: [
      { name: 'Говядина на кости', quantity: 0.8, unit: 'кг', price: 650, category: 'Мясо и Рыба' },
      { name: 'Капуста белокочанная', quantity: 0.5, unit: 'кг', price: 40, category: 'Овощи и Фрукты' },
      { name: 'Свекла', quantity: 2, unit: 'шт', price: 30, category: 'Овощи и Фрукты' },
      { name: 'Картофель', quantity: 4, unit: 'шт', price: 45, category: 'Овощи и Фрукты' },
      { name: 'Морковь', quantity: 2, unit: 'шт', price: 35, category: 'Овощи и Фрукты' },
      { name: 'Лук репчатый', quantity: 2, unit: 'шт', price: 30, category: 'Овощи и Фрукты' },
      { name: 'Сметана 15%', quantity: 1, unit: 'уп', price: 85, category: 'Молочные продукты' },
      { name: 'Томатная паста', quantity: 1, unit: 'шт', price: 70, category: 'Бакалея' }
    ]
  },
  {
    id: 'tmpl-carbonara',
    title: 'Набор для Карбонары 🍝',
    items: [
      { name: 'Спагетти твердых сортов', quantity: 1, unit: 'уп', price: 95, category: 'Бакалея' },
      { name: 'Бекон нарезка', quantity: 1, unit: 'уп', price: 180, category: 'Мясо и Рыба' },
      { name: 'Сливки 20%', quantity: 1, unit: 'уп', price: 110, category: 'Молочные продукты' },
      { name: 'Сыр Пармезан', quantity: 1, unit: 'уп', price: 230, category: 'Молочные продукты' },
      { name: 'Яйца куриные С1', quantity: 1, unit: 'уп', price: 110, category: 'Молочные продукты' }
    ]
  },
  {
    id: 'tmpl-breakfast',
    title: 'Завтрак "Бодрое утро" 🍳',
    items: [
      { name: 'Молоко 2.5%', quantity: 1, unit: 'л', price: 85, category: 'Молочные продукты' },
      { name: 'Кофе молотый', quantity: 1, unit: 'уп', price: 350, category: 'Напитки' },
      { name: 'Батон нарезной', quantity: 1, unit: 'шт', price: 45, category: 'Хлеб и Выпечка' },
      { name: 'Сливочное масло 82.5%', quantity: 1, unit: 'уп', price: 190, category: 'Молочные продукты' },
      { name: 'Сыр Гауда 200г', quantity: 1, unit: 'уп', price: 175, category: 'Молочные продукты' }
    ]
  },
  {
    id: 'tmpl-party',
    title: 'Вечер кино с друзьями 🍿',
    items: [
      { name: 'Чипсы картофельные', quantity: 2, unit: 'уп', price: 150, category: 'Сладости' },
      { name: 'Кола или Лимонад 2л', quantity: 1, unit: 'шт', price: 140, category: 'Напитки' },
      { name: 'Конфеты шоколадные', quantity: 1, unit: 'уп', price: 210, category: 'Сладости' },
      { name: 'Попкорн для микроволновки', quantity: 2, unit: 'шт', price: 80, category: 'Сладости' }
    ]
  }
];

export function TemplatesSection({ currentItems, onAddItems }: TemplatesSectionProps) {
  // Загружаем сохраненные шаблоны из localStorage
  const [customTemplates, setCustomTemplates] = useState<ShoppingTemplate[]>(() => {
    const saved = localStorage.getItem('smartcart_custom_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const handleCreateTemplate = (e: FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim() || currentItems.length === 0) return;

    // Берем текущие позиции без id/isBought
    const templateItems = currentItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      category: item.category,
      notes: item.notes
    }));

    const newTemplate: ShoppingTemplate = {
      id: `custom-tmpl-${Date.now()}`,
      title: newTemplateTitle.trim(),
      items: templateItems
    };

    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    localStorage.setItem('smartcart_custom_templates', JSON.stringify(updated));
    setNewTemplateTitle('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('smartcart_custom_templates', JSON.stringify(updated));
  };

  const handleAddTemplateToCart = (template: ShoppingTemplate) => {
    onAddItems(template.items);
    setAddedIds(prev => [...prev, template.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== template.id));
    }, 4000);
  };

  return (
    <div id="templates-section" className="space-y-6">
      {/* Сохранение текущей корзины */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <Heart className="w-5 h-5 fill-rose-500/20" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Сохранить текущую корзину</h3>
            <p className="text-xs text-slate-400">Создайте личный шаблон из товаров, которые сейчас добавлены в список</p>
          </div>
        </div>

        {currentItems.length > 0 ? (
          <form id="save-template-form" onSubmit={handleCreateTemplate} className="flex gap-2.5">
            <input
              id="template-title-input"
              type="text"
              value={newTemplateTitle}
              onChange={(e) => setNewTemplateTitle(e.target.value)}
              placeholder="Назовите шаблон, например: Моя недельная закупка"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              required
            />
            <button
              id="save-template-submit-btn"
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs md:text-sm shadow-sm transition-all"
            >
              Сохранить
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 italic">
            Добавьте хотя бы один товар в список покупок, чтобы сохранить его как шаблон
          </div>
        )}

        {saveSuccess && (
          <div id="template-save-success" className="p-3 text-xs bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
            Шаблон успешно сохранен! Вы можете найти его во вкладке "Мои шаблоны" ниже.
          </div>
        )}
      </div>

      {/* Мои шаблоны */}
      {customTemplates.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            <Bookmark className="w-3.5 h-3.5" /> Мои шаблоны ({customTemplates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customTemplates.map((template) => {
              const isAdded = addedIds.includes(template.id);
              const itemsCount = template.items.length;
              return (
                <div key={template.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{template.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{itemsCount} шт. по списку</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`add-custom-tmpl-${template.id}`}
                      onClick={() => handleAddTemplateToCart(template)}
                      disabled={isAdded}
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        isAdded
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent'
                      }`}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isAdded ? 'Добавлено!' : 'В список'}</span>
                    </button>
                    <button
                      id={`delete-custom-tmpl-${template.id}`}
                      onClick={() => handleDeleteTemplate(template.id)}
                      type="button"
                      title="Удалить шаблон"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Готовые подборки */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
          🍎 Готовые подборки СмартКарт
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEFAULT_TEMPLATES.map((template) => {
            const isAdded = addedIds.includes(template.id);
            return (
              <div
                key={template.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-sm md:text-base">{template.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                      {template.items.length} полей
                    </span>
                  </div>

                  <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
                    {template.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>• {it.name}</span>
                        <span className="font-semibold text-slate-500 font-mono">{it.quantity} {it.unit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    id={`add-default-tmpl-${template.id}`}
                    onClick={() => handleAddTemplateToCart(template)}
                    disabled={isAdded}
                    type="button"
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                      isAdded
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white border-transparent'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Добавлено в список!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Добавить этот набор</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
