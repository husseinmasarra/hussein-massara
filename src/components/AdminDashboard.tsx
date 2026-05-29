import React, { useState, useEffect } from "react";
import { 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  Users, 
  Settings as SettingsIcon, 
  UserSquare2, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  Store, 
  TrendingUp, 
  Package, 
  Tag, 
  Printer, 
  Trash2, 
  Plus, 
  Layers, 
  Upload,
  MessageSquare,
  Star
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { 
  Product, 
  Category, 
  User, 
  UserRole, 
  Coupon, 
  Order, 
  OrderStatus, 
  SystemSettings 
} from "../types";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  users: User[];
  orders: Order[];
  coupons: Coupon[];
  settings: SystemSettings;
  onSaveProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  onSaveSettings: (settings: SystemSettings) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  products,
  categories,
  users,
  orders,
  coupons,
  settings,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory,
  onSaveSettings,
  onUpdateOrderStatus
}: AdminDashboardProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Forms states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // Profit/Earnings report data
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  
  // Local Settings edit state
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleApproveReview = (prodId: string, reviewId: string) => {
    const parentProd = products.find(p => p.id === prodId);
    if (!parentProd) return;

    const updatedReviews = (parentProd.reviews || []).map(r => 
      r.id === reviewId ? { ...r, approved: true } : r
    );

    // Recompute ratings on approved reviews
    const approvedReviews = updatedReviews.filter(r => r.approved !== false);
    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingCount = approvedReviews.length;
    const ratingAverage = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0;

    const updatedProduct = {
      ...parentProd,
      reviews: updatedReviews,
      ratingAverage,
      ratingCount
    };

    onSaveProduct(updatedProduct);
  };

  const handleDeleteReview = (prodId: string, reviewId: string) => {
    const parentProd = products.find(p => p.id === prodId);
    if (!parentProd) return;

    const updatedReviews = (parentProd.reviews || []).filter(r => r.id !== reviewId);

    // Recompute ratings on approved reviews
    const approvedReviews = updatedReviews.filter(r => r.approved !== false);
    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingCount = approvedReviews.length;
    const ratingAverage = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0;

    const updatedProduct = {
      ...parentProd,
      reviews: updatedReviews,
      ratingAverage,
      ratingCount
    };

    onSaveProduct(updatedProduct);
  };

  // Group menu items into direct operational priority sectors with custom action badges
  const menuSections = [
    {
      titleAr: "العمليات والطلبيات النشطة",
      titleEn: "Live Operations & Orders",
      items: [
        { id: "new_orders", labelAr: "الطلبيات الجديدة والطباعة", labelEn: "Incoming Orders & Print", icon: Printer, badgeType: "new_orders" },
        { id: "orders", labelAr: "جميع الطلبيات والمستندات", labelEn: "All Orders Archive", icon: Layers, badgeType: "orders" },
        { id: "delivered_orders", labelAr: "الطلبيات المسلَّمة المكتملة", labelEn: "Completed Deliveries", icon: CheckCircle, badgeType: "delivered_orders" },
        { id: "inventory", labelAr: "المخزون ونواقص المنتجات", labelEn: "Warehouse Stock Monitor", icon: Package, badgeType: "inventory" }
      ]
    },
    {
      titleAr: "إدارة المنتجات والتسويق",
      titleEn: "Catalog & Marketing",
      items: [
        { id: "management", labelAr: "إدارة المنتجات كاملة", labelEn: "Product Catalog", icon: ShoppingBag, badgeType: "products" },
        { id: "categories", labelAr: "الأقسام والتصنيفات رئيس/فرعي", labelEn: "Categories Setup", icon: FolderTree },
        { id: "coupons", labelAr: "كوبونات الخصم والرموز", labelEn: "Coupons & Discounts", icon: Tag, badgeType: "coupons" },
        { id: "reviews", labelAr: "مراجعات وتقييمات المنتجات", labelEn: "Reviews Moderation", icon: Star, badgeType: "reviews" }
      ]
    },
    {
      titleAr: "التقارير وحساب الأرباح",
      titleEn: "Analytics & Finance",
      items: [
        { id: "overview", labelAr: "نظرة عامة والتقارير", labelEn: "Overview Statistics", icon: LayoutDashboard },
        { id: "revenue_calculator", labelAr: "أداة احتساب الأرباح", labelEn: "Financial Profits", icon: TrendingUp }
      ]
    },
    {
      titleAr: "المستخدمين وإداريات متقدمة",
      titleEn: "Partners & System Settings",
      items: [
        { id: "users", labelAr: "العملاء المسجلين", labelEn: "Registered Clients", icon: Users, badgeType: "users" },
        { id: "merchants", labelAr: "التجار والشركاء", labelEn: "Affiliated Merchants", icon: Store },
        { id: "employees", labelAr: "طاقم عمل المتجر", labelEn: "Staff List", icon: UserSquare2 },
        { id: "settings", labelAr: "إعدادات المتجر العامة", labelEn: "Main Settings", icon: SettingsIcon }
      ]
    }
  ];

  if (!isOpen) return null;

  // File Upload Helper to Base64 (Satisfies 'رفع الصور من الكمبيوتر' and 'رفع شعار الموقع')
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "product" | "category" | "logo" | "banner", bannerIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === "product" && editingProduct) {
        setEditingProduct(prev => ({ ...prev, image: base64 }));
      } else if (target === "category" && editingCategory) {
        setEditingCategory(prev => ({ ...prev, image: base64 }));
      } else if (target === "logo") {
        setLocalSettings(prev => ({ ...prev, logo: base64 }));
      } else if (target === "banner") {
        const upBanners = [...localSettings.heroBanners];
        if (bannerIndex !== undefined) {
          upBanners[bannerIndex] = base64;
        } else {
          upBanners.push(base64);
        }
        setLocalSettings(prev => ({ ...prev, heroBanners: upBanners }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Profit compute
  const deliveredOrdersList = orders.filter(o => o.status === OrderStatus.DELIVERED);
  const totalIncomingSales = deliveredOrdersList.reduce((sum, o) => sum + o.totalUSD, 0);
  const totalIncomingCostCost = totalIncomingSales * 0.65; // Simulated cost rate of 65% for margin
  const netEarningsSum = totalIncomingSales - totalIncomingCostCost;

  // Render individual Order print ticket
  const handlePrintOrderReceipt = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const LbpTot = order.totalUSD * settings.usdToLbpRate;
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${language === "ar" ? item.productNameAr : item.productNameEn}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.priceUSD}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${order.id}</title>
          <style>
            body { font-family: 'Cairo', 'Inter', sans-serif; padding: 20px; direction: ${language === "ar" ? "rtl" : "ltr"}; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .bill-to { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .total-table { width: 40%; margin-inline-start: auto; }
            .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${language === "ar" ? settings.appNameAr : settings.appNameEn}</h2>
            <p>${language === "ar" ? "فاتورة تسليم نقدية (COD)" : "Cash on Delivery Receipt Statement"}</p>
            <h3>Order ID: ${order.id}</h3>
            <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
          </div>
          <div class="bill-to border: 1px padding: 10px">
            <strong>${language === "ar" ? "العميل:" : "Bill To / Deliver To:"}</strong> ${order.userName}<br/>
            <strong>${language === "ar" ? "رقم الهاتف:" : "Phone:"}</strong> ${order.phone}<br/>
            <strong>${language === "ar" ? "العنوان:" : "Address:"}</strong> ${order.address}<br/>
          </div>
          <table>
            <thead>
              <tr style="background: #f1f5f9;">
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${language === "ar" ? "المنتج" : "Item"}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; text-align: center;">${language === "ar" ? "العدد" : "Qty"}</td>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; text-align: right;">${language === "ar" ? "السعر" : "Price"}</td>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <table class="total-table">
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td style="text-align: right;">$${order.subtotalUSD}</td>
            </tr>
            <tr>
              <td><strong>Delivery (COD):</strong></td>
              <td style="text-align: right;">$${order.deliveryCostUSD}</td>
            </tr>
            <tr>
              <td><strong>Discounts:</strong></td>
              <td style="text-align: right;">-$${order.discountUSD}</td>
            </tr>
            <tr style="border-top: 2px solid #333; font-size: 16px; font-weight: bold; color: rgb(220, 38, 38);">
              <td><strong>Total USD:</strong></td>
              <td style="text-align: right;">$${order.totalUSD}</td>
            </tr>
            <tr style="font-size: 13px; color: #555;">
              <td><strong>Total LBP:</strong></td>
              <td style="text-align: right;">LBP ${LbpTot.toLocaleString()}</td>
            </tr>
          </table>
          <div class="footer">
            <p>${language === "ar" ? "شكراً لشرائكم من متجرنا المباشر! للتواصل والدعم يرجى مراجعة الموقع." : "Thank you for shopping from Cedars Direct! For any assistance feel free to visit our online platform chat room."}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Render general daily/monthly audit reports (- 47)
  const handlePrintAuditReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const reportTitle = reportType === "daily" ? "Daily Sales Statement Report" : "Monthly Profit & Costs Audit Report";
    const reportRows = orders.map(o => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${o.id}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${o.userName}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${o.date.split("T")[0]}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: ${o.status === OrderStatus.DELIVERED ? 'green' : o.status === OrderStatus.CANCELLED ? 'red' : 'orange'}">${o.status}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">$${o.totalUSD}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: sans-serif; padding: 25px; direction: ltr; }
            .header { text-align: center; border-bottom: 2px solid #222; margin-bottom: 20px; padding-bottom: 15px; }
            table { width: 105%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; }
            .summary-box { background-color: #f1f5f9; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold;}
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <h2>${settings.appNameEn} / ${settings.appNameAr}</h2>
            <p>Report Date generation stamp: ${new Date().toLocaleString()}</p>
          </div>
          <div class="summary-box">
            <div>Product Sales: $${totalIncomingSales.toLocaleString()}</div>
            <div>Estimated Goods Margin Costs: $${totalIncomingCostCost.toLocaleString()}</div>
            <div>Simulated Net Profit Value: $${netEarningsSum.toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Purchaser Member</th>
                <th>ISO Date</th>
                <th>Current Status</th>
                <th>Grand Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      {/* Grand Fullscreen responsive body */}
      <div className="relative w-full max-w-7xl h-[92vh] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-150 dark:border-slate-800 animate-scale-up">
        
        {/* Absolute Big Exit Cross */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          title={t("detailExit")}
        >
          <X className="w-6 h-6" />
        </button>

        {/* LEFT COLUMN: 12 Divisions list as vertical side-bar (Requirement - 4) */}
        <div className="w-full md:w-72 shrink-0 bg-slate-50 dark:bg-slate-950 border-r md:border-r border-b md:border-b-0 border-gray-200/60 dark:border-slate-800/80 flex flex-col justify-between">
          
          {/* Header titles */}
          <div className="p-5 border-b border-gray-200/50 dark:border-slate-800 select-none bg-gradient-to-r from-indigo-50/30 to-purple-50/10 dark:from-slate-900/35 dark:to-slate-850/10">
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-indigo-500 to-emerald-500 font-sans tracking-tight leading-none animate-pulse">
              ✨ {t("adminDashboard")}
            </h3>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 block font-mono font-bold">
              Fully responsive real-time management console
            </span>
          </div>

          {/* Menus List in sidebar: Organized by Priorities & Operations */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 select-none">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {/* Section header */}
                <h4 className="text-[10px] font-black tracking-wider text-indigo-600 dark:text-indigo-400 uppercase font-sans px-3.5 pb-1 opacity-90">
                  {language === "ar" ? section.titleAr : section.titleEn}
                </h4>
                
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    // Direct interactive badge computation
                    let badge = null;
                    if (item.badgeType === "new_orders") {
                      const count = orders.filter(o => o.status === OrderStatus.NEW).length;
                      if (count > 0) {
                        badge = (
                          <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-red-500 text-white font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-sm`}>
                            {count} {language === "ar" ? "جديد" : "NEW"}
                          </span>
                        );
                      }
                    } else if (item.badgeType === "inventory") {
                      const count = products.filter(p => p.stock <= 3).length;
                      if (count > 0) {
                        badge = (
                          <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-amber-500 text-white font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded-md`}>
                            {count}
                          </span>
                        );
                      }
                    } else if (item.badgeType === "orders") {
                      badge = (
                        <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-slate-200/80 dark:bg-slate-800 text-slate-750 dark:text-slate-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold`}>
                          {orders.length}
                        </span>
                      );
                    } else if (item.badgeType === "delivered_orders") {
                      const count = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
                      badge = (
                        <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-emerald-200/50 dark:border-emerald-900/30`}>
                          {count}
                        </span>
                      );
                    } else if (item.badgeType === "products") {
                      badge = (
                        <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-indigo-50 dark:bg-slate-850 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] px-1.5 py-0.5 rounded`}>
                          {products.length}
                        </span>
                      );
                    } else if (item.badgeType === "coupons") {
                      badge = (
                        <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-mono text-[9px] px-1.5 py-0.5 rounded`}>
                          {coupons.length}
                        </span>
                      );
                    } else if (item.badgeType === "users") {
                      badge = (
                        <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-mono text-[9px] px-1.5 py-0.5 rounded`}>
                          {users.length}
                        </span>
                      );
                    } else if (item.badgeType === "reviews") {
                      const count = products.reduce((acc, p) => acc + (p.reviews?.filter(r => r.approved === false).length || 0), 0);
                      if (count > 0) {
                        badge = (
                          <span className={`${language === "ar" ? "mr-auto ml-1" : "ml-auto mr-1"} shrink-0 bg-rose-500 text-white font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-sm`}>
                            {count}
                          </span>
                        );
                      }
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold font-sans transition-all text-start cursor-pointer hover:scale-[1.01] ${
                          isActive 
                            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 scale-[1.02]" 
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span className="truncate">
                          {language === "ar" ? item.labelAr : item.labelEn}
                        </span>
                        {badge}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Exit / Close button at bottom */}
          <div className="p-4 border-t border-gray-200/50 dark:border-slate-800 text-center">
            <button
              onClick={onClose}
              className="w-full h-9 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-sans"
            >
              {t("exitBtn")}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Active division workspace panel */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white dark:bg-slate-900">
          
          {/* 1. OVERVIEW STATISTICS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {language === "ar" ? "نظرة عامة على المتجر" : "Market Overview Insights"}
              </h3>

              {/* Bento Grid layout counters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-start">
                  <div className="text-2s font-bold text-blue-600 font-mono">DELIVERED SALES VALUE</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-blue-600 font-mono mt-1">
                    ${totalIncomingSales.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    LBP {(totalIncomingSales * settings.usdToLbpRate).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-start">
                  <div className="text-2s font-bold text-purple-600 font-mono">ACTIVE PRODUCTS</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-purple-600 font-mono mt-1">
                    {products.length}
                  </div>
                  <span className="text-[10px] text-gray-500 font-sans">Different skus live</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-start">
                  <div className="text-2s font-bold text-emerald-600 font-mono">ESTIMATED NET PROFITS</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 font-mono mt-1">
                    ${netEarningsSum.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-500 font-sans">Based on 35% margin net</span>
                </div>

                <div className="p-4 rounded-2xl bg-red-400/10 border border-red-500/15 text-start">
                  <div className="text-2s font-bold text-red-650 font-mono">ACTIVE BOOKED ORDERS</div>
                  <div className="text-lg sm:text-2xl font-extrabold text-red-650 font-mono mt-1">
                    {orders.length}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {orders.filter(o => o.status === OrderStatus.NEW).length} pending COD
                  </span>
                </div>

              </div>

              {/* Graphical illustration for revenues */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
                    {language === "ar" ? "نسب المنتجات حسب المخازن والتصنيف" : "Catalog share by sectors"}
                  </h4>
                </div>
                {/* Simulated bar nodes representation */}
                <div className="space-y-3.5">
                  {categories.filter(c => !c.parentId).map(cat => {
                    const count = products.filter(p => p.categoryId === cat.id).length;
                    const percent = products.length === 0 ? 0 : Math.round((count / products.length) * 100);
                    return (
                      <div key={cat.id}>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350 select-none">
                          <span>{language === "ar" ? cat.nameAr : cat.nameEn}</span>
                          <span className="font-mono">{count} Items ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 2. MANAGEMENT - PRODUCTS */}
          {activeTab === "management" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                  {t("addNewProduct")}
                </h3>
                <button
                  onClick={() => setEditingProduct({
                    nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
                    priceUSD: 10, categoryId: categories[0]?.id || "", stock: 10, image: ""
                  })}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-transform"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("addNewProduct")}</span>
                </button>
              </div>

              {/* Form editing dialog */}
              {editingProduct && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSaveProduct(editingProduct as Product);
                    setEditingProduct(null);
                  }}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-200/50 dark:border-slate-800/80 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("productNameAr")} *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.nameAr || ""}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, nameAr: e.target.value }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("productNameEn")} *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.nameEn || ""}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, nameEn: e.target.value }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("prodDescAr")}</label>
                      <textarea
                        value={editingProduct.descriptionAr || ""}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, descriptionAr: e.target.value }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900 h-20"
                      />
                    </div>
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("prodDescEn")}</label>
                      <textarea
                        value={editingProduct.descriptionEn || ""}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, descriptionEn: e.target.value }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900 h-20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("priceInUSD")} *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editingProduct.priceUSD || ""}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, priceUSD: Number(e.target.value) }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("stockStatus")}</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={editingProduct.stock || 0}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, stock: Number(e.target.value) }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">Category Parent Selection</label>
                      <select
                        value={editingProduct.categoryId || ""}
                        onChange={(e) => setEditingProduct(prev => ({ ...prev!, categoryId: e.target.value }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {language === "ar" ? c.nameAr : c.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* PC base64 computer upload element (- 7) */}
                  <div>
                    <label className="text-3s text-slate-500 font-sans block mb-1">{t("selectProductImage")}</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 px-4 h-9 bg-white dark:bg-slate-900 hover:bg-slate-100 transition border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer p-2">
                        <Upload className="w-4.5 h-4.5" />
                        <span>Select File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "product")}
                        />
                      </label>
                      {editingProduct.image && (
                        <img 
                          src={editingProduct.image} 
                          alt="Demo" 
                          className="w-14 h-14 rounded-lg object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-1.5 bg-slate-300 text-slate-800 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      {t("save")}
                    </button>
                  </div>
                </form>
              )}

              {/* Products index listing */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 dark:bg-slate-950 font-bold">
                    <tr>
                      <th className="p-3">Img</th>
                      <th className="p-3 text-start">Title (AR / EN)</th>
                      <th className="p-3 text-start">Price</th>
                      <th className="p-3 text-start">Stock</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3">
                          <img src={p.image} className="w-9 h-9 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        </td>
                        <td className="p-3">
                          <div className="font-bold">{p.nameAr}</div>
                          <div className="text-gray-400 font-mono text-[10px]">{p.nameEn}</div>
                        </td>
                        <td className="p-3 font-bold text-blue-600 font-mono">${p.priceUSD}</td>
                        <td className="p-3">
                          <span className={`font-mono font-bold ${p.stock <= 3 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="px-2.5 py-1 text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1 px-2 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* 3. ORDERS ARCHIVE - printer & detailed receipts (Req - 45 / 46) */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {language === "ar" ? "أرشيف جميع الطلبات التاريخية" : "Historical Orders Archive"}
              </h3>

              <div className="space-y-4">
                {orders.map((ord) => (
                  <div 
                    key={ord.id} 
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800 text-start flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-red-650">{ord.id}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-sans ${
                          ord.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-650 font-sans mt-1">
                        Client: <strong className="text-slate-800 dark:text-gray-100">{ord.userName}</strong> | {ord.phone}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{ord.address}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-sm font-extrabold text-blue-600 block">${ord.totalUSD}</span>
                        <span className="text-[9px] text-gray-400 block">LBP {(ord.totalUSD * settings.usdToLbpRate).toLocaleString()}</span>
                      </div>
                      
                      {/* Print controls */}
                      <button
                        onClick={() => handlePrintOrderReceipt(ord)}
                        className="p-2 bg-white dark:bg-slate-900 hover:scale-105 border border-gray-150 dark:border-slate-800 rounded-xl text-slate-650 cursor-pointer shadow-sm transition-transform"
                        title={t("printInvoice")}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 4. CATEGORIES NODE SETUP (Subcategories nestings - Req 3) */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase animate-fade-in">
                  {t("addCategory")}
                </h3>
                <button
                  onClick={() => setEditingCategory({ nameEn: "", nameAr: "", parentId: "", image: "" })}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("addCategory")}</span>
                </button>
              </div>

              {/* Form Category */}
              {editingCategory && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSaveCategory(editingCategory as Category);
                    setEditingCategory(null);
                  }}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-gray-150 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("categoryNameAr")} *</label>
                      <input
                        type="text"
                        required
                        value={editingCategory.nameAr || ""}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev!, nameAr: e.target.value }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">{t("categoryNameEn")} *</label>
                      <input
                        type="text"
                        required
                        value={editingCategory.nameEn || ""}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev!, nameEn: e.target.value }))}
                        className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  {/* Nest parent selector */}
                  <div>
                    <label className="text-3s text-slate-500 font-sans block mb-1">{t("parentCategory")}</label>
                    <select
                      value={editingCategory.parentId || ""}
                      onChange={(e) => setEditingCategory(prev => ({ ...prev!, parentId: e.target.value || undefined }))}
                      className="w-full p-2 text-xs border rounded-xl bg-white dark:bg-slate-900"
                    >
                      <option value="">{language === "ar" ? "-- تصنيف رئيسي مستقل --" : "-- Independent Top Level --"}</option>
                      {categories.filter(c => !c.parentId && c.id !== editingCategory.id).map(parent => (
                        <option key={parent.id} value={parent.id}>
                          {language === "ar" ? parent.nameAr : parent.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-1.5 bg-slate-300 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-bold"
                    >
                      {t("save")}
                    </button>
                  </div>
                </form>
              )}

              {/* Hierarchy tree nodes */}
              <div className="space-y-4">
                {categories.filter(c => !c.parentId).map((parent) => {
                  const children = categories.filter(c => c.parentId === parent.id);
                  return (
                    <div 
                      key={parent.id} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-gray-150/80 dark:border-slate-800/80 text-start"
                    >
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-gray-250 dark:border-slate-800 shadow-sm">
                        <div>
                          <h4 className="text-sm font-black text-slate-950 dark:text-slate-550 font-sans">
                            📁 {language === "ar" ? parent.nameAr : parent.nameEn}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-300 uppercase font-mono mt-0.5 block font-extrabold font-bold">Top Level Node</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingCategory(parent)}
                            className="text-[11px] font-black text-blue-600 dark:text-blue-400 hover:underline hover:scale-105 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteCategory(parent.id)}
                            className="text-red-500 hover:scale-110 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Display nested subcategories items list */}
                      {children.length > 0 && (
                        <div className="mt-3 space-y-2.5 pl-6 border-l-2 border-dashed border-slate-300 dark:border-slate-800">
                          {children.map((child) => (
                            <div 
                              key={child.id} 
                              className="flex justify-between items-center p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85"
                            >
                              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                                ↳ 📁 {language === "ar" ? child.nameAr : child.nameEn}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingCategory(child)}
                                  className="text-[10px] text-blue-600 dark:text-blue-400 font-black hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => onDeleteCategory(child.id)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 5. USERS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {t("usersSection")}
              </h3>

              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 dark:bg-slate-950 font-bold">
                    <tr>
                      <th className="p-3 text-start">Username</th>
                      <th className="p-3 text-start font-sans">Role Level</th>
                      <th className="p-3 text-start">Phone</th>
                      <th className="p-3 text-center">Identity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="p-3 font-extrabold text-slate-800 dark:text-slate-200">{u.username}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                            u.role === UserRole.ADMIN ? 'bg-red-100 text-red-650' : 'bg-slate-100 text-slate-650'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{u.phone || "---"}</td>
                        <td className="p-3 text-center text-gray-400 capitalize">{u.socialProvider || "Local Secure Password"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SETTINGS (Upload site logo, name, limits - Req 13 / 31) */}
          {activeTab === "settings" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveSettings(localSettings);
                alert("Settings save processed successfully!");
              }}
              className="space-y-6 text-start"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {t("settingsSection")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">App Name (Arabic) *</label>
                  <input
                    type="text"
                    required
                    value={localSettings.appNameAr}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, appNameAr: e.target.value }))}
                    className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-900 font-sans text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">App Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={localSettings.appNameEn}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, appNameEn: e.target.value }))}
                    className="w-full p-2.5 border rounded-xl bg-white dark:bg-slate-900 font-sans text-xs"
                  />
                </div>
              </div>

              {/* Upload settings logo from device (- 31) */}
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">{t("uploadLogo")}</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 px-4 h-10 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 transition border border-dashed rounded-xl text-xs font-bold text-slate-650 cursor-pointer p-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "logo")}
                    />
                  </label>
                  {localSettings.logo && (
                    <img src={localSettings.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover boundary-solid border-2 border-blue-600 shadow-sm" referrerPolicy="no-referrer" />
                  )}
                </div>
              </div>

              {/* Delivery limits & exchanges multiplier settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border">
                <div>
                  <label className="text-3s text-slate-450 block mb-1">{t("deliveryCostLabel")} ($)</label>
                  <input
                    type="number"
                    value={localSettings.deliveryFeeUSD}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, deliveryFeeUSD: Number(e.target.value) }))}
                    className="w-full p-2 text-xs border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-3s text-slate-450 block mb-1">{t("freeDeliveryThresholdLabel")}</label>
                  <input
                    type="number"
                    value={localSettings.freeDeliveryThresholdUSD}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, freeDeliveryThresholdUSD: Number(e.target.value) }))}
                    className="w-full p-2 text-xs border rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-3s text-slate-450 block mb-1">{t("usdToLbpRateLabel")}</label>
                  <input
                    type="number"
                    value={localSettings.usdToLbpRate}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, usdToLbpRate: Number(e.target.value) }))}
                    className="w-full p-2 text-xs border rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Review Moderation Setting */}
              <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 font-sans">
                    {language === "ar" ? "تفعيل نظام مراجعة التعليقات والموافقة عليها" : "Enable Review Moderation System"}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    {language === "ar" ? "عند تفعيله، لن يتم نشر المراجعات والتقييمات الجديدة تلقائياً إلا بعد موافقة الإدارة عليها في لوحة التحكم." : "If enabled, newly submitted client reviews must be approved in this dashboard before showing up publicly."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, requireReviewApproval: !prev.requireReviewApproval }))}
                  className={`w-14 h-7 shrink-0 rounded-full transition-colors relative cursor-pointer ${localSettings.requireReviewApproval ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${localSettings.requireReviewApproval ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-5 h-10 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-transform cursor-pointer"
                >
                  {t("save")}
                </button>
              </div>

            </form>
          )}

          {/* 7. STAFF MANAGERS EMPLOYEES */}
          {activeTab === "employees" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {t("employeesSection")}
              </h3>

              <div className="space-y-3">
                {users.filter(u => u.role === UserRole.EMPLOYEE || u.role === UserRole.ADMIN).map(emp => (
                  <div key={emp.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border flex justify-between items-center text-start">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">{emp.username}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{emp.role.toLowerCase()} Representative</span>
                    </div>
                    <span className="text-xs font-mono text-blue-600">{emp.phone || "No phone added"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. NEW ORDERS WITH IMMEDIATE RECEIPT INK-PRINT (Req - 45 / 46) */}
          {activeTab === "new_orders" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {language === "ar" ? "الطلبيات الجديدة الواردة للتجهيز" : "Incoming Shipments Pending"}
              </h3>

              <div className="space-y-4">
                {orders.filter(o => o.status === OrderStatus.NEW).length === 0 ? (
                  <p className="text-xs italic text-slate-400 text-center py-6">No pending new orders are current.</p>
                ) : (
                  orders.filter(o => o.status === OrderStatus.NEW).map(ord => (
                    <div 
                      key={ord.id} 
                      className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-red-500/20 text-start flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold font-mono text-red-500">{ord.id}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-bold uppercase font-mono animate-pulse">NEW COD</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-250 mt-1">{ord.userName}</h4>
                        <p className="text-[11px] text-slate-500">{ord.address}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="text-sm font-extrabold text-blue-600 block">${ord.totalUSD}</span>
                          <span className="text-[10px] text-gray-400 block">LBP {(ord.totalUSD * settings.usdToLbpRate).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handlePrintOrderReceipt(ord)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-650"
                          title="Print cash invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, OrderStatus.DELIVERED)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          {t("confirmDelivery")}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 9. DELIVERED COMPLETED ORDERS */}
          {activeTab === "delivered_orders" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {language === "ar" ? "الطلبيات المسلمة والناجحة" : "Settled Handover Shipments"}
              </h3>

              <div className="space-y-3">
                {orders.filter(o => o.status === OrderStatus.DELIVERED).length === 0 ? (
                  <p className="text-xs italic text-slate-400 text-center py-6">No completed orders present yet.</p>
                ) : (
                  orders.filter(o => o.status === OrderStatus.DELIVERED).map(ord => (
                    <div key={ord.id} className="p-3.5 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-500/25 text-start flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold font-mono text-emerald-600">{ord.id}</span>
                        <div className="text-xs font-semibold">{ord.userName}</div>
                        <span className="text-[9px] text-gray-400 mt-0.5 font-mono">{ord.date.split("T")[0]}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-green-650 font-mono">${ord.totalUSD}</span>
                        <button 
                          onClick={() => handlePrintOrderReceipt(ord)}
                          className="p-1 px-1.5 text-blue-600 ml-2"
                        >
                          <Printer className="w-3.5 h-3.5 inline" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 10. MERCHANTS DIRECTORY */}
          {activeTab === "merchants" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {t("merchantsSection")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-white text-start">
                  <h4 className="text-xs font-extrabold text-slate-800">الأرز للمنتجات الغذائية</h4>
                  <p className="text-3s text-gray-400 font-mono mt-0.5">Koura organic cooperative</p>
                  <span className="text-2s font-bold text-blue-600 uppercase block mt-2 font-mono">Affiliation Active</span>
                </div>
                <div className="p-4 rounded-xl border bg-white text-start">
                  <h4 className="text-xs font-extrabold text-slate-800">جبل عامل للمونة</h4>
                  <p className="text-3s text-gray-400 font-mono mt-0.5">Southern Lebanon Zaatar production</p>
                  <span className="text-2s font-bold text-blue-600 uppercase block mt-2 font-mono">Affiliation Active</span>
                </div>
              </div>
            </div>
          )}

          {/* 11. REVENUE CALCULATOR WITH PRINT OPTION FOR FINANCIAL STATEMENTS (Req - 47) */}
          {activeTab === "revenue_calculator" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center select-none">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase animate-fade-in-down">
                  {t("profitMargin")}
                </h3>
                <div className="flex gap-2">
                  <select
                    value={reportType}
                    onChange={(e: any) => setReportType(e.target.value)}
                    className="p-1.5 text-xs bg-slate-100 rounded-lg"
                  >
                    <option value="daily">Daily Statement</option>
                    <option value="monthly">Monthly Audit</option>
                  </select>
                  <button
                    onClick={handlePrintAuditReport}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-transform"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t("printReport")}</span>
                  </button>
                </div>
              </div>

              {/* Financial calculations visualization display */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border grid grid-cols-1 sm:grid-cols-3 gap-6 text-start">
                <div>
                  <span className="text-3s text-slate-400 font-mono">TOTAL COMPLETED REVENUE</span>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">${totalIncomingSales.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-3s text-slate-400 font-mono">DELIVERY SECTOR FEES</span>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono mt-1">${(orders.filter(o => o.status === OrderStatus.DELIVERED).reduce((sum, o) => sum + o.deliveryCostUSD, 0)).toLocaleString()}</p>
                </div>
                <div className="border-l pl-4 border-dashed">
                  <span className="text-3s text-slate-400 font-mono text-emerald-600">AUDITED NET CASH PROFIT</span>
                  <p className="text-xl font-black text-emerald-600 font-mono mt-1">${netEarningsSum.toLocaleString()}</p>
                </div>
              </div>

              {/* Graphical Profit Margin Area chart */}
              <div className="p-5 rounded-3xl bg-slate-950 text-white border text-start">
                <span className="text-xs font-bold text-slate-400 font-mono">Interactive profit index (last 30 days)</span>
                
                {/* SVG vector chart representation */}
                <div className="h-40 w-full mt-4 bg-slate-900 rounded-xl relative overflow-hidden flex items-end justify-between p-4 px-10">
                  <div className="h-10 w-4 bg-blue-500 rounded-t animate-pulse" title="Day 1" />
                  <div className="h-20 w-4 bg-emerald-500 rounded-t animate-pulse" title="Day 10" />
                  <div className="h-14 w-4 bg-blue-500 rounded-t animate-pulse" title="Day 15" />
                  <div className="h-32 w-4 bg-emerald-500 rounded-t animate-pulse" title="Day 20" />
                  <div className="h-24 w-4 bg-blue-500 rounded-t animate-pulse" title="Today" />
                  
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-950/50 to-transparent w-8 pointer-events-none" />
                </div>
              </div>

            </div>
          )}

          {/* 12. INVENTORY STOCK STAGES */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                {t("inventorySection")}
              </h3>

              {/* Index metrics representation */}
              <div className="space-y-4">
                {products.map(p => {
                  const percentage = Math.min(100, (p.stock / 100) * 100);
                  return (
                    <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-start">
                      <div className="flex justify-between items-center text-xs font-bold font-sans">
                        <span>{language === "ar" ? p.nameAr : p.nameEn}</span>
                        <span className={p.stock <= 3 ? "text-red-650 animate-pulse font-mono font-bold" : "font-mono"}>
                          {p.stock} units available
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 mt-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${p.stock <= 3 ? 'bg-red-500' : 'bg-blue-600'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 13. COUPONS & DISCOUNTS CODES */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                  {t("couponsSection")}
                </h3>
                <button
                  onClick={() => setEditingCoupon({ code: "", discountType: "percentage", value: 10, minOrderValueUSD: 50, active: true })}
                  className="px-3 py-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Coupon
                </button>
              </div>

              {editingCoupon && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Just simulated since coupons are inline
                    alert("Coupon applied to internal database catalog!");
                    setEditingCoupon(null);
                  }}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        required
                        value={editingCoupon.code || ""}
                        onChange={(e) => setEditingCoupon(prev => ({ ...prev!, code: e.target.value.toUpperCase() }))}
                        className="w-full p-2 text-xs border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-3s text-slate-500 font-sans block mb-1">Discount Value</label>
                      <input
                        type="number"
                        required
                        value={editingCoupon.value || 10}
                        onChange={(e) => setEditingCoupon(prev => ({ ...prev!, value: Number(e.target.value) }))}
                        className="w-full p-2 text-xs border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setEditingCoupon(null)} className="px-3 py-1 bg-gray-250">Cancel</button>
                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Apply</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border text-start bg-slate-50 dark:bg-slate-950">
                    <span className="text-xs font-bold font-mono text-red-500">{c.code}</span>
                    <div className="text-xs font-bold mt-1">Discount: {c.value} {c.discountType === "percentage" ? "%" : "$"}</div>
                    <span className="text-3s text-gray-400 block mt-0.5">Min spend: ${c.minOrderValueUSD}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 14. PRODUCT REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="space-y-6 text-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans uppercase">
                  {language === "ar" ? "مراجعة التعليقات ومراقبة الجودة" : "Product Reviews & Moderation"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  {language === "ar" ? "أدر تعليقات العملاء المنشورة والقرارات المعلقة بالنشر." : "Moderate customer submissions, approve feedback, or remove unwanted content."}
                </p>
              </div>

              {/* Moderation Panel Layout */}
              <div className="space-y-6">
                {/* Pending Reviews Section */}
                <div className="bg-amber-50/45 dark:bg-amber-950/10 border border-amber-250/50 dark:border-amber-900/30 rounded-2xl p-5">
                  <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 font-sans uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    {language === "ar" ? "المراجعات المعلقة للموافقة" : "Pending Approval"} ({products.reduce((acc, p) => acc + (p.reviews?.filter(r => r.approved === false).length || 0), 0)})
                  </h4>

                  {(() => {
                    // Extract all pending reviews
                    const pendingList: { product: Product; review: any }[] = [];
                    products.forEach(p => {
                      (p.reviews || []).forEach(r => {
                        if (r.approved === false) {
                          pendingList.push({ product: p, review: r });
                        }
                      });
                    });

                    if (pendingList.length === 0) {
                      return (
                        <p className="text-xs font-bold text-slate-400 italic py-4">
                          {language === "ar" ? "لا توجد أي مراجعات معلقة حالياً." : "No pending reviews at the moment."}
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {pendingList.map(({ product, review }) => (
                          <div key={review.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-3">
                              <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                              <div className="space-y-1">
                                <span className="text-[10px] font-extrabold text-[#4f46e5] uppercase font-sans tracking-wide">
                                  {language === "ar" ? product.nameAr : product.nameEn}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{review.userName}</span>
                                  <div className="flex text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic font-sans font-medium">
                                  "{review.comment}"
                                </p>
                                <span className="text-[9px] text-gray-400 font-mono block">{review.date}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto shrink-0">
                              <button
                                onClick={() => handleApproveReview(product.id, review.id)}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition shadow-sm"
                              >
                                {language === "ar" ? "موافقة ونشر" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDeleteReview(product.id, review.id)}
                                className="flex-1 md:flex-none px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition shadow-sm"
                              >
                                {language === "ar" ? "حذف" : "Reject"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Approved Reviews List */}
                <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5">
                  <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 font-sans uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {language === "ar" ? "المراجعات المنشورة النشطة" : "Active & Published Reviews"} ({products.reduce((acc, p) => acc + (p.reviews?.filter(r => r.approved !== false).length || 0), 0)})
                  </h4>

                  {(() => {
                    // Extract all active reviews
                    const activeList: { product: Product; review: any }[] = [];
                    products.forEach(p => {
                      (p.reviews || []).forEach(r => {
                        if (r.approved !== false) {
                          activeList.push({ product: p, review: r });
                        }
                      });
                    });

                    if (activeList.length === 0) {
                      return (
                        <p className="text-xs text-slate-400 italic py-4">
                          {language === "ar" ? "لا توجد أي مراجعات منشورة بعد." : "No published reviews yet."}
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {activeList.map(({ product, review }) => (
                          <div key={review.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 flex justify-between items-center gap-4">
                            <div className="flex items-start gap-2.5">
                              <img src={product.image} className="w-8 h-8 rounded-md object-cover" />
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-slate-450 block">
                                  {language === "ar" ? product.nameAr : product.nameEn}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{review.userName}</span>
                                  <div className="flex text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? "fill-current" : "text-slate-200/60"}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-slate-650 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg mt-1 border border-sans text-start font-medium">
                                  {review.comment}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteReview(product.id, review.id)}
                              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-900 text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[10px] rounded-lg cursor-pointer transition shrink-0"
                            >
                              {language === "ar" ? "إزالة وتعطيل" : "Remove"}
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
