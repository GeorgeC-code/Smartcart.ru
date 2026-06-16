/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { Sparkles, Plus, Loader2, Info } from 'lucide-react';
import { CartItem } from '../types';
import { determineLocalCategory } from '../utils/localCategories';

interface SmartInputProps {
  onAddItems: (items: Omit<CartItem, 'id' | 'isBought' | 'addedAt'>[]) => void;
}

export function SmartInput({ onAddItems }: SmartInputProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'smart'>('standard');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('шт');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const [smartText, setSmartText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  const handleStandardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedQty = parseFloat(quantity) || 1;
    const parsedPrice = parseFloat(price) || 0;
    const cat = determineLocalCategory(name);

    onAddItems([
      {
        name: name.trim(),
        quantity: parsedQty,
        unit,
        price: parsedPrice,
        category: cat,
        notes: notes.trim() || undefined,
      },
    ]);

    setName('');
    setQuantity('1');
    setPrice('');
    setNotes('');
  };

  const handleSmartSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!smartText.trim() || isParsing) return;

    setIsParsing(true);
    setParseError('');

    try {
      const response = await fetch('/api/parse-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: smartText }),
      });

      if (!response.ok) {
        throw new Error('Ошибка связи с ИИ-сервером');
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        // Добавим товары
        onAddItems(data.items);
        setSmartText('');
      } else {
        setParseError('ИИ не распознал товары. Попробуйте написать по-другому.');
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Ошибка распознавания. Проверьте интернет или API ключ.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleQuickTemplate = (text: string) => {
    setSmartText(text);
  };

  return (
    <div id="smart-input-container" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5">
        <button
          id="tab-standard-btn"
          type="button"
          onClick={() => setActiveTab('standard')}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
            activeTab === 'standard'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Обычное добавление
        </button>
        <button
          id="tab-smart-btn"
          type="button"
          onClick={() => setActiveTab('smart')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'smart'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Умный ввод ИИ
        </button>
      </div>

      {activeTab === 'standard' ? (
        <form id="standard-add-form" onSubmit={handleStandardSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label htmlFor="item-name-input" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Название товара</label>
              <input
                id="item-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Сыр Маасдам или Яблоки"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:col-span-4 gap-2">
              <div>
                <label htmlFor="item-qty-input" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Кол-во</label>
                <input
                  id="item-qty-input"
                  type="number"
                  step="any"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label htmlFor="item-unit-select" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Ед. изм.</label>
                <select
                  id="item-unit-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm"
                >
                  <option value="шт">шт (под.)</option>
                  <option value="кг">кг</option>
                  <option value="л">л</option>
                  <option value="уп">уп</option>
                  <option value="г">г</option>
                  <option value="пак">пак</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="item-price-input" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Цена, ₽ (за ед.)</label>
              <input
                id="item-price-input"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm font-mono placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor="item-notes-input" className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Заметка / Бренд (необязятельно)</label>
              <input
                id="item-notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Например: жирность 3.2% или только со скидкой"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800 text-sm"
              />
            </div>
            <button
              id="standard-submit-btn"
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all h-[42px] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
        </form>
      ) : (
        <form id="smart-add-form" onSubmit={handleSmartSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="smart-text-textarea" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Введите текст списка свободной формой
              </label>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Info className="w-3 h-3" />
                Работает на Gemini AI
              </span>
            </div>
            <textarea
              id="smart-text-textarea"
              value={smartText}
              onChange={(e) => setSmartText(e.target.value)}
              placeholder="Например: 2л молока, пачка сливочного масла, 1.5кг бананов, докторская колбаса 500г и стиральный порошок"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800 text-sm leading-relaxed"
              required
            />
          </div>

          {parseError && (
            <div id="smart-parse-error" className="p-3 text-xs bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
              {parseError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-400">Попробуйте кликнуть:</span>
              <button
                id="smart-mock-1-btn"
                type="button"
                onClick={() => handleQuickTemplate('Сливки 20%, 3 помидора, свежий базилик и спагетти')}
                className="text-xs text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1 rounded-lg transition-all"
              >
                Для пасты
              </button>
              <button
                id="smart-mock-2-btn"
                type="button"
                onClick={() => handleQuickTemplate('Яблоки 1кг, бананы 5шт, 2 литра апельсинового сока, овсяное печенье')}
                className="text-xs text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-2.5 py-1 rounded-lg transition-all"
              >
                Фруктовый перекус
              </button>
            </div>

            <button
              id="smart-submit-btn"
              type="submit"
              disabled={isParsing || !smartText.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all h-[42px]"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Распознаем...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Распознать ИИ</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
