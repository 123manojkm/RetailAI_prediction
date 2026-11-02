import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { recommendationService } from '../services/endpoints';
import type { AccessoryItem, CatalogProductItem, BundleQuoteResponse } from '../types/api';
import {
  ShoppingBag, Search, Loader2, Star, ShieldCheck, MessageSquareQuote,
  ThumbsUp, CheckSquare, Square, Package, Tag, Percent,
  Laptop, Smartphone, Camera, Tv, Coffee, Gamepad2, Sparkles, BadgeCheck,
  CheckCircle2, Bot, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Currency Formatter (Indian Rupees ₹) ───────── */
function fmtINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ─── Category icon helper ──────────────────────── */
function CategoryIcon({ category, size = 20 }: { category: string; size?: number }) {
  const c = (category || '').toLowerCase();
  if (c.includes('gaming')) return <Gamepad2 size={size} />;
  if (c.includes('laptop') || c.includes('computer')) return <Laptop size={size} />;
  if (c.includes('phone') || c.includes('smart') || c.includes('mobile')) return <Smartphone size={size} />;
  if (c.includes('camera') || c.includes('photo')) return <Camera size={size} />;
  if (c.includes('tv') || c.includes('television')) return <Tv size={size} />;
  if (c.includes('coffee') || c.includes('espresso') || c.includes('kitchen')) return <Coffee size={size} />;
  return <ShoppingBag size={size} />;
}

/* ─── Star rating display ───────────────────────── */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.3;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} size={size} className="fill-amber-400 text-amber-400" />
      ))}
      {half && <Star size={size} className="fill-amber-400/50 text-amber-400" />}
      <span className="ml-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
        {(rating || 4.8).toFixed(1)}
      </span>
    </span>
  );
}

