/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit3, 
  Check, 
  Plus, 
  Minus,
  Milk,
  Apple,
  Wheat,
  Beef,
  Croissant,
  CupSoda,
  Snowflake,
  Candy,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { CartItem, CATEGORIES_METADATA } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Хелпер для получения компонента иконки
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Milk': return Milk;
    case 'Apple': return Apple;
    case 'Wheat': return Wheat;
    case 'Beef': return Beef;
    case 'Croissant': return Croissant;
    case 'CupSoda': return CupSoda;
    case 'Snowflake': return Snowflake;
    case 'Candy': return Candy;
    case 'Sparkles': return Sparkles;
    default: return ShoppingBag;
  }
};

interface CategoryGroupProps {
  key?: string;
  category: string;
  items: CartItem[];
  onToggleBought: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQty: (id: string, newQty: number) => void;
  onEditItem: (item: CartItem) => void;
}

export function CategoryGroup({ 
  category, 
  items, 
  onToggleBought, 
  onDeleteItem, 
  onUpdateQty,
  onEditItem 
}: CategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const meta = CATEGORIES_METADATA[category] || CATEGORIES_METADATA['Другое'];
  const Icon = getIconComponent(meta.icon);

  const boughtCount = items.filter(it => it.isBought).length;
  const totalCount = items.length;
  const isAllBought = boughtCount === totalCount;

  // Рассчитаем общую стоимость в категории
  const categoryTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div 
      id={`cat-group-${category.replace(/\s+/g, '-')}`} 
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4"
    >
      {/* Шапка категории */}
      <div 
        id={`cat-header-${category.replace(/\s+/g, '-')}`}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 bg-slate-50/50 cursor-pointer select-none hover:bg-slate-50 transition-all border-b border-slate-100"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${meta.bg} ${meta.color}`}>
            <Icon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base flex items-center gap-2">
              {meta.label}
              <span className="text-xs font-medium text-slate-400 font-mono">
                ({boughtCount}/{totalCount})
              </span>
            </h3>
            {categoryTotal > 0 && (
              <p className="text-xs text-slate-500 font-medium">
                Итого в категории: <span className="text-slate-700 font-mono font-bold">{categoryTotal.toLocaleString('ru-RU')} ₽</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAllBought && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Куплено
            </span>
          )}
          <button 
            id={`cat-toggle-${category.replace(/\s+/g, '-')}`}
            type="button" 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Список товаров в категории */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-slate-100 overflow-hidden"
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors ${
                  item.isBought ? 'bg-slate-50/40' : 'bg-transparent'
                }`}
              >
                {/* Чекбокс и текст */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    id={`item-checkbox-${item.id}`}
                    type="button"
                    onClick={() => onToggleBought(item.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      item.isBought 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20' 
                        : 'border-slate-300 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    {item.isBought && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p 
                      className={`text-sm font-medium ${
                        item.isBought 
                          ? 'text-slate-400 line-through' 
                          : 'text-slate-800'
                      }`}
                    >
                      {item.name}
                    </p>
                    {item.notes && (
                      <p className={`text-xs mt-0.5 ${item.isBought ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Кол-во, цена, действия */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50">
                  {/* Управление количеством */}
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                    <button
                      id={`item-qty-dec-${item.id}`}
                      type="button"
                      disabled={item.quantity <= 0.1}
                      onClick={() => onUpdateQty(item.id, Math.max(0.1, item.quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-all disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-slate-700 min-w-[32px] text-center font-mono">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      id={`item-qty-inc-${item.id}`}
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Цена */}
                  <div className="text-right min-w-[70px]">
                    {item.price > 0 ? (
                      <div>
                        <p className="text-xs font-mono font-bold text-slate-800">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.price} ₽/{item.unit}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Указать цену</p>
                    )}
                  </div>

                  {/* Управление и действия */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`item-edit-btn-${item.id}`}
                      type="button"
                      onClick={() => onEditItem(item)}
                      title="Редактировать товар"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`item-delete-btn-${item.id}`}
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      title="Удалить товар"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
