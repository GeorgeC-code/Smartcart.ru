/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, Settings, Check, X, AlertTriangle, TrendingUp } from 'lucide-react';
import { CartItem, CATEGORIES_METADATA } from '../types';

interface BudgetCardProps {
  items: CartItem[];
  budgetLimit: number;
  onUpdateBudget: (newLimit: number) => void;
}

export function BudgetCard({ items, budgetLimit, onUpdateBudget }: BudgetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(budgetLimit.toString());

  // Расчет сумм
  const totalPlanned = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSpent = items.filter(item => item.isBought).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Расчет по категориям для графиков
  const categoriesMap: Record<string, number> = {};
  items.forEach(item => {
    const cost = item.price * item.quantity;
    if (cost > 0) {
      categoriesMap[item.category] = (categoriesMap[item.category] || 0) + cost;
    }
  });

  const categoryExpenses = Object.entries(categoriesMap).map(([name, value]) => ({
    name,
    value,
    meta: CATEGORIES_METADATA[name] || CATEGORIES_METADATA['Другое']
  })).sort((a, b) => b.value - a.value);

  const totalWithPrices = categoryExpenses.reduce((sum, cat) => sum + cat.value, 0);

  const handleSave = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(parsed);
      setIsEditing(false);
    }
  };

  const budgetProgress = budgetLimit > 0 ? (totalPlanned / budgetLimit) * 100 : 0;
  const spentProgress = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;

  // Стиль предупреждения о превышении бюджета
  const isExceeded = budgetLimit > 0 && totalPlanned > budgetLimit;
  const isNearLimit = budgetLimit > 0 && !isExceeded && totalPlanned > (budgetLimit * 0.85);

  return (
    <div id="budget-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">Бюджет & Аналитика</h3>
            <p className="text-xs text-slate-400">Контролируйте свои расходы в реальном времени</p>
          </div>
        </div>

        {/* Установка лимита */}
        <div className="flex items-center">
          {isEditing ? (
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
              <input
                id="budget-edit-input"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-20 px-2 py-1 text-xs font-semibold bg-white rounded border border-slate-200 focus:outline-emerald-500 font-mono"
                placeholder="Лимит"
                min="0"
                autoFocus
              />
              <button
                id="budget-save-btn"
                onClick={handleSave}
                type="button"
                className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded transition-all"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                id="budget-cancel-btn"
                onClick={() => {
                  setEditValue(budgetLimit.toString());
                  setIsEditing(false);
                }}
                type="button"
                className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="budget-edit-trigger-btn"
              onClick={() => setIsEditing(true)}
              type="button"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{budgetLimit > 0 ? `${budgetLimit.toLocaleString('ru-RU')} ₽` : 'Задать бюджет'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Показатели стоимости */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Планируемый итог</p>
          <p className="text-lg font-bold text-slate-800 font-mono mt-0.5">
            {totalPlanned.toLocaleString('ru-RU')} <span className="text-sm font-normal text-slate-500">₽</span>
          </p>
        </div>
        <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-50">
          <p className="text-xs text-emerald-600 font-medium">Реально потрачено</p>
          <p className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
            {totalSpent.toLocaleString('ru-RU')} <span className="text-sm font-normal text-emerald-600">₽</span>
          </p>
        </div>
      </div>

      {/* Прогресс-бар бюджета */}
      {budgetLimit > 0 && (
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Прогресс покупок относительно бюджета</span>
            <span className={`font-semibold font-mono ${isExceeded ? 'text-rose-600' : isNearLimit ? 'text-amber-600' : 'text-slate-700'}`}>
              {Math.round(budgetProgress)}%
            </span>
          </div>
          
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
            {/* Реально потрачено */}
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 absolute top-0 left-0"
              style={{ width: `${Math.min(100, spentProgress)}%` }}
            />
            {/* Запланировано */}
            <div 
              className={`h-full opacity-40 rounded-full transition-all duration-500 absolute top-0 left-0 ${
                isExceeded ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, budgetProgress)}%`, zIndex: 1 }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>0 ₽</span>
            <span>Лимит: {budgetLimit.toLocaleString('ru-RU')} ₽</span>
          </div>

          {isExceeded && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Лимит бюджета превышен на <strong className="font-mono">{(totalPlanned - budgetLimit).toLocaleString('ru-RU')} ₽</strong>! Пересмотрите список или увеличьте лимит.</span>
            </div>
          )}

          {isNearLimit && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100 mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Осталось менее <strong className="font-mono">{(budgetLimit - totalPlanned).toLocaleString('ru-RU')} ₽</strong> до лимита! Будьте внимательны.</span>
            </div>
          )}
        </div>
      )}

      {/* Аналитика по категориям */}
      {categoryExpenses.length > 0 ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Расходы по категориям
          </h4>
          <div className="space-y-2.5">
            {categoryExpenses.map((cat) => {
              const percentage = totalWithPrices > 0 ? (cat.value / totalWithPrices) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cat.meta.color.split(' ')[0].replace('text-', 'bg-')}`} />
                      {cat.meta.label}
                    </span>
                    <span className="text-slate-500 font-medium font-mono">
                      {cat.value.toLocaleString('ru-RU')} ₽ ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${cat.meta.color.split(' ')[0].replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-slate-400 italic">
          Введите цены для товаров, чтобы увидеть детальную аналитику трат
        </div>
      )}
    </div>
  );
}
