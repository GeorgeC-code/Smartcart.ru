/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Инициализация Google Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Умный парсинг сырого текста/голоса
app.post('/api/parse-cart', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
       res.status(400).json({ error: 'Пожалуйста, укажите текст для парсинга' });
       return;
    }

    const prompt = `Распарси этот текст списка покупок в структурированный JSON-массив. Названия товаров должны быть на РУССКОМ языке.
Постарайся определить количество, единицу измерения (шт, кг, л, уп, г), ориентировочную цену за единицу в рублях (если упомянуто, иначе укажи 0) и подходящую категорию.

Доступные категории строго из этого списка:
- 'Молочные продукты'
- 'Овощи и Фрукты'
- 'Бакалея'
- 'Мясо и Рыба'
- 'Хлеб и Выпечка'
- 'Напитки'
- 'Заморозка'
- 'Сладости'
- 'Хозтовары'
- 'Другое'

Текст списка покупок:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Ты - продвинутый ассистент по покупкам. Твоя единственная цель - точно распарсить сырой текст пользователя в список структурированных позиций для покупок в магазине.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Название товара на русском языке (например, "Молоко", "Картошка")' },
              quantity: { type: Type.NUMBER, description: 'Количество товара' },
              unit: { type: Type.STRING, description: 'Единица измерения (шт, кг, л, уп, г)' },
              price: { type: Type.NUMBER, description: 'Ориентировочная цена за единицу в рублях, если указана, иначе 0' },
              category: { type: Type.STRING, description: 'Категория товара строго из списка разрешенных' },
              notes: { type: Type.STRING, description: 'Дополнительные примечания (например, жирность у молока или бренд, если упомянут)' }
            },
            required: ['name', 'quantity', 'unit', 'price', 'category']
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || '[]');
    res.json({ items: parsedData });
  } catch (error: any) {
    console.error('Ошибка в parse-cart:', error);
    res.status(500).json({ error: 'Не удалось обработать текст', details: error.message });
  }
});

// 2. Определение категории товара с помощью ИИ
app.post('/api/categorize', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
       res.status(400).json({ error: 'Укажите название товара' });
       return;
    }

    const prompt = `Какая категория лучше всего подходит для товара "${name}"?
Доступные категории строго из этого списка:
- 'Молочные продукты'
- 'Овощи и Фрукты'
- 'Бакалея'
- 'Мясо и Рыба'
- 'Хлеб и Выпечка'
- 'Напитки'
- 'Заморозка'
- 'Сладости'
- 'Хозтовары'
- 'Другое'

Верни только название категории как строку в поле "category".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          },
          required: ['category']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ category: parsedData.category || 'Другое' });
  } catch (error: any) {
    console.error('Ошибка в categorize:', error);
    res.json({ category: 'Другое', fallback: true });
  }
});

// 3. Генерация рецептов на русском на основе текущих покупок
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const { currentItems } = req.body;
    const itemsList = (currentItems || []).map((it: any) => `${it.name} (${it.quantity} ${it.unit})`).join(', ');

    const prompt = `Предложи ровно 3 аппетитных и простых пошаговых рецепта на РУССКОМ языке, которые можно приготовить, используя некоторые или все из этих товаров в списке покупок: "${itemsList}".
Для каждого рецепта укажи:
- Название рецепта.
- Краткое описание, почему это вкусно.
- Ингредиенты, которые нужны в рецепте.
- Пошаговую инструкцию приготовления.
- Время приготовления (например, "30 мин").
- Сложность приготовления (одно из значений: "Легко", "Средне", "Сложно").
- Список недостающих ингредиентов, которые НЕ упомянуты в списке покупок выше (пользователь сможет легко добавить их в корзину!).

Формат вывода должен быть строго валидным JSON-массивом рецептов.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Ты - креативный шеф-повар. Помогай пользователям придумывать вкусные рецепты на русском языке на основе продуктов в их корзине.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Название блюда' },
              description: { type: Type.STRING, description: 'Аппетитное описание блюда' },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Все необходимые ингредиенты с дозировкой' },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Пошаговые понятные инструкции.' },
              prepTime: { type: Type.STRING, description: 'Время приготовления' },
              difficulty: { type: Type.STRING, description: 'Сложность (Легко, Средне или Сложно)' },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Названия недостающих продуктов на русском, которые отсутствуют в списке покупок' }
            },
            required: ['title', 'description', 'ingredients', 'instructions', 'prepTime', 'difficulty', 'missingIngredients']
          }
        }
      }
    });

    const parsedRecipes = JSON.parse(response.text || '[]');
    res.json({ recipes: parsedRecipes });
  } catch (error: any) {
    console.error('Ошибка в generate-recipes:', error);
    res.status(500).json({ error: 'Не удалось сгенерировать рецепты', details: error.message });
  }
});

// Vite middleware для интеграции фронтенда в продакшн/девелопмент средах
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер SmartCart успешно запущен на порту ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