/* ─── Co-purchase badge colour ──────────────────── */
function coPurchaseColor(rate: number) {
  if (rate >= 90) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
  if (rate >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
  return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300';
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN RECOMMENDATIONS PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function RecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProduct = searchParams.get('product') || 'PROD-LAPTOP-01';

  const [selectedProductId, setSelectedProductId] = useState<string>(urlProduct);
  const [aiCustomData, setAiCustomData] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedAccessories, setCheckedAccessories] = useState<Set<string>>(new Set());

  const recommendationsSectionRef = useRef<HTMLDivElement>(null);

  /* ── 1. Catalog query ───────────────────────────── */
  const { data: catalog, isLoading: catalogLoading } = useQuery({
    queryKey: ['complementary-catalog'],
    queryFn: () => recommendationService.getCatalog(),
  });

  /* Sync URL param or auto-adapt to first product in active catalog */
  useEffect(() => {
    const p = searchParams.get('product');
    if (p && p !== selectedProductId) {
      setSelectedProductId(p);
      setAiCustomData(null);
    } else if (catalog && catalog.length > 0) {
      const exists = catalog.some((prod: any) => prod.product_id === selectedProductId);
      if (!exists) {
        setSelectedProductId(catalog[0].product_id);
        setAiCustomData(null);
      }
    }
  }, [searchParams, catalog, selectedProductId]);

  /* ── 2. Standard Complementary recommendations query */
  const {
    data: standardCompData,
    isLoading: compLoading,
    error: compError,
  } = useQuery({
    queryKey: ['complementary', selectedProductId],
    queryFn: () => recommendationService.getComplementary(selectedProductId),
    enabled: !!selectedProductId && !aiCustomData,
  });

  /* Active complementary data (either from AI generation or standard catalog) */
  const compData = aiCustomData || standardCompData;

  /* Auto-check all accessories whenever complementary data is loaded */
  useEffect(() => {
    if (compData?.accessories && compData.accessories.length > 0) {
      const allIds = new Set<string>(compData.accessories.map((a: any) => String(a.accessory_id)));
      setCheckedAccessories(allIds);
    }
  }, [compData]);

  /* ── 3. AI Recommend Mutation ───────────────────── */
  const aiMutation = useMutation({
    mutationFn: (productName: string) => recommendationService.getAIRecommendations(productName),
    onSuccess: (data) => {
      setAiCustomData(data);
      if (data?.accessories) {
        setCheckedAccessories(new Set<string>(data.accessories.map((a: any) => String(a.accessory_id))));
      }
      toast.success(`✨ AI recommendations generated for "${data.product.product_name}"!`, { duration: 4000 });
      setTimeout(() => {
        recommendationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'AI recommendation failed. Please try again.');
    },
  });

  function handleAISubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) {
      toast('Please enter a product name (e.g. Laptop, Phone, Camera)...');
      return;
    }
    aiMutation.mutate(aiPrompt.trim());
  }

  /* ── 4. Bundle quote calculation ────────────────── */
  const bundleMutation = useMutation({
    mutationFn: ({ pid, ids }: { pid: string; ids: string[] }) =>
      recommendationService.getBundleQuote(pid, ids),
  });

  /* Re-calculate bundle quote whenever checked items change */
  useEffect(() => {
    if (compData?.product?.product_id && checkedAccessories.size > 0) {
      bundleMutation.mutate({
        pid: compData.product.product_id,
        ids: Array.from(checkedAccessories),
      });
    }
  }, [compData, checkedAccessories]);

  /* ── User selects a catalog product ──────────────── */
  function handleSelectProduct(productId: string) {
    setAiCustomData(null);
    setSelectedProductId(productId);
    setSearchParams({ product: productId });
    setTimeout(() => {
      recommendationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  /* ── Checkbox toggles ───────────────────────────── */
  function toggleAccessory(id: string) {
    setCheckedAccessories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (!compData?.accessories) return;
    setCheckedAccessories(new Set(compData.accessories.map((a: any) => a.accessory_id)));
  }

  function deselectAll() {
    setCheckedAccessories(new Set());
  }

  /* ── Search filter for catalog ─────────────────── */
  const filteredCatalog = useMemo(() => {
    if (!catalog) return [];
    if (!searchTerm.trim()) return catalog;
    const q = searchTerm.toLowerCase();
    return catalog.filter(
      (p: CatalogProductItem) =>
        p.product_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.product_id.toLowerCase().includes(q),
    );
  }, [catalog, searchTerm]);

  /* Fallback bundle calculations if bundleMutation hasn't fired yet */
  const bundle = useMemo(() => {
    if (bundleMutation.data) return bundleMutation.data;
    if (!compData) return undefined;

    const basePrice = compData.product?.unit_price || 0;
    const selectedAcc = (compData.accessories || []).filter((a: any) => checkedAccessories.has(a.accessory_id));
    const accSubtotal = selectedAcc.reduce((sum: number, a: any) => sum + (a.unit_price || 0), 0);
    const gross = basePrice + accSubtotal;
    const discountPct = selectedAcc.length >= 3 ? 15 : selectedAcc.length === 2 ? 10 : selectedAcc.length === 1 ? 5 : 0;
    const discountAmt = accSubtotal * (discountPct / 100);
    const finalPrice = gross - discountAmt;

    return {
      product_id: compData.product?.product_id,
      product_name: compData.product?.product_name,
      base_price: basePrice,
      selected_accessories_count: selectedAcc.length,
      accessories_subtotal: accSubtotal,
      gross_total: gross,
      discount_pct: discountPct,
      discount_amount: discountAmt,
      final_bundle_price: finalPrice,
      savings: discountAmt,
      items: [
        { id: compData.product?.product_id, name: compData.product?.product_name, type: 'base', price: basePrice },
        ...selectedAcc.map((a: any) => ({ id: a.accessory_id, name: a.product_name, type: 'accessory', price: a.unit_price })),
      ],
    } as BundleQuoteResponse;
  }, [bundleMutation.data, compData, checkedAccessories]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-pink-50 via-rose-50 to-indigo-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-6 rounded-2xl border border-pink-100 dark:border-gray-700 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-xs font-bold mb-2">
            <Sparkles size={14} /> AI Retail Recommendation Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            AI Setup &amp; Accessory Recommendations
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
            Check any product (e.g. Laptop) to get AI-recommended required accessories (Mouse, Keyboard, Mousepad, Stand, Hub, Sleeve), backed by real buyer reviews and instant bundle discounts in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-gray-700/80 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 shadow-xs">
          <BadgeCheck className="text-emerald-500" size={24} />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Review Database</div>
            <div className="text-sm font-bold text-gray-800 dark:text-white">1,50,000+ Verified Reviews</div>
          </div>
        </div>
      </div>

      {/* ── 🤖 AI Recommendation Prompt Bar ──────────────── */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-gray-900 text-white p-6 rounded-2xl shadow-lg border border-purple-800/50">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="text-pink-400" size={22} />
          <h2 className="text-base font-bold text-white">
            Ask AI to Recommend Best Accessories for Any Product:
          </h2>
        </div>
        <p className="text-xs text-gray-300 mb-4">
          Type any product name below (e.g. <span className="text-pink-300 font-semibold">"Gaming Laptop"</span>, <span className="text-pink-300 font-semibold">"MacBook Pro"</span>, <span className="text-pink-300 font-semibold">"iPhone 15"</span>, <span className="text-pink-300 font-semibold">"Sony Camera"</span>) to generate complementary items with buyer reviews.
        </p>

        <form onSubmit={handleAISubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Performance Laptop, Gaming PC, iPhone 15 Pro, 4K Mirrorless Camera..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={aiMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {aiMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {aiMutation.isPending ? 'AI Analyzing...' : 'Generate with AI'}
          </button>
        </form>

        {/* Suggested AI chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-gray-700/60 text-xs">
          <span className="text-gray-400 font-medium">Quick Prompts:</span>
          {[
            'ProBook Ultra Laptop',
            'RTX 4070 Gaming Laptop',
            'Galaxy 5G Smartphone',
            'Lumix 4K Mirrorless Camera',
            'Bravia 65" 4K OLED TV',
            'Barista Espresso Machine',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => {
                setAiPrompt(promptText);
                aiMutation.mutate(promptText);
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 hover:border-pink-500 transition-all flex items-center gap-1"
            >
              <span>{promptText}</span>
              <ArrowRight size={10} className="text-pink-400" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Quick Switch Tabs ────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
          Or Select from Catalog Categories:
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'PROD-LAPTOP-01', label: '💻 ProBook Laptop (Mouse, Keyboard, Mousepad, Stand, Hub, Sleeve)', cat: 'Laptop' },
            { id: 'PROD-LAPTOP-02', label: '🎮 RTX 4070 Gaming Laptop (Gaming Mouse, Cooler)', cat: 'Gaming' },
            { id: 'PROD-PHONE-01', label: '📱 5G Smartphone (Case, Glass, 45W Charger)', cat: 'Phone' },
            { id: 'PROD-CAM-01', label: '📷 4K Camera (SD Card, Tripod, Battery Pack)', cat: 'Camera' },
            { id: 'PROD-TV-01', label: '📺 65" 4K OLED TV (Wall Mount, Soundbar, HDMI)', cat: 'TV' },
            { id: 'PROD-COFFEE-01', label: '☕ Espresso Machine (Beans, Pitcher, Tamper)', cat: 'Coffee' },
          ].map((tab) => {
            const isCurrent = !aiCustomData && selectedProductId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectProduct(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-pink-600 text-white shadow-md scale-102 ring-2 ring-pink-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product Catalog Grid Selector ────────────────── */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package size={18} className="text-pink-600" />
              Product Catalog Selector:
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Click any product to instantly view its required complementary accessories
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter catalog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {catalogLoading ? (
          <div className="p-8 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2 text-pink-600" size={28} />
            Loading catalog products...
          </div>
        ) : filteredCatalog.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCatalog.map((p: CatalogProductItem) => {
              const isSelected = !aiCustomData && selectedProductId === p.product_id;
              return (
                <div
                  key={p.product_id}
                  onClick={() => handleSelectProduct(p.product_id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/60 dark:bg-pink-950/30 shadow-md ring-2 ring-pink-400/40'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-pink-300 hover:shadow-xs'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-600 text-white shadow-xs">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      <CategoryIcon category={p.category} size={22} />
                    </div>

                    <div className="flex-1 min-w-0 pr-12">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{p.product_name}</h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.category}</div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-base font-extrabold text-pink-600 dark:text-pink-400">
                          {fmtINR(p.unit_price)}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                          +{p.accessories_count || 4} Accessories
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Active Recommendations Section Anchor ───────── */}
      <div ref={recommendationsSectionRef} className="pt-2">
        {compLoading || aiMutation.isPending ? (
          <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <Loader2 className="animate-spin mx-auto text-pink-600 mb-3" size={36} />
            <p className="text-base font-semibold text-gray-800 dark:text-white">
              AI Recommendation Engine Analyzing Co-Purchases &amp; Buyer Reviews...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Mining review database for required accessories and bundle compatibility
            </p>
          </div>
        ) : compError && !compData ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 text-red-500">
            <p className="font-semibold">Unable to load recommendations for this product.</p>
            <button
              onClick={() => handleSelectProduct('PROD-LAPTOP-01')}
              className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-lg text-xs font-semibold"
            >
              Reset to Laptop Setup
            </button>
          </div>
        ) : compData ? (
          <div className="space-y-6">
            {/* ── 1. Main Selected Product Banner ─────────── */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl p-6 shadow-xl border border-gray-700 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
                <CategoryIcon category={compData.product?.category || ''} size={240} />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-pink-600/30 border border-pink-400/40 rounded-xl text-pink-300">
                    <CategoryIcon category={compData.product?.category || ''} size={36} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        {compData.product?.category || 'Electronics'}
                      </span>
                      {compData.ai_model && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-500/40 flex items-center gap-1">
                          <Bot size={12} /> {compData.ai_model}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-mono">ID: {compData.product?.product_id}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {compData.product?.product_name}
                    </h2>
                    <p className="text-gray-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                      {compData.product?.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <Stars rating={compData.product?.rating || 4.8} size={15} />
                      <span className="text-xs text-gray-300">
                        ({(compData.product?.review_count || 5420).toLocaleString('en-IN')} verified reviews)
                      </span>
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck size={14} /> 100% Genuine Quality
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left md:text-right md:border-l md:border-gray-700 md:pl-6 min-w-[200px]">
                  <div className="text-xs font-semibold uppercase text-gray-400">Main Product Price</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-pink-400 mt-1">
                    {fmtINR(compData.product?.unit_price)}
                  </div>
                  <div className="mt-2 text-[11px] text-gray-400">
                    Showing {compData.accessories?.length || 0} Recommended Setup Items below
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. "Frequently Bought Together" Accessory Cards ─ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="text-pink-600" size={20} />
                    Frequently Bought Together With This {compData.product?.category?.split('&')[0]?.trim() || 'Item'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Co-purchase recommendations from {(compData.total_reviews_analyzed || 150000).toLocaleString('en-IN')} real buyer transactions &amp; reviews
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs px-3 py-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-semibold hover:bg-pink-200 transition"
                  >
                    Select All ({compData.accessories?.length || 0})
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {(compData.accessories || []).map((acc: AccessoryItem, idx: number) => {
                  const isChecked = checkedAccessories.has(acc.accessory_id);
                  return (
                    <div
                      key={`${acc.accessory_id || 'acc'}-${idx}`}
                      onClick={() => toggleAccessory(acc.accessory_id)}
                      className={`cursor-pointer rounded-xl border-2 p-4.5 transition-all ${
                        isChecked
                          ? 'border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 shadow-sm ring-1 ring-pink-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAccessory(acc.accessory_id);
                          }}
                          className="mt-1 flex-shrink-0 text-pink-600 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare size={22} className="text-pink-600" />
                          ) : (
                            <Square size={22} className="text-gray-400" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                              {acc.product_name}
                            </h4>
                            <span className="text-base font-extrabold text-pink-600 dark:text-pink-400 whitespace-nowrap">
                              {fmtINR(acc.unit_price)}
                            </span>
                          </div>

                          {/* Requirement & Co-purchase badge */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${coPurchaseColor(acc.co_purchase_rate)}`}>
                              ⚡ {acc.co_purchase_rate}% bought together
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                              {acc.requirement_type}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {acc.category}
                            </span>
                          </div>

                          {/* Rating & Compatibility */}
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <Stars rating={acc.rating} size={12} />
                            <span className="text-gray-500">
                              ({(acc.review_count || 1000).toLocaleString('en-IN')} reviews)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck size={13} />
                            <span>{acc.compatibility}</span>
                          </div>

                          {/* Real Verified Customer Review Quote */}
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-600">
                            <div className="flex items-start gap-2">
                              <MessageSquareQuote size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-700 dark:text-gray-200 italic leading-relaxed font-serif">
                                  "{acc.review_quote}"
                                </p>
                                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    — {acc.reviewer_name}
                                  </span>
                                  <span className="text-gray-400 flex items-center gap-0.5">
                                    <ThumbsUp size={11} /> {acc.helpful_votes} helpful votes
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 3. Interactive Setup Bundle Pricing & Savings Box ─── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-pink-300 dark:border-pink-800 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                    <Tag size={20} />
                    Complete Setup Bundle &amp; Instant Savings (INR ₹)
                  </h3>
                  <p className="text-xs text-pink-100 mt-0.5">
                    Dynamic bundle discounts automatically apply based on accessories selected
                  </p>
                </div>
                {bundle && bundle.discount_pct > 0 && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wide">
                    <Percent size={13} /> {bundle.discount_pct}% Bundle Discount Active
                  </div>
                )}
              </div>

              <div className="p-6">
                {checkedAccessories.size === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">No accessories selected</p>
                    <p className="text-xs mt-1">Select one or more accessories above to activate bundle savings!</p>
                  </div>
                ) : bundle ? (
                  <div className="space-y-4">
                    {/* Itemized list */}
                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 divide-y divide-gray-200 dark:divide-gray-600">
                      {bundle.items.map((item, idx) => (
                        <div key={`${item.id || 'item'}-${idx}`} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2 min-w-0 pr-4">
                            <BadgeCheck size={16} className={item.type === 'base' ? 'text-pink-600' : 'text-emerald-500'} />
                            <span className={item.type === 'base' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}>
                              {item.name}
                            </span>
                            {item.type === 'base' && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300">
                                Base Item
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {fmtINR(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing calculations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Main Product:</span>
                          <span className="font-mono">{fmtINR(bundle.base_price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Accessories Subtotal ({bundle.selected_accessories_count} items):</span>
                          <span className="font-mono">{fmtINR(bundle.accessories_subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 line-through">
                          <span>Standard Total:</span>
                          <span className="font-mono">{fmtINR(bundle.gross_total)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Percent size={14} /> Bundle Savings ({bundle.discount_pct}% OFF):
                          </span>
                          <span className="font-mono">-{fmtINR(bundle.discount_amount)}</span>
                        </div>
                      </div>

                      {/* Final Total & Action */}
                      <div className="flex flex-col justify-between items-start sm:items-end bg-pink-50/50 dark:bg-pink-950/20 p-4 rounded-xl border border-pink-200 dark:border-pink-800">
                        <div>
                          <div className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Final Bundle Price</div>
                          <div className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400 mt-0.5">
                            {fmtINR(bundle.final_bundle_price)}
                          </div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            🎉 Instant Savings of {fmtINR(bundle.savings)} applied!
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            toast.success(
                              `🎉 Complete Setup Bundle for "${bundle.product_name}" with ${bundle.selected_accessories_count} accessories added to order for ${fmtINR(bundle.final_bundle_price)}!`,
                              { duration: 5000 },
                            );
                          }}
                          className="mt-4 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={18} />
                          Buy Complete Setup ({fmtINR(bundle.final_bundle_price)})
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
