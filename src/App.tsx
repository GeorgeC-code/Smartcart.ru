/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  ShoppingCart, 
  CreditCard,
  Home, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  Volume2, 
  Crown, 
  Shield, 
  Search, 
  Download, 
  TrendingUp, 
  ArrowLeft, 
  ChevronRight,
  X,
  ArrowUp,
  Delete,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Unified interfaces for local storage consistency
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  shop: string;
  isBought: boolean;
}

interface CompletedTrip {
  id: string;
  date: string;
  shop: string;
  itemsCount: number;
  total: number;
  itemsList: { name: string; price: number; quantity: number }[];
}

export default function App() {
  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<'add' | 'cart' | 'stats' | 'settings'>('add');

  // Core reactive items container
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('smartcart_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings: budget limit
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    const saved = localStorage.getItem('smartcart_budget');
    return saved ? parseFloat(saved) : 4000;
  });

  // Settings: sound playback enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('smartcart_sound');
    return saved !== 'false';
  });

  // Settings: SmartCart Plus unlock
  const [plusActive, setPlusActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('smartcart_plus');
    return saved === 'true';
  });

  // Shopping completed trips history
  const [history, setHistory] = useState<CompletedTrip[]>(() => {
    const saved = localStorage.getItem('smartcart_history');
    if (saved) return JSON.parse(saved);
    
    // Seed default history matching ru3.png perfectly
    const defaultHistory: CompletedTrip[] = [
      {
        id: 'trip-default-1',
        date: '10 июн.',
        shop: 'СПАР',
        itemsCount: 5,
        total: 1709.00,
        itemsList: [
          { name: 'кофе', price: 850, quantity: 1 },
          { name: 'яйцо', price: 350, quantity: 1 },
          { name: 'масло', price: 189, quantity: 1 },
          { name: 'молоко', price: 90, quantity: 2 },
          { name: 'хлеб', price: 70, quantity: 2 }
        ]
      },
      {
        id: 'trip-default-2',
        date: '10 июн.',
        shop: 'LIDL',
        itemsCount: 7,
        total: 20.05,
        itemsList: [
          { name: 'йогурт', price: 15, quantity: 1 },
          { name: 'банан', price: 5, quantity: 1 }
        ]
      }
    ];
    localStorage.setItem('smartcart_history', JSON.stringify(defaultHistory));
    return defaultHistory;
  });

  // Shopping cart current store name input field
  const [currentStore, setCurrentStore] = useState<string>(() => {
    return localStorage.getItem('smartcart_current_store') || '';
  });

  // Input states on ADD screen
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');

  // Cart sorting criteria
  const [sortBy, setSortBy] = useState<'price' | 'quantity' | 'name'>('price');

  // History search filter criterion
  const [searchStore, setSearchStore] = useState<string>('');

  // Modal editor target & values
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editShop, setEditShop] = useState('');

  // History detail viewer target
  const [viewingTripDetail, setViewingTripDetail] = useState<CompletedTrip | null>(null);

  // Privacy details modal toggle state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Premium SmartCart Plus states
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallScreen, setPaywallScreen] = useState<'promo' | 'processing' | 'card_entry' | 'success'>('promo');

  // Virtual Keyboard states
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState<string>('');
  const [keyboardTempVal, setKeyboardTempVal] = useState('');
  const [keyboardType, setKeyboardType] = useState<'text' | 'numeric'>('text');
  const [keyboardSubMode, setKeyboardSubMode] = useState<'cyrillic' | 'numeric'>('cyrillic');
  const [keyboardTitle, setKeyboardTitle] = useState('');
  const [keyboardPlaceholder, setKeyboardPlaceholder] = useState('');
  const [shiftActive, setShiftActive] = useState(false);

  // Item Quantity Window states
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [qtyPendingItem, setQtyPendingItem] = useState<{ name: string; price: number } | null>(null);
  const [qtyValue, setQtyValue] = useState('1');

  // Modal states for first-time shop prompt
  const [showShopPromptModal, setShowShopPromptModal] = useState(false);
  const [tempPendingItem, setTempPendingItem] = useState<{ name: string; price: number } | null>(null);
  const [modalShopInput, setModalShopInput] = useState('');

  // Online/offline connection listener
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('smartcart_items', JSON.stringify(items));
        localStorage.setItem('smartcart_budget', budgetLimit.toString());
        localStorage.setItem('smartcart_history', JSON.stringify(history));
        localStorage.setItem('smartcart_current_store', currentStore);
      }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [items, budgetLimit, history, currentStore]);

  // Synchronizers of core variables to localStorage
  useEffect(() => {
    localStorage.setItem('smartcart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('smartcart_budget', budgetLimit.toString());
  }, [budgetLimit]);

  useEffect(() => {
    localStorage.setItem('smartcart_sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('smartcart_plus', plusActive.toString());
  }, [plusActive]);

  useEffect(() => {
    localStorage.setItem('smartcart_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('smartcart_current_store', currentStore);
  }, [currentStore]);

  // Audio synt herizer using browser Web Audio API
  const playAddBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      // Pleasant clear register chime pop
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.12);
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('Playback of synth audio failed:', e);
    }
  };

  // Triple-chime premium success melody
  const playSuccessChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime + start);
        gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      
      playTone(523.25, 0, 0.15); // C5
      playTone(659.25, 0.12, 0.15); // E5
      playTone(783.99, 0.24, 0.15); // G5
      playTone(1046.50, 0.36, 0.3); // C6
    } catch (e) {
      console.warn('Playback of success chime failed:', e);
    }
  };

  // Custom Virtual Keyboard helpers
  const playKeySound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // AudioContext fails gracefully
    }
  };

  const openVirtualKeyboard = (
    target: string, 
    title: string, 
    currentValue: string, 
    type: 'text' | 'numeric',
    placeholder = ''
  ) => {
    setKeyboardTarget(target);
    setKeyboardTitle(title);
    setKeyboardTempVal(currentValue);
    setKeyboardType(type);
    setKeyboardPlaceholder(placeholder);
    setShiftActive(false);
    setKeyboardSubMode('cyrillic');
    setKeyboardOpen(true);
  };

  const handleKeyboardDone = (finalVal: string) => {
    const val = finalVal;
    setKeyboardOpen(false);
    setKeyboardTarget('');

    switch (keyboardTarget) {
      case 'newItemName':
        setNewItemName(val);
        if (val.trim()) {
          setTimeout(() => {
            openVirtualKeyboard('newItemPrice', 'Цена товара (₽)', '', 'numeric', '0.00');
          }, 150);
        }
        break;
      case 'newItemPrice':
        setNewItemPrice(val);
        {
          const priceNum = parseFloat(val) || 0;
          setTimeout(() => {
            setQtyPendingItem({ name: newItemName.trim() || val.trim(), price: priceNum });
            setQtyValue('1');
            setShowQtyModal(true);
          }, 150);
        }
        break;
      case 'currentStore':
        setCurrentStore(val);
        break;
      case 'searchStore':
        setSearchStore(val);
        break;
      case 'budgetLimit':
        setBudgetLimit(parseFloat(val) || 0);
        break;
      case 'editName':
        setEditName(val);
        break;
      case 'editQuantity':
        setEditQuantity(val);
        break;
      case 'editPrice':
        setEditPrice(val);
        break;
      case 'editShop':
        setEditShop(val);
        break;
      case 'modalShopInput':
        setModalShopInput(val);
        break;
      case 'qtyValue':
        setQtyValue(val);
        handleAddWithQty(parseFloat(val) || 1);
        break;
      default:
        break;
    }
  };

  const handleKeyPress = (val: string) => {
    playKeySound();
    setKeyboardTempVal(prev => {
      const char = shiftActive ? val.toUpperCase() : val;
      return prev + char;
    });
  };

  const handleBackspace = () => {
    playKeySound();
    setKeyboardTempVal(prev => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    playKeySound();
    setKeyboardTempVal('');
  };

  // Add Item with specified Int/Float quantity
  const handleAddWithQty = (qty: number) => {
    if (!qtyPendingItem) return;
    const shopName = currentStore.trim() || 'СПАР';
    const createdItem: CartItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: qtyPendingItem.name,
      price: qtyPendingItem.price,
      quantity: qty,
      shop: shopName,
      isBought: false,
    };
    setItems(prev => [createdItem, ...prev]);
    playAddBeep();

    setQtyPendingItem(null);
    setShowQtyModal(false);

    // Reset add item inputs
    setNewItemName('');
    setNewItemPrice('');
  };

  // 1. Core items addition method - triggers Quantity Modal
  const handleAddNewItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const priceNum = parseFloat(newItemPrice) || 0;

    // Check if store name is absent or if we are starting a clean list (first item) and store name is not set
    if (items.length === 0 && !currentStore.trim()) {
      setTempPendingItem({ name: newItemName.trim(), price: priceNum });
      setModalShopInput('');
      setShowShopPromptModal(true);
      return;
    }

    // Directly open Quantity Selection Modal
    setQtyPendingItem({ name: newItemName.trim(), price: priceNum });
    setQtyValue('1');
    setShowQtyModal(true);
  };

  const handleConfirmShop = () => {
    const shopName = modalShopInput.trim() || 'СПАР';
    setCurrentStore(shopName);

    if (tempPendingItem) {
      // Instead of direct insert, route through quantity window!
      setQtyPendingItem({ name: tempPendingItem.name, price: tempPendingItem.price });
      setQtyValue('1');
      setShowQtyModal(true);
    }

    setTempPendingItem(null);
    setShowShopPromptModal(false);

    // Reset input fields
    setNewItemName('');
    setNewItemPrice('');
  };

  // 2. Clear items completely
  const handleClearCart = () => {
    if (items.length === 0) return;
    if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
      setItems([]);
      setCurrentStore('');
    }
  };

  // 3. Increment / Decrement quantity direct modifier
  const changeItemQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  // 4. Trigger Modal Box
  const triggerEditModal = (item: CartItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price ? item.price.toString() : '');
    setEditQuantity(item.quantity.toString());
    setEditShop(item.shop);
  };

  // 5. Save edited item changes from Modal Form
  const saveEditedItem = (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setItems(prev => prev.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: editName.trim(),
          price: parseFloat(editPrice) || 0,
          quantity: parseInt(editQuantity) || 1,
          shop: editShop.trim(),
        };
      }
      return item;
    }));

    setEditingItem(null);
  };

  // Remove single item
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Checkout complete trip
  const handleCheckout = () => {
    if (items.length === 0) return;

    if (history.length >= 5 && !plusActive) {
      setPaywallScreen('promo');
      setShowPaywallModal(true);
      return;
    }

    const currentSpent = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const checkStoreName = currentStore.trim() || 'СУПЕРМАРКЕТ';

    const newTrip: CompletedTrip = {
      id: `trip-${Date.now()}`,
      // Formatted date string e.g. "16 июн."
      date: new Date().toLocaleDateString('ru', { day: 'numeric', month: 'short' }),
      shop: checkStoreName.toUpperCase(),
      itemsCount: items.length,
      total: currentSpent,
      itemsList: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))
    };

    setHistory(prev => [newTrip, ...prev]);
    setItems([]);
    setCurrentStore('');
    
    // Play celebratory double tone beep sequence
    if (soundEnabled) {
      setTimeout(() => playAddBeep(), 0);
      setTimeout(() => playAddBeep(), 100);
    }

    setActiveTab('stats');
  };

  // Delete single history log
  const handleResetHistory = () => {
    if (window.confirm('Вы уверены, что хотите полностью стереть историю покупок?')) {
      setHistory([]);
    }
  };

  // CSV Generator downloader
  const handleDownloadCSV = () => {
    if (history.length === 0) {
      alert('История покупок пуста. Добавьте покупки для экспорта.');
      return;
    }
    const headers = ['Дата', 'Магазин / Супермаркет', 'Количество товаров', 'Сумма (руб)'];
    const rows = history.map(trip => [
      trip.date,
      trip.shop,
      trip.itemsCount,
      trip.total.toFixed(2)
    ]);
    
    // Simple excel-friendly Russian semicolon CSV string join
    const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smartcart_expenses_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculated totals
  const currentSpent = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const percentageUsed = budgetLimit > 0 ? (currentSpent / budgetLimit) * 100 : 0;

  const getPluralGoods = (count: number) => {
    const rem10 = count % 10;
    const rem100 = count % 100;
    if (rem10 === 1 && rem100 !== 11) {
      return `${count} товар`;
    }
    if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 >= 20)) {
      return `${count} товара`;
    }
    return `${count} товаров`;
  };

  // Autocomplete/suggestion list extractor from current active list and completed history list
  const getProductSuggestions = (query: string): string[] => {
    if (!query || query.trim().length === 0) return [];
    const normalizedQuery = query.toLowerCase().trim();
    const uniqueNames = new Set<string>();

    // 1. Check current active items
    items.forEach(item => {
      if (item.name && item.name.trim()) {
        uniqueNames.add(item.name.trim());
      }
    });

    // 2. Check historical items
    history.forEach(trip => {
      if (trip.itemsList) {
        trip.itemsList.forEach(histItem => {
          if (histItem.name && histItem.name.trim()) {
            uniqueNames.add(histItem.name.trim());
          }
        });
      }
    });

    // Filter starting with query first, then those containing query (prefix is main priority)
    const list = Array.from(uniqueNames);
    const startsWithMatches = list.filter(name => 
      name.toLowerCase().startsWith(normalizedQuery) && 
      name.toLowerCase() !== normalizedQuery
    );
    const includesMatches = list.filter(name => 
      !name.toLowerCase().startsWith(normalizedQuery) && 
      name.toLowerCase().includes(normalizedQuery) && 
      name.toLowerCase() !== normalizedQuery
    );

    return [...startsWithMatches, ...includesMatches].slice(0, 5);
  };

  // Sorting logics
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'price') {
      return (b.price * b.quantity) - (a.price * a.quantity);
    } else if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  // Searching history list list
  const filteredHistory = history.filter(trip => 
    trip.shop.toLowerCase().includes(searchStore.toLowerCase())
  );

  const historyTotalExpenses = filteredHistory.reduce((sum, trip) => sum + trip.total, 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans antialiased text-[#2D2B24] flex justify-center">
      
      {/* Centered Desktop Responsive Frame (Authentic mobile mockup context) */}
      <div className="w-full max-w-md bg-[#FAF9F6] min-h-screen shadow-2xl relative flex flex-col border-x border-[#EFECE5] pb-24">
        
        {/* TOP STATUS HEADER BAR */}
        <div id="app-top-header" className="px-5 pt-5 pb-3 bg-white border-b border-[#F2EDE4] sticky top-0 z-40 shadow-sm/5 leading-none">
          {activeTab === 'add' ? (
            <div className="flex items-center justify-between">
              {/* Distinctive stylized App Logo */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#E30613] text-white rounded-2xl flex items-center justify-center shadow-md shadow-red-600/10 active:scale-95 transition-transform">
                  <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-[21px] font-extrabold tracking-tight font-sans text-slate-900 leading-none">
                    СмартКарт
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">Умный список покупок</p>
                </div>
              </div>

              {/* Wallet total balance pill indicator */}
              <div 
                onClick={() => setActiveTab('settings')}
                className="bg-[#E6F7F3] hover:bg-[#D5EFEA] border border-[#D5EFEA] text-[#227C67] px-3.5 py-2.5 rounded-full flex items-center gap-1.5 font-extrabold text-sm transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#34A88E] stroke-[2.5]" />
                <span>{budgetLimit}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {/* Back to main home button */}
              <button 
                onClick={() => setActiveTab('add')}
                className="bg-white border border-[#E4E0D5] hover:bg-[#FAF9F5] text-[#E30613] px-4 py-2 rounded-full flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Главная</span>
              </button>

              {/* Wallet total balance pill indicator */}
              <div 
                onClick={() => setActiveTab('settings')}
                className="bg-[#E6F7F3] hover:bg-[#D5EFEA] border border-[#D5EFEA] text-[#227C67] px-3.5 py-2.5 rounded-full flex items-center gap-1.5 font-extrabold text-sm transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#34A88E] stroke-[2.5]" />
                <span>{budgetLimit}</span>
              </div>
            </div>
          )}

          {/* SHARED PROGRESS BUDGET CONTAINER */}
          <div className="mt-4 pt-1.5 border-t border-[#F5F2EA]">
            <div className="flex items-center justify-between mb-1.5 text-xs text-[#525048] font-semibold">
              <span className="tracking-wide uppercase text-[10px] font-black text-[#A5A29B]">Расход бюджета</span>
              <span className="font-extrabold text-[#E30613] text-sm">
                {Math.round(percentageUsed)}%
              </span>
            </div>

            {/* Aesthetic customized horizontal bar */}
            <div className="h-2.5 w-full bg-[#ECEBE5] rounded-full overflow-hidden flex">
              <div 
                className="bg-[#E30613] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, percentageUsed)}%` }}
              />
            </div>

            {/* Numerical details tag */}
            <div className="flex justify-end mt-1.5">
              <div className="bg-[#FCF4F4] text-[#E30613] font-extrabold text-xs px-3.5 py-1 rounded-full border border-red-50/60 shadow-sm/5 tracking-tight font-sans">
                {Math.ceil(currentSpent)} <span className="text-[#8D8A7D] font-medium text-[9px] mx-0.5">/</span> <span className="text-[#55524A]">{Math.ceil(budgetLimit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGES VIEWS */}
        <main className="flex-1 px-5 pt-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: ADD POSITION (GLAVNAYA) */}
            {history.length >= 5 && !plusActive && activeTab !== 'settings' ? (
              <motion.div
                key="locked-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border-2 border-red-100 rounded-[32px] p-6 text-center space-y-6 shadow-xl relative overflow-hidden my-4"
              >
                {/* Visual decoration top lock */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
                
                <div className="w-16 h-16 bg-red-50 text-[#E30613] rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                  <Lock className="w-7 h-7 stroke-[2.5]" />
                  <span className="absolute inset-0 rounded-full border border-red-200 animate-ping opacity-35" />
                </div>

                <div className="space-y-2">
                  <span className="bg-[#E30613] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest leading-none font-sans shadow-sm animate-pulse">
                    Доступ заблокирован
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">Бесплатная версия исчерпана</h3>
                  <p className="text-xs text-[#605D55] font-semibold leading-relaxed">
                    Вы успешно сделали <strong className="text-slate-950 font-black">{history.length} поездок</strong> в магазин. Дальнейшее пользование заблокировано.
                  </p>
                  <p className="text-[11px] text-amber-700 bg-amber-50 rounded-xl p-2 font-bold leading-normal">
                    Чтобы продолжить, активируйте постоянный бессрочный доступ SmartCart Plus без ограничений и рекламы.
                  </p>
                </div>

                {/* Symmetrical divider with benefits */}
                <div className="bg-slate-50/55 border border-slate-100 rounded-2xl p-4 space-y-3 text-left font-sans">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <p className="text-[11px] text-[#4F4D45] font-bold">Вечный безлимитный учет всех продуктов</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <p className="text-[11px] text-[#4F4D45] font-bold">Быстрый автоподбор продуктов на букву ввода</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <p className="text-[11px] text-[#4F4D45] font-bold">Полный экспорт чеков в Excel / CSV</p>
                  </div>
                </div>

                {/* Main Action Purchase Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPaywallScreen('promo');
                      setShowPaywallModal(true);
                    }}
                    className="w-full bg-[#E30613] hover:bg-neutral-900 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Разблокировать Plus (199 ₽)</span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        playSuccessChime();
                        setPlusActive(true);
                      }}
                      className="hover:text-slate-600 hover:underline cursor-pointer"
                    >
                      Восстановить покупку
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className="text-[#E30613] hover:underline cursor-pointer font-extrabold"
                    >
                      В настройки (тестирование)
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'add' ? (
              <motion.div
                key="add-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Visual Card to initiate interactive flow */}
                <div className="bg-white border border-[#EFECE5] rounded-[24px] p-3 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setNewItemName('');
                      setNewItemPrice('');
                      openVirtualKeyboard('newItemName', 'Название товара', '', 'text', 'например: кофе, яйцо...');
                    }}
                    className="w-full bg-[#E30613] hover:bg-[#C9010C] text-white py-3.5 rounded-[18px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Добавить товар</span>
                  </button>
                </div>

                {/* Quick preview of last inputs or draft states (Optional) */}
                {newItemName && (
                  <div className="bg-[#FAF9F5] border border-[#ECE6DB] rounded-2xl p-4 flex justify-between items-center text-xs text-slate-500">
                    <span className="font-semibold">Черновик:</span>
                    <span className="font-black text-[#E30613] uppercase">
                      {newItemName} {newItemPrice ? `— ${newItemPrice} ₽` : ''}
                    </span>
                  </div>
                )}

                {/* Redirection link pill button to cart overview */}
                <button
                  onClick={() => setActiveTab('cart')}
                  className="w-full bg-white border border-[#ECE9DF] hover:bg-[#FAF9F5] text-[#2D2B24] py-4 rounded-full font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 cursor-pointer mt-2"
                >
                  <ShoppingCart className="w-5 h-5 text-[#E01B24] stroke-[2.2]" />
                  <span>Посмотреть корзину ({items.length})</span>
                </button>

                {/* Sleek Low-Profile Plus Promo Progress Indicator */}
                {!plusActive && (
                  <div
                    type="button"
                    onClick={() => {
                      setPaywallScreen('promo');
                      setShowPaywallModal(true);
                    }}
                    className="w-full bg-[#FAF9F5] border border-amber-200/50 hover:border-amber-300 rounded-[22px] p-4 flex flex-col gap-2.5 shadow-sm transition-all hover:bg-amber-50/25 active:scale-98 cursor-pointer relative overflow-hidden font-sans mt-3 text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-400 stroke-[2.5] shrink-0" />
                        <span className="font-extrabold text-xs text-slate-800">SmartCart Plus (199 ₽)</span>
                      </div>
                      <span className="font-black text-[9px] text-[#E30613] bg-red-50 border border-red-100/60 px-2 py-0.5 rounded uppercase tracking-wider">
                        {history.length >= 5 ? 'Лимит исчерпан' : `Осталось ${5 - history.length}`}
                      </span>
                    </div>

                    {/* Progress Bar track */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/40">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-[#E30613] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (history.length / 5) * 100)}%` }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-[#2D2B24] font-black leading-none">
                        Использовано {history.length} из 5 бесплатных поездок
                      </p>
                      <p className="text-[9.5px] text-slate-400 font-medium leading-relaxed leading-snug">
                        Разблокируйте бессрочный безлимит поездок, умные подсказки и экспорт CSV
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}

            {/* VIEW 2: CART LOG */}
            {!(history.length >= 5 && !plusActive) && activeTab === 'cart' && (
              <motion.div
                key="cart-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {/* Title & metrics row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1B1A16] leading-none">Корзина</h2>
                    <span className="text-[10px] font-black text-[#A09E95] tracking-widest uppercase mt-1 inline-block">
                      {getPluralGoods(items.length)}
                    </span>
                  </div>

                  {/* Sorters pills row */}
                  <div className="flex gap-1.5 bg-[#EEECE4] p-1 rounded-full">
                    <button
                      onClick={() => setSortBy('price')}
                      className={`text-[9px] font-black px-2.5 py-1 rounded-full transition-all uppercase tracking-wider flex items-center gap-1 ${
                        sortBy === 'price' ? 'bg-[#E30613] text-white shadow-sm' : 'text-[#504F4A] hover:text-[#111]'
                      }`}
                    >
                      ЦЕНЕ
                      <TrendingUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => setSortBy('quantity')}
                      className={`text-[9px] font-black px-2.5 py-1 rounded-full transition-all uppercase tracking-wider ${
                        sortBy === 'quantity' ? 'bg-[#E30613] text-white shadow-sm' : 'text-[#504F4A] hover:text-[#111]'
                      }`}
                    >
                      КОЛИЧЕСТВУ
                    </button>
                    <button
                      onClick={() => setSortBy('name')}
                      className={`text-[9px] font-black px-2.5 py-1 rounded-full transition-all uppercase tracking-wider ${
                        sortBy === 'name' ? 'bg-[#E30613] text-white shadow-sm' : 'text-[#504F4A] hover:text-[#111]'
                      }`}
                    >
                      НАЗВАНИЮ
                    </button>
                  </div>
                </div>

                {/* Items collection cards panel */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {sortedItems.length === 0 ? (
                    <div className="bg-white rounded-[24px] border border-[#ECE7DC] p-8 text-center text-[#9E9B93] space-y-2">
                      <ShoppingCart className="w-10 h-10 mx-auto opacity-40 text-[#A2A096]" />
                      <p className="text-sm font-semibold">Ваша корзина пуста</p>
                      <button
                        onClick={() => setActiveTab('add')}
                        className="text-xs font-black text-[#E30613] hover:underline"
                      >
                        Добавить товары
                      </button>
                    </div>
                  ) : (
                    sortedItems.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-white border border-[#EFECE5] rounded-[24px] p-4 flex items-center justify-between shadow-sm/5 active:bg-[#FCFAFA] transition-all"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          {/* Lowercase exact spelling label matcher */}
                          <h4 className="text-sm font-bold text-[#1F1E19] truncate lowercase font-sans">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 leading-none">
                            {/* Quantity badge count */}
                            <span 
                              onClick={() => changeItemQuantity(item.id, 1)}
                              className="bg-[#FAF9F5] hover:bg-[#ECE8DC] px-2 py-1 rounded-lg text-[10px] font-extrabold text-[#605F58] cursor-pointer transition-colors border border-[#E8E4D9] font-sans"
                            >
                              x{item.quantity}
                            </span>
                            <span className="text-xs font-extrabold text-[#E30613] whitespace-nowrap font-sans tracking-tight">
                              {(item.price * item.quantity).toFixed(2)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-[#A29F95] font-semibold">
                                ({item.price.toFixed(2)} шт.)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Decrease count trigger */}
                          {item.quantity > 1 && (
                            <button
                              onClick={() => changeItemQuantity(item.id, -1)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 bg-[#FAF9F5] border border-[#ECE7DC] rounded-xl transition-all"
                              title="Уменьшить количество"
                            >
                              <span className="text-xs font-bold leading-none block h-3.5 w-3.5 select-none font-sans">-</span>
                            </button>
                          )}
                          <button
                            onClick={() => triggerEditModal(item)}
                            className="p-2 text-slate-400 hover:text-[#E30613] hover:bg-red-50 rounded-xl transition-all"
                            title="Редактировать"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Optional store name input field */}
                <div className="pt-2">
                  <label className="block text-[10px] font-black text-[#A09E95] uppercase tracking-wider mb-1.5">
                    Название магазина (опционально)
                  </label>
                  <input
                    type="text"
                    value={currentStore}
                    onClick={() => openVirtualKeyboard('currentStore', 'Название магазина', currentStore, 'text', 'спар')}
                    inputMode="none"
                    readOnly
                    placeholder="спар"
                    className="w-full bg-white border border-[#ECE7DC] rounded-xl px-4 py-3.5 text-sm font-semibold text-[#1E1D19] focus:outline-none focus:ring-1 focus:ring-[#E30613] transition-all cursor-pointer"
                  />
                </div>

                {/* Sage Green Grand Total Card */}
                <div className="bg-[#7EA199] text-white rounded-[24px] p-5 flex justify-between items-center shadow-md shadow-[#7EA199]/10">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#CCE2DD] uppercase block">
                      Итого
                    </span>
                    <h3 className="text-2xl font-black tracking-tight mt-1 leading-none font-sans">
                      {currentSpent.toFixed(2)}
                    </h3>
                  </div>

                  <div className="w-11 h-11 bg-[#5E837B] rounded-2xl flex items-center justify-center text-white shadow-inner">
                    <CreditCard className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>

                {/* Buttons block */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={items.length === 0}
                    className="w-full bg-[#76A07B] hover:bg-[#648B69] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-[20px] font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Завершить</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('add')}
                    className="w-full bg-white border border-[#E9E8E2] text-[#55524B] hover:bg-[#FAF9F6] py-3.5 rounded-[20px] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Вернуться к покупкам</span>
                  </button>

                  {items.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="w-full text-center text-xs font-bold text-red-500 hover:text-red-700 py-1 transition-colors"
                    >
                      Очистить текущие товары в корзине
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 3: STATISTICS EXPENDITURES */}
            {!(history.length >= 5 && !plusActive) && activeTab === 'stats' && (
              <motion.div
                key="stats-screen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Title & Export CSV section */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#1B1A16] leading-none font-sans uppercase tracking-tight">статистика</h2>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (history.length >= 5 && !plusActive) {
                          setPaywallScreen('promo');
                          setShowPaywallModal(true);
                          return;
                        }
                        const customStoreName = prompt('Введите название магазина:', 'СПАР');
                        const customTotal = prompt('Введите общую сумму:', '150');
                        if (customStoreName && customTotal) {
                          const parsedVal = parseFloat(customTotal) || 0;
                          const customTrip: CompletedTrip = {
                            id: `trip-custom-${Date.now()}`,
                            date: new Date().toLocaleDateString('ru', { day: 'numeric', month: 'short' }),
                            shop: customStoreName.toUpperCase(),
                            itemsCount: 1,
                            total: parsedVal,
                            itemsList: [{ name: 'ручной ввод', price: parsedVal, quantity: 1 }]
                          };
                          setHistory(p => [customTrip, ...p]);
                        }
                      }}
                      className="w-10 h-10 bg-white hover:bg-[#FAF9F5] border border-[#ECE7DC] rounded-xl flex items-center justify-center text-slate-700 font-extrabold transition-all shadow-sm active:scale-95"
                      title="Добавить вручную"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <button
                      onClick={handleDownloadCSV}
                      className="bg-white border border-[#ECE7DC] hover:bg-[#FAF9F5] text-[#E30613] px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold text-[11px] tracking-wider transition-all shadow-sm active:scale-95 uppercase"
                    >
                      <Download className="w-3.5 h-3.5 text-[#E01B24]" />
                      <span>Экспорт CSV</span>
                    </button>
                  </div>
                </div>

                {/* White container card details */}
                <div className="bg-white border border-[#EFECE5] rounded-[28px] p-4 shadow-sm/5 space-y-4">
                  {/* Search Bar query */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchStore}
                      onClick={() => openVirtualKeyboard('searchStore', 'Поиск по магазину', searchStore, 'text', 'Поиск...')}
                      inputMode="none"
                      readOnly
                      placeholder="Поиск по магазину"
                      className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-[#302F29] focus:outline-none focus:ring-1 focus:ring-[#E30613] placeholder:text-[#A8A59E] transition-all cursor-pointer"
                    />
                    <Search className="w-4 h-4 text-[#A19E95] absolute left-3 top-3" />
                  </div>

                  {/* Expenses breakdown */}
                  <div className="pt-2 border-t border-[#F5F2EA]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-4 h-4 text-[#E30613]" />
                      <h4 className="text-xs font-black text-[#A09E95] uppercase tracking-wider">
                        Ежемесячные расходы
                      </h4>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="text-[11px] font-black text-[#302F29] tracking-wider uppercase font-sans">
                        ИЮНЬ 2026 Г.
                      </span>
                      <span className="text-[25px] font-extrabold font-sans tracking-tight text-[#161512] leading-none pb-0.5">
                        {historyTotalExpenses.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last entries listing block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-[#A09E95]">Последние покупки</span>
                    {history.length > 0 && (
                      <button
                        onClick={handleResetHistory}
                        className="text-[#3A3FDA] hover:underline cursor-pointer"
                      >
                        очистить историю
                      </button>
                    )}
                  </div>

                  {/* Mapping trips */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {filteredHistory.length === 0 ? (
                      <div className="text-center bg-white border border-[#ECE7DC] rounded-xl p-6 text-sm text-[#9E9C94] font-medium">
                        Покупок не обнаружено.
                      </div>
                    ) : (
                      filteredHistory.map((trip) => (
                        <div
                          key={trip.id}
                          onClick={() => setViewingTripDetail(trip)}
                          className="p-4 flex justify-between items-center bg-white border border-[#EFECE5] rounded-[24px] shadow-sm/5 transition active:bg-slate-50 cursor-pointer hover:border-[#E30613]/20"
                        >
                          <div>
                            <div className="flex items-center gap-2 leading-none">
                              <span className="text-xs font-bold text-[#1E1D19]">{trip.date}</span>
                              <span className="bg-[#FCF4F4] text-[#E30613] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#FEDADA] uppercase tracking-wider leading-none">
                                {trip.shop || 'СПАР'}
                              </span>
                            </div>
                            <span className="text-[9px] font-black tracking-widest text-[#A2A096] uppercase mt-1.5 block">
                              {trip.itemsCount} ТОВАРОВ
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-sm font-extrabold text-[#10100F] tracking-tight font-sans">
                              {trip.total.toFixed(2)}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 4: SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5"
              >
                {/* Premium status/unlock block */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-[24px] p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-sans">
                        <Crown className="w-5 h-5 text-amber-600 fill-amber-500" />
                        <h4 className="text-sm font-extrabold text-[#1F1D19] font-sans">
                          {plusActive ? 'SmartCart Plus активирован' : 'Улучшить до SmartCart Plus'}
                        </h4>
                      </div>
                      <p className="text-[10px] text-amber-800 font-semibold leading-relaxed font-sans">
                        {plusActive 
                          ? 'Спасибо за поддержку! Вам доступны безлимитные поездки, умные подсказки и экспорт CSV.'
                          : 'Лимит бесплатной версии: 5 поездок. Разблокируйте бессрочный безлимит без рекламы.'}
                      </p>
                    </div>
                    {plusActive ? (
                      <span className="bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-sans">
                        PLUS
                      </span>
                    ) : (
                      <span className="bg-[#E30613] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-sans">
                        SALE
                      </span>
                    )}
                  </div>

                  {plusActive ? (
                    <div className="flex justify-between items-center bg-white/40 rounded-xl px-3.5 py-2.5 border border-amber-200/50 font-sans">
                      <span className="text-[10px] text-amber-900 font-bold">Тестирование оплаты:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Сбросить статус SmartCart Plus для тестирования?')) {
                            setPlusActive(false);
                            localStorage.setItem('smartcart_plus', 'false');
                            alert('Премиум-статус сброшен для тестирования!');
                          }
                        }}
                        className="text-[9px] font-black text-red-500 uppercase tracking-wider hover:underline cursor-pointer"
                      >
                        Сбросить
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-1 font-sans">
                      <div className="flex justify-between items-end">
                        <div className="flex gap-1 items-baseline">
                          <span className="text-lg font-black text-amber-900 font-sans">199 ₽</span>
                          <span className="text-xs text-amber-800/60 font-semibold line-through">299 ₽</span>
                        </div>
                        <span className="text-[9px] text-[#242A5C] bg-indigo-50 border border-indigo-100 font-black px-2 py-0.5 rounded uppercase font-sans tracking-wide">
                          RuStore Интеграция
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaywallScreen('promo');
                          setShowPaywallModal(true);
                        }}
                        className="w-full bg-[#E30613] hover:bg-neutral-900 text-white font-extrabold text-[11px] uppercase tracking-widest py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>Разблокировать за 199 ₽</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 1. Budget setter input block */}
                <div className="bg-white border border-[#EFECE5] rounded-[24px] p-5 shadow-sm space-y-2">
                  <label className="block text-[11px] font-black text-[#A09E95] uppercase tracking-wider">
                    Бюджет на покупки
                  </label>
                  <input
                    type="text"
                    value={budgetLimit ? budgetLimit.toString() : ''}
                    onClick={() => openVirtualKeyboard('budgetLimit', 'Бюджет на покупки (₽)', budgetLimit ? budgetLimit.toString() : '', 'numeric', '4000')}
                    inputMode="none"
                    readOnly
                    placeholder="4000"
                    className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl px-4 py-3 text-lg font-extrabold text-[#2D2B24] focus:outline-none focus:ring-1 focus:ring-[#E30613] font-sans cursor-pointer"
                  />
                </div>

                {/* 2. Sound Feedback sound toggle */}
                <div className="bg-white border border-[#EFECE5] rounded-[24px] p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1F1D19]">Звуковой отклик</h4>
                      <p className="text-[10px] text-[#A5A29A] font-semibold mt-1">
                        Проверить звук добавления товара
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Play Sound node direct click action */}
                      <button
                        onClick={playAddBeep}
                        className="w-9 h-9 bg-red-50 text-[#E30613] rounded-full flex items-center justify-center border border-red-100 hover:bg-red-100 active:scale-90 transition-all shadow-sm"
                        title="Воспроизвести сигнал теста"
                      >
                        <Volume2 className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      {/* Switch control element */}
                      <button
                        onClick={() => setSoundEnabled(p => !p)}
                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                          soundEnabled ? 'bg-[#76A07B]' : 'bg-slate-300'
                        }`}
                      >
                        <div 
                          className={`w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] shadow transition-all ${
                            soundEnabled ? 'left-[23px]' : 'left-[3px]'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Connection Offline state monitor */}
                <div className="bg-white border border-[#EFECE5] rounded-[24px] p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1C1A16]">Хранение и офлайн</h4>
                      <p className="text-[10px] text-[#A5A29A] font-semibold mt-1">
                        Данные сохраняются локально на устройстве
                      </p>
                    </div>

                    {isOnline ? (
                      <span className="bg-[#E6F7F3] text-[#34A88E] text-[10px] font-black px-2.5 py-1 rounded-full border border-[#D5EFEA] tracking-wider uppercase">
                        ● В СЕТИ
                      </span>
                    ) : (
                      <span className="bg-[#FCF4F4] text-[#D32F2F] text-[10px] font-black px-2.5 py-1 rounded-full border border-[#FADCDD] tracking-wider uppercase">
                        ● ОФЛАЙН
                      </span>
                    )}
                  </div>

                  {/* Red lightning banner notice */}
                  <div className="p-3 bg-[#FCF4F4] border border-[#FADCDD] rounded-xl flex items-start gap-2.5 mt-2">
                    <Check className="w-4 h-4 text-[#D32F2F] shrink-0 stroke-[3] mt-0.5" />
                    <p className="text-[11px] text-[#D32F2F] font-bold leading-relaxed">
                      Офлайн поддержка включена. Работает без интернета.
                    </p>
                  </div>
                </div>

                {/* 5. Privacy Disclosure click list */}
                <div 
                  onClick={() => setShowPrivacyModal(true)}
                  className="bg-white border border-[#EFECE5] rounded-[24px] p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                      <Shield className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1C1A16]">О приватности</h4>
                      <p className="text-[10px] text-slate-400 font-bold leading-none mt-1">
                        Безопасность и данные
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* PERSISTENT FLOATING BOTTOM NAV BAR */}
        <nav id="app-bottom-navbar" className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-[#F2ECE2] px-3 flex items-center justify-around z-40 shadow-lg select-none leading-none">
          
          <button
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center gap-1.5 transition-colors duration-150 py-1.5 break-none min-w-[70px] ${
              activeTab === 'add' ? 'text-[#E30613]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === 'add' ? 'bg-red-50' : ''}`}>
              <Plus className="w-5.5 h-5.5 stroke-[2.8]" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase">
              ДОБАВИТЬ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center gap-1.5 transition-colors duration-150 py-1.5 relative min-w-[70px] ${
              activeTab === 'cart' ? 'text-[#E30613]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {/* Dynamic red badge count indicator for listed items */}
            {items.length > 0 && (
              <span className="absolute top-0 right-3.5 w-5 h-5 bg-[#E30613] text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center leading-none z-10 font-sans tracking-tight">
                {items.length}
              </span>
            )}
            <div className={`p-1.5 rounded-full ${activeTab === 'cart' ? 'bg-red-50' : ''}`}>
              <ShoppingCart className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase">
              КОРЗИНА
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1.5 transition-colors duration-150 py-1.5 min-w-[70px] ${
              activeTab === 'stats' ? 'text-[#E30613]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === 'stats' ? 'bg-red-50' : ''}`}>
              <TrendingUp className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase">
              СТАТИСТИКА
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1.5 transition-colors duration-150 py-1.5 min-w-[70px] ${
              activeTab === 'settings' ? 'text-[#E30613]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === 'settings' ? 'bg-red-50' : ''}`}>
              <X className="w-5.5 h-5.5 stroke-[2.2] rotate-45" /> {/* Styled Cog Settings look */}
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase">
              настройки
            </span>
          </button>

        </nav>

      </div>

      {/* POPUP MODAL 1: EDIT CORE ITEM */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 bg-[#161512]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] border border-[#ECE7DC] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
                <h3 className="font-extrabold text-[#1D1B16] text-sm">Редактирование товара</h3>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={saveEditedItem} className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Название</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onClick={() => openVirtualKeyboard('editName', 'Название товара', editName, 'text', '')}
                    inputMode="none"
                    readOnly
                    className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#E30613] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Количество</label>
                    <input
                      type="text"
                      required
                      value={editQuantity}
                      onClick={() => openVirtualKeyboard('editQuantity', 'Количество (шт/кг)', editQuantity, 'numeric', '')}
                      inputMode="none"
                      readOnly
                      className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl px-3.5 py-2.5 text-sm font-extrabold focus:outline-none focus:ring-1 focus:ring-[#E30613] font-sans cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Цена за ед.</label>
                    <input
                      type="text"
                      value={editPrice}
                      onClick={() => openVirtualKeyboard('editPrice', 'Цена за ед.', editPrice, 'numeric', '')}
                      inputMode="none"
                      readOnly
                      className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl px-3.5 py-2.5 text-sm font-extrabold focus:outline-none focus:ring-1 focus:ring-[#E30613] font-sans cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Магазин</label>
                  <input
                    type="text"
                    value={editShop}
                    onClick={() => openVirtualKeyboard('editShop', 'Магазин', editShop, 'text', '')}
                    inputMode="none"
                    readOnly
                    className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#E30613] cursor-pointer"
                  />
                </div>

                <div className="flex gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl uppercase tracking-wider"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#E30613] hover:bg-[#C9010C] text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL 2: TRIP HISTORIC DETAILS */}
      <AnimatePresence>
        {viewingTripDetail && (
          <div className="fixed inset-0 bg-[#161512]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] border border-[#ECE7DC] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center px-5 py-4 bg-[#FCFBF8] border-b border-[#F2ECE3]">
                <div>
                  <span className="text-[9px] font-black text-[#A09E95] tracking-widest uppercase">Покупка в истории</span>
                  <h3 className="font-extrabold text-[#1D1B16] text-sm mt-0.5">
                    {viewingTripDetail.shop} — {viewingTripDetail.date}
                  </h3>
                </div>
                <button 
                  onClick={() => setViewingTripDetail(null)}
                  className="p-1 bg-white border border-[#EDEADF] rounded-full text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List of that Trip */}
              <div className="p-5 space-y-3 max-h-[280px] overflow-y-auto">
                {viewingTripDetail.itemsList?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-[#F9F7F3] last:border-0 lowercase font-sans">
                    <div className="truncate">
                      <span className="font-bold text-[#1E1C18] block truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5 leading-none">Кол-во: x{item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 ml-2">
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                {(!viewingTripDetail.itemsList || viewingTripDetail.itemsList.length === 0) && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Список товаров недоступен для этой архивной записи.</p>
                )}
              </div>

              {/* Footer Total summary */}
              <div className="bg-[#FAF9F5] p-5 border-t border-[#F2ECE3] flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">ИТОГО РАСХОДОВ</span>
                <span className="text-lg font-black text-[#E30613]">{viewingTripDetail.total.toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL 3: PRIVACY DETAILS INFO */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-[#161512]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] border border-[#ECE7DC] w-full max-w-sm p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start leading-none">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#34A88E]" />
                  <h3 className="font-bold text-[#1B1915]">О приватности СмартКарт</h3>
                </div>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-[#545147] leading-relaxed">
                <p>
                  <strong>Локальное хранилище данных:</strong> Все ваши списки покупок, бюджет и история трат сохраняются исключительно в вашем браузере с помощью технологии local caching.
                </p>
                <p>
                  <strong>Полная автономность:</strong> Приложение работает абсолютно без внешних облачных серверов, сохраняя ваши покупки строго конфиденциальными.
                </p>
                <p>
                  <strong>Никакой телеметрии:</strong> Мы не передаем рекламные куки, трекеры или анонимную статистику третьим лицам.
                </p>
              </div>

              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-[#E30613] text-white py-3 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Понятно
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL 7: RUSTORE SMARTCART PLUS PAYWALL */}
      <AnimatePresence>
        {showPaywallModal && (
          <div className="fixed inset-0 bg-[#161512]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] border border-[#ECE7DC] w-full max-w-md overflow-hidden shadow-2xl flex flex-col font-sans"
            >
              {/* Promo Screen */}
              {paywallScreen === 'promo' && (
                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-start leading-none pb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm">
                        <Crown className="w-5 h-5 fill-amber-400 stroke-[2]" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base leading-none">SmartCart Plus</h3>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">вечный премиум доступ</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPaywallModal(false)}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 text-center space-y-1">
                    <p className="text-xs font-black text-amber-900">
                      Лимит бесплатных поездок исчерпан ({history.length} из 5)
                    </p>
                    <p className="text-[10px] text-amber-800/80 font-medium leading-relaxed">
                      Для ведения дальнейшего учета и разблокировки всех функций требуется разовое приобретение.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    {/* Feature 1 */}
                    <div className="flex gap-3.5 items-start">
                      <div className="w-7 h-7 bg-indigo-50 border border-indigo-100/50 rounded-lg flex items-center justify-center shrink-0 text-indigo-500">
                        <Crown className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800">Безлимитные поездки</h4>
                        <p className="text-[11px] text-[#605D55] leading-relaxed">
                          Сохраняйте неограниченное число походов в магазины и ведите подробный архив.
                        </p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex gap-3.5 items-start">
                      <div className="w-7 h-7 bg-red-50 border border-red-100/50 rounded-lg flex items-center justify-center shrink-0 text-[#E30613]">
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800">Умные автоподсказки под полем</h4>
                        <p className="text-[11px] text-[#605D55] leading-relaxed">
                          Моментальный подбор ранее внесенных продуктов при наборе первой буквы.
                        </p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex gap-3.5 items-start">
                      <div className="w-7 h-7 bg-emerald-50 border border-emerald-100/50 rounded-lg flex items-center justify-center shrink-0 text-emerald-600">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800">Полный экспорт в Excel/CSV</h4>
                        <p className="text-[11px] text-[#605D55] leading-relaxed">
                          Выгружайте свои чеки и детальную статистику трат одним нажатием.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">ЕДИНОРАЗОВО</span>
                      <div className="flex items-baseline gap-1.5 leading-none">
                        <span className="text-2xl font-black text-slate-950">199 ₽</span>
                        <span className="text-xs font-bold text-slate-400 line-through">299 ₽</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded uppercase font-sans tracking-wide">СКИДКА -33%</span>
                      <p className="text-[9px] text-[#4F4D45] font-semibold mt-1">Оплата через RuStore Pay</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setPaywallScreen('card_entry')}
                      className="w-full bg-[#E30613] hover:bg-neutral-900 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Перейти к оплате (199 ₽)</span>
                    </button>

                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          playSuccessChime();
                          setPlusActive(true);
                          setPaywallScreen('success');
                        }}
                        className="hover:text-slate-600 hover:underline cursor-pointer"
                      >
                        Восстановить покупку
                      </button>
                      <span>Безопасная транзакция SSL</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card & SBP Entry Page */}
              {paywallScreen === 'card_entry' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 leading-none pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPaywallScreen('promo')}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Оплата RuStore</h4>
                      <p className="text-[10px] text-slate-400 font-bold">SmartCart Plus • 199 ₽</p>
                    </div>
                  </div>

                  {/* Payment Simulator Selection */}
                  <div className="space-y-3.5">
                    {/* Method 1: SBP QR Code Mock */}
                    <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#242A5C] text-white flex items-center justify-center font-extrabold text-[10px]">СБП</span>
                          <span className="text-xs font-black text-slate-800">Быстрая оплата СБП / Мир Pay</span>
                        </div>
                        <span className="text-[9px] bg-red-50 text-[#E30613] font-bold px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wider scale-90">Рекомендовано</span>
                      </div>

                      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200/40">
                        {/* Simulating QR code graphic */}
                        <div 
                          onClick={() => {
                            setPaywallScreen('processing');
                            setTimeout(() => {
                              setPlusActive(true);
                              playSuccessChime();
                              setPaywallScreen('success');
                            }, 1800);
                          }}
                          className="w-16 h-16 bg-slate-200 rounded-md border border-slate-300 flex flex-col items-center justify-center p-1.5 cursor-pointer hover:bg-slate-300 transition-colors"
                          title="Нажмите на QR для быстрого теста оплаты"
                        >
                          {/* Inner pixels mock */}
                          <div className="grid grid-cols-4 gap-1 w-full h-full opacity-70">
                            {[...Array(16)].map((_, i) => (
                              <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 5 === 1 ? 'bg-slate-800' : 'bg-transparent'}`} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 leading-normal font-sans">
                            Наведите камеру или нажмите на QR-код для мгновенной оплаты через СБП.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setPaywallScreen('processing');
                              setTimeout(() => {
                                setPlusActive(true);
                                playSuccessChime();
                                setPaywallScreen('success');
                              }, 1800);
                            }}
                            className="bg-[#242A5C] hover:bg-neutral-900 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all inline-block cursor-pointer"
                          >
                            Оплатить СБП
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[10px] font-bold text-slate-400 py-1">ИЛИ ОПЛАТИТЕ КАРТОЙ</div>

                    {/* Method 2: Detailed Premium Bank Card entry simulator */}
                    <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white shadow-inner">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Номер банковской карты</label>
                        <input
                          type="text"
                          readOnly
                          value="2200 4812 3456 7890"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 tracking-wider focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">Срок действия</label>
                          <input
                            type="text"
                            readOnly
                            value="12 / 29"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-700 tracking-wider focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-sans">код CVC</label>
                          <input
                            type="text"
                            readOnly
                            value="***"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-700 tracking-wider focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPaywallScreen('processing');
                          setTimeout(() => {
                            setPlusActive(true);
                            playSuccessChime();
                            setPaywallScreen('success');
                          }, 1800);
                        }}
                        className="w-full bg-[#E30613] hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Заплатить картой • 199 ₽
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing page */}
              {paywallScreen === 'processing' && (
                <div className="p-8 text-center space-y-5 py-12">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#E30613] animate-spin" />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <h4 className="font-extrabold text-slate-900 text-sm font-sans">Обработка защищенного платежа...</h4>
                    <p className="text-[10px] text-slate-400 font-bold font-sans"> RuStore Billing • Пожалуйста, подождите </p>
                  </div>

                  <p className="text-[10px] text-slate-500/80 leading-relaxed max-w-[85%] mx-auto font-medium font-sans">
                    Осуществляется шифрованная авторизация транзакции. Не сворачивайте окно в процессе отправки запроса банку.
                  </p>
                </div>
              )}

              {/* Success celebration Page */}
              {paywallScreen === 'success' && (
                <div className="p-6 text-center space-y-5 pb-8">
                  {/* Glowing success circle animation */}
                  <div className="w-16 h-16 bg-emerald-50 rounded-full border-2 border-emerald-200 flex items-center justify-center text-emerald-500 mx-auto shadow-md shadow-emerald-500/5 mt-3 relative">
                    <Check className="w-8 h-8 stroke-[3.5] animate-bounce" />
                    <span className="absolute inset-0 rounded-full border-4 border-emerald-400 opacity-20 animate-ping" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-black text-slate-900 text-base font-sans">Премиум-доступ активирован!</h3>
                    <p className="text-[10px] text-emerald-600 font-black tracking-widest uppercase">SmartCart Plus разблокирован</p>
                  </div>

                  <p className="text-[11px] text-[#55524B] leading-relaxed max-w-[90%] mx-auto font-sans">
                    Покупка успешно проведена через безопасный шлюз RuStore. Благодарим за поддержку нашего проекта! Лимиты поездок полностью сняты.
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left font-mono text-[10px] text-slate-500 space-y-0.5 max-w-[85%] mx-auto">
                    <div className="flex justify-between">
                      <span>Транзакция:</span>
                      <span className="font-bold text-slate-700">RUSTORE-TX-9502</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Сумма:</span>
                      <span className="font-bold text-slate-700">199.00 RUB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Опция:</span>
                      <span className="font-bold text-slate-700">ВЕЧНЫЙ PLUS</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPaywallModal(false);
                      setPaywallScreen('promo');
                    }}
                    className="w-full bg-[#E30613] hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md cursor-pointer animate-pulse"
                  >
                    Начать безлимитные покупки!
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL 4: SHOP NAME PROMPT BEFORE FIRST ITEM */}
      <AnimatePresence>
        {showShopPromptModal && (
          <div className="fixed inset-0 bg-[#161512]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] border border-[#ECE7DC] w-full max-w-sm p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="space-y-1">
                <ShoppingCart className="w-10 h-10 mx-auto text-[#E30613]" />
                <h3 className="font-extrabold text-[#1D1B16] text-base">Где вы совершаете покупки?</h3>
                <p className="text-xs text-slate-500 font-bold leading-normal">
                  Пожалуйста, укажите название магазина или супермаркета перед добавлением первого товара.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={modalShopInput}
                  onClick={() => openVirtualKeyboard('modalShopInput', 'Название магазина', modalShopInput, 'text', 'например: Спар, Магнит...')}
                  inputMode="none"
                  readOnly
                  placeholder="например: Спар, Магнит..."
                  className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl px-4 py-3 text-sm font-semibold text-center text-[#302F29] focus:outline-none focus:ring-1 focus:ring-[#E30613] placeholder:text-[#A8A59E] transition-all cursor-pointer"
                />

                <div className="flex gap-2 text-xs uppercase tracking-wider font-extrabold">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShopPromptModal(false);
                      setTempPendingItem(null);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmShop}
                    className="flex-1 bg-[#E30613] hover:bg-[#C9010C] text-white py-3 rounded-xl transition-all"
                  >
                    Продолжить
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW POPUP MODAL 5: SMALL FLOATING QUANTITY SELECTOR */}
      <AnimatePresence>
        {showQtyModal && qtyPendingItem && (
          <div className="fixed inset-0 bg-[#161512]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] border border-[#ECE7DC] w-full max-w-sm p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="space-y-1">
                <div className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                  "{qtyPendingItem.name}"
                </div>
              </div>

              {/* Predefined values grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 5, 10].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddWithQty(preset)}
                      className="py-2.5 text-xs font-black rounded-lg border border-[#ECE6DB] bg-[#FAF9F5] text-slate-700 hover:bg-[#E30613] hover:text-white hover:border-[#E30613] active:scale-95 transition-all cursor-pointer font-sans"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable manual qty with virtual keyboard compatibility */}
              <div className="space-y-1.5 text-left">
                <input
                  type="text"
                  value={qtyValue}
                  onClick={() => openVirtualKeyboard('qtyValue', 'Количество (кг/шт)', qtyValue, 'numeric', '1')}
                  inputMode="none"
                  readOnly
                  placeholder="1"
                  className="w-full bg-[#FAF9F5] border border-[#ECE6DB] rounded-xl px-4 py-3 text-sm font-extrabold text-center text-[#302F29] focus:outline-none focus:ring-1 focus:ring-[#E30613] transition-all cursor-pointer font-sans"
                />
              </div>

              <div className="flex gap-2 text-xs uppercase tracking-wider font-extrabold pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowQtyModal(false);
                    setQtyPendingItem(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl transition-all cursor-pointer font-sans"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => handleAddWithQty(parseFloat(qtyValue) || 1)}
                  className="flex-1 bg-[#E30613] hover:bg-[#C9010C] text-white py-3.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-red-700/10 font-sans"
                >
                  Добавить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW POPUP MODAL 6: CUSTOM VIRTUAL KEYBOARD WITH BACKDROP BLUR */}
      <AnimatePresence>
        {keyboardOpen && (
          <div className="fixed inset-0 bg-[#161512]/55 backdrop-blur-sm z-[100] flex flex-col justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] border border-[#ECE7DC] w-full max-w-lg mx-auto p-5 shadow-2xl flex flex-col space-y-4 text-center select-none"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">{keyboardTitle}</span>
                <span className="text-[10px] font-bold text-slate-300">Клавиатура приложения</span>
              </div>

              {/* Display Screener / Input Draft bar */}
              <div className="relative bg-[#FAF9F5] border border-[#ECE6DB] rounded-2xl px-4 py-3 min-h-[50px] flex items-center justify-between text-left">
                <span className={`text-[17px] font-black ${keyboardTempVal ? 'text-[#302F29]' : 'text-slate-400'}`}>
                  {keyboardTempVal || keyboardPlaceholder || 'Начните ввод...'}
                </span>
                {keyboardTempVal && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded-lg font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    очистить
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions */}
              {(keyboardTarget === 'newItemName' || keyboardTarget === 'editName') && keyboardTempVal.trim().length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center py-1">
                  {getProductSuggestions(keyboardTempVal).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        playKeySound();
                        setKeyboardTempVal(suggestion);
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#E30613] font-bold text-xs rounded-full border border-red-200/50 transition-all cursor-pointer shadow-sm active:scale-95 font-sans"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Cyrillic or Numeric Grid selection layout */}
              {keyboardType === 'text' ? (
                <div className="space-y-2 pt-1 font-sans">
                  {keyboardSubMode === 'cyrillic' ? (
                    <>
                      {/* Row 1 - й-ъ */}
                      <div className="flex gap-1 justify-center">
                        {['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'].map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => handleKeyPress(char)}
                            className="flex-1 py-3.5 sm:py-4 text-sm md:text-base font-bold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer min-w-0"
                          >
                            {shiftActive ? char.toUpperCase() : char}
                          </button>
                        ))}
                      </div>

                      {/* Row 2 - ф-э */}
                      <div className="flex gap-1 justify-center">
                        {['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'].map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => handleKeyPress(char)}
                            className="flex-1 py-3.5 sm:py-4 text-sm md:text-base font-bold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer min-w-0"
                          >
                            {shiftActive ? char.toUpperCase() : char}
                          </button>
                        ))}
                      </div>

                      {/* Row 3 - Shift, я-ю, dot, Backspace */}
                      <div className="flex gap-1 justify-center">
                        {/* Shift key */}
                        <button
                          type="button"
                          onClick={() => { playKeySound(); setShiftActive(!shiftActive); }}
                          className={`px-3 md:px-4 py-3.5 sm:py-4 rounded-xl border text-sm font-black select-none transition-all flex items-center justify-center cursor-pointer ${
                            shiftActive 
                              ? 'bg-[#E30613] text-white border-[#E30613]' 
                              : 'bg-[#ECE7DC] text-[#302F29] border-[#D9D3C5] hover:bg-[#DDD7C9]'
                          }`}
                        >
                          <ArrowUp className="w-4.5 h-4.5 stroke-[3]" />
                        </button>

                        {['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'].map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => handleKeyPress(char)}
                            className="flex-1 py-3.5 sm:py-4 text-sm md:text-base font-bold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer min-w-0"
                          >
                            {shiftActive ? char.toUpperCase() : char}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleKeyPress('.')}
                          className="px-3.5 py-3.5 sm:py-4 text-sm font-black rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] text-[#302F29] hover:bg-[#F2ECE0] active:scale-95 transition-all select-none cursor-pointer"
                        >
                          .
                        </button>

                        {/* Backspace */}
                        <button
                          type="button"
                          onClick={handleBackspace}
                          className="px-3 md:px-4 py-3.5 sm:py-4 rounded-xl bg-[#ECE7DC] border border-[#D9D3C5] text-[#302F29] hover:bg-[#DDD7C9] active:scale-95 transition-all select-none flex items-center justify-center cursor-pointer"
                        >
                          <Delete className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Submode - Numeric details */}
                      {/* Row 1 */}
                      <div className="flex gap-1 justify-center">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
                          <button
                            key={digit}
                            type="button"
                            onClick={() => handleKeyPress(digit)}
                            className="flex-1 py-3.5 sm:py-4 text-sm md:text-base font-bold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer min-w-0"
                          >
                            {digit}
                          </button>
                        ))}
                      </div>

                      {/* Row 2 */}
                      <div className="flex gap-1 justify-center">
                        {['-', '/', ':', ';', '(', ')', '₽', '&', '@', '"'].map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => handleKeyPress(char)}
                            className="flex-1 py-3.5 sm:py-4 text-sm md:text-base font-bold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer min-w-0"
                          >
                            {char}
                          </button>
                        ))}
                      </div>

                      {/* Row 3 */}
                      <div className="flex gap-1 justify-center">
                        <div className="px-3" /> {/* Spacer */}
                        {['.', ',', '?', '!', "'", '_', '#', '%', '+', '='].map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => handleKeyPress(char)}
                            className="flex-1 py-3.5 sm:py-4 text-sm md:text-base font-bold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer min-w-0"
                          >
                            {char}
                          </button>
                        ))}
                        {/* Backspace */}
                        <button
                          type="button"
                          onClick={handleBackspace}
                          className="px-3 md:px-4 py-3.5 sm:py-4 rounded-xl bg-[#ECE7DC] border border-[#D9D3C5] text-[#302F29] hover:bg-[#DDD7C9] active:scale-95 transition-all select-none flex items-center justify-center cursor-pointer"
                        >
                          <Delete className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Space Row & actions */}
                  <div className="flex gap-2 pt-2">
                    {/* Switch layout button */}
                    <button
                      type="button"
                      onClick={() => {
                        playKeySound();
                        setKeyboardSubMode(prev => prev === 'cyrillic' ? 'numeric' : 'cyrillic');
                      }}
                      className="px-4 py-3.5 rounded-xl bg-[#ECE7DC] border border-[#D9D3C5] text-[#302F29] hover:bg-[#DDD7C9] font-black text-xs transition-all cursor-pointer"
                    >
                      {keyboardSubMode === 'cyrillic' ? '123' : 'АБВ'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { playKeySound(); setKeyboardOpen(false); }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-700 font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      Отмена
                    </button>

                    {/* Space bar */}
                    <button
                      type="button"
                      onClick={() => handleKeyPress(' ')}
                      className="flex-[2] py-3.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] text-xs font-black uppercase tracking-widest border border-[#ECE6DB] select-none transition-all cursor-pointer"
                    >
                      Пробел
                    </button>

                    <button
                      type="button"
                      onClick={() => handleKeyboardDone(keyboardTempVal)}
                      className="flex-1 bg-[#E30613] hover:bg-[#C9010C] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      Ввод
                    </button>
                  </div>
                </div>
              ) : (
                /* NUMERIC DIALPAD LAYOUT */
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeyPress(digit)}
                        className="py-4 text-xl font-extrabold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleKeyPress('.')}
                      className="py-4 text-xl font-extrabold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer"
                    >
                      .
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeyPress('0')}
                      className="py-4 text-xl font-extrabold rounded-xl bg-[#FAF9F5] border border-[#ECE6DB] hover:bg-[#F2ECE0] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="py-4 text-xl font-extrabold rounded-xl bg-[#ECE7DC] border border-[#D9D3C5] hover:bg-[#DDD7C9] active:scale-95 text-[#302F29] select-none transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { playKeySound(); setKeyboardOpen(false); }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-700 font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeyboardDone(keyboardTempVal)}
                      className="flex-1 bg-[#E30613] hover:bg-[#C9010C] text-white font-extrabold text-[#fff] text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      Готово
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

