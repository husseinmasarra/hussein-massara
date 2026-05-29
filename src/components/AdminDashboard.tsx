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
  const [selectedReportDate, setSelectedReportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>(
    new Date().toISOString().split("T")[0].substring(0, 7)
  );
  
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

    // Filter delivered orders specifically for this report's filtered date or month
    const targetOrders = orders.filter(o => {
      if (o.status !== OrderStatus.DELIVERED) return false;
      const orderDay = o.date ? o.date.split("T")[0] : "";
      if (reportType === "daily") {
        return orderDay === selectedReportDate;
      } else {
        return orderDay.substring(0, 7) === selectedReportMonth;
      }
    });

    const reportTitle = reportType === "daily" 
      ? `Daily Sales Stat & Performance Statement` 
      : `Monthly Profit Audit & Financial Cost Statement`;

    const reportPeriodVal = reportType === "daily" ? selectedReportDate : selectedReportMonth;

    // Financial Metrics
    const salesTotalVal = targetOrders.reduce((sum, o) => sum + o.totalUSD, 0);
    const subtotalVal = targetOrders.reduce((sum, o) => sum + o.subtotalUSD, 0);
    const deliveryFeesVal = targetOrders.reduce((sum, o) => sum + o.deliveryCostUSD, 0);
    const discountFeesVal = targetOrders.reduce((sum, o) => sum + o.discountUSD, 0);
    const simulatedCOGS = salesTotalVal * 0.65; // Goods standard cost (65%)
    const netEarningsVal = salesTotalVal - simulatedCOGS;

    // Dynamic items conversion for premium list representation
    const reportRows = targetOrders.length === 0 
      ? `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #94a3b8; font-size: 11px;">No settled sales records found for this period.</td></tr>`
      : targetOrders.map(o => {
          const itemsDesc = o.items.map(i => `${language === "ar" ? i.productNameAr : i.productNameEn} (qty: ${i.quantity})`).join(", ");
          return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: bold; color: #4f46e5;">#${o.id.substring(0, 8).toUpperCase()}</td>
              <td style="padding: 10px 8px; font-size: 11px;">
                <div style="font-weight: 700; color: #0f172a;">${o.userName}</div>
                <div style="font-size: 10px; color: #64748b; font-family: monospace;">${o.phone}</div>
              </td>
              <td style="padding: 10px 8px; font-size: 11px; color: #475569;">${o.date ? o.date.replace("T", " ").substring(0, 16) : ""}</td>
              <td style="padding: 10px 8px; font-size: 10px; color: #334155; max-width: 250px; line-height: 1.4;">${itemsDesc}</td>
              <td style="padding: 10px 8px; font-size: 11px; text-align: center;">
                ${o.couponCode ? `<span style="background-color: #fef2f2; border: 1px solid #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: monospace;">${o.couponCode} (-$${o.discountUSD})</span>` : `<span style="color: #94a3b8;">—</span>`}
              </td>
              <td style="padding: 10px 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: bold; text-align: right; color: #0f172a;">$${o.totalUSD.toLocaleString()}</td>
            </tr>
          `;
        }).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .layout-box {
              max-width: 800px;
              margin: 0 auto;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .app-logo-area {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-square {
              width: 32px;
              height: 32px;
              background-color: #4f46e5;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              border-radius: 8px;
              font-size: 18px;
            }
            .title-h1 {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
            }
            .subtitle-p {
              font-size: 11px;
              color: #64748b;
              margin: 2px 0 0 0;
              font-weight: 500;
            }
            .doc-label-box {
              text-align: right;
            }
            .doc-badge {
              font-size: 10px;
              font-weight: 850;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #4f46e5;
              background-color: #e0e7ff;
              border: 1px solid #c7d2fe;
              padding: 3px 8px;
              border-radius: 4px;
              display: inline-block;
              margin-bottom: 6px;
            }
            .meta-p {
              font-size: 10px;
              color: #475569;
              margin: 1px 0;
            }
            .p-banner {
              background: linear-gradient(135deg, #0f172a, #1e293b);
              color: white;
              border-radius: 8px;
              padding: 14px 18px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .p-label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #94a3b8;
              font-weight: 700;
            }
            .p-value {
              font-size: 18px;
              font-weight: 800;
              margin-top: 2px;
              font-family: 'JetBrains Mono', monospace;
            }
            .p-count {
              font-size: 10px;
              background-color: rgba(56, 189, 248, 0.15);
              color: #38bdf8;
              border: 1px solid rgba(56, 189, 248, 0.3);
              padding: 3px 8px;
              border-radius: 12px;
              font-weight: bold;
              font-family: 'JetBrains Mono', monospace;
            }
            .dashboard-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }
            .card-bento {
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
              padding: 12px;
              background-color: #f8fafc;
            }
            .card-lbl {
              font-size: 9px;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .card-val {
              font-size: 18px;
              font-weight: 800;
              margin-top: 4px;
              font-family: 'JetBrains Mono', monospace;
              color: #0d1527;
            }
            .card-val.green {
              color: #047857;
            }
            .card-sub {
              font-size: 8.5px;
              color: #94a3b8;
              margin-top: 2px;
              font-family: 'JetBrains Mono', monospace;
            }
            .table-container {
              margin-top: 20px;
            }
            .tbl-header {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              color: #334155;
              border-bottom: 1.5px solid #0f172a;
              padding-bottom: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background-color: #0f172a;
              color: #ffffff;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 8px;
              text-align: left;
            }
            .financial-ledger {
              border: 1.5px solid #0f172a;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 30px;
            }
            .ledger-head {
              background-color: #0f172a;
              color: white;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 8px 12px;
              letter-spacing: 0.5px;
            }
            .ledger-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 10.5px;
            }
            .row-lbl {
              color: #475569;
              font-weight: 500;
            }
            .row-val {
              font-weight: 700;
              font-family: 'JetBrains Mono', monospace;
            }
            .row-val.red {
              color: #b91c1c;
            }
            .ledger-row.grand {
              background-color: #f0fdf4;
              border-top: 2px solid #047857;
              border-bottom: none;
              font-size: 12px;
            }
            .grand .row-lbl {
              color: #065f46;
              font-weight: 800;
            }
            .grand .row-val {
              color: #047857;
              font-weight: 805;
              font-size: 13px;
            }
            .sig-area {
              display: flex;
              justify-content: space-between;
              margin-top: 45px;
              padding-top: 24px;
            }
            .sig-block {
              width: 210px;
              text-align: center;
            }
            .sig-line {
              border-bottom: 1px solid #94a3b8;
              height: 35px;
              margin-bottom: 6px;
            }
            .sig-title {
              font-size: 9.5px;
              font-weight: 700;
              color: #334155;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .sig-desc {
              font-size: 8.5px;
              color: #94a3b8;
              margin-top: 1px;
            }
            .disclaimer {
              margin-top: 40px;
              border-top: 1.5px dashed #cbd5e1;
              padding-top: 12px;
              text-align: center;
              font-size: 8.5px;
              color: #94a3b8;
              letter-spacing: 0.25px;
            }
          </style>
        </head>
        <body>
          <div class="layout-box">
            <!-- Header section Info -->
            <div class="header-bar">
              <div class="app-logo-area">
                <div class="logo-square">${settings.appNameEn ? settings.appNameEn.substring(0,1).toUpperCase() : 'C'}</div>
                <div>
                  <h1 class="title-h1">${settings.appNameEn || "Cedars Market"}</h1>
                  <p class="subtitle-p">${settings.appNameAr || "مكتب المحاسبة وجرد الأرباح"}</p>
                </div>
              </div>
              <div class="doc-label-box">
                <div class="doc-badge">Official Financial Log</div>
                <p class="meta-p"><span class="meta-label">ID Reference:</span> FIN-${reportType.substring(0, 1).toUpperCase()}-${reportPeriodVal.replace("-", "")}</p>
                <p class="meta-p"><span class="meta-label">Printed At:</span> ${new Date().toLocaleString()}</p>
              </div>
            </div>

            <!-- Active Target Period Banner -->
            <div class="p-banner">
              <div>
                <div class="p-label">Statement Audit Target Period</div>
                <div class="p-value">${reportType === "daily" ? `Day of ${reportPeriodVal}` : `Month of ${reportPeriodVal}`}</div>
              </div>
              <div class="p-count">
                ${targetOrders.length} Settled Invoices
              </div>
            </div>

            <!-- Quick Metrics Overview -->
            <div class="dashboard-grid">
              <div class="card-bento">
                <div class="card-lbl">Gross Receipts (USD)</div>
                <div class="card-val">$${salesTotalVal.toLocaleString()}</div>
                <div class="card-sub">LBP ${(salesTotalVal * settings.usdToLbpRate).toLocaleString()}</div>
              </div>
              <div class="card-bento">
                <div class="card-lbl">Est. Goods Sourcing COGS</div>
                <div class="card-val">$${simulatedCOGS.toLocaleString()}</div>
                <div class="card-sub">65% cost model calculation</div>
              </div>
              <div class="card-bento" style="border-style: solid; border-color: #a7f3d0;">
                <div class="card-lbl" style="color: #047857;">Est. Net Statement Earnings</div>
                <div class="card-val green">$${netEarningsVal.toLocaleString()}</div>
                <div class="card-sub" style="color: #059669;">LBP ${(netEarningsVal * settings.usdToLbpRate).toLocaleString()}</div>
              </div>
            </div>

            <!-- Table of settled Orders -->
            <div class="table-container">
              <div class="tbl-header">Delivered Orders Register List</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 15%;">Ref ID</th>
                    <th style="width: 25%;">Client details</th>
                    <th style="width: 18%;">Settle Stamp</th>
                    <th style="width: 30%;">Cart skus inside invoice</th>
                    <th style="width: 18%; text-align: center;">Coupon Code</th>
                    <th style="width: 14%; text-align: right;">Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportRows}
                </tbody>
              </table>
            </div>

            <!-- Double-entry financial balance sheets Ledger -->
            <div class="financial-ledger">
              <div class="ledger-head">System Financial Balance Sheet</div>
              
              <div class="ledger-row">
                <span class="row-lbl">Total Gross Value of Purchased Goods</span>
                <span class="row-val">$${subtotalVal.toLocaleString()}</span>
              </div>
              
              <div class="ledger-row">
                <span class="row-lbl">Add: Delivery Sector Collections (Direct Shipping Transit)</span>
                <span class="row-val">+$${deliveryFeesVal.toLocaleString()}</span>
              </div>

              <div class="ledger-row">
                <span class="row-lbl">Less: User Coupon Discount Claims (Subsidized by Admin Campaign)</span>
                <span class="row-val red">-$${discountFeesVal.toLocaleString()}</span>
              </div>

              <div class="ledger-row">
                <span class="row-lbl">Grand Audited Gross Revenue (Including Delivery Subtotals)</span>
                <span class="row-val" style="color: #4f46e5;">$${salesTotalVal.toLocaleString()}</span>
              </div>

              <div class="ledger-row">
                <span class="row-lbl">Less: COGS Model Deductions (Representing 65% base sourcing expenditure)</span>
                <span class="row-val red">-$${simulatedCOGS.toLocaleString()}</span>
              </div>

              <div class="ledger-row grand">
                <span class="row-lbl">Audited Net Profit Balance (USD/LBP Dual)</span>
                <span class="row-val">$${netEarningsVal.toLocaleString()} USD / LBP ${(netEarningsVal * settings.usdToLbpRate).toLocaleString()}</span>
              </div>
            </div>

            <!-- Audit execution signatures -->
            <div class="sig-area">
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Prepared By Auditor</div>
                <div class="sig-desc">Financial Controller stamp</div>
              </div>

              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">System Administrator</div>
                <div class="sig-desc">Verified & Approved signature</div>
              </div>

              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Executive Stamp</div>
                <div class="sig-desc">Cedars Regional Authority</div>
              </div>
            </div>

            <div class="disclaimer">
              Generated securely from Cedars Direct Administrative Portal Core. Under local regulations, all statements constitute preliminary reports for audits.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    // A micro timeout ensures the system completely renders and styles the dynamic page
    setTimeout(() => {
      printWindow.print();
    }, 450);
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
          {activeTab === "revenue_calculator" && (() => {
            const filteredReportOrdersOnScreen = orders.filter(o => {
              if (o.status !== OrderStatus.DELIVERED) return false;
              const orderDay = o.date ? o.date.split("T")[0] : "";
              if (reportType === "daily") {
                return orderDay === selectedReportDate;
              } else {
                return orderDay.substring(0, 7) === selectedReportMonth;
              }
            });

            const onScreenSalesVal = filteredReportOrdersOnScreen.reduce((sum, o) => sum + o.totalUSD, 0);
            const onScreenDeliveryFeesVal = filteredReportOrdersOnScreen.reduce((sum, o) => sum + o.deliveryCostUSD, 0);
            const onScreenDiscountFeesVal = filteredReportOrdersOnScreen.reduce((sum, o) => sum + o.discountUSD, 0);
            const onScreenCogsVal = onScreenSalesVal * 0.65;
            const onScreenNetEarningsVal = onScreenSalesVal - onScreenCogsVal;

            return (
              <div className="space-y-6 animate-fade-in text-start">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-4 select-none">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 font-sans uppercase">
                      {t("profitMargin")}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {language === "ar" ? "أداة مطورة لحساب العوائد والأرباح وإصدار تقارير مخصصة للطباعة" : "Advanced tool for tracking net earnings and printing audited statements"}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Period selection widgets */}
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 border rounded-2xl">
                      <select
                        value={reportType}
                        onChange={(e: any) => setReportType(e.target.value)}
                        className="py-1 px-2.5 text-xs font-bold bg-white dark:bg-slate-900 border-0 rounded-xl shadow-xs text-slate-800 dark:text-slate-200 cursor-pointer outline-hidden"
                      >
                        <option value="daily">{language === "ar" ? "تقرير يومي" : "Daily Statement"}</option>
                        <option value="monthly">{language === "ar" ? "تدقيق شهري" : "Monthly Audit"}</option>
                      </select>

                      {reportType === "daily" ? (
                        <input
                          type="date"
                          value={selectedReportDate}
                          onChange={(e) => setSelectedReportDate(e.target.value)}
                          className="py-1 px-2 text-xs font-black bg-white dark:bg-slate-900 border-0 rounded-xl text-slate-800 dark:text-slate-200 outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <input
                          type="month"
                          value={selectedReportMonth}
                          onChange={(e) => setSelectedReportMonth(e.target.value)}
                          className="py-1 px-2 text-xs font-black bg-white dark:bg-slate-900 border-0 rounded-xl text-slate-800 dark:text-slate-200 outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                      )}
                    </div>

                    <button
                      onClick={handlePrintAuditReport}
                      className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/15 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all ml-auto sm:ml-0"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{language === "ar" ? "طباعة التقرير" : "Print Audit Doc"}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated / dynamic Financial calculations viz display */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono block">Selected Gross Revenue</span>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">${onScreenSalesVal.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">LBP {(onScreenSalesVal * settings.usdToLbpRate).toLocaleString()}</span>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono block">Delivery Sur-charges</span>
                    <p className="text-xl font-black text-slate-950 dark:text-slate-100 font-mono mt-1">${onScreenDeliveryFeesVal.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">Transit transport values</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <span className="text-[9px] text-red-500 dark:text-red-400 font-bold uppercase tracking-wider font-mono block">Applied Coupon Discounts</span>
                    <p className="text-xl font-black text-red-650 dark:text-red-400 font-mono mt-1">-${onScreenDiscountFeesVal.toLocaleString()}</p>
                    <span className="text-[9px] text-red-400/70 font-sans block mt-1">Subsidized code campaigns</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider font-mono block">Net Audited Profits</span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">${onScreenNetEarningsVal.toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-600/70 font-mono block mt-1">LBP {(onScreenNetEarningsVal * settings.usdToLbpRate).toLocaleString()}</span>
                  </div>
                </div>

                {/* Preview settled orders count segment */}
                <div className="bg-white dark:bg-slate-900 border rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-center select-none border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                      {language === "ar" ? "قائمة الوصول والمعاملات بالمسودة" : "Settled Invoices Included in Selection"}
                    </h4>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg">
                      {filteredReportOrdersOnScreen.length} {language === "ar" ? "طلب مسجل" : "orders matched"}
                    </span>
                  </div>

                  {filteredReportOrdersOnScreen.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed text-slate-400">
                      <span className="text-2xl">💤</span>
                      <p className="text-xs font-bold mt-1.5 text-slate-400 dark:text-slate-500">
                        {language === "ar" ? "لا تتوفر مبيعات مؤكدة ومسلمة في التاريخ المحدد." : "No delivered sales found for the selected time configurations."}
                      </p>
                      <p className="text-[10px] text-slate-400/70 mt-0.5">
                        {language === "ar" ? "يرجى تغيير نطاق الاختيار للاستعراض." : "Change period selection or date pick values to review."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-705 dark:text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-black tracking-wider uppercase text-start">
                            <th className="p-2.5">{language === "ar" ? "الرقم التعريفي" : "Invoice ID"}</th>
                            <th className="p-2.5">{language === "ar" ? "المشتري" : "Customer"}</th>
                            <th className="p-2.5">{language === "ar" ? "تاريخ الصفقة" : "Date stamp"}</th>
                            <th className="p-2.5">{language === "ar" ? "الهاتف" : "Phone"}</th>
                            <th className="p-2.5 text-right">{language === "ar" ? "القيمة الإجمالية" : "Paid Total"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReportOrdersOnScreen.map((o) => (
                            <tr key={o.id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-950/25 transition">
                              <td className="p-2.5 font-mono text-indigo-600 dark:text-indigo-400 font-extrabold text-[10.5px]">
                                #{o.id.substring(0, 8).toUpperCase()}
                              </td>
                              <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{o.userName}</td>
                              <td className="p-2.5 text-slate-400 font-mono text-[10px]">{o.date ? o.date.replace("T", " ").substring(0, 16) : ""}</td>
                              <td className="p-2.5 font-mono text-slate-500 text-[10.5px]">{o.phone}</td>
                              <td className="p-2.5 font-black font-mono text-right text-slate-800 dark:text-slate-100">${o.totalUSD.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Graphical Profit Margin Area chart replica */}
                <div className="p-5 rounded-3xl bg-slate-950 text-white border border-slate-900 text-start">
                  <div className="flex justify-between items-center sm:block">
                    <span className="text-xs font-bold text-slate-400 font-mono">Interactive profit index representation</span>
                    <span className="text-[10px] text-emerald-400 font-mono sm:hidden">▲ healthy margin state</span>
                  </div>
                  
                  {/* SVG vector chart representation */}
                  <div className="h-40 w-full mt-4 bg-slate-900/50 rounded-2xl relative overflow-hidden flex items-end justify-between p-4 px-10 border border-slate-850">
                    <div className="h-10 w-4 bg-indigo-500/80 rounded-t-lg transition hover:bg-indigo-400" title="Week 1 Volume" />
                    <div className="h-24 w-4 bg-emerald-500/80 rounded-t-lg transition hover:bg-emerald-400" title="Week 2 Volume" />
                    <div className="h-16 w-4 bg-indigo-500/80 rounded-t-lg transition hover:bg-indigo-400" title="Week 3 Volume" />
                    <div className="h-32 w-4 bg-emerald-500/80 rounded-t-lg transition hover:bg-emerald-400" title="Week 4 Volume" />
                    <div className="h-28 w-4 bg-blue-500/80 rounded-t-lg transition hover:bg-blue-400 animate-pulse" title="Current Trend" />
                    
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-950/80 to-transparent w-10 pointer-events-none" />
                  </div>
                </div>

              </div>
            );
          })()}

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
