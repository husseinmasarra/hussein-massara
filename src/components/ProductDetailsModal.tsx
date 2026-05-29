import React, { useState } from "react";
import { X, Star, MessageSquare, Send, Calendar, CheckCircle, Package } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Product, User } from "../types";

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  usdToLbpRate: number;
  currentUser: User | null;
  onAddReview: (productId: string, rating: number, comment: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  usdToLbpRate,
  currentUser,
  onAddReview,
  onAddToCart
}: ProductDetailsModalProps) {
  const { language, t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const priceLBP = product.priceUSD * usdToLbpRate;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onAddReview(product.id, rating, comment);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Container Card */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 animate-scale-up my-8">
        
        {/* Absolute Big Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          title={t("detailExit")}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Main Realistic Product Image */}
          <div className="relative h-[320px] md:h-full min-h-[320px] bg-slate-100 dark:bg-slate-950">
            <img
              src={product.image}
              alt={language === "ar" ? product.nameAr : product.nameEn}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.stock <= 3 && product.stock > 0 && (
              <span className="absolute top-4 start-4 bg-red-600 text-white font-sans text-3s font-bold px-3 py-1 rounded-full uppercase shadow-md animate-pulse">
                {t("lowStockAlert")}
              </span>
            )}
          </div>

          {/* Details Content Side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[750px] overflow-y-auto">
            
            {/* Header Slogan & Title */}
            <div className="mb-6">
              <span className="text-4s font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase font-sans">
                {language === "ar" ? "تفاصيل تقنية ومونة فاخرة" : "TECHNICAL & LUXURY DETAILS"}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-sans mt-1">
                {language === "ar" ? product.nameAr : product.nameEn}
              </h3>

              {/* Rating indicators */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < Math.round(product.ratingAverage || 0) 
                          ? "fill-current" 
                          : "text-gray-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {product.ratingAverage || "0.0"} ({product.ratingCount})
                </span>
              </div>
            </div>

            {/* Description Text */}
            <div className="mb-6">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans font-medium leading-relaxed">
                {language === "ar" ? product.descriptionAr : product.descriptionEn}
              </p>
            </div>

            {/* Dual Currency Pricing & Add to Cart Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-slate-800 mb-6">
              <div>
                <div className="text-2s font-bold text-slate-700 dark:text-slate-200 uppercase font-mono">
                  {language === "ar" ? "السعر الإجمالي" : "OFFER PRICE"}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                    {t("currencyUSD")}{product.priceUSD.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-705 dark:text-slate-300 font-mono">
                    / LBP {priceLBP.toLocaleString()}
                  </span>
                </div>
              </div>

              {product.stock > 0 ? (
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-sans text-xs font-bold hover:bg-blue-700 hover:shadow-md transition-all cursor-pointer"
                >
                  {t("addToCart")}
                </button>
              ) : (
                <span className="text-red-500 font-sans font-bold text-xs flex items-center gap-1">
                  <Package className="w-4.5 h-4.5" />
                  {t("outOfStock")}
                </span>
              )}
            </div>

            {/* Customer Review Section */}
            <div className="border-t border-gray-200/50 dark:border-slate-800 pt-6">
              {(() => {
                const approvedReviews = (product.reviews || []).filter(rev => rev.approved !== false);
                return (
                  <>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans mb-4 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      {t("reviews")} ({approvedReviews.length})
                    </h4>

                    {/* Reviews List */}
                    <div className="space-y-3.5 max-h-40 overflow-y-auto mb-6 pr-2">
                      {approvedReviews.length > 0 ? (
                        approvedReviews.map((rev) => (
                          <div 
                            key={rev.id} 
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-sans">
                                {rev.userName}
                              </span>
                              <div className="flex text-amber-400">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star 
                                    key={idx} 
                                    className={`w-3 h-3 ${idx < rev.rating ? "fill-current" : "text-gray-200"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                              {rev.comment}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                              {rev.date}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-2s text-slate-400 italic font-sans py-2">
                          {language === "ar" ? "لا توجد تقييمات بعد. كن أول من يشارك رأيه!" : "No reviews yet. Be the first to share your experience!"}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Add Review Form */}
              {currentUser ? (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3s font-bold text-slate-600 dark:text-slate-300 font-sans">
                      {t("rating")}:
                    </span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setRating(stars)}
                          className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${stars <= rating ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t("reviewPlaceholder")}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1 px-4 py-2 text-xs transition-all border border-gray-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/20 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 text-3s text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/40 dark:border-amber-900/30 rounded-xl font-sans text-center">
                  {language === "ar" 
                    ? "يرجى تسجيل الدخول أولاً لتتمكن من كتابة رأيك وتقييم السلعة" 
                    : "Please sign in to rate and submit your review for this product."}
                </div>
              )}
            </div>

            {/* Extra manual exit link at the very bottom */}
            <div className="mt-6 text-center border-t border-gray-100 dark:border-slate-800/80 pt-4">
              <button
                onClick={onClose}
                className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-wider font-sans cursor-pointer"
              >
                {t("detailExit")}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
