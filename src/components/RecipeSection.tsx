/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChefHat, Clock, Sparkles, Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import { CartItem, Recipe } from '../types';

interface RecipeSectionProps {
  currentItems: CartItem[];
  onAddIngredients: (ingredients: string[]) => void;
}

export function RecipeSection({ currentItems, onAddIngredients }: RecipeSectionProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedRecipeIds, setAddedRecipeIds] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    setRecipes([]);

    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentItems }),
      });

      if (!response.ok) {
        throw new Error('Не удалось сгенерировать рецепты. Попробуйте еще раз.');
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        // Добавим уникальные ID рецептам
        const formattedRecipes = data.recipes.map((r: any, idx: number) => ({
          ...r,
          id: `recipe-${idx}-${Date.now()}`
        }));
        setRecipes(formattedRecipes);
      } else {
        setError('ИИ не смог подобрать подходящие рецепты. Попробуйте обновить список покупок.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Произошла непредвиденная ошибка при генерации рецептов.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredientsClick = (recipeId: string, ingredients: string[]) => {
    onAddIngredients(ingredients);
    setAddedRecipeIds(prev => [...prev, recipeId]);
    setTimeout(() => {
      setAddedRecipeIds(prev => prev.filter(id => id !== recipeId));
    }, 4000);
  };

  return (
    <div id="recipe-section" className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Декоративный круг на заднем плане */}
        <div className="absolute top-1/2 -right-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-emerald-100 flex items-center gap-1.5 w-max">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Подбор рецептов от ИИ
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Что приготовить сегодня?</h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Наш ИИ-шеф проанализирует продукты в вашей корзине, предложит 3 потрясающих рецепта и подскажет, какие недостающие ингредиенты нужно купить!
            </p>
          </div>

          <button
            id="generate-recipes-btn"
            onClick={handleGenerate}
            disabled={isLoading}
            type="button"
            className="px-6 py-3.5 bg-white hover:bg-slate-50 disabled:bg-slate-200 active:bg-slate-100 font-bold text-sm text-emerald-700 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-2.5 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ищем рецепты...</span>
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5 text-emerald-600" />
                <span>Предложить идеи</span>
              </>
            )}
          </button>
        </div>

        {/* Лоадер с меняющимися шагами */}
        {isLoading && (
          <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 animate-pulse text-center space-y-2">
            <p className="text-sm font-semibold text-emerald-50">Анализируем содержимое вашей Смарт-Корзины...</p>
            <p className="text-xs text-emerald-200">Подбираем аппетитные варианты, высчитываем недостающие продукты...</p>
          </div>
        )}
      </div>

      {error && (
        <div id="recipe-error" className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Список сгенерированных рецептов */}
      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.map((recipe) => {
            const isAdded = addedRecipeIds.includes(recipe.id);
            return (
              <div
                key={recipe.id}
                id={recipe.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300"
              >
                {/* Карточка рецепта */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                      recipe.difficulty === 'Легко'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : recipe.difficulty === 'Средне'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {recipe.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {recipe.prepTime}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-base leading-tight hover:text-emerald-700 transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>

                  {/* Раздел ингредиентов */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Необходимые продукты:</h4>
                    <ul className="text-xs text-slate-600 space-y-1 leading-relaxed">
                      {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0">•</span>
                          <span className="line-clamp-1">{ing}</span>
                        </li>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <li className="text-slate-400 italic">и еще {recipe.ingredients.length - 5} позиций...</li>
                      )}
                    </ul>
                  </div>

                  {/* Инструкции приготовления */}
                  <div className="space-y-2 border-t border-slate-50 pt-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Как готовить:</h4>
                    <ol className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                      {recipe.instructions.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="flex gap-1.5">
                          <span className="font-semibold text-emerald-600 shrink-0">{idx + 1}.</span>
                          <span className="line-clamp-2">{step}</span>
                        </li>
                      ))}
                      {recipe.instructions.length > 3 && (
                        <li className="text-slate-400 italic">Пошаговое описание внутри расширенного вида...</li>
                      )}
                    </ol>
                  </div>
                </div>

                {/* Недостающие ингредиенты и Кнопка добавления */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-3.5">
                  {recipe.missingIngredients.length > 0 ? (
                    <div>
                      <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Не хватает продуктов ({recipe.missingIngredients.length}):
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {recipe.missingIngredients.join(', ')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 py-1.5 px-2.5 rounded-xl">
                      <Check className="w-4 h-4" />
                      <span>У вас есть все ингредиенты!</span>
                    </div>
                  )}

                  {recipe.missingIngredients.length > 0 && (
                    <button
                      id={`add-missing-${recipe.id}`}
                      onClick={() => handleAddIngredientsClick(recipe.id, recipe.missingIngredients)}
                      disabled={isAdded}
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm border ${
                        isAdded
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent active:scale-[0.98]'
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
                          <span>Купить недостающее</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {recipes.length === 0 && !isLoading && (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <ChefHat className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Список рецептов пуст</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Нажмите кнопку выше, чтобы ИИ проанализировал продукты в вашем списке и сгенерировал персональное меню.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
