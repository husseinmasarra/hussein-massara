import React, { useState } from "react";
import { X, Trash2, Plus, Minus, Ticket, Check, AlertCircle, ShoppingBag, ShieldCheck } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Product, Coupon, SystemSettings, OrderItem } from "../types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  settings: SystemSettings;
  coupons: Coupon[];
  onCheckout: (address: string, phone: string, couponCode?: string, discountAmount?: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  settings,
  coupons,
  onCheckout
}: CartDrawerProps) {
  const { language, t } = useLanguage();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  if (!isOpen) return null;

  // Calcul totals
  const subtotalUSD = cartItems.reduce((sum, item) => sum + item.product.priceUSD * item.quantity, 0);
  
  // Decide delivery cost based on settings threshold
  const isFreeDelivery = subtotalUSD >= settings.freeDeliveryThresholdUSD;
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFeeUSD;

  // Compute coupon discount
  let discountUSD = 0;
  if (activeCoupon) {
    if (subtotalUSD >= activeCoupon.minOrderValueUSD) {
      if (activeCoupon.discountType === "percentage") {
        discountUSD = Number(((subtotalUSD * activeCoupon.value) / 100).toFixed(1));
      } else {
        discountUSD = activeCoupon.value;
      }
    }
  }

  const totalUSD = Math.max(0, subtotalUSD + deliveryFee - discountUSD);

  // Conversion exchange rate to LBP display
  const totalLBP = totalUSD * settings.usdToLbpRate;
  const subtotalLBP = subtotalUSD * settings.usdToLbpRate;
  const deliveryLBP = deliveryFee * settings.usdToLbpRate;
  const discountLBP = discountUSD * settings.usdToLbpRate;

  // Coupon handling
  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;

    const matched = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
    if (!matched) {
      setCouponError(t("couponError"));
      setActiveCoupon(null);
      return;
    }

    if (subtotalUSD < matched.minOrderValueUSD) {
      setCouponError(`${t("couponError")} - Min: $${matched.minOrderValueUSD}`);
      setActiveCoupon(null);
      return;
    }

    setActiveCoupon(matched);
    setCouponSuccess(t("couponSuccess"));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) return;
    onCheckout(address, phone, activeCoupon?.code, discountUSD);
    
    // reset form
    setAddress("");
    setPhone("");
    setCouponCode("");
    setActiveCoupon(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Container Panel */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-805/85 animate-scale-up my-6 max-h-[92vh] flex flex-col">
        
        {/* Absolute Big Close Cross */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          title={t("cartExit")}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header toolbar */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800/80 flex items-center gap-2 bg-slate-50 dark:bg-slate-950/30 select-none">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-extrabold text-slate-850 dark:text-slate-100 font-sans">
            {t("cartTitle")} ({cartItems.length})
          </h3>
          <span className="text-3s font-bold text-red-500 uppercase font-mono tracking-wider ml-auto bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md">
            COD ONLY
          </span>
        </div>

        {/* Dual splits container */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* RIGHT SIDE: Cart list of items */}
          <div className="lg:col-span-7 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-800 lg:order-2">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-850/60 text-slate-400 rounded-2xl mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans max-w-xs mx-auto leading-relaxed">
                  {t("emptyCart")}
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-blue-600 text-white font-sans text-xs font-bold rounded-xl hover:bg-blue-700 transition"
                >
                  {t("cartExit")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 sm:gap-4 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-950/20 border border-gray-100 dark:border-slate-800/80 hover:border-gray-200 dark:hover:border-slate-700 transition-all"
                  >
                    {/* Tiny realistic image thumbnail */}
                    <img
                      src={item.product.image}
                      alt={item.product.nameEn}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200/50 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />

                    {/* Metadata columns */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-sans truncate">
                          {language === "ar" ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                            {t("currencyUSD")}{item.product.priceUSD}
                          </span>
                          <span className="text-[10px] text-slate-450 font-mono">
                            / LBP {(item.product.priceUSD * settings.usdToLbpRate).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Increments & delete toolbar */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-0.5 shadow-sm">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LEFT SIDE: Invoice billing and checkout calculations (Req - 5: وفي اليسار يوجد حساب الفاتورة...) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/40 flex flex-col justify-between lg:order-1">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono">
                {t("totalInvoice")}
              </h4>

              {/* Free delivery target visual progress bar */}
              {cartItems.length > 0 && (
                <div className="mb-6 p-3.5 rounded-2xl border bg-white dark:bg-slate-900 border-blue-100/50 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 mb-1.5 font-sans">
                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-3s sm:text-xs text-slate-700 dark:text-slate-350">
                      {isFreeDelivery 
                        ? t("congratsFreeDelivery") 
                        : t("freeDeliveryAlert").replace("{amount}", `$${settings.freeDeliveryThresholdUSD.toLocaleString()}`)}
                    </span>
                  </div>
                  {!isFreeDelivery && (
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-700"
                        style={{ width: `${Math.min(100, (subtotalUSD / settings.freeDeliveryThresholdUSD) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Cost Calculations layout */}
              <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 font-mono">
                
                {/* Subtotal */}
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-sans">{t("subtotal")}</span>
                  <div className="text-right">
                    <div className="font-bold text-slate-800 dark:text-slate-200">${subtotalUSD.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">LBP {subtotalLBP.toLocaleString()}</div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-dashed border-gray-100 dark:border-slate-801">
                  <span className="font-sans">{t("deliveryFee")}</span>
                  <div className="text-right">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {deliveryFee === 0 ? t("freeDelivery") : `$${deliveryFee}`}
                    </div>
                    {deliveryFee > 0 && <div className="text-[10px] text-slate-400 font-mono">LBP {deliveryLBP.toLocaleString()}</div>}
                  </div>
                </div>

                {/* active Coupon */}
                {discountUSD > 0 && (
                  <div className="flex justify-between items-center text-xs text-green-600 pt-3 border-t border-dashed border-gray-100 dark:border-slate-801">
                    <span className="font-sans flex items-center gap-1 font-bold">
                      <Check className="w-4 h-4" /> Coupon
                    </span>
                    <div className="text-right">
                      <div className="font-extrabold">-${discountUSD}</div>
                      <div className="text-[10px]/none mt-0.5">LBP -{discountLBP.toLocaleString()}</div>
                    </div>
                  </div>
                )}

                {/* Invoice grand total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-slate-800">
                  <span className="font-sans font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    {t("totalInvoice")}
                  </span>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-extrabold text-red-600 dark:text-red-400">
                      ${totalUSD.toLocaleString()}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">
                      LBP {totalLBP.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon code voucher formulation */}
              {cartItems.length > 0 && (
                <div className="mb-6">
                  <label className="text-3s text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider block mb-1.5 font-mono">{t("couponCode")}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. LEBANON2026"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3.5 py-1.5 text-xs transition-colors border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/40 rounded-xl text-3s font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-3s text-red-500 font-sans mt-1.5">{couponError}</p>}
                  {couponSuccess && <p className="text-3s text-green-600 font-sans mt-1.5">{couponSuccess}</p>}
                </div>
              )}

              {/* Delivery Address & Contacts checkout trigger */}
              {cartItems.length > 0 && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {/* Client name / address box */}
                  <div>
                    <label className="text-3s text-slate-700 dark:text-slate-200 font-bold block mb-1 font-sans">{t("address")}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Beirut, Hamra Street, Al-Anwar Building, 4th Floor"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Phone contacts */}
                  <div>
                    <label className="text-3s text-slate-700 dark:text-slate-200 font-bold block mb-1 font-sans">{t("phone")}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +961 71 234 567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>

                  <div className="p-3 bg-red-500/10 text-red-600/90 border border-red-500/15 rounded-xl text-3s font-sans flex items-start gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{t("paymentNote")}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-sans text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{t("checkout")}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Exit statement */}
            <div className="pt-6 border-t border-gray-150 dark:border-slate-800/80 mt-6 text-center">
              <button
                onClick={onClose}
                className="text-3s font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest font-sans cursor-pointer"
              >
                {t("cartExit")}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
